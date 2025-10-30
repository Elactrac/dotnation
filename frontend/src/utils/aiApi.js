/**
 * AI API Integration
 * Provides functions to interact with the backend AI-powered features
 * Including campaign title/description generation, fraud detection, and content summarization
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY || 'dev_api_key_12345';

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
    const response = await fetch(`${BACKEND_URL}/api/generate-description`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate description: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[AI API] Error generating description:', error);
    throw error;
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
    const response = await fetch(`${BACKEND_URL}/api/generate-title`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ keywords, category }),
    });

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
    const response = await fetch(`${BACKEND_URL}/api/fraud-detection`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ campaign }),
    });

    if (!response.ok) {
      throw new Error(`Failed to detect fraud: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[AI API] Error detecting fraud:', error);
    throw error;
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
    const response = await fetch(`${BACKEND_URL}/api/summarize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ description, maxLength }),
    });

    if (!response.ok) {
      throw new Error(`Failed to summarize content: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[AI API] Error summarizing content:', error);
    throw error;
  }
}

/**
 * Generate contract summary
 * @param {Object} contract - Contract data
 * @returns {Promise<{summary: string, fallback?: boolean}>}
 */
export async function generateContractSummary(contract) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/contract-summary`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ contract }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate contract summary: ${response.statusText}`);
    }

    const data = await response.json();
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
