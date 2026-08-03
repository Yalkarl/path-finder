const { getGeminiModel } = require('../src/lib/gemini');

const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Failed to load .env.local:", e);
}

async function runTest() {
  console.log("Starting simple test of getGeminiModel('gemini-flash-latest')...");
  console.log("GEMINI_API_KEY prefix:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) : "MISSING");

  try {
    const model = getGeminiModel('gemini-3.1-flash-lite');
    console.log("1. Testing generateContent...");
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: "Say 'Success' only." }] }]
    });
    console.log("Response text:", result.response.text());

    console.log("\n2. Testing sendMessageStream...");
    const chat = model.startChat({ history: [] });
    const streamResult = await chat.sendMessageStream("Say 'Stream success' only.");
    
    console.log("Chunks:");
    for await (const chunk of streamResult.stream) {
      console.log("- chunk:", chunk.text());
    }
    console.log("Test completed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTest();
