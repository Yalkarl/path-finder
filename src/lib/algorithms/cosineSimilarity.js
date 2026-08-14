// ==========================================
// การคำนวณ Cosine Similarity และ Preference Weighting 
// ==========================================

export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

// ==========================================
// การปรับสเกลคะแนนความสอดคล้องด้วย Sigmoid (x0=0.55, slope=6)
// ปรับจุดศูนย์กลางให้ยุติธรรม เพื่อไม่ให้คณะเกณฑ์มาตรฐานสูงโดนกดคะแนนลงอย่างไม่สมเหตุสมผล
// ==========================================
function sigmoidScale(rawSimilarity) {
  return 1 / (1 + Math.exp(-(rawSimilarity - 0.55) * 6));
}

// ==========================================
// การคำนวณหักคะแนนส่วนขาด (Gap Penalty หัก 8% เฉพาะมิติที่ขาดรุนแรงเกิน 0.35)
// ==========================================
function calculateGapPenalty(userVector, benchmark) {
  let penaltyFactor = 1.0;

  for (let i = 0; i < userVector.length; i++) {
    const gap = benchmark[i] - userVector[i];
    if (gap > 0.35) {
      penaltyFactor *= 0.92;
    }
  }

  return penaltyFactor;
}

// ==========================================
// เมทริกซ์คำค้นสำหรับเทียบสิ่งชอบ (Likes) และสิ่งที่ไม่ชอบ (Dislikes) กับทุกคณะ
// ==========================================
export const PATH_PREFERENCE_KEYWORDS = {
  // ── Senior Paths ──
  'medicine': {
    likes: ['แพทย์', 'แพทยศาสตร์', 'หมอ', 'ตรวจรักษา', 'วิชาการแพทย์', 'ชีววิทยา', 'ชีวะ', 'สุขภาพ', 'สรีรวิทยา', 'กายวิภาค', 'รักษาคนไข้', 'ผู้ป่วย', 'คลินิก', 'โรงพยาบาล', 'วินิจฉัยโรค', 'ผ่าตัด', 'ทดลองชีวะ', 'เวชศาสตร์', 'ระบบร่างกาย'],
    dislikes: ['กลัวเลือด', 'เลือด', 'กลัวศพ', 'ศพ', 'บาดแผล', 'ท่องจำตำรา', 'ท่องจำ']
  },
  'dentistry': {
    likes: ['ทันตะ', 'ทันตแพทย์', 'ทำฟัน', 'หมอฟัน', 'ทันตกรรม', 'ช่องปาก', 'ประดิดประดอย', 'งานฝีมือละเอียด', 'สุขภาพฟัน', 'จัดฟัน', 'ขูดหินปูน', 'ศัลยกรรมช่องปาก', 'ศิลปะและหมอ'],
    dislikes: ['กลัวเลือด', 'เลือด', 'บาดแผล']
  },
  'pharmacy': {
    likes: ['เภสัช', 'เภสัชกร', 'ยา', 'ปรุงยา', 'เวชภัณฑ์', 'เคมี', 'เคมีอินทรีย์', 'ฤทธิ์ของยา', 'วิจัยยา', 'บริบาลเภสัชกรรม', 'เภสัชวิทยา', 'ทดลองเคมี', 'โรงงานยา', 'สุขภาพ'],
    dislikes: ['กลัวเลือด', 'เลือด', 'บาดแผล', 'ท่องจำตำรา', 'ท่องจำ']
  },
  'nursing': {
    likes: ['พยาบาล', 'พยาบาลวิชาชีพ', 'ดูแลผู้ป่วย', 'การพยาบาล', 'ดูแลคนไข้', 'จิตอาสา', 'ปฐมพยาบาล', 'บริการสุขภาพ', 'ช่วยเหลือผู้อื่น', 'อนามัย', 'ผดุงครรภ์', 'คนไข้'],
    dislikes: ['กลัวเลือด', 'เลือด', 'บาดแผล', 'สกปรก']
  },
  'veterinary': {
    likes: ['สัตวแพทย์', 'หมอสัตว', 'รักษาสัตว์', 'สัตว์เลี้ยง', 'สัตว์ป่า', 'ปศุสัตว์', 'อนามัยสัตว์', 'ชีววิทยาสัตว์', 'คนรักสัตว์', 'สุนัข', 'แมว', 'คลินิกสัตว์'],
    dislikes: ['กลัวเลือด', 'เลือด', 'บาดแผล']
  },
  'allied-health': {
    likes: ['สหเวช', 'เทคนิคการแพทย์', 'กายภาพบำบัด', 'รังสีเทคนิค', 'โภชนาการคลินิก', 'สาธารณสุข', 'แล็บวิเคราะห์', 'เจาะเลือดตรวจแล็บ', 'ฟื้นฟูร่างกาย', 'ตรวจโรค'],
    dislikes: ['กลัวเลือด', 'เลือด', 'บาดแผล']
  },
  'science': {
    likes: ['วิทยาศาสตร์', 'วิทย์', 'ทดลอง', 'เคมี', 'ฟิสิกส์', 'ชีวะ', 'ชีววิทยา', 'คณิตศาสตร์บริสุทธิ์', 'วิจัย', 'ห้องแล็บ', 'นวัตกรรมวิทย์', 'ดาราศาสตร์', 'ธรณีวิทยา', 'จุลชีววิทยา', 'พันธุศาสตร์', 'สถิติวิจัย'],
    dislikes: ['คิดคำนวณ', 'คำนวณคณิต', 'คำนวณ']
  },
  'food-tech': {
    likes: ['ฟู้ดเทค', 'เทคโนโลยีอาหาร', 'ทำอาหาร', 'ประกอบอาหาร', 'โภชนาการ', 'แปรรูปอาหาร', 'ถนอมอาหาร', 'คหกรรม', 'เบเกอรี่', 'โรงงานอาหาร', 'การชิมอาหาร', 'พัฒนาสูตรอาหาร'],
    dislikes: []
  },
  'computer-science': {
    likes: ['คอมพิวเตอร์', 'วิทยาการคอมพิวเตอร์', 'เทคโนโลยี', 'เทคโนโลยีดิจิทัล', 'เขียนโปรแกรม', 'โค้ด', 'โค้ดดิ้ง', 'ซอฟต์แวร์', 'พัฒนาแอป', 'เว็บบล็อก', 'ai', 'ปัญญาประดิษฐ์', 'ไอที', 'ฐานข้อมูล', 'ไซเบอร์', 'เกม', 'esports', 'หุ่นยนต์', 'อัลกอริทึม', 'ระบบสารสนเทศ', 'คลาวด์', 'dev', 'developer'],
    dislikes: ['คิดคำนวณ', 'คำนวณคณิต', 'คำนวณ']
  },
  'psychology': {
    likes: ['จิตวิทยา', 'จิตวิทยาคลินิก', 'ให้คำปรึกษา', 'สุขภาพจิต', 'พฤติกรรมมนุษย์', 'เข้าใจคน', 'การฟังเชิงลึก', 'พัฒนาจิตใจ', 'จิตวิทยาอุตสาหกรรม', 'จิตวิทยามวลชน', 'วิเคราะห์คน', 'บำบัดจิต'],
    dislikes: []
  },
  'engineering': {
    likes: ['วิศวะ', 'วิศวกรรม', 'วิศวกร', 'คำนวณโครงสร้าง', 'โยธา', 'เครื่องกล', 'ไฟฟ้า', 'หุ่นยนต์', 'ออโตเมชัน', 'สิ่งประดิษฐ์', 'ยานยนต์', 'การสร้างสรรค์นวัตกรรม', 'ระบบอุตสาหกรรม', 'วงจรไฟฟ้า', 'เขียนแบบวิศวกรรม', 'โดรน'],
    dislikes: ['คิดคำนวณ', 'คำนวณคณิต', 'คำนวณ']
  },
  'political-science': {
    likes: ['รัฐศาสตร์', 'การเมือง', 'การปกครอง', 'นโยบายสาธารณะ', 'ความสัมพันธ์ระหว่างประเทศ', 'การทูต', 'บริหารรัฐกิจ', 'นักการเมือง', 'สังคมสงเคราะห์', 'สิทธิมนุษยชน', 'องค์กรระหว่างประเทศ', 'ความมั่นคง'],
    dislikes: []
  },
  'law': {
    likes: ['นิติศาสตร์', 'นิติ', 'กฎหมาย', 'ตรากฎหมาย', 'นักกฎหมาย', 'ทนาย', 'ทนายความ', 'อัยการ', 'ผู้พิพากษา', 'ความยุติธรรม', 'กระบวนการยุติธรรม', 'ข้อบังคับ', 'โต้เถียงเชิงเหตุผล', 'ตีความกฎหมาย', 'ศาล', 'สิทธิเสรีภาพ'],
    dislikes: ['ท่องจำตำรา', 'ท่องจำ']
  },
  'agriculture': {
    likes: ['เกษตร', 'เกษตรศาสตร์', 'สมาร์ทฟาร์ม', 'ต้นไม้', 'พืชพันธุ์', 'การปลูกพืช', 'ประมง', 'สัตว์น้ำ', 'วนศาสตร์', 'ป่าไม้', 'อนุรักษ์ธรรมชาติ', 'สัตวบาล', 'ปศุสัตว์', 'อุตสาหกรรมเกษตร', 'ดินและน้ำ'],
    dislikes: []
  },
  'business-administration': {
    likes: ['บริหาร', 'บริหารธุรกิจ', 'การตลาด', 'การเงิน', 'การลงทุน', 'บัญชี', 'เศรษฐศาสตร์', 'วางแผนธุรกิจ', 'สตาร์ทอัพ', 'ผู้ประกอบการ', 'หุ้น', 'การค้าระหว่างประเทศ', 'โลจิสติกส์ธุรกิจ', 'บริหารองค์กร', 'กลยุทธ์ธุรกิจ', 'การเจรจาต่อรอง'],
    dislikes: ['คิดคำนวณ', 'คำนวณคณิต', 'คำนวณ']
  },
  'communication-arts': {
    likes: ['นิเทศ', 'นิเทศศาสตร์', 'วารสารศาสตร์', 'สื่อสารมวลชน', 'สื่อดิจิทัล', 'โฆษณา', 'ประชาสัมพันธ์', 'กำกับภาพยนตร์', 'ตัดต่อวิดีโอ', 'คอนเทนต์', 'ผู้สร้างคอนเทนต์', 'ครีเอเตอร์', 'การแสดง', 'การกระจายเสียง', 'พอดแคสต์', 'การถ่ายภาพ', 'ยูทูบเบอร์'],
    dislikes: []
  },
  'education': {
    likes: ['ครู', 'ครุศาสตร์', 'ศึกษาศาสตร์', 'วิชาชีพครู', 'การสอน', 'ถ่ายทอดความรู้', 'จิตวิทยาการเรียนรู้', 'พัฒนาเด็ก', 'เทคโนโลยีการศึกษา', 'การจัดกิจกรรมการเรียนรู้', 'ติวเตอร์', 'แม่พิมพ์ของชาติ'],
    dislikes: []
  },
  'industrial-education': {
    likes: ['ครูช่าง', 'ครุศาสตร์อุตสาหกรรม', 'สอนวิชาช่าง', 'เทคนิคอุตสาหกรรม', 'การฝึกหัดช่าง', 'วิศวกรรมการศึกษา', 'ปฏิบัติการช่าง'],
    dislikes: []
  },
  'humanities-liberal-arts': {
    likes: ['อักษร', 'อักษรศาสตร์', 'มนุษยศาสตร์', 'ศิลปศาสตร์', 'ภาษาต่างประเทศ', 'ภาษาอังกฤษ', 'ภาษาจีน', 'ภาษาญี่ปุ่น', 'ภาษาเกาหลี', 'ภาษาฝรั่งเศส', 'การแปล', 'ล่าม', 'วรรณคดี', 'ประวัติศาสตร์', 'โบราณคดี', 'วัฒนธรรม', 'ภาษาไทย', 'มนุษยวิทยา', 'วรรณกรรม', 'การเขียนเรื่อง', 'ภาษา & การสื่อสาร', 'ภาษาและการสื่อสาร'],
    dislikes: []
  },
  'fine-applied-arts': {
    likes: ['ศิลปกรรม', 'ศิลปกรรมศาสตร์', 'ทัศนศิลป์', 'วิจิตรศิลป์', 'ประยุกต์ศิลป์', 'จิตรกรรม', 'วาดรูป', 'วาดภาพ', 'ประติมากรรม', 'กราฟิกดีไซน์', 'ออกแบบนิเทศศิลป์', 'ออกแบบผลิตภัณฑ์', 'ดนตรีสากล', 'ดนตรีไทย', 'การแสดง', 'นาฏศิลป์'],
    dislikes: []
  },
  'architecture': {
    likes: ['สถาปัตย์', 'สถาปัตยกรรม', 'สถาปนิก', 'ออกแบบบ้าน', 'ออกแบบอาคาร', 'ออกแบบภายใน', 'ตกแต่งภายใน', 'ภูมิสถาปัตย์', 'ผังเมือง', 'โมเดลบ้าน', 'วาดแบบ', 'โครงสร้างสวยงาม', 'มัณฑนศิลป์'],
    dislikes: []
  },
  'sports-science': {
    likes: ['วิทยาศาสตร์การกีฬา', 'วิทย์กีฬา', 'กีฬา', 'เล่นกีฬา', 'โค้ชกีฬา', 'ฟิตเนส', 'ผู้ฝึกสอนกีฬา', 'สรีรวิทยาการออกกำลังกาย', 'การเคลื่อนไหวร่างกาย', 'นักกีฬา', 'เวชศาสตร์การกีฬา', 'เทรนเนอร์'],
    dislikes: []
  },
  'logistics-industrial-tech': {
    likes: ['โลจิสติกส์', 'การขนส่ง', 'ซัพพลายเชน', 'เทคโนโลยีอุตสาหกรรม', 'การคลังสินค้า', 'นำเข้าส่งออก', 'การจัดการการผลิต', 'คลังสินค้า', 'ระบบจัดส่ง'],
    dislikes: ['คิดคำนวณ', 'คำนวณคณิต', 'คำนวณ']
  },
  'tourism-hospitality': {
    likes: ['ท่องเที่ยว', 'การท่องเที่ยว', 'การโรงแรม', 'ธุรกิจการบิน', 'แอร์โฮสเตส', 'สจ๊วต', 'ลูกเรือ', 'มัคคุเทศก์', 'ไกด์', 'การบริการ', 'ต้อนรับ', 'รีสอร์ท', 'สำรองที่นั่ง'],
    dislikes: []
  },
  'environmental-science': {
    likes: ['สิ่งแวดล้อม', 'วิทยาศาสตร์สิ่งแวดล้อม', 'อนุรักษ์สิ่งแวดล้อม', 'นิเวศวิทยา', 'พลังงานสะอาด', 'มลพิษ', 'การจัดการทรัพยากร', 'โลกร้อน', 'ขยะและมลพิษ', 'ป่าและสิ่งแวดล้อม'],
    dislikes: []
  },

  // ── Junior Paths ──
  'medicine-pharmacy': {
    likes: ['แพทย์', 'หมอ', 'เภสัช', 'ทันตะ', 'วิทย์-คณิต', 'วิทยาศาสตร์', 'ชีววิทยา', 'ทดลอง', 'สุขภาพ', 'รักษาโรค'],
    dislikes: ['กลัวเลือด', 'เลือด', 'ท่องจำตำรา', 'ท่องจำ']
  },
  'nursing-allied-health': {
    likes: ['พยาบาล', 'สหเวช', 'สาธารณสุข', 'เทคนิคการแพทย์', 'ดูแลคนไข้', 'บริการสุขภาพ', 'ช่วยเหลือคน'],
    dislikes: ['กลัวเลือด', 'เลือด']
  },
  'engineering-architecture': {
    likes: ['วิศวะ', 'สถาปัตย์', 'คำนวณ', 'สิ่งประดิษฐ์', 'เขียนโปรแกรม', 'โค้ด', 'หุ่นยนต์', 'ออกแบบอาคาร', 'วาดแบบ', 'เทคโนโลยี'],
    dislikes: ['คิดคำนวณ', 'คำนวณคณิต', 'คำนวณ']
  },
  'science-technology': {
    likes: ['วิทยาศาสตร์', 'วิทย์', 'ไอที', 'คอมพิวเตอร์', 'โค้ดดิ้ง', 'ทดลอง', 'เคมี', 'ฟิสิกส์', 'ชีวะ', 'เทคโนโลยี'],
    dislikes: ['คิดคำนวณ', 'คำนวณคณิต', 'คำนวณ']
  },
  'business-economics-accounting': {
    likes: ['บริหาร', 'ธุรกิจ', 'บัญชี', 'การเงิน', 'เศรษฐศาสตร์', 'วางแผน', 'ขายของ', 'สตาร์ทอัพ', 'การตลาด'],
    dislikes: ['คิดคำนวณ', 'คำนวณคณิต', 'คำนวณ']
  },
  'law-political-science': {
    likes: ['กฎหมาย', 'นิติ', 'รัฐศาสตร์', 'การเมือง', 'การปกครอง', 'ความยุติธรรม', 'สิทธิมนุษยชน', 'โต้เถียง'],
    dislikes: ['ท่องจำตำรา', 'ท่องจำ']
  },
  'humanities-social-science': {
    likes: ['มนุษยศาสตร์', 'สังคมศาสตร์', 'ภาษาต่างประเทศ', 'ภาษาอังกฤษ', 'ภาษาจีน', 'ภาษาญี่ปุ่น', 'ประวัติศาสตร์', 'วัฒนธรรม', 'การแปล', 'การอ่าน'],
    dislikes: []
  },
  'communication-fine-arts': {
    likes: ['นิเทศ', 'สื่อสารมวลชน', 'ศิลปกรรม', 'ศิลปะ', 'ออกแบบ', 'วาดรูป', 'การแสดง', 'ดนตรี', 'ตัดต่อคลิป', 'สร้างคอนเทนต์', 'โฆษณา'],
    dislikes: []
  },
  'education': {
    likes: ['ครู', 'ศึกษาศาสตร์', 'ครุศาสตร์', 'สอนหนังสือ', 'ถ่ายทอดความรู้', 'ติวเตอร์', 'จิตวิทยาเด็ก'],
    dislikes: []
  },
  'special-smte': {
    likes: ['smte', 'วิทย์-คณิตพิเศษ', 'วิทยาศาสตร์เข้มข้น', 'คณิตศาสตร์เข้มข้น', 'ทดลองวิทย์', 'ตะลุยโจทย์วิทย์คณิต'],
    dislikes: []
  },
  'special-iep': {
    likes: ['iep', 'english program', 'ep', 'เน้นภาษาอังกฤษ', 'ภาษาต่างประเทศ', 'อินเตอร์', 'เรียนภาษาเข้มข้น'],
    dislikes: []
  }
};

