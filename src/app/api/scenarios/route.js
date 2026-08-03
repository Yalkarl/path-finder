import { getGeminiModel } from '@/lib/gemini';
import { NextResponse } from 'next/server';
import { FALLBACK_SCENARIOS } from '@/lib/constants/scenarios';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const { educationLevel } = await req.json();
    
    // We try to generate dynamic scenarios using Gemini.
    // If it fails or takes too long, we can fall back to the static ones.
    
    const prompt = `
    คุณคือผู้เชี่ยวชาญด้านการแนะแนวการศึกษา (Holland's Theory)
    กรุณาสร้างสถานการณ์จำลอง (Scenario) จำนวน 5 ข้อ สำหรับนักเรียนระดับชั้น ${educationLevel === 'junior' ? 'มัธยมศึกษาตอนต้น' : 'มัธยมศึกษาตอนปลาย'}
    เพื่อประเมินทักษะความถนัด 5 ด้าน ได้แก่: logic, science, language, art, management

    ข้อกำหนด:
    1. เหตุการณ์ต้องเกี่ยวข้องกับชีวิตประจำวันหรือโรงเรียนที่สนุกและน่าสนใจ ไม่น่าเบื่อ
    2. แต่ละสถานการณ์ ต้องมี 4 ตัวเลือก (ก, ข, ค, ง)
    3. แต่ละตัวเลือกต้องระบุค่าน้ำหนัก (weights) ของทักษะที่เกี่ยวข้อง โดยมีค่ารวมไม่เกิน 1.0 ต่อตัวเลือก
    4. ต้องตอบกลับมาในรูปแบบ JSON Array เท่านั้น โดยมีโครงสร้างดังนี้:
    [
      {
        "id": 1,
        "title": "ชื่อเหตุการณ์",
        "description": "รายละเอียดเหตุการณ์...",
        "options": [
          { "text": "ก. ตัวเลือกที่ 1", "weights": { "logic": 0.5, "management": 0.5 } },
          // ตัวเลือกอื่นๆ
        ]
      }
    ]
    `;

    const model = getGeminiModel('gemini-3.1-flash-lite');
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = result.response.text();
    const scenarios = JSON.parse(responseText);

    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error('Error generating scenarios:', error);
    // Fallback to static scenarios on error
    return NextResponse.json({ scenarios: FALLBACK_SCENARIOS }, { status: 200 }); // Status 200 to keep it working seamlessly for the user
  }
}
