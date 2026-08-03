const benchmark = [0.70, 0.95, 0.40, 0.20, 0.50]; // Medicine

// Case A: All grades 1
const vecA = [0.075, 0.075, 0.075, 0.075, 0.075];

// Case B: Grades 1, 1, 1, 0, 0
const vecB = [0.075, 0.075, 0.0375, 0.0225, 0.01875];

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

// Current penalty
function currentPenalty(userVector, benchmark) {
  let penaltyFactor = 1.0;
  for (let i = 0; i < userVector.length; i++) {
    const gap = benchmark[i] - userVector[i];
    if (gap > 0.25) {
      penaltyFactor *= 0.90;
    }
  }
  return penaltyFactor;
}

// Proposed continuous penalty
function proposedPenalty(userVector, benchmark) {
  let penaltyFactor = 1.0;
  for (let i = 0; i < userVector.length; i++) {
    const gap = benchmark[i] - userVector[i];
    if (gap > 0.25) {
      // Linear penalty: the bigger the gap, the smaller the multiplier
      // If gap = 0.25, multiplier = 1.0
      // If gap = 0.95, multiplier = 1.0 - (0.70 * 0.50) = 0.65
      const penalty = (gap - 0.25) * 0.50; 
      penaltyFactor *= Math.max(0.1, 1.0 - penalty);
    }
  }
  return penaltyFactor;
}

console.log("=== CURRENT SYSTEM ===");
const cosA = cosineSimilarity(vecA, benchmark);
const scaleA = sigmoidScale(cosA);
const penA = currentPenalty(vecA, benchmark);
console.log("Case A Match:", Math.round(scaleA * penA * 100));

const cosB = cosineSimilarity(vecB, benchmark);
const scaleB = sigmoidScale(cosB);
const penB = currentPenalty(vecB, benchmark);
console.log("Case B Match:", Math.round(scaleB * penB * 100));

console.log("\n=== PROPOSED SYSTEM ===");
const propPenA = proposedPenalty(vecA, benchmark);
console.log("Case A Match:", Math.round(scaleA * propPenA * 100));

const propPenB = proposedPenalty(vecB, benchmark);
console.log("Case B Match:", Math.round(scaleB * propPenB * 100));
