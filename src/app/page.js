import Link from 'next/link';
import { MrPath } from '@/components/ui/mr-path';
import { Compass, BarChart2, MessageSquare, Award, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .cta-btn:hover {
          transform: scale(1.02);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, #F2F0FF 0%, #E8E4FF 50%, rgba(255, 234, 167, 0.15) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Floating background decorative objects - Premium clean gradients */}
        <div style={{ position: 'absolute', top: '10%', left: '8%', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(124,92,252,0.1) 0%, rgba(124,92,252,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '25%', left: '10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(255,179,71,0.08) 0%, rgba(255,179,71,0) 70%)', pointerEvents: 'none' }} />

        <div style={{
          maxWidth: '420px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeIn 0.6s ease-out',
          position: 'relative',
          zIndex: 10,
        }}>
          {/* PATHFINDER Badge */}
          <div style={{
            background: 'var(--primary)',
            color: '#FFFFFF',
            padding: '0.4rem 1.5rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: '700',
            letterSpacing: '3px',
            marginBottom: '0.5rem',
          }}>
            PATHFINDER
          </div>

          {/* Subtitle */}
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.75rem',
            marginTop: '0.25rem',
          }}>
            ค้นหาเส้นทางสู่อนาคตของคุณ
          </p>

          {/* Mascot Image */}
          <div style={{ position: 'relative', marginBottom: '1.25rem', animation: 'float 3s ease-in-out infinite' }}>
            <MrPath size={120} showBg={true} />
            {/* AI Badge */}
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              right: '-6px',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: '800',
              padding: '0.2rem 0.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(124, 92, 252, 0.3)',
              animation: 'pulse 2s ease-in-out infinite',
            }}>
              AI
            </div>
          </div>

          {/* Speech Bubble Card */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: '20px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 4px 20px rgba(124, 92, 252, 0.08)',
            width: '100%',
            marginBottom: '1.25rem',
            position: 'relative',
            animation: 'fadeIn 0.8s ease-out',
          }}>
            {/* Speech bubble triangle */}
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid var(--surface)',
            }} />
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              สวัสดีครับ! ผม <strong>Mr. Path</strong> ครับ
            </p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              ผมจะช่วยค้นหาเส้นทางการเรียนที่เหมาะกับคุณที่สุด ผ่านการวิเคราะห์ทักษะและความสนใจของคุณ!
            </p>
          </div>

          {/* Feature Chips */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            animation: 'fadeIn 1s ease-out',
          }}>
            {[
              { label: 'วิเคราะห์ทักษะ', icon: <Compass size={14} />, bg: '#F0EBFF', color: 'var(--primary)' },
              { label: 'Radar Chart', icon: <BarChart2 size={14} />, bg: '#E8F5E9', color: 'var(--success)' },
              { label: 'AI Mentor', icon: <MessageSquare size={14} />, bg: '#FFF3E0', color: '#F57C00' },
              { label: 'แผนอนาคต', icon: <Award size={14} />, bg: '#E3F2FD', color: '#1976D2' },
            ].map((chip) => (
              <span key={chip.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: chip.bg,
                color: chip.color,
                whiteSpace: 'nowrap',
              }}>
                {chip.icon}
                {chip.label}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <Link href="/login" style={{ textDecoration: 'none', width: '100%' }}>
            <button
              className="btn-primary cta-btn"
              style={{
                width: '100%',
                fontSize: '1.1rem',
                padding: '0.9rem',
                borderRadius: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              เริ่มต้นเลย <ArrowRight size={18} />
            </button>
          </Link>

          {/* Footer */}
          <p style={{
            marginTop: '1rem',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}>
            สำหรับนักเรียนมัธยมต้นและมัธยมปลาย • ฟรี 100%
          </p>
        </div>
      </div>
    </>
  );
}
