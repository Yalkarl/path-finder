'use client';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const DIMENSION_DETAILS = {
  'ตรรกะ': {
    subjects: 'คณิตศาสตร์',
    desc: 'ประมวลผลจากทักษะการคิดวิเคราะห์ อัลกอริทึม และการแก้ปัญหาเชิงโครงสร้างในแบบทดสอบ'
  },
  'วิทยาศาสตร์': {
    subjects: 'วิทยาศาสตร์และเทคโนโลยี',
    desc: 'ประมวลผลจากการตั้งสมมติฐาน ความเข้าใจเทคโนโลยี และการแก้ปัญหาเชิงแล็บ'
  },
  'ภาษา': {
    subjects: 'ภาษาไทย & ภาษาอังกฤษ',
    desc: 'ประมวลผลจากทักษะการจับใจความ การสื่อสาร และการใช้ภาษาถ่ายทอดความคิดในคำตอบอิสระ'
  },
  'ศิลปะ': {
    subjects: 'สังคมศึกษา & ศิลปกรรม',
    desc: 'ประมวลผลจากความคิดสร้างสรรค์ การออกแบบ และมุมมองสุนทรียศาสตร์ในสถานการณ์จำลอง'
  },
  'การบริหาร': {
    subjects: 'สังคมศึกษา & การจัดการ',
    desc: 'ประมวลผลจากภาวะผู้นำ การจัดระบบงาน และการตัดสินใจบริหารคนในภาวะวิกฤต'
  }
};

const CustomTooltip = ({ active, payload, academics, aiEval }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const details = DIMENSION_DETAILS[data.subject] || {};
    const score = data.value;

    let levelBadge = 'ระดับปานกลาง';
    let levelBg = '#FEFCBF';
    let levelColor = '#B7791F';

    if (score >= 70) {
      levelBadge = 'ระดับโดดเด่น';
      levelBg = '#C6F6D5';
      levelColor = '#22543D';
    } else if (score < 45) {
      levelBadge = 'ควรพัฒนาเพิ่มเติม';
      levelBg = '#FED7D7';
      levelColor = '#9B2C2C';
    }

    // สกัดเหตุผลเจาะจงจากเกรดวิชาจริง
    let gradeNote = '';
    if (academics) {
      if (data.subject === 'ตรรกะ' && academics.math) gradeNote = ` (เกรดคณิตศาสตร์ ${academics.math})`;
      else if (data.subject === 'วิทยาศาสตร์' && academics.science) gradeNote = ` (เกรดวิทยาศาสตร์ ${academics.science})`;
      else if (data.subject === 'ภาษา' && (academics.thai || academics.english)) gradeNote = ` (เกรดภาษาไทย ${academics.thai || '-'} / อังกฤษ ${academics.english || '-'})`;
      else if (data.subject === 'การบริหาร' && academics.social) gradeNote = ` (เกรดสังคมศึกษา ${academics.social})`;
      else if (data.subject === 'ศิลปะ' && academics.social) gradeNote = ` (เกรดวิชาประยุกต์ ${academics.social})`;
    }

    return (
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
        border: '1.5px solid var(--primary-bg)',
        maxWidth: '300px',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            ทักษะด้าน{data.subject}
          </span>
          <span style={{ 
            fontSize: '0.7rem', 
            fontWeight: '700', 
            padding: '0.2rem 0.55rem', 
            borderRadius: '10px', 
            background: levelBg, 
            color: levelColor 
          }}>
            {levelBadge}
          </span>
        </div>

        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          คะแนนทักษะ: {score}%
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem' }}>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            เหตุผลและที่มาของคะแนน:
          </div>
          <div style={{ marginBottom: '0.3rem' }}>
            • คำนวณจากเกรดวิชา <strong>{details.subjects}</strong>{gradeNote} รวมกับคำตอบแบบทดสอบ
          </div>
          <div>
            • {details.desc}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function SkillRadarChart({ vector, academics, aiEval }) {
  const data = [
    { subject: 'ตรรกะ', value: Math.round(vector[0] * 100), fullMark: 100 },
    { subject: 'วิทยาศาสตร์', value: Math.round(vector[1] * 100), fullMark: 100 },
    { subject: 'ภาษา', value: Math.round(vector[2] * 100), fullMark: 100 },
    { subject: 'ศิลปะ', value: Math.round(vector[3] * 100), fullMark: 100 },
    { subject: 'การบริหาร', value: Math.round(vector[4] * 100), fullMark: 100 },
  ];

  return (
    <div style={{ width: '100%', height: '400px', margin: '0 auto' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }} 
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="คะแนนทักษะของคุณ"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={3}
            fill="var(--primary)"
            fillOpacity={0.4}
            isAnimationActive={true}
          />
          <Tooltip content={<CustomTooltip academics={academics} aiEval={aiEval} />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
