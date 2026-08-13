import { calculateMatchPercentage } from './cosineSimilarity';
import { SELF_ASSESSMENT_SUBJECTS } from '../constants/selfAssessmentSubjects';

// Weights for portfolio items based on prestige level and type
const PORTFOLIO_WEIGHTS = {
  national_award: 1.0,      // รางวัลระดับประเทศ/นานาชาติ
  provincial_award: 0.7,    // รางวัลระดับจังหวัด/ภาค
  school_award: 0.4,        // รางวัลระดับโรงเรียน
  participant: 0.3,         // เข้าร่วมกิจกรรม/อบรม/สัมมนา
  volunteer: 0.3,           // กิจกรรมจิตอาสา/บำเพ็ญประโยชน์
  leadership: 0.5,          // ตำแหน่งผู้นำ/ประธาน/หัวหน้า
  academic_camp: 0.6,       // ค่ายวิชาการ (สอวน. / ค่ายคณะ)
  project: 0.7,             // โครงงาน/วิจัย/สิ่งประดิษฐ์
};

// Preset item prestige mapping based on text search
const PRESET_ITEM_WEIGHTS = {
  // High prestige (1.0)
  'สอวน. ค่าย 2 ขึ้นไป': 1.0,
  'โอลิมปิกวิชาการ (สอวน. ค่าย 1 ขึ้นไป)': 0.85,
  'รางวัลระดับประเทศ/นานาชาติ': 1.0,
  'ชนะเลิศการแข่งขันวิชาการระดับประเทศ': 1.0,
  'เหรียญรางวัลการแข่งขันระดับชาติ': 1.0,

  // Medium-High prestige (0.6 - 0.7)
  'สอวน. ค่าย 1': 0.75,
  'ผ่านการอบรมค่ายวิชาการของมหาวิทยาลัย': 0.6,
  'โครงงานวิจัย/สิ่งประดิษฐ์มีผลงานเป็นรูปธรรม': 0.7,
  'รางวัลระดับจังหวัด/ระดับภาค': 0.7,
  'เกียรติบัตรการแข่งขันทักษะวิชาการระดับเขต/จังหวัด': 0.6,

  // Medium prestige (0.4 - 0.5)
  'ประธานนักเรียน/หัวหน้าชมรม/ผู้นำกิจกรรม': 0.5,
  'เกียรติบัตรเรียนดี/ผลการเรียนโดดเด่น': 0.4,
  'รางวัลระดับโรงเรียน': 0.4,
  'ผ่านการฝึกงาน/สังเกตการณ์ในสถานพยาบาลหรือหน่วยงานจริง': 0.6,
  'ผ่านการทดสอบวัดระดับภาษาต่างประเทศ': 0.5,
  'ผลงานออกแบบ/สื่อ/บทความ/ผลงานสร้างสรรค์': 0.5,

  // Basic participation (0.2 - 0.3)
  'เข้าร่วมกิจกรรมจิตอาสา/บำเพ็ญประโยชน์': 0.3,
  'เข้าร่วมค่าย/เสวนา/งานเปิดบ้านมหาวิทยาลัย (Open House)': 0.2,
  'ผ่านการอบรมคอร์สออนไลน์มีเกียรติบัตร': 0.3,
  'สมาชิกชมรม/ผู้ร่วมจัดกิจกรรม': 0.2,
};

/**
 * Normalizes a portfolio item into a structured object with weight metadata.
 * Handles both string presets and custom activity objects.
 * 
 * @param {string|Object} item - Raw portfolio item from profile
 * @returns {Object} Normalized item with text, categoryId, level, award, and weight
 */
