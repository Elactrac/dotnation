/**
 * @file Express server for the Gemini AI backend.
 * Provides endpoints for generating campaign descriptions, summaries, and contract summaries.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
 * @route POST /api/generate-description
 * @group AI - AI-powered content generation
 * @param {string} title.body.required - The title of the campaign.
 * @returns {object} 200 - An object containing the generated description.
 * @returns {Error}  400 - Project title is required.
 * @returns {Error}  500 - Failed to generate content from AI.
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
