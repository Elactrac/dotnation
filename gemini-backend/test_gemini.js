const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyB8D-ifMbxXuSBeueT7672UlgAXvv0wcHU');

async function test() {
  try {
    console.log('Testing gemini-2.5-flash model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Write a short campaign description for helping children get clean water');
    const response = await result.response;
    const text = response.text();
    console.log('SUCCESS! Generated text length:', text.length);
    console.log('First 200 chars:', text.substring(0, 200));
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Full error:', error);
  }
}

test();
