"use client";
import React from 'react';

/**
 * Perfectly Centered & Character-Proportioned Kahoot-Style Vector Cartoon Characters & Accessories
 */
export function KahootCharacterSvg({ type = 'penguin', size = 80, accessory = null }) {
  // Character-specific accessory height/position offsets so hats, glasses & headphones fit each animal's unique proportions!
  const getAccOffset = () => {
    switch (type) {
      case 'frog':
        return { 
          glassesY: -16,   // Snaps accurately over raised eyes at cy=20
          hatY: -20,       // Sits on top of raised eyes
          headphoneY: 6,   // Clamps on outer cheeks (cy=48), leaving eyes 100% clear!
          heartY: -16,     // Sits above eyes
          crownY: -20,     // Sits above eyes
          beanieY: -18     // Covers top head
        };
      case 'rabbit':
        return { glassesY: 2, hatY: -8, headphoneY: 4, heartY: -8, crownY: -8, beanieY: -8 };
      case 'owl':
        return { glassesY: 0, hatY: -4, headphoneY: 2, heartY: -4, crownY: -4, beanieY: -4 };
      case 'sun':
        return { glassesY: 2, hatY: -6, headphoneY: 2, heartY: -6, crownY: -6, beanieY: -6 };
      case 'lion':
        return { glassesY: 0, hatY: -4, headphoneY: 2, heartY: -4, crownY: -4, beanieY: -4 };
      case 'cat':
      case 'fox':
        return { glassesY: 0, hatY: -6, headphoneY: 2, heartY: -6, crownY: -6, beanieY: -6 };
      default:
        return { glassesY: 0, hatY: -2, headphoneY: 2, heartY: -2, crownY: -2, beanieY: -2 };
    }
  };

  const off = getAccOffset();

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}
    >
      {/* 1. CARTOON CHARACTER BASE (100% PERFECTLY CENTERED AT 50,50) */}
      
      {/* 🐼 PANDA */}
      {type === 'panda' && (
        <g id="char-panda">
          <circle cx="24" cy="24" r="13" fill="#1E293B" />
          <circle cx="76" cy="24" r="13" fill="#1E293B" />
          <circle cx="50" cy="50" r="36" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          <ellipse cx="35" cy="46" rx="10" ry="12" transform="rotate(-15 35 46)" fill="#1E293B" />
          <ellipse cx="65" cy="46" rx="10" ry="12" transform="rotate(15 65 46)" fill="#1E293B" />
          <circle cx="36" cy="46" r="3.5" fill="#FFFFFF" />
          <circle cx="64" cy="46" r="3.5" fill="#FFFFFF" />
          <circle cx="37" cy="45" r="1.5" fill="#1E293B" />
          <circle cx="65" cy="45" r="1.5" fill="#1E293B" />
          <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#1E293B" />
          <path d="M 45 62 Q 50 66 55 62" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="26" cy="54" r="4.5" fill="#FDA4AF" opacity="0.65" />
          <circle cx="74" cy="54" r="4.5" fill="#FDA4AF" opacity="0.65" />
        </g>
      )}

      {/* 🦊 FOX */}
      {type === 'fox' && (
        <g id="char-fox">
          <path d="M 22 28 L 14 6 Q 30 16 38 26 Z" fill="#EA580C" />
          <path d="M 24 26 L 18 12 Q 28 18 34 24 Z" fill="#FDBA74" />
          <path d="M 78 28 L 86 6 Q 70 16 62 26 Z" fill="#EA580C" />
          <path d="M 76 26 L 82 12 Q 72 18 66 24 Z" fill="#FDBA74" />
          <path d="M 14 6 L 22 14 L 17 20 Z" fill="#1C1917" />
          <path d="M 86 6 L 78 14 L 83 20 Z" fill="#1C1917" />
          <circle cx="50" cy="50" r="36" fill="#EA580C" />
          <path d="M 16 48 C 28 36 42 68 50 72 C 24 76 14 60 16 48 Z" fill="#FFFFFF" />
          <path d="M 84 48 C 72 36 58 68 50 72 C 76 76 86 60 84 48 Z" fill="#FFFFFF" />
          <ellipse cx="50" cy="66" rx="4.5" ry="3" fill="#1C1917" />
          <path d="M 45 70 Q 50 74 55 70" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="36" cy="44" r="4" fill="#1C1917" />
          <circle cx="64" cy="44" r="4" fill="#1C1917" />
          <circle cx="38" cy="42" r="1.5" fill="#FFFFFF" />
          <circle cx="66" cy="42" r="1.5" fill="#FFFFFF" />
          <circle cx="28" cy="52" r="4" fill="#FDA4AF" opacity="0.65" />
          <circle cx="72" cy="52" r="4" fill="#FDA4AF" opacity="0.65" />
        </g>
      )}

      {/* 🐧 PENGUIN */}
      {type === 'penguin' && (
        <g id="char-penguin">
          <ellipse cx="50" cy="50" rx="36" ry="38" fill="#0F172A" />
          <path d="M 50 18 C 32 18 24 36 24 54 C 24 70 35 84 50 84 C 65 84 76 70 76 54 C 76 36 68 18 50 18 Z" fill="#FFFFFF" />
          <circle cx="38" cy="42" r="4.5" fill="#0F172A" />
          <circle cx="62" cy="42" r="4.5" fill="#0F172A" />
          <circle cx="40" cy="40" r="1.5" fill="#FFFFFF" />
          <circle cx="64" cy="40" r="1.5" fill="#FFFFFF" />
          <path d="M 42 50 Q 50 44 58 50 Q 50 62 42 50 Z" fill="#F97316" />
          <ellipse cx="28" cy="52" rx="4.5" ry="2.5" fill="#FDA4AF" />
          <ellipse cx="72" cy="52" rx="4.5" ry="2.5" fill="#FDA4AF" />
        </g>
      )}

      {/* 🐻 BEAR */}
      {type === 'bear' && (
        <g id="char-bear">
          <circle cx="22" cy="24" r="13" fill="#D97706" />
          <circle cx="22" cy="24" r="7" fill="#FDE68A" />
          <circle cx="78" cy="24" r="13" fill="#D97706" />
          <circle cx="78" cy="24" r="7" fill="#FDE68A" />
          <circle cx="50" cy="50" r="36" fill="#D97706" />
          <ellipse cx="50" cy="59" rx="17" ry="12" fill="#FEF3C7" />
          <ellipse cx="50" cy="53" rx="5.5" ry="4" fill="#451A03" />
          <path d="M 45 60 Q 50 64 55 60" stroke="#451A03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="36" cy="42" r="4" fill="#451A03" />
          <circle cx="64" cy="42" r="4" fill="#451A03" />
          <circle cx="38" cy="40" r="1.5" fill="#FFFFFF" />
          <circle cx="66" cy="40" r="1.5" fill="#FFFFFF" />
          <circle cx="28" cy="50" r="4" fill="#FCA5A5" opacity="0.65" />
          <circle cx="72" cy="50" r="4" fill="#FCA5A5" opacity="0.65" />
        </g>
      )}

      {/* 🐱 CAT */}
      {type === 'cat' && (
        <g id="char-cat">
          <path d="M 18 28 L 14 6 Q 32 16 40 26 Z" fill="#EA580C" />
          <path d="M 22 24 L 18 12 Q 30 18 36 24 Z" fill="#FDBA74" />
          <path d="M 82 28 L 86 6 Q 68 16 60 26 Z" fill="#EA580C" />
          <path d="M 78 24 L 82 12 Q 70 18 64 24 Z" fill="#FDBA74" />
          <circle cx="50" cy="50" r="36" fill="#F97316" />
          <ellipse cx="50" cy="60" rx="16" ry="12" fill="#FFEDD5" />
          <polygon points="50,53 44,58 56,58" fill="#F43F5E" />
          <path d="M 44 62 Q 50 67 56 62" stroke="#431407" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="36" cy="42" rx="4" ry="5.5" fill="#431407" />
          <ellipse cx="64" cy="42" rx="4" ry="5.5" fill="#431407" />
          <circle cx="37" cy="40" r="1.5" fill="#FFFFFF" />
          <circle cx="65" cy="40" r="1.5" fill="#FFFFFF" />
          <line x1="16" y1="50" x2="30" y2="52" stroke="#431407" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="14" y1="58" x2="30" y2="57" stroke="#431407" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="84" y1="50" x2="70" y2="52" stroke="#431407" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="86" y1="58" x2="70" y2="57" stroke="#431407" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}

      {/* 🦉 OWL */}
      {type === 'owl' && (
        <g id="char-owl">
          <path d="M 28 18 L 20 6 L 36 22 Z" fill="#6B21A8" />
          <path d="M 72 18 L 80 6 L 64 22 Z" fill="#6B21A8" />
          <circle cx="50" cy="50" r="36" fill="#7E22CE" />
          <circle cx="36" cy="42" r="14" fill="#FFFFFF" />
          <circle cx="64" cy="42" r="14" fill="#FFFFFF" />
          <circle cx="36" cy="42" r="6.5" fill="#1E1B4B" />
          <circle cx="64" cy="42" r="6.5" fill="#1E1B4B" />
          <circle cx="38" cy="40" r="2" fill="#FFFFFF" />
          <circle cx="66" cy="40" r="2" fill="#FFFFFF" />
          <path d="M 43 50 Q 50 44 57 50 Q 50 61 43 50 Z" fill="#F59E0B" />
          <path d="M 32 68 Q 50 78 68 68" stroke="#A855F7" strokeWidth="2.5" fill="none" strokeDasharray="3 3" />
        </g>
      )}

      {/* 🐰 RABBIT */}
      {type === 'rabbit' && (
        <g id="char-rabbit">
          <ellipse cx="32" cy="16" rx="8" ry="20" fill="#FFFFFF" stroke="#F472B6" strokeWidth="2" />
          <ellipse cx="32" cy="16" rx="4" ry="14" fill="#FBCFE8" />
          <ellipse cx="68" cy="16" rx="8" ry="20" fill="#FFFFFF" stroke="#F472B6" strokeWidth="2" />
          <ellipse cx="68" cy="16" rx="4" ry="14" fill="#FBCFE8" />
          <circle cx="50" cy="54" r="34" fill="#FFFFFF" stroke="#F472B6" strokeWidth="2" />
          <circle cx="36" cy="45" r="4" fill="#831843" />
          <circle cx="64" cy="45" r="4" fill="#831843" />
          <polygon points="50,53 45,58 55,58" fill="#FB7185" />
          <path d="M 45 62 Q 50 66 55 62" stroke="#831843" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="26" cy="54" r="4.5" fill="#FBCFE8" />
          <circle cx="74" cy="54" r="4.5" fill="#FBCFE8" />
        </g>
      )}

      {/* 🦁 LION */}
      {type === 'lion' && (
        <g id="char-lion">
          <circle cx="50" cy="50" r="42" fill="#D97706" />
          <circle cx="50" cy="50" r="31" fill="#FBBF24" />
          <ellipse cx="50" cy="59" rx="15" ry="11" fill="#FEF3C7" />
          <ellipse cx="50" cy="53" rx="5.5" ry="3.8" fill="#78350F" />
          <path d="M 45 60 Q 50 64 55 60" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="36" cy="42" r="4" fill="#78350F" />
          <circle cx="64" cy="42" r="4" fill="#78350F" />
          <circle cx="38" cy="40" r="1.5" fill="#FFFFFF" />
          <circle cx="66" cy="40" r="1.5" fill="#FFFFFF" />
        </g>
      )}

      {/* 🐸 FROG */}
      {type === 'frog' && (
        <g id="char-frog">
          <circle cx="28" cy="20" r="12" fill="#22C55E" />
          <circle cx="28" cy="20" r="8" fill="#FFFFFF" />
          <circle cx="28" cy="20" r="4" fill="#14532D" />
          <circle cx="30" cy="18" r="1.5" fill="#FFFFFF" />
          <circle cx="72" cy="20" r="12" fill="#22C55E" />
          <circle cx="72" cy="20" r="8" fill="#FFFFFF" />
          <circle cx="72" cy="20" r="4" fill="#14532D" />
          <circle cx="74" cy="18" r="1.5" fill="#FFFFFF" />
          <ellipse cx="50" cy="52" rx="38" ry="30" fill="#22C55E" />
          <ellipse cx="50" cy="62" rx="22" ry="14" fill="#86EFAC" />
          <path d="M 30 57 Q 50 70 70 57" stroke="#14532D" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="24" cy="56" r="4" fill="#F43F5E" opacity="0.65" />
          <circle cx="76" cy="56" r="4" fill="#F43F5E" opacity="0.65" />
        </g>
      )}

      {/* ☀️ SUN */}
      {type === 'sun' && (
        <g id="char-sun">
          <circle cx="50" cy="10" r="6.5" fill="#F59E0B" />
          <circle cx="50" cy="90" r="6.5" fill="#F59E0B" />
          <circle cx="10" cy="50" r="6.5" fill="#F59E0B" />
          <circle cx="90" cy="50" r="6.5" fill="#F59E0B" />
          <circle cx="22" cy="22" r="6.5" fill="#F59E0B" />
          <circle cx="78" cy="78" r="6.5" fill="#F59E0B" />
          <circle cx="78" cy="22" r="6.5" fill="#F59E0B" />
          <circle cx="22" cy="78" r="6.5" fill="#F59E0B" />
          <circle cx="50" cy="50" r="33" fill="#FBBF24" />
          <circle cx="36" cy="44" r="4" fill="#78350F" />
          <circle cx="64" cy="44" r="4" fill="#78350F" />
          <path d="M 36 56 Q 50 68 64 56" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="28" cy="54" r="4" fill="#F43F5E" opacity="0.55" />
          <circle cx="72" cy="54" r="4" fill="#F43F5E" opacity="0.55" />
        </g>
      )}

      {/* 🟢 DEFAULT FALLBACK (If type is robot, pathfinder, or unknown) */}
      {!['panda', 'fox', 'penguin', 'bear', 'cat', 'owl', 'rabbit', 'lion', 'frog', 'sun'].includes(type) && (
        <g id="char-penguin-default">
          <ellipse cx="50" cy="50" rx="36" ry="38" fill="#0F172A" />
          <path d="M 50 18 C 32 18 24 36 24 54 C 24 70 35 84 50 84 C 65 84 76 70 76 54 C 76 36 68 18 50 18 Z" fill="#FFFFFF" />
          <circle cx="38" cy="42" r="4.5" fill="#0F172A" />
          <circle cx="62" cy="42" r="4.5" fill="#0F172A" />
          <circle cx="40" cy="40" r="1.5" fill="#FFFFFF" />
          <circle cx="64" cy="40" r="1.5" fill="#FFFFFF" />
          <path d="M 42 50 Q 50 44 58 50 Q 50 62 42 50 Z" fill="#F97316" />
          <ellipse cx="28" cy="52" rx="4.5" ry="2.5" fill="#FDA4AF" />
          <ellipse cx="72" cy="52" rx="4.5" ry="2.5" fill="#FDA4AF" />
        </g>
      )}

      {/* 2. CHARACTER-PROPORTIONED VECTOR SVG ACCESSORIES */}
      
      {/* 🎓 High Scholar Graduation Cap */}
      {accessory === 'scholar' && (
        <g id="vec-acc-scholar" transform={`translate(0, ${off.hatY})`} filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.3))">
          <rect x="34" y="9" width="32" height="9" rx="3" fill="#0F172A" />
          <rect x="36" y="11" width="28" height="3" rx="1.5" fill="#334155" />
          <path d="M 50 -12 L 94 4 L 50 20 L 6 4 Z" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <path d="M 50 -8 L 88 4 L 50 16 L 12 4 Z" fill="#0F172A" />
          <circle cx="50" cy="4" r="3.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <path d="M 50 4 Q 72 8 82 25" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 82 25 L 82 34" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          <circle cx="82" cy="35" r="2.5" fill="#FBBF24" />
        </g>
      )}

      {/* 🚀 Astronaut Helmet Bubble */}
      {accessory === 'astronaut' && (
        <g id="vec-acc-astronaut" transform={`translate(0, ${type === 'frog' ? -8 : 0})`} filter="drop-shadow(0px 4px 8px rgba(14,165,233,0.35))">
          <rect x="22" y="70" width="56" height="12" rx="6" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2.5" />
          <rect x="34" y="74" width="32" height="4" rx="2" fill="#38BDF8" />
          <circle cx="50" cy="48" r="44" fill="rgba(14, 165, 233, 0.28)" stroke="#38BDF8" strokeWidth="4" />
          <path d="M 22 28 Q 50 10 78 28" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />
          <path d="M 28 36 Q 50 22 72 36" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        </g>
      )}

      {/* 🎧 DJ Headphones (ACCURATELY CLAMPED ON SIDES OF CHEEKS/HEAD FOR EVERY CHARACTER!) */}
      {accessory === 'headphones' && (
        <g id="vec-acc-headphones" transform={`translate(0, ${off.headphoneY})`} filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.35))">
          <path d="M 12 44 Q 50 -14 88 44" stroke="#0F172A" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M 16 42 Q 50 -8 84 42" stroke="#334155" strokeWidth="3" fill="none" />
          <rect x="4" y="28" width="16" height="30" rx="8" fill="#F43F5E" stroke="#0F172A" strokeWidth="2.5" />
          <rect x="8" y="32" width="8" height="22" rx="4" fill="#FFE4E6" opacity="0.4" />
          <rect x="80" y="28" width="16" height="30" rx="8" fill="#F43F5E" stroke="#0F172A" strokeWidth="2.5" />
          <rect x="84" y="32" width="8" height="22" rx="4" fill="#FFE4E6" opacity="0.4" />
        </g>
      )}

      {/* 🕶️ Cool Sunglasses (ACCURATELY POSITIONED OVER EACH ANIMAL'S EYES!) */}
      {accessory === 'sunglasses' && (
        <g id="vec-acc-sunglasses" transform={`translate(0, ${off.glassesY})`} filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.4))">
          <rect x="18" y="32" width="28" height="20" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="3" />
          <rect x="54" y="32" width="28" height="20" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="3" />
          <line x1="46" y1="38" x2="54" y2="38" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 23 36 L 33 48" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
          <path d="M 59 36 L 69 48" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
        </g>
      )}

      {/* 💖 Heart Crown */}
      {accessory === 'hearts' && (
        <g id="vec-acc-hearts" transform={`translate(0, ${off.heartY})`} filter="drop-shadow(0px 3px 6px rgba(225,29,72,0.4))">
          <path d="M 22 14 Q 50 4 78 14" stroke="#F472B6" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 28 4 C 25 -1 20 1 22 6 L 28 12 L 34 6 C 36 1 31 -1 28 4 Z" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="27" cy="3" r="1" fill="#FFFFFF" />
          <path d="M 50 -10 C 46 -16 40 -12 43 -6 L 50 3 L 57 -6 C 60 -12 54 -16 50 -10 Z" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="48" cy="-11" r="1.5" fill="#FFFFFF" />
          <path d="M 72 4 C 69 -1 64 1 66 6 L 72 12 L 78 6 C 80 1 75 -1 72 4 Z" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="71" cy="3" r="1" fill="#FFFFFF" />
        </g>
      )}

      {/* 👑 Royal King Crown */}
      {accessory === 'crown' && (
        <g id="vec-acc-crown" transform={`translate(0, ${off.crownY})`} filter="drop-shadow(0px 4px 8px rgba(180,83,9,0.45))">
          <rect x="22" y="10" width="56" height="8" rx="3" fill="#B45309" />
          <path d="M 22 10 L 26 -12 L 38 2 L 50 -18 L 62 2 L 74 -12 L 78 10 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
          <path d="M 25 10 L 28 -6 L 38 4 L 50 -12 L 62 4 L 72 -6 L 75 10 Z" fill="#FBBF24" />
          <circle cx="26" cy="-12" r="4" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="50" cy="-18" r="5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.2" />
          <circle cx="74" cy="-12" r="4" fill="#16A34A" stroke="#FFFFFF" strokeWidth="1" />
        </g>
      )}

      {/* 🧢 Winter Beanie */}
      {accessory === 'beanie' && (
        <g id="vec-acc-beanie" transform={`translate(0, ${off.beanieY})`} filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.3))">
          <path d="M 18 16 Q 50 -18 82 16 Z" fill="#EA580C" />
          <path d="M 28 14 Q 50 -10 72 14 Z" fill="#F97316" />
          <rect x="14" y="9" width="72" height="12" rx="6" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
          <circle cx="50" cy="-18" r="9" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="48" cy="-20" r="3" fill="#F8FAFC" />
        </g>
      )}
    </svg>
  );
}
