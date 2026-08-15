'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  loading: true
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // ระบบเปลี่ยนหน้าอัตโนมัติ
      if (!currentUser && !pathname.startsWith('/login') && pathname !== '/') {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const isPublicRoute = pathname === '/' || pathname.startsWith('/login');

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {isPublicRoute ? children : (!loading && children)}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
