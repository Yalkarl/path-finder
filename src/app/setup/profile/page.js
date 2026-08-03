'use client';
import { useState, useEffect } from 'react';
import MrPathGreeting from '@/components/setup/MrPathGreeting';
import { useRouter } from 'next/navigation';

export default function ProfileStep() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [level, setLevel] = useState('junior');
  const [grade, setGrade] = useState('');

  useEffect(() => {
    const savedLevel = localStorage.getItem('setup_educationLevel');
    if (savedLevel) {
      setLevel(savedLevel);
      // Restore profile name and grade if they exist in localStorage
      const savedName = localStorage.getItem('setup_name');
      const savedGrade = localStorage.getItem('setup_grade');
      if (savedName) setName(savedName);
      if (savedGrade) setGrade(savedGrade);
    } else {
      router.push('/setup/education-level');
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('setup_name', name);
    localStorage.setItem('setup_grade', grade);
    router.push('/setup/grades');
  };

  const gradeOptions = level === 'junior' 
    ? [{ id: 'm1', label: 'ม.1' }, { id: 'm2', label: 'ม.2' }, { id: 'm3', label: 'ม.3' }]
    : [{ id: 'm4', label: 'ม.4' }, { id: 'm5', label: 'ม.5' }, { id: 'm6', label: 'ม.6' }];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <div style={{ width: '30px', height: '6px', background: 'var(--primary)', borderRadius: '3px' }}></div>
        <div style={{ width: '30px', height: '6px', background: 'var(--primary)', borderRadius: '3px' }}></div>
        <div style={{ width: '6px', height: '6px', background: 'var(--border)', borderRadius: '3px' }}></div>
      </div>

      <MrPathGreeting message="ดีเลย! ขอกราบสวัสดีอย่างเป็นทางการครับ เพื่อให้ผมเรียกชื่อได้ถูกต้อง รบกวนพิมพ์ชื่อ-นามสกุล และเลือกชั้นปีปัจจุบันให้หน่อยนะครับ" />

      <form className="card" onSubmit={handleSubmit}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>ข้อมูลของคุณ</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>ชื่อ-นามสกุล</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="เช่น นายสมชาย ใจดี"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>ระดับชั้น</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {gradeOptions.map(opt => (
              <div 
                key={opt.id}
                onClick={() => setGrade(opt.id)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: `2px solid ${grade === opt.id ? 'var(--primary)' : 'var(--border)'}`,
                  background: grade === opt.id ? 'var(--primary)' : 'transparent',
                  color: grade === opt.id ? 'white' : 'var(--text-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button 
            type="button" 
            onClick={() => router.push('/setup/education-level')}
            className="btn-secondary"
            style={{
              flex: '1 1 30%',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              borderRadius: '14px',
              border: '1.5px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
          >
            ← ย้อนกลับ
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ flex: '1 1 70%', borderRadius: '14px' }} 
            disabled={!name || !grade}
          >
            ถัดไป →
          </button>
        </div>
      </form>
    </div>
  );
}
