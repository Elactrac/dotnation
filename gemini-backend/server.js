/**
 * @file Express server for the Gemini AI backend.
 * Production-ready server with Redis, logging, validation, and security.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const timeout = require('connect-timeout');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const captchaVerification = require('./captchaVerification');
const { initializeRedis, closeRedis, cacheOps } = require('./redisClient');
const logger = require('./logger');
const { validateMiddleware, sanitizeError } = require('./validation');

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout
app.use(timeout(process.env.REQUEST_TIMEOUT_MS || 30000));

// Rate limiting
// General rate limiter for all endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { 
      ip: req.ip, 
      path: req.path,
      limiter: 'general'
    });
    res.status(429).json({ 
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Strict rate limiter for expensive AI operations
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 AI requests per 15 minutes per IP
  message: 'Too many AI requests from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('AI rate limit exceeded', { 
      ip: req.ip, 
      path: req.path,
      limiter: 'ai'
    });
    res.status(429).json({ 
      error: 'Too many AI requests from this IP. These operations are expensive. Please try again later.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Apply general rate limiter to all routes
app.use(generalLimiter);

// HTTP request logging
app.use(morgan('combined', { stream: logger.stream }));

// API Key Authentication Middleware
// Protects all API routes except /health and /metrics
const requireApiKey = (req, res, next) => {
  // Skip authentication for health and metrics endpoints
  if (req.path === '/health' || req.path === '/metrics') {
    return next();
  }

  // Get API key from header
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.BACKEND_API_KEY;

  // Check if API key authentication is enabled
  if (!expectedApiKey || expectedApiKey === 'your_api_key_here') {
    logger.warn('BACKEND_API_KEY not configured - API authentication disabled!');
    return next();
  }

  // Validate API key
  if (!apiKey) {
    logger.warn('Missing API key', { 
      ip: req.ip, 
      path: req.path,
      method: req.method
    });
    return res.status(401).json({ 
      error: 'Authentication required. Please provide a valid API key in X-API-Key header.' 
    });
  }

  if (apiKey !== expectedApiKey) {
    logger.warn('Invalid API key', { 
      ip: req.ip, 
      path: req.path,
      method: req.method,
      providedKey: apiKey.substring(0, 8) + '...' // Log only first 8 chars for security
    });
    return res.status(403).json({ 
      error: 'Invalid API key. Access denied.' 
    });
  }

  // API key is valid
  logger.debug('API key validated', { 
    ip: req.ip, 
    path: req.path 
  });
  next();
};

// Apply API key authentication to all routes
app.use(requireApiKey);

// Initialize Gemini
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
  logger.warn('GEMINI_API_KEY not set. AI features will not work.');
  logger.info('Get your FREE API key from: https://aistudio.google.com/app/apikey');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});

// Initialize Redis on startup
let redisReady = false;
initializeRedis()
  .then(() => {
    redisReady = true;
    logger.info('✅ Redis connected successfully');
  })
  .catch((error) => {
    logger.error('Failed to connect to Redis:', error);
    logger.warn('⚠️  Server running without Redis - session persistence disabled');
  });

/**
 * Endpoint to generate a compelling campaign description using AI.
 *
 * This endpoint takes a campaign title and uses a generative AI model to create a
 * detailed and persuasive description for a crowdfunding campaign. If the AI service
 * is not configured, it returns a mock description.
 *
 * @route POST /api/generate-description
 * @group AI - AI-powered content generation
 * @param {object} req.body - The request body.
 * @param {string} req.body.title - The title of the campaign.
 * @returns {object} 200 - An object containing the generated description.
 * @returns {object} 400 - An error object if the title is missing.
 * @returns {object} 500 - An error object if the AI fails to generate content.
 */
