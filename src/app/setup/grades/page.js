'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { BookOpen, Compass, Target, FolderOpen, Sliders, ChevronDown, Trash2, X, FlaskConical, Globe, BookMarked, ArrowLeft } from 'lucide-react';
import MrPathGreeting from '@/components/setup/MrPathGreeting';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createUserProfile, getUserProfile, updateUserProfile } from '@/lib/firestore';
import { calculateSkillVector } from '@/lib/algorithms/skillVector';
import { matchPaths } from '@/lib/algorithms/cosineSimilarity';
import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';
import { SELF_ASSESSMENT_SUBJECTS } from '@/lib/constants/selfAssessmentSubjects';
import { getPortfolioCategories } from '@/lib/constants/portfolioOptions';
import { getTodayDateString } from '@/lib/algorithms/dailyAttempts';

const GRADE_OPTIONS = ['', '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4'];

const subjects = [
  { id: 'math', label: 'คณิตศาสตร์', icon: <Compass size={18} />, color: '#E91E63' },
  { id: 'science', label: 'วิทยาศาสตร์ฯ', icon: <FlaskConical size={18} />, color: '#4CAF50' },
  { id: 'thai', label: 'ภาษาไทย', icon: <BookOpen size={18} />, color: '#FF9800' },
  { id: 'english', label: 'ภาษาอังกฤษ', icon: <Globe size={18} />, color: '#2196F3' },
  { id: 'social', label: 'สังคมศึกษาฯ', icon: <BookMarked size={18} />, color: '#9C27B0' },
];

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

function GradesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [level, setLevel] = useState('junior');
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [grades, setGrades] = useState({
    math: '',
    science: '',
    thai: '',
    english: '',
    social: '',
  });

  const [analysisMode, setAnalysisMode] = useState('discovery');
  const [targetPath, setTargetPath] = useState('');
  const [targetPaths, setTargetPaths] = useState(['', '', '']);
  const [hoveredTooltip, setHoveredTooltip] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [targetProgramType, setTargetProgramType] = useState('regular-program');
  const [customList, setCustomList] = useState([]);
  const [selfAssessment, setSelfAssessment] = useState({});
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [likeInput, setLikeInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');
  const [showLikeDropdown, setShowLikeDropdown] = useState(false);
  const [showDislikeDropdown, setShowDislikeDropdown] = useState(false);
  
  const likeRef = useRef(null);
  const dislikeRef = useRef(null);

  useEffect(() => {
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
  }, []);
  const [expandedCategories, setExpandedCategories] = useState({
    academic: true,
    project: true,
    camp: false,
    volunteer: false,
    leadership: false
  });

  const [customInputs, setCustomInputs] = useState({
    academic: { text: '', level: 'school', award: 'participant', desc: '' },
    project: { text: '', level: 'school', award: 'participant', desc: '' },
    camp: { text: '', level: 'school', award: 'participant', desc: '' },
    volunteer: { text: '', level: 'school', award: 'participant', desc: '' },
    leadership: { text: '', level: 'school', award: 'participant', desc: '' },
  });

  useEffect(() => {
    const mode = searchParams.get('mode') === 'edit';
    setIsEditMode(mode);

    if (mode) {
      if (!user) return;
      const loadProfile = async () => {
        setLoading(true);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            const queryTargetPath = searchParams.get('targetPath');
            const queryAnalysisMode = searchParams.get('analysisMode');

            const currentLevel = profile.educationLevel || 'junior';
            setLevel(currentLevel);
            setGrades({
              math: profile.academics?.math?.toString() || '',
              science: profile.academics?.science?.toString() || '',
              thai: profile.academics?.thai?.toString() || '',
              english: profile.academics?.english?.toString() || '',
              social: profile.academics?.social?.toString() || '',
            });
            
            const finalAnalysisMode = queryAnalysisMode || profile.analysisMode || 'discovery';
            setAnalysisMode(finalAnalysisMode);
            
            const finalTargetPath = queryTargetPath || profile.targetPath || '';
            setTargetPath(finalTargetPath);
            
            setTargetPaths(profile.targetPaths || [finalTargetPath, '', '']);
            setPortfolio(profile.portfolio || []);
            setCustomList(profile.customActivities || []);
            setSelfAssessment(profile.selfAssessment || {});
            setTargetProgramType(profile.targetProgramType || 'regular-program');
            setLikes(profile.likes || []);
            setDislikes(profile.dislikes || []);
          }
        } catch (e) {
          console.error("Error loading profile:", e);
        } finally {
          setLoading(false);
        }
      };
      loadProfile();
    } else {
      const savedLevel = localStorage.getItem('setup_educationLevel');
      if (savedLevel) {
        setLevel(savedLevel);
      } else {
        router.push('/setup/education-level');
      }

      const savedGrades = localStorage.getItem('setup_grades');
      if (savedGrades) {
        try {
          setGrades(JSON.parse(savedGrades));
        } catch (e) {}
      }

      const savedAnalysisMode = localStorage.getItem('setup_analysisMode');
      if (savedAnalysisMode) {
        setAnalysisMode(savedAnalysisMode);
      }
      const savedTargetPath = localStorage.getItem('setup_targetPath');
      if (savedTargetPath) {
        setTargetPath(savedTargetPath);
      }
      const savedProgramType = localStorage.getItem('setup_targetProgramType');
      if (savedProgramType) {
        setTargetProgramType(savedProgramType);
      }
      const savedPortfolio = localStorage.getItem('setup_portfolio');
      if (savedPortfolio) {
        try {
          setPortfolio(JSON.parse(savedPortfolio));
        } catch (e) {}
      }
      const savedCustom = localStorage.getItem('setup_customActivities');
      if (savedCustom) {
        try {
          setCustomList(JSON.parse(savedCustom));
        } catch (e) {}
      }
      const savedSelf = localStorage.getItem('setup_selfAssessment');
      if (savedSelf) {
        try {
          setSelfAssessment(JSON.parse(savedSelf));
        } catch (e) {}
      }
      const savedLikes = localStorage.getItem('setup_likes');
      if (savedLikes) {
        try {
          setLikes(JSON.parse(savedLikes));
        } catch (e) {}
      }
      const savedDislikes = localStorage.getItem('setup_dislikes');
      if (savedDislikes) {
        try {
          setDislikes(JSON.parse(savedDislikes));
        } catch (e) {}
      }
    }
  }, [user, searchParams, router]);

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleToggleItem = (itemText, catId) => {
    const existing = portfolio.find(x => x && (x === itemText || x.text === itemText));
    if (existing) {
      setPortfolio(prev => prev.filter(x => !(x && (x === itemText || x.text === itemText))));
    } else {
      const isPosn = itemText.includes('สอวน.') || itemText.includes('โอลิมปิกวิชาการ');
      const newItem = {
        categoryId: catId,
        text: itemText,
        level: 'local',
        award: 'none',
        role: 'member',
        count: 1,
        desc: '',
        posnCamp: isPosn ? 'camp1' : null,
        posnSubject: isPosn ? 'คณิตศาสตร์' : null
      };
      setPortfolio(prev => [...prev, newItem]);
    }
  };

  const handleUpdateItem = (itemText, fields) => {
    setPortfolio(prev => prev.map(x => {
      const isMatch = x && (x === itemText || x.text === itemText);
      if (!isMatch) return x;
      const baseObj = typeof x === 'string' ? { text: itemText, level: 'local', award: 'none', role: 'member', count: 1 } : x;
      return { ...baseObj, ...fields };
    }));
  };

  const handleInputChange = (catId, field, val) => {
    setCustomInputs(prev => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        [field]: val
      }
    }));
  };

  const handleAddCustom = (catId) => {
    const input = customInputs[catId];
    if (!input || !input.text.trim()) return;

    const newItem = {
      categoryId: catId,
      text: input.text.trim(),
      level: input.level,
      award: input.award,
      desc: input.desc.trim()
    };

    setCustomList(prev => [...prev, newItem]);
    setCustomInputs(prev => ({
      ...prev,
      [catId]: { text: '', level: 'school', award: 'participant', desc: '' }
    }));
  };

  const handleRemoveCustom = (idx) => {
    setCustomList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleReset = () => {
    if (confirm("คุณต้องการล้างข้อมูลเกรดและผลงานทั้งหมดเป็นค่าว่างใช่หรือไม่?")) {
      setGrades({
        math: '0.00',
        science: '0.00',
        thai: '0.00',
        english: '0.00',
        social: '0.00',
      });
      setPortfolio([]);
      setCustomList([]);
      setSelfAssessment({});
      setTargetPaths(['', '', '']);
      setTargetProgramType('regular-program');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const finalGrades = {
        math: parseFloat(grades.math),
        science: parseFloat(grades.science),
        thai: parseFloat(grades.thai),
        english: parseFloat(grades.english),
        social: parseFloat(grades.social),
      };

      const selectedTargetPath = level === 'junior' ? targetPaths[0] : targetPath;

      if (isEditMode) {
        const profile = await getUserProfile(user.uid);
        const assessmentResponses = profile?.assessment?.responses || [];
        const targetPathForFiltering = analysisMode === 'target-lock' ? selectedTargetPath : null;
        const likesForCalc = analysisMode === 'discovery' ? likes : [];
        const dislikesForCalc = analysisMode === 'discovery' ? dislikes : [];
        const skillVector = calculateSkillVector(finalGrades, assessmentResponses, targetPathForFiltering, likesForCalc, dislikesForCalc);
        const pathsObject = level === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
        const rankings = matchPaths(skillVector, pathsObject, likesForCalc, dislikesForCalc);

        const updatePayload = {
          academics: finalGrades,
          analysisMode,
          likes: likesForCalc,
          dislikes: dislikesForCalc,
          targetPath: analysisMode === 'target-lock' ? selectedTargetPath : null,
          targetPaths: level === 'junior' && analysisMode === 'target-lock' ? targetPaths : [targetPath || '', '', ''],
          portfolio: analysisMode === 'target-lock' ? portfolio : [],
          customActivities: analysisMode === 'target-lock' ? customList : [],
          selfAssessment: analysisMode === 'target-lock' ? selfAssessment : {},
          targetProgramType: level === 'junior' && analysisMode === 'target-lock' ? targetProgramType : null,
          results: {
            skillVector: skillVector,
            matchRankings: rankings
          },
          aiEvaluation: null, // รีเซ็ตแคชประเมินเก่าของ AI ออกทันทีเพื่อให้เครื่องมือคำนวณท้องถิ่นทำงานอย่างถูกต้องที่ 0ms
          resultsUpdated: true,
          updatedAt: new Date().toISOString()
        };

        // อัปเดตข้อมูลลง Firestore ทันทีเพื่อเปลี่ยนหน้าเสี้ยววินาที (<50ms)
        await updateUserProfile(user.uid, updatePayload);

        // รัน AI Evaluation (Gemini LLM Classification) เบื้องหลังโดยไม่บล็อกการเปลี่ยนหน้า (Instant Optimistic Navigation)
        fetch('/api/ai-evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responses: assessmentResponses,
            academics: finalGrades,
            portfolio: analysisMode === 'target-lock' ? portfolio : [],
            customActivities: analysisMode === 'target-lock' ? customList : [],
            targetPath: analysisMode === 'target-lock' ? selectedTargetPath : null,
            analysisMode,
            educationLevel: level,
            likes: likesForCalc,
            dislikes: dislikesForCalc
          })
        }).then(res => res.json()).then(async (aiJson) => {
          if (aiJson.success && aiJson.evaluation) {
            await updateUserProfile(user.uid, {
              aiEvaluation: aiJson.evaluation,
              ...(aiJson.evaluation.skillVector && aiJson.evaluation.skillVector.length === 5 ? {
                'results.skillVector': aiJson.evaluation.skillVector
              } : {})
            });
          }
        }).catch(e => console.warn('Background AI re-evaluation failed:', e));

        router.push('/dashboard');
      } else {
        const likesForSave = analysisMode === 'discovery' ? likes : [];
        const dislikesForSave = analysisMode === 'discovery' ? dislikes : [];

        localStorage.setItem('setup_grades', JSON.stringify(grades));
        localStorage.setItem('setup_analysisMode', analysisMode);
        localStorage.setItem('setup_targetPath', analysisMode === 'target-lock' ? selectedTargetPath : '');
        localStorage.setItem('setup_targetPaths', JSON.stringify(level === 'junior' && analysisMode === 'target-lock' ? targetPaths : [targetPath || '', '', '']));
        localStorage.setItem('setup_portfolio', JSON.stringify(analysisMode === 'target-lock' ? portfolio : []));
        localStorage.setItem('setup_customActivities', JSON.stringify(analysisMode === 'target-lock' ? customList : []));
        localStorage.setItem('setup_selfAssessment', JSON.stringify(analysisMode === 'target-lock' ? selfAssessment : {}));
        localStorage.setItem('setup_targetProgramType', level === 'junior' && analysisMode === 'target-lock' ? targetProgramType : '');
        localStorage.setItem('setup_likes', JSON.stringify(likesForSave));
        localStorage.setItem('setup_dislikes', JSON.stringify(dislikesForSave));

        const todayDate = getTodayDateString();
        const initialAttemptsRecord = {
          date: todayDate,
          count: 1, // การตั้งค่าโปรไฟล์ประเมินเกรดแรกเริ่ม นับเป็นโควตาครั้งที่ 1 (ใช้แล้ว 1/2 เหลืออีก 1)
          attempts: [new Date().toISOString()]
        };

        const targetPathForFiltering = analysisMode === 'target-lock' ? selectedTargetPath : null;
        const likesForCalc = analysisMode === 'discovery' ? likes : [];
        const dislikesForCalc = analysisMode === 'discovery' ? dislikes : [];
        const skillVector = calculateSkillVector(finalGrades, [], targetPathForFiltering, likesForCalc, dislikesForCalc);
        const pathsObject = level === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
        const rankings = matchPaths(skillVector, pathsObject, likesForCalc, dislikesForCalc);

        const profileData = {
          name: localStorage.getItem('setup_name') || '',
          educationLevel: level,
          grade: localStorage.getItem('setup_grade') || '',
          characterId: localStorage.getItem('setup_characterId') || 'penguin',
          accessoryId: localStorage.getItem('setup_accessoryId') || 'none',
          likes: likesForSave,
          dislikes: dislikesForSave,
          academics: finalGrades,
          analysisMode,
          targetPath: analysisMode === 'target-lock' ? selectedTargetPath : null,
          targetPaths: level === 'junior' && analysisMode === 'target-lock' ? targetPaths : [targetPath || '', '', ''],
          portfolio: analysisMode === 'target-lock' ? portfolio : [],
          customActivities: analysisMode === 'target-lock' ? customList : [],
          selfAssessment: analysisMode === 'target-lock' ? selfAssessment : {},
          targetProgramType: level === 'junior' && analysisMode === 'target-lock' ? targetProgramType : null,
          dailyAssessmentAttempts: initialAttemptsRecord,
          results: {
            skillVector: skillVector,
            matchRankings: rankings
          },
          aiEvaluation: null, // รีเซ็ตแคชประเมินเก่าของ AI เพื่อให้แดชบอร์ดแสดงผลเบื้องต้นทันที (<200ms)
          resultsUpdated: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (typeof window !== 'undefined' && user?.uid) {
          try {
            localStorage.setItem(`pathfinder_daily_attempts_${user.uid}`, JSON.stringify(initialAttemptsRecord));
          } catch (e) {
            console.warn('Failed to save initial attempt to localStorage', e);
          }
        }

        // บันทึกโปรไฟล์ลง Firestore ทันทีเพื่อย้ายหน้าเสี้ยววินาที (<200ms)
        await createUserProfile(user.uid, profileData);

        // เรียกใช้ AI Evaluation API เบื้องหลังโดยไม่บล็อกการย้ายหน้า
        fetch('/api/ai-evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responses: [],
            academics: finalGrades,
            portfolio: analysisMode === 'target-lock' ? portfolio : [],
            customActivities: analysisMode === 'target-lock' ? customList : [],
            targetPath: analysisMode === 'target-lock' ? selectedTargetPath : null,
            analysisMode,
            educationLevel: level,
            likes: likesForCalc,
            dislikes: dislikesForCalc
          })
        }).then(res => res.json()).then(async (aiJson) => {
          if (aiJson.success && aiJson.evaluation) {
            await updateUserProfile(user.uid, {
              aiEvaluation: aiJson.evaluation,
              ...(aiJson.evaluation.skillVector && aiJson.evaluation.skillVector.length === 5 ? {
                'results.skillVector': aiJson.evaluation.skillVector
              } : {})
            });
          }
        }).catch(e => console.warn('Background AI evaluation failed:', e));

        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Error saving grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const allFilled = grades.math !== '' && grades.science !== '' && grades.thai !== '' && grades.english !== '' && grades.social !== '';
  const isTargetLock = analysisMode === 'target-lock';
  const isFormValid = allFilled && (!isTargetLock || (
    level === 'junior' ? targetPaths[0] !== '' && targetProgramType !== '' : targetPath !== ''
  ));
  const paths = level === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .grades-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          align-items: start;
          width: 100%;
          transition: all 0.3s ease;
        }
        @media (min-width: 992px) {
          .grades-grid.split-view {
            grid-template-columns: 4.2fr 5.8fr;
          }
        }
        .subject-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.95rem;
        }
        .custom-input-box {
          border: 2px dashed #D6D0F9;
          border-radius: 12px;
          padding: 0.85rem;
          background: #FAF9FF;
          box-shadow: 0 8px 24px rgba(124, 92, 252, 0.04);
          margin-top: 0.75rem;
        }
        .accordion-header {
          transition: all 0.2s ease;
        }
        .accordion-header:hover {
          background: var(--primary-bg) !important;
          color: var(--primary) !important;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 92, 252, 0.3);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .exam-tooltip-wrapper:hover .exam-tooltip-box {
          visibility: visible !important;
          opacity: 1 !important;
        }
        .confidence-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          transition: background 0.15s ease-in-out;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .confidence-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7C5CFC;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(124, 92, 252, 0.3);
          cursor: pointer;
          transition: transform 0.1s ease, background-color 0.1s ease;
        }
        .confidence-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          background: #6B46F7;
        }
        .confidence-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7C5CFC;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(124, 92, 252, 0.3);
          cursor: pointer;
          transition: transform 0.1s ease, background-color 0.1s ease;
        }
        .confidence-slider::-moz-range-thumb:hover {
          transform: scale(1.25);
          background: #6B46F7;
        }
      `}</style>

      <MrPathGreeting message="ใส่ GPAX สะสมรายกลุ่มวิชาหลักและผลงานของคุณได้เลยครับ หมอพร้อมวิเคราะห์เส้นทางที่ดีที่สุดให้ทันที! 🧠✨" />

      <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1rem' }}>
        <div className={`grades-grid ${isTargetLock ? 'split-view' : ''}`}>
          
          {/* LEFT PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Card 1: Grade Inputs */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '700' }}>
                <BookOpen size={20} style={{ color: 'var(--primary)' }} /> เกรดเฉลี่ยสะสมรายกลุ่มวิชา (GPAX 4-5 เทอม)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem', lineHeight: '1.4' }}>
                กรอก GPAX สะสมรายกลุ่มสาระวิชา (0.00 - 4.00) เช่น 3.50 หรือ 3.85 เพื่อใช้ในการวิเคราะห์ความพร้อม
              </p>

              {/* Real-time Overall GPAX Badge */}
              {(() => {
                const vals = [grades.math, grades.science, grades.thai, grades.english, grades.social]
                  .map(v => parseFloat(v))
                  .filter(v => !isNaN(v) && v >= 0 && v <= 4);
                const hasVals = vals.length > 0;
                const realtimeGPAX = hasVals ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null;

                return (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.08) 0%, rgba(233, 30, 99, 0.08) 100%)',
                    borderRadius: '16px',
                    padding: '1rem 1.25rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(124, 92, 252, 0.2)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                        เกรดเฉลี่ยสะสมรวม (GPAX สองตำแหน่ง)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        {realtimeGPAX ? 'คำนวณเรียลไทม์อัตโนมัติจาก 5 วิชาหลัก' : 'กรอกเกรดวิชาเพื่อคำนวณเรียลไทม์'}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: '800',
                      color: realtimeGPAX ? 'var(--primary)' : '#CBD5E1',
                      background: '#FFFFFF',
                      padding: '0.35rem 0.9rem',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(124, 92, 252, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      {realtimeGPAX ? realtimeGPAX : '0.00'}
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>/ 4.00</span>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {subjects.map((subj) => (
                  <div key={subj.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F7FAFC', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: subj.color, flexShrink: 0 }}>
                        {subj.icon}
                      </span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }} className="subject-label">
                        {subj.label}
                      </span>
                    </div>
                    <div style={{ position: 'relative', width: '110px' }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        placeholder="0.00"
                        value={grades[subj.id]}
                        onChange={(e) => setGrades({ ...grades, [subj.id]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          background: '#FFFFFF',
                          fontWeight: '600',
                          color: 'var(--primary)',
                          textAlign: 'center',
                          outline: 'none',
                          fontSize: '0.95rem'
                        }}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Analysis Mode Selection */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                <Compass size={20} style={{ color: 'var(--primary)' }} /> โหมดการวิเคราะห์ข้อมูล
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div
                  onClick={() => setAnalysisMode('discovery')}
                  style={{
                    flex: '1 1 130px',
                    padding: '1rem 0.5rem',
                    borderRadius: '14px',
                    border: `2px solid ${analysisMode === 'discovery' ? 'var(--primary)' : 'var(--border)'}`,
                    background: analysisMode === 'discovery' ? 'var(--primary-bg)' : '#FFFFFF',
                    color: analysisMode === 'discovery' ? 'var(--primary)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: analysisMode === 'discovery' ? '0 4px 12px rgba(124, 92, 252, 0.08)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.35rem' }}><Compass size={26} style={{ color: analysisMode === 'discovery' ? 'var(--primary)' : '#94A3B8' }} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>โหมดค้นหาตัวตน</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.3' }}>
                    {level === 'junior' 
                      ? 'วิเคราะห์ภาพรวมและจัดอันดับสายการเรียนที่เหมาะที่สุดให้คุณ' 
                      : 'วิเคราะห์ภาพรวมและจัดอันดับคณะที่เหมาะที่สุดให้คุณ'}
                  </div>
                </div>
                <div
                  onClick={() => setAnalysisMode('target-lock')}
                  style={{
                    flex: '1 1 130px',
                    padding: '1rem 0.5rem',
                    borderRadius: '14px',
                    border: `2px solid ${analysisMode === 'target-lock' ? 'var(--primary)' : 'var(--border)'}`,
                    background: analysisMode === 'target-lock' ? 'var(--primary-bg)' : '#FFFFFF',
                    color: analysisMode === 'target-lock' ? 'var(--primary)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: analysisMode === 'target-lock' ? '0 4px 12px rgba(124, 92, 252, 0.08)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.35rem' }}><Target size={26} style={{ color: analysisMode === 'target-lock' ? 'var(--primary)' : '#94A3B8' }} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>โหมดประเมินความพร้อม</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.3' }}>
                    {level === 'junior' 
                      ? 'ระบุสายการเรียนเป้าหมายเพื่อวิเคราะห์ความพร้อมและเปรียบเทียบเกณฑ์' 
                      : 'ระบุคณะเป้าหมายเพื่อวิเคราะห์ความพร้อมและเปรียบเทียบเกณฑ์'}
                  </div>
                </div>
              </div>
            </div>

            {/* Likes / Dislikes Section (แสดงเฉพาะโหมด Discovery ค้นหาตัวตนอิสระ) */}
            {!isTargetLock && (
              <>
                <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    ระบุสิ่งที่สนใจ / ไม่สนใจ (เพื่อเพิ่มความแม่นยำให้โหมดค้นหาตัวตน)
                  </h3>

                  {/* Likes Section */}
                  <div style={{ position: 'relative' }} ref={likeRef}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#16A34A' }}>
                        สิ่งที่สนใจ (ระบุได้หลายอย่าง)
                      </label>
                      {likes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setLikes([])}
                          style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
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
                              gap: '0.35rem',
                              padding: '0.2rem 0.65rem',
                              borderRadius: '16px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              background: 'rgba(22, 163, 74, 0.12)',
                              color: '#16A34A',
                              border: '1px solid rgba(22, 163, 74, 0.3)'
                            }}
                          >
                            ✓ {item}
                            <button
                              type="button"
                              onClick={() => setLikes(prev => prev.filter(i => i !== item))}
                              style={{ background: 'none', border: 'none', color: '#16A34A', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      className="input-field"
                      placeholder="พิมพ์หรือคลิกเลือกสิ่งที่สนใจ..."
                      value={likeInput}
                      onFocus={() => setShowLikeDropdown(true)}
                      onChange={(e) => { setLikeInput(e.target.value); setShowLikeDropdown(true); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && likeInput.trim()) {
                          e.preventDefault();
                          if (!likes.includes(likeInput.trim())) setLikes(prev => [...prev, likeInput.trim()]);
                          setLikeInput('');
                          setShowLikeDropdown(false);
                        }
                      }}
                      style={{ fontSize: '0.85rem', width: '100%' }}
                    />
                    {showLikeDropdown && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                        background: 'var(--surface, #FFF)', border: '1px solid var(--border)',
                        borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100,
                        maxHeight: '180px', overflowY: 'auto', padding: '0.4rem'
                      }}>
                        {PRESET_LIKES.filter(p => !likes.includes(p) && p.toLowerCase().includes(likeInput.toLowerCase())).map(preset => (
                          <div
                            key={preset}
                            onClick={() => {
                              if (!likes.includes(preset)) setLikes(prev => [...prev, preset]);
                              setLikeInput('');
                              setShowLikeDropdown(false);
                            }}
                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}
                          >
                            + {preset}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dislikes Section */}
                  <div style={{ position: 'relative' }} ref={dislikeRef}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#DC2626' }}>
                        สิ่งที่ไม่สนใจ (ระบุได้หลายอย่าง)
                      </label>
                      {dislikes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setDislikes([])}
                          style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                        >
                          ล้างสิ่งที่ไม่สนใจทั้งหมด
                        </button>
                      )}
                    </div>
                    {dislikes.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                        {dislikes.map(item => (
                          <span
                            key={item}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.2rem 0.65rem',
                              borderRadius: '16px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              background: 'rgba(220, 38, 38, 0.1)',
                              color: '#DC2626',
                              border: '1px solid rgba(220, 38, 38, 0.3)'
                            }}
                          >
                            ✕ {item}
                            <button
                              type="button"
                              onClick={() => setDislikes(prev => prev.filter(i => i !== item))}
                              style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                            >
                              ×
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && dislikeInput.trim()) {
                          e.preventDefault();
                          if (!dislikes.includes(dislikeInput.trim())) setDislikes(prev => [...prev, dislikeInput.trim()]);
                          setDislikeInput('');
                          setShowDislikeDropdown(false);
                        }
                      }}
                      style={{ fontSize: '0.85rem', width: '100%' }}
                    />
                    {showDislikeDropdown && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                        background: 'var(--surface, #FFF)', border: '1px solid var(--border)',
                        borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100,
                        maxHeight: '180px', overflowY: 'auto', padding: '0.4rem'
                      }}>
                        {PRESET_DISLIKES.filter(p => !dislikes.includes(p) && p.toLowerCase().includes(dislikeInput.toLowerCase())).map(preset => (
                          <div
                            key={preset}
                            onClick={() => {
                              if (!dislikes.includes(preset)) setDislikes(prev => [...prev, preset]);
                              setDislikeInput('');
                              setShowDislikeDropdown(false);
                            }}
                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}
                          >
                            + {preset}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', width: '100%' }}>
                  <button
                    type="button"
                    onClick={() => router.push('/setup/profile')}
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
                    type="submit"
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: '0.85rem',
                      fontSize: '1rem',
                      fontWeight: '700',
                      borderRadius: '14px',
                      opacity: isFormValid ? 1 : 0.6,
                      cursor: isFormValid ? 'pointer' : 'not-allowed',
                      boxShadow: '0 4px 12px rgba(124, 92, 252, 0.2)',
                      transition: 'all 0.2s ease'
                    }}
                    disabled={loading || !isFormValid}
                  >
                    {loading ? 'กำลังบันทึกข้อมูล...' : isEditMode ? 'บันทึก' : 'ถัดไป →'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* RIGHT PANEL (เฉพาะโหมด Target Lock) */}
          {isTargetLock && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Card 3: Target Path */}
              <div className="card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  <Target size={20} style={{ color: 'var(--primary)' }} />
                  {level === 'junior' ? 'เลือกสายการเรียนเป้าหมาย (ลำดับ 1 - 3)' : 'เลือกคณะเป้าหมาย'}
                </h3>
                
                {level === 'junior' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>อันดับที่ {idx + 1}:</span>
                        <select
                          value={targetPaths[idx] || ''}
                          onChange={(e) => {
                            const newPaths = [...targetPaths];
                            newPaths[idx] = e.target.value;
                            setTargetPaths(newPaths);
                            if (idx === 0) {
                              setTargetPath(e.target.value);
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border)',
                            background: '#FFFFFF',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: targetPaths[idx] ? 'var(--text-primary)' : 'var(--text-secondary)',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                          required={idx === 0}
                        >
                          <option value="">
                            -- เลือกอันดับที่ {idx + 1} --
                          </option>
                          {Object.values(paths).map((path) => (
                            <option key={path.id} value={path.id} disabled={targetPaths.includes(path.id) && targetPaths[idx] !== path.id}>
                              {path.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                ) : (
                  <select
                    value={targetPath}
                    onChange={(e) => {
                      setTargetPath(e.target.value);
                      setTargetPaths([e.target.value, '', '']);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: targetPath ? 'var(--text-primary)' : 'var(--text-secondary)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    required
                  >
                    <option value="">
                      -- เลือกคณะเป้าหมาย --
                    </option>
                    {Object.values(paths).map((path) => (
                      <option key={path.id} value={path.id}>{path.name}</option>
                    ))}
                  </select>
                )}
              </div>

              
              {/* Card 4: Portfolio / Exam Prep Checklist */}
              {targetPath && (
                level === 'junior' ? (
                  <div className="card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      <FolderOpen size={20} style={{ color: 'var(--primary)' }} /> บันทึกสถานะการเตรียมตัวสอบเข้า ม.4 (Exam Prep Status)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.4', marginTop: 0 }}>
                      ข้อมูลนี้จะช่วยให้ Mr. Path ทำการประเมินความพร้อมและแนะนำแผนการเตรียมตัวสอบ ม.4 ได้ตรงจุดที่สุดครับ
                    </p>

                    {/* หมวดที่ 1: สถานะความพร้อมของเนื้อหา */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                        หมวดที่ 1: สถานะความพร้อมของเนื้อหา (Academic Content Readiness)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                          'เรียนเก็บเนื้อหาบทเรียน ม.ต้น (ม.1-ม.3) ครบถ้วนแล้ว',
                          'เริ่มเรียนเนื้อหาล่วงหน้าของ ม.ปลาย บ้างแล้ว',
                          'อยู่ในชั่วโมงตะลุยโจทย์ข้อสอบเก่า / ข้อสอบเข้า ม.4',
                          'ผ่านคอร์สติวเข้มข้นเฉพาะสายวิชา (เช่น ติวเข้มคณิต-วิทย์ หรือคอร์สเตรียมโดม)'
                        ].map((item) => {
                          const isChecked = portfolio.some(x => x === item || (x && x.text === item));
                          return (
                            <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: isChecked ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: isChecked ? '600' : 'normal' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleItem(item, 'content-readiness')}
                                style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                              />
                              {item}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* หมวดที่ 2: ประสบการณ์สนามสอบจำลอง */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                        หมวดที่ 2: ประสบการณ์สนามสอบจำลอง (Mock Exam & Pre-Test)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                          'เคยเข้าร่วมการทดสอบ Pre-Test ของโรงเรียนต่าง ๆ (เช่น Pre-Test ม.4 โรงเรียนสตรีพัทลุง หรือโรงเรียนดัง)',
                          'เคยแข่งขันทักษะวิชาการระดับ ม.ต้น (เช่น งานศิลปหัตถกรรมนักเรียน)',
                          'เคยสอบแข่งขันวัดระดับระดับ ม.ต้น (เช่น สสวท. ม.ต้น, ASMO, TEDET)'
                        ].map((item) => {
                          const isChecked = portfolio.some(x => x === item || (x && x.text === item));
                          return (
                            <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: isChecked ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: isChecked ? '600' : 'normal' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleItem(item, 'mock-exam')}
                                style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                              />
                              {item}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* หมวดที่ 3: ประเภทห้องเรียนเป้าหมาย */}
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        หมวดที่ 3: ประเภทห้องเรียนเป้าหมาย (Target Program Type)
                      </h4>
                      <select
                        value={targetProgramType}
                        onChange={(e) => setTargetProgramType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '12px',
                          border: '1px solid var(--border)',
                          background: '#FFFFFF',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: targetProgramType ? 'var(--text-primary)' : 'var(--text-secondary)',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                        required
                      >
                        <option value="">-- เลือกประเภทห้องเรียนเป้าหมาย --</option>
                        <option value="gifted-sci-math">ห้องเรียนพิเศษเน้นวิทย์-คณิต-เทคโนโลยี (เช่น Gifted / SMP / ESC)</option>
                        <option value="special-language">ห้องเรียนพิเศษเน้นภาษา (เช่น EP / IEP)</option>
                        <option value="regular-program">ห้องเรียนปกติทั่วไป (วิทย์-คณิต ปกติ, ศิลป์-คำนวณ, ศิลป์-ภาษา)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      <FolderOpen size={20} style={{ color: 'var(--primary)' }} /> กิจกรรมและพอร์ตผลงาน (เลือกข้อที่ตรง)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.4', marginTop: 0 }}>
                      ข้อมูลนี้จะช่วยให้ Mr. Path ทำการ Gap Analysis เพื่อแนะนำสิ่งที่ต้องทำเพิ่มเติมได้อย่างแม่นยำยิ่งขึ้นครับ
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {getPortfolioCategories(targetPath).map((cat) => {
                        const isExpanded = expandedCategories[cat.id];
                        return (
                          <div key={cat.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF' }}>
                            <div
                              onClick={() => toggleCategory(cat.id)}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem 1rem',
                                background: '#FFFFFF',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                color: isExpanded ? 'var(--primary)' : 'var(--text-primary)',
                                userSelect: 'none',
                                borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                                transition: 'all 0.2s ease'
                              }}
                              className="accordion-header"
                            >
                              <span>{cat.label}</span>
                              <ChevronDown 
                                size={18} 
                                style={{ 
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                                  transition: 'transform 0.25s ease', 
                                  color: isExpanded ? 'var(--primary)' : '#94A3B8' 
                                }} 
                              />
                            </div>

                            {isExpanded && (
                              <div style={{ padding: '1rem', background: '#FAFAFC', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {/* Standard checkboxes */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  {cat.items.map((item) => {
                                    const existingItem = portfolio.find(x => x && (x === item || x.text === item));
                                    const isChecked = !!existingItem;
                                    const isPosn = item.includes('สอวน.') || item.includes('โอลิมปิกวิชาการ');
                                    const isComp = cat.id === 'academic' || cat.id === 'project';
                                    
                                    const itemObj = typeof existingItem === 'object' ? existingItem : {
                                      text: item,
                                      level: 'local',
                                      award: 'none',
                                      role: 'member',
                                      count: 1,
                                      desc: '',
                                      posnCamp: isPosn ? 'camp1' : null,
                                      posnSubject: isPosn ? 'คณิตศาสตร์' : null
                                    };

                                    return (
                                      <div key={item} style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: '0.5rem', 
                                        padding: '0.65rem',
                                        background: isChecked ? '#F1EEFF' : 'transparent',
                                        border: isChecked ? '1px solid #C0B6FC' : '1px solid transparent',
                                        borderRadius: '12px',
                                        transition: 'all 0.25s ease'
                                      }}>
                                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: isChecked ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: isChecked ? '600' : 'normal' }}>
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleToggleItem(item, cat.id)}
                                            style={{ marginTop: '0.15rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                          />
                                          <span style={{ lineHeight: '1.3' }}>{item}</span>
                                        </label>

                                        {/* Inline Config Panel */}
                                        {isChecked && (cat.id === 'academic' || cat.id === 'project') && (
                                          <div style={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            gap: '0.5rem', 
                                            padding: '0.75rem', 
                                            background: '#FFFFFF', 
                                            borderRadius: '8px', 
                                            border: '1px solid #E2E8F0',
                                            marginLeft: '1.25rem',
                                            animation: 'fadeIn 0.2s ease-in-out'
                                          }}>
                                            {isPosn ? (
                                              /* POSN Specific config */
                                              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>ระดับค่าย:</span>
                                                <select
                                                  value={itemObj.posnCamp || 'camp1'}
                                                  onChange={(e) => handleUpdateItem(item, { posnCamp: e.target.value })}
                                                  style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                                                >
                                                  <option value="camp1">ค่าย 1</option>
                                                  <option value="camp2">ค่าย 2</option>
                                                  <option value="national">ค่าย 3 / ผู้แทนศูนย์ฯ</option>
                                                  <option value="team">ผู้แทนประเทศ</option>
                                                </select>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-primary)', marginLeft: '0.3rem' }}>สาขา:</span>
                                                <select
                                                  value={itemObj.posnSubject || 'คณิตศาสตร์'}
                                                  onChange={(e) => handleUpdateItem(item, { posnSubject: e.target.value })}
                                                  style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                                                >
                                                  <option value="คณิตศาสตร์">คณิตศาสตร์</option>
                                                  <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
                                                  <option value="เคมี">เคมี</option>
                                                  <option value="ชีววิทยา">ชีววิทยา</option>
                                                  <option value="ฟิสิกส์">ฟิสิกส์</option>
                                                  <option value="ดาราศาสตร์">ดาราศาสตร์</option>
                                                  <option value="ภูมิศาสตร์">ภูมิศาสตร์</option>
                                                </select>
                                              </div>
                                            ) : item === 'การสอบวัดระดับทักษะวิชาการระดับชาติหรือนานาชาติ' ? (
                                              /* 3. การสอบวัดระดับทักษะวิชาการระดับชาติหรือนานาชาติ Specific config */
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {/* Line 1: ระดับ */}
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', position: 'relative', flexWrap: 'wrap' }}>
                                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>ระดับ:</span>
                                                  
                                                  {/* Tooltip Hover for ระดับ */}
                                                  <div 
                                                    style={{ position: 'relative', display: 'inline-block' }}
                                                    onMouseEnter={() => setHoveredTooltip(item)}
                                                    onMouseLeave={() => setHoveredTooltip(null)}
                                                  >
                                                    <span style={{
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      width: '16px',
                                                      height: '16px',
                                                      borderRadius: '50%',
                                                      background: 'var(--primary)',
                                                      color: 'white',
                                                      fontSize: '0.65rem',
                                                      fontWeight: 'bold',
                                                      cursor: 'pointer',
                                                      marginLeft: '4px',
                                                      marginRight: '8px'
                                                    }}>?</span>
                                                    {hoveredTooltip === item && (
                                                      <div style={{
                                                        position: 'absolute',
                                                        bottom: '125%',
                                                        left: '0px',
                                                        width: '320px',
                                                        backgroundColor: '#1E1E24',
                                                        color: '#FFF',
                                                        textAlign: 'left',
                                                        borderRadius: '8px',
                                                        padding: '0.75rem',
                                                        zIndex: 100,
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                        fontSize: '0.75rem',
                                                        lineHeight: '1.4',
                                                        whiteSpace: 'normal'
                                                      }}>
                                                        <div style={{ marginBottom: '4px' }}><strong>ระดับชาติ (National Test)</strong> — สำหรับข้อสอบในประเทศ เช่น TGAT, TPAT, A-Level, NETSAT</div>
                                                        <div><strong>ระดับนานาชาติ (International Test)</strong> — สำหรับข้อสอบมาตรฐานสากล เช่น SAT, AP, IB, IELTS, TOEFL</div>
                                                      </div>
                                                    )}
                                                  </div>

                                                  <select
                                                    value={itemObj.level || 'national'}
                                                    onChange={(e) => handleUpdateItem(item, { level: e.target.value })}
                                                    style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                                                  >
                                                    <option value="national">ระดับชาติ (National Standardized Test)</option>
                                                    <option value="international">ระดับนานาชาติ (International Standardized Test)</option>
                                                  </select>
                                                </div>

                                                {/* Line 2: ผลการสอบ / ระดับคะแนน */}
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>ผลการสอบ / ระดับคะแนน:</span>
                                                  <select
                                                    value={itemObj.award || 'none'}
                                                    onChange={(e) => handleUpdateItem(item, { award: e.target.value })}
                                                    style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                                                  >
                                                    <option value="winner">คะแนนระดับสูงมาก / ดีเยี่ยม (Excellent)</option>
                                                    <option value="runnerup1">คะแนนระดับสูง / ดี (Good)</option>
                                                    <option value="none">ผ่านเกณฑ์มาตรฐาน / ผ่านระดับพื้นฐาน</option>
                                                    <option value="below_standard">ต่ำกว่าเกณฑ์มาตรฐาน / ยังไม่ผ่านเกณฑ์ (Below Standard)</option>
                                                  </select>
                                                </div>

                                                {/* Line 3: Description */}
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                  <input
                                                    type="text"
                                                    placeholder="ระบุชื่อข้อสอบและคะแนนที่ได้ (เช่น SAT Math ได้ 780, AP Physics ได้ระดับ 5)"
                                                    value={itemObj.desc || ''}
                                                    onChange={(e) => handleUpdateItem(item, { desc: e.target.value })}
                                                    style={{ flex: 1, padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', outline: 'none' }}
                                                  />
                                                </div>
                                              </div>
                                            ) : item === 'การสอบชิงทุนการศึกษา' ? (
                                              /* 4. การสอบชิงทุนการศึกษา Specific config */
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {/* Line 1: ระดับ */}
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>ระดับ:</span>
                                                  <select
                                                    value={itemObj.level || 'local'}
                                                    onChange={(e) => handleUpdateItem(item, { level: e.target.value })}
                                                    style={{ width: '100%', maxWidth: '100%', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                                                  >
                                                    <option value="local">ทุนภายในสถาบัน / โรงเรียน / มหาวิทยาลัย (เช่น ทุนเรียนดีของโรงเรียน, ทุนยกเว้นค่าเทอมของคณะ)</option>
                                                    <option value="national">ทุนองค์กรภายในประเทศ / ทุนรัฐบาลไทย (เช่น ทุน พสวท., ทุน ก.พ., ทุน สวทช., ทุนธนาคารต่างๆ)</option>
                                                    <option value="international">ทุนรัฐบาลต่างประเทศ / ทุนนานาชาติ (เช่น ทุนรัฐบาลญี่ปุ่น Monbukagakusho, ทุนรัฐบาลอังกฤษ Chevening, ทุน Erasmus)</option>
                                                  </select>
                                                </div>

                                                {/* Line 2: ผลการสอบ */}
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>ผลการสอบ:</span>
                                                  <select
                                                    value={itemObj.award || 'none'}
                                                    onChange={(e) => handleUpdateItem(item, { award: e.target.value })}
                                                    style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                                                  >
                                                    <option value="winner">ผ่านการคัดเลือก (ได้รับทุน)</option>
                                                    <option value="runnerup1">ตัวสำรอง</option>
                                                    <option value="none">เข้าร่วมสอบ</option>
                                                  </select>
                                                </div>

                                                {/* Line 3: Description */}
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                  <input
                                                    type="text"
                                                    placeholder="ระบุชื่อทุนและรายละเอียดเพิ่มเติม..."
                                                    value={itemObj.desc || ''}
                                                    onChange={(e) => handleUpdateItem(item, { desc: e.target.value })}
                                                    style={{ flex: 1, padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', outline: 'none' }}
                                                  />
                                                </div>
                                              </div>
                                            ) : ((cat.id === 'project' && (targetPath === 'architecture' || targetPath === 'fine-arts' || targetPath === 'fine-applied-arts' || targetPath === 'music-performing-arts')) || cat.id === 'camp' || cat.id === 'volunteer' || cat.id === 'leadership') ? (
                                              /* Simple activity config (no level and award) */
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                  <input
                                                    type="text"
                                                    placeholder="รายละเอียดกิจกรรมสั้นๆ..."
                                                    value={itemObj.desc || ''}
                                                    onChange={(e) => handleUpdateItem(item, { desc: e.target.value })}
                                                    style={{ flex: 1, padding: '0.2rem 0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', outline: 'none' }}
                                                  />
                                                </div>
                                              </div>
                                            ) : (
                                              /* Standard activity config */
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>ระดับ:</span>
                                                  <select
                                                    value={itemObj.level || 'local'}
                                                    onChange={(e) => handleUpdateItem(item, { level: e.target.value })}
                                                    style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                                                  >
                                                    <option value="international">นานาชาติ</option>
                                                    <option value="national">ระดับชาติ</option>
                                                    <option value="regional">ระดับภาค</option>
                                                    <option value="local">โรงเรียน/ทั่วไป</option>
                                                  </select>

                                                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-primary)', marginLeft: '0.3rem' }}>รางวัล:</span>
                                                  <select
                                                    value={itemObj.award || 'none'}
                                                    onChange={(e) => handleUpdateItem(item, { award: e.target.value })}
                                                    style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                                                  >
                                                    <option value="none">เข้าร่วม</option>
                                                    <option value="honorable">รางวัลชมเชย</option>
                                                    <option value="runnerup2">รองชนะเลิศอันดับ 2</option>
                                                    <option value="runnerup1">รองชนะเลิศอันดับ 1</option>
                                                    <option value="winner">ชนะเลิศ/รางวัลยอดเยี่ยม</option>
                                                  </select>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                  <input
                                                    type="text"
                                                    placeholder="รายละเอียดกิจกรรมสั้นๆ..."
                                                    value={itemObj.desc || ''}
                                                    onChange={(e) => handleUpdateItem(item, { desc: e.target.value })}
                                                    style={{ flex: 1, padding: '0.2rem 0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', outline: 'none' }}
                                                  />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Custom input box */}
                                <div className="custom-input-box">
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                      <input
                                        type="text"
                                        value={customInputs[cat.id]?.text || ''}
                                        onChange={(e) => handleInputChange(cat.id, 'text', e.target.value)}
                                        placeholder="พิมพ์ชื่อผลงาน/หัวข้อเพิ่มเติม..."
                                        style={{
                                          flex: '2 1 180px',
                                          padding: '0.45rem 0.65rem',
                                          borderRadius: '8px',
                                          border: '1px solid var(--border)',
                                          fontSize: '0.75rem',
                                          outline: 'none',
                                        }}
                                      />
                                      {(cat.id === 'academic' || (cat.id === 'project' && targetPath !== 'architecture' && targetPath !== 'fine-arts' && targetPath !== 'fine-applied-arts' && targetPath !== 'music-performing-arts')) && (
                                        <>
                                          <select
                                            value={customInputs[cat.id]?.level || 'school'}
                                            onChange={(e) => handleInputChange(cat.id, 'level', e.target.value)}
                                            style={{
                                              flex: '1 1 100px',
                                              padding: '0.45rem 0.65rem',
                                              borderRadius: '8px',
                                              border: '1px solid var(--border)',
                                              background: '#FFFFFF',
                                              fontSize: '0.75rem',
                                              outline: 'none',
                                              cursor: 'pointer',
                                            }}
                                          >
                                            <option value="none">-</option>
                                            <option value="international">นานาชาติ</option>
                                            <option value="national">ระดับชาติ</option>
                                            <option value="regional">ระดับภาค</option>
                                            <option value="school">ทั่วไป/โรงเรียน</option>
                                          </select>
                                          <select
                                            value={customInputs[cat.id]?.award || 'participant'}
                                            onChange={(e) => handleInputChange(cat.id, 'award', e.target.value)}
                                            style={{
                                              flex: '1 1 120px',
                                              padding: '0.45rem 0.65rem',
                                              borderRadius: '8px',
                                              border: '1px solid var(--border)',
                                              background: '#FFFFFF',
                                              fontSize: '0.75rem',
                                              outline: 'none',
                                              cursor: 'pointer',
                                            }}
                                          >
                                            <option value="none">-</option>
                                            <option value="winner">ชนะเลิศ/เหรียญทอง</option>
                                            <option value="runnerup1">รองชนะเลิศ 1/เงิน</option>
                                            <option value="runnerup2">รองชนะเลิศ 2/ทองแดง</option>
                                            <option value="honorable">ชมเชย</option>
                                            <option value="participant">เข้าร่วม</option>
                                          </select>
                                        </>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                      <input
                                        type="text"
                                        placeholder="รายละเอียด/ชื่อกิจกรรมสั้นๆ..."
                                        value={customInputs[cat.id]?.desc || ''}
                                        onChange={(e) => handleInputChange(cat.id, 'desc', e.target.value)}
                                        style={{
                                          flex: '1 1 200px',
                                          padding: '0.45rem 0.65rem',
                                          borderRadius: '8px',
                                          border: '1px solid var(--border)',
                                          fontSize: '0.75rem',
                                          outline: 'none',
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleAddCustom(cat.id)}
                                        style={{
                                          flex: '1 1 60px',
                                          padding: '0.45rem 1rem',
                                          borderRadius: '8px',
                                          border: 'none',
                                          background: 'var(--primary)',
                                          color: 'white',
                                          fontSize: '0.75rem',
                                          fontWeight: '700',
                                          cursor: 'pointer',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        เพิ่ม
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Custom items list under this category */}
                                {customList.filter(item => item.categoryId === cat.id).length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                                    {customList.map((item, idx) => {
                                      if (item.categoryId !== cat.id) return null;
                                      
                                      let lvlLabel = '';
                                      let lvlColor = '';
                                      let lvlBg = '';
                                      if (item.text === 'การสอบวัดระดับทักษะวิชาการระดับชาติหรือนานาชาติ') {
                                        if (item.level === 'international') { lvlLabel = 'นานาชาติ'; lvlColor = '#3182CE'; lvlBg = '#EBF8FF'; }
                                        else { lvlLabel = 'ระดับชาติ'; lvlColor = '#DD6B20'; lvlBg = '#FFFAF0'; }
                                      } else if (item.text === 'การสอบชิงทุนการศึกษา') {
                                        if (item.level === 'local') { lvlLabel = 'ภายในสถาบัน'; lvlColor = '#718096'; lvlBg = '#EDF2F7'; }
                                        else if (item.level === 'national') { lvlLabel = 'ทุนรัฐบาลไทย'; lvlColor = '#DD6B20'; lvlBg = '#FFFAF0'; }
                                        else { lvlLabel = 'ทุนต่างประเทศ'; lvlColor = '#3182CE'; lvlBg = '#EBF8FF'; }
                                      } else {
                                        if (item.level === 'none') { lvlLabel = ''; }
                                        else if (item.level === 'international') { lvlLabel = 'นานาชาติ'; lvlColor = '#3182CE'; lvlBg = '#EBF8FF'; }
                                        else if (item.level === 'national') { lvlLabel = 'ระดับชาติ'; lvlColor = '#DD6B20'; lvlBg = '#FFFAF0'; }
                                        else if (item.level === 'regional') { lvlLabel = 'ระดับภาค'; lvlColor = '#805AD5'; lvlBg = '#FAF5FF'; }
                                        else if (item.level === 'school') { lvlLabel = 'ทั่วไป'; lvlColor = '#718096'; lvlBg = '#EDF2F7'; }
                                        else { lvlLabel = ''; }
                                      }

                                      let awdLabel = '';
                                      let awdColor = '';
                                      let awdBg = '';
                                      const isComp = cat.id === 'academic' || cat.id === 'project';
                                      if (item.text === 'การสอบวัดระดับทักษะวิชาการระดับชาติหรือนานาชาติ') {
                                        if (item.award === 'winner') { awdLabel = 'ดีเยี่ยม (Excellent)'; awdColor = '#D69E2E'; awdBg = '#FEFCBF'; }
                                        else if (item.award === 'runnerup1') { awdLabel = 'ดี (Good)'; awdColor = '#4A5568'; awdBg = '#E2E8F0'; }
                                        else if (item.award === 'below_standard') { awdLabel = 'ต่ำกว่าเกณฑ์'; awdColor = '#E53E3E'; awdBg = '#FED7D7'; }
                                        else { awdLabel = 'ผ่านเกณฑ์มาตรฐาน'; awdColor = '#A0AEC0'; awdBg = '#F7FAFC'; }
                                      } else if (item.text === 'การสอบชิงทุนการศึกษา') {
                                        if (item.award === 'winner') { awdLabel = 'ได้รับทุน'; awdColor = '#D69E2E'; awdBg = '#FEFCBF'; }
                                        else if (item.award === 'runnerup1') { awdLabel = 'ตัวสำรอง'; awdColor = '#4A5568'; awdBg = '#E2E8F0'; }
                                        else { awdLabel = 'เข้าร่วมสอบ'; awdColor = '#A0AEC0'; awdBg = '#F7FAFC'; }
                                      } else {
                                        if (item.award === 'winner') { 
                                          awdLabel = isComp ? 'ชนะเลิศ' : 'แกนนำหลัก';
                                          awdColor = '#D69E2E'; 
                                          awdBg = '#FEFCBF'; 
                                        }
                                        else if (item.award === 'runnerup1') { 
                                          awdLabel = isComp ? 'รองชนะเลิศ 1' : 'รองแกนนำ';
                                          awdColor = '#4A5568'; 
                                          awdBg = '#E2E8F0'; 
                                        }
                                        else if (item.award === 'runnerup2') { 
                                          awdLabel = isComp ? 'รองชนะเลิศ 2' : 'คณะทำงาน';
                                          awdColor = '#718096'; 
                                          awdBg = '#EDF2F7'; 
                                        }
                                        else if (item.award === 'honorable') { 
                                          awdLabel = isComp ? 'ชมเชย' : 'ผู้ประสานงาน';
                                          awdColor = '#319795'; 
                                          awdBg = '#E6FFFA'; 
                                        }
                                        else { 
                                          awdLabel = isComp ? 'เข้าร่วม' : 'สมาชิกทั่วไป';
                                          awdColor = '#A0AEC0'; 
                                          awdBg = '#F7FAFC'; 
                                        }
                                      }

                                      return (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.75rem', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            {lvlLabel && (
                                              <span style={{ padding: '0.1rem 0.3rem', borderRadius: '4px', background: lvlBg, color: lvlColor, fontWeight: 'bold', fontSize: '0.65rem' }}>
                                                {lvlLabel}
                                              </span>
                                            )}
                                            {awdLabel && (
                                              <span style={{ padding: '0.1rem 0.3rem', borderRadius: '4px', background: awdBg, color: awdColor, fontWeight: 'bold', fontSize: '0.65rem' }}>
                                                {awdLabel}
                                              </span>
                                            )}
                                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.text}</span>
                                            {item.desc && (
                                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontStyle: 'italic', marginLeft: '0.2rem' }}>
                                                ({item.desc})
                                              </span>
                                            )}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveCustom(idx)}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#E53E3E'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#A0AEC0'}
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
{/* Card 5: Self-Assessment */}
              {targetPath && SELF_ASSESSMENT_SUBJECTS[targetPath] && (
                <div className="card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    <Sliders size={20} style={{ color: 'var(--primary)' }} /> ประเมินความมั่นใจวิชาเฉพาะทาง
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.4', marginTop: 0 }}>
                    เลื่อนปรับความมั่นใจ/ความรู้ของคุณในแต่ละหัวข้อหลัก (ระดับ 0 - 5 คะแนน)
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#F9F9FB', padding: '1rem', borderRadius: '16px' }}>
                    {SELF_ASSESSMENT_SUBJECTS[targetPath].map((sub) => {
                      const val = selfAssessment[sub.id] ?? 0;
                      return (
                        <div key={sub.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                              {sub.label}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>
                              {val} / 5
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            value={val}
                            onChange={(e) => setSelfAssessment({ ...selfAssessment, [sub.id]: parseInt(e.target.value) })}
                            className="confidence-slider"
                            style={{
                              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${val * 20}%, #E2E8F0 ${val * 20}%, #E2E8F0 100%)`
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit and Reset buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditMode) {
                      router.push('/dashboard/profile');
                    } else {
                      router.push('/setup/profile');
                    }
                  }}
                  style={{
                    flex: '1 1 25%',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    borderRadius: '14px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                >
                  ← ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    flex: '1 1 25%',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    borderRadius: '14px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  disabled={loading}
                >
                  คืนค่าเดิม
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: '1 1 50%',
                    padding: '0.85rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    borderRadius: '14px',
                    opacity: isFormValid ? 1 : 0.6,
                    cursor: isFormValid ? 'pointer' : 'not-allowed',
                    boxShadow: '0 4px 12px rgba(124, 92, 252, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                  disabled={loading || !isFormValid}
                >
                  {loading ? 'กำลังบันทึกข้อมูล...' : isEditMode ? 'บันทึก' : 'ถัดไป →'}
                </button>
              </div>
            </div>
          )}

        </div>
      </form>
    </div>
  );
}

export default function GradesStep() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>กำลังโหลด...</p>
      </div>
    }>
      <GradesContent />
    </Suspense>
  );
}