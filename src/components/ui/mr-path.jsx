"use client";

import React from 'react';

export function MrPath({ 
  size = 80, 
  animate = false, 
  showBg = false, 
  className = "", 
  style = {},
  mainColor = "#6C5CE7",
  accentColor = "#A29BFE",
  accessory = null // 'scholar', 'astronaut', 'headphones', 'hearts', 'sunglasses', 'crown', 'beanie'
}) {
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
        overflow: 'visible',
        ...bgStyle,
        ...style 
      }}
    >
      {/* 1. Mr. Path Body & Head Base */}
      <rect x="30" y="55" width="60" height="50" rx="16" fill={mainColor} />
      <rect x="42" y="68" width="36" height="24" rx="10" fill={accentColor} />
      <rect x="47" y="72" width="26" height="16" rx="5" fill="#1A1040" />
      <circle cx="51" cy="80" r="2" fill="#00B894" />
      <circle cx="57" cy="80" r="2" fill="#FDCB6E" />
      <circle cx="63" cy="80" r="2" fill="#FF7675" />
      
      {/* Head */}
      <rect x="26" y="12" width="68" height="52" rx="22" fill={mainColor} />
      <rect x="34" y="20" width="52" height="36" rx="16" fill={accentColor} />
      
      {/* Eyes */}
      <circle cx="46" cy="36" r="8" fill="white" />
      <circle cx="74" cy="36" r="8" fill="white" />
      <circle cx="48" cy="37" r="4" fill="#1A1040" />
      <circle cx="76" cy="37" r="4" fill="#1A1040" />
      <circle cx="50" cy="35" r="1.5" fill="white" />
      <circle cx="78" cy="35" r="1.5" fill="white" />
      
      {/* Mouth */}
      <path d="M50 48 Q60 55 70 48" stroke="#1A1040" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      
      {/* Ear Knobs */}
      <circle cx="30" cy="22" r="7" fill="#FDCB6E" />
      <circle cx="90" cy="22" r="7" fill="#FDCB6E" />
      
      {/* Arms & Legs */}
      <rect x="10" y="60" width="22" height="12" rx="6" fill={mainColor} />
      <rect x="88" y="60" width="22" height="12" rx="6" fill={mainColor} />
      <rect x="38" y="98" width="16" height="16" rx="8" fill="#4834D4" />
      <rect x="66" y="98" width="16" height="16" rx="8" fill="#4834D4" />
      
      {/* Default Head Cap */}
      <rect x="32" y="9" width="56" height="8" rx="4" fill="#4834D4" />
      <rect x="50" y="2" width="20" height="10" rx="3" fill="#FF7675" />
      <circle cx="60" cy="2" r="4" fill="#FDCB6E" />

      {/* 2. Seamless Attached Vector SVG Accessories */}
      
      {/* Graduation Mortarboard Cap */}
      {accessory === 'scholar' && (
        <g id="acc-scholar">
          <path d="M60 -2 L104 10 L60 22 L16 10 Z" fill="#2D3436" />
          <rect x="38" y="9" width="44" height="6" fill="#1A1040" />
          <path d="M88 12 L98 32" stroke="#FDCB6E" strokeWidth="2.5" />
          <circle cx="98" cy="34" r="3.5" fill="#FDCB6E" />
        </g>
      )}

      {/* Astronaut Bubble Visor Helmet */}
      {accessory === 'astronaut' && (
        <g id="acc-astronaut">
          <circle cx="60" cy="36" r="32" fill="rgba(9, 132, 227, 0.3)" stroke="#0984E3" strokeWidth="4" />
          <path d="M40 20 Q60 10 80 20" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
        </g>
      )}

      {/* Headphones Attached To Ears */}
      {accessory === 'headphones' && (
        <g id="acc-headphones">
          <path d="M22 30 Q60 -5 98 30" stroke="#2D3436" strokeWidth="6" strokeLinecap="round" fill="none" />
          <rect x="16" y="16" width="14" height="26" rx="7" fill="#FF7675" stroke="#2D3436" strokeWidth="2" />
          <rect x="90" y="16" width="14" height="26" rx="7" fill="#FF7675" stroke="#2D3436" strokeWidth="2" />
        </g>
      )}

      {/* Cool Sunglasses Snapped Over Eyes */}
      {accessory === 'sunglasses' && (
        <g id="acc-sunglasses">
          <rect x="34" y="28" width="24" height="18" rx="5" fill="#1A1040" stroke="#2D3436" strokeWidth="2" />
          <rect x="62" y="28" width="24" height="18" rx="5" fill="#1A1040" stroke="#2D3436" strokeWidth="2" />
          <line x1="58" y1="34" x2="62" y2="34" stroke="#1A1040" strokeWidth="4" />
          <path d="M38 32 L46 42" stroke="white" strokeWidth="2" opacity="0.6" />
          <path d="M66 32 L74 42" stroke="white" strokeWidth="2" opacity="0.6" />
        </g>
      )}

      {/* Heart Crown attached onto head */}
      {accessory === 'hearts' && (
        <g id="acc-hearts">
          <path d="M36 10 Q60 4 84 10" stroke="#FD79A8" strokeWidth="3" fill="none" />
          <path d="M42 4 C39 0 35 2 37 6 L42 12 L47 6 C49 2 45 0 42 4 Z" fill="#E84393" />
          <path d="M60 -2 C57 -6 53 -4 55 0 L60 6 L65 0 C67 -4 63 -6 60 -2 Z" fill="#E84393" />
          <path d="M78 4 C75 0 71 2 73 6 L78 12 L83 6 C85 2 81 0 78 4 Z" fill="#E84393" />
        </g>
      )}

      {/* Royal Crown attached on top of head */}
      {accessory === 'crown' && (
        <g id="acc-crown">
          <path d="M30 12 L38 -2 L60 8 L82 -2 L90 12 Z" fill="#FDCB6E" stroke="#E17055" strokeWidth="2.5" />
          <circle cx="38" cy="-2" r="3.5" fill="#E84393" />
          <circle cx="60" cy="8" r="3.5" fill="#0984E3" />
          <circle cx="82" cy="-2" r="3.5" fill="#00B894" />
        </g>
      )}

      {/* Winter Beanie Hat attached over head */}
      {accessory === 'beanie' && (
        <g id="acc-beanie">
          <path d="M28 14 Q60 -8 92 14 Z" fill="#E17055" />
          <rect x="26" y="9" width="68" height="9" rx="4" fill="#D63031" />
          <circle cx="60" cy="-8" r="7.5" fill="#FFFFFF" />
        </g>
      )}
    </svg>
  );
}
