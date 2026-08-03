'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MrPath } from '@/components/ui/mr-path';
import { Home, Target, ClipboardCheck, MessageSquare, User, LogOut } from 'lucide-react';

export default function Sidebar({ profile, isOpen, onClose, onLogout }) {
  const pathname = usePathname();

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
        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>ยินดีต้อนรับกลับมา</p>
        <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word' }}>{profile?.name || 'ผู้ใช้'}</p>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: isActive(item.href) ? 'var(--primary)' : 'transparent',
              color: isActive(item.href) ? 'white' : 'var(--text-secondary)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s',
              fontSize: '0.9rem',
            }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

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
