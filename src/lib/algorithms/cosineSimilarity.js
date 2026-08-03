// ==========================================
// การคำนวณ Cosine Similarity มาตรฐาน
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
// การปรับสเกลคะแนนความสอดคล้องด้วย Sigmoid (x0=0.82, slope=15)
// ==========================================
function sigmoidScale(rawSimilarity) {
  return 1 / (1 + Math.exp(-(rawSimilarity - 0.82) * 15));
}

// ==========================================
// การคำนวณหักคะแนนส่วนขาด (Gap Penalty 10% ต่อมิติที่ตกเกณฑ์เกิน 0.25)
// ==========================================
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

// ==========================================
// การคำนวณเปอร์เซ็นต์ความเหมาะสมสุทธิ (Skill Match Rate %)
// ==========================================
export function calculateMatchPercentage(userVector, benchmark) {
  const rawSimilarity = cosineSimilarity(userVector, benchmark);
  const adjustedScore = sigmoidScale(rawSimilarity);
  const penaltyFactor = calculateGapPenalty(userVector, benchmark);

  const sumUser = userVector.reduce((a, b) => a + b, 0);
  const sumBenchmark = benchmark.reduce((a, b) => a + b, 0);
  const capabilityFactor = sumBenchmark > 0 ? Math.min(1.0, sumUser / sumBenchmark) : 1.0;

  const finalMatch = Math.min(100, Math.max(0, Math.round(adjustedScore * penaltyFactor * capabilityFactor * 100)));

  return finalMatch;
}

  // การคำนวณ Absolute Capability Factor เปรียบเทียบผลรวมทักษะกับเกณฑ์
  // ช่วยป้องกันกรณีคะแนนเกรดวิชาอื่นต่ำลงแล้วทำให้เปอร์เซ็นต์สอดคล้องสูงขึ้นผิดปกติ
  // by artificially skewing the vector angle.
  const sumUser = userVector.reduce((a, b) => a + b, 0);
  const sumBenchmark = benchmark.reduce((a, b) => a + b, 0);
  const capabilityFactor = sumBenchmark > 0 ? Math.min(1.0, sumUser / sumBenchmark) : 1.0;

  const matchPercentage = Math.round(adjustedScore * penaltyFactor * capabilityFactor * 100);

  return Math.min(100, Math.max(0, matchPercentage));
}

/**
 * Match user vector against all paths in a paths object.
 * Returns sorted array of path candidates with matchPercentage.
 */
export function matchPaths(userVector, pathsObject) {
  const candidates = Object.values(pathsObject);
  
  return candidates
    .map(candidate => {
      const matchPercentage = calculateMatchPercentage(userVector, candidate.benchmark);
      return {
        ...candidate,
        matchPercentage
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}
