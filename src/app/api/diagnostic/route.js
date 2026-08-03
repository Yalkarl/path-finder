import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export const runtime = 'edge';

export async function GET() {
  try {
    const key = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : null;

    if (!key) {
      return NextResponse.json({ 
        status: "error", 
        message: "GEMINI_API_KEY is not defined in process.env",
        availableEnvKeys: typeof process !== 'undefined' && process.env ? Object.keys(process.env) : []
      });
    }
    
    const length = key.length;
    const prefix = key.substring(0, 10);
    const suffix = key.substring(Math.max(0, key.length - 4));
    
    // Test generating a quick response using the custom gemini library (REST API)
    const model = getGeminiModel('gemini-3.1-flash-lite');
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: "Say 'Diagnostic test success' only." }] }]
    });
    const responseText = result.response.text();
    
    return NextResponse.json({ 
      status: "success", 
      message: "API key is loaded and working!", 
      keyDetails: { length, prefix, suffix },
      testResponse: responseText.trim()
    });
  } catch (err) {
    return NextResponse.json({ 
      status: "error", 
      message: err.message || String(err),
      stack: err.stack ? err.stack.split("\n").slice(0, 3) : []
    });
  }
}

