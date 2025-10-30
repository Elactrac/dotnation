/**
 * @file Fraud Detection Module for Campaign Analysis
 * Uses AI-powered analysis to detect fraudulent campaigns, plagiarism, and scam patterns.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Initialize Gemini model for fraud detection with stricter parameters
 */
function initializeFraudDetectionModel(apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.3, // Lower temperature for more consistent analysis
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 2048,
    }
  });
}

/**
 * Known scam patterns and red flags to check for
 */
const SCAM_PATTERNS = {
  urgentLanguage: [
    'act now', 'limited time', 'urgent', 'hurry', 'don\'t miss out',
    'last chance', 'only today', 'expires soon', 'immediate action'
  ],
  unrealisticPromises: [
    'guaranteed returns', '100% profit', 'risk-free', 'no risk',
    'get rich quick', 'passive income', 'double your money',
    'guaranteed success', 'can\'t lose'
  ],
  technicalBuzzwords: [
    'revolutionary blockchain', 'quantum encryption', 'ai-powered trading',
    'guaranteed ROI', 'decentralized autonomous', 'next-gen crypto',
    'unlimited scalability', 'instant millionaire'
  ],
  suspiciousRequests: [
    'send crypto', 'wire transfer', 'gift card', 'prepaid card',
    'western union', 'moneygram', 'cryptocurrency only',
    'no refunds', 'final sale'
  ],
  pressureTactics: [
    'limited spots', 'exclusive offer', 'vip access', 'insider deal',
    'secret opportunity', 'private sale', 'whitelist only'
  ]
};

/**
 * Calculate text similarity using cosine similarity of character n-grams
 */
function calculateTextSimilarity(text1, text2, nGramSize = 3) {
  if (!text1 || !text2) return 0;
  
  // Normalize texts
  const norm1 = text1.toLowerCase().replace(/[^\w\s]/g, '');
  const norm2 = text2.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Generate n-grams
  const getNGrams = (text, n) => {
    const grams = new Set();
    for (let i = 0; i <= text.length - n; i++) {
      grams.add(text.substring(i, i + n));
    }
    return grams;
  };
  
  const grams1 = getNGrams(norm1, nGramSize);
  const grams2 = getNGrams(norm2, nGramSize);
  
  // Calculate intersection
  const intersection = [...grams1].filter(g => grams2.has(g)).length;
  const union = grams1.size + grams2.size - intersection;
  
  return union > 0 ? intersection / union : 0;
}

/**
 * Check for common scam patterns in campaign text
 */
function detectScamPatterns(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const detectedPatterns = [];
  let totalScore = 0;
  
  // Check each category of scam patterns
  for (const [category, patterns] of Object.entries(SCAM_PATTERNS)) {
    const matches = patterns.filter(pattern => 
      text.includes(pattern.toLowerCase())
    );
    
    if (matches.length > 0) {
      detectedPatterns.push({
        category,
        matches,
        severity: matches.length > 2 ? 'high' : 'medium'
      });
      totalScore += matches.length * (matches.length > 2 ? 2 : 1);
    }
  }
  
  return {
    detected: detectedPatterns,
    score: Math.min(totalScore * 10, 100), // Cap at 100
    hasRedFlags: detectedPatterns.length > 0
  };
}

/**
 * Validate campaign structure and check for technical claims
 */
function validateCampaignStructure(campaignData) {
  const issues = [];
  const { title, description, goal, deadline, beneficiary } = campaignData;
  
  // Check for empty or suspicious fields
  if (!title || title.length < 10) {
    issues.push({
      type: 'title',
      severity: 'high',
      message: 'Campaign title is too short or missing'
    });
  }
  
  if (title && title.length > 200) {
    issues.push({
      type: 'title',
      severity: 'medium',
      message: 'Campaign title is unusually long'
    });
  }
  
  if (!description || description.length < 50) {
    issues.push({
      type: 'description',
      severity: 'high',
      message: 'Campaign description is too short or vague'
    });
  }
  
  if (description && description.length < 100 && goal > 10000) {
    issues.push({
      type: 'description',
      severity: 'high',
      message: 'High funding goal with minimal description raises red flags'
    });
  }
  
  // Check for excessive use of caps lock (common in scams)
  const capsRatio = (title + description).match(/[A-Z]/g)?.length / 
                    (title + description).length || 0;
  if (capsRatio > 0.3) {
    issues.push({
      type: 'formatting',
      severity: 'medium',
      message: 'Excessive use of capital letters (common in scams)'
    });
  }
  
  // Check for excessive emoji or special characters
  const specialCharRatio = (title + description).match(/[^\w\s]/g)?.length / 
                           (title + description).length || 0;
  if (specialCharRatio > 0.15) {
    issues.push({
      type: 'formatting',
      severity: 'low',
      message: 'Excessive special characters or emoji usage'
    });
  }
  
  // Check for unrealistic funding goals
  if (goal && goal > 1000000) {
    issues.push({
      type: 'goal',
      severity: 'medium',
      message: 'Funding goal is unusually high - requires extra verification'
    });
  }
  
  return {
    valid: issues.filter(i => i.severity === 'high').length === 0,
    issues,
    warningCount: issues.length
  };
}

