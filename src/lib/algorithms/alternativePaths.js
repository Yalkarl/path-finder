import { calculateMatchPercentage } from './cosineSimilarity';

/**
 * Finds alternative education/career paths based on user's skill vector,
 * excluding the locked target path.
 * 
 * @param {number[]} userVector - Array of 5 normalized values [logic, science, language, art, management]
 * @param {string} targetPathId - The ID of the currently locked target path
 * @param {Object} allPathsObject - Either JUNIOR_PATHS or SENIOR_PATHS object
 * @param {number} topN - Number of alternatives to return (default 3)
 * @returns {Array} - Sorted list of alternative path candidates with match percentages and reasons
 */
export function findAlternativePaths(userVector, targetPathId, allPathsObject, topN = 3) {
  const candidates = Object.values(allPathsObject);
  const dimensions = ['ตรรกะ', 'วิทยาศาสตร์', 'ภาษา', 'ศิลปะ', 'การบริหาร'];
  
  return candidates
    .filter(candidate => candidate.id !== targetPathId)
    .map(candidate => {
      const matchPercentage = calculateMatchPercentage(userVector, candidate.benchmark);
      
      // Dynamically generate a reason why this alternative is a good backup plan
      const matchingDims = [];
      for (let i = 0; i < userVector.length; i++) {
        // If the path needs this dimension and the user is good at it
        if (candidate.benchmark[i] >= 0.6 && userVector[i] >= 0.5) {
          matchingDims.push(dimensions[i]);
        }
      }
      
      let reason = 'ทักษะพื้นฐานและโครงสร้างทักษะใกล้เคียงกัน';
      if (matchingDims.length > 0) {
        reason = `เน้นการใช้ทักษะด้าน ${matchingDims.slice(0, 2).join(' และ ')} ที่คุณถนัดเช่นกัน`;
      } else {
        // Fallback: find the dimension with the smallest gap
        let minGapIdx = 0;
        let minGap = 999;
        for (let i = 0; i < userVector.length; i++) {
          const gap = Math.abs(userVector[i] - candidate.benchmark[i]);
          if (gap < minGap) {
            minGap = gap;
            minGapIdx = i;
          }
        }
        reason = `มีช่องว่างทักษะวิชาด้าน ${dimensions[minGapIdx]} น้อยที่สุด`;
      }

      return {
        ...candidate,
        matchPercentage,
        reason
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, topN);
}
