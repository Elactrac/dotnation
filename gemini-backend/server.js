require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini (Free tier available!)
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
  console.warn('⚠️  GEMINI_API_KEY is not set. AI features will not work until you add a real API key.');
  console.log('Get your FREE API key from: https://aistudio.google.com/app/apikey');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});

// API Endpoint for Description Generation
app.post('/api/generate-description', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required.' });
    }

    console.log('Generating description for title:', title);

    // Check if API key is properly configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Return mock response for testing
      const mockDescriptions = {
        'Decentralized Education Platform': `**Revolutionizing Education Through Blockchain**

In today's rapidly evolving world, access to quality education remains a significant barrier for millions. Traditional education systems are often rigid, expensive, and inaccessible to those in remote or underserved communities. Our Decentralized Education Platform addresses this critical challenge by leveraging blockchain technology to create an inclusive, transparent, and accessible learning ecosystem.

**The Solution: Blockchain-Powered Learning**

Our platform utilizes smart contracts to create verifiable digital credentials, enabling learners to build portable educational portfolios. Through decentralized storage, educational content becomes censorship-resistant and globally accessible. Our innovative token economy incentivizes both educators and learners, creating a sustainable ecosystem where quality education can thrive.

**Join the Educational Revolution**

By supporting this campaign, you're not just funding a platform – you're investing in the future of global education. Together, we can break down barriers and democratize access to knowledge for everyone, everywhere.`,
        'Green Energy Initiative': `**Powering Tomorrow with Clean Energy**

Climate change threatens our planet, yet fossil fuel dependency continues to drive environmental degradation. Communities worldwide struggle with rising energy costs and unreliable power sources. Our Green Energy Initiative tackles these challenges head-on through innovative renewable energy solutions.

**Sustainable Solutions for All**

We're developing community-owned solar microgrids that provide affordable, reliable electricity to underserved areas. Our blockchain-based platform enables transparent tracking of energy production and consumption, ensuring fair distribution of benefits. Through smart contracts, we create automated systems for energy trading and carbon credit management.

**Be Part of the Clean Energy Future**

Your contribution will help build resilient energy systems that combat climate change while creating economic opportunities. Join us in creating a sustainable world where clean energy is accessible to all.`,
        'default': `**${title}**

This innovative project addresses a critical need in our society by leveraging cutting-edge technology to create meaningful change. Our solution combines blockchain transparency with practical implementation to deliver real-world impact.

**The Challenge We're Solving**

Many communities face significant barriers that prevent them from achieving their full potential. Traditional approaches often fall short due to lack of transparency, accessibility, or scalability.

**Our Revolutionary Approach**

By utilizing decentralized technology, we create a system that is transparent, inclusive, and sustainable. Our platform empowers users with tools and resources they need to succeed.

**Your Support Makes the Difference**

Join us in building a better future. Your contribution will help bring this vision to life and create lasting positive change in our community.`
      };

      const description = mockDescriptions[title] || mockDescriptions['default'];
      console.log('Returning mock description (no API key configured)');
      return res.json({ description });
    }

    const prompt = `Generate a compelling and detailed crowdfunding campaign description for a project titled "${title}". Structure it with a clear introduction, a section explaining the problem, a section detailing the solution, and a call to action. The tone should be optimistic and inspiring. Keep it under 500 words.`;

    console.log('Sending prompt to Gemini:', prompt.substring(0, 100) + '...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Generated description successfully, length:', text.length);

    res.json({ description: text });

  } catch (error) {
    console.error('Error generating content:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to generate content from AI.', details: error.message });
  }
});

// API Endpoint for Summarization
app.post('/api/summarize', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required for summarization.' });
    }

    // Check if API key is properly configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Return mock summary for testing
      const mockSummary = description.length > 200
        ? `${description.substring(0, 150)}... This innovative campaign aims to solve real-world problems through blockchain technology, creating sustainable solutions for community challenges.`
        : `${description} This project leverages decentralized technology to create transparent, accessible solutions for pressing community needs.`;

      console.log('Returning mock summary (no API key configured)');
      return res.json({ summary: mockSummary });
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

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gemini backend is running' });
});

app.listen(port, () => {
  console.log(`Gemini backend server listening on port ${port}`);
  console.log(`Server started successfully at http://localhost:${port}`);
});