export function normalizePortfolioItem(item) {
  if (typeof item === 'string') {
    const isPosn = item.includes('สอวน.') || item.includes('โอลิมปิกวิชาการ');
    return {
      text: item,
      categoryId: 'preset',
      weight: PRESET_ITEM_WEIGHTS[item] || (isPosn ? 1.0 : 0.3)
    };
  }

  if (typeof item === 'object' && item !== null) {
    const text = item.text || item.title || item.name || '';
    const isPosn = text.includes('สอวน.') || text.includes('โอลิมปิกวิชาการ');
    
    let weight = 0.3; // Default participation weight

    // Check POSN camp attributes (สอวน. ผู้แทนประเทศ / ค่าย 3 / ค่าย 2 / ค่าย 1) FIRST
    if (item.posnCamp === 'team' || item.level === 'international') {
      weight = 2.5; // Highest prestige: National Representative / International
    } else if (item.posnCamp === 'camp3' || item.posnCamp === 'national' || item.level === 'national' || item.award === 'gold' || item.award === 'first') {
      weight = 2.0; // POSN Camp 3 / Gold Medal National
    } else if (item.posnCamp === 'camp2' || item.level === 'provincial' || item.award === 'silver' || item.award === 'second') {
      weight = 1.5; // POSN Camp 2 / Provincial Silver
    } else if (item.posnCamp === 'camp1') {
      weight = 1.0; // POSN Camp 1
    } else if (PRESET_ITEM_WEIGHTS[text]) {
      weight = PRESET_ITEM_WEIGHTS[text];
    } else if (isPosn) {
      weight = 1.0;
    } else if (item.level === 'school' || item.award === 'bronze' || item.award === 'third') {
      weight = PORTFOLIO_WEIGHTS.school_award;
    } else if (item.categoryId && PORTFOLIO_WEIGHTS[item.categoryId]) {
      weight = PORTFOLIO_WEIGHTS[item.categoryId];
    }

    return {
      ...item,
      text,
      weight
    };
  }

  return { text: '', categoryId: 'unknown', weight: 0.1 };
}

/**
 * Calculates the weight value for a single portfolio item.
 * Higher prestige activities get higher weights. Repeated categories get diminishing returns.
 * 
 * @param {Object} item - Normalized portfolio item
 * @returns {number} Weight value (0.1 to 1.5)
 */
export function calculateItemWeight(item) {
  const baseWeight = item.weight || 0.3;
  
  // Bonus weight if description or proof details are provided
  let bonus = 0;
  if (item.desc && item.desc.length > 20) bonus += 0.1;
  if (item.hasProof || item.certificateUrl) bonus += 0.1;

  // Apply diminishing returns multiplier for repeated items
  const count = Math.max(1, item.count || 1);
  const multiplier = 1 + (count - 1) * 0.5;
  return (baseWeight + bonus) * multiplier;
}

/**
 * Calculates the comprehensive readiness percentage for Target Lock mode (TCAS Round 1: Portfolio Focus).
 * Evaluates readiness across 3 core TCAS Round 1 portfolio pillars:
 *   - Skill & Academic Competency Alignment (Skill Match)
 *   - Portfolio Achievements & Extra-Curricular Track Record (Portfolio Score)
 *   - Self-Assessment Confidence & Specific Subject Competencies (Self-Assessment Score)
 * 
 * In TCAS Round 1, Portfolio is the MANDATORY GATEKEEPER. If portfolio score is near zero or very low,
 * a Gatekeeper Multiplier is applied to prevent inflated readiness scores for candidates without portfolio items.
 * 
 * @param {number[]} skillVector - User's 5-dimension skill vector [logic, science, language, art, management]
 * @param {number[]} benchmark - Target path's benchmark vector
 * @param {Array} portfolio - Array of portfolio items (either strings or objects)
 * @param {Object} selfAssessment - Object mapping subject IDs to ratings (1-5)
 * @param {Array} [customActivities=[]] - Custom activities array
 * @returns {number} - Readiness percentage (0-100)
 */
