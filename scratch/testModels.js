const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not defined in .env.local!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    // List models is not directly exposed on genAI in the same way in some SDK versions,
    // let's try calling the list API endpoint or check if we can test models.
    // In @google/generative-ai, we can try calling a request or listing.
    // Since listModels might require different setup, let's test typical stable model names:
    const modelsToTest = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.5-pro'
    ];
    
    console.log("Testing model access...");
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const res = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
        });
        console.log(`✅ Model '${modelName}' is AVAILABLE!`);
      } catch (err) {
        console.log(`❌ Model '${modelName}' is NOT available. Error: ${err.message}`);
      }
    }
  } catch (error) {
    console.error("General error:", error);
  }
}

run();
