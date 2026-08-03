'use client';
import React from 'react';
import { MrPath } from '@/components/ui/mr-path';

export default function MrPathGreeting({ message }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      marginBottom: '2rem',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* Mascot Wrapper */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '8px',
        boxShadow: '0 8px 24px rgba(124, 92, 252, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: '72px',
        height: '72px',
        border: '1.5px solid var(--border)'
      }}>
        <MrPath size={52} showBg={false} />
      </div>

      {/* Speech Bubble */}
      <div style={{
        background: 'var(--surface)',
        padding: '1.1rem 1.5rem',
        borderRadius: '22px',
        boxShadow: '0 8px 24px rgba(124, 92, 252, 0.08)',
        position: 'relative',
        flex: 1,
        border: '1.5px solid var(--border)'
      }}>
        {/* Left pointer */}
        <div style={{
          position: 'absolute',
          left: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '7.5px solid transparent',
          borderBottom: '7.5px solid transparent',
          borderRight: '7.5px solid var(--surface)',
          zIndex: 2,
        }} />
        <div style={{
          position: 'absolute',
          left: '-9.5px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '8.5px solid transparent',
          borderBottom: '8.5px solid transparent',
          borderRight: '8.5px solid var(--border)',
          zIndex: 1,
        }} />
        <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.6', color: 'var(--text-primary)', fontWeight: '600' }}>
          {message}
        </p>
      </div>
    </div>
  );
}
