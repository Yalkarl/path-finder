import { calculateMatchPercentage } from './cosineSimilarity';
import { SELF_ASSESSMENT_SUBJECTS } from '../constants/selfAssessmentSubjects';

// ==========================================
// การแปลงข้อมูลผลงาน (Portfolio Item Normalization)
// ==========================================
function normalizePortfolioItem(item) {
  if (typeof item === 'string') {
    const text = item;
    let categoryId = 'academic';
    let level = 'local';
    let award = 'none';
    let role = 'member';
    let count = 1;
    let posnCamp = null;
    let posnSubject = null;

    if (text.includes('ค่าย') || text.includes('อบรม')) {
      categoryId = 'camp';
    } else if (text.includes('จิตอาสา') || text.includes(' volunteer') || text.includes('ช่วยเหลือ')) {
      categoryId = 'volunteer';
    } else if (text.includes('ประธาน') || text.includes('ผู้นำ') || text.includes('กรรมการ') || text.includes('หัวหน้า')) {
      categoryId = 'leadership';
    } else if (text.includes('โครงงาน') || text.includes('วิจัย') || text.includes('สิ่งประดิษฐ์')) {
      categoryId = 'project';
    }

    if (text.includes('นานาชาติ') || text.includes('ต่างประเทศ')) {
      level = 'international';
    } else if (text.includes('ระดับชาติ') || text.includes('ประเทศ')) {
      level = 'national';
    } else if (text.includes('ภูมิภาค') || text.includes('จังหวัด') || text.includes('ระดับภาค')) {
      level = 'regional';
    }

    if (text.includes('ชนะเลิศ') || text.includes('เหรียญทอง') || text.includes('ประธาน') || text.includes('แกนนำหลัก') || text.includes('หัวหน้า')) {
      award = 'winner';
      role = 'leader';
    } else if (text.includes('รองชนะเลิศอันดับ 1') || text.includes('เหรียญเงิน') || text.includes('รองประธาน') || text.includes('ผู้ช่วยแกนนำ')) {
      award = 'runner_up_1';
      role = 'co_leader';
    } else if (text.includes('รองชนะเลิศอันดับ 2') || text.includes('เหรียญทองแดง') || text.includes('คณะทำงาน') || text.includes('กรรมการ')) {
      award = 'runner_up_2';
      role = 'committee';
    } else if (text.includes('ชมเชย') || text.includes('ผู้ประสานงาน') || text.includes('ช่วยงาน')) {
      award = 'honorable';
      role = 'cooperator';
    }

    if (text.includes('สอวน.') || text.includes('โอลิมปิกวิชาการ')) {
      posnCamp = 'camp1';
      if (text.includes('ค่าย 2')) posnCamp = 'camp2';
      else if (text.includes('ค่าย 3') || text.includes('ผู้แทนศูนย์')) posnCamp = 'national';
      else if (text.includes('ผู้แทนประเทศ')) posnCamp = 'team';
    }

    return {
      categoryId,
      text,
      level,
      award,
      role,
      count,
      posnCamp,
      posnSubject
    };
  }

  // If already an object, return with standard defaults filled in
  return {
    categoryId: item.categoryId || 'academic',
    text: item.text || '',
    level: item.level || 'local',
    award: item.award || 'none',
    role: item.role || 'member',
    count: typeof item.count === 'number' ? item.count : 1,
    posnCamp: item.posnCamp || null,
    posnSubject: item.posnSubject || null,
    desc: item.desc || ''
  };
}

/**
 * Calculates the weight score for a normalized portfolio item.
 * 
 * @param {Object} item - Normalized portfolio item
 * @returns {number} - Prestige weight
 */
