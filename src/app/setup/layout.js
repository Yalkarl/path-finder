'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { ensureCleanSetupForUid } from '@/lib/utils/setupStorage';

export default function SetupLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      ensureCleanSetupForUid(user.uid);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>กำลังโหลด...</div>;
  }

  const isGradesPage = pathname === '/setup/grades';
  const containerMaxWidth = isGradesPage ? '1200px' : '500px';

  return (
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
      <div style={{ maxWidth: containerMaxWidth, width: '100%', position: 'relative', zIndex: 10, transition: 'max-width 0.3s ease' }}>
        {children}
      </div>
    </div>
  );
}
