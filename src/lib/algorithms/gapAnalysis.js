export function analyzeGaps(userVector, targetBenchmark) {
  const dimKeys = ['logic', 'science', 'language', 'art', 'management'];
  const labels = ['ตรรกะ', 'วิทยาศาสตร์', 'ภาษา', 'ศิลปะ', 'การบริหาร'];
  
  return dimKeys.map((dim, index) => {
    const current = Math.round(userVector[index] * 100);
    const target = Math.round(targetBenchmark[index] * 100);
    const gap = target - current;
    
    let status = 'strong'; // Green
    if (gap > 0 && gap <= 15) {
      status = 'developing'; // Yellow
    } else if (gap > 15) {
      status = 'weak'; // Red
    }

    return {
      dimension: dim,
      label: labels[index],
      current,
      target,
      gap: Math.max(0, gap), // Only care about positive gaps
      status
    };
  });
}
