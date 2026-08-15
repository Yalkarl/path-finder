'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';
import { calculateSkillVector } from '@/lib/algorithms/skillVector';
import { matchPaths } from '@/lib/algorithms/cosineSimilarity';
import { User, Settings, Edit2, Compass, BookOpen, Globe, BookMarked, FlaskConical, Target, Bot, Laptop, Palette, Stethoscope, GraduationCap, Rocket, Sparkles, LogOut } from 'lucide-react';
import { signOut } from '@/lib/firebaseAuth';

const SUBJECTS = [
  { key: 'math', name: 'คณิตศาสตร์', icon: <Compass size={18} />, color: '#E91E63' },
  { key: 'science', name: 'วิทยาศาสตร์และเทคโนโลยี', icon: <FlaskConical size={18} />, color: '#4CAF50' },
  { key: 'thai', name: 'ภาษาไทย', icon: <BookOpen size={18} />, color: '#FF9800' },
  { key: 'english', name: 'ภาษาอังกฤษ', icon: <Globe size={18} />, color: '#2196F3' },
  { key: 'social', name: 'สังคมศึกษาและวัฒนธรรม', icon: <BookMarked size={18} />, color: '#9C27B0' },
];

const GRADE_LEVELS = [
  { value: 'm1', label: 'ม.1' }, { value: 'm2', label: 'ม.2' }, { value: 'm3', label: 'ม.3' },
  { value: 'm4', label: 'ม.4' }, { value: 'm5', label: 'ม.5' }, { value: 'm6', label: 'ม.6' },
];

const AVATARS = [
  { id: 'pathfinder', icon: <Bot size={24} />, name: 'Bot Master', badge: 'เริ่มต้น', bg: '#864CBF', shadow: '#5B2B8E' },
  { id: 'scientist', icon: <FlaskConical size={24} />, name: 'Lab Scientist', badge: 'นักวิจัย', bg: '#26890C', shadow: '#1B5B08' },
  { id: 'coder', icon: <Laptop size={24} />, name: 'Cyber Hacker', badge: 'สายไอที', bg: '#1368CE', shadow: '#0C4288' },
  { id: 'artist', icon: <Palette size={24} />, name: 'Creative Designer', badge: 'ดีไซเนอร์', bg: '#E6007A', shadow: '#990051' },
  { id: 'captain', icon: <Compass size={24} />, name: 'Space Captain', badge: 'ผู้นำทีม', bg: '#E21B3C', shadow: '#960E25' },
  { id: 'doctor', icon: <Stethoscope size={24} />, name: 'Medical Hero', badge: 'สายสุขภาพ', bg: '#2A9D8F', shadow: '#1C675E' },
  { id: 'scholar', icon: <GraduationCap size={24} />, name: 'High Scholar', badge: 'นักเรียนทุน', bg: '#D89E00', shadow: '#8C6700' },
  { id: 'astronomer', icon: <Rocket size={24} />, name: 'Star Navigator', badge: 'นักสำรวจ', bg: '#E76F51', shadow: '#B34A31' }
];

import KahootAvatarStudio from '@/components/ui/KahootAvatarStudio';
import { useRef } from 'react';

const ALL_PRESETS = [
  'AI & เทคโนโลยี', 'เขียนโปรแกรม/โค้ดดิ้ง', 'วิทยาศาสตร์ & การทดลอง', 
  'การวางแผน & บริหารธุรกิจ', 'ศิลปะ & ออกแบบ', 'ภาษา & การสื่อสาร', 
  'ดนตรี & การแสดง', 'เกม & E-Sports', 'กีฬา & ฟิตเนส', 'การทำอาหาร',
  'กฎหมาย & ความยุติธรรม', 'การสอน & ถ่ายทอดความรู้', 'การท่องเที่ยว & การโรงแรม',
  'งานท่องจำตำราหนักๆ', 'งานที่ต้องเจอเลือด/บาดแผล/ศพ', 'การคิดคำนวณคณิตซับซ้อน', 
  'การพูดโต้ตอบคนเยอะๆ/สปีช', 'งานทำความสะอาด/ใช้แรงกายหนัก', 'งานเอกสาร/ระเบียบเป๊ะๆ', 'การทำงานคนเดียวโดดเดี่ยว'
];