export function calculateReadiness(skillVector, benchmark, portfolio, selfAssessment, customActivities = [], targetPath = null, educationLevel = 'senior') {
  // Factor 1: Skill Match Alignment (20% weight)
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
  // ปัจจัยที่ 2: คะแนนสะสมผลงาน (Portfolio Score: 70% น้ำหนักหลักสำหรับ TCAS รอบ 1)
  // ==========================================
  let portfolioWeightSum = 0;
  allItems.forEach(rawItem => {
    if (!rawItem) return;
    const item = normalizePortfolioItem(rawItem);
    portfolioWeightSum += calculateItemWeight(item);
  });
  
  const portfolioScore = Math.min(100, portfolioWeightSum * 40);

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
  // การรวมคะแนนถ่วงน้ำหนักตามระดับชั้น
  // ==========================================
  const skillWeight = isJunior ? 0.30 : 0.20;
  const portfolioWeight = isJunior ? 0.60 : 0.70;
  const saWeight = 0.10;

  const rawReadiness = Math.round(
    skillMatch * skillWeight +
    portfolioScore * portfolioWeight +
    saScore * saWeight
  );

  // ==========================================
  // TCAS Round 1 Portfolio Gatekeeper Multiplier (เงื่อนไขคัดออกคอขวดผลงานพอร์ตโฟลิโอ)
  // ใน TCAS รอบ 1 แม้เกรดจะสูง แต่ถ้าไม่มีผลงานตรงสาย จะไม่ผ่านการคัดเลือกเอกสารรอบแรก
  // ==========================================
  let gatekeeperMultiplier = 1.0;
  if (!isJunior) {
    if (portfolioScore < 15) {
      // ผลงานน้อยมากๆ หรือแทบไม่มีผลงานตรงสาย ถูกบีบเพดานความพร้อมไม่เกิน ~45%
      gatekeeperMultiplier = 0.45;
    } else if (portfolioScore < 35) {
      // ผลงานยังไม่แน่น มีน้อย ถูกบีบเพดานความพร้อมไม่เกิน ~65%
      gatekeeperMultiplier = 0.65;
    }
  }

  const readiness = Math.round(rawReadiness * gatekeeperMultiplier);

  return Math.min(100, Math.max(0, readiness));
}

/**
 * Categorizes Readiness score into readiness tiers.
 * 
 * @param {number} score - Readiness percentage (0-100)
 * @returns {Object} Tier info with label, color, description, and recommendation
 */
export function getReadinessTier(score) {
  if (score >= 80) {
    return {
      tier: 'ready',
      label: 'พร้อมยื่น TCAS รอบ 1',
      color: '#16A34A',
      bgColor: '#DCFCE7',
      borderColor: '#86EFAC',
      description: 'ผลงานและทักษะของคุณอยู่ในระดับดีเยี่ยม สอดคล้องกับเกณฑ์การคัดเลือกรอบ Portfolio อย่างสมบูรณ์',
      recommendation: 'เน้นการจัดรูปเล่มพอร์ตโฟลิโอให้สวยงาม กระชับ และฝึกซ้อมตอบคำถามสอบสัมภาษณ์'
    };
  }

  if (score >= 50) {
    return {
      tier: 'moderate',
      label: 'ปานกลาง - ต้องเติมผลงานอีกเล็กน้อย',
      color: '#D97706',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
      description: 'มีฐานเกรดและทักษะที่ดี แต่ปริมาณหรือความโดดเด่นของผลงานในพอร์ตโฟลิโอยังต้องเสริมให้แน่นขึ้น',
      recommendation: 'เร่งเข้าร่วมค่ายวิชาการ แข่งขันทักษะ หรือทำโครงงานตรงสายเพิ่มเติมเพื่อเพิ่มคะแนนพอร์ต'
    };
  }

  return {
    tier: 'low',
    label: 'ต้องเร่งสะสมผลงานด่วน (เสี่ยงไม่ผ่านสกรีนรอบ 1)',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    description: 'แม้มิติทักษะจะสอดคล้อง แต่ปริมาณผลงานตรงสายยังน้อยเกินไป ซึ่งใน TCAS รอบ 1 แฟ้มสะสมผลงานคือตัวชี้ขาด',
    recommendation: 'วางแผนลงทะเบียนอบรมทำโปรเจกต์ ล่าเกียรติบัตร และทำกิจกรรมตรงสายโดยด่วนเพื่อไม่ให้ถูกคัดออกในรอบสกรีนเอกสาร'
  };
}
