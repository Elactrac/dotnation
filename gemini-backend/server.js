/**
 * @file Express server for the Gemini AI backend.
 * Provides endpoints for generating campaign descriptions, summaries, and contract summaries.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const captchaVerification = require('./captchaVerification');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
  console.warn('⚠️  GEMINI_API_KEY is not set. AI features will not work until you add a real API key.');
  console.log('Get your FREE API key from: https://aistudio.google.com/app/apikey');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
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
app.post('/api/generate-description', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required.' });
    }

    console.log('Generating description for title:', title);

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      const mockDescriptions = {
        'Decentralized Education Platform': `**Revolutionizing Education Through Blockchain**...`,
        'Green Energy Initiative': `**Powering Tomorrow with Clean Energy**...`,
        'default': `**${title}**...`
      };
      const description = mockDescriptions[title] || mockDescriptions['default'];
      return res.json({ description });
    }

    const prompt = `Generate a compelling and detailed crowdfunding campaign description for a project titled "${title}".`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ description: text });

  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content from AI.', details: error.message });
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
app.post('/api/summarize', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required for summarization.' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      const mockSummary = description.length > 200
        ? `${description.substring(0, 150)}...`
        : description;
      return res.json({ summary: mockSummary });
    }

    const prompt = `Summarize the following campaign description into a single, concise paragraph: \n\n${description}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ summary: text });

  } catch (error) {
    console.error('Error summarizing content:', error);
    res.status(500).json({ error: 'Failed to summarize content.' });
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
app.post('/api/contract-summary', async (req, res) => {
  try {
    const { title, description, goal, deadline, beneficiary } = req.body;

    if (!title || !description || !goal || !deadline || !beneficiary) {
      return res.status(400).json({ error: 'All campaign details are required for contract summary.' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      const mockSummary = `**Campaign Contract Summary**\n\n**Project:** ${title}\n**Funding Goal:** ${goal} DOT...`;
      return res.json({ summary: mockSummary });
    }

    const prompt = `Generate a clear, concise summary of a crowdfunding campaign contract based on the following details...`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ summary: text });

  } catch (error) {
    console.error('Error generating contract summary:', error);
    res.status(500).json({ error: 'Failed to generate contract summary.' });
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
app.post('/api/captcha/session', (req, res) => {
  try {
    const ip = getClientIP(req);
    const sessionToken = captchaVerification.createSession(ip);
    
    console.log('[Captcha] New session created:', { ip, token: sessionToken.substring(0, 8) + '...' });
    
    res.json({
      success: true,
      sessionToken,
      expiresIn: 300 // 5 minutes in seconds
    });
  } catch (error) {
    console.error('[Captcha] Error creating session:', error);
    res.status(500).json({ error: 'Failed to create captcha session' });
  }
});

/**
 * @route POST /api/captcha/verify
 * @group Captcha - Captcha verification system
 * @param {string} sessionToken.body.required - The session token.
 * @param {string} captchaType.body.required - The type of captcha (math, image, slider, pattern).
 * @param {any} userAnswer.body.required - The user's answer.
 * @param {any} expectedAnswer.body.required - The expected answer.
 * @param {number} timeTaken.body.required - Time taken to solve in seconds.
 * @param {object} options.body - Additional options (e.g., tolerance for slider).
 * @returns {object} 200 - Verification result.
 * @returns {Error}  400 - Missing required fields.
 * @returns {Error}  500 - Verification failed.
 */
app.post('/api/captcha/verify', (req, res) => {
  try {
    const { sessionToken, captchaType, userAnswer, expectedAnswer, timeTaken, options } = req.body;
    
    // Validate required fields
    if (!sessionToken || !captchaType || userAnswer === undefined || expectedAnswer === undefined || timeTaken === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['sessionToken', 'captchaType', 'userAnswer', 'expectedAnswer', 'timeTaken']
      });
    }
    
    // Validate captcha type
    const validTypes = ['math', 'image', 'slider', 'pattern'];
    if (!validTypes.includes(captchaType)) {
      return res.status(400).json({
        error: 'Invalid captcha type',
        validTypes
      });
    }
    
    const ip = getClientIP(req);
    
    console.log('[Captcha] Verification attempt:', {
      type: captchaType,
      ip,
      timeTaken,
      token: sessionToken.substring(0, 8) + '...'
    });
    
    const result = captchaVerification.verifyCaptcha(
      sessionToken,
      captchaType,
      userAnswer,
      expectedAnswer,
      timeTaken,
      ip,
      options || {}
    );
    
    if (result.verified) {
      console.log('[Captcha] Verification successful:', {
        type: captchaType,
        ip,
        token: result.token.substring(0, 16) + '...'
      });
    } else {
      console.log('[Captcha] Verification failed:', {
        type: captchaType,
        ip,
        error: result.error,
        attempts: result.attempts
      });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('[Captcha] Error during verification:', error);
    res.status(500).json({
      error: 'Verification failed',
      details: error.message
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
app.post('/api/captcha/validate-token', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const ip = getClientIP(req);
    const result = captchaVerification.validateVerificationToken(token, ip);
    
    if (result.valid) {
      console.log('[Captcha] Token validated successfully');
    } else {
      console.log('[Captcha] Token validation failed:', result.error);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('[Captcha] Error validating token:', error);
    res.status(500).json({
      error: 'Token validation failed',
      details: error.message
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
    console.error('[Captcha] Error retrieving stats:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

/**
 * @route GET /health
 * @group Server - Server health check
 * @returns {object} 200 - An object indicating the server is running.
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gemini backend is running' });
});

app.listen(port, () => {
  console.log(`Gemini backend server listening on port ${port}`);
  console.log(`Server started successfully at http://localhost:${port}`);
});