/**
 * Use AI to analyze campaign for sophisticated fraud patterns
 */
async function analyzeWithAI(model, campaignData, knownCampaigns = []) {
  const { title, description, goal, deadline } = campaignData;
  
  const prompt = `You are a fraud detection expert analyzing crowdfunding campaigns. Analyze the following campaign for potential fraud indicators:

**Campaign Details:**
- Title: ${title}
- Description: ${description}
- Funding Goal: ${goal} DOT
- Deadline: ${deadline}

**Analysis Tasks:**
1. Detect plagiarized or copied content (generic templates, copied from other sources)
2. Identify unrealistic or impossible technical claims
3. Check for emotional manipulation tactics
4. Assess the legitimacy of the project description
5. Look for vague or missing implementation details
6. Identify inconsistencies in the narrative
7. Check for signs of social engineering

**Provide a JSON response with:**
{
  "riskScore": <0-100>,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "plagiarismDetected": <boolean>,
  "unrealisticClaims": [<list of specific claims>],
  "missingDetails": [<list of missing critical information>],
  "redFlags": [<list of specific red flags found>],
  "legitimacyIndicators": [<positive signs if any>],
  "recommendation": "approve" | "review" | "reject",
  "reasoning": "<detailed explanation>",
  "confidence": <0-100>
}

Be thorough and consider that legitimate blockchain projects should have:
- Clear technical implementation details
- Realistic timelines and goals
- Transparent team/beneficiary information
- Specific use cases and problems being solved
- Reasonable funding amounts with breakdown`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      riskScore: 50,
      riskLevel: 'medium',
      plagiarismDetected: false,
      unrealisticClaims: [],
      missingDetails: [],
      redFlags: ['AI analysis failed to parse properly'],
      legitimacyIndicators: [],
      recommendation: 'review',
      reasoning: 'Unable to complete full AI analysis',
      confidence: 30
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
}

/**
 * Check campaign against known fraud database
 */
function checkAgainstKnownFraud(campaignData, knownFraudCampaigns = []) {
  const matches = [];
  
  for (const fraudCampaign of knownFraudCampaigns) {
    const titleSimilarity = calculateTextSimilarity(
      campaignData.title, 
      fraudCampaign.title
    );
    const descSimilarity = calculateTextSimilarity(
      campaignData.description, 
      fraudCampaign.description
    );
    
    // If similarity is high, flag it
    if (titleSimilarity > 0.7 || descSimilarity > 0.6) {
      matches.push({
        fraudCampaignId: fraudCampaign.id,
        titleSimilarity: (titleSimilarity * 100).toFixed(2),
        descriptionSimilarity: (descSimilarity * 100).toFixed(2),
        reason: fraudCampaign.reason || 'Previously flagged as fraudulent'
      });
    }
  }
  
  return {
    matchesFound: matches.length > 0,
    matches,
    highRisk: matches.some(m => m.titleSimilarity > 80 || m.descriptionSimilarity > 70)
  };
}

/**
 * Calculate overall fraud risk score
 */
function calculateOverallRiskScore(analysisResults) {
  const {
    patternAnalysis,
    structureValidation,
    aiAnalysis,
    knownFraudCheck
  } = analysisResults;
  
  let score = 0;
  let maxScore = 100;
  
  // Pattern analysis (30% weight)
  score += (patternAnalysis.score || 0) * 0.3;
  
  // Structure validation (20% weight)
  const highIssues = structureValidation.issues.filter(i => i.severity === 'high').length;
  const medIssues = structureValidation.issues.filter(i => i.severity === 'medium').length;
  score += ((highIssues * 10 + medIssues * 5)) * 0.2;
  
  // AI analysis (40% weight)
  score += (aiAnalysis?.riskScore || 50) * 0.4;
  
  // Known fraud check (10% weight - but can override)
  if (knownFraudCheck.highRisk) {
    score = Math.max(score, 90); // Automatically high risk if matches known fraud
  } else if (knownFraudCheck.matchesFound) {
    score += 10;
  }
  
  return Math.min(Math.round(score), 100);
}

