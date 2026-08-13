'use client';
import { useState, useEffect, useRef } from 'react';
import MrPathGreeting from '@/components/setup/MrPathGreeting';
import KahootAvatarStudio from '@/components/ui/KahootAvatarStudio';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

const PRESET_LIKES = [
  'AI & เทคโนโลยี', 'เขียนโปรแกรม/โค้ดดิ้ง', 'วิทยาศาสตร์ & การทดลอง', 
  'การวางแผน & บริหารธุรกิจ', 'ศิลปะ & ออกแบบ', 'ภาษา & การสื่อสาร', 
  'ดนตรี & การแสดง', 'เกม & E-Sports', 'กีฬา & ฟิตเนส', 'การทำอาหาร'
];

const PRESET_DISLIKES = [
  'งานท่องจำตำราหนักๆ', 'งานที่ต้องเจอเลือด/บาดแผล/ศพ', 'การคิดคำนวณคณิตซับซ้อน', 
  'การพูดโต้ตอบคนเยอะๆ/สปีช', 'งานทำความสะอาด/ใช้แรงกายหนัก', 'งานเอกสาร/ระเบียบเป๊ะๆ', 'การทำงานคนเดียวโดดเดี่ยว'
];

export default function ProfileStep() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [level, setLevel] = useState('junior');
  const [grade, setGrade] = useState('');
  const [characterId, setCharacterId] = useState('penguin');
  const [accessoryId, setAccessoryId] = useState('none');
  const [selectedLikes, setSelectedLikes] = useState([]);
  const [selectedDislikes, setSelectedDislikes] = useState([]);
  
  const [likeInput, setLikeInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');
  const [showLikeDropdown, setShowLikeDropdown] = useState(false);
  const [showDislikeDropdown, setShowDislikeDropdown] = useState(false);

  const likeRef = useRef(null);
  const dislikeRef = useRef(null);

  useEffect(() => {
    const savedLevel = localStorage.getItem('setup_educationLevel');
    if (savedLevel) {
      setLevel(savedLevel);
      const savedName = localStorage.getItem('setup_name');
      const savedGrade = localStorage.getItem('setup_grade');
      const savedChar = localStorage.getItem('setup_characterId');
      const savedAcc = localStorage.getItem('setup_accessoryId');
      const savedLikes = localStorage.getItem('setup_likes');
      const savedDislikes = localStorage.getItem('setup_dislikes');
      if (savedName) setName(savedName);
      if (savedGrade) setGrade(savedGrade);
      if (savedChar) setCharacterId(savedChar);
      if (savedAcc) setAccessoryId(savedAcc);
      if (savedLikes) setSelectedLikes(JSON.parse(savedLikes));
      if (savedDislikes) setSelectedDislikes(JSON.parse(savedDislikes));
    } else {
      router.push('/setup/education-level');
    }

    const handleClickOutside = (e) => {
      if (likeRef.current && !likeRef.current.contains(e.target)) {
        setShowLikeDropdown(false);
      }
      if (dislikeRef.current && !dislikeRef.current.contains(e.target)) {
        setShowDislikeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [router]);

  const addLike = (item) => {
    if (item && !selectedLikes.includes(item)) {
      setSelectedLikes(prev => [...prev, item]);
    }
    setLikeInput('');
    setShowLikeDropdown(false);
  };

  const removeLike = (item) => {
    setSelectedLikes(prev => prev.filter(i => i !== item));
  };

  const addDislike = (item) => {
    if (item && !selectedDislikes.includes(item)) {
      setSelectedDislikes(prev => [...prev, item]);
    }
    setDislikeInput('');
    setShowDislikeDropdown(false);
  };

  const removeDislike = (item) => {
    setSelectedDislikes(prev => prev.filter(i => i !== item));
  };

  const handleLikeKeyDown = (e) => {
    if (e.key === 'Enter' && likeInput.trim()) {
      e.preventDefault();
      addLike(likeInput.trim());
    }
  };

  const handleDislikeKeyDown = (e) => {
    if (e.key === 'Enter' && dislikeInput.trim()) {
      e.preventDefault();
      addDislike(dislikeInput.trim());
    }
  };

  const handleSaveAvatar = ({ characterId: newChar, accessoryId: newAcc }) => {
    setCharacterId(newChar);
    setAccessoryId(newAcc);
    localStorage.setItem('setup_characterId', newChar);
    localStorage.setItem('setup_accessoryId', newAcc);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('setup_name', name);
    localStorage.setItem('setup_grade', grade);
    localStorage.setItem('setup_characterId', characterId);
    localStorage.setItem('setup_accessoryId', accessoryId);
    localStorage.setItem('setup_likes', JSON.stringify(selectedLikes));
    localStorage.setItem('setup_dislikes', JSON.stringify(selectedDislikes));
    router.push('/setup/grades');
  };

  const gradeOptions = level === 'junior' 
    ? [{ id: 'm1', label: 'ม.1' }, { id: 'm2', label: 'ม.2' }, { id: 'm3', label: 'ม.3' }]
    : [{ id: 'm4', label: 'ม.4' }, { id: 'm5', label: 'ม.5' }, { id: 'm6', label: 'ม.6' }];

  const filteredLikePresets = PRESET_LIKES.filter(
    p => !selectedLikes.includes(p) && p.toLowerCase().includes(likeInput.toLowerCase())
  );

  const filteredDislikePresets = PRESET_DISLIKES.filter(
    p => !selectedDislikes.includes(p) && p.toLowerCase().includes(dislikeInput.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <div style={{ width: '30px', height: '6px', background: 'var(--primary)', borderRadius: '3px' }}></div>
        <div style={{ width: '30px', height: '6px', background: 'var(--primary)', borderRadius: '3px' }}></div>
        <div style={{ width: '6px', height: '6px', background: 'var(--border)', borderRadius: '3px' }}></div>
      </div>

      <MrPathGreeting message="ดีเลย! ขอกราบสวัสดีอย่างเป็นทางการครับ รบกวนพิมพ์ชื่อ เลือกระดับชั้น แต่งตัวละครอวตาร และระบุสิ่งที่คุณชอบ/ไม่ชอบเพื่อประเมินเส้นทางการเรียนครับ" />

      <form className="card" onSubmit={handleSubmit} style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Left Column: Form Fields */}
          <div style={{ flex: '1 1 340px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>ข้อมูลส่วนตัว</h3>
            
            {/* Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>ชื่อ-นามสกุล</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="เช่น นายสมชาย ใจดี"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Grade */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>ระดับชั้น</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {gradeOptions.map(opt => (
                  <div 
                    key={opt.id}
                    onClick={() => setGrade(opt.id)}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: `2px solid ${grade === opt.id ? 'var(--primary)' : 'var(--border)'}`,
                      background: grade === opt.id ? 'var(--primary)' : 'transparent',
                      color: grade === opt.id ? 'white' : 'var(--text-primary)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Likes / Interests - Sleek Minimalist Dropdown */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }} ref={likeRef}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#16A34A' }}>
                  สิ่งชอบ / ความสนใจ (ระบุได้หลายอย่าง)
                </label>
                {selectedLikes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedLikes([])}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6B7280',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#DC2626'}
                    onMouseLeave={(e) => e.target.style.color = '#6B7280'}
                    title="ลบสิ่งชอบทั้งหมดที่เลือกไว้"
                  >
                    ล้างสิ่งที่ชอบทั้งหมด
                  </button>
                )}
              </div>
              {selectedLikes.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  {selectedLikes.map(item => (
                    <span
                      key={item}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justify: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.45rem 0.2rem 0.65rem',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        lineHeight: 1,
                        background: 'rgba(22, 163, 74, 0.12)',
                        color: '#16A34A',
                        border: '1px solid rgba(22, 163, 74, 0.3)'
                      }}
                    >
                      ✓ {item}
                      <button
                        type="button"
                        onClick={() => removeLike(item)}
                        style={{
                          background: 'rgba(22, 163, 74, 0.25)',
                          border: 'none',
                          color: '#16A34A',
                          cursor: 'pointer',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justify: 'center',
                          padding: 0,
                          margin: 0,
                          lineHeight: 0,
                          flexShrink: 0,
                          appearance: 'none',
                          WebkitAppearance: 'none'
                        }}
                        title="คลิกเพื่อลบสิ่งชอบนี้ออก"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto' }}>
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                className="input-field"
                placeholder="พิมพ์หรือคลิกเลือกสิ่งชอบ..."
                value={likeInput}
                onFocus={() => setShowLikeDropdown(true)}
                onChange={(e) => { setLikeInput(e.target.value); setShowLikeDropdown(true); }}
                onKeyDown={handleLikeKeyDown}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
              {showLikeDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--surface, #FFF)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 100,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '0.4rem'
                }}>
                  {filteredLikePresets.map(preset => (
                    <div
                      key={preset}
                      onClick={() => addLike(preset)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontWeight: '500',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--primary-bg)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      + {preset}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dislikes / Non-interests - Sleek Minimalist Dropdown */}
            <div style={{ marginBottom: '1.75rem', position: 'relative' }} ref={dislikeRef}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#DC2626' }}>
                  สิ่งที่ไม่ชอบ (ระบุได้หลายอย่าง)
                </label>
                {selectedDislikes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDislikes([])}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6B7280',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#DC2626'}
                    onMouseLeave={(e) => e.target.style.color = '#6B7280'}
                    title="ลบสิ่งที่ไม่ชอบทั้งหมดที่เลือกไว้"
                  >
                    ล้างสิ่งที่ไม่ชอบทั้งหมด
                  </button>
                )}
              </div>
              {selectedDislikes.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  {selectedDislikes.map(item => (
                    <span
                      key={item}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justify: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.45rem 0.2rem 0.65rem',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        lineHeight: 1,
                        background: 'rgba(220, 38, 38, 0.12)',
                        color: '#DC2626',
                        border: '1px solid rgba(220, 38, 38, 0.3)'
                      }}
                    >
                      ✕ {item}
                      <button
                        type="button"
                        onClick={() => removeDislike(item)}
                        style={{
                          background: 'rgba(220, 38, 38, 0.25)',
                          border: 'none',
                          color: '#DC2626',
                          cursor: 'pointer',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justify: 'center',
                          padding: 0,
                          margin: 0,
                          lineHeight: 0,
                          flexShrink: 0,
                          appearance: 'none',
                          WebkitAppearance: 'none'
                        }}
                        title="คลิกเพื่อลบสิ่งที่ไม่ชอบนี้ออก"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto' }}>
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                className="input-field"
                placeholder="พิมพ์หรือคลิกเลือกสิ่งที่ไม่ชอบ..."
                value={dislikeInput}
                onFocus={() => setShowDislikeDropdown(true)}
                onChange={(e) => { setDislikeInput(e.target.value); setShowDislikeDropdown(true); }}
                onKeyDown={handleDislikeKeyDown}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
              {showDislikeDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--surface, #FFF)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 100,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '0.4rem'
                }}>
                  {filteredDislikePresets.map(preset => (
                    <div
                      key={preset}
                      onClick={() => addDislike(preset)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontWeight: '500',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--primary-bg)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      + {preset}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Character Avatar Studio */}
          <div style={{ flex: '1 1 350px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} /> ปรับแต่งตัวละครของคุณ
            </h3>
            <KahootAvatarStudio
              initialCharacterId={characterId}
              initialAccessoryId={accessoryId}
              onSave={handleSaveAvatar}
            />
          </div>

        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1.5rem' }}
          disabled={!name || !grade}
        >
          ถัดไป: กรอกเกรดวิชาเรียน →
        </button>
      </form>
    </div>
  );
}
