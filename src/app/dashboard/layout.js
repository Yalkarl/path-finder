'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/firestore';
import Sidebar from '@/components/layout/Sidebar';
import { MrPath } from '@/components/ui/mr-path';
import { signOut } from '@/lib/firebaseAuth';
import { Home, ClipboardCheck, MessageSquare, User, LogOut, Sliders, BarChart2, Flame, Trophy } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (user) {
      getUserProfile(user.uid).then(p => {
        if (!p || !p.completedSetup) {
          router.push('/setup');
        } else {
          setProfile(p);
        }
      });
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading || !user || !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--primary-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <MrPath size={60} animate={true} showBg={false} />
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const isChat = pathname.startsWith('/dashboard/chat');
  const isAssessmentQuiz = pathname.startsWith('/dashboard/assessment');
  const isProfile = pathname.startsWith('/dashboard/profile');
  const isDashboardMain = !isChat && !isAssessmentQuiz && !isProfile;

  const tabs = [
    { href: '/dashboard', label: 'My Skill Matrix', icon: <BarChart2 size={16} />, activeColor: '#7C5CFC' },
    { href: '/dashboard/streak', label: 'Daily Streak', icon: <Flame size={16} />, activeColor: '#FF6B8B' },
    { href: '/dashboard/achievements', label: 'Achievements', icon: <Trophy size={16} />, activeColor: '#FFB347' },
  ];

  const navItems = [
    { href: '/dashboard', label: 'หน้าหลัก', icon: <Home size={20} /> },
    { href: '/dashboard/assessment', label: 'แบบทดสอบ', icon: <ClipboardCheck size={20} /> },
    { href: '/dashboard/chat', label: 'Mr. Path', icon: <MessageSquare size={20} /> },
    { href: '/dashboard/profile', label: 'โปรไฟล์', icon: <User size={20} /> },
  ];

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/dashboard/streak' || pathname === '/dashboard/achievements';
    return pathname.startsWith(href);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F2F0FF 0%, #E8E4FF 50%, rgba(255, 234, 167, 0.15) 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Floating background decorative objects - Hidden on chat page for clean look */}
      {!isChat && (
        <>
          <div className="bg-deco-object animate-float-1" style={{ top: '10%', left: '8%', fontSize: '2.5rem', opacity: 0.25 }}>⭐</div>
          <div className="bg-deco-object animate-float-2" style={{ top: '22%', right: '10%', fontSize: '2.2rem', opacity: 0.2 }}>🔮</div>
          <div className="bg-deco-object animate-float-3" style={{ bottom: '25%', left: '10%', fontSize: '2rem', opacity: 0.2 }}>✨</div>
          <div className="bg-deco-object animate-float-4" style={{ bottom: '15%', right: '8%', fontSize: '2.2rem', opacity: 0.15 }}>🎓</div>
        </>
      )}

      {/* Sidebar Backdrop Overlay on Mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="sidebar-backdrop"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 1040,
            display: 'none', // Managed in globals.css
          }}
        />
      )}

      <Sidebar profile={profile} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

      {/* Main Content */}
      <main className={`main-content ${isChat ? 'is-chat' : ''}`} style={{ flex: 1, padding: isChat ? '0' : '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        
        {/* Mobile Hamburger Toggle Header */}
        <div 
          className="mobile-header"
          style={{
            display: 'none', // Managed in globals.css
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 990,
            width: '100%',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ☰
          </button>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MrPath size={28} />
            <span>PathFinder</span>
          </div>
          {/* Sizing placeholder to center the logo */}
          <div style={{ width: '32px' }} />
        </div>

        {/* Top-Right Profile Dropdown Tab */}
        <div className="desktop-profile-dropdown" style={{
          position: 'absolute',
          top: isChat ? '0.75rem' : '1.5rem',
          right: isChat ? '1rem' : '1.5rem',
          zIndex: 1000,
        }}>
          {/* Toggle Button */}
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: 'var(--surface-glass)',
              backdropFilter: 'blur(8px)',
              padding: '0.45rem 0.9rem',
              borderRadius: '12px',
              border: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              userSelect: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-light)'}
            onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <span>{profile?.name || 'ผู้ใช้'}</span>
            <span style={{ 
              fontSize: '0.65rem', 
              transition: 'transform 0.2s', 
              transform: dropdownOpen ? 'rotate(180deg)' : 'none',
              display: 'inline-block'
            }}>
              ▼
            </span>
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div 
                onClick={() => setDropdownOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  zIndex: 999,
                  background: 'transparent',
                }}
              />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                background: '#2D3748', 
                borderRadius: '12px',
                width: '180px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                zIndex: 1000,
                overflow: 'hidden',
                borderTop: '3px solid var(--primary)',
                animation: 'fadeIn 0.2s ease-out',
              }}>
                <div style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  {profile?.name || 'ผู้ใช้'}
                </div>
                
                <Link 
                  href="/dashboard/profile" 
                  onClick={() => setDropdownOpen(false)}
                  style={{ textDecoration: 'none' }}
                >
                  <div 
                    style={{
                      padding: '0.75rem 1rem',
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={14} /> ข้อมูลส่วนตัว
                  </div>
                </Link>

                <div 
                  onClick={() => { setDropdownOpen(false); handleLogout(); }}
                  style={{
                    padding: '0.75rem 1rem',
                    color: '#FC8181', 
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={14} /> ออกจากระบบ
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tab navigation for dashboard main pages */}
        {isDashboardMain && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%', padding: '0 0.5rem' }} className="responsive-tabs">
            {tabs.map(tab => {
              const isActive = pathname === tab.href;
              return (
                <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '20px',
                    background: isActive ? tab.activeColor : 'var(--surface)',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    boxShadow: isActive ? `0 4px 12px ${tab.activeColor}40` : 'none',
                    border: isActive ? `1.5px solid ${tab.activeColor}` : '1.5px solid var(--border)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      color: isActive ? 'white' : tab.activeColor,
                      opacity: isActive ? 1 : 0.85
                    }}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div style={{ 
          maxWidth: isChat ? '100%' : '900px', 
          margin: isChat ? '0' : '0 auto', 
          width: '100%',
          flex: isChat ? 1 : 'unset',
          display: isChat ? 'flex' : 'block',
          flexDirection: isChat ? 'column' : 'unset',
          padding: isChat ? '1.5rem' : '0',
        }}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div 
        className="mobile-bottom-nav" 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border)',
          display: 'none', // Managed responsively by globals.css
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1001,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
          paddingBottom: 'safe-area-inset-bottom'
        }}
      >
        {navItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              style={{ 
                textDecoration: 'none', 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '3px',
                height: '100%',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ 
                fontSize: '1.25rem', 
                transform: active ? 'scale(1.15) translateY(-2px)' : 'scale(1)',
                transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                {item.icon}
              </span>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: active ? '700' : '600',
                opacity: active ? 1 : 0.8
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
