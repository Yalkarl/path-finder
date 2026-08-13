import { getGeminiModel } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const {
      responses,          // Array of assessment responses (including option 5 open-ended text)
      academics,          // GPAX object { math, science, thai, english, social }
      portfolio,          // Array of portfolio items
      customActivities,   // Array of custom activities
      targetPath,         // Target path ID if in Target Lock Mode
      analysisMode,       // 'discovery' or 'target-lock'
      educationLevel,     // 'junior' or 'senior'
      likes,              // Array of student likes / interests
      dislikes            // Array of student dislikes / non-interests
    } = await req.json();

    const isTargetLock = analysisMode === 'target-lock';
    const effectiveLikes = isTargetLock ? [] : (likes || []);
    const effectiveDislikes = isTargetLock ? [] : (dislikes || []);

    const model = getGeminiModel('gemini-3.1-flash-lite');

    const prompt = `
คุณคือผู้เชี่ยวชาญด้านจิตวิทยาการประเมินสมรรถนะ (Psychometrics) และนักแนะแนวการศึกษาต่อระดับอุดมศึกษา
โปรดวิเคราะห์ข้อมูลการทำแบบทดสอบสถานการณ์จำลอง (SJT), เกรดเฉลี่ยสะสมรายวิชา (GPAX 4-5 เทอม) และพอร์ตผลงานของนักเรียนต่อไปนี้แบบองค์รวม (Holistic Evaluation):

[ข้อมูลเกรดสะสม GPAX (สเกล 0.00 - 4.00)]
- คณิตศาสตร์: ${academics?.math || 0}
- วิทยาศาสตร์ฯ: ${academics?.science || 0}
- ภาษาไทย: ${academics?.thai || 0}
- ภาษาอังกฤษ: ${academics?.english || 0}
- สังคมศึกษาฯ: ${academics?.social || 0}

[โหมดการวิเคราะห์]: ${isTargetLock ? `Target Lock Mode (เป้าหมาย: ${targetPath || 'ไม่ระบุ'} - ประเมินจากเกรด ความถนัด และผลงานพอร์ตโฟลิโอโดยตรง ไม่นำสิ่งชอบ/ไม่ชอบมาถ่วงน้ำหนัก)` : 'Discovery Mode (ค้นหาตัวตนอิสระ)'}
[ระดับชั้น]: ${educationLevel === 'junior' ? 'มัธยมศึกษาตอนต้น (ม.1-ม.3)' : 'มัธยมศึกษาตอนปลาย (ม.4-ม.6)'}

${isTargetLock ? '[สิ่งชอบ/ไม่ชอบ]: ในโหมด Target Lock ไม่นำความชอบส่วนตัวมาคำนวณ ให้ประเมินจากเกรด ทักษะ SJT และผลงานตรงสายเท่านั้น' : `[สิ่งชอบ / ความสนใจหลักของนักเรียน]: ${JSON.stringify(effectiveLikes)}\n[สิ่งที่ไม่ชอบของนักเรียน]: ${JSON.stringify(effectiveDislikes)}`}

[รายการผลงาน/กิจกรรมในพอร์ต]: ${JSON.stringify([...(portfolio || []), ...(customActivities || [])])}

[ประวัติการตอบข้อสอบ SJT (รวมคำตอบอิสระข้อ 5 ถ้ามี)]:
${JSON.stringify(responses || [])}

ข้อระวังและการประเมินพอร์ตโฟลิโอพิเศษสำหรับการวิเคราะห์:
- การประเมินพอร์ตโฟลิโอ: วิเคราะห์ระดับความตรงสาย ความยิ่งใหญ่ และคุณค่าของรายการผลงานใน [รายการผลงาน/กิจกรรมในพอร์ต] (เช่น สอวน., รางวัลระดับชาติ, โครงงานวิจัย, ค่ายวิชาการ, จิตอาสา) หากมีผลงานตรงสายระดับสูง ให้ช่วยปรับเพิ่มค่าน้ำหนักมิติทักษะที่เกี่ยวข้องของนักเรียนขึ้นอย่างเหมาะสม
- หากนักเรียนมีสิ่งที่ไม่ชอบ (เช่น ไม่ชอบเลือด, ไม่ชอบการท่องจำหนักๆ, ไม่ชอบคำนวณซ้ำซาก ฯลฯ) ให้ระวังอย่าปรับเพิ่มค่าน้ำหนักหรือเชียร์สาขาที่มีกิจกรรมเหล่านั้นเป็นหลัก!
- หากนักเรียนมีสิ่งชอบ/ความสนใจเด่นชัด (เช่น ชอบ AI, เขียนโปรแกรม, การวางแผน, ศิลปะ ฯลฯ) ให้ช่วยส่งเสริมและปรับค่าน้ำหนักมิติทักษะที่เกี่ยวข้องให้สะสมสะท้อนตัวตนจริงของนักเรียน!
- หากพบว่าใน customText มีการพิมพ์คำหยาบคายรุนแรง (เช่น ควย, เหี้ย, fuck ฯลฯ), การพิมพ์ข้อความสั้นไร้สาระแบบโดดๆ (เช่น พิมพ์แค่ "ค้าบเธอ", "5555", "อิอิ", "ไม่รู้"), การพิมพ์ตัวอักษรมั่ว ไร้ความหมาย (เช่น "asdasfda", "fdgfdg", "12345"), หรือการพิมพ์ข้อความเดิมซ้ำกันทุกข้อ ให้ถือเป็นการตอบเดามั่ว/กวนระบบ!
- คำแนะนำเรื่องค่าน้ำหนัก skillVector (สเกล 0.00 ถึง 1.00): ประเมินระดับสมรรถนะสะสมในปัจจุบันของนักเรียนในทั้ง 5 มิติทักษะอย่างต่อเนื่องและมีเสถียรภาพ ห้ามลดคะแนนลงอย่างรุนแรงวูบวาบเพียงเพราะตอบด่านเพิ่มขึ้น ให้สะสมและรักษาระดับความสามารถที่แท้จริงของนักเรียนไว้อย่างสม่ำเสมอ
- หากเกิดกรณีพิมพ์คำหยาบ ข้อความมั่ว หรือพิมพ์แค่คำคุยเล่นโดดๆ โดยไม่มีเนื้อหา ให้ปรับ inconsistencyDetected = true, ลด confidenceScore ลงเหลือต่ำกว่า 15, ระบุ inconsistencyReason ว่า "พบการตอบข้อความเล่น/ข้อความไร้สาระโดยไม่มีเนื้อหาแก้ปัญหา ซึ่งไม่สามารถนำมาวิเคราะห์สมรรถนะได้" และห้ามเพิ่มค่าน้ำหนักทักษะให้เด็ดขาด!

โปรดวิเคราะห์ข้อมูลทั้งหมดอย่างลึกซึ้งและคืนผลลัพธ์เป็น JSON รูปแบบนี้เท่านั้น (ห้ามใส่โค้ดบล็อกหรือข้อความอื่นนอกเหนือจาก JSON):
{
  "skillVector": [0.0, 0.0, 0.0, 0.0, 0.0], // ค่าน้ำหนัก 5 มิติทักษะ [ตรรกะ, วิทยาศาสตร์, ภาษา, ศิลปะ, การบริหาร] เป็นทศนิยม 0.00 ถึง 1.00 โดยประเมินรวมทั้งเกรด ข้อสอบ SJT และคุณภาพผลงานพอร์ตโฟลิโอ
  "hybridProfile": "ชื่อโปรไฟล์ภาษาไทยแล้วใส่วงเล็บภาษาอังกฤษด้านหลัง เช่น นักวิเคราะห์กลยุทธ์อิสระ (Autonomous Strategic Analyst), นักคิดนวัตกรรมเชิงวิเคราะห์ (Analytical Innovator), นักแก้ปัญหาเชิงระบบ (Systems Problem Solver)",
  "hybridProfileDesc": "คำอธิบายโปรไฟล์ไฮบริดเฉพาะบุคคลภาษาไทยสั้นๆ 1-2 ประโยค",
  "inconsistencyDetected": false, // true หากพบว่าตอบขัดแย้งกันเองระหว่างข้อ หรือตอบเดามั่ว/พิมพ์ข้อความมั่ว
  "inconsistencyReason": "เหตุผลสั้นๆ หากพบความขัดแย้ง (ถ้าไม่มีให้ใส่ข้อความว่าง)",
  "confidenceScore": 95, // คะแนนความน่าเชื่อถือของผลประเมิน (0-100)
  "qualitativeInsights": [
    "บทวิเคราะห์จุดแข็งหลักจากทักษะและผลงานพอร์ตโฟลิโอ 1 ประโยค",
    "บทวิเคราะห์จุดที่ควรเสริมหรือช่องว่างในพอร์ตโฟลิโอ 1 ประโยค"
  ],
  "actionableAdvice": [
    "ข้อแนะนำแผนสะสมผลงาน/เกียรติบัตรตรงสายเพื่อเติมเต็มพอร์ตยื่น TCAS รอบ 1",
    "ข้อแนะนำกิจกรรมหรือคอร์สเรียนวิชาเฉพาะที่ควรทำเพิ่ม"
  ]
}
`;

    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const jsonText = res.response.text();
    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonText);
    } catch (e) {
      // Clean up markdown formatting if present
      const cleaned = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    return NextResponse.json({
      success: true,
      evaluation: parsedResult
    });

  } catch (error) {
    console.error('Error in AI evaluation endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'AI evaluation failed'
    }, { status: 500 });
  }
}
