import Link from 'next/link';
import { MrPath } from '@/components/ui/mr-path';
import { Compass, BarChart2, MessageSquare, Award, ArrowRight, Target, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

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
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 0.95; }
        }
        @keyframes floatCard1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes floatCard2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(-1deg); }
        }
        @keyframes floatCard3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-1.5deg); }
        }
        @keyframes floatCard4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        @keyframes rotateOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sparkleTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 0.9; transform: scale(1.15); }
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 92, 252, 0.4) !important;
        }
        .cta-btn:active {
          transform: translateY(0);
        }
        .floating-badge {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.15rem;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 18px;
          box-shadow: 0 8px 28px rgba(124, 92, 252, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02);
          position: absolute;
          z-index: 5;
          pointer-events: none;
          transition: all 0.3s ease;
        }
        @media (max-width: 1080px) {
          .floating-badge {
            display: none !important;
          }
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
        background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 45%, #FAF5FF 70%, #FEF3C7 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient Aurora Orbs */}
        <div style={{
          position: 'absolute',
          top: '5%',
          left: '12%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(124, 92, 252, 0.18) 0%, rgba(124, 92, 252, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          animation: 'pulseGlow 8s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '8%',
          right: '10%',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, rgba(245, 158, 11, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(35px)',
          animation: 'pulseGlow 10s ease-in-out infinite 1s',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: '40%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(25px)',
          animation: 'pulseGlow 9s ease-in-out infinite 2s',
          pointerEvents: 'none',
        }} />

        {/* Decorative Constellation Orbit Rings */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '340px',
          height: '340px',
          border: '1.5px dashed rgba(124, 92, 252, 0.2)',
          borderRadius: '50%',
          animation: 'rotateOrbit 45s linear infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          border: '1.5px dashed rgba(245, 158, 11, 0.2)',
          borderRadius: '50%',
          animation: 'rotateOrbit 60s linear infinite reverse',
          pointerEvents: 'none',
        }} />

        {/* Decorative Sparkle Stars */}
        <div style={{ position: 'absolute', top: '15%', left: '22%', animation: 'sparkleTwinkle 4s ease-in-out infinite', pointerEvents: 'none' }}>
          <Sparkles size={20} style={{ color: 'rgba(124, 92, 252, 0.45)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '22%', left: '18%', animation: 'sparkleTwinkle 5s ease-in-out infinite 1s', pointerEvents: 'none' }}>
          <Sparkles size={16} style={{ color: 'rgba(245, 158, 11, 0.5)' }} />
        </div>
        <div style={{ position: 'absolute', top: '22%', right: '20%', animation: 'sparkleTwinkle 4.5s ease-in-out infinite 2s', pointerEvents: 'none' }}>
          <Sparkles size={18} style={{ color: 'rgba(99, 102, 241, 0.45)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '16%', right: '24%', animation: 'sparkleTwinkle 5.5s ease-in-out infinite 1.5s', pointerEvents: 'none' }}>
          <Sparkles size={22} style={{ color: 'rgba(124, 92, 252, 0.4)' }} />
        </div>

        {/* ────────────────────────────────────────────────────────
            Floating Feature Badges (Decorating Surrounding Space)
            ──────────────────────────────────────────────────────── */}
        
        {/* Top-Left Badge: 25+ Career Paths */}
        <div className="floating-badge" style={{
          top: '18%',
          left: 'max(4%, calc(50% - 560px))',
          animation: 'floatCard1 6s ease-in-out infinite',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7C5CFC, #9F7AEA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(124, 92, 252, 0.25)',
          }}>
            <Target size={22} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1E293B' }}>
              25+ สายการเรียน
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
              ครอบคลุมทุกสาขายอดนิยม
            </div>
          </div>
        </div>

        {/* Top-Right Badge: TCAS Portfolio Readiness */}
        <div className="floating-badge" style={{
          top: '20%',
          right: 'max(4%, calc(50% - 560px))',
          animation: 'floatCard2 7s ease-in-out infinite 0.5s',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1E293B' }}>
              TCAS รอบ 1 Ready
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
              วิเคราะห์พอร์ตและ Gap ชัดเจน
            </div>
          </div>
        </div>

        {/* Bottom-Left Badge: 5D Skill Radar */}
        <div className="floating-badge" style={{
          bottom: '22%',
          left: 'max(4%, calc(50% - 570px))',
          animation: 'floatCard3 6.5s ease-in-out infinite 1s',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
          }}>
            <BarChart2 size={22} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1E293B' }}>
              My Skill Matrix
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
              วิเคราะห์ลึก 5 มิติสมรรถนะ
            </div>
          </div>
        </div>

        {/* Bottom-Right Badge: AI Mentor 24/7 */}
        <div className="floating-badge" style={{
          bottom: '24%',
          right: 'max(4%, calc(50% - 570px))',
          animation: 'floatCard4 7.5s ease-in-out infinite 1.5s',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
          }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1E293B' }}>
              Mr. Path AI Coach
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
              ปรึกษาแนวทางการเรียน 24 ชม.
            </div>
          </div>
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
              inset: '-8px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124, 92, 252, 0.2) 0%, rgba(124, 92, 252, 0) 70%)',
              filter: 'blur(8px)',
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
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '24px',
            padding: '1.35rem 1.6rem',
            boxShadow: '0 8px 30px rgba(124, 92, 252, 0.1), 0 2px 6px rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
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
              borderBottom: '8px solid rgba(255, 255, 255, 0.92)',
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