function isKeywordMatch(userInput, targetKeywords) {
  if (!userInput || !Array.isArray(targetKeywords) || targetKeywords.length === 0) return false;
  const normInput = userInput.toLowerCase();
  
  // Direct full-string match
  if (targetKeywords.some(k => normInput.includes(k) || k.includes(normInput))) {
    return true;
  }
  
  // Tokenized sub-word match for multi-concept items (e.g., "ภาษา & การสื่อสาร" -> ["ภาษา", "การสื่อสาร"])
  const tokens = normInput.split(/[\s&/,\-+]+/).filter(t => t.length >= 2);
  return tokens.some(token => 
    targetKeywords.some(k => token.includes(k) || k.includes(token))
  );
}

// ==========================================
// การคำนวณตัวคูณโบนัสสิ่งชอบ และการหักคะแนนสิ่งที่ไม่ชอบ (Preference Factor)
// ==========================================
function calculatePreferenceFactor(pathId, likes = [], dislikes = []) {
  const keywords = PATH_PREFERENCE_KEYWORDS[pathId];
  if (!keywords) return 1.0;

  let bonus = 0;
  let penalty = 0;

  if (Array.isArray(likes) && likes.length > 0) {
    likes.forEach(like => {
      if (isKeywordMatch(like, keywords.likes)) {
        bonus += 0.04;
      }
    });
  }
  bonus = Math.min(0.08, bonus);

  if (Array.isArray(dislikes) && dislikes.length > 0) {
    dislikes.forEach(dislike => {
      if (isKeywordMatch(dislike, keywords.dislikes)) {
        penalty += 0.15;
      }
    });
  }

  return Math.max(0.4, 1.0 + bonus - penalty);
}

