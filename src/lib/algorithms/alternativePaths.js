import { calculateMatchPercentage } from './cosineSimilarity';
import { normalizePortfolioItem, calculateItemWeight } from './readinessCalculator';

/**
 * Maps portfolio/activity item text to path IDs based on keyword relevance.
 * Returns an object { pathId: relevanceScore } for each matching path.
 */
function getPortfolioPathRelevance(text) {
  const textUpper = (text || '').toUpperCase();
  const relevance = {};

  // ── Tech / Computer Science / Engineering ──
  const techKeywords = [
    'โปรแกรม', 'เขียนโค้ด', 'CODE', 'CODING', 'ซอฟต์แวร์', 'SOFTWARE',
    'คอมพิวเตอร์', 'COMPUTER', 'ALGORITHM', 'อัลกอริ', 'AI', 'ปัญญาประดิษฐ์',
    'HACKATHON', 'ROBOT', 'หุ่นยนต์', 'IOT', 'วิศวกรรม', 'ENGINEERING',
    'แอป', 'APP', 'เว็บ', 'WEB', 'เกม', 'GAME', 'ดิจิทัล', 'DIGITAL',
    'ไอที', 'IT', 'ข้อมูล', 'DATA', 'ไซเบอร์', 'CYBER', 'ESPORT',
    'โดรน', 'DRONE', 'คลาวด์', 'CLOUD', 'DEV', 'DEVELOPER',
    'STARTUP', 'สตาร์ทอัพ'
  ];
  if (techKeywords.some(kw => textUpper.includes(kw))) {
    relevance['computer-science'] = 1.0;
    relevance['engineering'] = 0.8;
    relevance['logistics-industrial-tech'] = 0.4;
    relevance['industrial-education'] = 0.3;
  }

  // ── Science (Pure / Applied) ──
  const scienceKeywords = [
    'วิทยาศาสตร์', 'SCIENCE', 'เคมี', 'CHEM', 'ฟิสิกส์', 'PHYSICS',
    'ชีววิทยา', 'BIO', 'ดาราศาสตร์', 'ASTRONOMY', 'ธรณี', 'GEO',
    'สถิติ', 'STAT', 'วิจัย', 'RESEARCH', 'ทดลอง', 'LAB',
    'สอวน', 'โอลิมปิก', 'POSN'
  ];
  if (scienceKeywords.some(kw => textUpper.includes(kw))) {
    relevance['science'] = (relevance['science'] || 0) + 1.0;
    relevance['engineering'] = (relevance['engineering'] || 0) + 0.5;
    relevance['computer-science'] = (relevance['computer-science'] || 0) + 0.3;
    relevance['environmental-science'] = (relevance['environmental-science'] || 0) + 0.4;
  }

  // ── Math / Logic ──
  const mathKeywords = [
    'คณิต', 'MATH', 'ตรรกะ', 'LOGIC', 'สถิติ', 'STAT',
    'คำนวณ', 'CALCUL'
  ];
  if (mathKeywords.some(kw => textUpper.includes(kw))) {
    relevance['computer-science'] = (relevance['computer-science'] || 0) + 0.6;
    relevance['engineering'] = (relevance['engineering'] || 0) + 0.6;
    relevance['science'] = (relevance['science'] || 0) + 0.4;
    relevance['economics'] = (relevance['economics'] || 0) + 0.3;
  }

  // ── Health / Medical ──
  const healthKeywords = [
    'แพทย์', 'หมอ', 'MEDICINE', 'ทันตแพทย์', 'ทำฟัน', 'เภสัช', 'PHARM',
    'สัตวแพทย์', 'VET', 'พยาบาล', 'NURS', 'สาธารณสุข', 'HEALTH',
    'สุขภาพ', 'คนไข้', 'โรงพยาบาล', 'คลินิก', 'ปฐมพยาบาล'
  ];
  if (healthKeywords.some(kw => textUpper.includes(kw))) {
    relevance['medicine'] = (relevance['medicine'] || 0) + 1.0;
    relevance['dentistry'] = (relevance['dentistry'] || 0) + 0.8;
    relevance['pharmacy'] = (relevance['pharmacy'] || 0) + 0.8;
    relevance['nursing'] = (relevance['nursing'] || 0) + 0.7;
    relevance['veterinary'] = (relevance['veterinary'] || 0) + 0.5;
    relevance['allied-health'] = (relevance['allied-health'] || 0) + 0.6;
  }

  // ── Language / Humanities ──
  const langKeywords = [
    'ภาษา', 'LANGUAGE', 'ENGLISH', 'อังกฤษ', 'IELTS', 'TOEFL', 'TOEIC',
    'ญี่ปุ่น', 'จีน', 'เกาหลี', 'ฝรั่งเศส', 'แปล', 'TRANSLAT',
    'วรรณกรรม', 'LITERAT', 'อักษร', 'มนุษย', 'HUMANIT',
    'ประวัติศาสตร์', 'วัฒนธรรม', 'โบราณคดี'
  ];
  if (langKeywords.some(kw => textUpper.includes(kw))) {
    relevance['humanities-liberal-arts'] = (relevance['humanities-liberal-arts'] || 0) + 1.0;
    relevance['education'] = (relevance['education'] || 0) + 0.4;
    relevance['communication-arts'] = (relevance['communication-arts'] || 0) + 0.3;
  }

  // ── Art / Design ──
  const artKeywords = [
    'ศิลป', 'ART', 'ออกแบบ', 'DESIGN', 'สถาปัตย', 'ARCHITECT',
    'กราฟิก', 'GRAPHIC', 'วาด', 'DRAW', 'PAINT', 'ดนตรี', 'MUSIC',
    'การแสดง', 'PERFORM', 'ภาพยนตร์', 'FILM', 'อนิเมชัน', 'ANIMAT',
    'ภาพถ่าย', 'PHOTO', 'แฟชั่น', 'FASHION', 'สร้างสรรค์', 'CREATIVE',
    'มัลติมีเดีย', 'MULTIMEDIA'
  ];
  if (artKeywords.some(kw => textUpper.includes(kw))) {
    relevance['fine-applied-arts'] = (relevance['fine-applied-arts'] || 0) + 1.0;
    relevance['architecture'] = (relevance['architecture'] || 0) + 0.6;
    relevance['communication-arts'] = (relevance['communication-arts'] || 0) + 0.5;
  }

  // ── Business / Management ──
  const bizKeywords = [
    'ธุรกิจ', 'BUSINESS', 'การตลาด', 'MARKET', 'บริหาร', 'MANAGE',
    'เศรษฐ', 'ECONOM', 'การเงิน', 'FINANC', 'บัญชี', 'ACCOUNT',
    'STARTUP', 'ผู้ประกอบการ', 'การค้า', 'TRADE', 'หุ้น', 'STOCK'
  ];
  if (bizKeywords.some(kw => textUpper.includes(kw))) {
    relevance['business-administration'] = (relevance['business-administration'] || 0) + 1.0;
    relevance['economics'] = (relevance['economics'] || 0) + 0.7;
    relevance['accounting-business'] = (relevance['accounting-business'] || 0) + 0.7;
  }

  // ── Law / Political Science ──
  const lawKeywords = [
    'กฎหมาย', 'LAW', 'นิติ', 'ทนาย', 'ศาล', 'ยุติธรรม',
    'รัฐศาสตร์', 'POLITICAL', 'การเมือง', 'สังคม', 'SOCIAL',
    'สิทธิมนุษยชน', 'นโยบาย'
  ];
  if (lawKeywords.some(kw => textUpper.includes(kw))) {
    relevance['law'] = (relevance['law'] || 0) + 1.0;
    relevance['political-science'] = (relevance['political-science'] || 0) + 0.8;
  }

  // ── Leadership / Volunteer / General ──
  const leaderKeywords = [
    'ผู้นำ', 'LEADER', 'ประธาน', 'PRESIDENT', 'หัวหน้า',
    'กรรมการ', 'COMMITTEE', 'จิตอาสา', 'VOLUNTEER',
    'ชุมชน', 'COMMUNIT', 'ชมรม', 'CLUB'
  ];
  if (leaderKeywords.some(kw => textUpper.includes(kw))) {
    // General leadership contributes lightly to management-related paths
    relevance['business-administration'] = (relevance['business-administration'] || 0) + 0.2;
    relevance['political-science'] = (relevance['political-science'] || 0) + 0.2;
    relevance['education'] = (relevance['education'] || 0) + 0.2;
  }

  // ── Education / Teaching ──
  const eduKeywords = [
    'ครู', 'TEACH', 'สอน', 'ติวเตอร์', 'ถ่ายทอดความรู้',
    'ศึกษาศาสตร์', 'ครุศาสตร์'
  ];
  if (eduKeywords.some(kw => textUpper.includes(kw))) {
    relevance['education'] = (relevance['education'] || 0) + 1.0;
    relevance['industrial-education'] = (relevance['industrial-education'] || 0) + 0.5;
  }

  // ── Communication / Media ──
  const mediaKeywords = [
    'นิเทศ', 'สื่อ', 'MEDIA', 'โฆษณา', 'ประชาสัมพันธ์',
    'คอนเทนต์', 'CONTENT', 'พอดแคสต์', 'PODCAST',
    'ยูทูบ', 'YOUTUBE', 'ตัดต่อ', 'VIDEO', 'ถ่ายภาพ'
  ];
  if (mediaKeywords.some(kw => textUpper.includes(kw))) {
    relevance['communication-arts'] = (relevance['communication-arts'] || 0) + 1.0;
  }

  // ── Tourism / Hospitality ──
  const tourKeywords = [
    'ท่องเที่ยว', 'TOURISM', 'โรงแรม', 'HOTEL', 'การบิน',
    'แอร์โฮสเตส', 'สจ๊วต', 'มัคคุเทศก์', 'ไกด์', 'HOSPITALITY'
  ];
  if (tourKeywords.some(kw => textUpper.includes(kw))) {
    relevance['tourism-hospitality'] = (relevance['tourism-hospitality'] || 0) + 1.0;
  }

  // ── Agriculture ──
  const agriKeywords = [
    'เกษตร', 'AGRI', 'ปลูกพืช', 'ประมง', 'ป่าไม้', 'สมาร์ทฟาร์ม',
    'ปศุสัตว์', 'FARM'
  ];
  if (agriKeywords.some(kw => textUpper.includes(kw))) {
    relevance['agriculture'] = (relevance['agriculture'] || 0) + 1.0;
  }

  // ── Sports ──
  const sportKeywords = [
    'กีฬา', 'SPORT', 'ฟิตเนส', 'FITNESS', 'โค้ช', 'COACH',
    'นักกีฬา', 'ATHLETE', 'เทรนเนอร์', 'TRAINER'
  ];
  if (sportKeywords.some(kw => textUpper.includes(kw))) {
    relevance['sports-science'] = (relevance['sports-science'] || 0) + 1.0;
  }

  // ── Food Tech ──
  const foodKeywords = [
    'อาหาร', 'FOOD', 'ทำอาหาร', 'COOK', 'เบเกอรี่', 'BAKERY',
    'โภชนา', 'NUTRIT', 'คหกรรม', 'แปรรูป'
  ];
  if (foodKeywords.some(kw => textUpper.includes(kw))) {
    relevance['food-tech'] = (relevance['food-tech'] || 0) + 1.0;
  }

  // ── Psychology ──
  const psychKeywords = [
    'จิตวิทยา', 'PSYCHO', 'สุขภาพจิต', 'MENTAL', 'ให้คำปรึกษา',
    'COUNSEL', 'พฤติกรรม', 'BEHAVIOR'
  ];
  if (psychKeywords.some(kw => textUpper.includes(kw))) {
    relevance['psychology'] = (relevance['psychology'] || 0) + 1.0;
  }

  // ── Environment ──
  const envKeywords = [
    'สิ่งแวดล้อม', 'ENVIRONMENT', 'นิเวศ', 'ECOLOGY', 'พลังงาน', 'ENERGY',
    'มลพิษ', 'POLLUT', 'อนุรักษ์', 'CONSERV'
  ];
  if (envKeywords.some(kw => textUpper.includes(kw))) {
    relevance['environmental-science'] = (relevance['environmental-science'] || 0) + 1.0;
  }

  return relevance;
}

