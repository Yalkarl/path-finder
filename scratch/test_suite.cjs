const fs = require('fs');

console.log('================================================================');
console.log('🧪 PATHFINDER AUTOMATED DATA ACCURACY & INTEGRITY TEST SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] Test ${totalTests}: ${message}`);
  } else {
    console.log(`❌ [FAIL] Test ${totalTests}: ${message}`);
  }
}

// 1. Math formulas check: Cosine Similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

function sigmoidScale(raw) {
  return 1 / (1 + Math.exp(-(raw - 0.82) * 15));
}

function gapPenalty(userVec, benchVec) {
  let factor = 1.0;
  for (let i = 0; i < userVec.length; i++) {
    if (benchVec[i] - userVec[i] > 0.25) {
      factor *= 0.90;
    }
  }
  return factor;
}

function matchPct(userVec, benchVec) {
  const raw = cosineSimilarity(userVec, benchVec);
  const adj = sigmoidScale(raw);
  const pen = gapPenalty(userVec, benchVec);
  const sumUser = userVec.reduce((a, b) => a + b, 0);
  const sumBench = benchVec.reduce((a, b) => a + b, 0);
  const cap = sumBench > 0 ? Math.min(1.0, sumUser / sumBench) : 1.0;
  return Math.min(100, Math.max(0, Math.round(adj * pen * cap * 100)));
}

// TEST GROUP 1: Vector Dimension Bounds & Cosine Math Accuracy
console.log('--- TEST GROUP 1: Vector Dimension Bounds & Cosine Math ---');
const userVec = [0.8, 0.9, 0.4, 0.3, 0.5];
const benchVec = [0.85, 0.95, 0.3, 0.2, 0.35];

const sim = cosineSimilarity(userVec, benchVec);
assert(sim >= 0 && sim <= 1.0, 'Raw Cosine Similarity strictly between 0.0 and 1.0');

const score = matchPct(userVec, benchVec);
assert(score >= 80 && score <= 100, 'Compatible profile receives high match score (>80%)');

// TEST GROUP 2: Gap Penalty Assertion
console.log('\n--- TEST GROUP 2: Gap Penalty Verification ---');
const weakVec = [0.2, 0.2, 0.4, 0.3, 0.5]; // Severe deficit in science & logic
const weakScore = matchPct(weakVec, benchVec);
assert(weakScore < score, 'Gap penalty correctly penalizes profiles missing core entry requirements');

// TEST GROUP 3: Readiness Score Weight Allocation (Junior vs Senior)
console.log('\n--- TEST GROUP 3: Target Lock Readiness Weights (Junior vs Senior) ---');
function calcReadiness(matchScore, portScore, selfAssAvg, isJunior = false) {
  const saScore = Math.round(((selfAssAvg - 1) / 4) * 100);
  const skillWeight = isJunior ? 0.30 : 0.20;
  const portWeight = isJunior ? 0.60 : 0.70;
  const saWeight = 0.10;
  return Math.min(100, Math.max(0, Math.round(matchScore * skillWeight + portScore * portWeight + saScore * saWeight)));
}

const readinessSenior = calcReadiness(90, 80, 4.5, false);
const readinessJunior = calcReadiness(90, 80, 4.5, true);

assert(readinessSenior === 83, 'Senior Readiness calculation matches exact mathematical weight distribution (83%)');
assert(readinessJunior === 84, 'Junior Readiness calculation matches exact mathematical weight distribution (84%)');

// TEST GROUP 4: Data Sync & Serialization Integrity
console.log('\n--- TEST GROUP 4: Data Sync & Serialization Integrity ---');
const profileObject = {
  uid: 'user_123',
  educationLevel: 'senior',
  targetPath: 'medicine',
  skillVector: userVec
};
const serialized = JSON.stringify(profileObject);
const deserialized = JSON.parse(serialized);

assert(JSON.stringify(deserialized.skillVector) === JSON.stringify(userVec), 'JSON serialization/deserialization retains 100% data integrity with zero loss');

// SUMMARY REPORT
console.log('\n================================================================');
console.log(`📊 FINAL AUTOMATED TESTING SUMMARY REPORT:`);
console.log(`   - Total Unit Tests Executed: ${totalTests}`);
console.log(`   - Tests Passed: ${passedTests}`);
console.log(`   - Tests Failed: ${totalTests - passedTests}`);
console.log(`   - Data Error Rate: ${((totalTests - passedTests) / totalTests * 100).toFixed(2)}%`);
console.log(`   - Data Accuracy Rate: ${(passedTests / totalTests * 100).toFixed(2)}%`);
console.log('================================================================\n');
