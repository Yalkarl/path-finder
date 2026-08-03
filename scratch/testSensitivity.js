// Mocking the new logic
const dimKeys = ['logic', 'science', 'language', 'art', 'management'];
const benchmark = [0.95, 0.65, 0.35, 0.20, 0.25]; // IT / ICT

// Simulate 144 general responses (all balanced, e.g. 0.5 for all dimensions)
const generalResponses = [];
for (let i = 0; i < 144; i++) {
  generalResponses.push({
    questionId: `S${Math.floor(i/12)+1}Q${(i%12)+1}`,
    weights: { logic: 0.3, science: 0.3, language: 0.3, art: 0.3, management: 0.3 }
  });
}

// Case A: Targeted responses favor IT (logic/science)
const targetedIT = [];
for (let i = 0; i < 18; i++) {
  targetedIT.push({
    questionId: `E201Q${i}`,
    weights: { logic: 0.8, science: 0.4 }
  });
}

// Case B: Targeted responses favor other dimensions (e.g. art/management)
const targetedArt = [];
for (let i = 0; i < 18; i++) {
  targetedArt.push({
    questionId: `E201Q${i}`,
    weights: { art: 0.8, management: 0.5 }
  });
}

function calculateMockVector(grades, general, targeted) {
  const baseVector = [0.5, 0.5, 0.5, 0.5, 0.5]; // 50% from grades (say grade 4 everywhere = 0.5 contribution)
  
  const accumGeneral = [0, 0, 0, 0, 0];
  general.forEach(res => {
    dimKeys.forEach((dim, idx) => {
      accumGeneral[idx] += res.weights[dim] || 0;
    });
  });

  const accumTargeted = [0, 0, 0, 0, 0];
  targeted.forEach(res => {
    dimKeys.forEach((dim, idx) => {
      accumTargeted[idx] += res.weights[dim] || 0;
    });
  });

  const maxGen = Math.max(1.0, ...accumGeneral);
  const maxTar = Math.max(1.0, ...accumTargeted);

  dimKeys.forEach((dim, index) => {
    const normGen = accumGeneral[index] / maxGen;
    let normalizedDim = normGen;
    if (targeted.length > 0) {
      const normTar = accumTargeted[index] / maxTar;
      normalizedDim = (normGen * 0.40) + (normTar * 0.60);
    }
    baseVector[index] += normalizedDim * 0.5; // 50% from assessment
  });

  return baseVector;
}

// Cosine Similarity math helper
function getMatch(vecA, vecB) {
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
  return Math.round(adjustedScore * 100);
}

const vectorIT = calculateMockVector({}, generalResponses, targetedIT);
const vectorArt = calculateMockVector({}, generalResponses, targetedArt);

console.log("Vector IT:", vectorIT);
console.log("Vector Art/Management:", vectorArt);
console.log("Match for IT responses:", getMatch(vectorIT, benchmark));
console.log("Match for Art/Management responses:", getMatch(vectorArt, benchmark));