app.post('/api/generate-description', aiLimiter, validateMiddleware('generateDescription'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { title } = req.body;

    logger.info('Generating description', { title });

    // Check cache first
    if (redisReady) {
      const cacheKey = `description:${title}`;
      const cached = await cacheOps.getCachedResponse(cacheKey);
      
      if (cached) {
        logger.info('Cache hit for description', { title, responseTime: Date.now() - startTime });
        return res.json({ description: cached.description, cached: true });
      }
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      const mockDescriptions = {
        'Decentralized Education Platform': `**Revolutionizing Education Through Blockchain**...`,
        'Green Energy Initiative': `**Powering Tomorrow with Clean Energy**...`,
        'default': `**${title}**...`
      };
      const description = mockDescriptions[title] || mockDescriptions['default'];
      return res.json({ description, mock: true });
    }

    const prompt = `Generate a compelling and detailed crowdfunding campaign description for a project titled "${title}".`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Cache the response
    if (redisReady) {
      const cacheKey = `description:${title}`;
      await cacheOps.setCachedResponse(cacheKey, { description: text });
    }

    const responseTime = Date.now() - startTime;
    logger.logAIUsage('/api/generate-description', prompt, responseTime);

    res.json({ description: text });

  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({ 
      error: 'Failed to generate content from AI.', 
      details: sanitizeError(error) 
    });
  }
});

/**
 * @route POST /api/summarize
 * @group AI - AI-powered content generation
 * @param {string} description.body.required - The campaign description to summarize.
 * @returns {object} 200 - An object containing the generated summary.
 * @returns {Error}  400 - Description is required for summarization.
 * @returns {Error}  500 - Failed to summarize content.
 */
app.post('/api/summarize', aiLimiter, validateMiddleware('summarize'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { description } = req.body;

    logger.info('Summarizing description', { length: description.length });

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      const mockSummary = description.length > 200
        ? `${description.substring(0, 150)}...`
        : description;
      return res.json({ summary: mockSummary, mock: true });
    }

    const prompt = `Summarize the following campaign description into a single, concise paragraph: \n\n${description}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const responseTime = Date.now() - startTime;
    logger.logAIUsage('/api/summarize', prompt, responseTime);

    res.json({ summary: text });

  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({ 
      error: 'Failed to summarize content.', 
      details: sanitizeError(error) 
    });
  }
});

/**
 * @route POST /api/contract-summary
 * @group AI - AI-powered content generation
 * @param {string} title.body.required - The title of the campaign.
 * @param {string} description.body.required - The description of the campaign.
 * @param {number} goal.body.required - The funding goal of the campaign.
 * @param {string} deadline.body.required - The deadline of the campaign.
 * @param {string} beneficiary.body.required - The beneficiary of the campaign.
 * @returns {object} 200 - An object containing the generated contract summary.
 * @returns {Error}  400 - All campaign details are required for contract summary.
 * @returns {Error}  500 - Failed to generate contract summary.
 */
app.post('/api/contract-summary', aiLimiter, validateMiddleware('contractSummary'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { title, description, goal, deadline, beneficiary } = req.body;

    logger.info('Generating contract summary', { title, goal });

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      const mockSummary = `**Campaign Contract Summary**\n\n**Project:** ${title}\n**Funding Goal:** ${goal} DOT...`;
      return res.json({ summary: mockSummary, mock: true });
    }

    const prompt = `Generate a clear, concise summary of a crowdfunding campaign contract based on the following details...`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const responseTime = Date.now() - startTime;
    logger.logAIUsage('/api/contract-summary', prompt, responseTime);

    res.json({ summary: text });

  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({ 
      error: 'Failed to generate contract summary.', 
      details: sanitizeError(error) 
    });
  }
});

/**
 * @route POST /api/fraud-detection
 * @group AI - AI-powered fraud detection
 * @param {object} campaign.body.required - The campaign data to analyze.
 * @returns {object} 200 - An object containing the fraud analysis results.
 * @returns {Error}  400 - Campaign data is required.
 * @returns {Error}  500 - Failed to analyze campaign for fraud.
 */
app.post('/api/fraud-detection', aiLimiter, validateMiddleware('fraudDetection'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { campaign } = req.body;

    logger.info('Analyzing campaign for fraud', { title: campaign.title });

    const fraudDetection = require('./fraudDetection');
    
    const result = await fraudDetection.detectFraud(campaign, {
      apiKey: process.env.GEMINI_API_KEY,
      skipAI: !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here'
    });

    const responseTime = Date.now() - startTime;
    logger.logFraudDetection(campaign, result);

    res.json(result);

  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({ 
      error: 'Failed to analyze campaign for fraud.', 
      details: sanitizeError(error) 
    });
  }
});

/**
 * @route POST /api/generate-title
 * @group AI - AI-powered content generation
 * @param {string} keywords.body - Keywords for the campaign.
 * @param {string} category.body - Campaign category.
 * @returns {object} 200 - An object containing generated title suggestions.
 * @returns {Error}  500 - Failed to generate titles.
 */
app.post('/api/generate-title', aiLimiter, validateMiddleware('generateTitle'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { keywords, category } = req.body;

    logger.info('Generating titles', { keywords, category });

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      const mockTitles = [
        `Revolutionary ${category || 'Project'} Initiative`,
        `Community-Driven ${keywords || 'Innovation'} Platform`,
        `Decentralized ${keywords || 'Solution'} for Everyone`
      ];
      return res.json({ titles: mockTitles, mock: true });
    }

    const prompt = `Generate 5 compelling and unique crowdfunding campaign titles for a ${category || 'general'} project about ${keywords || 'innovation'}. 
    
    Requirements:
    - Each title should be 5-10 words
    - Make them catchy and professional
    - Focus on the impact and benefits
    - Avoid generic buzzwords
    - Be specific and memorable
    
    Return as a JSON array of strings: ["title1", "title2", "title3", "title4", "title5"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    logger.debug('Raw AI response:', { text: text.substring(0, 200) });
    
    // Remove markdown code fences if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const titles = JSON.parse(jsonMatch[0]);
      
      const responseTime = Date.now() - startTime;
      logger.logAIUsage('/api/generate-title', prompt, responseTime);
      
      return res.json({ titles });
    }

    // Fallback
    logger.warn('Failed to extract JSON from AI response', { text });
    res.json({ titles: ['Create a Compelling Campaign Title'] });

  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({ 
      error: 'Failed to generate titles.', 
      details: sanitizeError(error) 
    });
  }
});

