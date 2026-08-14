'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MrPath } from '@/components/ui/mr-path';
import { Home, Target, ClipboardCheck, MessageSquare, User, LogOut } from 'lucide-react';
import { KahootCharacterSvg } from '@/components/ui/KahootVectorCharacters';

import { checkAssessmentQuota } from '@/lib/algorithms/dailyAttempts';

export default function Sidebar({ profile, isOpen, onClose, onLogout }) {
  const pathname = usePathname();

  const [localAvatar, setLocalAvatar] = useState({
    characterId: typeof window !== 'undefined' ? localStorage.getItem('setup_characterId') : null,
    accessoryId: typeof window !== 'undefined' ? localStorage.getItem('setup_accessoryId') : null
  });

  useEffect(() => {
    const syncAvatar = () => {
      if (typeof window !== 'undefined') {
        setLocalAvatar({
          characterId: localStorage.getItem('setup_characterId'),
          accessoryId: localStorage.getItem('setup_accessoryId')
        });
      }
    };
    syncAvatar();
    window.addEventListener('profile_updated', syncAvatar);
    window.addEventListener('storage', syncAvatar);
    return () => {
      window.removeEventListener('profile_updated', syncAvatar);
      window.removeEventListener('storage', syncAvatar);
    };
  }, []);

  const activeCharId = localAvatar.characterId || profile?.characterId || 'penguin';
  const activeAccId = localAvatar.accessoryId || profile?.accessoryId || 'none';

  const isTargetLock = profile?.analysisMode === 'target-lock';

  const navItems = [
    { href: '/dashboard', label: isTargetLock ? 'ประเมินความพร้อม' : 'หน้าหลัก', icon: isTargetLock ? <Target size={18} /> : <Home size={18} /> },
    { href: '/dashboard/assessment', label: 'แบบทดสอบทักษะ', icon: <ClipboardCheck size={18} /> },
    { href: '/dashboard/chat', label: 'โค้ช Mr. Path', icon: <MessageSquare size={18} /> },
    { href: '/dashboard/profile', label: 'ข้อมูลส่วนตัว', icon: <User size={18} /> },
  ];

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/dashboard/streak' || pathname === '/dashboard/achievements';
    return pathname.startsWith(href);
  };

  return (
    <aside className={`glass sidebar-drawer ${isOpen ? 'open' : ''}`} style={{
      width: '260px',
      minWidth: '260px',
      borderRight: '1px solid rgba(255,255,255,0.8)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      minHeight: '100vh',
      height: 'auto',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MrPath size={40} />
          <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>PathFinder</h2>
        </div>
        <button 
          onClick={onClose}
          className="mobile-close-btn"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'none', // ควบคุมสไตล์ผ่าน globals.css
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
          }}
        >
          ✕
        </button>
      </div>

      {/* User Welcome */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1.25rem 1rem', 
        background: 'linear-gradient(135deg, var(--primary-bg), rgba(124,92,252,0.08))', 
        borderRadius: '16px',
        border: '1px solid rgba(124,92,252,0.12)',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(124,92,252,0.04)',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '2.5px solid var(--primary)',
          margin: '0 auto 0.75rem auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(124, 92, 252, 0.18)'
        }}>
          <KahootCharacterSvg 
            type={activeCharId} 
            accessory={activeAccId} 
            size={48} 
          />
        </div>
        <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>ยินดีต้อนรับกลับมา</p>
        <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word' }}>{profile?.name || 'ผู้ใช้'}</p>
      </div>

      {/* Navigation */}
      {(() => {
        const quota = checkAssessmentQuota(profile);

        return (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              const isAssessment = item.href === '/dashboard/assessment';

              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: '10px',
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? 'white' : 'var(--text-secondary)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{item.label}</span>

                    {/* Quota Badge on Assessment Menu */}
                    {isAssessment && (
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '12px',
                        background: active ? 'rgba(255,255,255,0.25)' : quota.canTake ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                        color: active ? '#FFFFFF' : quota.canTake ? '#D97706' : '#16A34A',
                        border: active ? '1px solid rgba(255,255,255,0.4)' : quota.canTake ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        gap: '0.25rem'
                      }}>
                        {quota.canTake ? `${quota.count}/2` : 'ครบแล้ว'}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        );
      })()}

      {/* Logout Button */}
      {onLogout && (
        <div className="desktop-hide-logout" style={{ paddingTop: '0.75rem' }}>
          <button
            onClick={() => { onClose(); onLogout(); }}
            style={{
              width: '100%',
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid rgba(252, 129, 129, 0.3)',
              background: 'rgba(252, 129, 129, 0.08)',
              color: '#E53E3E',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '1rem', 
        borderTop: '1px solid var(--border)', 
        fontSize: '0.75rem', 
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        PathFinder v1.0
      </div>
    </aside>
  );
}