// ==========================================
// การสร้างคำอธิบายเหตุผลในการ Match (Match Reason) แบบลึกซึ้งและชัดเจน
// ==========================================
export function generateMatchReason(candidate, userVector, likes = [], dislikes = []) {
  const pathId = candidate.id;
  const keywords = PATH_PREFERENCE_KEYWORDS[pathId];

  const matchedLikes = [];
  const matchedDislikes = [];

  if (keywords) {
    if (Array.isArray(likes)) {
      likes.forEach(l => {
        if (isKeywordMatch(l, keywords.likes)) {
          matchedLikes.push(l);
        }
      });
    }
    if (Array.isArray(dislikes)) {
      dislikes.forEach(d => {
        if (isKeywordMatch(d, keywords.dislikes)) {
          matchedDislikes.push(d);
        }
      });
    }
  }

  const dimNames = ['ตรรกะเชิงระบบ', 'วิทยาศาสตร์ประยุกต์', 'ภาษาและการสื่อสาร', 'ศิลปะและการออกแบบ', 'การบริหารจัดการ'];
  
  // หา 2 มิติทักษะที่โดดเด่นที่สุดของผู้เรียน
  const indexedVector = userVector.map((val, idx) => ({ val, idx, name: dimNames[idx] }));
  indexedVector.sort((a, b) => b.val - a.val);

  const top1 = indexedVector[0];
  const top2 = indexedVector[1];

  // หา มิติที่คณะต้องการสูงสุด (Benchmark Max)
  const bmMaxIdx = candidate.benchmark ? candidate.benchmark.indexOf(Math.max(...candidate.benchmark)) : 0;
  const bmMaxName = dimNames[bmMaxIdx];

  let reasonStr = '';

  if (matchedLikes.length > 0 && matchedDislikes.length === 0) {
    reasonStr = `ตรงกับความสนใจด้าน ${matchedLikes.join(', ')} โดยตรง ร่วมกับจุดแข็งทักษะ${top1.name} (ระดับ ${(top1.val * 100).toFixed(0)}%) และ${top2.name} ของคุณ`;
  } else if (matchedLikes.length > 0 && matchedDislikes.length > 0) {
    reasonStr = `ตรงกับสิ่งที่ชอบด้าน ${matchedLikes.join(', ')} แต่ถูกปรับลดคะแนนเนื่องจากมีกิจกรรมที่คุณระบุว่าไม่ชอบ (${matchedDislikes.join(', ')})`;
  } else if (matchedDislikes.length > 0) {
    reasonStr = `มีฐานทักษะ${top1.name}และ${top2.name}ที่ใช้เรียนได้ แต่ได้รับผลกระทบหักคะแนนเนื่องจากตรงกับกิจกรรมที่คุณไม่ชอบ (${matchedDislikes.join(', ')})`;
  } else {
    reasonStr = `วิเคราะห์จากเกรดและแบบทดสอบ: คณะนี้เน้นสมรรถนะ${bmMaxName} ซึ่งสอดคล้องกับจุดแข็งด้าน${top1.name} (ระดับ ${(top1.val * 100).toFixed(0)}%) และ${top2.name} (ระดับ ${(top2.val * 100).toFixed(0)}%) ของคุณ`;
  }

  return reasonStr;
}

