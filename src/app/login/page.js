import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login - PathFinder',
};

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(135deg, #F2F0FF 0%, #E8E4FF 50%, rgba(255, 234, 167, 0.15) 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Floating background decorative objects */}
      <div className="bg-deco-object animate-float-1" style={{ top: '10%', left: '8%', fontSize: '2.5rem', opacity: 0.25 }}>⭐</div>
      <div className="bg-deco-object animate-float-2" style={{ top: '22%', right: '10%', fontSize: '2.2rem', opacity: 0.2 }}>🔮</div>
      <div className="bg-deco-object animate-float-3" style={{ bottom: '25%', left: '10%', fontSize: '2rem', opacity: 0.2 }}>✨</div>
      <div className="bg-deco-object animate-float-4" style={{ bottom: '15%', right: '8%', fontSize: '2.2rem', opacity: 0.15 }}>🎓</div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px' }}>
        <LoginForm />
      </div>
    </div>
  );
}