/**
 * Determine risk level from score
 */
function determineRiskLevel(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Main fraud detection function
 */
async function detectFraud(campaignData, options = {}) {
  const {
    apiKey,
    knownFraudCampaigns = [],
    skipAI = false
  } = options;
  
  try {
    // Step 1: Pattern-based detection
    const patternAnalysis = detectScamPatterns(
      campaignData.title, 
      campaignData.description
    );
    
    // Step 2: Structure validation
    const structureValidation = validateCampaignStructure(campaignData);
    
    // Step 3: AI-powered analysis (if API key provided and not skipped)
    let aiAnalysis = null;
    if (apiKey && !skipAI && apiKey !== 'your_gemini_api_key_here') {
      const model = initializeFraudDetectionModel(apiKey);
      aiAnalysis = await analyzeWithAI(model, campaignData);
    }
    
    // Step 4: Check against known fraud database
    const knownFraudCheck = checkAgainstKnownFraud(
      campaignData, 
      knownFraudCampaigns
    );
    
    // Step 5: Calculate overall risk
    const overallRiskScore = calculateOverallRiskScore({
      patternAnalysis,
      structureValidation,
      aiAnalysis,
      knownFraudCheck
    });
    
    const riskLevel = determineRiskLevel(overallRiskScore);
    
    // Step 6: Generate recommendation
    let recommendation = 'approve';
    if (riskLevel === 'critical' || overallRiskScore >= 80) {
      recommendation = 'reject';
    } else if (riskLevel === 'high' || overallRiskScore >= 50) {
      recommendation = 'review';
    }
    
    // Step 7: Compile comprehensive report
    return {
      campaignId: campaignData.id || 'new',
      timestamp: new Date().toISOString(),
      overallRiskScore,
      riskLevel,
      recommendation,
      analysis: {
        patternAnalysis: {
          detected: patternAnalysis.detected,
          score: patternAnalysis.score,
          hasRedFlags: patternAnalysis.hasRedFlags
        },
        structureValidation: {
          valid: structureValidation.valid,
          issues: structureValidation.issues,
          warningCount: structureValidation.warningCount
        },
        aiAnalysis: aiAnalysis || {
          skipped: true,
          reason: skipAI ? 'AI analysis disabled' : 'No API key provided'
        },
        knownFraudCheck: {
          matchesFound: knownFraudCheck.matchesFound,
          matchCount: knownFraudCheck.matches.length,
          matches: knownFraudCheck.matches,
          highRisk: knownFraudCheck.highRisk
        }
      },
      summary: generateSummary(overallRiskScore, riskLevel, {
        patternAnalysis,
        structureValidation,
        aiAnalysis,
        knownFraudCheck
      })
    };
    
  } catch (error) {
    console.error('Fraud detection error:', error);
    return {
      error: true,
      message: 'Fraud detection analysis failed',
      details: error.message,
      recommendation: 'review' // Default to manual review on error
    };
  }
}

/**
 * Generate human-readable summary
 */
function generateSummary(score, level, analysis) {
  const { patternAnalysis, structureValidation, aiAnalysis, knownFraudCheck } = analysis;
  
  const summary = [];
  
  // Main risk assessment
  summary.push(`Overall Risk Score: ${score}/100 (${level.toUpperCase()})`);
  
  // Pattern findings
  if (patternAnalysis.hasRedFlags) {
    summary.push(`⚠️ Detected ${patternAnalysis.detected.length} scam pattern categories`);
  }
  
  // Structure issues
  if (structureValidation.warningCount > 0) {
    const highIssues = structureValidation.issues.filter(i => i.severity === 'high').length;
    if (highIssues > 0) {
      summary.push(`🚨 ${highIssues} high-severity structural issues found`);
    }
  }
  
  // AI findings
  if (aiAnalysis && !aiAnalysis.skipped) {
    if (aiAnalysis.plagiarismDetected) {
      summary.push('📋 Possible plagiarized content detected');
    }
    if (aiAnalysis.unrealisticClaims?.length > 0) {
      summary.push(`🎭 ${aiAnalysis.unrealisticClaims.length} unrealistic claims identified`);
    }
  }
  
  // Known fraud matches
  if (knownFraudCheck.matchesFound) {
    summary.push(`🔴 Matches ${knownFraudCheck.matches.length} known fraudulent campaign(s)`);
  }
  
  return summary.join('\n');
}

module.exports = {
  detectFraud,
  detectScamPatterns,
  validateCampaignStructure,
  calculateTextSimilarity,
  checkAgainstKnownFraud
};