/**
 * Calculates portfolio relevance score for each candidate path.
 * 
 * @param {Array} portfolio - Raw portfolio items
 * @param {Array} customActivities - Custom activities
 * @param {Array} aiCustomEvaluations - AI evaluations
 * @returns {Object} { pathId: totalRelevanceScore }
 */
function calculatePortfolioRelevanceScores(portfolio = [], customActivities = [], aiCustomEvaluations = []) {
  const scores = {};

  const allItems = [
    ...(portfolio || []),
    ...(customActivities || [])
  ].filter(Boolean);

  allItems.forEach(rawItem => {
    const normalized = normalizePortfolioItem(rawItem, aiCustomEvaluations);
    const itemWeight = calculateItemWeight(normalized);
    const text = normalized.text || '';

    const pathRelevance = getPortfolioPathRelevance(text);
    Object.entries(pathRelevance).forEach(([pathId, relevance]) => {
      scores[pathId] = (scores[pathId] || 0) + itemWeight * relevance;
    });
  });

  return scores;
}

/**
 * Finds alternative education/career paths based on user's skill vector AND portfolio relevance,
 * excluding the locked target path.
 * 
 * The algorithm blends:
 * - Cosine Similarity of skill vector (60% weight)
 * - Portfolio/activity relevance to each path (40% weight)
 * 
 * This ensures that a user with a tech-heavy portfolio doesn't get recommended
 * health science paths just because their raw skill vectors happen to be similar.
 * 
 * @param {number[]} userVector - Array of 5 normalized values [logic, science, language, art, management]
 * @param {string} targetPathId - The ID of the currently locked target path
 * @param {Object} allPathsObject - Either JUNIOR_PATHS or SENIOR_PATHS object
 * @param {number} topN - Number of alternatives to return (default 3)
 * @param {Object} [portfolioData] - Optional portfolio data for enhanced ranking
 * @returns {Array} - Sorted list of alternative path candidates
 */
