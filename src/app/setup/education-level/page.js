'use client';
import { useState, useEffect } from 'react';
import MrPathGreeting from '@/components/setup/MrPathGreeting';
import { useRouter } from 'next/navigation';
import { School, GraduationCap } from 'lucide-react';

export default function EducationLevelStep() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const savedLevel = localStorage.getItem('setup_educationLevel');
    if (savedLevel) {
      setSelected(savedLevel);
    }
  }, []);

  const handleSelect = (level) => {
    setSelected(level);
    localStorage.setItem('setup_educationLevel', level);
    // Brief delay to show selected state before navigating
    setTimeout(() => {
      router.push('/setup/profile');
    }, 350);
  };

  const cards = [
    {
      level: 'junior',
      icon: <School size={32} color="#FFFFFF" />,
      title: 'มัธยมศึกษาตอนต้น',
      subtitle: 'ม.1 — ม.3',
      iconBg: '#7C5CFC',
      arrowColor: '#7C5CFC',
      tags: [
        { text: 'วางแผนการเรียน', bg: '#EEF2FF', color: '#6366F1' },
        { text: 'ค้นพบความถนัด', bg: '#EEF2FF', color: '#6366F1' }
      ],
    },
    {
      level: 'senior',
      icon: <GraduationCap size={32} color="#FFFFFF" />,
      title: 'มัธยมศึกษาตอนปลาย',
      subtitle: 'ม.4 — ม.6',
      iconBg: 'linear-gradient(135deg, #FFB347 0%, #FF7B7B 100%)',
      arrowColor: '#FF7B7B',
      tags: [
        { text: 'เลือกสายการเรียน', bg: '#FFF5F5', color: '#EF4444' },
        { text: 'วางแผนมหาวิทยาลัย', bg: '#FFF5F5', color: '#EF4444' }
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Progress Indicator (Top) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ width: '30px', height: '6px', background: 'var(--primary)', borderRadius: '3px' }}></div>
        <div style={{ width: '6px', height: '6px', background: 'var(--border)', borderRadius: '3px' }}></div>
        <div style={{ width: '6px', height: '6px', background: 'var(--border)', borderRadius: '3px' }}></div>
      </div>

      {/* Mascot Greeting */}
      <MrPathGreeting message="ยินดีต้อนรับครับ! ก่อนเริ่ม ขอถามหน่อยนะครับ — ตอนนี้น้องกำลังเรียนอยู่ระดับไหนครับ?" />

      {/* Choice Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {cards.map((card) => {
          const isSelected = selected === card.level;
          return (
            <div
              key={card.level}
              onClick={() => handleSelect(card.level)}
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected
                  ? '0 12px 30px rgba(124, 92, 252, 0.15)'
                  : '0 4px 16px rgba(0, 0, 0, 0.04)',
                border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 92, 252, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
                {/* Left Colored Box */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: card.iconBg,
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  {card.icon}
                </div>

                {/* Middle Text Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 0.25rem 0', 
                    color: '#1E293B', 
                    fontSize: '1.1rem', 
                    fontWeight: '800' 
                  }}>
                    {card.title}
                  </h3>
                  <p style={{ 
                    margin: '0 0 0.65rem 0', 
                    fontSize: '0.85rem', 
                    color: '#64748B', 
                    fontWeight: '600' 
                  }}>
                    {card.subtitle}
                  </p>
                  
                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {card.tags.map((tag) => (
                      <span 
                        key={tag.text} 
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          background: tag.bg,
                          color: tag.color,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                        }}
                      >
                        {tag.text}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Arrow */}
                <div style={{ 
                  color: card.arrowColor, 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  marginRight: '0.5rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  →
                </div>
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
}
