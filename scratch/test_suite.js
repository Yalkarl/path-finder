import { calculateSkillVector } from '../src/lib/algorithms/skillVector.js';
import { calculateMatchPercentage } from '../src/lib/algorithms/cosineSimilarity.js';
import { calculateReadiness } from '../src/lib/algorithms/readinessCalculator.js';
import { findAlternativePaths } from '../src/lib/algorithms/alternativePaths.js';
import { JUNIOR_PATHS, SENIOR_PATHS } from '../src/lib/constants/educationPaths.js';

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

// ----------------------------------------------------------------
// TEST 1: 5D Skill Vector Calculation & Weight Matrix Accuracy
// ----------------------------------------------------------------
console.log('--- TEST GROUP 1: 5D Skill Vector Math & Weight Matrix ---');
const gradesFull = { math: 4, science: 4, thai: 4, english: 4, social: 4 };
const mockResponses = [
  { science: 1.0, logic: 0.5, language: 0.2, art: 0.1, management: 0.3 },
  { science: 0.8, logic: 0.7, language: 0.3, art: 0.2, management: 0.4 }
];

const skillVector = calculateSkillVector(gradesFull, mockResponses);
assert(Array.isArray(skillVector) && skillVector.length === 5, 'Skill Vector contains exactly 5 dimensions');
assert(skillVector.every(v => v >= 0 && v <= 1), 'All Skill Vector values are clamped strictly between 0.0 and 1.0');
assert(skillVector[1] > skillVector[3], 'Science dimension correctly exceeds Art dimension based on input weights');

// ----------------------------------------------------------------
// TEST 2: Cosine Similarity, Sigmoid Scaling & Gap Penalty
// ----------------------------------------------------------------
console.log('\n--- TEST GROUP 2: Cosine Similarity, Sigmoid & Gap Penalty ---');
const userVector = [0.8, 0.9, 0.4, 0.3, 0.5];
const targetBenchmark = SENIOR_PATHS['medicine'] ? SENIOR_PATHS['medicine'].benchmark : [0.85, 0.95, 0.3, 0.2, 0.35];

const matchScore = calculateMatchPercentage(userVector, targetBenchmark);
assert(typeof matchScore === 'number' && matchScore >= 0 && matchScore <= 100, 'Match percentage is valid number between 0% and 100%');
assert(matchScore >= 80, 'High compatibility profile receives >80% match score');

// Gap Penalty Check
const weakUserVector = [0.2, 0.2, 0.4, 0.3, 0.5]; // Very weak in Science/Logic for Medicine
const weakMatchScore = calculateMatchPercentage(weakUserVector, targetBenchmark);
assert(weakMatchScore < matchScore, 'Gap penalty correctly lowers match percentage for profiles missing core skills');

// ----------------------------------------------------------------
// TEST 3: Target Lock Readiness Calculator (Junior vs Senior)
// ----------------------------------------------------------------
console.log('\n--- TEST GROUP 3: Target Lock Readiness (Junior vs Senior) ---');
const portfolioItems = ['ค่าย 1 สอวน.', 'แข่งขันทักษะวิชาการระดับชาติ'];
const selfAssessment = { math: 5, science: 5 };

const readinessSenior = calculateReadiness(userVector, targetBenchmark, portfolioItems, selfAssessment, [], 'medicine', 'senior');
const readinessJunior = calculateReadiness(userVector, targetBenchmark, portfolioItems, selfAssessment, [], 'medicine', 'junior');

assert(readinessSenior >= 0 && readinessSenior <= 100, 'Senior readiness score is valid percentage');
assert(readinessJunior >= 0 && readinessJunior <= 100, 'Junior readiness score is valid percentage');

// ----------------------------------------------------------------
// TEST 4: Backup Alternatives Generator (Alternative Paths)
// ----------------------------------------------------------------
console.log('\n--- TEST GROUP 4: Alternative Paths Recommendation Engine ---');
const alternatives = findAlternativePaths(userVector, 'medicine', SENIOR_PATHS, 3);
assert(Array.isArray(alternatives) && alternatives.length === 3, 'Returns exactly 3 backup alternative paths');
assert(alternatives.every(alt => alt.id !== 'medicine'), 'Target path is strictly excluded from backup recommendations');

// ----------------------------------------------------------------
// SUMMARY REPORT
// ----------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 FINAL ACCURACY TEST SUMMARY:`);
console.log(`   - Total Unit Tests Executed: ${totalTests}`);
console.log(`   - Tests Passed: ${passedTests}`);
console.log(`   - Tests Failed: ${totalTests - passedTests}`);
console.log(`   - Data Error Rate: ${((totalTests - passedTests) / totalTests * 100).toFixed(2)}%`);
console.log(`   - Data Accuracy Rate: ${(passedTests / totalTests * 100).toFixed(2)}%`);
console.log('================================================================\n');
