// ==========================================
// การคำนวณ 5D Skill Vector จาก GPAX สะสมรายกลุ่มสาระวิชา (30%), แบบทดสอบ (70%) และสิ่งชอบ/ไม่ชอบ
// ==========================================

import { TARGET_CLUSTERS } from '../constants/targetedAssessment';
import { isProfanityOrGibberish } from '../utils/contentSafety';

// เมทริกซ์ถ่วงน้ำหนักรายวิชาเรียนเข้าสู่ 5 มิติทักษะ
const ACADEMIC_WEIGHT_MATRIX = {
  logic:      { math: 0.90, science: 0.10, thai: 0.00, english: 0.00, social: 0.00 },
  science:    { math: 0.10, science: 0.90, thai: 0.00, english: 0.00, social: 0.00 },
  language:   { math: 0.00, science: 0.00, thai: 0.50, english: 0.50, social: 0.00 },
  art:        { math: 0.00, science: 0.00, thai: 0.30, english: 0.15, social: 0.55 },
  management: { math: 0.15, science: 0.00, thai: 0.10, english: 0.10, social: 0.65 }
};

const ACADEMIC_WEIGHT = 0.30;
const ASSESSMENT_WEIGHT = 0.70;

export function calculateSkillVector(academicGrades, assessmentResponses, targetPath = null, likes = [], dislikes = []) {
  // แปลงสเกล GPAX รายวิชาสะสม (0.00-4.00) เป็นช่วง 0.0 - 1.0
  const normGrades = {
    math: (academicGrades.math || 0) / 4,
    science: (academicGrades.science || 0) / 4,
    thai: (academicGrades.thai || 0) / 4,
    english: (academicGrades.english || 0) / 4,
    social: (academicGrades.social || 0) / 4,
  };

  const baseVector = [0, 0, 0, 0, 0];
  const dimKeys = ['logic', 'science', 'language', 'art', 'management'];

  // คำนวณคะแนนส่วนเกรดวิชาเรียน (น้ำหนัก 30%)
  dimKeys.forEach((dim, index) => {
    const weights = ACADEMIC_WEIGHT_MATRIX[dim];
    const val = (
      normGrades.math * weights.math +
      normGrades.science * weights.science +
      normGrades.thai * weights.thai +
      normGrades.english * weights.english +
      normGrades.social * weights.social
    );
    baseVector[index] += val * ACADEMIC_WEIGHT;
  });

  // คำนวณคะแนนส่วนแบบทดสอบสถานการณ์ (น้ำหนัก 70%)
  if (assessmentResponses && assessmentResponses.length > 0) {
    let relevantResponses = assessmentResponses;

    if (targetPath) {
      const clusterKey = TARGET_CLUSTERS[targetPath];
      if (clusterKey) {
        const TARGETED_PREFIXES = {
          'medical': ['M101', 'M102', 'M103', 'M104', 'M105', 'M106'],
          'engineering': ['E201', 'E202', 'E203', 'E204', 'E205', 'E206'],
          'science': ['S301', 'S302', 'S303', 'S304', 'S305', 'S306'],
          'business': ['B401', 'B402', 'B403', 'B404', 'B405', 'B406'],
          'creative': ['C501', 'C502', 'C503', 'C504', 'C505', 'C506'],
          'social': ['L601', 'L602', 'L603', 'L604', 'L605', 'L606']
        };
        const allowedPrefixes = TARGETED_PREFIXES[clusterKey] || [];

        relevantResponses = assessmentResponses.filter(response => {
          const qId = response.questionId || '';
          return allowedPrefixes.some(prefix => qId.startsWith(prefix));
        });
      }
    } else {
      // โหมดค้นหาตัวตน (Discovery Mode): กรองใช้เฉพาะคำถามแบบทดสอบทั่วไป (ด่าน 1-12)
      relevantResponses = assessmentResponses.filter(response => {
        const qId = response.questionId || '';
        return /^S(?:[1-9]|1[0-2])Q/.test(qId);
      });
      if (relevantResponses.length === 0) {
        relevantResponses = assessmentResponses;
      }
    }

    if (relevantResponses.length > 0) {
      const accumulated = [0, 0, 0, 0, 0];
      let validCount = 0;

      // นับจำนวนคำตอบอิสระที่พิมพ์ข้อความซ้ำกัน
      const customTextFrequency = {};
      relevantResponses.forEach(r => {
        if (r.customText) {
          const norm = r.customText.trim().toLowerCase();
          customTextFrequency[norm] = (customTextFrequency[norm] || 0) + 1;
        }
      });

      relevantResponses.forEach(response => {
        let isInvalid = false;
        if (response.customText) {
          const norm = response.customText.trim().toLowerCase();
          if (isProfanityOrGibberish(response.customText) || customTextFrequency[norm] > 1) {
            isInvalid = true;
          }
        }

        if (!isInvalid) {
          validCount++;
          dimKeys.forEach((dim, index) => {
            let val = response[dim] !== undefined ? response[dim] : (response.weights?.[dim] || 0);
            if (val === 0 && response.customText) {
              val = 0.4;
            }
            accumulated[index] += val;
          });
        }
      });

      if (validCount > 0) {
        const totalExpected = targetPath ? 36 : 144;
        const progressRatio = Math.min(1, validCount / totalExpected);
        const progressFactor = 0.3 + 0.7 * progressRatio;

        dimKeys.forEach((dim, index) => {
          const avgWeight = accumulated[index] / validCount;
          const normalizedDim = Math.min(1, avgWeight / 0.55);
          baseVector[index] += normalizedDim * ASSESSMENT_WEIGHT * progressFactor;
        });
      }
    }
  }

  // ปรับค่าน้ำหนักเสริมเบาๆ จากสิ่งชอบ (Realistic & Natural Subtle Boost +0.05)
  // เพื่อไม่ให้กราฟ My Skill Matrix บวมโตบิดเบี้ยวเฟ้อจนเกินความเป็นจริง
  if (Array.isArray(likes) && likes.length > 0) {
    const boostAcc = [0, 0, 0, 0, 0];
    likes.forEach(like => {
      const norm = like.toLowerCase();
      if (norm.includes('ai') || norm.includes('โค้ด') || norm.includes('โปรแกรม') || norm.includes('เทคโนโลยี') || norm.includes('ไอที') || norm.includes('คอมพิวเตอร์') || norm.includes('เกม') || norm.includes('esports')) {
        boostAcc[0] += 0.05; // Subtle Logic Boost (+0.05)
        boostAcc[1] += 0.03; // Subtle Science Boost (+0.03)
      }
      if (norm.includes('บริหาร') || norm.includes('ธุรกิจ') || norm.includes('วางแผน') || norm.includes('การเงิน') || norm.includes('การตลาด')) {
        boostAcc[4] += 0.05; // Subtle Management Boost (+0.05)
        boostAcc[0] += 0.03; // Subtle Logic Boost (+0.03)
      }
      if (norm.includes('ศิลปะ') || norm.includes('ออกแบบ') || norm.includes('วาด') || norm.includes('ดนตรี') || norm.includes('การแสดง') || norm.includes('กราฟิก')) {
        boostAcc[3] += 0.05; // Subtle Art Boost (+0.05)
        boostAcc[2] += 0.03; // Subtle Language Boost (+0.03)
      }
      if (norm.includes('ภาษา') || norm.includes('สื่อสาร') || norm.includes('อังกฤษ') || norm.includes('นิเทศ')) {
        boostAcc[2] += 0.05; // Subtle Language Boost (+0.05)
      }
      if (norm.includes('วิทย์') || norm.includes('ทดลอง') || norm.includes('เคมี') || norm.includes('หมอ') || norm.includes('รักษา')) {
        boostAcc[1] += 0.05; // Subtle Science Boost (+0.05)
      }
    });

    for (let i = 0; i < 5; i++) {
      baseVector[i] = Math.min(1.0, baseVector[i] + Math.min(0.08, boostAcc[i]));
    }
  }

  // ปรับจำกัดค่าสุทธิให้อยู่ในช่วง 0.0 ถึง 1.0
  return baseVector.map(val => Math.min(Math.max(val, 0), 1));
}
