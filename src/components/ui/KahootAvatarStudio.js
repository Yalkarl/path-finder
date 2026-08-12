'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Check, Lock, Trophy, X } from 'lucide-react';
import { KahootCharacterSvg } from '@/components/ui/KahootVectorCharacters';
import { checkAchievements } from '@/lib/constants/achievements';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/firestore';

export const KAHOOT_CHARACTERS = [
  // 🟢 3 Standard Unlocked Characters
  { id: 'penguin', name: 'Penguin', badge: 'เพนกวิน', bg: '#1E293B', isDefault: true },
  { id: 'bear', name: 'Bear', badge: 'หมีทอง', bg: '#D97706', isDefault: true },
  { id: 'cat', name: 'Cat', badge: 'แมวส้ม', bg: '#EA580C', isDefault: true },

  // 🔒 6 Achievement-Locked Characters
  { id: 'fox', name: 'Fox', badge: 'จิ้งจอก', bg: '#C2410C', isDefault: false, unlockRequirement: { achievementId: 'explorer', text: 'กรอกข้อมูลตั้งต้นเสร็จสมบูรณ์' } },
  { id: 'panda', name: 'Panda', badge: 'แพนด้า', bg: '#1E293B', isDefault: false, unlockRequirement: { achievementId: 'streak_3', text: 'เข้าใช้งานติดต่อกัน 3 วัน' } },
  { id: 'owl', name: 'Owl', badge: 'นกฮูก', bg: '#7E22CE', isDefault: false, unlockRequirement: { achievementId: 'stages_6', text: 'ทำแบบทดสอบผ่าน 6 ด่าน' } },
  { id: 'rabbit', name: 'Rabbit', badge: 'กระต่าย', bg: '#E6007A', isDefault: false, unlockRequirement: { achievementId: 'high_gpax', text: 'บันทึก GPAX เฉลี่ยมากกว่า 3.00' } },
  { id: 'lion', name: 'Lion', badge: 'สิงโต', bg: '#FBBF24', isDefault: false, unlockRequirement: { achievementId: 'target_lock', text: 'ล็อกเป้าหมายสายการเรียน Target Lock' } },
  { id: 'sun', name: 'Sun', badge: 'พระอาทิตย์', bg: '#F59E0B', isDefault: false, unlockRequirement: { achievementId: 'chatty', text: 'คุยกับ Mr. Path AI เกิน 5 ข้อความ' } }
];

export const KAHOOT_ACCESSORIES = [
  // 🟢 3 Standard Unlocked Accessories
  { id: 'none', name: 'ไม่มีเครื่องประดับ', code: null, isDefault: true },
  { id: 'beanie', name: 'หมวกไหมพรม', code: 'beanie', isDefault: true },
  { id: 'sunglasses', name: 'แว่นกันแดด', code: 'sunglasses', isDefault: true },

  // 🔒 5 Achievement-Locked Accessories
  { id: 'headphones', name: 'หูฟังดีเจ', code: 'headphones', isDefault: false, unlockRequirement: { achievementId: 'music_lover', text: 'เปิดเพลงประกอบขณะทำแบบทดสอบ' } },
  { id: 'scholar', name: 'หมวกปริญญา', code: 'scholar', isDefault: false, unlockRequirement: { achievementId: 'high_gpax', text: 'บันทึก GPAX เฉลี่ยมากกว่า 3.00' } },
  { id: 'hearts', name: 'มงกุฎหัวใจ', code: 'hearts', isDefault: false, unlockRequirement: { achievementId: 'profile_customizer', text: 'แต่งตัวละครในหน้าโปรไฟล์' } },
  { id: 'crown', name: 'มงกุฎราชา', code: 'crown', isDefault: false, unlockRequirement: { achievementId: 'trophy_master', text: 'สะสม Achievement ปลดล็อกเกิน 5 ถ้วย' } },
  { id: 'astronaut', name: 'หมวกอวกาศ', code: 'astronaut', isDefault: false, unlockRequirement: { achievementId: 'stages_12', text: 'ทำแบบทดสอบครบหมด 12 ด่าน' } }
];