export function findAlternativePaths(userVector, targetPathId, allPathsObject, topN = 3, portfolioData = null) {
  const candidates = Object.values(allPathsObject);
  const dimensions = ['ตรรกะ', 'วิทยาศาสตร์', 'ภาษา', 'ศิลปะ', 'การบริหาร'];
  
  // Calculate portfolio relevance scores per path
  let portfolioScores = {};
  if (portfolioData) {
    portfolioScores = calculatePortfolioRelevanceScores(
      portfolioData.portfolio,
      portfolioData.customActivities,
      portfolioData.aiCustomEvaluations
    );
  }

  // Find max portfolio score for normalization
  const maxPortfolioScore = Math.max(1, ...Object.values(portfolioScores));

  return candidates
    .filter(candidate => candidate.id !== targetPathId)
    .map(candidate => {
      const skillMatch = calculateMatchPercentage(userVector, candidate.benchmark);
      
      // Normalize portfolio relevance to 0-100 scale
      const rawPortfolioScore = portfolioScores[candidate.id] || 0;
      const normalizedPortfolioScore = Math.round((rawPortfolioScore / maxPortfolioScore) * 100);

      // Blend: 60% skill match + 40% portfolio relevance
      const hasPortfolio = portfolioData && maxPortfolioScore > 1;
      const blendedScore = hasPortfolio
        ? Math.round(skillMatch * 0.6 + normalizedPortfolioScore * 0.4)
        : skillMatch;

      // Build reason string
      const matchingDims = [];
      for (let i = 0; i < userVector.length; i++) {
        if (candidate.benchmark[i] >= 0.6 && userVector[i] >= 0.5) {
          matchingDims.push(dimensions[i]);
        }
      }

      let reason = '';
      if (hasPortfolio && normalizedPortfolioScore >= 50) {
        // Portfolio is highly relevant to this path
        if (matchingDims.length > 0) {
          reason = `ผลงานของคุณตรงกับสายนี้ และเน้นทักษะด้าน ${matchingDims.slice(0, 2).join(' และ ')} ที่คุณถนัด`;
        } else {
          reason = `ผลงานและกิจกรรมของคุณมีความเกี่ยวข้องกับสายนี้โดยตรง`;
        }
      } else if (matchingDims.length > 0) {
        reason = `เน้นการใช้ทักษะด้าน ${matchingDims.slice(0, 2).join(' และ ')} ที่คุณถนัดเช่นกัน`;
      } else {
        // Find dimension with smallest gap
        let minGapIdx = 0;
        let minGap = 999;
        for (let i = 0; i < userVector.length; i++) {
          const gap = Math.abs(userVector[i] - candidate.benchmark[i]);
          if (gap < minGap) {
            minGap = gap;
            minGapIdx = i;
          }
        }
        reason = `มีช่องว่างทักษะด้าน ${dimensions[minGapIdx]} น้อยที่สุด`;
      }

      return {
        ...candidate,
        matchPercentage: blendedScore,
        reason
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, topN);
}
