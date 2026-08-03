const fs = require('fs');
const path = require('path');

const COMMENT_TRANSLATIONS = {
  "Clear the flag after showing": "รีเซ็ตสถานะแจ้งเตือนหลังแสดงผล",
  "Target Lock Computations": "การคำนวณคะแนนสำหรับโหมด Target Lock",
  "Calculate specific skill vector for this junior path to filter targeted questions": "คำนวณ Skill Vector เพื่อกรองชุดคำถามเฉพาะสายม.ต้น",
  "Calculate new results based on the new educationLevel": "คำนวณผลลัพธ์ใหม่ตามระดับชั้นที่อัปเดต",
  "Reset or set targetProgramType accordingly": "ตั้งค่าหรือรีเซ็ตประเภทแผนการเรียนเป้าหมาย",
  "Reset portfolio and custom activities if level changed to prevent cross-contamination": "รีเซ็ตรายการผลงานเมื่อเปลี่ยนระดับชั้นเพื่อป้องกันข้อมูลสับสน",
  "gradeLevel: grade, // kept for backward compatibility": "gradeLevel: grade, // รองรับความเข้ากันได้ย้อนหลัง",
  "Update local profile state": "อัปเดตข้อมูลโปรไฟล์ในสถานะท้องถิ่น",
  "Streak calculation logic": "ระบบคำนวณความต่อเนื่องการเข้าใช้งาน (Streak)",
  "reset streak if missed a day": "รีเซ็ตจำนวนวันเมื่อไม่ได้เข้าใช้งานเกิน 1 วัน",
  "first time login": "การเข้าใช้งานวันแรกสุด",
  "Save new streak": "บันทึกจำนวนวันความต่อเนื่องใหม่",
  "Simulate past days logic based on streak": "คำนวณจำลองสถานะวันย้อนหลังตามความต่อเนื่อง",
  "Brief delay to show selected state before navigating": "หน่วงเวลาสั้นๆ แสดงสถานะการเลือกก่อนเปลี่ยนหน้า",
  "justifyContent: 'center', // Centered vertically": "justifyContent: 'center', // จัดกึ่งกลางแนวตั้ง",
  "Restore profile name and grade if they exist in localStorage": "ดึงชื่อและระดับชั้นจาก localStorage มาใช้ใหม่",
  "Map data to Recharts format": "แปลงรูปแบบข้อมูลเข้าสู่ Recharts",
  "Custom tooltips to explain status": "กล่องอธิบายสถานะเพิ่มเติม (Tooltip)",
  "Dynamic colors": "การกำหนดสีไดนามิกตามระดับความพร้อม",
  "Red for low readiness": "สีแดงสำหรับความพร้อมระดับต้องเร่งพัฒนา",
  "Emerald for high readiness": "สีเขียวสำหรับความพร้อมระดับสูง",
  "Primary purple for medium-high": "สีม่วงสำหรับความพร้อมระดับดีมาก",
  "Yellow/Orange for developing": "สีส้ม/เหลืองสำหรับความพร้อมระดับปานกลาง",
  "Default to 35%": "ระดับเสียงเริ่มต้น 35%",
  "Sync volume state to actual audio element": "ซิงค์ระดับเสียงกับตัวเล่นเสียง Audio Element",
  "Attempt to autoplay when page loads": "พยายามเล่นเพลงอัตโนมัติเมื่อโหลดหน้าเว็บ",
  "Muted Icon": "ไอคอนปิดเสียง",
  "Volume Speaker On Icon": "ไอคอนเปิดเสียง",
  "Auto redirect logic": "ระบบเปลี่ยนหน้าอัตโนมัติ",
  "Dynamically generate a reason why this alternative is a good backup plan": "สร้างเหตุผลแนะนำสำหรับเส้นทางสำรอง",
  "Fallback: find the dimension with the smallest gap": "ค้นหาเส้นทางสำรองจากมิติที่มีส่วนขาดน้อยที่สุด",
  "Absolute Capability Factor: Compare the total magnitude/sum of user skills to the required benchmark.": "การคำนวณ Absolute Capability Factor เปรียบเทียบผลรวมทักษะกับเกณฑ์",
  "This prevents cases where getting worse/lower grades in other subjects increases the match percentage": "ช่วยป้องกันกรณีคะแนนเกรดวิชาอื่นต่ำลงแล้วทำให้เปอร์เซ็นต์สอดคล้องสูงขึ้นผิดปกติ",
  "gap: Math.max(0, gap), // Only care about positive gaps": "gap: Math.max(0, gap), // พิจารณาเฉพาะส่วนขาดที่เป็นบวก",
  "Default Camp 1": "ค่าย 1 สอวน. เริ่มต้น",
  "Apply diminishing returns multiplier for repeated attempts (e.g., repeating Camp 2)": "คำนวณการลดทอนค่าน้ำหนักกรณีทำกิจกรรมเดิมซ้ำ",
  "Base Level Weight": "ค่าน้ำหนักระดับความสำคัญของกิจกรรม",
  "Only care about positive gaps": "พิจารณาเฉพาะส่วนขาดที่เป็นบวก",
  "Red": "สีแดง",
  "Yellow": "สีเหลือง",
  "Green": "สีเขียว"
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [eng, thai] of Object.entries(COMMENT_TRANSLATIONS)) {
    if (content.includes(eng)) {
      content = content.replaceAll(eng, thai);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function scanDir(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      processFile(fullPath);
    }
  }
}

const srcDir = path.join(__dirname, '..', 'src');
scanDir(srcDir);
console.log('Second pass done.');