function calculateItemWeight(item) {
  // 0. Junior High Exam Prep Status Mappings
  const JUNIOR_ITEMS_WEIGHTS = {
    'เรียนเก็บเนื้อหาบทเรียน ม.ต้น (ม.1-ม.3) ครบถ้วนแล้ว': 2.5,
    'เริ่มเรียนเนื้อหาล่วงหน้าของ ม.ปลาย บ้างแล้ว': 2.5,
    'อยู่ในชั่วโมงตะลุยโจทย์ข้อสอบเก่า / ข้อสอบเข้า ม.4': 2.0,
    'ผ่านคอร์สติวเข้มข้นเฉพาะสายวิชา (เช่น ติวเข้มคณิต-วิทย์ หรือคอร์สเตรียมโดม)': 1.5,
    'เคยเข้าร่วมการทดสอบ Pre-Test ของโรงเรียนต่าง ๆ (เช่น Pre-Test ม.4 โรงเรียนสตรีพัทลุง หรือโรงเรียนดัง)': 2.0,
    'เคยแข่งขันทักษะวิชาการระดับ ม.ต้น (เช่น งานศิลปหัตถกรรมนักเรียน)': 1.5,
    'เคยสอบแข่งขันวัดระดับระดับ ม.ต้น (เช่น สสวท. ม.ต้น, ASMO, TEDET)': 2.5
  };

  if (JUNIOR_ITEMS_WEIGHTS[item.text] !== undefined) {
    const count = Math.max(1, item.count || 1);
    return JUNIOR_ITEMS_WEIGHTS[item.text] * count;
  }

  // 1. POSN/Olympiad Camp Prestige Weights
  const isPosn = item.posnCamp || item.text.includes('สอวน.') || item.text.includes('โอลิมปิกวิชาการ');
  
  if (isPosn) {
    let baseWeight = 3.0; // ค่าย 1 สอวน. เริ่มต้น
    const camp = item.posnCamp || 'camp1';
    
    if (camp === 'camp1') baseWeight = 3.0;
    else if (camp === 'camp2') baseWeight = 6.0;
    else if (camp === 'national') baseWeight = 9.0;
    else if (camp === 'team') baseWeight = 12.0;

    // คำนวณการลดทอนค่าน้ำหนักกรณีทำกิจกรรมเดิมซ้ำ
    const count = Math.max(1, item.count || 1);
    const multiplier = 1 + (count - 1) * 0.5;
    return baseWeight * multiplier;
  }

  // 2. Standard Items (Competitions vs General Activities)
  const isComp = item.categoryId === 'academic' || item.categoryId === 'project';
  let baseWeight = 1.0;
  let bonus = 0.0;

  if (isComp) {
    // ค่าน้ำหนักระดับความสำคัญของกิจกรรม
    if (item.level === 'international') baseWeight = 5.0;
    else if (item.level === 'national') baseWeight = 3.0;
    else if (item.level === 'regional') baseWeight = 2.0;
    else baseWeight = 1.0;

    // Award Bonus
    if (item.award === 'winner' || item.award === 'gold') bonus = 2.0;
    else if (item.award === 'runner_up_1' || item.award === 'runnerup1' || item.award === 'silver') bonus = 1.5;
    else if (item.award === 'runner_up_2' || item.award === 'runnerup2' || item.award === 'bronze') bonus = 1.0;
    else if (item.award === 'honorable') bonus = 0.5;

    // Custom check for below standard standardized exams
    if (item.award === 'below_standard') {
      baseWeight = 0.5;
      bonus = 0.0;
    }
  } else {
    // ค่าน้ำหนักระดับความสำคัญของกิจกรรม
    if (item.level === 'international') baseWeight = 3.0;
    else if (item.level === 'national') baseWeight = 2.0;
    else if (item.level === 'regional') baseWeight = 1.5;
    else baseWeight = 1.0;

    // Role Bonus
    if (item.role === 'leader' || item.role === 'president') bonus = 1.0;
    else if (item.role === 'co_leader' || item.role === 'vice_president' || item.role === 'runnerup1') bonus = 0.75;
    else if (item.role === 'committee' || item.role === 'runnerup2') bonus = 0.5;
    else if (item.role === 'cooperator' || item.role === 'honorable') bonus = 0.25;
  }

  // Apply diminishing returns multiplier for repeated items
  const count = Math.max(1, item.count || 1);
  const multiplier = 1 + (count - 1) * 0.5;
  return (baseWeight + bonus) * multiplier;
}

/**
 * Calculates the comprehensive readiness percentage for Target Lock mode.
 * Combines 3 factors:
 *   - Skill Match (30%): cosine similarity between user's skill vector and target benchmark
 *   - Portfolio Score (60%): based on number/prestige of activities checked (capped at 10 weight sum = 100%)
 *   - Self-Assessment Score (10%): average of self-assessment ratings (1-5 scale)
 * 
 * @param {number[]} skillVector - User's 5-dimension skill vector [logic, science, language, art, management]
 * @param {number[]} benchmark - Target path's benchmark vector
 * @param {Array} portfolio - Array of portfolio items (either strings or objects)
 * @param {Object} selfAssessment - Object mapping subject IDs to ratings (1-5)
 * @param {Array} [customActivities=[]] - Custom activities array
 * @returns {number} - Readiness percentage (0-100)
 */
