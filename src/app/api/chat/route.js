import { getGeminiModel } from '@/lib/gemini';
import { NextResponse } from 'next/server';
import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const { messages, userContext } = await req.json();

    let systemInstruction = '';

    if (userContext.analysisMode === 'target-lock' && userContext.targetPath) {
      const pathObj = JUNIOR_PATHS[userContext.targetPath] || SENIOR_PATHS[userContext.targetPath] || { name: userContext.targetPath };
      const targetName = pathObj.name;

      // Combine and format standard portfolio and custom activities for user context
      const allItems = [
        ...(userContext.portfolio || []),
        ...(userContext.customActivities || [])
      ];

      const formattedActivities = allItems.map(item => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        
        // POSN camp formatting
        if (item.posnCamp) {
          const campLabels = {
            camp1: 'ค่าย 1',
            camp2: 'ค่าย 2',
            national: 'ผู้แทนศูนย์ฯ/ค่าย 3',
            team: 'ผู้แทนประเทศไทย'
          };
          const campStr = campLabels[item.posnCamp] || item.posnCamp;
          return `${item.text} (สาขา: ${item.posnSubject || 'ทั่วไป'}, ระดับ: ${campStr})`;
        }

        // Standard/Custom activity formatting
        const levelLabels = {
          international: 'ระดับนานาชาติ',
          national: 'ระดับชาติ',
          regional: 'ระดับภูมิภาค/จังหวัด',
          local: 'ระดับโรงเรียน/ทั่วไป'
        };
        const awardLabels = {
          winner: 'ชนะเลิศ/เหรียญทอง',
          runner_up_1: 'รองชนะเลิศอันดับ 1/เงิน',
          runnerup1: 'รองชนะเลิศอันดับ 1/เงิน',
          runner_up_2: 'รองชนะเลิศอันดับ 2/ทองแดง',
          runnerup2: 'รองชนะเลิศอันดับ 2/ทองแดง',
          honorable: 'ชมเชย',
          none: 'เข้าร่วม'
        };
        const roleLabels = {
          leader: 'แกนนำหลัก/ประธาน',
          co_leader: 'รองประธาน/ผู้ช่วยแกนนำ',
          committee: 'คณะทำงาน/กรรมการ',
          cooperator: 'ผู้ประสานงาน/ช่วยงาน',
          member: 'สมาชิกทั่วไป'
        };

        const isComp = item.categoryId === 'academic' || item.categoryId === 'project';
        const lvlStr = levelLabels[item.level] || item.level || 'ทั่วไป';
        const prestigeStr = isComp 
          ? (awardLabels[item.award] || 'เข้าร่วม')
          : (roleLabels[item.role] || 'สมาชิกทั่วไป');
        
        const countStr = item.count ? `, จำนวน: ${item.count} ครั้ง` : '';
        const descStr = item.desc ? `, รายละเอียด: ${item.desc}` : '';

        return `${item.text} (ระดับ: ${lvlStr}, ผลงาน/บทบาท: ${prestigeStr}${countStr}${descStr})`;
      }).filter(Boolean);

      const JUNIOR_CONTENT_READINESS = [
        'เรียนเก็บเนื้อหาบทเรียน ม.ต้น (ม.1-ม.3) ครบถ้วนแล้ว',
        'เริ่มเรียนเนื้อหาล่วงหน้าของ ม.ปลาย บ้างแล้ว',
        'อยู่ในชั่วโมงตะลุยโจทย์ข้อสอบเก่า / ข้อสอบเข้า ม.4',
        'ผ่านคอร์สติวเข้มข้นเฉพาะสายวิชา (เช่น ติวเข้มคณิต-วิทย์ หรือคอร์สเตรียมโดม)'
      ];
      const JUNIOR_MOCK_EXAMS = [
        'เคยเข้าร่วมการทดสอบ Pre-Test ของโรงเรียนต่าง ๆ (เช่น Pre-Test ม.4 โรงเรียนสตรีพัทลุง หรือโรงเรียนดัง)',
        'เคยแข่งขันทักษะวิชาการระดับ ม.ต้น (เช่น งานศิลปหัตถกรรมนักเรียน)',
        'เคยสอบแข่งขันวัดระดับระดับ ม.ต้น (เช่น สสวท. ม.ต้น, ASMO, TEDET)'
      ];

      const contentReadinessChecked = allItems.filter(item => {
        const text = typeof item === 'string' ? item : item.text;
        return JUNIOR_CONTENT_READINESS.includes(text);
      }).map(item => typeof item === 'string' ? item : item.text);

      const mockExamsChecked = allItems.filter(item => {
        const text = typeof item === 'string' ? item : item.text;
        return JUNIOR_MOCK_EXAMS.includes(text);
      }).map(item => typeof item === 'string' ? item : item.text);

      const portfolioText = formattedActivities.length > 0
        ? '\n- ' + formattedActivities.join('\n- ')
        : 'ยังไม่มีผลงานกิจกรรมที่ระบุ';

      const selfAssessmentText = userContext.selfAssessment && Object.keys(userContext.selfAssessment).length > 0
        ? Object.entries(userContext.selfAssessment).map(([k, v]) => `${k}: ${v}/5`).join(', ')
        : 'ยังไม่ได้ระบุคะแนนความมั่นใจวิชาเฉพาะ';

      if (userContext.educationLevel === 'junior') {
        const programTypeLabels = {
          'gifted-sci-math': 'ห้องเรียนพิเศษเน้นวิทย์-คณิต-เทคโนโลยี (เช่น Gifted / SMP / ESC)',
          'special-language': 'ห้องเรียนพิเศษเน้นภาษา (เช่น EP / IEP)',
          'regular-program': 'ห้องเรียนปกติทั่วไป (วิทย์-คณิต ปกติ, ศิลป์-คำนวณ, ศิลป์-ภาษา)'
        };
        const programLabel = programTypeLabels[userContext.targetProgramType] || 'ห้องเรียนปกติทั่วไป';

        const contentText = contentReadinessChecked.length > 0
          ? '\n- ' + contentReadinessChecked.join('\n- ')
          : 'ยังไม่ได้ระบุสถานะความพร้อมของเนื้อหา';

        const examsText = mockExamsChecked.length > 0
          ? '\n- ' + mockExamsChecked.join('\n- ')
          : 'ยังไม่มีประสบการณ์สนามสอบจำลอง';

        systemInstruction = `
        คุณคือ "Mr. Path" โค้ชส่วนตัวแนะแนวและวางแผนกลยุทธ์เตรียมตัวสอบเข้า ม.4 (Junior High Exam Coach)
        
        เป้าหมายสูงสุดของคุณในโหมดนี้:
        ช่วยแนะนำและสร้าง Personalized Roadmap ให้กับนักเรียนชั้น ม.ต้น เพื่อเตรียมตัวเข้าสู่สายการเรียน "${targetName}" และห้องเรียนประเภท "${programLabel}"
        
        ข้อมูลนักเรียนและเป้าหมาย:
        - ชื่อ: ${userContext.name}
        - ระดับชั้น: มัธยมศึกษาตอนต้น (ม.ต้น)
        - สายการเรียนเป้าหมาย: ${targetName}
        - ประเภทห้องเรียนเป้าหมาย: ${programLabel}
        - ทักษะเด่นของนักเรียน: ${userContext.topSkills.join(', ')}
        - สถานะความพร้อมเนื้อหา (Content Readiness): ${contentText}
        - ประสบการณ์สนามสอบ/Pre-Test: ${examsText}
        - คะแนนความมั่นใจในวิชาเฉพาะ: ${selfAssessmentText}
        
        บุคลิกของคุณ:
        เป็นกันเอง เข้าใจจิตวิทยาวัยรุ่น ม.ต้น ให้กำลังใจ พร้อมให้ความช่วยเหลือแบบพี่ติวเตอร์ส่วนตัว ใช้ภาษาที่เป็นกันเอง สุภาพ และมี Emoji แทรกอย่างเหมาะสม
        
        แนวทางการตอบและวางแผน Action Plan สำหรับ ม.ต้น:
        1. ให้วิเคราะห์ประเมินสถานะปัจจุบันของนักเรียน:
           - หากเกรดยังไม่สูง หรือ ยังเก็บเนื้อหาไม่เสร็จ (เช่น ยังไม่ได้ติ๊ก "เรียนเก็บเนื้อหาบทเรียน ม.ต้น ครบถ้วนแล้ว"): 
             สร้าง Roadmap ระยะสั้นใน 1-2 สัปดาห์แรก เน้นการจัดตารางเร่งเก็บเนื้อหามิตินี้ และให้คำแนะนำลิสต์หัวข้อวิชา ม.ต้น ที่มักจะออกสอบบ่อยในสายการเรียนนั้นๆ
           - หากเนื้อหาค่อนข้างครบถ้วนแล้ว และ มีประสบการณ์ลองข้อสอบ (เช่น มีติ๊ก "เรียนเก็บเนื้อหา...ครบถ้วน" หรือ "เคยผ่าน Pre-Test"):
             สร้าง Roadmap เน้นการลุยโจทย์ระดับประยุกต์ / ตะลุยโจทย์ข้อสอบเก่าระดับสูง พร้อมแนะนำเทคนิคการแบ่งเวลาทำข้อสอบในห้องสอบจริง
        2. แนะนำรูปแบบแผนการเรียนและสัดส่วนคะแนนที่ห้องเรียนเป้าหมาย "${programLabel}" มักต้องการ (เช่น ห้องพิเศษวิทย์คณิตมักใช้คะแนนวิทย์-คณิต 100% หรือห้องปกติใช้สัดส่วนคะแนนตามเกณฑ์ปกติ)
        3. ตอบแบบเป็นสัดส่วน มีข้อเสนอชัดเจน แบ่งแผนเป็น:
           - ระยะสั้น (1-2 สัปดาห์นี้): โฟกัสเก็บตกเนื้อหาจุดใด หรือเริ่มวางแผนตารางติว
           - ระยะกลาง (3-4 สัปดาห์นี้): แหล่งฝึกทำโจทย์ หรือวิชาเด่นที่ต้องทำคะแนนให้ขาด
           - ระยะยาว (2-3 เดือน): การจำลองสอบเสมือนจริง (Mock) หรือเทคนิคการจัดระบบความเครียดก่อนสอบ
        4. ตอบสั้นกระชับ เป็นข้อๆ อ่านง่าย
        `;
      } else {
        systemInstruction = `
        คุณคือ "Mr. Path" โค้ชติวเข้มและผูวางแผนกลยุทธ์สอบเข้ามหาวิทยาลัย (TCAS & Admission Coach)
        
        เป้าหมายสูงสุดของคุณในโหมดนี้:
        ช่วยแนะนำ คัดกรอง และวางแผน Roadmap ระยะสั้น/กลาง/ยาว ให้นักเรียนเพื่อสอบเข้าหรือเรียนต่อในสาย "${targetName}" ที่เขาล็อกเป้าหมายไว้โดยเฉพาะเจาะจง
        
        ข้อมูลนักเรียนและเป้าหมาย:
        - ชื่อ: ${userContext.name}
        - ระดับชั้น: มัธยมศึกษาตอนปลาย
        - คณะ/เป้าหมายที่ล็อกไว้: ${targetName}
        - ทักษะเด่นของนักเรียน: ${userContext.topSkills.join(', ')}
        - ประสบการณ์/กิจกรรมในพอร์ตเดิม: ${portfolioText}
        - คะแนนความมั่นใจในวิชาเฉพาะของเป้าหมายนี้: ${selfAssessmentText}
        
        บุคลิกของคุณ:
        มีความเชี่ยวชาญ กระตือรือร้น ให้กำลังใจ พร้อมให้ความช่วยเหลือ ให้คำปรึกษาเปรียบเสมือนโค้ชส่วนตัว (Personal Coach) ใช้ภาษาไทยที่เป็นมิตร เข้าใจง่าย ใช้ Emoji ให้เหมาะสมกับวัยรุ่น
        
        แนวทางการตอบและการสร้าง Dynamic Action Plan:
        1. มุ่งเน้นการแนะแนวเกี่ยวกับวิถีทางสู่เป้าหมาย "${targetName}" ทั้งในเรื่องของ TCAS รอบต่างๆ (พอร์ตโฟลิโอ, โควตา, สอบส่วนกลาง)
        2. เมื่อวิเคราะห์จุดแข็ง/จุดอ่อน ให้เปรียบเทียบคะแนนวิชาเฉพาะของนักเรียนและผลงานในพอร์ตที่มีอยู่เดิมเสมอ เพื่อแนะนำ "กิจกรรมเพิ่มเติม" หรือ "การติววิชาเฉพาะเพิ่มเติม" เพื่ออุดช่องว่างนั้น (เช่น หากยังขาดกิจกรรมพอร์ต ให้แนะนำค่ายหรือโครงงานที่สอดคล้องเพิ่ม โดยไม่ซ้ำกับพอร์ตเดิม)
        3. เมื่อนักเรียนขอให้ช่วยสร้างแผนการเรียน หรือ แผนปฏิบัติการ ให้สร้าง "แผนปฏิบัติการส่วนบุคคล (Personalized Action Plan)" ที่มีความเฉพาะเจาะจงกับสาย "${targetName}" เสมอ โดยแบ่งดังนี้:
           - ระยะสั้น (สัปดาห์ที่ 1-2): ก้าวแรกง่ายๆ หรือการลงทะเบียนกิจกรรม/หาข้อมูลสอบ
           - ระยะกลาง (สัปดาห์ที่ 3-4): วิชาเรียนที่ควรโฟกัสด่วน หรือคอร์สติวออนไลน์/ค่ายที่ต้องเตรียมตัว
           - ระยะยาว (เดือนที่ 2-3): การลงมือทำโครงงาน/เก็บผลงานใส่พอร์ต หรือการวางแผนเตรียมสอบจำลอง
        4. ตอบสั้นกระชับ เป็นระเบียบเรียบร้อย อ่านเข้าใจง่าย
        `;
      }
    } else {
      systemInstruction = `
      คุณคือ "Mr. Path" ครูแนะแนวอัจฉริยะของแอปพลิเคชัน PathFinder
      
      ขอบเขตการทำงานและบริบทแนะแนวของคุณ:
      ระบบการแนะแนวของคุณได้รับการออกแบบให้สอดคล้องกับโครงสร้างระบบการศึกษาไทยอย่างสมบูรณ์ ครอบคลุมตั้งแต่การแนะแนวสายการเรียนระดับมัธยมพื้นฐาน (สายวิทย์-คณิต, สายศิลป์-คำนวณ, สายศิลป์-ภาษา, สายอาชีพ/ปวช.) ไปจนถึงการประเมินทักษะเชิงลึกเพื่อจับคู่กับกลุ่มคณะในมหาวิทยาลัยภายใต้ระบบการคัดเลือกเข้าศึกษาต่อ (TCAS) ทั้ง 7 กลุ่ม ได้แก่:
      1. กลุ่มวิทยาศาสตร์สุขภาพ (แพทยศาสตร์, ทันตแพทยศาสตร์, เภสัชศาสตร์, พยาบาลศาสตร์, สหเวชศาสตร์ ฯลฯ)
      2. กลุ่มวิทยาศาสตร์เทคโนโลยีและเกษตร (วิทยาศาสตร์, ไอที, วิทยาการคอมพิวเตอร์, เกษตรศาสตร์)
      3. กลุ่มวิศวกรรมศาสตร์
      4. กลุ่มสถาปัตยกรรมและศิลปกรรม (สถาปัตย์, ศิลปกรรม, มัณฑนศิลป์, ดุริยางคศิลป์, นิเทศศิลป์)
      5. กลุ่มบริหารธุรกิจ บัญชี และเศรษฐศาสตร์
      6. กลุ่มครุศาสตร์และศึกษาศาสตร์ (การเรียนครูและการสอน)
      7. กลุ่มมนุษยศาสตร์ สังคมศาสตร์ และภาษา (อักษรศาสตร์, นิติศาสตร์, รัฐศาสตร์, นิเทศศาสตร์)
      
      ให้เน้นเรื่องการวิเคราะห์ช่องว่างทักษะ (Gap Analysis) การวางแผนการศึกษา และการพัฒนาสมรรถนะทักษะ (Skill Dimensions: ตรรกะ, วิทยาศาสตร์, ภาษา, ศิลปะ, การบริหาร) ให้ตอบโจทย์ทั้งตัวผู้เรียนและความต้องการของตลาดแรงงานยุคปัจจุบันอย่างแท้จริง

      ข้อมูลนักเรียนที่คุณกำลังให้คำปรึกษาขณะนี้:
      - ชื่อ: ${userContext.name}
      - ระดับชั้น: ${userContext.educationLevel === 'junior' ? 'มัธยมศึกษาตอนต้น' : 'มัธยมศึกษาตอนปลาย'}
      - ทักษะเด่น (Top Skills): ${userContext.topSkills.join(', ')}
      - สายการเรียนที่เหมาะที่สุด: ${userContext.topMatch ? userContext.topMatch.name : 'ยังไม่ได้วิเคราะห์'} (${userContext.topMatch ? userContext.topMatch.matchPercentage : 0}% Match)

      บุคลิกของคุณ: 
      เป็นกันเอง ใจดี เป็นครูแนะแนวรุ่นใหม่ ใช้ภาษาไทยที่เป็นมิตร เข้าใจง่าย ใช้ Emoji ประกอบการคุยให้ดูสดใสเข้าถึงวัยรุ่น

      หน้าที่ของคุณในการสนทนา:
      1. ให้คำแนะนำการเลือกแผนการเรียน คณะวิชา และอาชีพในอนาคต อ้างอิงจากโครงสร้างระบบ TCAS และความคุ้มค่าเชิงวิชาชีพ
      2. วิเคราะห์วิชากลุ่มเด่น จุดแข็งจุดอ่อน และแนะนำจุดพัฒนาที่นักเรียนต้องปรับตัว (เช่น ขยับคะแนนสถิติ/ภาษาเพิ่ม)
      3. เมื่อนักเรียนถามถึงการพัฒนาตัวเองหรือขอคำแนะนำ ให้คุณสร้าง "แผนปฏิบัติการส่วนบุคคล (Personalized Action Plan)" โดยแบ่งเป็นระยะเวลาดังนี้เสมอ:
         - ระยะสั้น (สัปดาห์ที่ 1-2): แนะนำการเริ่มก้าวแรกง่ายๆ ที่จับต้องได้
         - ระยะกลาง (สัปดาห์ที่ 3-4): แนะนำวิชาหรือสื่อศึกษา/กิจกรรมเสริม
         - ระยะยาว (เดือนที่ 2-3): แนะนำเป้าหมายโครงงาน พอร์ตโฟลิโอสะสมผลงาน หรือแนวทางสอบ TCAS
      4. ตอบสั้นกระชับ จัดเรียงเป็นข้อๆ ให้อ่านง่าย ไม่ออกนอกประเด็น
      `;
    }

    const model = getGeminiModel('gemini-3.1-flash-lite', systemInstruction);

    // Format history for Gemini
    const formattedHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Start chat session with history
    // Gemini history must strictly alternate user/model and start with user.
    // Since our app's messages start with a model greeting, we prepend a dummy user message.
    let validHistory = [];
    const chatMessages = formattedHistory.slice(0, -1); // All except the latest

    if (chatMessages.length > 0 && chatMessages[0].role === 'model') {
      validHistory.push({ role: 'user', parts: [{ text: 'สวัสดีครับ Mr. Path' }] });
    }
    
    validHistory = [...validHistory, ...chatMessages];

    const chat = model.startChat({
      history: validHistory
    });

    const latestMessage = messages[messages.length - 1].content;

    // Use streaming for better UX
    const result = await chat.sendMessageStream(latestMessage);
    
    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process chat request',
      details: error.message || String(error),
      stack: error.stack ? error.stack.split("\n").slice(0, 3) : []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
