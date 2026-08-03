"use client";

import React from 'react';

export function MrPath({ size = 80, animate = false, showBg = false, className = "", style = {} }) {
  const bgStyle = showBg ? {
    background: '#FFFFFF',
    borderRadius: '24%',
    boxShadow: '0 8px 24px rgba(124, 92, 252, 0.15)',
    padding: '8%',
  } : {};

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${animate ? "animate-bounce" : ""} ${className}`} 
      style={{ 
        animationDuration: "2s", 
        display: 'inline-block',
        verticalAlign: 'middle',
        ...bgStyle,
        ...style 
      }}
    >
      <rect x="30" y="55" width="60" height="50" rx="16" fill="#6C5CE7" />
      <rect x="42" y="68" width="36" height="24" rx="10" fill="#A29BFE" />
      <rect x="47" y="72" width="26" height="16" rx="5" fill="#1A1040" />
      <circle cx="51" cy="80" r="2" fill="#00B894" />
      <circle cx="57" cy="80" r="2" fill="#FDCB6E" />
      <circle cx="63" cy="80" r="2" fill="#FF7675" />
      <rect x="26" y="12" width="68" height="52" rx="22" fill="#6C5CE7" />
      <rect x="34" y="20" width="52" height="36" rx="16" fill="#A29BFE" />
      <circle cx="46" cy="36" r="8" fill="white" />
      <circle cx="74" cy="36" r="8" fill="white" />
      <circle cx="48" cy="37" r="4" fill="#1A1040" />
      <circle cx="76" cy="37" r="4" fill="#1A1040" />
      <circle cx="50" cy="35" r="1.5" fill="white" />
      <circle cx="78" cy="35" r="1.5" fill="white" />
      <path d="M50 48 Q60 55 70 48" stroke="#1A1040" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="22" r="7" fill="#FDCB6E" />
      <circle cx="90" cy="22" r="7" fill="#FDCB6E" />
      <rect x="10" y="60" width="22" height="12" rx="6" fill="#6C5CE7" />
      <rect x="88" y="60" width="22" height="12" rx="6" fill="#6C5CE7" />
      <rect x="38" y="98" width="16" height="16" rx="8" fill="#4834D4" />
      <rect x="66" y="98" width="16" height="16" rx="8" fill="#4834D4" />
      <rect x="32" y="9" width="56" height="8" rx="4" fill="#4834D4" />
      <rect x="50" y="2" width="20" height="10" rx="3" fill="#FF7675" />
      <circle cx="60" cy="2" r="4" fill="#FDCB6E" />
    </svg>
  );
}
