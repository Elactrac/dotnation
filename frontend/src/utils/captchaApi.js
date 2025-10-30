/**
 * Captcha API Integration
 * Provides functions to interact with the backend captcha verification system
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
 * Create a new captcha session
 * @returns {Promise<{success: boolean, sessionToken: string, expiresIn: number}>}
 */
export async function createCaptchaSession() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/captcha/session`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to create captcha session: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Captcha API] Error creating session:', error);
    throw error;
  }
}

/**
 * Generate a captcha challenge
 * @param {Object} params - Challenge parameters
 * @param {string} params.sessionToken - The session token
 * @param {string} params.captchaType - Type of captcha (math, image, slider, pattern)
 * @param {number} params.difficulty - Difficulty level (0-2, optional)
 * @returns {Promise<{success: boolean, type: string, challenge: Object}>}
 */
export async function generateCaptchaChallenge({
  sessionToken,
  captchaType,
  difficulty = 0
}) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/captcha/challenge`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        sessionToken,
        captchaType,
        difficulty
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to generate challenge: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Captcha API] Error generating challenge:', error);
    throw error;
  }
}

/**
 * Verify captcha answer
 * SECURE: Only sends user's answer, NOT the expected answer
 * @param {Object} params - Verification parameters
 * @param {string} params.sessionToken - The session token
 * @param {string} params.captchaType - Type of captcha (math, image, slider, pattern)
 * @param {any} params.userAnswer - User's answer
 * @param {number} params.timeTaken - Time taken in seconds
 * @param {Object} params.options - Additional options (e.g., tolerance for slider)
 * @returns {Promise<{verified: boolean, token?: string, error?: string}>}
 */
export async function verifyCaptcha({
  sessionToken,
  captchaType,
  userAnswer,
  timeTaken,
  options = {}
}) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/captcha/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        sessionToken,
        captchaType,
        userAnswer,
        timeTaken,
        options
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Verification failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Captcha API] Error verifying captcha:', error);
    throw error;
  }
}

/**
 * Validate a verification token
 * @param {string} token - The verification token to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateCaptchaToken(token) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/captcha/validate-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Token validation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Captcha API] Error validating token:', error);
    throw error;
  }
}

/**
 * Get captcha system statistics (for monitoring/debugging)
 * @returns {Promise<Object>}
 */
export async function getCaptchaStats() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/captcha/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get captcha stats: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Captcha API] Error getting stats:', error);
    throw error;
  }
}
