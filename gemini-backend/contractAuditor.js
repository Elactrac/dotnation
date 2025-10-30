/**
 * @file Smart Contract Auditing Module for ink! Contracts
 * Analyzes Rust-based ink! smart contracts for security vulnerabilities,
 * gas optimization issues, and best practice violations.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

/**
 * Initialize Gemini model for contract auditing with precise parameters
 */
function initializeAuditModel(apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-pro',
    generationConfig: {
      temperature: 0.2, // Very low temperature for consistent security analysis
      topK: 10,
      topP: 0.7,
      maxOutputTokens: 4096,
    }
  });
}

/**
 * Common vulnerability patterns specific to ink! smart contracts
 */
const INK_VULNERABILITY_PATTERNS = {
  reentrancy: {
    patterns: [
      // Patterns that might indicate reentrancy vulnerabilities
      /self\.env\(\)\.transfer\([^)]+\)[^;]*\n[^}]*self\.\w+/gm,
      /self\.env\(\)\.call\([^)]+\)[^;]*\n[^}]*self\.\w+/gm,
    ],
    severity: 'critical',
    description: 'Potential reentrancy vulnerability: State changes after external calls',
    mitigation: 'Use the checks-effects-interactions pattern. Update state before making external calls or implement a reentrancy guard.'
  },
  
  integerOverflow: {
    patterns: [
      /(?<!\.\s*checked_)\+(?!=)/g, // Addition without checked_add
      /(?<!\.\s*checked_)\-(?!=)/g, // Subtraction without checked_sub
      /(?<!\.\s*checked_)\*(?!=)/g, // Multiplication without checked_mul
    ],
    exceptions: [
      /let\s+\w+\s*:\s*u32\s*=\s*\d+\s*[\+\-\*]/g, // Simple constant arithmetic
      /\+\s*1\b/g, // Simple increment by 1
      /\-\s*1\b/g, // Simple decrement by 1
    ],
    severity: 'high',
    description: 'Potential integer overflow/underflow: Arithmetic without checked operations',
    mitigation: 'Use checked_add(), checked_sub(), checked_mul() for all arithmetic on user-controlled values.'
  },
  
  accessControl: {
    patterns: [
      /#\[ink\(message\)\]\s*pub\s+fn\s+\w+\([^)]*&mut\s+self/gm,
    ],
    checks: [
      /if\s+.*!=\s*self\.admin/,
      /if\s+.*!=\s*self\.owner/,
      /assert!\(/,
      /require!\(/,
    ],
    severity: 'critical',
    description: 'Missing access control: Public mutable function without permission checks',
    mitigation: 'Add admin/owner checks for sensitive functions that modify state.'
  },
  
  uncheckedReturn: {
    patterns: [
      /self\.env\(\)\.transfer\([^)]+\);/g,
      /\.insert\([^)]+\);/g,
    ],
    severity: 'medium',
    description: 'Unchecked return value: Operation result not validated',
    mitigation: 'Always check the return value of operations that can fail using .is_ok(), .is_err(), or pattern matching.'
  },
  
  timestampDependence: {
    patterns: [
      /self\.env\(\)\.block_timestamp\(\)/g,
      /block_timestamp/g,
    ],
    severity: 'medium',
    description: 'Timestamp dependence: Contract logic depends on block timestamp',
    mitigation: 'Be aware that block timestamps can be slightly manipulated by validators. Avoid using them for critical randomness or exact timing.'
  },
  
  uninitializedStorage: {
    patterns: [
      /Mapping::default\(\)/g,
      /Vec::new\(\)/g,
    ],
    severity: 'low',
    description: 'Uninitialized storage detected',
    mitigation: 'Ensure all storage mappings and vectors are properly initialized before use.'
  },
  
  panicPaths: {
    patterns: [
      /\.unwrap\(\)/g,
      /\.expect\([^)]+\)/g,
      /panic!\(/g,
    ],
    severity: 'high',
    description: 'Panic-inducing code: Using unwrap() or panic! can cause unexpected contract failures',
    mitigation: 'Use proper error handling with Result types and return errors instead of panicking.'
  },
  
  unsafeCode: {
    patterns: [
      /unsafe\s*\{/g,
    ],
    severity: 'critical',
    description: 'Unsafe code block detected',
    mitigation: 'Avoid unsafe code in smart contracts unless absolutely necessary. Thoroughly audit all unsafe blocks.'
  },
  
  gasOptimization: {
    patterns: [
      /\.clone\(\)/g,
      /Vec<[^>]+>::new\(\)/g,
    ],
    severity: 'low',
    description: 'Potential gas optimization issue: Unnecessary cloning or allocations',
    mitigation: 'Consider using references instead of cloning, and batch operations where possible.'
  },
  
  floatingPragma: {
    patterns: [
      /#!\[cfg_attr\(not\(feature = "std"\), no_std, no_main\)\]/g,
    ],
    severity: 'info',
    description: 'Standard ink! pragma detected',
    mitigation: 'Ensure you are using a specific, audited version of ink! framework.'
  }
};

