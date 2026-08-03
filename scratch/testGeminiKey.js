const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Native loader for .env.local
let apiKey = null;
try {
  const envContent = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf-8');
  const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
  if (match) {
    apiKey = match[1];
  }
} catch (e) {
  console.error("Could not read .env.local natively:", e);
}

console.log("Loaded API Key preview:", apiKey ? apiKey.substring(0, 15) + "..." : "undefined");

if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not defined or could not be parsed from .env.local!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function run() {
  try {
    const result = await model.generateContent("ทดสอบคำสั้นๆ ตอบคำว่า OK");
    console.log("Response text:", result.response.text());
    console.log("✅ API Key works perfectly!");
  } catch (error) {
    console.error("❌ Gemini API Error details:");
    console.error(error.message);
  }
}

run();
