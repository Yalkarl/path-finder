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
    <div className="card" style={{ padding: '2rem', position: 'relative' }}>
      <button 
        onClick={() => router.push('/dashboard')}
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontFamily: 'inherit'
        }}
      >
        ← ย้อนกลับ
      </button>
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <h2 style={{ color: 'var(--text-secondary)', marginTop: 0 }}>ความต่อเนื่องของคุณ</h2>
      
      <div style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '5rem', animation: 'pulse 2s infinite' }}>🔥</div>
        <h1 style={{ fontSize: '4rem', color: 'var(--accent)', margin: '0' }}>{streakData.current}</h1>
        <p style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>วันติดต่อกัน!</p>
      </div>

      <div style={{ background: 'var(--primary-bg)', padding: '1.5rem', borderRadius: '16px', marginTop: '2rem' }}>
        <p style={{ fontWeight: '600', marginBottom: '1rem' }}>สถิติสัปดาห์นี้</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
          {days.map((day, idx) => {
            const isPast = idx < todayIndex;
            const isToday = idx === todayIndex;
            const isLogged = isPast || (isToday && streakData.current > 0);
            // คำนวณจำลองสถานะวันย้อนหลังตามความต่อเนื่อง
            const loggedIn = isLogged && (streakData.current >= (todayIndex - idx + 1));

            return (
              <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '50%', 
                  background: loggedIn ? 'var(--success)' : 'var(--surface)',
                  border: loggedIn ? 'none' : '2px solid var(--border)',
                  color: loggedIn ? 'white' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold',
                  boxShadow: isToday ? '0 0 0 4px rgba(76, 175, 80, 0.2)' : 'none'
                }}>
                  {loggedIn ? '✓' : ''}
                </div>
                <span style={{ fontSize: '0.75rem', color: isToday ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: isToday ? 'bold' : 'normal' }}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2rem' }}>
        "ความสม่ำเสมอคือกุญแจสู่ความสำเร็จ! เข้ามาเช็คแผนพัฒนาตัวเองกับ Mr. Path ทุกวันเพื่อผลลัพธ์ที่ดีที่สุดนะ" - Mr. Path
      </p>
      </div>
    </div>
  );
}
