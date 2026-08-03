export function analyzeGaps(userVector, targetBenchmark) {
  const dimKeys = ['logic', 'science', 'language', 'art', 'management'];
  const labels = ['ตรรกะ', 'วิทยาศาสตร์', 'ภาษา', 'ศิลปะ', 'การบริหาร'];
  
  return dimKeys.map((dim, index) => {
    const current = Math.round(userVector[index] * 100);
    const target = Math.round(targetBenchmark[index] * 100);
    const gap = target - current;
    
    let status = 'strong'; // สีเขียว
    if (gap > 0 && gap <= 15) {
      status = 'developing'; // สีเหลือง
    } else if (gap > 15) {
      status = 'weak'; // สีแดง
    }

    return {
      dimension: dim,
      label: labels[index],
      current,
      target,
      gap: Math.max(0, gap), // พิจารณาเฉพาะส่วนขาดที่เป็นบวก
      status
    };
  });
}
