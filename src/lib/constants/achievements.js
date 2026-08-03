export const ACHIEVEMENTS = [
  { id: 'explorer', name: 'นักสำรวจ', icon: '🧭', criteria: 'กรอกข้อมูลตั้งต้นเสร็จสมบูรณ์' },
  { id: 'logic_genius', name: 'อัจฉริยะตรรกะ', icon: '🧠', criteria: 'ทักษะตรรกะ > 75%' },
  { id: 'scientist', name: 'นักวิทย์', icon: '🔬', criteria: 'ทักษะวิทยาศาสตร์ > 75%' },
  { id: 'linguist', name: 'นักภาษา', icon: '📝', criteria: 'ทักษะภาษา > 75%' },
  { id: 'artist', name: 'นักสร้างสรรค์', icon: '🎨', criteria: 'ทักษะศิลปะ > 75%' },
  { id: 'leader', name: 'ผู้นำ', icon: '👑', criteria: 'ทักษะการบริหาร > 75%' },
  { id: 'streak_7', name: 'มุ่งมั่น 7 วัน', icon: '🔥', criteria: 'เข้าใช้งานติดต่อกัน 7 วัน' },
  { id: 'streak_30', name: 'นักสู้ 30 วัน', icon: '💎', criteria: 'เข้าใช้งานติดต่อกัน 30 วัน' },
  { id: 'planner', name: 'นักวางแผน', icon: '📋', criteria: 'สร้างแผนปฏิบัติการส่วนบุคคลครั้งแรก' },
  { id: 'chatty', name: 'นักสนทนา', icon: '💬', criteria: 'สนทนากับ Mr. Path 10 ครั้ง' },
  { id: 'stages_6', name: 'ผู้พิชิตครึ่งทาง', icon: '🏃', criteria: 'ทำแบบทดสอบผ่าน 6 ด่าน' },
  { id: 'stages_12', name: 'ผู้พิชิต 12 ด่าน', icon: '🏆', criteria: 'ทำแบบทดสอบครบหมดทั้ง 12 ด่าน' },
];

export function checkAchievements(profile) {
  const unlocked = [];
  
  if (profile.completedSetup) unlocked.push('explorer');
  
  if (profile.results?.skillVector) {
    const sv = profile.results.skillVector;
    if (sv[0] > 0.75) unlocked.push('logic_genius');
    if (sv[1] > 0.75) unlocked.push('scientist');
    if (sv[2] > 0.75) unlocked.push('linguist');
    if (sv[3] > 0.75) unlocked.push('artist');
    if (sv[4] > 0.75) unlocked.push('leader');
  }

  if (profile.streak?.current >= 7) unlocked.push('streak_7');
  if (profile.streak?.current >= 30) unlocked.push('streak_30');
  
  // planner and chatty would be updated in the chat logic
  if (profile.achievements?.includes('planner')) unlocked.push('planner');
  if (profile.achievements?.includes('chatty')) unlocked.push('chatty');

  // Check completed stages count from usedQuestionIds
  if (profile.usedQuestionIds && profile.usedQuestionIds.length > 0) {
    const usedIds = new Set(profile.usedQuestionIds);
    let completedStagesCount = 0;
    
    for (let stageId = 1; stageId <= 12; stageId++) {
      let isStageComplete = true;
      for (let qNum = 1; qNum <= 12; qNum++) {
        if (!usedIds.has(`S${stageId}Q${qNum}`)) {
          isStageComplete = false;
          break;
        }
      }
      if (isStageComplete) {
        completedStagesCount++;
      }
    }

    if (completedStagesCount >= 6) unlocked.push('stages_6');
    if (completedStagesCount >= 12) unlocked.push('stages_12');
  }

  return unlocked;
}
