/**
 * Captcha API Integration
 * Provides functions to interact with the backend captcha verification system
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY || 'dev_api_key_12345';
const REQUEST_TIMEOUT = 10000; // 10 seconds

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
 * Verify reCAPTCHA token with backend
 * @param {string} token - The reCAPTCHA token from Google
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyRecaptcha(token) {
  try {
    const response = await fetchWithTimeout(`${BACKEND_URL}/api/verify-recaptcha`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Verification failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Captcha API] Error verifying reCAPTCHA:', error);
    throw error;
  }
}