/**
 * Parse Rust contract code to extract functions and storage
 */
function parseContractStructure(code) {
  const structure = {
    storage: [],
    constructors: [],
    messages: [],
    events: [],
    imports: [],
    totalLines: code.split('\n').length
  };

  // Extract storage fields
  const storageMatch = code.match(/#\[ink\(storage\)\]\s*pub struct \w+ \{([^}]+)\}/s);
  if (storageMatch) {
    const storageContent = storageMatch[1];
    const fields = storageContent.match(/(\w+):\s*([^,\n]+)/g);
    if (fields) {
      structure.storage = fields.map(f => {
        const [name, type] = f.split(':').map(s => s.trim());
        return { name, type };
      });
    }
  }

  // Extract constructors
  const constructorMatches = code.matchAll(/#\[ink\(constructor\)\]\s*pub fn (\w+)/g);
  for (const match of constructorMatches) {
    structure.constructors.push(match[1]);
  }

  // Extract messages (functions)
  const messageMatches = code.matchAll(/#\[ink\(message(?:,\s*payable)?\)\]\s*pub fn (\w+)/g);
  for (const match of messageMatches) {
    structure.messages.push(match[1]);
  }

  // Extract events
  const eventMatches = code.matchAll(/#\[ink\(event\)\]\s*pub struct (\w+)/g);
  for (const match of eventMatches) {
    structure.events.push(match[1]);
  }

  // Extract imports
  const importMatches = code.matchAll(/use ([^;]+);/g);
  for (const match of importMatches) {
    structure.imports.push(match[1].trim());
  }

  return structure;
}

/**
 * Scan contract code for specific vulnerability patterns
 */
function scanForVulnerabilities(code, contractStructure) {
  const findings = [];
  
  for (const [vulnType, vulnData] of Object.entries(INK_VULNERABILITY_PATTERNS)) {
    const { patterns, checks, exceptions, severity, description, mitigation } = vulnData;
    
    // Skip info-level checks for now
    if (severity === 'info') continue;
    
    if (Array.isArray(patterns)) {
      for (const pattern of patterns) {
        const matches = [...code.matchAll(pattern)];
        
        if (matches.length > 0) {
          // Check for exceptions (e.g., simple arithmetic)
          let actualMatches = matches;
          if (exceptions) {
            actualMatches = matches.filter(match => {
              const context = code.substring(
                Math.max(0, match.index - 100),
                Math.min(code.length, match.index + 100)
              );
              return !exceptions.some(exc => exc.test(context));
            });
          }
          
          // For access control, check if the function has proper checks
          if (vulnType === 'accessControl' && checks) {
            actualMatches = actualMatches.filter(match => {
              // Get the full function body
              const funcStart = match.index;
              const funcEnd = code.indexOf('\n    }', funcStart);
              const funcBody = code.substring(funcStart, funcEnd);
              
              // Check if any access control pattern exists in the function
              const hasAccessControl = checks.some(check => check.test(funcBody));
              
              return !hasAccessControl;
            });
          }
          
          if (actualMatches.length > 0) {
            findings.push({
              type: vulnType,
              severity,
              description,
              mitigation,
              occurrences: actualMatches.length,
              locations: actualMatches.slice(0, 5).map(m => {
                const lineNumber = code.substring(0, m.index).split('\n').length;
                const lineContent = code.split('\n')[lineNumber - 1]?.trim() || '';
                return {
                  line: lineNumber,
                  code: lineContent.substring(0, 80)
                };
              })
            });
          }
        }
      }
    }
  }
  
  return findings;
}

/**
 * Analyze reentrancy guard implementation
 */
function analyzeReentrancyProtection(code) {
  const hasGuard = /locked:\s*bool/i.test(code);
  const hasGuardFunction = /fn guard\(&mut self\)/.test(code);
  const hasUnguardFunction = /fn unguard\(&mut self\)/.test(code);
  
  const usesGuard = /self\.guard\(\);/.test(code);
  const usesUnguard = /self\.unguard\(\);/.test(code);
  
  return {
    implemented: hasGuard && hasGuardFunction && hasUnguardFunction,
    used: usesGuard && usesUnguard,
    score: (hasGuard ? 25 : 0) + (hasGuardFunction ? 25 : 0) + (usesGuard ? 50 : 0)
  };
}

/**
 * Analyze access control implementation
 */
function analyzeAccessControl(code, structure) {
  const hasAdmin = structure.storage.some(s => s.name === 'admin' || s.name === 'owner');
  const hasAdminChecks = /if\s+.*!=\s*self\.(admin|owner)/.test(code);
  const hasErrors = /Error::\w+/.test(code);
  
  const publicMutableFunctions = structure.messages.length;
  const protectedFunctions = (code.match(/if\s+.*!=\s*self\.(admin|owner)/g) || []).length;
  
  return {
    hasAdmin,
    hasAdminChecks,
    hasErrors,
    publicMutableFunctions,
    protectedFunctions,
    score: (hasAdmin ? 30 : 0) + (hasAdminChecks ? 40 : 0) + (hasErrors ? 30 : 0)
  };
}

/**
 * Check for gas optimization opportunities
 */
function analyzeGasOptimization(code, structure) {
  const issues = [];
  
  // Check for excessive storage operations
  const storageOps = (code.match(/self\.\w+\.insert\(/g) || []).length;
  if (storageOps > 10) {
    issues.push({
      type: 'storage',
      message: `High number of storage operations (${storageOps}). Consider batching.`,
      severity: 'medium'
    });
  }
  
  // Check for cloning in loops
  const clonesInLoops = code.match(/for\s+.*\{[^}]*\.clone\(\)/gs);
  if (clonesInLoops && clonesInLoops.length > 0) {
    issues.push({
      type: 'cloning',
      message: 'Cloning inside loops detected. Consider using references.',
      severity: 'medium'
    });
  }
  
  // Check for large vector operations
  const vecOps = (code.match(/\.push\(/g) || []).length;
  if (vecOps > 20) {
    issues.push({
      type: 'vector',
      message: `Many vector push operations (${vecOps}). Consider pre-allocating capacity.`,
      severity: 'low'
    });
  }
  
  return {
    issues,
    score: Math.max(0, 100 - (issues.length * 20))
  };
}

/**
 * Use AI to perform deep analysis of contract code
 */
async function analyzeWithAI(model, code, structure, patternFindings) {
  const prompt = `You are a security expert specializing in ink! smart contract auditing for Polkadot/Substrate chains.

**Contract Analysis Request:**

Analyze the following ink! smart contract for security vulnerabilities, best practices, and potential issues.

**Contract Code:**
\`\`\`rust
${code.length > 8000 ? code.substring(0, 8000) + '\n\n// ... (truncated)' : code}
\`\`\`

**Contract Structure:**
- Storage Fields: ${structure.storage.map(s => s.name).join(', ')}
- Constructors: ${structure.constructors.join(', ')}
- Messages: ${structure.messages.join(', ')}
- Events: ${structure.events.join(', ')}
- Total Lines: ${structure.totalLines}

**Pattern-Based Findings:**
${patternFindings.map(f => `- ${f.type} (${f.severity}): ${f.occurrences} occurrences`).join('\n')}

**Deep Analysis Required:**

1. **Security Vulnerabilities:**
   - Reentrancy attacks (even with guards in place)
   - Integer overflow/underflow in complex calculations
   - Access control bypasses or privilege escalation
   - Front-running vulnerabilities
   - Denial of service vectors
   - Logic errors that could lead to fund loss

2. **Business Logic Flaws:**
   - Incorrect state transitions
   - Missing validation on critical parameters
   - Edge cases not handled
   - Inconsistent state after errors

3. **Best Practices:**
   - Error handling completeness
   - Event emission for important state changes
   - Documentation quality
   - Code organization and maintainability

4. **Gas Optimization:**
   - Storage access patterns
   - Unnecessary computations
   - Batch operation opportunities

**Provide a JSON response with the following structure:**
{
  "securityScore": <0-100>,
  "criticalIssues": [
    {
      "title": "Issue title",
      "description": "Detailed description",
      "location": "Function or line reference",
      "severity": "critical",
      "recommendation": "How to fix"
    }
  ],
  "highIssues": [...],
  "mediumIssues": [...],
  "lowIssues": [...],
  "bestPracticeViolations": [...],
  "gasOptimizations": [...],
  "strengths": ["List of security strengths found"],
  "overallAssessment": "Summary of the contract's security posture",
  "recommendation": "deploy" | "fix_critical" | "fix_all" | "major_rewrite"
}

Be thorough and specific. Focus on real vulnerabilities, not just style issues.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return {
      securityScore: 50,
      criticalIssues: [],
      highIssues: [],
      mediumIssues: [],
      lowIssues: [],
      bestPracticeViolations: [],
      gasOptimizations: [],
      strengths: [],
      overallAssessment: 'AI analysis failed to parse properly',
      recommendation: 'fix_all'
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
}

/**
 * Calculate overall security score
 */
function calculateSecurityScore(analysisData) {
  const {
    patternFindings,
    reentrancyAnalysis,
    accessControlAnalysis,
    gasAnalysis,
    aiAnalysis
  } = analysisData;
  
  let score = 100;
  
  // Deduct points for pattern-based findings
  const criticalFindings = patternFindings.filter(f => f.severity === 'critical').length;
  const highFindings = patternFindings.filter(f => f.severity === 'high').length;
  const mediumFindings = patternFindings.filter(f => f.severity === 'medium').length;
  
  score -= criticalFindings * 20;
  score -= highFindings * 10;
  score -= mediumFindings * 5;
  
  // Add points for good security practices
  score = (score * 0.5) + (reentrancyAnalysis.score * 0.15) + 
          (accessControlAnalysis.score * 0.15) + (gasAnalysis.score * 0.1);
  
  // Factor in AI analysis (10% weight)
  if (aiAnalysis && aiAnalysis.securityScore) {
    score = (score * 0.9) + (aiAnalysis.securityScore * 0.1);
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate comprehensive audit report
 */
function generateAuditReport(analysisData, contractName) {
  const {
    patternFindings,
    structure,
    reentrancyAnalysis,
    accessControlAnalysis,
    gasAnalysis,
    aiAnalysis,
    securityScore
  } = analysisData;
  
  // Determine overall status
  let status = 'pass';
  let recommendation = 'deploy';
  
  const criticalCount = patternFindings.filter(f => f.severity === 'critical').length +
                        (aiAnalysis?.criticalIssues?.length || 0);
  const highCount = patternFindings.filter(f => f.severity === 'high').length +
                    (aiAnalysis?.highIssues?.length || 0);
  
  if (criticalCount > 0) {
    status = 'fail';
    recommendation = 'fix_critical';
  } else if (highCount > 2) {
    status = 'warning';
    recommendation = 'fix_high';
  } else if (securityScore < 70) {
    status = 'warning';
    recommendation = 'review';
  }
  
  return {
    contractName,
    timestamp: new Date().toISOString(),
    status,
    securityScore,
    recommendation,
    summary: {
      totalIssues: patternFindings.length + 
                   (aiAnalysis?.criticalIssues?.length || 0) +
                   (aiAnalysis?.highIssues?.length || 0) +
                   (aiAnalysis?.mediumIssues?.length || 0),
      criticalIssues: criticalCount,
      highIssues: highCount,
      mediumIssues: patternFindings.filter(f => f.severity === 'medium').length +
                    (aiAnalysis?.mediumIssues?.length || 0),
      lowIssues: patternFindings.filter(f => f.severity === 'low').length +
                 (aiAnalysis?.lowIssues?.length || 0)
    },
    structure: {
      storageFields: structure.storage.length,
      constructors: structure.constructors.length,
      messages: structure.messages.length,
      events: structure.events.length,
      totalLines: structure.totalLines
    },
    securityAnalysis: {
      reentrancyProtection: reentrancyAnalysis,
      accessControl: accessControlAnalysis,
      gasOptimization: gasAnalysis
    },
    findings: {
      patternBased: patternFindings,
      aiAnalysis: aiAnalysis || { skipped: true }
    }
  };
}

/**
 * Main contract auditing function
 */
async function auditContract(contractCode, options = {}) {
  const {
    apiKey,
    contractName = 'unknown',
    skipAI = false
  } = options;
  
  try {
    console.log(`\n🔍 Starting audit for contract: ${contractName}`);
    
    // Step 1: Parse contract structure
    console.log('  📊 Parsing contract structure...');
    const structure = parseContractStructure(contractCode);
    
    // Step 2: Scan for vulnerability patterns
    console.log('  🔎 Scanning for vulnerability patterns...');
    const patternFindings = scanForVulnerabilities(contractCode, structure);
    
    // Step 3: Analyze security features
    console.log('  🛡️  Analyzing security features...');
    const reentrancyAnalysis = analyzeReentrancyProtection(contractCode);
    const accessControlAnalysis = analyzeAccessControl(contractCode, structure);
    const gasAnalysis = analyzeGasOptimization(contractCode, structure);
    
    // Step 4: AI-powered deep analysis (if enabled)
    let aiAnalysis = null;
    if (apiKey && !skipAI && apiKey !== 'your_gemini_api_key_here') {
      console.log('  🤖 Running AI-powered deep analysis...');
      const model = initializeAuditModel(apiKey);
      aiAnalysis = await analyzeWithAI(model, contractCode, structure, patternFindings);
    }
    
    // Step 5: Calculate security score
    console.log('  📈 Calculating security score...');
    const securityScore = calculateSecurityScore({
      patternFindings,
      reentrancyAnalysis,
      accessControlAnalysis,
      gasAnalysis,
      aiAnalysis
    });
    
    // Step 6: Generate comprehensive report
    console.log('  📝 Generating audit report...');
    const report = generateAuditReport({
      patternFindings,
      structure,
      reentrancyAnalysis,
      accessControlAnalysis,
      gasAnalysis,
      aiAnalysis,
      securityScore
    }, contractName);
    
    // Log summary
    console.log(`\n✅ Audit complete for ${contractName}`);
    console.log(`   Security Score: ${securityScore}/100`);
    console.log(`   Status: ${report.status.toUpperCase()}`);
    console.log(`   Issues Found: ${report.summary.totalIssues}`);
    console.log(`   - Critical: ${report.summary.criticalIssues}`);
    console.log(`   - High: ${report.summary.highIssues}`);
    console.log(`   - Medium: ${report.summary.mediumIssues}`);
    console.log(`   - Low: ${report.summary.lowIssues}\n`);
    
    return report;
    
  } catch (error) {
    console.error('Contract audit error:', error);
    return {
      error: true,
      message: 'Contract audit failed',
      details: error.message,
      contractName,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Audit contract from file path
 */
async function auditContractFile(filePath, options = {}) {
  try {
    const contractCode = await fs.readFile(filePath, 'utf-8');
    const contractName = path.basename(filePath, '.rs');
    
    return await auditContract(contractCode, {
      ...options,
      contractName
    });
  } catch (error) {
    console.error(`Error reading contract file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Audit multiple contracts
 */
async function auditMultipleContracts(filePaths, options = {}) {
  const results = [];
  
  for (const filePath of filePaths) {
    console.log(`\n${'='.repeat(60)}`);
    const result = await auditContractFile(filePath, options);
    results.push(result);
  }
  
  return {
    timestamp: new Date().toISOString(),
    totalContracts: results.length,
    results,
    summary: {
      passed: results.filter(r => r.status === 'pass').length,
      warnings: results.filter(r => r.status === 'warning').length,
      failed: results.filter(r => r.status === 'fail').length,
      averageScore: results.reduce((sum, r) => sum + (r.securityScore || 0), 0) / results.length
    }
  };
}

module.exports = {
  auditContract,
  auditContractFile,
  auditMultipleContracts,
  parseContractStructure,
  scanForVulnerabilities
};