const PRESET_LIKES = ALL_PRESETS;
const PRESET_DISLIKES = ALL_PRESETS;

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [characterId, setCharacterId] = useState('robot');
  const [accessoryId, setAccessoryId] = useState('none');
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [likeInput, setLikeInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');
  const [showLikeDropdown, setShowLikeDropdown] = useState(false);
  const [showDislikeDropdown, setShowDislikeDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const likeRef = useRef(null);
  const dislikeRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(p => {
        if (p) {
          setProfile(p);
          setName(p.name || '');
          setGrade(p.grade || p.gradeLevel || '');
          setCharacterId(p.characterId || 'robot');
          setAccessoryId(p.accessoryId || 'none');
          setLikes(p.likes || []);
          setDislikes(p.dislikes || []);
        }
      });
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
  }, [user]);

  const addLike = (item) => {
    if (item && !likes.includes(item)) setLikes(prev => [...prev, item]);
    setLikeInput('');
    setShowLikeDropdown(false);
  };

  const removeLike = (item) => setLikes(prev => prev.filter(i => i !== item));

  const addDislike = (item) => {
    if (item && !dislikes.includes(item)) setDislikes(prev => [...prev, item]);
    setDislikeInput('');
    setShowDislikeDropdown(false);
  };

  const removeDislike = (item) => setDislikes(prev => prev.filter(i => i !== item));

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

  const handleSaveKahootAvatar = async ({ characterId, accessoryId }) => {
    setCharacterId(characterId);
    setAccessoryId(accessoryId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('setup_characterId', characterId);
      localStorage.setItem('setup_accessoryId', accessoryId);
      window.dispatchEvent(new Event('profile_updated'));
    }
    if (!user) return;
    try {
      await updateUserProfile(user.uid, { characterId, accessoryId });
      setProfile(prev => ({ ...prev, characterId, accessoryId }));
    } catch (e) {
      console.error('Error saving avatar:', e);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { name: name.trim() });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGrade = async () => {
    setSaving(true);
    try {
      const isJunior = ['m1', 'm2', 'm3'].includes(grade);
      const educationLevel = isJunior ? 'junior' : 'senior';
      
      // คำนวณผลลัพธ์ใหม่ตามระดับชั้นที่อัปเดต
      const finalGrades = {
        math: parseFloat(profile.academics?.math || 0),
        science: parseFloat(profile.academics?.science || 0),
        thai: parseFloat(profile.academics?.thai || 0),
        english: parseFloat(profile.academics?.english || 0),
        social: parseFloat(profile.academics?.social || 0),
      };
      
      const assessmentResponses = profile.assessment?.responses || [];
      const targetPathForFiltering = profile.analysisMode === 'target-lock' && profile.targetPath ? profile.targetPath : null;
      const skillVector = calculateSkillVector(finalGrades, assessmentResponses, targetPathForFiltering);
      const pathsObject = educationLevel === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
      const rankings = matchPaths(skillVector, pathsObject);

      // If targetPath is not valid for the new education level, clear it or select the top matched path
      let newTargetPath = profile.targetPath;
      if (newTargetPath && !pathsObject[newTargetPath]) {
        newTargetPath = rankings[0]?.id || '';
      }

      // ตั้งค่าหรือรีเซ็ตประเภทแผนการเรียนเป้าหมาย
      let newTargetProgramType = profile.targetProgramType || null;
      if (educationLevel === 'junior') {
        if (!newTargetProgramType) newTargetProgramType = 'regular-program';
      } else {
        newTargetProgramType = null;
      }

      // รีเซ็ตรายการผลงานเมื่อเปลี่ยนระดับชั้นเพื่อป้องกันข้อมูลสับสน
      let newPortfolio = profile.portfolio || [];
      let newCustomActivities = profile.customActivities || [];
      if (educationLevel !== profile.educationLevel) {
        newPortfolio = [];
        newCustomActivities = [];
      }

      await updateUserProfile(user.uid, { 
        grade, 
        gradeLevel: grade, // รองรับความเข้ากันได้ย้อนหลัง
        educationLevel,
        targetPath: newTargetPath,
        targetProgramType: newTargetProgramType,
        portfolio: newPortfolio,
        customActivities: newCustomActivities,
        results: {
          skillVector,
          matchRankings: rankings
        },
        resultsUpdated: true,
        updatedAt: new Date().toISOString()
      });

      // อัปเดตข้อมูลโปรไฟล์ในสถานะท้องถิ่น
      setProfile(prev => ({
        ...prev,
        grade,
        gradeLevel: grade,
        educationLevel,
        targetPath: newTargetPath,
        targetProgramType: newTargetProgramType,
        portfolio: newPortfolio,
        customActivities: newCustomActivities,
        results: {
          skillVector,
          matchRankings: rankings
        }
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease', position: 'relative' }}>
      <button 
        onClick={() => router.push('/dashboard')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          marginBottom: '1rem',
          fontFamily: 'inherit'
        }}
      >
        ← ย้อนกลับไปยังแดชบอร์ด
      </button>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.75rem' }}>
        <User size={28} style={{ color: 'var(--primary)' }} /> ข้อมูลส่วนตัว
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        จัดการข้อมูลส่วนตัวและเกรดของคุณ
      </p>

      {saveSuccess && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(76,175,80,0.1)',
          border: '1px solid rgba(76,175,80,0.3)',
          borderRadius: '10px',
          color: 'var(--success)',
          marginBottom: '1.5rem',
          fontWeight: '600',
          animation: 'fadeIn 0.3s ease'
        }}>
          ✅ บันทึกข้อมูลเรียบร้อยแล้ว!
        </div>
      )}

      {/* Section 1: User Info & Avatar Studio */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Left Column: User Information & Account Settings */}
          <div style={{ flex: '1 1 320px' }}>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.25rem' }}>ข้อมูลผู้ใช้</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              ข้อมูลนี้จะถูกใช้ใน PathFinder เพื่อให้ Mr. Path สามารถเรียกชื่อคุณได้อย่างถูกต้อง
            </p>

            {/* Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                ชื่อผู้ใช้
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อของคุณ"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                อีเมล
              </label>
              <div style={{
                padding: '0.75rem 1rem',
                background: 'var(--primary-bg)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                border: '1px solid var(--border)'
              }}>
                {user?.email || '-'}
              </div>
            </div>

            {/* Grade Level */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                ระดับชั้น
              </label>
              <select
                className="input-field"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                style={{ width: '100%' }}
              >
                {GRADE_LEVELS.map(gl => (
                  <option key={gl.value} value={gl.value}>{gl.label}</option>
                ))}
              </select>
            </div>

            {/* Likes / Dislikes Section (แสดงเฉพาะโหมด Discovery ค้นหาตัวตนอิสระ) */}
            {profile?.analysisMode !== 'target-lock' && (
              <>
                {/* Likes / Interests Section - Sleek Dropdown */}
                <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', position: 'relative' }} ref={likeRef}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: '700' }}>
                      สิ่งที่สนใจของคุณ
                    </label>
                    {likes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setLikes([])}
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
                        title="ลบสิ่งที่สนใจทั้งหมดที่เลือกไว้"
                      >
                        ล้างสิ่งที่สนใจทั้งหมด
                      </button>
                    )}
                  </div>
                  {likes.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                      {likes.map(item => (
                        <span
                          key={item}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            lineHeight: 1.2,
                            background: 'rgba(220, 38, 38, 0.08)',
                            color: '#DC2626',
                            border: '1px solid rgba(220, 38, 38, 0.25)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>✕ {item}</span>
                          <button
                            type="button"
                            onClick={() => removeDislike(item)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#DC2626',
                              cursor: 'pointer',
                              padding: '2px',
                              margin: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              opacity: 0.7,
                              transition: 'opacity 0.15s',
                              lineHeight: 1,
                              flexShrink: 0
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                            title="ลบสิ่งที่ไม่สนใจนี้"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
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
                    placeholder="พิมพ์หรือคลิกเลือกสิ่งที่ไม่สนใจ..."
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
                      {PRESET_DISLIKES.filter(p => !dislikes.includes(p) && p.toLowerCase().includes(dislikeInput.toLowerCase())).map(preset => (
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
              </>
            )}

            {/* Save Changes Button at the bottom below Dislikes */}
            <button
              className="btn-primary"
              onClick={async () => {
                setSaving(true);
                await handleSaveName();
                await handleSaveGrade();
                if (user && profile) {
                  const updatedGrades = profile.academics || {};
                  const updatedResponses = profile.assessment?.responses || [];
                  const targetPathForFiltering = profile.analysisMode === 'target-lock' && profile.targetPath ? profile.targetPath : null;

                  // คำนวณ Skill Vector และ Match Rankings ใหม่ด้วยอัลกอริทึมท้องถิ่นแบบรวดเร็วทันที (ใช้เวลาเพียง <5ms)
                  const newSkillVector = calculateSkillVector(updatedGrades, updatedResponses, targetPathForFiltering, likes, dislikes);
                  const pathsObject = profile.educationLevel === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
                  const newRankings = matchPaths(newSkillVector, pathsObject, likes, dislikes);

                  const isCleared = likes.length === 0 && dislikes.length === 0;

                  const updatePayload = {
                    likes,
                    dislikes,
                    results: {
                      skillVector: newSkillVector,
                      matchRankings: newRankings
                    },
                    aiEvaluation: null, // รีเซ็ตแคชประเมินเก่าของ AI ออกทันทีเพื่อให้เครื่องมือคำนวณท้องถิ่นทำงานอย่างถูกต้องที่ 0ms
                    resultsUpdated: true,
                    updatedAt: new Date().toISOString()
                  };

                  if (isCleared) {
                    setProfile(prev => ({
                      ...prev,
                      likes: [],
                      dislikes: [],
                      aiEvaluation: null,
                      results: {
                        skillVector: newSkillVector,
                        matchRankings: newRankings
                      }
                    }));
                  }

                  // อัปเดตข้อมูลลง Firestore ทันทีเพื่อบันทึกเสร็จในเสี้ยววินาที (<50ms)
                  await updateUserProfile(user.uid, updatePayload);

                  // รัน AI Evaluate (Gemini LLM Classification) เบื้องหลังโดยไม่รอนำไปบล็อกหน้าจอ (Background Async)
                  fetch('/api/ai-evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      responses: updatedResponses,
                      academics: updatedGrades,
                      portfolio: profile.portfolio,
                      customActivities: profile.customActivities,
                      targetPath: profile.targetPath,
                      analysisMode: profile.analysisMode,
                      educationLevel: profile.educationLevel,
                      likes,
                      dislikes
                    })
                  }).then(res => res.json()).then(aiData => {
                    if (aiData.success && aiData.evaluation && user) {
                      const bgVector = (aiData.evaluation.skillVector && aiData.evaluation.skillVector.length === 5) ? aiData.evaluation.skillVector : newSkillVector;
                      const bgRankings = matchPaths(bgVector, pathsObject, likes, dislikes);
                      updateUserProfile(user.uid, {
                        aiEvaluation: aiData.evaluation,
                        results: {
                          skillVector: bgVector,
                          matchRankings: bgRankings
                        }
                      });
                    }
                  }).catch(() => {});
                }
                setSaving(false);
                setSaveSuccess(true);
                router.push('/dashboard');
              }}
              disabled={saving}
              style={{ width: '100%', padding: '0.75rem 2rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}
            >
              {saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>

            {/* Logout Button */}
            <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.06)',
                  color: '#EF4444',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
              >
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </div>
          </div>

          {/* Right Column: Kahoot Avatar Customization Studio */}
          <div style={{ flex: '1 1 350px' }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                <Sparkles size={14} style={{ color: 'var(--primary)' }} /> ปรับแต่งตัวละคร
              </label>
              <KahootAvatarStudio
                initialCharacterId={characterId}
                initialAccessoryId={accessoryId}
                onSave={handleSaveKahootAvatar}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 1.5: Target Lock & Analysis Mode */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 250px' }}>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.25rem' }}>โหมดการวิเคราะห์</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              ตั้งค่าหรือปรับเปลี่ยนระหว่างโหมดค้นหาตัวตนอิสระ กับโหมดประเมินความพร้อมแบบระบุคณะเป้าหมาย
            </p>
          </div>
          <div style={{ flex: '1 1 350px' }}>
            <div style={{
              background: 'var(--primary-bg)',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1.5px dashed var(--primary)',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>
                  {profile.analysisMode === 'target-lock' ? <Target size={20} /> : <Compass size={20} />}
                </span>
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                  {profile.analysisMode === 'target-lock' ? 'โหมดประเมินความพร้อม (Target Lock)' : 'โหมดค้นหาตัวตน (Discovery)'}
                </span>
              </div>
              
              {profile.analysisMode === 'target-lock' && (profile.targetPath || profile.targetPaths) && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {profile.educationLevel === 'junior' && profile.targetPaths ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '600' }}>สายการเรียนเป้าหมายที่เลือก:</div>
                      {profile.targetPaths.map((pathId, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>
                          อันดับ {idx + 1}: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                            {JUNIOR_PATHS[pathId]?.name || pathId || '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontWeight: '600' }}>
                      {profile.educationLevel === 'junior' ? 'สายการเรียนเป้าหมาย:' : 'คณะเป้าหมาย:'} <span style={{ color: 'var(--primary)' }}>
                        {(profile.educationLevel === 'junior' ? JUNIOR_PATHS[profile.targetPath] : SENIOR_PATHS[profile.targetPath])?.name || profile.targetPath}
                      </span>
                    </div>
                  )}
                  {profile.educationLevel === 'junior' && profile.targetProgramType && (
                    <div style={{ fontWeight: '600', marginTop: '0.25rem' }}>
                      ประเภทห้องเรียนเป้าหมาย: <span style={{ color: 'var(--primary)' }}>
                        {profile.targetProgramType === 'gifted-sci-math' && 'ห้องเรียนพิเศษเน้นวิทย์-คณิต-เทคโนโลยี (Gifted)'}
                        {profile.targetProgramType === 'special-language' && 'ห้องเรียนพิเศษเน้นภาษา (EP/IEP)'}
                        {profile.targetProgramType === 'regular-program' && 'ห้องเรียนปกติทั่วไป'}
                      </span>
                    </div>
                  )}
                  {profile.portfolio && (
                    <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {profile.educationLevel === 'junior' 
                        ? `สถานะการเตรียมตัวที่บันทึก: ${profile.portfolio.length} รายการ`
                        : `กิจกรรมสะสมในพอร์ต: ${profile.portfolio.length} รายการ`
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button
              className="btn-outline"
              onClick={() => router.push('/setup/grades?mode=edit')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
            >
              <Settings size={16} /> ปรับเปลี่ยนโหมดและเป้าหมาย
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Grades */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 250px' }}>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.25rem' }}>เกรดเฉลี่ยสะสม (GPAX)</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              GPAX สะสมรายกลุ่มสาระวิชา (4-5 เทอม) จะถูกแปลงเป็นเวกเตอร์ฐานรากทางวิชาการ (Academic Vector) เพื่อวิเคราะห์ช่องว่างสมรรถนะ (Gap Analysis)
            </p>
          </div>
          <div style={{ flex: '1 1 350px' }}>
            {/* Overall GPAX Badge */}
            {(() => {
              const acad = profile.academics || {};
              const vals = [acad.math, acad.science, acad.thai, acad.english, acad.social]
                .map(v => parseFloat(v))
                .filter(v => !isNaN(v));
              const hasGpax = vals.length > 0;
              const avgGpax = hasGpax ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '-';

              return (
                <div style={{
                  background: 'var(--primary-bg)',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  color: 'var(--text-primary)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      เกรดเฉลี่ยสะสมรวม (GPAX)
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem', color: 'var(--primary)' }}>
                      {avgGpax} <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>/ 4.00</span>
                    </div>
                  </div>
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)'
                  }}>
                    {vals.length} วิชาหลัก
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {SUBJECTS.map(subject => (
                <div key={subject.key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: 'var(--primary-bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: subject.color }}>
                      {subject.icon}
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{subject.name}</span>
                  </div>
                  <div style={{
                    padding: '0.4rem 1rem',
                    background: subject.color + '15',
                    borderRadius: '20px',
                    color: subject.color,
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    minWidth: '50px',
                    textAlign: 'center',
                  }}>
                    {profile.academics?.[subject.key] ?? '-'}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                className="btn-outline"
                onClick={() => router.push('/setup/grades?mode=edit')}
                style={{ 
                  padding: '0.6rem 1.5rem', 
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Edit2 size={16} /> แก้ไขเกรด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
