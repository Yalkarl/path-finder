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
    likes: ['วิทย', 'หมอ', 'พยาบาล', 'สุขภาพ', 'รักษา', 'ทดลอง', 'ชีวะ', 'แพทย์'],
    dislikes: ['เลือด', 'ศพ', 'บาดแผล', 'แผล']
  },
  'dentistry': {
    likes: ['ฟัน', 'สุขภาพ', 'หมอ', 'วิทย', 'ศิลปะ', 'ทันตะ', 'รักษา'],
    dislikes: ['เลือด', 'ศพ', 'บาดแผล']
  },
  'pharmacy': {
    likes: ['ยา', 'เคมี', 'ทดลอง', 'วิทย', 'สุขภาพ', 'เภสัช'],
    dislikes: ['เลือด', 'ศพ', 'บาดแผล']
  },
  'nursing': {
    likes: ['พยาบาล', 'สุขภาพ', 'ดูแล', 'บริการ', 'รักษา'],
    dislikes: ['เลือด', 'ศพ', 'บาดแผล', 'สกปรก']
  },
  'veterinary': {
    likes: ['สัตว', 'สัตว์', 'หมอสัตว', 'ธรรมชาติ', 'รักษา'],
    dislikes: ['เลือด', 'ศพ', 'บาดแผล']
  },
  'allied-health': {
    likes: ['สหเวช', 'เทคนิคการแพทย์', 'กายภาพ', 'รังสี', 'สุขภาพ', 'ทดลอง'],
    dislikes: ['เลือด', 'ศพ', 'บาดแผล']
  },
  'science': {
    likes: ['วิทย์', 'ทดลอง', 'เคมี', 'ฟิสิกส์', 'ชีวะ', 'วิจัย'],
    dislikes: ['เลือด', 'ศพ']
  },
  'food-tech': {
    likes: ['ทำอาหาร', 'คหกรรม', 'โภชนาการ', 'อาหาร', 'แปรรูป', 'ถนอมอาหาร'],
    dislikes: ['เลือด', 'ศพ']
  },
  'computer-science': {
    likes: ['ai', 'เทคโนโลยี', 'โค้ด', 'โปรแกรม', 'ไอที', 'คอมพิวเตอร์', 'เกม', 'esports', 'ดิจิทัล', 'หุ่นยนต์', 'ซอฟต์แวร์'],
    dislikes: ['คำนวณคณิต', 'ท่องจำตำรา', 'เลือด', 'ศพ']
  },
  'psychology': {
    likes: ['จิตวิทยา', 'ให้คำปรึกษา', 'พฤติกรรม', 'คน', 'สุขภาพจิต', 'วิจัย'],
    dislikes: ['เลือด', 'ศพ']
  },
  'engineering': {
    likes: ['เทคโนโลยี', 'โค้ด', 'คำนวณ', 'สิ่งประดิษฐ์', 'วิศว', 'หุ่นยนต์', 'ทดลอง', 'โครงสร้าง', 'เครื่องกล', 'ไฟฟ้า'],
    dislikes: ['คำนวณคณิต', 'ท่องจำตำรา', 'เลือด', 'ศพ']
  },
  'political-science': {
    likes: ['การเมือง', 'รัฐศาสตร์', 'นโยบาย', 'ความสัมพันธ์ระหว่างประเทศ', 'สังคมสงเคราะห์', 'บริหาร'],
    dislikes: ['เลือด', 'ศพ']
  },
  'law': {
    likes: ['กฎหมาย', 'นิติ', 'ภาษา', 'การเมือง', 'โต้เถียง', 'ความยุติธรรม'],
    dislikes: ['เลือด', 'ศพ']
  },
  'agriculture': {
    likes: ['เกษตร', 'ธรรมชาติ', 'สิ่งแวดล้อม', 'สัตว์', 'ต้นไม้', 'ประมง', 'ปศุสัตว์'],
    dislikes: ['ห้องแอร์', 'เอกสาร']
  },
  'business-administration': {
    likes: ['บริหาร', 'ธุรกิจ', 'วางแผน', 'การเงิน', 'การตลาด', 'ลงทุน', 'เศรษฐศาสตร์', 'บัญชี'],
    dislikes: ['คำนวณคณิต', 'เลือด', 'ศพ']
  },
  'communication-arts': {
    likes: ['นิเทศ', 'สื่อ', 'การแสดง', 'ศิลปะ', 'ออกแบบ', 'ดนตรี', 'ภาษา', 'สื่อสาร', 'สร้างสรรค์', 'โฆษณา', 'ภาพยนตร์', 'คอนเทนต์'],
    dislikes: ['เลือด', 'ศพ']
  },
  'education': {
    likes: ['ครู', 'สอน', 'ถ่ายทอด', 'การเรียนรู้', 'จิตวิทยา', 'พัฒนาผู้เรียน'],
    dislikes: ['เลือด', 'ศพ']
  },
  'industrial-education': {
    likes: ['ครูช่าง', 'วิศว', 'เทคนิค', 'เครื่องมือ', 'ปฏิบัติ'],
    dislikes: ['เลือด', 'ศพ']
  },
  'humanities-liberal-arts': {
    likes: ['ภาษา', 'สื่อสาร', 'อังกฤษ', 'อักษร', 'มนุษยศาสตร์', 'ศิลปศาสตร์', 'วัฒนธรรม', 'ประวัติศาสตร์', 'แปล', 'วรรณคดี'],
    dislikes: ['เลือด', 'ศพ']
  },
  'fine-applied-arts': {
    likes: ['ศิลปะ', 'ออกแบบ', 'วาด', 'กราฟิก', 'สร้างสรรค์', 'ดนตรี', 'การแสดง', 'จิตรกรรม', 'ประติมากรรม'],
    dislikes: ['เลือด', 'ศพ']
  },
  'architecture': {
    likes: ['สถาปัตย์', 'ออกแบบ', 'ศิลปะ', 'โครงสร้าง', 'วาด', 'สิ่งประดิษฐ์'],
    dislikes: ['เลือด', 'ศพ']
  },
  'sports-science': {
    likes: ['กีฬา', 'ฟิตเนส', 'ออกกำลัง', 'โค้ช', 'เคลื่อนไหว', 'นักกีฬา'],
    dislikes: ['ท่องจำตำรา', 'นั่งโต๊ะ']
  },
  'tourism-hospitality': {
    likes: ['ท่องเที่ยว', 'การโรงแรม', 'การบิน', 'ภาษา', 'สื่อสาร', 'บริการ', 'สายการบิน'],
    dislikes: ['เลือด', 'ศพ']
  },

  // ── Junior Paths ──
  'medicine-pharmacy': {
    likes: ['หมอ', 'วิทย', 'แพทย์', 'เภสัช', 'สุขภาพ', 'ทดลอง'],
    dislikes: ['เลือด', 'ศพ']
  },
  'nursing-allied-health': {
    likes: ['พยาบาล', 'สหเวช', 'สุขภาพ', 'ดูแล', 'บริการ'],
    dislikes: ['เลือด', 'ศพ']
  },
  'engineering-architecture': {
    likes: ['วิศว', 'สถาปัตย์', 'เทคโนโลยี', 'โค้ด', 'คำนวณ', 'ออกแบบ', 'หุ่นยนต์'],
    dislikes: ['คำนวณคณิต', 'ท่องจำตำรา']
  },
  'science-technology': {
    likes: ['วิทย์', 'เทคโนโลยี', 'โค้ด', 'ทดลอง', 'คอมพิวเตอร์'],
    dislikes: ['คำนวณคณิต', 'เลือด']
  },
  'business-economics-accounting': {
    likes: ['บริหาร', 'ธุรกิจ', 'บัญชี', 'เศรษฐศาสตร์', 'การเงิน', 'การตลาด'],
    dislikes: ['คำนวณคณิต', 'เลือด']
  },
  'law-political-science': {
    likes: ['กฎหมาย', 'นิติ', 'รัฐศาสตร์', 'การเมือง', 'ภาษา'],
    dislikes: ['เลือด']
  },
  'humanities-social-science': {
    likes: ['มนุษยศาสตร์', 'สังคมศาสตร์', 'ภาษา', 'สื่อสาร', 'วัฒนธรรม'],
    dislikes: ['เลือด']
  },
  'communication-fine-arts': {
    likes: ['นิเทศ', 'ศิลปกรรม', 'ศิลปะ', 'สื่อสาร', 'การแสดง', 'ดนตรี', 'ออกแบบ', 'สร้างสรรค์'],
    dislikes: ['เลือด']
  },
  'special-smte': {
    likes: ['วิทย์', 'คณิต', 'เทคโนโลยี', 'ทดลอง', 'คำนวณ'],
    dislikes: ['ท่องจำ']
  },
  'special-iep': {
    likes: ['ภาษา', 'อังกฤษ', 'สื่อสาร', 'อินเตอร์'],
    dislikes: ['คำนวณคณิต']
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
        bonus += 0.18;
      }
    });
  }
  bonus = Math.min(0.45, bonus);

  if (Array.isArray(dislikes) && dislikes.length > 0) {
    dislikes.forEach(dislike => {
      if (isKeywordMatch(dislike, keywords.dislikes)) {
        penalty += 0.25;
      }
    });
  }

  return Math.max(0.2, 1.0 + bonus - penalty);
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
  const adjustedScore = sigmoidScale(rawSimilarity);
  const penaltyFactor = calculateGapPenalty(userVector, benchmark);

  // ปรับการคำนวณ Capability Factor แบบนอร์มัลไลซ์ ยุติธรรม ไม่กดคะแนนคณะมาตรฐานสูง
  const sumUser = userVector.reduce((a, b) => a + b, 0);
  const capabilityFactor = Math.min(1.0, Math.max(0.70, (sumUser + 0.3) / 1.8));

  // การคำนวณตัวคูณสิ่งชอบและไม่ชอบ (Preference Factor)
  const prefFactor = pathId ? calculatePreferenceFactor(pathId, likes, dislikes) : 1.0;

  const finalMatch = Math.min(100, Math.max(0, Math.round(adjustedScore * penaltyFactor * capabilityFactor * prefFactor * 100)));

  return finalMatch;
}

/**
 * Match user vector against all paths in a paths object.
 * Returns sorted array of path candidates with matchPercentage and matchReason.
 */
export function matchPaths(userVector, pathsObject, likes = [], dislikes = []) {
  const candidates = Object.values(pathsObject);
  
  return candidates
    .map(candidate => {
      const matchPercentage = calculateMatchPercentage(userVector, candidate.benchmark, candidate.id, likes, dislikes);
      const matchReason = generateMatchReason(candidate, userVector, likes, dislikes);
      return {
        ...candidate,
        matchPercentage,
        matchReason
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}
