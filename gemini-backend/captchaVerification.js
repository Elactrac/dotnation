/**
 * @file Captcha Verification Module
 * Provides secure server-side captcha verification with session management
 */

const crypto = require('crypto');

/**
 * In-memory session store (use Redis in production)
 */
const sessionStore = new Map();

/**
 * Rate limit tracking per IP
 */
const rateLimitStore = new Map();

/**
 * Session configuration
 */
const SESSION_CONFIG = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxAttempts: 3,
  lockoutDuration: 60 * 1000, // 60 seconds
  cleanupInterval: 10 * 60 * 1000 // Clean up expired sessions every 10 minutes
};

/**
 * Rate limit configuration
 */
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50 // Max 50 verification attempts per window
};

/**
 * Clean up expired sessions periodically
 */
setInterval(() => {
  const now = Date.now();
  
  // Clean up sessions
  for (const [token, session] of sessionStore.entries()) {
    if (now - session.createdAt > SESSION_CONFIG.maxAge) {
      sessionStore.delete(token);
    }
  }
  
  // Clean up rate limits
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitStore.delete(ip);
    }
  }
  
  console.log(`[Captcha] Cleanup: ${sessionStore.size} active sessions, ${rateLimitStore.size} rate limit entries`);
}, SESSION_CONFIG.cleanupInterval);

/**
 * Generate a secure session token
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a verification token
 */
function generateVerificationToken(sessionToken, ip) {
  const payload = {
    sessionToken,
    timestamp: Date.now(),
    ip: crypto.createHash('sha256').update(ip).digest('hex'), // Hashed IP for privacy
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const rateLimitData = rateLimitStore.get(ip) || {
    count: 0,
    resetTime: now + RATE_LIMIT_CONFIG.windowMs
  };
  
  // Reset if window has passed
  if (now > rateLimitData.resetTime) {
    rateLimitData.count = 0;
    rateLimitData.resetTime = now + RATE_LIMIT_CONFIG.windowMs;
  }
  
  rateLimitData.count++;
  rateLimitStore.set(ip, rateLimitData);
  
  return {
    allowed: rateLimitData.count <= RATE_LIMIT_CONFIG.maxRequests,
    remaining: Math.max(0, RATE_LIMIT_CONFIG.maxRequests - rateLimitData.count),
    resetTime: rateLimitData.resetTime
  };
}

/**
 * Create a new captcha session
 */
function createSession(ip) {
  const sessionToken = generateSessionToken();
  const session = {
    token: sessionToken,
    createdAt: Date.now(),
    attempts: 0,
    locked: false,
    lockUntil: null,
    ip: crypto.createHash('sha256').update(ip).digest('hex')
  };
  
  sessionStore.set(sessionToken, session);
  
  return sessionToken;
}

/**
 * Verify captcha answer
 */
function verifyCaptcha(sessionToken, userAnswer, expectedAnswer, timeTaken, ip) {
  // Check rate limit
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      verified: false,
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
    };
  }
  
  // Validate session token
  const session = sessionStore.get(sessionToken);
  if (!session) {
    return {
      verified: false,
      error: 'Invalid or expired session'
    };
  }
  
  // Check session age
  const sessionAge = Date.now() - session.createdAt;
  if (sessionAge > SESSION_CONFIG.maxAge) {
    sessionStore.delete(sessionToken);
    return {
      verified: false,
      error: 'Session expired'
    };
  }
  
  // Check if session is locked
  if (session.locked) {
    const lockRemaining = session.lockUntil - Date.now();
    if (lockRemaining > 0) {
      return {
        verified: false,
        error: 'Too many attempts. Account temporarily locked',
        lockRemaining: Math.ceil(lockRemaining / 1000)
      };
    } else {
      // Unlock session
      session.locked = false;
      session.attempts = 0;
      session.lockUntil = null;
    }
  }
  
  // Validate timing (anti-bot check)
  if (timeTaken < 2) {
    session.attempts++;
    
    if (session.attempts >= SESSION_CONFIG.maxAttempts) {
      session.locked = true;
      session.lockUntil = Date.now() + SESSION_CONFIG.lockoutDuration;
    }
    
    sessionStore.set(sessionToken, session);
    
    return {
      verified: false,
      error: 'Suspicious activity detected',
      attempts: session.attempts,
      maxAttempts: SESSION_CONFIG.maxAttempts
    };
  }
  
  // Normalize answers for comparison
  const normalizedUser = String(userAnswer).trim().toUpperCase();
  const normalizedExpected = String(expectedAnswer).trim().toUpperCase();
  
  // Verify answer
  if (normalizedUser === normalizedExpected) {
    // Success - clear session and generate verification token
    sessionStore.delete(sessionToken);
    
    const verificationToken = generateVerificationToken(sessionToken, ip);
    
    return {
      verified: true,
      token: verificationToken,
      timestamp: Date.now()
    };
  } else {
    // Wrong answer - increment attempts
    session.attempts++;
    
    if (session.attempts >= SESSION_CONFIG.maxAttempts) {
      session.locked = true;
      session.lockUntil = Date.now() + SESSION_CONFIG.lockoutDuration;
    }
    
    sessionStore.set(sessionToken, session);
    
    return {
      verified: false,
      error: 'Incorrect answer',
      attempts: session.attempts,
      maxAttempts: SESSION_CONFIG.maxAttempts,
      remainingAttempts: Math.max(0, SESSION_CONFIG.maxAttempts - session.attempts)
    };
  }
}

/**
 * Validate a verification token
 */
function validateVerificationToken(token, ip) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check token age (valid for 1 hour)
    const tokenAge = Date.now() - payload.timestamp;
    if (tokenAge > 60 * 60 * 1000) {
      return { valid: false, error: 'Token expired' };
    }
    
    // Verify IP hash matches (optional - for extra security)
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    if (payload.ip !== ipHash) {
      console.warn('[Captcha] IP mismatch for verification token');
      // Don't fail on IP mismatch (IP can change), just log it
    }
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: 'Invalid token format' };
  }
}

/**
 * Get session statistics (for monitoring)
 */
function getStats() {
  return {
    activeSessions: sessionStore.size,
    rateLimitEntries: rateLimitStore.size,
    config: {
      sessionMaxAge: SESSION_CONFIG.maxAge,
      maxAttempts: SESSION_CONFIG.maxAttempts,
      lockoutDuration: SESSION_CONFIG.lockoutDuration,
      rateLimitWindow: RATE_LIMIT_CONFIG.windowMs,
      rateLimitMax: RATE_LIMIT_CONFIG.maxRequests
    }
  };
}

module.exports = {
  createSession,
  verifyCaptcha,
  validateVerificationToken,
  getStats,
  generateSessionToken
};
