/**
 * AI API Integration
 * Provides functions to interact with the backend AI-powered features
 * Including campaign title/description generation, fraud detection, and content summarization
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY || 'dev_api_key_12345';
const REQUEST_TIMEOUT = 10000; // 10 seconds for normal requests
const AI_REQUEST_TIMEOUT = 45000; // 45 seconds for AI requests (Gemini can be slow)

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - backend server may be down');
    }
    throw error;
  }
}

/**
 * Clean AI-generated text by removing markdown headers and extra formatting
 * @param {string} text - Raw text from AI
 * @returns {string} Cleaned text
 */
function cleanAIResponse(text) {
  if (!text) return '';
  
  // Remove markdown headers (**, #, etc.)
  let cleaned = text
    .replace(/^#+\s+/gm, '') // Remove markdown headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/^\*\s+/gm, '• ') // Convert markdown bullets to unicode bullets
    .trim();
  
  return cleaned;
}

/**
 * Get authentication headers for API requests
 * @returns {Object} Headers object with API key
 */
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  };
}

/**
 * Generate campaign description using AI
 * @param {string} title - Campaign title
 * @returns {Promise<{description: string, fallback?: boolean}>}
 */
export async function generateDescription(title) {
  try {
    console.log('[AI API] Generating description for:', title);
    const response = await fetchWithTimeout(`${BACKEND_URL}/api/generate-description`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    }, AI_REQUEST_TIMEOUT);

    if (!response.ok) {
      console.error('[AI API] Backend error:', response.status, response.statusText);
      throw new Error(`Failed to generate description: ${response.statusText}`);
    }

    const data = await response.json();
    // Clean the AI response to remove markdown formatting
    if (data.description) {
      data.description = cleanAIResponse(data.description);
    }
    console.log('[AI API] ✅ Description generated successfully');
    return data;
  } catch (error) {
    console.error('[AI API] Error generating description:', error);
    // Return fallback description
    return {
      description: `Help support this campaign: "${title}". Your contribution will make a difference in achieving this important goal. Every donation counts towards making this project a reality.`,
      fallback: true
    };
  }
}

/**
 * Generate campaign title suggestions using AI
 * @param {string} keywords - Keywords for title generation
 * @param {string} category - Campaign category
 * @returns {Promise<{titles: string[], fallback?: boolean}>}
 */
export async function generateTitles(keywords, category = 'general') {
  try {
    const response = await fetchWithTimeout(`${BACKEND_URL}/api/generate-title`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ keywords, category }),
    }, AI_REQUEST_TIMEOUT);

    if (!response.ok) {
      throw new Error(`Failed to generate titles: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[AI API] Error generating titles:', error);
    throw error;
  }
}

/**
 * Detect potential fraud in campaign data
 * @param {Object} campaign - Campaign data to analyze
 * @param {string} campaign.title - Campaign title
 * @param {string} campaign.description - Campaign description
 * @param {string} campaign.goal - Campaign goal amount
 * @param {string} campaign.beneficiary - Beneficiary address
 * @param {string} campaign.category - Campaign category
 * @returns {Promise<{riskScore: number, riskLevel: string, flags: string[], recommendations: string[], aiAnalysis?: Object}>}
 */
export async function detectFraud(campaign) {
  try {
    console.log('[AI API] Running fraud detection for campaign:', campaign.title);
    const response = await fetchWithTimeout(`${BACKEND_URL}/api/fraud-detection`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ campaign }),
    }, AI_REQUEST_TIMEOUT);

    if (!response.ok) {
      console.error('[AI API] Backend error:', response.status, response.statusText);
      throw new Error(`Failed to detect fraud: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[AI API] ✅ Fraud detection completed, risk level:', data.riskLevel);
    return data;
  } catch (error) {
    console.error('[AI API] Error detecting fraud:', error);
    // Return safe default - low risk if backend unavailable
    return {
      riskScore: 30,
      riskLevel: 'low',
      flags: [],
      recommendations: ['Backend fraud detection unavailable - proceeding with caution'],
      fallback: true
    };
  }
}

/**
 * Summarize content using AI
 * @param {string} description - Content to summarize
 * @param {number} maxLength - Maximum length of summary (optional)
 * @returns {Promise<{summary: string, fallback?: boolean}>}
 */
export async function summarizeContent(description, maxLength = 100) {
  try {
    console.log('[AI API] Summarizing content, length:', description?.length);
    const response = await fetchWithTimeout(`${BACKEND_URL}/api/summarize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ description, maxLength }),
    }, AI_REQUEST_TIMEOUT);

    if (!response.ok) {
      console.error('[AI API] Backend error:', response.status, response.statusText);
      throw new Error(`Failed to summarize content: ${response.statusText}`);
    }

    const data = await response.json();
    // Clean the AI response
    if (data.summary) {
      data.summary = cleanAIResponse(data.summary);
    }
    console.log('[AI API] ✅ Content summarized successfully');
    return data;
  } catch (error) {
    console.error('[AI API] Error summarizing content:', error);
    // Return fallback summary (truncated description)
    const fallbackSummary = description 
      ? description.substring(0, maxLength) + (description.length > maxLength ? '...' : '')
      : 'No description available';
    return {
      summary: fallbackSummary,
      fallback: true
    };
  }
}

/**
 * Generate contract summary
 * @param {Object} contract - Contract data
 * @returns {Promise<{summary: string, fallback?: boolean}>}
 */
export async function generateContractSummary(contract) {
  try {
    console.log('[AI API] Sending contract summary request:', contract);
    const response = await fetchWithTimeout(`${BACKEND_URL}/api/contract-summary`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(contract),
    }, AI_REQUEST_TIMEOUT);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[AI API] Contract summary error response:', errorData);
      // Handle both string and array details
      const detailsMessage = Array.isArray(errorData.details) 
        ? errorData.details.join(', ') 
        : errorData.details;
      const errorMessage = detailsMessage || errorData.error || response.statusText;
      throw new Error(`Failed to generate contract summary: ${errorMessage}`);
    }

    const data = await response.json();
    // Clean the AI response
    if (data.summary) {
      data.summary = cleanAIResponse(data.summary);
    }
    return data;
  } catch (error) {
    console.error('[AI API] Error generating contract summary:', error);
    throw error;
  }
}

/**
 * Get AI quality score for campaign content
 * Combines multiple AI checks to provide an overall quality score
 * @param {Object} campaign - Campaign data
 * @returns {Promise<{score: number, suggestions: string[], strengths: string[]}>}
 */
export async function getCampaignQualityScore(campaign) {
  try {
    // Perform fraud detection to get quality indicators
    const fraudResult = await detectFraud(campaign);
    
    // Calculate quality score (inverse of risk score)
    const score = Math.max(0, 100 - fraudResult.riskScore);
    
    // Extract suggestions from fraud detection
    const suggestions = fraudResult.recommendations || [];
    
    // Determine strengths based on flags
    const strengths = [];
    if (fraudResult.riskLevel === 'low') {
      strengths.push('Clear and professional title');
      strengths.push('Well-structured description');
    }
    if (campaign.description && campaign.description.length > 200) {
      strengths.push('Detailed campaign information');
    }
    
    return {
      score,
      suggestions,
      strengths,
      riskLevel: fraudResult.riskLevel,
    };
  } catch (error) {
    console.error('[AI API] Error getting quality score:', error);
    // Return default score on error
    return {
      score: 50,
      suggestions: ['Unable to analyze campaign quality'],
      strengths: [],
      riskLevel: 'unknown',
    };
  }
}
