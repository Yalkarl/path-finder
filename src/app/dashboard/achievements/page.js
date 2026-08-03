'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import { ACHIEVEMENTS, checkAchievements } from '@/lib/constants/achievements';
import { useRouter } from 'next/navigation';
import { 
  Compass, 
  Brain, 
  FlaskConical, 
  PenTool, 
  Palette, 
  Crown, 
  Flame, 
  Gem, 
  ClipboardList, 
  MessageSquare, 
  Flag, 
  Trophy, 
  X,
  Lock
} from 'lucide-react';

const AC_ICONS = {
  explorer: Compass,
  logic_genius: Brain,
  scientist: FlaskConical,
  linguist: PenTool,
  artist: Palette,
  leader: Crown,
  streak_7: Flame,
  streak_30: Gem,
  planner: ClipboardList,
  chatty: MessageSquare,
  stages_6: Flag,
  stages_12: Trophy,
};

const AC_COLORS = {
  explorer: '#7C5CFC',
  logic_genius: '#3B82F6',
  scientist: '#10B981',
  linguist: '#F59E0B',
  artist: '#EC4899',
  leader: '#8B5CF6',
  streak_7: '#EF4444',
  streak_30: '#06B6D4',
  planner: '#6366F1',
  chatty: '#14B8A6',
  stages_6: '#F97316',
  stages_12: '#EAB308',
};

export default function AchievementsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(async (profile) => {
        if (profile) {
          const unlocked = checkAchievements(profile);
          setUnlockedIds(unlocked);

          // อัปเดตโปรไฟล์เมื่อปลดล็อกความสำเร็จใหม่
          const currentSaved = profile.achievements || [];
          const newUnlocks = unlocked.filter(id => !currentSaved.includes(id));
          
          if (newUnlocks.length > 0) {
            await updateUserProfile(user.uid, {
              achievements: [...currentSaved, ...newUnlocks]
            });
          }
        }
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div style={{ position: 'relative', paddingTop: '1rem' }}>
      <button 
        onClick={() => router.push('/dashboard')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          marginBottom: '1.5rem',
          fontFamily: 'inherit'
        }}
      >
        ← ย้อนกลับไปยังแดชบอร์ด
      </button>
      <h2 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: '2rem' }}>เหรียญรางวัลแห่งความสำเร็จ</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {ACHIEVEMENTS.map(achievement => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          const IconComponent = AC_ICONS[achievement.id] || Trophy;
          const themeColor = AC_COLORS[achievement.id] || 'var(--primary)';
          
          return (
            <div 
              key={achievement.id}
              className="card"
              onClick={() => setSelectedBadge(achievement)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                opacity: isUnlocked ? 1 : 0.85,
                border: isUnlocked ? `2px solid ${themeColor}` : `1.5px dashed ${themeColor}40`,
                background: '#FFFFFF',
                transition: 'transform 0.2s, box-shadow 0.2s',
                padding: '1.5rem 1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: isUnlocked ? `${themeColor}15` : `${themeColor}05`,
                  border: isUnlocked ? `2px solid ${themeColor}` : `1px dashed ${themeColor}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: themeColor,
                  transition: 'all 0.2s'
                }}>
                  <IconComponent size={28} style={{ opacity: isUnlocked ? 1 : 0.4 }} />
                </div>
                {!isUnlocked && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    background: '#64748B',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                  }}>
                    <Lock size={10} />
                  </div>
                )}
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '700' }}>
                {achievement.name}
              </h4>
              {isUnlocked ? (
                <div style={{ fontSize: '0.75rem', color: themeColor, fontWeight: 'bold' }}>
                  ปลดล็อคแล้ว
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 'normal' }}>
                  ยังไม่ปลดล็อค
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for details */}
      {selectedBadge && (() => {
        const isUnlocked = unlockedIds.includes(selectedBadge.id);
        const IconComponent = AC_ICONS[selectedBadge.id] || Trophy;
        const themeColor = AC_COLORS[selectedBadge.id] || 'var(--primary)';
        
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => setSelectedBadge(null)}>
            <div 
              className="card" 
              style={{ width: '90%', maxWidth: '400px', textAlign: 'center', position: 'relative', padding: '2rem 1.5rem', background: '#FFFFFF', borderRadius: '24px' }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94A3B8', padding: '4px', borderRadius: '50%', transition: 'all 0.2s' }}
                onClick={() => setSelectedBadge(null)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <X size={18} />
              </button>
              
              <div style={{ position: 'relative', width: '100px', height: '100px', margin: '1.5rem auto 1.5rem' }}>
                <div style={{ 
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: isUnlocked ? `${themeColor}15` : `${themeColor}05`,
                  border: isUnlocked ? `2px solid ${themeColor}` : `2px dashed ${themeColor}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: themeColor
                }}>
                  <IconComponent size={44} style={{ opacity: isUnlocked ? 1 : 0.4 }} />
                </div>
                {!isUnlocked && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    background: '#64748B',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <Lock size={14} />
                  </div>
                )}
              </div>
              
              <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '800' }}>{selectedBadge.name}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>{selectedBadge.criteria}</p>
              
              <div style={{ padding: '1rem', background: isUnlocked ? `${themeColor}10` : '#F8FAFC', color: isUnlocked ? themeColor : '#64748B', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.95rem' }}>
                สถานะ: <span>
                  {isUnlocked ? 'ปลดล็อคแล้ว' : 'ยังไม่ปลดล็อค'}
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
