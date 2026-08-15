import Link from 'next/link';
import { MrPath } from '@/components/ui/mr-path';
import { Compass, BarChart2, MessageSquare, Award, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCenter {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulseAurora {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.6; }
          50% { transform: scale(1.12) translate(15px, -15px); opacity: 0.85; }
        }
        @keyframes pulseAurora2 {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.5; }
          50% { transform: scale(1.18) translate(-20px, 15px); opacity: 0.8; }
        }
        @keyframes rotateOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50% { opacity: 0.95; transform: scale(1.25); }
        }
        @keyframes driftParticle {
          0% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { opacity: 0.7; }
          100% { transform: translateY(-80px) translateX(25px); opacity: 0; }
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 92, 252, 0.4) !important;
        }
        .cta-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem',
        background: 'linear-gradient(135deg, #F5F3FF 0%, #ECE7FF 40%, #FAF5FF 75%, #FFFDF5 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient Aurora Orbs */}
        <div style={{
          position: 'absolute',
          top: '3%',
          left: '8%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(124, 92, 252, 0.20) 0%, rgba(124, 92, 252, 0.04) 50%, rgba(124, 92, 252, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'pulseAurora 12s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '5%',
          right: '6%',
          width: '520px',
          height: '520px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, rgba(245, 158, 11, 0.01) 50%, rgba(245, 158, 11, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(45px)',
          animation: 'pulseAurora2 14s ease-in-out infinite 1s',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: '35%',
          right: '12%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(99, 102, 241, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(35px)',
          animation: 'pulseAurora 15s ease-in-out infinite 2s',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '25%',
          left: '10%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.10) 0%, rgba(236, 72, 153, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(35px)',
          animation: 'pulseAurora2 13s ease-in-out infinite 2.5s',
          pointerEvents: 'none',
        }} />

        {/* Decorative Constellation Orbit Rings */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '480px',
          height: '480px',
          border: '1.5px dashed rgba(124, 92, 252, 0.18)',
          borderRadius: '50%',
          animation: 'rotateOrbit 60s linear infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '360px',
          height: '360px',
          border: '1px solid rgba(124, 92, 252, 0.10)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute',
          bottom: '-140px',
          left: '-140px',
          width: '520px',
          height: '520px',
          border: '1.5px dashed rgba(245, 158, 11, 0.08)',
          borderRadius: '50%',
          animation: 'rotateOrbit 75s linear infinite reverse',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-70px',
          left: '-70px',
          width: '380px',
          height: '380px',
          border: '1px solid rgba(245, 158, 11, 0.05)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        {/* Subtle Constellation Lines Overlay (SVG) */}
        <svg style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.4,
        }}>
          {/* Top Left Constellation cluster */}
          <g stroke="rgba(124, 92, 252, 0.22)" strokeWidth="1" fill="none">
            <line x1="8%" y1="18%" x2="16%" y2="12%" />
            <line x1="16%" y1="12%" x2="22%" y2="24%" />
            <line x1="22%" y1="24%" x2="14%" y2="32%" />
            <line x1="14%" y1="32%" x2="8%" y2="18%" />
          </g>
          <circle cx="8%" cy="18%" r="3.5" fill="#7C5CFC" opacity="0.5" />
          <circle cx="16%" cy="12%" r="2.5" fill="#7C5CFC" opacity="0.4" />
          <circle cx="22%" cy="24%" r="4" fill="#9F7AEA" opacity="0.6" />
          <circle cx="14%" cy="32%" r="3" fill="#7C5CFC" opacity="0.45" />

          {/* Bottom Right Constellation cluster */}
          <g stroke="rgba(245, 158, 11, 0.12)" strokeWidth="1" fill="none">
            <line x1="82%" y1="72%" x2="90%" y2="65%" />
            <line x1="90%" y1="65%" x2="94%" y2="78%" />
            <line x1="94%" y1="78%" x2="86%" y2="88%" />
            <line x1="86%" y1="88%" x2="82%" y2="72%" />
          </g>
          <circle cx="82%" cy="72%" r="3" fill="#F59E0B" opacity="0.3" />
          <circle cx="90%" cy="65%" r="2.5" fill="#FBBF24" opacity="0.3" />
          <circle cx="94%" cy="78%" r="3" fill="#F59E0B" opacity="0.3" />
          <circle cx="86%" cy="88%" r="2" fill="#FBBF24" opacity="0.25" />
        </svg>

        {/* Decorative Sparkle Stars */}
        <div style={{ position: 'absolute', top: '14%', left: '18%', animation: 'twinkle 4s ease-in-out infinite', pointerEvents: 'none' }}>
          <Sparkles size={22} style={{ color: 'rgba(124, 92, 252, 0.45)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '20%', left: '14%', animation: 'twinkle 5s ease-in-out infinite 1s', pointerEvents: 'none' }}>
          <Sparkles size={18} style={{ color: 'rgba(236, 72, 153, 0.45)' }} />
        </div>
        <div style={{ position: 'absolute', top: '20%', right: '16%', animation: 'twinkle 4.5s ease-in-out infinite 2s', pointerEvents: 'none' }}>
          <Sparkles size={20} style={{ color: 'rgba(99, 102, 241, 0.45)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', right: '20%', animation: 'twinkle 5.5s ease-in-out infinite 1.5s', pointerEvents: 'none' }}>
          <Sparkles size={20} style={{ color: 'rgba(245, 158, 11, 0.28)' }} />
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '6%', animation: 'twinkle 6s ease-in-out infinite 0.8s', pointerEvents: 'none' }}>
          <Sparkles size={16} style={{ color: 'rgba(124, 92, 252, 0.35)' }} />
        </div>
        <div style={{ position: 'absolute', top: '52%', right: '7%', animation: 'twinkle 6.5s ease-in-out infinite 2.2s', pointerEvents: 'none' }}>
          <Sparkles size={16} style={{ color: 'rgba(245, 158, 11, 0.25)' }} />
        </div>

        {/* ────────────────────────────────────────────────────────
            Main Center Hero Section
            ──────────────────────────────────────────────────────── */}
        <div style={{
          maxWidth: '430px',
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
            background: 'linear-gradient(135deg, var(--primary) 0%, #9F7AEA 100%)',
            color: '#FFFFFF',
            padding: '0.45rem 1.6rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: '800',
            letterSpacing: '3px',
            marginBottom: '0.5rem',
            boxShadow: '0 4px 14px rgba(124, 92, 252, 0.25)',
          }}>
            PATHFINDER
          </div>

          {/* Subtitle */}
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.75rem',
            marginTop: '0.25rem',
            fontWeight: '500',
          }}>
            ค้นหาเส้นทางสู่อนาคตของคุณ
          </p>

          {/* Mascot Image with soft ambient ring */}
          <div style={{ position: 'relative', marginBottom: '1.25rem', animation: 'floatCenter 3.5s ease-in-out infinite' }}>
            <div style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124, 92, 252, 0.25) 0%, rgba(124, 92, 252, 0) 70%)',
              filter: 'blur(10px)',
            }} />
            <MrPath size={120} showBg={true} />
            {/* AI Badge */}
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              right: '-6px',
              background: 'linear-gradient(135deg, var(--primary), #9F7AEA)',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: '800',
              padding: '0.2rem 0.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(124, 92, 252, 0.35)',
            }}>
              AI
            </div>
          </div>

          {/* Speech Bubble Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '24px',
            padding: '1.35rem 1.6rem',
            boxShadow: '0 8px 30px rgba(124, 92, 252, 0.1), 0 2px 6px rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
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
              borderBottom: '8px solid rgba(255, 255, 255, 0.94)',
            }} />
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '700', fontSize: '0.98rem', color: 'var(--text-primary)' }}>
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
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
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
                padding: '0.95rem',
                borderRadius: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, var(--primary) 0%, #9333EA 100%)',
                boxShadow: '0 6px 20px rgba(124, 92, 252, 0.35)',
              }}
            >
              เริ่มต้นเลย <ArrowRight size={18} />
            </button>
          </Link>

          {/* Footer */}
          <p style={{
            marginTop: '1rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            fontWeight: '500',
          }}>
            สำหรับนักเรียนมัธยมต้นและมัธยมปลาย • ฟรี 100%
          </p>
        </div>
      </div>
    </>
  );
}
