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
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in the .env file');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// API Endpoint for Description Generation
app.post('/api/generate-description', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required.' });
    }

    const prompt = `Generate a compelling and detailed crowdfunding campaign description for a project titled "${title}". Structure it with a clear introduction, a section explaining the problem, a section detailing the solution, and a call to action. The tone should be optimistic and inspiring.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ description: text });

  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content from AI.' });
  }
});

// API Endpoint for Summarization
app.post('/api/summarize', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required for summarization.' });
    }

    const prompt = `Summarize the following campaign description into a single, concise paragraph (around 50-70 words). Capture the core problem, the proposed solution, and the ultimate goal. Here is the description:

---
${description}
---`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ summary: text });

  } catch (error) {
    console.error('Error summarizing content:', error);
    res.status(500).json({ error: 'Failed to summarize content.' });
  }
});


app.listen(port, () => {
  console.log(`Gemini backend server listening on port ${port}`);
});