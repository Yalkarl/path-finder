"use client";

import React, { useState } from 'react';
import { constellationAudio } from '@/lib/sound/constellationAudio';
import { Sparkles, Volume2, Square, Zap, Music, Radio } from 'lucide-react';

export function ConstellationSoundTester({ onTriggerMockAnimation }) {
  const [activeSound, setActiveSound] = useState(null);

  const handlePlay = (soundType) => {
    setActiveSound(soundType);

    if (onTriggerMockAnimation) {
      onTriggerMockAnimation(true);
    }

    const onFinish = () => {
      setActiveSound(null);
      if (onTriggerMockAnimation) {
        onTriggerMockAnimation(false);
      }
    };

    if (soundType === 'cosmic') {
      constellationAudio.playCosmicCrystal(onFinish);
    } else if (soundType === 'cyber') {
      constellationAudio.playCyberMatrix(onFinish);
    } else if (soundType === 'magic') {
      constellationAudio.playMagicFantasy(onFinish);
    }
  };

  const handleStop = () => {
    constellationAudio.stopAll();
    setActiveSound(null);
    if (onTriggerMockAnimation) {
      onTriggerMockAnimation(false);
    }
  };

  return (
    <div style={{
      marginTop: '1.25rem',
      padding: '1.1rem 1.25rem',
      background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
      borderRadius: '16px',
      border: '1.5px dashed rgba(124, 92, 252, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Volume2 size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              ทดสอบฟังเสียงจำลอง Sound Effects
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              คลิกเพื่อทดสอบฟังเสียงสังเคราะห์จำลองพร้อมแอนิเมชันกลุ่มดาว
            </div>
          </div>
        </div>

        {activeSound && (
          <button
            type="button"
            onClick={handleStop}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '600',
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              cursor: 'pointer'
            }}
          >
            <Square size={12} fill="#DC2626" /> หยุดเสียง
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.65rem'
      }}>
        {/* Option 1: Cosmic Astral & Crystal */}
        <button
          type="button"
          onClick={() => handlePlay('cosmic')}
          style={{
            padding: '0.75rem 0.9rem',
            borderRadius: '12px',
            border: activeSound === 'cosmic' ? '2px solid #7C5CFC' : '1px solid var(--border)',
            background: activeSound === 'cosmic' ? '#EDE9FE' : '#FFFFFF',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeSound === 'cosmic' ? '0 4px 14px rgba(124, 92, 252, 0.2)' : '0 2px 6px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Sparkles size={16} color="#7C5CFC" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#7C5CFC' }}>
              1. Cosmic Crystal
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
            เสียงประกายดาวระยิบระยับ + คอร์ดคริสตัลกังวานใส
          </div>
        </button>

        {/* Option 2: Cyber Matrix */}
        <button
          type="button"
          onClick={() => handlePlay('cyber')}
          style={{
            padding: '0.75rem 0.9rem',
            borderRadius: '12px',
            border: activeSound === 'cyber' ? '2px solid #06B6D4' : '1px solid var(--border)',
            background: activeSound === 'cyber' ? '#E0F2FE' : '#FFFFFF',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeSound === 'cyber' ? '0 4px 14px rgba(6, 182, 212, 0.2)' : '0 2px 6px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Zap size={16} color="#06B6D4" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0284C7' }}>
              2. Cyber Matrix
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
            เสียงสัญญาณสแกนข้อมูลไซไฟ + Hologram Activation
          </div>
        </button>

        {/* Option 3: Magic Fantasy */}
        <button
          type="button"
          onClick={() => handlePlay('magic')}
          style={{
            padding: '0.75rem 0.9rem',
            borderRadius: '12px',
            border: activeSound === 'magic' ? '2px solid #EC4899' : '1px solid var(--border)',
            background: activeSound === 'magic' ? '#FCE7F3' : '#FFFFFF',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeSound === 'magic' ? '0 4px 14px rgba(236, 72, 153, 0.2)' : '0 2px 6px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Music size={16} color="#EC4899" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#DB2777' }}>
              3. Magic Fantasy
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
            เสียงรูดสายพิณแก้ว + ละอองเวทมนตร์ Chimes
          </div>
        </button>
      </div>
    </div>
  );
}
