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

// Integrated capability scaling
function calculateMatchPercentage(userVector, benchmark) {
  const rawSimilarity = cosineSimilarity(userVector, benchmark);
  const adjustedScore = sigmoidScale(rawSimilarity);
  
  // 1. Binary Gap Penalty (current)
  const penaltyFactor = currentPenalty(userVector, benchmark);
  
  // 2. Capability scaling: sum of user vector divided by sum of benchmark vector, capped at 1.0
  const sumUser = userVector.reduce((a, b) => a + b, 0);
  const sumBenchmark = benchmark.reduce((a, b) => a + b, 0);
  const capabilityFactor = Math.min(1.0, sumUser / sumBenchmark);
  
  // Multiply everything
  const matchPercentage = Math.round(adjustedScore * penaltyFactor * capabilityFactor * 100);
  return Math.min(100, Math.max(0, matchPercentage));
}

console.log("=== INTEGRATED CAPABILITY SCALING ===");
console.log("Case A Match:", calculateMatchPercentage(vecA, benchmark));
console.log("Case B Match:", calculateMatchPercentage(vecB, benchmark));
