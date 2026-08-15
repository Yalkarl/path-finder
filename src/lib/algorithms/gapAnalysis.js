import { normalizePortfolioItem, calculateItemWeight } from './readinessCalculator';

/**
 * Maps portfolio/activity items to the 5 skill dimensions based on keywords in their text.
 * Each item can contribute to multiple dimensions.
 * Returns an array of { dimIndex, weight } for each matched dimension.
 */
function mapItemToDimensions(text) {
  const textUpper = (text || '').toUpperCase();
  const hits = [];

  // ==========================================
  // Dimension 0: ตรรกะ (Logic)
  // ==========================================
  const logicKeywords = [
    'คณิต', 'MATH', 'ตรรกะ', 'LOGIC', 'โปรแกรม', 'เขียนโค้ด', 'CODE', 'CODING',
    'ซอฟต์แวร์', 'SOFTWARE', 'คอมพิวเตอร์', 'COMPUTER', 'ALGORITHM', 'อัลกอริ',
    'AI', 'ปัญญาประดิษฐ์', 'HACKATHON', 'ROBOT', 'หุ่นยนต์', 'IOT',
    'วิศวกรรม', 'ENGINEERING', 'สถิติ', 'STAT', 'DATA', 'เกม',
    'สอวน', 'โอลิมปิก', 'POSN', 'แอป', 'APP', 'เว็บ', 'WEB',
    'ดาราศาสตร์', 'ฟิสิกส์', 'PHYSICS'
  ];
  if (logicKeywords.some(kw => textUpper.includes(kw))) {
    hits.push({ dimIndex: 0, weight: 1.0 });
  }

  // ==========================================
  // Dimension 1: วิทยาศาสตร์ (Science)
  // ==========================================
  const scienceKeywords = [
    'วิทยาศาสตร์', 'SCIENCE', 'เคมี', 'CHEM', 'ชีววิทยา', 'BIO', 'ฟิสิกส์', 'PHYSICS',
    'แพทย์', 'หมอ', 'MEDICINE', 'ทันตแพทย์', 'เภสัช', 'PHARM', 'สัตวแพทย์', 'VET',
    'พยาบาล', 'NURS', 'สาธารณสุข', 'HEALTH', 'สุขภาพ', 'อาหาร', 'FOOD',
    'สิ่งแวดล้อม', 'ENVIRONMENT', 'นิเวศ', 'สอวน', 'โอลิมปิก',
    'วิจัย', 'RESEARCH', 'โครงงานวิทย', 'ทดลอง', 'LAB', 'กีฬา', 'SPORT',
    'สมรรถภาพ', 'สรีรวิทยา', 'ดาราศาสตร์'
  ];
  if (scienceKeywords.some(kw => textUpper.includes(kw))) {
    hits.push({ dimIndex: 1, weight: 1.0 });
  }

  // ==========================================
  // Dimension 2: ภาษา (Language)
  // ==========================================
  const languageKeywords = [
    'ภาษา', 'LANGUAGE', 'ENGLISH', 'อังกฤษ', 'IELTS', 'TOEFL', 'TOEIC', 'SAT',
    'ญี่ปุ่น', 'JAPANESE', 'จีน', 'CHINESE', 'เกาหลี', 'KOREAN', 'ฝรั่งเศส', 'FRENCH',
    'เยอรมัน', 'GERMAN', 'สเปน', 'SPANISH', 'แปล', 'TRANSLAT', 'วรรณกรรม', 'LITERAT',
    'เขียน', 'WRITING', 'บทความ', 'ARTICLE', 'พอดแคสต์', 'PODCAST', 'พูด', 'SPEAK',
    'โต้วาที', 'DEBATE', 'พิธีกร', 'MC', 'นิเทศ', 'COMMUNICAT', 'สื่อ', 'MEDIA',
    'หนังสือ', 'BOOK', 'บล็อก', 'BLOG', 'ข่าว', 'NEWS', 'กฎหมาย', 'LAW', 'นิติ',
    'อักษร', 'มนุษย', 'HUMANIT', 'ศิลปศาสตร์', 'LIBERAL',
    'รัฐศาสตร์', 'POLITICAL', 'สังคม', 'SOCIAL'
  ];
  if (languageKeywords.some(kw => textUpper.includes(kw))) {
    hits.push({ dimIndex: 2, weight: 1.0 });
  }

  // ==========================================
  // Dimension 3: ศิลปะ (Art)
  // ==========================================
  const artKeywords = [
    'ศิลป', 'ART', 'ออกแบบ', 'DESIGN', 'สถาปัตย', 'ARCHITECT', 'กราฟิก', 'GRAPHIC',
    'ภาพ', 'PHOTO', 'วาด', 'DRAW', 'PAINT', 'ดนตรี', 'MUSIC', 'เพลง', 'SONG',
    'เต้น', 'DANCE', 'การแสดง', 'PERFORM', 'ภาพยนตร์', 'FILM', 'อนิเมชัน', 'ANIMAT',
    'คราฟต์', 'CRAFT', 'โมเดล', 'MODEL', 'ประติมากรรม', 'SCULPT', 'จิตรกรรม',
    'ตกแต่ง', 'INTERIOR', 'สร้างสรรค์', 'CREATIVE', 'มัลติมีเดีย', 'MULTIMEDIA',
    'นิทรรศการ', 'EXHIBIT', 'แฟชั่น', 'FASHION'
  ];
  if (artKeywords.some(kw => textUpper.includes(kw))) {
    hits.push({ dimIndex: 3, weight: 1.0 });
  }

  // ==========================================
  // Dimension 4: การบริหาร (Management)
  // ==========================================
  const managementKeywords = [
    'ผู้นำ', 'LEADER', 'ประธาน', 'PRESIDENT', 'หัวหน้า', 'HEAD', 'บริหาร', 'MANAGE',
    'ธุรกิจ', 'BUSINESS', 'การตลาด', 'MARKET', 'เศรษฐ', 'ECONOM', 'การเงิน', 'FINANC',
    'จิตอาสา', 'VOLUNTEER', 'ชุมชน', 'COMMUNIT', 'กรรมการ', 'COMMITTEE',
    'จัดกิจกรรม', 'EVENT', 'โครงการ', 'PROJECT', 'ระดมทุน', 'FUND',
    'ชมรม', 'CLUB', 'คณะกรรมการ', 'BOARD', 'องค์กร', 'ORGANIZ',
    'STARTUP', 'PITCH', 'การโรงแรม', 'HOTEL', 'ท่องเที่ยว', 'TOURISM',
    'โลจิสติกส์', 'LOGISTIC', 'บัญชี', 'ACCOUNT', 'ครู', 'TEACH', 'จิตวิทยา', 'PSYCHO',
    'รณรงค์', 'CAMPAIGN', 'สอนหนังสือ'
  ];
  if (managementKeywords.some(kw => textUpper.includes(kw))) {
    hits.push({ dimIndex: 4, weight: 1.0 });
  }

  // ==========================================
  // Fallback: หากไม่ตรงกับมิติใดเลย ให้กระจายเบาๆ ทั่วไป
  // ==========================================
  if (hits.length === 0) {
    hits.push(
      { dimIndex: 0, weight: 0.3 },
      { dimIndex: 1, weight: 0.3 },
      { dimIndex: 2, weight: 0.3 },
      { dimIndex: 3, weight: 0.3 },
      { dimIndex: 4, weight: 0.3 }
    );
  }

  return hits;
}

