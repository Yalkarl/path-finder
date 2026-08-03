export const SELF_ASSESSMENT_SUBJECTS = {
  // มัธยมปลาย (Senior Paths) - 26 คณะ
  'medicine': [
    { id: 'bio', label: 'ชีววิทยา (Biology)', icon: '🧬' },
    { id: 'chem', label: 'เคมี (Chemistry)', icon: '⚗️' },
    { id: 'phys', label: 'ฟิสิกส์ (Physics)', icon: '⚛️' },
    { id: 'eng', label: 'ภาษาอังกฤษ (English)', icon: '🇬🇧' }
  ],
  'dentistry': [
    { id: 'bio', label: 'ชีววิทยา (Biology)', icon: '🧬' },
    { id: 'chem', label: 'เคมี (Chemistry)', icon: '⚗️' },
    { id: 'manual-dexterity', label: 'งานฝีมือ / ทักษะทางทันตกรรม', icon: '🎨' },
    { id: 'eng', label: 'ภาษาอังกฤษ (English)', icon: '🇬🇧' }
  ],
  'pharmacy': [
    { id: 'chem', label: 'เคมี (Chemistry)', icon: '⚗️' },
    { id: 'bio', label: 'ชีววิทยา (Biology)', icon: '🧬' },
    { id: 'precision', label: 'ความละเอียดแม่นยำในการตวง/คำนวณ', icon: '🧪' },
    { id: 'eng', label: 'ภาษาอังกฤษ (English)', icon: '🇬🇧' }
  ],
  'nursing': [
    { id: 'bio', label: 'ชีววิทยา (Biology)', icon: '🧬' },
    { id: 'empathy', label: 'ความเห็นใจและจิตบริการ (Empathy & Service)', icon: '❤️' },
    { id: 'resilience', label: 'ความอึดและการทนรับแรงกดดัน/เวลาทำงาน', icon: '⏰' }
  ],
  'veterinary': [
    { id: 'bio', label: 'ชีววิทยา (Biology)', icon: '🧬' },
    { id: 'chem', label: 'เคมี (Chemistry)', icon: '⚗️' },
    { id: 'animal-handling', label: 'ความเข้าใจและทนต่ออารมณ์สัตว์', icon: '🐾' },
    { id: 'eng', label: 'ภาษาอังกฤษ (English)', icon: '🇬🇧' }
  ],
  'allied-health': [
    { id: 'bio', label: 'ชีววิทยา (Biology)', icon: '🧬' },
    { id: 'chem', label: 'เคมี (Chemistry)', icon: '⚗️' },
    { id: 'lab-skills', label: 'ทักษะปฏิบัติการห้องแล็บ', icon: '🔬' }
  ],
  'science': [
    { id: 'core-science', label: 'วิทยาศาสตร์หลัก (เคมี/ฟิสิกส์/ชีวะ)', icon: '🧬' },
    { id: 'scientific-inquiry', label: 'ความสนใจในการวิจัยและทดลอง', icon: '🧪' },
    { id: 'math', label: 'คณิตศาสตร์พื้นฐาน (Math)', icon: '📐' }
  ],
  'food-tech': [
    { id: 'bio-chem', label: 'ชีวเคมีและจุลชีววิทยาทางอาหาร', icon: '🔬' },
    { id: 'food-prep', label: 'การทำอาหาร/ศิลปะงานคหกรรมศาสตร์', icon: '🍳' },
    { id: 'lab-precision', label: 'ทักษะทดลองเคมีแปรรูปอาหาร', icon: '🧪' }
  ],
  'computer-science': [
    { id: 'prog-logic', label: 'ตรรกะคอมพิวเตอร์ / การคิดเชิงอัลกอริทึม', icon: '💻' },
    { id: 'tech-interest', label: 'ความสนใจอัพเดทเทคโนโลยีใหม่ๆ', icon: '🌐' },
    { id: 'eng', label: 'ภาษาอังกฤษ (English)', icon: '🇬🇧' }
  ],
  'psychology': [
    { id: 'empathy', label: 'ความเห็นอกเห็นใจและการเข้าใจอารมณ์มนุษย์', icon: '🤝' },
    { id: 'research-stats', label: 'ทักษะการวิจัยทางสังคมและสถิติวิเคราะห์', icon: '📊' },
    { id: 'eng', label: 'ภาษาอังกฤษเชิงวิชาการ (ตำราต่างประเทศ)', icon: '🇬🇧' }
  ],
  'engineering': [
    { id: 'phys', label: 'ฟิสิกส์ (Physics)', icon: '⚛️' },
    { id: 'adv-math', label: 'คณิตศาสตร์ขั้นสูง (Advanced Math)', icon: '📐' },
    { id: 'sys-logic', label: 'ตรรกะระบบและการคิดเชิงวิศวกรรม', icon: '⚙️' }
  ],
  'political-science': [
    { id: 'social-literacy', label: 'ความรู้ความเข้าใจเรื่องการเมือง/การปกครอง', icon: '🏛️' },
    { id: 'critical-thinking', label: 'การวิเคราะห์โครงสร้างสังคมและความสัมพันธ์', icon: '🧩' },
    { id: 'comm-skills', label: 'ทักษะการสื่อสารและความเป็นผู้นำ', icon: '🗣️' }
  ],
  'law': [
    { id: 'interpretation', label: 'การอ่านจับประเด็นและตีความข้อความรัดกุม', icon: '📖' },
    { id: 'logic-arg', label: 'การโต้แย้งเชิงเหตุผลและวิเคราะห์กฎหมาย', icon: '⚖️' },
    { id: 'ethics', label: 'คุณธรรมจริยธรรมเชิงวิชาชีพ', icon: '📜' }
  ],
  'agriculture': [
    { id: 'bio-botany', label: 'ชีววิทยา / กีฏวิทยา / พฤกษศาสตร์', icon: '🌿' },
    { id: 'eco-interest', label: 'ความรักธรรมชาติและสิ่งแวดล้อม', icon: '🌳' },
    { id: 'grit', label: 'ความลุยงานกลางแจ้งและความสมบุกสมบัน', icon: '☀️' }
  ],
  'business-administration': [
    { id: 'stat-math', label: 'คณิตศาสตร์ประยุกต์ / สถิติ / การตรวจสอบ', icon: '📊' },
    { id: 'business-sense', label: 'ความเข้าใจเชิงธุรกิจและการตลาด', icon: '💼' },
    { id: 'comm-skills', label: 'ทักษะการสื่อสารและเจรจา', icon: '🗣️' }
  ],
  'communication-arts': [
    { id: 'media-creativity', label: 'ความคิดสร้างสรรค์ในการออกแบบคอนเทนต์', icon: '🎥' },
    { id: 'public-speaking', label: 'การนำเสนอและการพูดในที่สาธารณะ', icon: '🎙️' },
    { id: 'coordination', label: 'การประสานงานและการทำงานกลุ่มสื่อสาร', icon: '👥' }
  ],
  'education': [
    { id: 'teaching-pedagogy', label: 'ทักษะการสอนและถ่ายทอดความรู้ให้เข้าใจง่าย', icon: '👩‍🏫' },
    { id: 'child-psychology', label: 'จิตวิทยาพัฒนาการและวัยรุ่น', icon: '🎒' },
    { id: 'patience', label: 'ความอดทนและจิตวิญญาณความเป็นครู', icon: '🏫' }
  ],
  'industrial-education': [
    { id: 'technical-skills', label: 'ทักษะงานช่าง/เขียนแบบ/วิศวกรรมปฏิบัติ', icon: '🔧' },
    { id: 'pedagogy', label: 'ทักษะการแนะแนวและถ่ายทอดวิชาชีพครูช่าง', icon: '👨‍🏫' },
    { id: 'safety', label: 'ความเข้าใจเรื่องความปลอดภัยในโรงฝึกงาน', icon: '⚠️' }
  ],
  'humanities-liberal-arts': [
    { id: 'languages', label: 'ทักษะการเรียนรู้ภาษาต่างประเทศ', icon: '🗣️' },
    { id: 'comprehension', label: 'การอ่านจับประเด็นและวรรณคดีวิจารณ์', icon: '📖' },
    { id: 'culture-history', label: 'ความสนใจในประวัติศาสตร์และวัฒนธรรม', icon: '🏛️' }
  ],
  'fine-applied-arts': [
    { id: 'specialized-art', label: 'ทักษะศิลปะเฉพาะตัว (วาดรูป/จิตรกรรม/การแสดง)', icon: '🎨' },
    { id: 'creativity', label: 'ความคิดสร้างสรรค์อิสระและการออกแบบ', icon: '💡' },
    { id: 'expression', label: 'การถ่ายทอดอารมณ์ความรู้สึกผ่านผลงาน', icon: '🎭' }
  ],
  'architecture': [
    { id: 'spatial-art', label: 'การคิดเชิงมิติสัมพันธ์ / วาดรูปสเก็ตช์', icon: '📐' },
    { id: 'creativity', label: 'ความคิดสร้างสรรค์ทางสถาปัตย์', icon: '💡' },
    { id: 'applied-math', label: 'คณิตศาสตร์ประยุกต์ / ฟิสิกส์พื้นฐาน', icon: '🏗️' }
  ],
  'sports-science': [
    { id: 'anatomy-physio', label: 'กายวิภาคศาสตร์และสรีรวิทยาเบื้องต้น', icon: '🦴' },
    { id: 'sports-mind', label: 'ทักษะการฝึกสอนกีฬาและจิตวิทยาการกีฬา', icon: '⚽' },
    { id: 'health-science', label: 'ความเข้าใจด้านโภชนาการและการปฐมพยาบาล', icon: '🩹' }
  ],
  'logistics-industrial-tech': [
    { id: 'ops-math', label: 'คณิตศาสตร์จัดลำดับคลังสินค้าและสถิติขนส่ง', icon: '📦' },
    { id: 'systematic-flow', label: 'การคิดเป็นระบบและการบริหารห่วงโซ่อุปทาน', icon: '🔄' },
    { id: 'tech-mgt', label: 'ทักษะการจัดการเครื่องจักรระบบโรงงาน', icon: '⚙️' }
  ],
  'tourism-hospitality': [
    { id: 'foreign-langs', label: 'ภาษาต่างประเทศและการสนทนา', icon: '🗣️' },
    { id: 'service-mind', label: 'จิตวิทยาการบริการและบุคลิกภาพที่เป็นมิตร', icon: '🛎️' },
    { id: 'adaptability', label: 'การรับมือปัญหาเฉพาะหน้าและความยืดหยุ่น', icon: '💫' }
  ],
  'environmental-science': [
    { id: 'ecology', label: 'วิทยาศาสตร์สิ่งแวดล้อมและนิเวศวิทยา', icon: '🌱' },
    { id: 'lab-analysis', label: 'ทักษะตรวจวัดมลพิษทางชีวภาพและเคมี', icon: '🧪' },
    { id: 'conservation', label: 'ความตระหนักรู้และการขับเคลื่อนนโยบายอนุรักษ์', icon: '🌍' }
  ],
  'music-performing-arts': [
    { id: 'music-theory', label: 'ทฤษฎีดนตรีสากล/ดนตรีไทยและการประพันธ์', icon: '🎼' },
    { id: 'auditory-skills', label: 'ทักษะการฟังโสตประสาทแยกแยะเสียงดนตรี', icon: '👂' },
    { id: 'performance', label: 'ทักษะการแสดงสดและการควบคุมเวที', icon: '🎵' }
  ],

  // มัธยมต้น (Junior Paths)
  'medicine-pharmacy': [
    { id: 'bio', label: 'ชีววิทยา (Biology)', icon: '🧬' },
    { id: 'chem', label: 'เคมี (Chemistry)', icon: '⚗️' },
    { id: 'logic', label: 'ตรรกะการคิดวิเคราะห์และแก้ปัญหา', icon: '🧩' }
  ],
  'nursing-allied-health': [
    { id: 'bio', label: 'ชีววิทยา (Biology)', icon: '🧬' },
    { id: 'empathy', label: 'ความเห็นใจและจิตบริการ (Empathy & Service)', icon: '❤️' },
    { id: 'care', label: 'การดูแลช่วยเหลือผู้อื่น', icon: '🤝' }
  ],
  'engineering-architecture': [
    { id: 'phys', label: 'ฟิสิกส์พื้นฐาน (Physics)', icon: '⚛️' },
    { id: 'math', label: 'คณิตศาสตร์และการคิดคำนวณ', icon: '📐' },
    { id: 'drawing', label: 'มิติสัมพันธ์และทักษะการวาด/ออกแบบ', icon: '🎨' }
  ],
  'science-technology': [
    { id: 'sci', label: 'วิทยาศาสตร์หลัก (ฟิสิกส์/เคมี/ชีวะ)', icon: '🔬' },
    { id: 'math', label: 'คณิตศาสตร์ (Mathematics)', icon: '📐' },
    { id: 'it', label: 'ความถนัดทางคอมพิวเตอร์และไอที', icon: '💻' }
  ],
  'business-economics-accounting': [
    { id: 'math', label: 'คณิตศาสตร์และวิชาสถิติเชิงประยุกต์', icon: '📊' },
    { id: 'business', label: 'ความเข้าใจเชิงธุรกิจและการจัดการ', icon: '💼' },
    { id: 'finance', label: 'ความสนใจเรื่องการเงินและการลงทุน', icon: '📈' }
  ],
  'law-political-science': [
    { id: 'logic', label: 'การโต้แย้งเชิงเหตุผลและคิดอย่างมีวิจารณญาณ', icon: '⚖️' },
    { id: 'reading', label: 'การอ่านจับใจความและตีความอย่างถูกต้อง', icon: '📖' },
    { id: 'social', label: 'ความรู้รอบตัวด้านสังคมและการปกครอง', icon: '🏛️' }
  ],
  'humanities-social-science': [
    { id: 'english', label: 'ภาษาอังกฤษ (English)', icon: '🇬🇧' },
    { id: 'thai', label: 'ภาษาไทยเพื่อการสื่อสาร', icon: '🇹🇭' },
    { id: 'history', label: 'ความสนใจด้านประวัติศาสตร์และวัฒนธรรม', icon: '🏛️' }
  ],
  'communication-fine-arts': [
    { id: 'creativity', label: 'ความคิดสร้างสรรค์และจินตนาการ', icon: '💡' },
    { id: 'art', label: 'ทักษะทางศิลปะ ดนตรี หรือการแสดง', icon: '🎨' },
    { id: 'media', label: 'ความสนใจการออกแบบสื่อและคอนเทนต์', icon: '🎥' }
  ],
  'education': [
    { id: 'teaching', label: 'ทักษะการสอนและอธิบายให้เข้าใจง่าย', icon: '👩‍🏫' },
    { id: 'patience', label: 'ความอดทนและจิตสาธารณะ', icon: '🏫' },
    { id: 'social', label: 'มนุษยสัมพันธ์และการสื่อสารร่วมงานกับผู้อื่น', icon: '👥' }
  ],
  'special-smte': [
    { id: 'adv-math', label: 'คณิตศาสตร์ขั้นสูงและคณิตคิดเร็ว', icon: '📐' },
    { id: 'adv-sci', label: 'วิทยาศาตร์ขั้นสูงและการทดลอง', icon: '🔬' },
    { id: 'olympiad', label: 'ความสนใจการสอบแข่งขันทักษะวิชาการระดับสูง', icon: '🏆' }
  ],
  'special-iep': [
    { id: 'listening', label: 'การฟังและการออกเสียงภาษาอังกฤษ (Listening)', icon: '🎧' },
    { id: 'speaking', label: 'การสื่อสารสนทนาภาษาอังกฤษ (Speaking)', icon: '🗣️' },
    { id: 'writing', label: 'ไวยากรณ์และการเขียนภาษาอังกฤษ (Writing)', icon: '✍️' }
  ]
};
