export const ACHIEVEMENTS = [
  { id: 'explorer', name: 'ก้าวแรกของนักล่าฝัน', icon: 'Compass', criteria: 'กรอกข้อมูลตั้งต้นเสร็จสมบูรณ์', unlocks: 'จิ้งจอก' },
  { id: 'streak_3', name: 'นักสะสม Streak', icon: 'Flame', criteria: 'เข้าใช้งานติดต่อกัน 3 วัน', unlocks: 'แพนด้า' },
  { id: 'high_gpax', name: 'นักเรียนทุนเกรดพุ่ง', icon: 'GraduationCap', criteria: 'บันทึก GPAX เฉลี่ยมากกว่า 3.00', unlocks: 'หมวกปริญญา' },
  { id: 'target_lock', name: 'ผู้พิชิตเป้าหมาย', icon: 'Target', criteria: 'ล็อกเป้าหมายสายการเรียน Target Lock', unlocks: 'สิงโต' },
  { id: 'chatty', name: 'นักคุยกับ Mr. Path', icon: 'MessageSquare', criteria: 'สนทนากับ Mr. Path AI เกิน 5 ข้อความ', unlocks: 'พระอาทิตย์' },
  { id: 'stages_6', name: 'ผู้พิชิตครึ่งทาง', icon: 'Flag', criteria: 'ทำแบบทดสอบผ่าน 6 ด่าน', unlocks: 'นกฮูก' },
  { id: 'stages_12', name: 'ผู้ท่องจักรวาลการเรียน', icon: 'Trophy', criteria: 'ทำแบบทดสอบครบหมดทั้ง 12 ด่าน', unlocks: 'หมวกอวกาศ' },
  { id: 'music_lover', name: 'นักฟังเพลงผ่อนคลาย', icon: 'Headphones', criteria: 'เปิดเพลงประกอบขณะทำแบบทดสอบ', unlocks: 'หูฟังดีเจ' },
  { id: 'profile_customizer', name: 'นักแต่งโปรไฟล์', icon: 'Palette', criteria: 'ปรับแต่งตัวละครในหน้าโปรไฟล์', unlocks: 'มงกุฎหัวใจ' },
  { id: 'trophy_master', name: 'ผู้พิชิตถ้วยเกียรติยศ', icon: 'Crown', criteria: 'สะสม Achievement ปลดล็อกเกิน 5 ถ้วย', unlocks: 'มงกุฎราชา' },
  
  { id: 'logic_genius', name: 'อัจฉริยะตรรกะ', icon: 'Brain', criteria: 'ทักษะตรรกะ > 75%' },
  { id: 'scientist', name: 'นักวิจัยวิทย์', icon: 'FlaskConical', criteria: 'ทักษะวิทยาศาสตร์ > 75%' },
  { id: 'linguist', name: 'ปรมาจารย์ภาษา', icon: 'PenTool', criteria: 'ทักษะภาษา > 75%' },
  { id: 'artist', name: 'นักสร้างสรรค์', icon: 'Palette', criteria: 'ทักษะศิลปะ > 75%' },
  { id: 'leader', name: 'ผู้นำแห่งอนาคต', icon: 'Crown', criteria: 'ทักษะการบริหาร > 75%' },
  { id: 'streak_7', name: 'มุ่งมั่น 7 วัน', icon: 'Flame', criteria: 'เข้าใช้งานติดต่อกัน 7 วัน' },
  { id: 'streak_30', name: 'นักสู้ 30 วัน', icon: 'Gem', criteria: 'เข้าใช้งานติดต่อกัน 30 วัน' },
  { id: 'planner', name: 'นักวางแผน Roadmap', icon: 'ClipboardList', criteria: 'สร้างแผนปฏิบัติการส่วนบุคคลครั้งแรก' },
];

export function checkAchievements(profile) {
  const unlocked = new Set(profile.achievements || []);
  
  // 1. Basic Setup Completion
  if (profile.completedSetup) unlocked.add('explorer');
  
  // 2. High GPAX check
  if (profile.academics?.gpax && parseFloat(profile.academics.gpax) >= 3.0) {
    unlocked.add('high_gpax');
  }

  // 3. Target Lock Mode Selection
  if (profile.analysisMode === 'target-lock' || profile.targetPath) {
    unlocked.add('target_lock');
  }

  // 4. Customizer Usage
  if (profile.characterId || profile.accessoryId) {
    unlocked.add('profile_customizer');
  }

  // 5. Music Player Usage
  if (profile.musicPlayed || typeof window !== 'undefined' && localStorage.getItem('pathfinder_music_played') === 'true') {
    unlocked.add('music_lover');
  }
  
  // 6. Skill Vectors
  if (profile.results?.skillVector) {
    const sv = profile.results.skillVector;
    if (sv[0] > 0.75) unlocked.add('logic_genius');
    if (sv[1] > 0.75) unlocked.add('scientist');
    if (sv[2] > 0.75) unlocked.add('linguist');
    if (sv[3] > 0.75) unlocked.add('artist');
    if (sv[4] > 0.75) unlocked.add('leader');
  }

  // 7. Streak Count
  const currentStreak = profile.streak?.current || 0;
  if (currentStreak >= 3) unlocked.add('streak_3');
  if (currentStreak >= 7) unlocked.add('streak_7');
  if (currentStreak >= 30) unlocked.add('streak_30');

  // 8. Completed Stages Count
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

    if (completedStagesCount >= 6) unlocked.add('stages_6');
    if (completedStagesCount >= 12) unlocked.add('stages_12');
  }

  // 9. Trophy Master Check (Unlocked > 5)
  if (unlocked.size >= 5) {
    unlocked.add('trophy_master');
  }

  return Array.from(unlocked);
}
