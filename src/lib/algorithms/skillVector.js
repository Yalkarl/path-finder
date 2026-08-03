/**
 * Calculates the final skill vector based on academic grades and scenario responses.
 * Academic grades are mapped to the 5 dimensions via a polarized weight matrix.
 * Scenario responses (Holland's Theory based) accumulate and normalize to 0-1.
 *
 * Academic weight: 50% | Assessment weight: 50%
 */

import { TARGET_CLUSTERS } from '../constants/targetedAssessment';

// Mapping of 5 subjects to 5 skill dimensions (POLARIZED)
// subjects: math, science, thai, english, social
// dimensions: logic, science, language, art, management
// dominant weights: 0.85+, non-dominant: 0.15-
const ACADEMIC_WEIGHT_MATRIX = {
  logic:      { math: 0.90, science: 0.10, thai: 0.00, english: 0.00, social: 0.00 },
  science:    { math: 0.10, science: 0.90, thai: 0.00, english: 0.00, social: 0.00 },
  language:   { math: 0.00, science: 0.00, thai: 0.50, english: 0.50, social: 0.00 },
  art:        { math: 0.00, science: 0.00, thai: 0.30, english: 0.15, social: 0.55 },
  management: { math: 0.15, science: 0.00, thai: 0.10, english: 0.10, social: 0.65 }
};

const ACADEMIC_WEIGHT = 0.30;
const ASSESSMENT_WEIGHT = 0.70;

export function calculateSkillVector(academicGrades, assessmentResponses, targetPath = null) {
  // Normalize grades to 0-1 (from 0-4)
  const normGrades = {
    math: (academicGrades.math || 0) / 4,
    science: (academicGrades.science || 0) / 4,
    thai: (academicGrades.thai || 0) / 4,
    english: (academicGrades.english || 0) / 4,
    social: (academicGrades.social || 0) / 4,
  };

  const baseVector = [0, 0, 0, 0, 0]; // logic, science, language, art, management
  const dimKeys = ['logic', 'science', 'language', 'art', 'management'];

  // Add academic contribution (Weight: 30%)
  dimKeys.forEach((dim, index) => {
    const weights = ACADEMIC_WEIGHT_MATRIX[dim];
    const val = (
      normGrades.math * weights.math +
      normGrades.science * weights.science +
      normGrades.thai * weights.thai +
      normGrades.english * weights.english +
      normGrades.social * weights.social
    );
    baseVector[index] += val * ACADEMIC_WEIGHT;
  });

  // Add assessment contribution (Weight: 70%)
  if (assessmentResponses && assessmentResponses.length > 0) {
    let relevantResponses = assessmentResponses;

    if (targetPath) {
      // TARGET LOCK MODE: Use ONLY the 3 targeted stage responses
      const clusterKey = TARGET_CLUSTERS[targetPath];
      if (clusterKey) {
        const TARGETED_PREFIXES = {
          'medical': ['M101', 'M102', 'M103'],
          'engineering': ['E201', 'E202', 'E203'],
          'science': ['S301', 'S302', 'S303'],
          'business': ['B401', 'B402', 'B403'],
          'creative': ['C501', 'C502', 'C503'],
          'social': ['L601', 'L602', 'L603']
        };
        const allowedPrefixes = TARGETED_PREFIXES[clusterKey] || [];

        relevantResponses = assessmentResponses.filter(response => {
          const qId = response.questionId || '';
          return allowedPrefixes.some(prefix => qId.startsWith(prefix));
        });
      }
    } else {
      // DISCOVERY MODE: Use ONLY general assessment responses (stages 1-12)
      relevantResponses = assessmentResponses.filter(response => {
        const qId = response.questionId || '';
        return /^S(?:[1-9]|1[0-2])Q/.test(qId);
      });
      // If no questionId format matches (legacy data), use all
      if (relevantResponses.length === 0) {
        relevantResponses = assessmentResponses;
      }
    }

    if (relevantResponses.length > 0) {
      const accumulated = [0, 0, 0, 0, 0];

      relevantResponses.forEach(response => {
        dimKeys.forEach((dim, index) => {
          const val = response[dim] !== undefined ? response[dim] : (response.weights?.[dim] || 0);
          accumulated[index] += val;
        });
      });

      const maxVal = Math.max(1.0, ...accumulated);
      
      // Calculate progress factor to scale assessment contribution based on completed questions
      const totalExpected = targetPath ? 18 : 144;
      const progressRatio = Math.min(1, relevantResponses.length / totalExpected);
      const progressFactor = 0.3 + 0.7 * progressRatio;

      dimKeys.forEach((dim, index) => {
        const normalizedDim = Math.min(1, accumulated[index] / maxVal);
        baseVector[index] += normalizedDim * ASSESSMENT_WEIGHT * progressFactor;
      });
    }
  }

  // Clamp final vector to ensure values are between 0 and 1
  return baseVector.map(val => Math.min(Math.max(val, 0), 1));
}