// ==========================================
// การคำนวณเปอร์เซ็นต์ความเหมาะสมสุทธิ (Skill Match Rate %)
// ==========================================
export function calculateMatchPercentage(userVector, benchmark, pathId = null, likes = [], dislikes = []) {
  const rawSimilarity = cosineSimilarity(userVector, benchmark);
  const penaltyFactor = calculateGapPenalty(userVector, benchmark);
  const prefFactor = pathId ? calculatePreferenceFactor(pathId, likes, dislikes) : 1.0;

  // ปรับสเกลฐานความสอดคล้องให้อยู่ในระดับสมจริง (50% - 84%) ไม่เฟ้อเกินจริง
  const baseMatch = 0.45 + (rawSimilarity * 0.39);

  let finalScore = baseMatch * penaltyFactor * prefFactor * 100;

  // กำหนดเพดานสูงสุดไม่เกิน 91% เพื่อความสมจริงและน่าเชื่อถือเชิงการศึกษา
  const finalMatch = Math.min(91, Math.max(35, Math.round(finalScore)));

  return finalMatch;
}

/**
 * Match user vector against all paths in a paths object.
 * Returns sorted array of path candidates with clear rank-differentiated matchPercentage and matchReason.
 */
export function matchPaths(userVector, pathsObject, likes = [], dislikes = []) {
  const candidates = Object.values(pathsObject);
  
  // 1. คำนวณคะแนนความสอดคล้องดิบ (Cosine Similarity + Gap Penalty + Preference Factor)
  const rated = candidates.map(candidate => {
    const rawSim = cosineSimilarity(userVector, candidate.benchmark);
    const penalty = calculateGapPenalty(userVector, candidate.benchmark);
    const pref = calculatePreferenceFactor(candidate.id, likes, dislikes);
    
    const compositeScore = rawSim * penalty * pref;
    const matchReason = generateMatchReason(candidate, userVector, likes, dislikes);

    return {
      ...candidate,
      rawSim,
      compositeScore,
      matchReason
    };
  });

  // 2. เรียงลำดับตามคะแนนความเหมาะสมสูงสุดลงไป
  rated.sort((a, b) => b.compositeScore - a.compositeScore);

  if (rated.length === 0) return [];

  // 3. คำนวณกระจายสเกลเปอร์เซ็นต์ (Dynamic Contrast Spreading) ให้แต่ละลำดับมีระยะห่าง 3% - 4% อย่างชัดเจน
  const topComposite = rated[0].compositeScore;
  const baseTopMatch = Math.min(90, Math.max(84, Math.round(topComposite * 90)));

  const result = rated.map((item, index) => {
    // ห่างจากอันดับ 1 ลำดับละประมาณ 3.5% เพื่อไม่ให้กระจุกตัวอยู่ที่ 81%-83% เท่ากันหมด
    const relativeDrop = (topComposite - item.compositeScore) * 110;
    const rankDrop = index * 3.5;
    const totalDrop = Math.max(rankDrop, relativeDrop);

    let matchPercentage = Math.round(baseTopMatch - totalDrop);
    matchPercentage = Math.min(90, Math.max(45, matchPercentage));

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      benchmark: item.benchmark,
      matchPercentage,
      matchReason: item.matchReason
    };
  });

  return result;
}
