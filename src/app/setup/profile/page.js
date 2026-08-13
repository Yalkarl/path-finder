'use client';
import { useState, useEffect } from 'react';
import MrPathGreeting from '@/components/setup/MrPathGreeting';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, UserCheck } from 'lucide-react';

export default function ProfileStep() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [level, setLevel] = useState('junior');
  const [grade, setGrade] = useState('');

  useEffect(() => {
    const savedLevel = localStorage.getItem('setup_educationLevel');
    if (savedLevel) {
      setLevel(savedLevel);
      const savedName = localStorage.getItem('setup_name');
      const savedGrade = localStorage.getItem('setup_grade');
      if (savedName) setName(savedName);
      if (savedGrade) setGrade(savedGrade);
      else setGrade(savedLevel === 'junior' ? 'm1' : 'm4');
    } else {
      router.push('/setup/education-level');
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('setup_name', name.trim());
    localStorage.setItem('setup_grade', grade || (level === 'junior' ? 'm1' : 'm4'));
    router.push('/setup/grades');
  };

  const gradeOptions = level === 'junior' 
    ? [{ id: 'm1', label: 'ม.1' }, { id: 'm2', label: 'ม.2' }, { id: 'm3', label: 'ม.3' }]
    : [{ id: 'm4', label: 'ม.4' }, { id: 'm5', label: 'ม.5' }, { id: 'm6', label: 'ม.6' }];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Progress Indicator (Step 3 of 4) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ width: '30px', height: '6px', background: 'var(--primary)', borderRadius: '3px' }}></div>
        <div style={{ width: '30px', height: '6px', background: 'var(--primary)', borderRadius: '3px' }}></div>
        <div style={{ width: '30px', height: '6px', background: 'var(--primary)', borderRadius: '3px' }}></div>
        <div style={{ width: '6px', height: '6px', background: 'var(--border)', borderRadius: '3px' }}></div>
      </div>

      {/* Mascot Greeting */}
      <MrPathGreeting message="ยินดีที่ได้รู้จักครับ! รบกวนพิมพ์ชื่อ-นามสกุล และเลือกระดับชั้นเรียนปัจจุบันเพื่อใช้ในการออกบทวิเคราะห์การเรียนครับ" />

      {/* Form Card */}
      <form className="card" onSubmit={handleSubmit} style={{ padding: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '700' }}>
          <UserCheck size={20} style={{ color: 'var(--primary)' }} /> ข้อมูลผู้เรียน
        </h3>

        {/* Name */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            ชื่อ - นามสกุล (หรือชื่อเล่นที่ต้องการให้เรียก)
          </label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="เช่น นายสมชาย ใจดี หรือ น้องสมชาย"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
          />
        </div>

        {/* Grade Level */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            ระดับชั้นเรียนปัจจุบัน ({level === 'junior' ? 'มัธยมศึกษาตอนต้น' : 'มัธยมศึกษาตอนปลาย'})
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {gradeOptions.map(opt => {
              const isSelected = grade === opt.id;
              return (
                <div 
                  key={opt.id}
                  onClick={() => setGrade(opt.id)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '0.85rem',
                    borderRadius: '14px',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--primary-bg)' : '#FFFFFF',
                    color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                    fontWeight: '800',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(124, 92, 252, 0.15)' : 'none'
                  }}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', width: '100%' }}>
          <button
            type="button"
            onClick={() => router.push('/setup/avatar')}
            style={{
              flex: '0 0 auto',
              padding: '0.85rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              borderRadius: '14px',
              border: '1.5px solid var(--border)',
              background: '#FFFFFF',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
          >
            <ArrowLeft size={18} />
            <span>ย้อนกลับ</span>
          </button>

          <button
            type="submit"
            className="btn-primary"
            style={{
              flex: 1,
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(124, 92, 252, 0.2)'
            }}
            disabled={!name.trim()}
          >
            <span>ถัดไป</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>

    </div>
  );
}
