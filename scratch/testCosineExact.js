const vecA = [1, 0.9484126984126982, 0.8558201058201055, 0.8293650793650791, 0.817460317460317];
const vecB = [0.45, 0.35, 0.20, 0.90, 0.30];

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
const rawSimilarity = dotProduct / (magnitudeA * magnitudeB);
const adjustedScore = 1 / (1 + Math.exp(-(rawSimilarity - 0.82) * 15));

let penaltyFactor = 1.0;
for (let i = 0; i < vecA.length; i++) {
  const gap = vecB[i] - vecA[i];
  if (gap > 0.25) {
    penaltyFactor *= 0.90;
  }
}
const matchPercentage = Math.round(adjustedScore * penaltyFactor * 100);

console.log("Raw Similarity:", rawSimilarity);
console.log("Adjusted Score:", adjustedScore);
console.log("Penalty Factor:", penaltyFactor);
console.log("Match Percentage:", matchPercentage);
console.log("Readiness Score (skillMatch * 0.3 + 10):", Math.round(matchPercentage * 0.3 + 10));
