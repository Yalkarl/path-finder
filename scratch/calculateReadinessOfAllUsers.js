const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Load env
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
});

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Functions from codebase (re-coded in CJS)
const ACADEMIC_WEIGHT_MATRIX = {
  logic:      { math: 0.90, science: 0.10, thai: 0.00, english: 0.00, social: 0.00 },
  science:    { math: 0.10, science: 0.90, thai: 0.00, english: 0.00, social: 0.00 },
  language:   { math: 0.00, science: 0.00, thai: 0.50, english: 0.50, social: 0.00 },
  art:        { math: 0.00, science: 0.00, thai: 0.30, english: 0.15, social: 0.55 },
  management: { math: 0.15, science: 0.00, thai: 0.10, english: 0.10, social: 0.65 }
};
const ACADEMIC_WEIGHT = 0.50;
const ASSESSMENT_WEIGHT = 0.50;

function calculateSkillVector(academicGrades, assessmentResponses) {
  const normGrades = {
    math: (academicGrades.math || 0) / 4,
    science: (academicGrades.science || 0) / 4,
    thai: (academicGrades.thai || 0) / 4,
    english: (academicGrades.english || 0) / 4,
    social: (academicGrades.social || 0) / 4,
  };
  const baseVector = [0, 0, 0, 0, 0];
  const dimKeys = ['logic', 'science', 'language', 'art', 'management'];
  dimKeys.forEach((dim, index) => {
    const weights = ACADEMIC_WEIGHT_MATRIX[dim];
    const val = normGrades.math * weights.math + normGrades.science * weights.science + normGrades.thai * weights.thai + normGrades.english * weights.english + normGrades.social * weights.social;
    baseVector[index] += val * ACADEMIC_WEIGHT;
  });
  if (assessmentResponses && assessmentResponses.length > 0) {
    const accumulated = [0, 0, 0, 0, 0];
    assessmentResponses.forEach(response => {
      dimKeys.forEach((dim, index) => {
        const val = response[dim] !== undefined ? response[dim] : (response.weights?.[dim] || 0);
        accumulated[index] += val;
      });
    });
    const maxVal = Math.max(1.0, ...accumulated);
    dimKeys.forEach((dim, index) => {
      const normalizedDim = Math.min(1, accumulated[index] / maxVal);
      baseVector[index] += normalizedDim * ASSESSMENT_WEIGHT;
    });
  } else {
    dimKeys.forEach((dim, index) => {
      baseVector[index] = baseVector[index] / ACADEMIC_WEIGHT;
    });
  }
  return baseVector.map(val => Math.min(Math.max(val, 0), 1));
}