export function calculateReadiness(skillVector, benchmark, portfolio, selfAssessment, customActivities = [], targetPath = null, educationLevel = 'senior') {
  // Factor 1: Skill Match (40% for junior, 20% for senior)
  const skillMatch = calculateMatchPercentage(skillVector, benchmark);

  // Filter portfolio items based on education level to prevent cross-contamination
  const isJunior = educationLevel === 'junior';
  const JUNIOR_PREP_ITEMS = [
    'เรียนเก็บเนื้อหาบทเรียน ม.ต้น (ม.1-ม.3) ครบถ้วนแล้ว',
    'เริ่มเรียนเนื้อหาล่วงหน้าของ ม.ปลาย บ้างแล้ว',
    'อยู่ในชั่วโมงตะลุยโจทย์ข้อสอบเก่า / ข้อสอบเข้า ม.4',
    'ผ่านคอร์สติวเข้มข้นเฉพาะสายวิชา (เช่น ติวเข้มคณิต-วิทย์ หรือคอร์สเตรียมโดม)',
    'เคยเข้าร่วมการทดสอบ Pre-Test ของโรงเรียนต่าง ๆ (เช่น Pre-Test ม.4 โรงเรียนสตรีพัทลุง หรือโรงเรียนดัง)',
    'เคยแข่งขันทักษะวิชาการระดับ ม.ต้น (เช่น งานศิลปหัตถกรรมนักเรียน)',
    'เคยสอบแข่งขันวัดระดับระดับ ม.ต้น (เช่น สสวท. ม.ต้น, ASMO, TEDET)'
  ];

  const filteredPortfolio = (portfolio || []).filter(rawItem => {
    if (!rawItem) return false;
    const text = typeof rawItem === 'string' ? rawItem : rawItem.text;
    const isJuniorItem = JUNIOR_PREP_ITEMS.includes(text);
    return isJunior ? isJuniorItem : !isJuniorItem;
  });

  // รวมรายการผลงานและกิจกรรมเสริม
  const allItems = [
    ...filteredPortfolio,
    ...(customActivities || [])
  ];

  // ==========================================
  // ปัจจัยที่ 2: คะแนนสะสมผลงาน (Portfolio Score: 60% ม.ต้น / 70% ม.ปลาย)
  // ==========================================
  let portfolioWeightSum = 0;
  allItems.forEach(rawItem => {
    if (!rawItem) return;
    const item = normalizePortfolioItem(rawItem);
    portfolioWeightSum += calculateItemWeight(item);
  });
  
  const portfolioScore = Math.min(100, portfolioWeightSum * 10);

  // ==========================================
  // ปัจจัยที่ 3: คะแนนประเมินตนเอง (Self-Assessment Score: 10%)
  // ==========================================
  let saValues = [];
  if (targetPath && SELF_ASSESSMENT_SUBJECTS[targetPath]) {
    const targetSubjects = SELF_ASSESSMENT_SUBJECTS[targetPath].map(sub => sub.id);
    targetSubjects.forEach(subId => {
      if (selfAssessment && selfAssessment[subId] !== undefined) {
        saValues.push(selfAssessment[subId]);
      }
    });
  }

  if (saValues.length === 0) {
    saValues = Object.values(selfAssessment || {});
  }

  const saAvg = saValues.length > 0
    ? saValues.reduce((sum, val) => sum + val, 0) / saValues.length
    : 3;
  const saScore = Math.round(((saAvg - 1) / 4) * 100);

  // ==========================================
  // การรวมคะแนนถ่วงน้ำหนักตามระดับชั้น (ม.ต้น vs ม.ปลาย)
  // ==========================================
  const skillWeight = isJunior ? 0.30 : 0.20;
  const portfolioWeight = isJunior ? 0.60 : 0.70;
  const saWeight = 0.10;

  const readiness = Math.round(
    skillMatch * skillWeight +
    portfolioScore * portfolioWeight +
    saScore * saWeight
  );

  return Math.min(100, Math.max(0, readiness));
}
