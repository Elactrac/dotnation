/**
 * @file Captcha Verification Module
 * Provides secure server-side captcha verification with session management
 * Production-ready with Redis persistence
 */

const crypto = require('crypto');
const { getRedisClient, sessionOps, rateLimitOps } = require('./redisClient');
const logger = require('./logger');

/**
 * Fallback in-memory stores when Redis is unavailable
 */
const sessionStore = new Map();
const rateLimitStore = new Map();

/**
 * Check if Redis is available
 */
function isRedisAvailable() {
  try {
    const client = getRedisClient();
    return client && client.isOpen;
  } catch (error) {
    return false;
  }
}

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
 * Clean up expired sessions periodically (only for fallback in-memory store)
 */
setInterval(() => {
  if (isRedisAvailable()) {
    // Redis handles TTL automatically, no cleanup needed
    return;
  }
  
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
  
  logger.info(`Captcha cleanup (in-memory): ${sessionStore.size} sessions, ${rateLimitStore.size} rate limits`);
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
async function checkRateLimit(ip) {
  if (isRedisAvailable()) {
    // Use Redis rate limiting
    try {
      return await rateLimitOps.checkRateLimit(
        ip, 
        RATE_LIMIT_CONFIG.maxRequests, 
        RATE_LIMIT_CONFIG.windowMs
      );
    } catch (error) {
      logger.error('Redis rate limit check failed, falling back to in-memory', error);
      // Fall through to in-memory implementation
    }
  }
  
  // Fallback: In-memory rate limiting
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
async function createSession(ip) {
  const sessionToken = generateSessionToken();
  const session = {
    token: sessionToken,
    createdAt: Date.now(),
    attempts: 0,
    locked: false,
    lockUntil: null,
    ip: crypto.createHash('sha256').update(ip).digest('hex')
  };
  
  if (isRedisAvailable()) {
    try {
      await sessionOps.createSession(sessionToken, session, SESSION_CONFIG.maxAge / 1000);
      logger.debug('Created captcha session in Redis', { token: sessionToken.substring(0, 8) });
      return sessionToken;
    } catch (error) {
      logger.error('Failed to create session in Redis, using in-memory fallback', error);
      // Fall through to in-memory storage
    }
  }
  
  // Fallback: In-memory storage
  sessionStore.set(sessionToken, session);
  
  return sessionToken;
}

/**
 * Generate a math challenge
 * @param {number} difficulty - Difficulty level (0-2): 0=addition, 1=addition/subtraction, 2=all operations
 * @returns {object} Challenge object with num1, num2, operation (without answer)
 */
function generateMathChallenge(difficulty = 0) {
  const operations = difficulty === 0 ? ['+'] : difficulty === 1 ? ['+', '-'] : ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1, num2;
  
  if (operation === '+') {
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
  } else if (operation === '-') {
    num1 = Math.floor(Math.random() * 15) + 6;
    num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
  } else {
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
  }
  
  // Calculate answer but don't return it
  let answer;
  if (operation === '+') {
    answer = num1 + num2;
  } else if (operation === '-') {
    answer = num1 - num2;
  } else {
    answer = num1 * num2;
  }
  
  return { 
    challenge: { num1, num2, operation }, 
    answer 
  };
}

/**
 * Generate an image challenge
 * @returns {object} Challenge object with category and image grid (without correct indices)
 */
function generateImageChallenge() {
  const categories = [
    { name: 'traffic_lights', label: 'traffic lights' },
    { name: 'crosswalks', label: 'crosswalks' },
    { name: 'bicycles', label: 'bicycles' },
    { name: 'cars', label: 'cars' },
    { name: 'buses', label: 'buses' }
  ];
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  // Generate 9 images (3x3 grid)
  // In production, these would be actual image URLs from a database
  // For now, we'll use placeholders and randomly select correct indices
  const totalImages = 9;
  const correctCount = Math.floor(Math.random() * 2) + 2; // 2-3 correct images
  const correctIndices = [];
  
  while (correctIndices.length < correctCount) {
    const idx = Math.floor(Math.random() * totalImages);
    if (!correctIndices.includes(idx)) {
      correctIndices.push(idx);
    }
  }
  
  // Generate placeholder image URLs
  const images = Array.from({ length: totalImages }, (_, i) => ({
    id: i,
    url: `https://via.placeholder.com/150?text=Image${i + 1}`,
    isCorrect: correctIndices.includes(i)
  }));
  
  return {
    challenge: {
      category: category.label,
      images: images.map(img => ({ id: img.id, url: img.url })) // Don't expose isCorrect
    },
    answer: correctIndices.sort((a, b) => a - b)
  };
}

/**
 * Generate a slider challenge
 * @returns {object} Challenge object with slider configuration (without target position)
 */
function generateSliderChallenge() {
  // Generate a random target position between 20 and 80
  const targetPosition = Math.floor(Math.random() * 60) + 20;
  
  return {
    challenge: {
      instruction: 'Slide to the correct position',
      minValue: 0,
      maxValue: 100
    },
    answer: targetPosition
  };
}

/**
 * Generate a pattern challenge
 * @returns {object} Challenge object with grid size and pattern length (without pattern)
 */
function generatePatternChallenge() {
  const gridSize = 9; // 3x3 grid
  const patternLength = Math.floor(Math.random() * 2) + 4; // 4-5 cells
  const pattern = [];
  
  while (pattern.length < patternLength) {
    const idx = Math.floor(Math.random() * gridSize);
    if (!pattern.includes(idx)) {
      pattern.push(idx);
    }
  }
  
  return {
    challenge: {
      gridSize,
      patternLength,
      instruction: 'Remember and repeat the pattern'
    },
    answer: pattern
  };
}

/**
 * Create a challenge and store its answer in the session
 * @param {string} sessionToken - The session token
 * @param {string} captchaType - Type of captcha: 'math', 'image', 'slider', 'pattern'
 * @param {object} options - Additional options (e.g., difficulty level)
 * @returns {object} Challenge data (without answer)
 */
async function generateChallenge(sessionToken, captchaType, options = {}) {
  // Get session
  let session = null;
  
  if (isRedisAvailable()) {
    try {
      session = await sessionOps.getSession(sessionToken);
    } catch (error) {
      logger.error('Failed to get session from Redis', error);
    }
  }
  
  if (!session) {
    session = sessionStore.get(sessionToken);
  }
  
  if (!session) {
    throw new Error('Invalid or expired session');
  }
  
  // Generate challenge based on type
  let challengeData;
  
  switch (captchaType) {
    case 'math':
      challengeData = generateMathChallenge(options.difficulty || 0);
      break;
    case 'image':
      challengeData = generateImageChallenge();
      break;
    case 'slider':
      challengeData = generateSliderChallenge();
      break;
    case 'pattern':
      challengeData = generatePatternChallenge();
      break;
    default:
      throw new Error('Invalid captcha type');
  }
  
  // Store the answer in the session
  session.captchaType = captchaType;
  session.answer = challengeData.answer;
  session.challengeGeneratedAt = Date.now();
  
  // Update session
  await updateSession(sessionToken, session);
  
  logger.debug('Challenge generated', { 
    type: captchaType, 
    token: sessionToken.substring(0, 8) 
  });
  
  // Return only the challenge (not the answer)
  return {
    type: captchaType,
    challenge: challengeData.challenge
  };
}

/**
 * Verify math captcha answer
 */
function verifyMathCaptcha(sessionToken, userAnswer, expectedAnswer, timeTaken, ip) {
  // Normalize answers for comparison
  const normalizedUser = String(userAnswer).trim().toUpperCase();
  const normalizedExpected = String(expectedAnswer).trim().toUpperCase();
  
  return normalizedUser === normalizedExpected;
}

/**
 * Verify image captcha answer
 * @param {Array} userSelection - Array of selected image indices (e.g., [0, 2, 5])
 * @param {Array} correctIndices - Array of correct image indices
 */
function verifyImageCaptcha(sessionToken, userSelection, correctIndices, timeTaken, ip) {
  if (!Array.isArray(userSelection) || !Array.isArray(correctIndices)) {
    return false;
  }
  
  // Sort both arrays for comparison
  const sortedUser = [...userSelection].sort((a, b) => a - b);
  const sortedCorrect = [...correctIndices].sort((a, b) => a - b);
  
  // Check if arrays have same length and same values
  if (sortedUser.length !== sortedCorrect.length) {
    return false;
  }
  
  return sortedUser.every((val, idx) => val === sortedCorrect[idx]);
}

/**
 * Verify slider captcha answer
 * @param {number} userPosition - User's slider position (0-100)
 * @param {number} targetPosition - Target position (0-100)
 * @param {number} tolerance - Acceptable tolerance (default 5%)
 */
function verifySliderCaptcha(sessionToken, userPosition, targetPosition, timeTaken, ip, tolerance = 5) {
  const position = parseFloat(userPosition);
  const target = parseFloat(targetPosition);
  
  if (isNaN(position) || isNaN(target)) {
    return false;
  }
  
  // Check if position is within tolerance
  const difference = Math.abs(position - target);
  return difference <= tolerance;
}

/**
 * Verify pattern captcha answer
 * @param {Array} userPattern - Array of user's pattern indices (e.g., [0, 4, 8])
 * @param {Array} correctPattern - Array of correct pattern indices
 */
function verifyPatternCaptcha(sessionToken, userPattern, correctPattern, timeTaken, ip) {
  if (!Array.isArray(userPattern) || !Array.isArray(correctPattern)) {
    return false;
  }
  
  // Check if arrays have same length
  if (userPattern.length !== correctPattern.length) {
    return false;
  }
  
  // Check if patterns match exactly (order matters)
  return userPattern.every((val, idx) => val === correctPattern[idx]);
}

/**
 * Unified captcha verification with session management
 * SECURE: Gets expected answer from session, not from client
 * @param {string} captchaType - Type of captcha: 'math', 'image', 'slider', 'pattern'
 */
async function verifyCaptcha(sessionToken, captchaType, userAnswer, timeTaken, ip, options = {}) {
  // Check rate limit
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      verified: false,
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
    };
  }
  
  // Get session (try Redis first, fallback to in-memory)
  let session = null;
  
  if (isRedisAvailable()) {
    try {
      session = await sessionOps.getSession(sessionToken);
    } catch (error) {
      logger.error('Failed to get session from Redis', error);
    }
  }
  
  if (!session) {
    // Fallback to in-memory
    session = sessionStore.get(sessionToken);
  }
  
  // Validate session token
  if (!session) {
    return {
      verified: false,
      error: 'Invalid or expired session'
    };
  }
  
  // Validate that a challenge was generated for this session
  if (!session.answer || !session.captchaType) {
    return {
      verified: false,
      error: 'No challenge found for this session'
    };
  }
  
  // Validate captcha type matches
  if (session.captchaType !== captchaType) {
    return {
      verified: false,
      error: 'Captcha type mismatch'
    };
  }
  
  // Get expected answer from session (SECURE - not from client)
  const expectedAnswer = session.answer;
  
  // Check session age
  const sessionAge = Date.now() - session.createdAt;
  if (sessionAge > SESSION_CONFIG.maxAge) {
    // Delete expired session
    if (isRedisAvailable()) {
      try {
        await sessionOps.deleteSession(sessionToken);
      } catch (error) {
        logger.error('Failed to delete session from Redis', error);
      }
    }
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
  
  // Validate timing (anti-bot check) - minimum 1 second for math, 2 seconds for others
  const minTime = captchaType === 'math' ? 1 : 2;
  if (timeTaken < minTime) {
    session.attempts++;
    
    if (session.attempts >= SESSION_CONFIG.maxAttempts) {
      session.locked = true;
      session.lockUntil = Date.now() + SESSION_CONFIG.lockoutDuration;
    }
    
    // Update session
    await updateSession(sessionToken, session);
    
    return {
      verified: false,
      error: 'Suspicious activity detected',
      attempts: session.attempts,
      maxAttempts: SESSION_CONFIG.maxAttempts
    };
  }
  
  // Verify based on captcha type
  let isCorrect = false;
  
  switch (captchaType) {
    case 'math':
      isCorrect = verifyMathCaptcha(sessionToken, userAnswer, expectedAnswer, timeTaken, ip);
      break;
    case 'image':
      isCorrect = verifyImageCaptcha(sessionToken, userAnswer, expectedAnswer, timeTaken, ip);
      break;
    case 'slider':
      isCorrect = verifySliderCaptcha(sessionToken, userAnswer, expectedAnswer, timeTaken, ip, options.tolerance);
      break;
    case 'pattern':
      isCorrect = verifyPatternCaptcha(sessionToken, userAnswer, expectedAnswer, timeTaken, ip);
      break;
    default:
      return {
        verified: false,
        error: 'Invalid captcha type'
      };
  }
  
  if (isCorrect) {
    // Success - clear session and generate verification token
    if (isRedisAvailable()) {
      try {
        await sessionOps.deleteSession(sessionToken);
      } catch (error) {
        logger.error('Failed to delete session from Redis', error);
      }
    }
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
    
    // Update session
    await updateSession(sessionToken, session);
    
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
 * Update session in Redis or in-memory store
 */
async function updateSession(sessionToken, session) {
  if (isRedisAvailable()) {
    try {
      await sessionOps.updateSession(sessionToken, session, SESSION_CONFIG.maxAge / 1000);
      return;
    } catch (error) {
      logger.error('Failed to update session in Redis', error);
    }
  }
  
  // Fallback to in-memory
  sessionStore.set(sessionToken, session);
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
      logger.warn('Verification token expired', { tokenAge, ip });
      return { valid: false, error: 'Token expired' };
    }
    
    // Verify IP hash matches (optional - for extra security)
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    if (payload.ip !== ipHash) {
      logger.warn('IP mismatch for verification token', { ip });
      // Don't fail on IP mismatch (IP can change), just log it
    }
    
    logger.debug('Verification token validated', { ip });
    return { valid: true, payload };
  } catch (error) {
    logger.error('Invalid verification token format', error);
    return { valid: false, error: 'Invalid token format' };
  }
}

/**
 * Get session statistics (for monitoring)
 */
function getStats() {
  const usingRedis = isRedisAvailable();
  
  return {
    storage: usingRedis ? 'redis' : 'in-memory',
    activeSessions: usingRedis ? 'N/A (stored in Redis)' : sessionStore.size,
    rateLimitEntries: usingRedis ? 'N/A (stored in Redis)' : rateLimitStore.size,
    redisAvailable: usingRedis,
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
  generateChallenge,
  verifyCaptcha,
  verifyMathCaptcha,
  verifyImageCaptcha,
  verifySliderCaptcha,
  verifyPatternCaptcha,
  validateVerificationToken,
  getStats,
  generateSessionToken
};
