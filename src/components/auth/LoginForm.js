'use client';
import { useState, useEffect } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } from '@/lib/firebaseAuth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/firestore';
import { MrPath } from '@/components/ui/mr-path';

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      getUserProfile(user.uid).then(profile => {
        if (profile?.completedSetup) {
          router.push('/dashboard');
        } else {
          router.push('/setup');
        }
      });
    }
  }, [user, authLoading, router]);

  const redirectAfterAuth = async (authUser) => {
    const profile = await getUserProfile(authUser.uid);
    if (profile?.completedSetup) {
      router.push('/dashboard');
    } else {
      router.push('/setup');
    }
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setSuccessMessage('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณสำเร็จแล้ว! 📧\n\n⚠️ หากไม่พบอีเมล กรุณาตรวจสอบในโฟลเดอร์จดหมายขยะ (Spam/Junk) ด้วยนะครับ');
      } else {
        let result;
        if (isSignUp) {
          result = await signUpWithEmail(email, password);
        } else {
          result = await signInWithEmail(email, password);
        }
        await redirectAfterAuth(result.user);
      }
    } catch (err) {
      if (isForgotPassword) {
        if (err.code === 'auth/user-not-found') {
          setError('ไม่พบข้อมูลผู้ใช้นี้ในระบบ');
        } else if (err.code === 'auth/invalid-email') {
          setError('รูปแบบอีเมลไม่ถูกต้อง');
        } else {
          setError('เกิดข้อผิดพลาดในการส่งลิงก์กู้คืนรหัสผ่าน');
        }
      } else if (isSignUp) {
        if (err.code === 'auth/email-already-in-use') {
          setError('อีเมลนี้ถูกใช้งานแล้ว');
        } else if (err.code === 'auth/weak-password') {
          setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        } else {
          setError('เกิดข้อผิดพลาดในการลงทะเบียน');
        }
      } else {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMessage('');
    try {
      const result = await signInWithGoogle();
      await redirectAfterAuth(result.user);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('กรุณาเพิ่มโดเมน path-finder-smart.pages.dev ใน Authorized Domains ของ Firebase Console');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('ยกเลิกการเข้าสู่ระบบ');
      } else {
        setError(`เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google (${err.code || err.message || 'Error'})`);
      }
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--primary)', fontWeight: '800' }}>PATHFINDER</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {isForgotPassword ? 'รีเซ็ตรหัสผ่าน' : isSignUp ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ'}
        </p>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        <MrPath size={80} />
      </div>

      <form onSubmit={handleAuthAction}>
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
          <input 
            type="email" 
            className="input-field" 
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {!isForgotPassword && (
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>Password</label>
              {!isSignUp && (
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setError(''); setSuccessMessage(''); }}
                  style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none' }}
                >
                  ลืมรหัสผ่าน? 🤔
                </a>
              )}
            </div>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}

        {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
        {successMessage && <p style={{ color: 'var(--success)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{successMessage}</p>}

        <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
          {loading ? 'กำลังดำเนินการ...' : isForgotPassword ? 'ส่งลิงก์รีเซ็ตผ่านอีเมล ✉️' : isSignUp ? 'สมัครสมาชิก 🚀' : 'เข้าสู่ระบบ 🚀'}
        </button>
      </form>

      {isForgotPassword ? (
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setError(''); setSuccessMessage(''); }}
            style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}
          >
            ← กลับไปหน้าเข้าสู่ระบบ
          </a>
        </p>
      ) : (
        <>
          <div style={{ position: 'relative', margin: '1.5rem 0' }}>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', padding: '0 10px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>หรือ</span>
          </div>

          <button type="button" className="btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={handleGoogleSignIn}>
            <img src="https://www.google.com/favicon.ico" alt="Google" width="16" height="16" />
            {isSignUp ? 'สมัครด้วย Google' : 'Login ด้วย Google'}
          </button>
          
          <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {isSignUp ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'} {' '}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); setError(''); setSuccessMessage(''); }}
              style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}
            >
              {isSignUp ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </a>
          </p>
        </>
      )}
    </div>
  );
}