/**
 * Helper function to get client IP address
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         '0.0.0.0';
}

/**
 * @route POST /api/captcha/session
 * @group Captcha - Captcha verification system
 * @returns {object} 200 - An object containing the session token.
 * @returns {Error}  500 - Failed to create captcha session.
 */
app.post('/api/captcha/session', async (req, res) => {
  try {
    const ip = getClientIP(req);
    const sessionToken = await captchaVerification.createSession(ip);
    
    logger.logCaptcha('session_created', { 
      ip, 
      token: sessionToken.substring(0, 8) + '...' 
    });
    
    res.json({
      success: true,
      sessionToken,
      expiresIn: 300 // 5 minutes in seconds
    });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({ error: 'Failed to create captcha session' });
  }
});

/**
 * @route POST /api/captcha/challenge
 * @group Captcha - Captcha verification system
 * @param {string} sessionToken.body.required - The session token.
 * @param {string} captchaType.body.required - The type of captcha (math, image, slider, pattern).
 * @param {number} difficulty.body - Difficulty level (0-2).
 * @returns {object} 200 - Challenge data (without answer).
 * @returns {Error}  400 - Missing required fields.
 * @returns {Error}  500 - Failed to generate challenge.
 */
app.post('/api/captcha/challenge', validateMiddleware('captchaChallenge'), async (req, res) => {
  try {
    const { sessionToken, captchaType, difficulty } = req.body;
    
    const ip = getClientIP(req);
    
    logger.logCaptcha('challenge_generated', {
      type: captchaType,
      ip,
      difficulty: difficulty || 0,
      token: sessionToken.substring(0, 8) + '...'
    });
    
    const challenge = await captchaVerification.generateChallenge(
      sessionToken,
      captchaType,
      { difficulty: difficulty || 0 }
    );
    
    res.json({
      success: true,
      ...challenge
    });
    
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      error: 'Failed to generate challenge',
      details: sanitizeError(error)
    });
  }
});