export default function KahootAvatarStudio({ 
  initialCharacterId = 'penguin', 
  initialAccessoryId = 'none', 
  onSave 
}) {
  const { user } = useAuth();
  const [characterId, setCharacterId] = useState(initialCharacterId);
  const [accessoryId, setAccessoryId] = useState(initialAccessoryId);
  const [activeTab, setActiveTab] = useState('character'); // 'character' | 'accessory'
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [lockedItemModal, setLockedItemModal] = useState(null);
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    setCharacterId(initialCharacterId);
    setAccessoryId(initialAccessoryId);
  }, [initialCharacterId, initialAccessoryId]);

  useEffect(() => {
    // Attach portal root directly to document.body to break out of ALL layout constraints
    if (typeof document !== 'undefined') {
      let container = document.getElementById('pathfinder-modal-root');
      if (!container) {
        container = document.createElement('div');
        container.id = 'pathfinder-modal-root';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.zIndex = '9999999';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
      }
      setPortalTarget(container);
    }
  }, []);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(p => {
        if (p) {
          const unlocked = checkAchievements(p);
          setUnlockedAchievements(unlocked);
        }
      });
    }
  }, [user]);

  const isCharacterUnlocked = (char) => {
    if (char.isDefault) return true;
    return unlockedAchievements.includes(char.unlockRequirement?.achievementId);
  };

  const isAccessoryUnlocked = (acc) => {
    if (acc.isDefault) return true;
    return unlockedAchievements.includes(acc.unlockRequirement?.achievementId);
  };

  // Sort characters and accessories so all UNLOCKED items sit at the TOP of the grid!
  const sortedCharacters = [...KAHOOT_CHARACTERS].sort((a, b) => {
    const aUnlocked = isCharacterUnlocked(a);
    const bUnlocked = isCharacterUnlocked(b);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  const sortedAccessories = [...KAHOOT_ACCESSORIES].sort((a, b) => {
    const aUnlocked = isAccessoryUnlocked(a);
    const bUnlocked = isAccessoryUnlocked(b);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  const selectedChar = KAHOOT_CHARACTERS.find(c => c.id === characterId) || KAHOOT_CHARACTERS[0];
  const selectedAcc = KAHOOT_ACCESSORIES.find(a => a.id === accessoryId) || KAHOOT_ACCESSORIES[0];

  const handleSelectCharacter = (char) => {
    if (!isCharacterUnlocked(char)) {
      setLockedItemModal({ item: char, type: 'character' });
      return;
    }
    setCharacterId(char.id);
    if (onSave) onSave({ characterId: char.id, accessoryId });
  };

  const handleSelectAccessory = (acc) => {
    if (!isAccessoryUnlocked(acc)) {
      setLockedItemModal({ item: acc, type: 'accessory' });
      return;
    }
    setAccessoryId(acc.id);
    if (onSave) onSave({ characterId, accessoryId: acc.id });
  };

  return (
    <div style={{
      width: '100%',
      background: '#F8FAFC',
      borderRadius: '24px',
      border: '2px solid #E2E8F0',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
      position: 'relative'
    }}>
      {/* 1. TOP LIVE PREVIEW STAGE WITH VECTOR CARTOON CHARACTER */}
      <div style={{
        background: `linear-gradient(135deg, ${selectedChar.bg} 0%, #1E1E38 100%)`,
        padding: '2.5rem 1.5rem 2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        position: 'relative',
        minHeight: '210px'
      }}>
        {/* Kahoot Vector Cartoon Character Base + Attached Accessory Overlay */}
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          borderRadius: '30px',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
          border: '4px solid #FFFFFF'
        }}>
          <KahootCharacterSvg 
            type={selectedChar.id} 
            size={96} 
            accessory={selectedAcc.code} 
          />
        </div>

        {/* Character Title Badge */}
        <div style={{
          marginTop: '1rem',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          padding: '0.45rem 1.25rem',
          borderRadius: '20px',
          color: '#FFFFFF',
          fontSize: '0.85rem',
          fontWeight: '800',
          letterSpacing: '0.3px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <span>{selectedChar.name}</span>
          {selectedAcc.id !== 'none' && <span style={{ opacity: 0.9 }}>+ {selectedAcc.name}</span>}
        </div>
      </div>

      {/* 2. TABS: [ CHARACTER ] | [ ACCESSORY ] */}
      <div style={{
        display: 'flex',
        background: '#FFFFFF',
        borderBottom: '2px solid #E2E8F0',
        padding: '0.5rem 1rem 0 1rem'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('character')}
          style={{
            flex: 1,
            padding: '0.75rem 0.5rem',
            border: 'none',
            borderBottom: activeTab === 'character' ? '3.5px solid #7C5CFC' : '3.5px solid transparent',
            background: 'transparent',
            color: activeTab === 'character' ? '#7C5CFC' : '#64748B',
            fontWeight: '800',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
        >
          ตัวละคร (Character)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('accessory')}
          style={{
            flex: 1,
            padding: '0.75rem 0.5rem',
            border: 'none',
            borderBottom: activeTab === 'accessory' ? '3.5px solid #7C5CFC' : '3.5px solid transparent',
            background: 'transparent',
            color: activeTab === 'accessory' ? '#7C5CFC' : '#64748B',
            fontWeight: '800',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
        >
          เครื่องประดับ (Accessory)
        </button>
      </div>

      {/* 3. GRID SELECTION AREA (UNLOCKED ITEMS SORTED FIRST TO TOP!) */}
      <div style={{ padding: '1.25rem', background: '#F8FAFC' }}>
        {activeTab === 'character' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))',
            gap: '0.75rem'
          }}>
            {sortedCharacters.map(c => {
              const isSelected = characterId === c.id;
              const unlocked = isCharacterUnlocked(c);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCharacter(c)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justify: 'center',
                    padding: '0.65rem 0.25rem',
                    borderRadius: '16px',
                    border: isSelected ? '3px solid #7C5CFC' : '2px solid #E2E8F0',
                    borderBottom: isSelected ? '5px solid #5B2B8E' : '4px solid #CBD5E1',
                    background: unlocked ? '#FFFFFF' : '#F8FAFC',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: isSelected ? '0 6px 16px rgba(124, 92, 252, 0.2)' : '0 2px 6px rgba(0,0,0,0.03)',
                    fontFamily: 'inherit'
                  }}
                >
                  {/* Selected Active Badge */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      filter: 'drop-shadow(0 2px 4px rgba(124, 92, 252, 0.4))',
                      zIndex: 10
                    }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="9" fill="#7C5CFC" stroke="#FFFFFF" strokeWidth="2" />
                        <path d="M5.8 10.2 L8.8 13.2 L14.2 7.8" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* 100% DEAD-CENTERED LOCK OVERLAY WITH LUCIDE LOCK ICON */}
                  {!unlocked && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(241, 245, 249, 0.75)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      zIndex: 15,
                      borderRadius: '14px'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#1E293B',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        border: '2px solid #FFFFFF',
                        flexShrink: 0
                      }}>
                        <Lock size={15} strokeWidth={2.5} style={{ display: 'block', margin: 'auto' }} />
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: '0.25rem', opacity: unlocked ? 1 : 0.4 }}>
                    <KahootCharacterSvg type={c.id} size={48} />
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', color: isSelected ? '#7C5CFC' : (unlocked ? '#475569' : '#94A3B8') }}>
                    {c.badge}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))',
            gap: '0.75rem'
          }}>
            {sortedAccessories.map(a => {
              const isSelected = accessoryId === a.id;
              const unlocked = isAccessoryUnlocked(a);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleSelectAccessory(a)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justify: 'center',
                    padding: '0.65rem 0.25rem',
                    borderRadius: '16px',
                    border: isSelected ? '3px solid #7C5CFC' : '2px solid #E2E8F0',
                    borderBottom: isSelected ? '5px solid #5B2B8E' : '4px solid #CBD5E1',
                    background: isSelected ? 'rgba(124, 92, 252, 0.08)' : (unlocked ? '#FFFFFF' : '#F8FAFC'),
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: isSelected ? '0 6px 16px rgba(124, 92, 252, 0.2)' : '0 2px 6px rgba(0,0,0,0.03)',
                    fontFamily: 'inherit'
                  }}
                >
                  {/* Selected Active Badge */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      filter: 'drop-shadow(0 2px 4px rgba(124, 92, 252, 0.4))',
                      zIndex: 10
                    }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="9" fill="#7C5CFC" stroke="#FFFFFF" strokeWidth="2" />
                        <path d="M5.8 10.2 L8.8 13.2 L14.2 7.8" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* 100% DEAD-CENTERED LOCK OVERLAY WITH LUCIDE LOCK ICON */}
                  {!unlocked && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(241, 245, 249, 0.75)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      zIndex: 15,
                      borderRadius: '14px'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#1E293B',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        border: '2px solid #FFFFFF',
                        flexShrink: 0
                      }}>
                        <Lock size={15} strokeWidth={2.5} style={{ display: 'block', margin: 'auto' }} />
                      </div>
                    </div>
                  )}

                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justify: 'center',
                    marginBottom: '0.25rem',
                    opacity: unlocked ? 1 : 0.4
                  }}>
                    <KahootCharacterSvg type={characterId} size={42} accessory={a.code} />
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', color: isSelected ? '#7C5CFC' : (unlocked ? '#475569' : '#94A3B8') }}>
                    {a.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* DYNAMIC PORTAL: GAMIFIED UNLOCK MODAL POPUP (ATTACHED DIRECTLY TO document.body FOR 100% VIEWPORT CENTERING) */}
      {lockedItemModal && portalTarget && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          zIndex: 9999999,
          pointerEvents: 'auto',
          padding: '1rem'
        }} onClick={() => setLockedItemModal(null)}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            maxWidth: '360px',
            width: '100%',
            margin: 'auto',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            position: 'relative',
            border: '3px solid #7C5CFC',
            pointerEvents: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLockedItemModal(null)}
              style={{
                position: 'absolute',
                top: '14px', right: '14px',
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#94A3B8'
              }}
            >
              <X size={18} />
            </button>

            <div style={{
              width: '64px', height: '64px',
              borderRadius: '50%',
              background: 'rgba(124, 92, 252, 0.1)',
              color: '#7C5CFC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Lock size={32} />
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1E293B', fontWeight: '800', fontSize: '1.2rem' }}>
              ปลดล็อก {lockedItemModal.item.name}
            </h3>
            
            <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              ต้องทำความสำเร็จ <strong style={{ color: '#7C5CFC' }}>"{lockedItemModal.item.unlockRequirement?.text}"</strong> ให้ผ่านก่อน จึงจะสามารถปลดล็อกใช้งานได้!
            </p>

            <div style={{
              background: '#F1F5F9',
              padding: '0.85rem 1rem',
              borderRadius: '16px',
              fontSize: '0.8rem',
              color: '#475569',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '0.4rem'
            }}>
              <Trophy size={16} style={{ color: '#F59E0B' }} /> ดูภารกิจได้ที่หน้าเหรียญรางวัล Achievement
            </div>
          </div>
        </div>,
        portalTarget
      )}
    </div>
  );
}