function cosineSimilarity(vecA, vecB) {
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

function sigmoidScale(rawSimilarity) {
  return 1 / (1 + Math.exp(-(rawSimilarity - 0.82) * 15));
}

function calculateGapPenalty(userVector, benchmark) {
  let penaltyFactor = 1.0;
  for (let i = 0; i < userVector.length; i++) {
    const gap = benchmark[i] - userVector[i];
    if (gap > 0.25) {
      penaltyFactor *= 0.90;
    }
  }
  return penaltyFactor;
}

function calculateMatchPercentage(userVector, benchmark) {
  const rawSimilarity = cosineSimilarity(userVector, benchmark);
  const adjustedScore = sigmoidScale(rawSimilarity);
  const penaltyFactor = calculateGapPenalty(userVector, benchmark);
  return Math.min(100, Math.max(0, Math.round(adjustedScore * penaltyFactor * 100)));
}

function calculateReadiness(skillVector, benchmark, portfolio, selfAssessment, customActivities = []) {
  const skillMatch = calculateMatchPercentage(skillVector, benchmark);
  const saValues = Object.values(selfAssessment || {});
  const saAvg = saValues.length > 0 ? saValues.reduce((sum, val) => sum + val, 0) / saValues.length : 3;
  const saScore = Math.round(((saAvg - 1) / 4) * 100);
  
  // Calculate portfolio score
  // Portfolio weighting calculation:
  // Each category item has a score weight based on level and award
  // Let's simplified print it
  return { skillMatch, saScore };
}

// Load path benchmarks
const JUNIOR_PATHS = {
  'sci-math': { name: 'วิทย์-คณิต', benchmark: [0.90, 0.90, 0.15, 0.05, 0.15] },
  'art-math': { name: 'ศิลป์-คำนวณ', benchmark: [0.70, 0.25, 0.30, 0.20, 0.75] },
  'art-lang': { name: 'ศิลป์-ภาษา', benchmark: [0.15, 0.10, 0.90, 0.50, 0.25] },
  'vocational': { name: 'สายอาชีพ', benchmark: [0.40, 0.20, 0.20, 0.45, 0.85] }
};

const SENIOR_PATHS = {
  'medical': { name: 'วิทยาศาสตร์สุขภาพ', benchmark: [0.75, 0.95, 0.30, 0.10, 0.20] },
  'technology': { name: 'วิทย์กายภาพ/เทคโนโลยี', benchmark: [0.90, 0.85, 0.15, 0.10, 0.25] },
  'engineering': { name: 'วิศวกรรมศาสตร์', benchmark: [0.95, 0.75, 0.10, 0.15, 0.35] },
  'social': { name: 'สังคมศาสตร์', benchmark: [0.35, 0.15, 0.50, 0.25, 0.85] },
  'humanities': { name: 'มนุษยศาสตร์/ภาษา', benchmark: [0.15, 0.10, 0.95, 0.45, 0.20] },
  'creative': { name: 'ศิลปกรรมศาสตร์', benchmark: [0.15, 0.10, 0.30, 0.95, 0.20] },
  
  // High-level specific paths mapping to clusters
  'medicine': { name: 'แพทย์ / สัตวแพทย์', benchmark: [0.75, 0.95, 0.30, 0.10, 0.20] },
  'dentistry': { name: 'ทันตแพทย์', benchmark: [0.75, 0.95, 0.30, 0.10, 0.20] },
  'pharmacy': { name: 'เภสัชศาสตร์', benchmark: [0.75, 0.95, 0.30, 0.10, 0.20] },
  'allied-health': { name: 'สหเวชฯ / เทคนิคการแพทย์', benchmark: [0.70, 0.90, 0.40, 0.15, 0.30] },
  'nursing': { name: 'พยาบาล / สาธารณสุข', benchmark: [0.65, 0.85, 0.40, 0.10, 0.35] },
  'engineering-major': { name: 'วิศวกรรมศาสตร์หลัก', benchmark: [0.95, 0.75, 0.10, 0.15, 0.35] },
  'it-ict': { name: 'เทคโนโลยีสารสนเทศ (IT) / ICT', benchmark: [0.90, 0.85, 0.15, 0.10, 0.25] },
  'science-major': { name: 'วิทยาศาสตร์ / เทคโนโลยีชีวภาพ', benchmark: [0.85, 0.90, 0.20, 0.10, 0.20] },
  'accounting-business': { name: 'บริหารธุรกิจ / บัญชี', benchmark: [0.65, 0.20, 0.35, 0.15, 0.90] },
  'economics': { name: 'เศรษฐศาสตร์', benchmark: [0.80, 0.20, 0.35, 0.10, 0.70] },
  'architecture': { name: 'สถาปัตยกรรมศาสตร์', benchmark: [0.45, 0.35, 0.20, 0.90, 0.30] },
  'fine-arts': { name: 'ศิลปกรรม / การออกแบบ', benchmark: [0.15, 0.10, 0.30, 0.95, 0.20] },
  'communication': { name: 'นิเทศศาสตร์ / สื่อสารมวลชน', benchmark: [0.20, 0.10, 0.60, 0.65, 0.60] },
  'humanities-major': { name: 'อักษรฯ / มนุษยฯ / ภาษา', benchmark: [0.15, 0.10, 0.95, 0.45, 0.20] },
  'law': { name: 'นิติศาสตร์', benchmark: [0.70, 0.10, 0.75, 0.10, 0.50] },
  'political-science': { name: 'รัฐศาสตร์ / สังคมสงเคราะห์', benchmark: [0.40, 0.10, 0.60, 0.20, 0.80] },
  'psychology': { name: 'จิตวิทยา', benchmark: [0.50, 0.50, 0.60, 0.20, 0.40] },
  'education': { name: 'ครู / ศึกษาศาสตร์', benchmark: [0.45, 0.40, 0.60, 0.35, 0.60] }
};

async function testAll() {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach(doc => {
    const p = doc.data();
    if (p.analysisMode === 'target-lock' && p.targetPath) {
      console.log(`\n--- User: ${p.name || 'No Name'} (${doc.id}) ---`);
      console.log("Target Path ID:", p.targetPath);
      const skillVector = calculateSkillVector(p.academics || {}, p.assessment?.responses || []);
      console.log("Skill Vector:", skillVector);
      
      const pathsObject = p.educationLevel === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
      const targetPathObj = pathsObject[p.targetPath];
      if (targetPathObj) {
        console.log("Target Name:", targetPathObj.name);
        const { skillMatch, saScore } = calculateReadiness(skillVector, targetPathObj.benchmark, p.portfolio, p.selfAssessment, p.customActivities || []);
        
        // Calculate portfolio score dynamically using the actual calculator
        const { calculatePortfolioScore } = require('../src/lib/algorithms/portfolioCalculator');
        const portScore = calculatePortfolioScore(p.portfolio || [], p.customActivities || [], p.targetPath, p.educationLevel || 'senior');
        
        const readiness = Math.round(skillMatch * 0.30 + portScore * 0.60 + saScore * 0.10);
        console.log(`Dynamic: skillMatch=${skillMatch}%, portScore=${portScore}%, saScore=${saScore}% => Readiness: ${readiness}%`);
      }
    }
  });
}

testAll();