/**
 * @route POST /api/captcha/verify
 * @group Captcha - Captcha verification system
 * @param {string} sessionToken.body.required - The session token.
 * @param {string} captchaType.body.required - The type of captcha (math, image, slider, pattern).
 * @param {any} userAnswer.body.required - The user's answer.
 * @param {number} timeTaken.body.required - Time taken to solve in seconds.
 * @param {object} options.body - Additional options (e.g., tolerance for slider).
 * @returns {object} 200 - Verification result.
 * @returns {Error}  400 - Missing required fields.
 * @returns {Error}  500 - Verification failed.
 */
app.post('/api/captcha/verify', validateMiddleware('captchaVerify'), async (req, res) => {
  try {
    const { sessionToken, captchaType, userAnswer, timeTaken, options } = req.body;
    
    const ip = getClientIP(req);
    
    logger.logCaptcha('verification_attempt', {
      type: captchaType,
      ip,
      timeTaken,
      token: sessionToken.substring(0, 8) + '...'
    });
    
    const result = await captchaVerification.verifyCaptcha(
      sessionToken,
      captchaType,
      userAnswer,
      timeTaken,
      ip,
      options || {}
    );
    
    if (result.verified) {
      logger.logCaptcha('verification_success', {
        type: captchaType,
        ip,
        token: result.token.substring(0, 16) + '...'
      });
    } else {
      logger.logCaptcha('verification_failed', {
        type: captchaType,
        ip,
        error: result.error,
        attempts: result.attempts
      });
    }
    
    res.json(result);
    
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      error: 'Verification failed',
      details: sanitizeError(error)
    });
  }
});

/**
 * @route POST /api/captcha/validate-token
 * @group Captcha - Captcha verification system
 * @param {string} token.body.required - The verification token to validate.
 * @returns {object} 200 - Validation result.
 * @returns {Error}  400 - Token is required.
 * @returns {Error}  500 - Validation failed.
 */
app.post('/api/captcha/validate-token', validateMiddleware('validateToken'), (req, res) => {
  try {
    const { token } = req.body;
    const ip = getClientIP(req);
    const result = captchaVerification.validateVerificationToken(token, ip);
    
    if (result.valid) {
      logger.logCaptcha('token_validated', { ip });
    } else {
      logger.logCaptcha('token_validation_failed', { ip, error: result.error });
    }
    
    res.json(result);
    
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({
      error: 'Token validation failed',
      details: sanitizeError(error)
    });
  }
});

/**
 * @route GET /api/captcha/stats
 * @group Captcha - Captcha verification system
 * @returns {object} 200 - Captcha system statistics.
 */
app.get('/api/captcha/stats', (req, res) => {
  try {
    const stats = captchaVerification.getStats();
    res.json(stats);
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

/**
 * @route GET /health
 * @group Server - Server health check
 * @returns {object} 200 - An object indicating the server is running.
 */
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      redis: redisReady ? 'connected' : 'disconnected',
      gemini: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? 'configured' : 'not_configured',
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
    }
  };

  // Set status code based on critical services
  const statusCode = redisReady ? 200 : 503;
  
  res.status(statusCode).json(health);
});

// Global error handler
app.use((err, req, res, next) => {
  logger.logError(err, req);
  
  res.status(err.status || 500).json({
    error: sanitizeError(err),
    path: req.path,
  });
});

// Start server
const server = app.listen(port, () => {
  logger.info(`✅ Gemini backend server listening on port ${port}`);
  logger.info(`Server started successfully at http://localhost:${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close Redis connection
    try {
      await closeRedis();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis:', error);
    }
    
    logger.info('Graceful shutdown complete');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

