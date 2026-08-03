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

export default function SkillRadarChart({ vector }) {
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
          <Tooltip 
            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
