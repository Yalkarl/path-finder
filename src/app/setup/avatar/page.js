'use client';
import { useState, useEffect } from 'react';
import MrPathGreeting from '@/components/setup/MrPathGreeting';
import KahootAvatarStudio from '@/components/ui/KahootAvatarStudio';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function AvatarStep() {
  const router = useRouter();
  const [characterId, setCharacterId] = useState('penguin');
  const [accessoryId, setAccessoryId] = useState('none');

  useEffect(() => {
    const savedLevel = localStorage.getItem('setup_educationLevel');
    if (!savedLevel) {
      router.push('/setup/education-level');
      return;
    }
    const savedChar = localStorage.getItem('setup_characterId');
    const savedAcc = localStorage.getItem('setup_accessoryId');
    if (savedChar) setCharacterId(savedChar);
    if (savedAcc) setAccessoryId(savedAcc);
  }, [router]);

  const handleSaveAvatar = ({ characterId: newChar, accessoryId: newAcc }) => {
    setCharacterId(newChar);
    setAccessoryId(newAcc);
    localStorage.setItem('setup_characterId', newChar);
    localStorage.setItem('setup_accessoryId', newAcc);
  };

  const handleNext = () => {
    localStorage.setItem('setup_characterId', characterId);
    localStorage.setItem('setup_accessoryId', accessoryId);
    router.push('/setup/profile');
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Progress Indicator (Step 2 of 4) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ width: '30px', height: '6px', background: 'var(--primary)', borderRadius: '3px' }}></div>
        <div style={{ width: '30px', height: '6px', background: 'var(--primary)', borderRadius: '3px' }}></div>
        <div style={{ width: '6px', height: '6px', background: 'var(--border)', borderRadius: '3px' }}></div>
        <div style={{ width: '6px', height: '6px', background: 'var(--border)', borderRadius: '3px' }}></div>
      </div>

      {/* Mascot Greeting */}
      <MrPathGreeting message="เย้! มาเลือกแต่งตัวละครอวตารประจำตัวของคุณกันเลยครับ เลือกคาแรกเตอร์และหมวกที่คุณชอบได้ตามใจสั่งเลย!" />

      {/* Avatar Studio Card */}
      <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <KahootAvatarStudio 
          characterId={characterId} 
          accessoryId={accessoryId} 
          onSave={handleSaveAvatar} 
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', width: '100%', maxWidth: '480px' }}>
          <button
            type="button"
            onClick={() => router.push('/setup/education-level')}
            style={{
              flex: '0 0 auto',
              padding: '0.85rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              borderRadius: '14px',
              border: '1.5px solid var(--border)',
              background: '#FFFFFF',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
          >
            <ArrowLeft size={18} />
            <span>ย้อนกลับ</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleNext}
            style={{
              flex: 1,
              padding: '0.85rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(124, 92, 252, 0.25)'
            }}
          >
            <span>ถัดไป</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