/**
 * Calculates the portfolio boost per dimension.
 * Portfolio items are mapped to skill dimensions and their weights are summed up.
 * The summed weight is then normalized to a 0-1 scale to represent the portfolio's
 * contribution to each dimension.
 *
 * @param {Array} portfolio - Raw portfolio items (strings or objects)
 * @param {Array} customActivities - Custom activities array
 * @param {Array} aiCustomEvaluations - AI custom activity evaluations
 * @returns {number[]} Portfolio boost vector (5 dimensions, each 0 to ~1)
 */
function calculatePortfolioBoost(portfolio = [], customActivities = [], aiCustomEvaluations = []) {
  const dimBoosts = [0, 0, 0, 0, 0]; // [logic, science, language, art, management]

  const allItems = [
    ...(portfolio || []),
    ...(customActivities || [])
  ].filter(Boolean);

  allItems.forEach(rawItem => {
    const normalized = normalizePortfolioItem(rawItem, aiCustomEvaluations);
    const itemWeight = calculateItemWeight(normalized);
    const text = normalized.text || '';

    // Map item to dimensions and distribute its weight
    const dimHits = mapItemToDimensions(text);
    dimHits.forEach(({ dimIndex, weight }) => {
      dimBoosts[dimIndex] += itemWeight * weight;
    });
  });

  // Normalize: scale the raw boost sums into a 0-1 range
  // Using a saturation curve: boost = 1 - e^(-k * rawBoost)
  // k=0.8 means ~2.5 weight units gets you to ~87% boost, ~4 units gets ~96%
  const k = 0.8;
  return dimBoosts.map(raw => 1 - Math.exp(-k * raw));
}

