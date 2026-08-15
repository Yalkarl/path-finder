'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import { useRouter } from 'next/navigation';

export default function StreakPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [streakData, setStreakData] = useState({ current: 0, lastLogin: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(async (profile) => {
        if (profile) {
          // ระบบคำนวณความต่อเนื่องการเข้าใช้งาน (Streak)
          const today = new Date().toISOString().split('T')[0];
          let currentStreak = profile.streak?.current || 0;
          let lastLogin = profile.streak?.lastLogin || null;

          if (lastLogin !== today) {
            if (lastLogin) {
              const lastDate = new Date(lastLogin);
              const currentDate = new Date(today);
              const diffTime = Math.abs(currentDate - lastDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
              
              if (diffDays === 1) {
                currentStreak += 1;
              } else {
                currentStreak = 1; // รีเซ็ตจำนวนวันเมื่อไม่ได้เข้าใช้งานเกิน 1 วัน
              }
            } else {
              currentStreak = 1; // การเข้าใช้งานวันแรกสุด
            }
            lastLogin = today;

            // บันทึกจำนวนวันความต่อเนื่องใหม่
            await updateUserProfile(user.uid, {
              streak: { current: currentStreak, lastLogin }
            });
          }

          setStreakData({ current: currentStreak, lastLogin });
        }
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>กำลังโหลดข้อมูล...</div>;

  const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสฯ', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0 is Monday, 6 is Sunday

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%', animation: 'fadeIn 0.3s ease-out' }}>
      <button 
        onClick={() => router.push('/dashboard')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '0.9rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          marginBottom: '0.85rem',
          padding: '0.25rem 0',
          fontFamily: 'inherit',
          transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        ← ย้อนกลับ
      </button>

      <div className="card" style={{ padding: '2.5rem 2.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '700' }}>
          ความต่อเนื่องของคุณ
        </h2>
        
        <div style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '5rem', animation: 'pulse 2s infinite', lineHeight: 1.1 }}>🔥</div>
          <h1 style={{ fontSize: '4.25rem', color: 'var(--accent)', margin: '0.3rem 0 0 0', lineHeight: 1, fontWeight: '800' }}>{streakData.current}</h1>
          <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0.5rem 0 0 0' }}>วันติดต่อกัน!</p>
        </div>

        <div style={{ background: 'var(--primary-bg)', padding: '1.75rem 2rem', borderRadius: '16px', marginTop: '1.75rem' }}>
          <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: 0, marginBottom: '1.25rem' }}>สถิติสัปดาห์นี้</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            {days.map((day, idx) => {
              const isToday = idx === todayIndex;
              const isPast = idx < todayIndex;
              // คำนวณวันที่มีการเข้าใช้งานย้อนหลังอย่างแม่นยำตามจำนวนวัน Streak
              let loggedIn = false;
              if (isToday) {
                loggedIn = streakData.current > 0;
              } else if (isPast) {
                const daysAgo = todayIndex - idx;
                loggedIn = daysAgo < streakData.current;
              }

              return (
                <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem', flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    width: 'clamp(34px, 6.5vw, 48px)', 
                    height: 'clamp(34px, 6.5vw, 48px)', 
                    borderRadius: '50%', 
                    background: loggedIn ? 'var(--success)' : 'var(--surface)',
                    border: loggedIn ? 'none' : '2px solid var(--border)',
                    color: loggedIn ? 'white' : 'var(--text-secondary)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)',
                    boxShadow: isToday ? '0 0 0 3px rgba(76, 175, 80, 0.25)' : loggedIn ? '0 2px 8px rgba(76, 175, 80, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}>
                    {loggedIn ? '✓' : ''}
                  </div>
                  <span style={{ 
                    fontSize: 'clamp(0.68rem, 2vw, 0.82rem)', 
                    color: isToday ? 'var(--primary)' : 'var(--text-secondary)', 
                    fontWeight: isToday ? '800' : '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginTop: '1.75rem', marginBottom: 0 }}>
          "ความสม่ำเสมอคือกุญแจสู่ความสำเร็จ! เข้ามาเช็คแผนพัฒนาตัวเองกับ Mr. Path ทุกวันเพื่อผลลัพธ์ที่ดีที่สุดนะ" - Mr. Path
        </p>
      </div>
    </div>
  );
}
