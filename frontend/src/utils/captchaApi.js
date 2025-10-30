/**
 * Captcha API Integration
 * Provides functions to interact with the backend captcha verification system
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Create a new captcha session
 * @returns {Promise<{success: boolean, sessionToken: string, expiresIn: number}>}
 */
export async function createCaptchaSession() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/captcha/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
 * Verify captcha answer
 * @param {Object} params - Verification parameters
 * @param {string} params.sessionToken - The session token
 * @param {string} params.captchaType - Type of captcha (math, image, slider, pattern)
 * @param {any} params.userAnswer - User's answer
 * @param {any} params.expectedAnswer - Expected answer
 * @param {number} params.timeTaken - Time taken in seconds
 * @param {Object} params.options - Additional options (e.g., tolerance for slider)
 * @returns {Promise<{verified: boolean, token?: string, error?: string}>}
 */
export async function verifyCaptcha({
  sessionToken,
  captchaType,
  userAnswer,
  expectedAnswer,
  timeTaken,
  options = {}
}) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/captcha/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionToken,
        captchaType,
        userAnswer,
        expectedAnswer,
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