/**
 * Analyzes the gap between user's combined profile (skills + portfolio) and target benchmark.
 *
 * In Target Lock mode, the gap analysis now blends raw skill scores with portfolio contributions
 * so that users with strong portfolios see a narrower gap, consistent with the readiness percentage.
 *
 * @param {number[]} userVector - User's 5-dimension skill vector (0-1 each)
 * @param {number[]} targetBenchmark - Target path's benchmark vector (0-1 each)
 * @param {Object} [portfolioData] - Optional portfolio data for enhanced gap analysis
 * @param {Array} [portfolioData.portfolio] - Portfolio items array
 * @param {Array} [portfolioData.customActivities] - Custom activities array
 * @param {Array} [portfolioData.aiCustomEvaluations] - AI evaluations array
 * @returns {Array} Gap analysis data array
 */
export function analyzeGaps(userVector, targetBenchmark, portfolioData = null) {
  const dimKeys = ['logic', 'science', 'language', 'art', 'management'];
  const labels = ['ตรรกะ', 'วิทยาศาสตร์', 'ภาษา', 'ศิลปะ', 'การบริหาร'];

  // Calculate portfolio boost if portfolio data is provided
  let portfolioBoost = [0, 0, 0, 0, 0];
  if (portfolioData) {
    portfolioBoost = calculatePortfolioBoost(
      portfolioData.portfolio,
      portfolioData.customActivities,
      portfolioData.aiCustomEvaluations
    );
  }

  return dimKeys.map((dim, index) => {
    // Blend raw skill score (60%) with portfolio boost (40%)
    // Portfolio boost acts as evidence that user has competency in that dimension
    // even if their test/grade scores don't fully reflect it
    const rawSkill = userVector[index] || 0;
    const boost = portfolioBoost[index] || 0;

    // Combined score: skill + portfolio contribution
    // Portfolio can contribute up to 40% of the benchmark target
    const portfolioContribution = boost * targetBenchmark[index] * 0.4;
    const combined = Math.min(1, rawSkill + portfolioContribution);

    const current = Math.round(combined * 100);
    const target = Math.round(targetBenchmark[index] * 100);
    const gap = target - current;
    
    let status = 'strong'; // สีเขียว
    if (gap > 0 && gap <= 15) {
      status = 'developing'; // สีเหลือง
    } else if (gap > 15) {
      status = 'weak'; // สีแดง
    }

    return {
      dimension: dim,
      label: labels[index],
      current,
      target,
      gap: Math.max(0, gap),
      status
    };
  });
}
