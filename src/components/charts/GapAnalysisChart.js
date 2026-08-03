'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function GapAnalysisChart({ gapData }) {
  // แปลงรูปแบบข้อมูลเข้าสู่ Recharts
  const data = gapData.map(gap => ({
    subject: gap.label,
    'คะแนนของคุณ': gap.current,
    'เป้าหมายขั้นต่ำ': gap.target,
    status: gap.status,
    rawGap: gap.gap
  }));

  // กล่องอธิบายสถานะเพิ่มเติม (Tooltip)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      let statusColor = 'var(--success)';
      let statusText = 'ดีเยี่ยม! เกินเกณฑ์แล้ว';
      
      if (dataPoint.status === 'developing') {
        statusColor = 'var(--warning)';
        statusText = 'ต้องพัฒนาอีกนิด (ห่าง < 15%)';
      } else if (dataPoint.status === 'weak') {
        statusColor = 'var(--danger)';
        statusText = 'ต้องพัฒนาเพิ่มเติม (ห่าง > 15%)';
      }

      return (
        <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>ทักษะด้าน{label}</p>
          <p style={{ margin: '0.25rem 0', color: payload[0].color }}>{payload[0].name}: {payload[0].value}%</p>
          <p style={{ margin: '0.25rem 0', color: payload[1].color }}>{payload[1].name}: {payload[1].value}%</p>
          <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
          <p style={{ margin: 0, color: statusColor, fontWeight: 'bold', fontSize: '0.875rem' }}>
            {statusText}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="subject" type="category" width={90} tick={{ fontSize: 14, fontWeight: 600 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="คะแนนของคุณ" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
          <Bar dataKey="เป้าหมายขั้นต่ำ" fill="#E2E8F0" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
