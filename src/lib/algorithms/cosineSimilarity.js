/**
 * Standard cosine similarity between two vectors.
 * Returns a value between -1 and 1 (typically 0 to 1 for non-negative vectors).
 */
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

/**
 * Sigmoid scaling function to spread out similarity scores.
 * Centers at 0.82 with steepness of 15 — scores above 0.82 get pushed higher,
 * scores below 0.82 get pushed lower, creating better separation.
 */
function sigmoidScale(rawSimilarity) {
  return 1 / (1 + Math.exp(-(rawSimilarity - 0.82) * 15));
}

/**
 * Gap penalty: for each dimension where |userVector[i] - benchmark[i]| > 0.25,
 * multiply the penalty factor by 0.90. This penalizes profiles with large
 * mismatches in individual dimensions even if overall cosine is high.
 */
function calculateGapPenalty(userVector, benchmark) {
  let penaltyFactor = 1.0;

  for (let i = 0; i < userVector.length; i++) {
    // Only penalize if user's skill is below the benchmark requirement
    const gap = benchmark[i] - userVector[i];
    if (gap > 0.25) {
      penaltyFactor *= 0.90;
    }
  }

  return penaltyFactor;
}

export function calculateMatchPercentage(userVector, benchmark) {
  const rawSimilarity = cosineSimilarity(userVector, benchmark);
  const adjustedScore = sigmoidScale(rawSimilarity);
  const penaltyFactor = calculateGapPenalty(userVector, benchmark);

  // Absolute Capability Factor: Compare the total magnitude/sum of user skills to the required benchmark.
  // This prevents cases where getting worse/lower grades in other subjects increases the match percentage
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
