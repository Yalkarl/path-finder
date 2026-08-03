'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import { calculateSkillVector } from '@/lib/algorithms/skillVector';
import { matchPaths } from '@/lib/algorithms/cosineSimilarity';
import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';
import { ASSESSMENT_BANK, STAGE_THEMES } from '@/lib/constants/assessmentBank';
import { TARGET_CLUSTERS, TARGETED_STAGE_THEMES, TARGETED_ASSESSMENT_BANK } from '@/lib/constants/targetedAssessment';
import { MrPath } from '@/components/ui/mr-path';
import { useRouter } from 'next/navigation';
import AssessmentMusicPlayer from '@/components/ui/AssessmentMusicPlayer';
import { 
  Sparkles, Star, Award, CheckCircle, RotateCcw, Target, Info, ArrowLeft,
  Home, Gamepad2, GraduationCap, Users, Puzzle, Cpu, Palette, MessageSquare, FlaskConical, Crown, Globe, Compass,
  Microscope, Scale, Dna, Terminal, Clock, Lightbulb, Leaf, LineChart, TrendingUp, Coins, Plane, Film
} from 'lucide-react';

const OPTION_COLORS = [
  { bg: 'rgba(76,175,80,0.08)', border: 'rgba(76,175,80,0.3)', icon: '🟢', hoverBg: 'rgba(76,175,80,0.15)' },
  { bg: 'rgba(124,92,252,0.08)', border: 'rgba(124,92,252,0.3)', icon: '🟣', hoverBg: 'rgba(124,92,252,0.15)' },
  { bg: 'rgba(255,152,0,0.08)', border: 'rgba(255,152,0,0.3)', icon: '🟠', hoverBg: 'rgba(255,152,0,0.15)' },
  { bg: 'rgba(33,150,243,0.08)', border: 'rgba(33,150,243,0.3)', icon: '🔵', hoverBg: 'rgba(33,150,243,0.15)' },
];

const STAGE_ICON_MAP = {
  Home, Gamepad2, GraduationCap, Users, Puzzle, Cpu, Palette, MessageSquare, FlaskConical, Crown, Globe, Compass,
  Microscope, Scale, Dna, Terminal, Clock, Lightbulb, Leaf, LineChart, TrendingUp, Coins, Plane, Film, Sparkles
};

function renderStageIcon(iconName, props = {}) {
  const IconComponent = STAGE_ICON_MAP[iconName] || Compass;
  return <IconComponent {...props} />;
}

const migrateResponses = (p) => {
  const responses = p.assessment?.responses || [];
  const usedIds = p.usedQuestionIds || [];
  const needsMigration = responses.length > 0 && responses.some(r => r && r.questionId === undefined);
  if (!needsMigration) return responses;
  
  return responses.map((resp, idx) => {
    if (resp && resp.questionId !== undefined) return resp;
    const questionId = usedIds[idx] || `UNKNOWN_Q_${idx}`;
    return {
      questionId,
      weights: resp.weights || resp
    };
  });
};

export default function DashboardAssessmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  
  const [view, setView] = useState('stages'); // 'stages', 'quiz', 'saving'
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  
  const [completedStages, setCompletedStages] = useState(new Set());
  const [retakeConfirmId, setRetakeConfirmId] = useState(null);
  const [resetting, setResetting] = useState(false);

  const handleResetAssessment = async () => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตคำตอบแบบทดสอบทั้งหมด? การรีเซ็ตนี้จะลบประวัติคำตอบแบบทดสอบทุกด่านของคุณในระบบ และเริ่มคำนวณใหม่จากศูนย์')) {
      return;
    }

    setResetting(true);
    try {
      const emptyAssessment = {
        responses: [],
        completedStages: [],
        updatedAt: new Date().toISOString()
      };

      const targetPathForFiltering = profile.analysisMode === 'target-lock' ? profile.targetPath : null;
      const skillVector = calculateSkillVector(profile.academics || {}, [], targetPathForFiltering);
      
      const pathsObject = profile.educationLevel === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
      const rankings = matchPaths(skillVector, pathsObject);

      await updateUserProfile(user.uid, {
        assessment: emptyAssessment,
        usedQuestionIds: [],
        results: {
          skillVector,
          matchRankings: rankings
        },
        resultsUpdated: true,
        updatedAt: new Date().toISOString()
      });

      setProfile(prev => ({
        ...prev,
        assessment: emptyAssessment,
        usedQuestionIds: [],
        results: {
          skillVector,
          matchRankings: rankings
        }
      }));

      setCompletedStages(new Set());
      alert('🔄 รีเซ็ตแบบทดสอบทั้งหมดเป็น 0 เรียบร้อยแล้วครับ!');
    } catch (error) {
      console.error('Error resetting assessment:', error);
      alert('เกิดข้อผิดพลาดในการรีเซ็ตคำตอบ');
    } finally {
      setResetting(false);
    }
  };

  // คลังคำถามและธีมไดนามิกตามโหมดการวิเคราะห์
  const activeThemes = profile?.analysisMode === 'target-lock' && profile?.targetPath
    ? (TARGETED_STAGE_THEMES[TARGET_CLUSTERS[profile.targetPath] || 'engineering'] || [])
    : STAGE_THEMES;

  const activeBank = profile?.analysisMode === 'target-lock' && profile?.targetPath
    ? TARGETED_ASSESSMENT_BANK
    : ASSESSMENT_BANK;

  const getRecommendedStages = () => {
    if (!profile || profile.analysisMode !== 'target-lock' || !profile.targetPath) return [];
    
    // ในโหมด Target Lock ด่านทดสอบจะตรงสาย 100% อยู่แล้ว
    if (profile.analysisMode === 'target-lock') return [];
    
    const paths = profile.educationLevel === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
    const target = paths[profile.targetPath];
    if (!target) return [];

    const benchmark = target.benchmark || [0, 0, 0, 0, 0];
    const recommended = [];

    // [logic, science, language, art, management]
    if (benchmark[0] >= 0.7) recommended.push(5, 6);
    if (benchmark[1] >= 0.7) recommended.push(9, 5);
    if (benchmark[2] >= 0.7) recommended.push(8, 11);
    if (benchmark[3] >= 0.7) recommended.push(7, 2);
    if (benchmark[4] >= 0.7) recommended.push(10, 4, 12);

    return Array.from(new Set(recommended));
  };

  const recommendedStages = getRecommendedStages();

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then(p => {
      if (p) {
        // ย้ายรูปแบบข้อมูลคำตอบเดิมเข้าสู่รูปแบบใหม่
        const migrated = migrateResponses(p);
        const hasChanges = JSON.stringify(migrated) !== JSON.stringify(p.assessment?.responses || []);
        
        if (hasChanges) {
          const updatedAssessment = {
            ...(p.assessment || {}),
            responses: migrated
          };
          updateUserProfile(user.uid, {
            assessment: updatedAssessment
          });
          p.assessment = updatedAssessment;
        }

        setProfile(p);
        const usedIds = new Set(p.usedQuestionIds || []);
        const completed = new Set();
        
        // คำนวณสถานะความเสร็จสมบูรณ์จากโปรไฟล์ผู้ใช้
        const currentThemes = p.analysisMode === 'target-lock' && p.targetPath
          ? (TARGETED_STAGE_THEMES[TARGET_CLUSTERS[p.targetPath] || 'engineering'] || [])
          : STAGE_THEMES;

        const currentBank = p.analysisMode === 'target-lock' && p.targetPath
          ? TARGETED_ASSESSMENT_BANK
          : ASSESSMENT_BANK;

        currentThemes.forEach(theme => {
          const themeQs = currentBank.filter(q => q.stageId === theme.id);
          const isComplete = themeQs.every(q => usedIds.has(q.id));
          if (isComplete && themeQs.length > 0) {
            completed.add(theme.id);
          }
        });
        
        setCompletedStages(completed);
      }
    });
  }, [user]);

  const startStage = (theme) => {
    const stageQuestions = activeBank.filter(q => q.stageId === theme.id);
    setSelectedTheme(theme);
    setScenarios(stageQuestions);
    setResponses([]);
    setCurrentIndex(0);
    setView('quiz');
  };

  const handleRetakeStage = (theme) => {
    setRetakeConfirmId(null);
    startStage(theme);
  };

  const handleSelectOption = async (weights) => {
    const newResponses = [...responses, { questionId: scenarios[currentIndex].id, weights }];
    setResponses(newResponses);

    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await finishStage(newResponses);
    }
  };

  const finishStage = async (newResponses) => {
    setView('saving');
    try {
      const stageQuestions = scenarios.map(s => s.id);
      const stageQuestionSet = new Set(stageQuestions);

      // กรองข้อมูลคำตอบเดิมของด่านนี้ออกก่อนบันทึกใหม่
      const oldResponses = profile.assessment?.responses || [];
      const filteredOldResponses = oldResponses.filter(r => !stageQuestionSet.has(r.questionId));
      
      const allResponses = [...filteredOldResponses, ...newResponses];

      const targetPathForFiltering = profile.analysisMode === 'target-lock' && profile.targetPath ? profile.targetPath : null;
      const skillVector = calculateSkillVector(profile.academics, allResponses, targetPathForFiltering);
      const pathsObject = profile.educationLevel === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
      const rankings = matchPaths(skillVector, pathsObject);
      
      const updatedUsedIds = [...new Set([...(profile.usedQuestionIds || []), ...stageQuestions])];

      await updateUserProfile(user.uid, {
        usedQuestionIds: updatedUsedIds,
        resultsUpdated: true,
        assessment: {
          responses: allResponses,
          completedAt: new Date().toISOString()
        },
        results: {
          skillVector,
          matchRankings: rankings
        }
      });

      // อัปเดตสถานะในตัวแปรท้องถิ่น
      setProfile(prev => ({
        ...prev,
        usedQuestionIds: updatedUsedIds,
        assessment: { responses: allResponses, completedAt: new Date().toISOString() },
        results: { skillVector, matchRankings: rankings }
      }));
      setCompletedStages(prev => new Set(prev).add(selectedTheme.id));
      
      // เปลี่ยนหน้าไปยังแดชบอร์ดหลักเพื่อดูผลลัพธ์ใหม่
      router.push('/dashboard');
    } catch (err) {
      console.error('Error saving stage:', err);
      alert('เกิดข้อผิดพลาดในการประมวลผล');
      setView('stages');
    }
  };

  if (!profile) return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;

  if (view === 'saving') {
    return (
      <div style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <MrPath size={80} animate={true} showBg={false} />
        <h2 style={{ color: 'var(--primary)', marginTop: '1rem' }}>กำลังประมวลผลผลลัพธ์...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>นำข้อมูลใหม่มารวมกับ My Skill Matrix ของคุณ</p>
      </div>
    );
  }

  if (view === 'quiz') {
    const currentScenario = scenarios[currentIndex];
    const progress = ((currentIndex) / scenarios.length) * 100;

    return (
      <div style={{ animation: 'fadeIn 0.3s ease' }}>
        <button 
          onClick={() => setView('stages')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span>←</span> กลับไปหน้าเลือกด่าน
        </button>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Mascot Greeting */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '0.75rem', 
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <MrPath size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  แบบทดสอบด่าน <strong>{selectedTheme.name}</strong>
                  <span style={{ display: 'inline-flex', alignItems: 'center', color: selectedTheme.color }}>
                    {renderStageIcon(selectedTheme.icon, { size: 18 })}
                  </span>
                </span>
                <br/>
                ตอบตามความเป็นจริงเพื่อให้ระบบวิเคราะห์ได้แม่นยำยิ่งขึ้นนะครับ
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: '600' }}>ข้อที่ {currentIndex + 1}/{scenarios.length}</span>
              <span style={{ 
                background: selectedTheme.color, 
                color: 'white', 
                padding: '0.15rem 0.75rem', 
                borderRadius: '12px', 
                fontSize: '0.75rem', 
                fontWeight: '600' 
              }}>
                คำถาม {currentIndex + 1}
              </span>
            </div>
            <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                background: `linear-gradient(90deg, ${selectedTheme.color}, var(--primary-light))`, 
                width: `${progress}%`,
                transition: 'width 0.5s ease',
                borderRadius: '4px'
              }}></div>
            </div>
          </div>

          {/* Scenario Card */}
          <div className="card" style={{ 
            marginBottom: '1.5rem', 
            borderTop: `4px solid ${selectedTheme.color}`,
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedTheme.color }}>
                {renderStageIcon(selectedTheme.icon, { size: 24 })}
              </span>
              <h2 style={{ color: selectedTheme.color, marginTop: 0, marginBottom: 0, fontSize: '1.1rem' }}>{currentScenario.title}</h2>
            </div>
            <p style={{ fontSize: '1rem', lineHeight: '1.7', margin: 0, color: 'var(--text-primary)' }}>
              {currentScenario.description}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentScenario.options.map((option, idx) => {
              const colorScheme = OPTION_COLORS[idx % OPTION_COLORS.length];
              const parts = option.text.split(' ');
              const prefix = parts[0];
              const rest = parts.slice(1).join(' ');
              
              return (
                <button 
                  key={idx}
                  style={{ 
                    textAlign: 'left', 
                    cursor: 'pointer', 
                    border: `2px solid ${colorScheme.border}`,
                    borderRadius: '14px',
                    transition: 'all 0.2s',
                    padding: '1rem 1.25rem',
                    background: colorScheme.bg,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    width: '100%',
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colorScheme.hoverBg; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = colorScheme.bg; e.currentTarget.style.transform = 'none'; }}
                  onClick={() => handleSelectOption(option.weights)}
                >
                  <span style={{ 
                    fontSize: '1.1rem', 
                    flexShrink: 0,
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    background: colorScheme.border,
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                  }}>
                    {prefix.replace('.', '')}
                  </span>
                  <span>{rest}</span>
                </button>
              );
            })}
          </div>
        </div>
        <AssessmentMusicPlayer />
      </div>
    );
  }

  // ส่วนแสดงผลด่านแบบทดสอบ
  const targetPathObj = profile?.analysisMode === 'target-lock' && profile?.targetPath
    ? ((profile.educationLevel === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS)[profile.targetPath])
    : null;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', position: 'relative' }}>
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
          gap: '0.4rem',
          marginBottom: '1rem',
          fontFamily: 'inherit'
        }}
      >
        <ArrowLeft size={16} /> ย้อนกลับไปยังแดชบอร์ด
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '800', margin: 0, fontSize: '1.75rem' }}>
          <Award size={28} style={{ color: 'var(--primary)' }} /> แบบทดสอบสายการเรียน
        </h1>
        {profile?.assessment?.responses?.length > 0 && (
          <button 
            onClick={handleResetAssessment}
            disabled={resetting}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1.5px dashed #EF4444',
              color: '#EF4444',
              borderRadius: '12px',
              padding: '0.5rem 1rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = '#EF4444'; }}
          >
            {resetting ? 'กำลังรีเซ็ต...' : <><RotateCcw size={16} /> คืนค่าเริ่มต้นแบบทดสอบ</>}
          </button>
        )}
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        ยิ่งทำแบบทดสอบเยอะ ยิ่งได้ผลวิเคราะห์ที่แม่นยำขึ้น เลือกด่านที่คุณสนใจเพื่อทดสอบความถนัด
      </p>

      {/* Upgraded Target Lock Banner with Linear Gradient */}
      {profile?.analysisMode === 'target-lock' && targetPathObj && (
        <div style={{
          background: 'linear-gradient(135deg, #7C5CFC 0%, #FF6B8B 100%)',
          borderRadius: '20px',
          padding: '1.25rem 1.75rem',
          boxShadow: '0 10px 25px rgba(124, 92, 252, 0.22)',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#FFFFFF',
          animation: 'fadeIn 0.4s ease-out'
        }}>
          <Target size={36} style={{ color: '#FFFFFF', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.15))' }} />
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
              โหมดประเมินความพร้อมสอบเข้า: {targetPathObj.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', marginTop: '0.25rem', lineHeight: '1.4' }}>
              ทำแบบทดสอบให้ครบทุกด่านเพื่อวิเคราะห์ความพร้อมของคุณอย่างละเอียด! ด่านเหล่านี้ได้รับการจำลองสถานการณ์เฉพาะวิชาชีพให้เหมาะสมกับเป้าหมายของคุณ
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Layout Based on Analysis Mode */}
      {profile?.analysisMode === 'target-lock' && targetPathObj ? (
        /* ====================================================
           1. TARGET LOCK MODE: 70:30 SPLIT VERTICAL TIMELINE MAP
           ==================================================== */
        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          width: '100%', 
          flexWrap: 'wrap', 
          alignItems: 'stretch',
          marginTop: '1rem' 
        }}>
          {/* Left Column (70%): Vertical Quest Map */}
          <div style={{ 
            flex: '1 1 65%', 
            minWidth: '320px', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem',
            paddingLeft: '3.25rem'
          }}>
            {/* Vertical Connecting Dashed Line */}
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '40px',
              bottom: '40px',
              width: '3px',
              background: 'repeating-linear-gradient(to bottom, transparent, transparent 6px, var(--primary) 6px, var(--primary) 12px)',
              opacity: 0.25,
              zIndex: 0
            }} />

            {activeThemes.map((theme, index) => {
              const isCompleted = completedStages.has(theme.id);
              const isConfirming = retakeConfirmId === theme.id;
              const themeQuestions = activeBank.filter(q => q.stageId === theme.id);

              return (
                <div
                  key={theme.id}
                  onClick={() => { 
                    if (isCompleted) {
                      setRetakeConfirmId(theme.id);
                    } else {
                      startStage(theme); 
                    }
                  }}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem 1.75rem',
                    cursor: 'pointer',
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: isCompleted ? '2px solid var(--border)' : '2px solid transparent',
                    boxShadow: '0 8px 24px rgba(124, 92, 252, 0.04)',
                    transition: 'all 0.2s ease-in-out',
                    width: '100%',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isConfirming) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(124, 92, 252, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isConfirming) {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 92, 252, 0.04)';
                    }
                  }}
                >
                  {/* Timeline circular node sitting on the line */}
                  <div style={{
                    position: 'absolute',
                    left: '-46px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--success)' : 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    boxShadow: '0 0 8px rgba(124, 92, 252, 0.25)',
                    zIndex: 2
                  }}>
                    {isCompleted ? '✓' : index + 1}
                  </div>

                  {/* Retake Confirmation Overlay */}
                  {isCompleted && isConfirming && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255, 255, 255, 0.96)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        zIndex: 10,
                        animation: 'fadeIn 0.2s ease-out'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        ต้องการทำแบบทดสอบด่านนี้ใหม่อีกครั้ง?
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleRetakeStage(theme)}
                          style={{
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(76,175,80,0.25)',
                            fontFamily: 'inherit',
                          }}
                        >
                          ยืนยัน
                        </button>
                        <button 
                          onClick={() => setRetakeConfirmId(null)}
                          style={{
                            background: '#E91E63',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(233,30,99,0.25)',
                            fontFamily: 'inherit',
                          }}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Icon & Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.color, width: '48px', height: '48px', borderRadius: '12px', background: `${theme.color}12`, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))', flexShrink: 0 }}>
                      {renderStageIcon(theme.icon, { size: 26 })}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ด่านทดสอบที่ {index + 1}
                      </div>
                      <h3 style={{ margin: '0.15rem 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '800', lineHeight: '1.3' }}>
                        {theme.name}
                      </h3>
                      
                      {/* Action Button / Status (Always underneath the title for consistency) */}
                      <div style={{ marginTop: '0.5rem' }}>
                        {isCompleted ? (
                          <span style={{ 
                            background: '#E8F5E9', 
                            color: '#2E7D32', 
                            padding: '6px 12px', 
                            borderRadius: '10px', 
                            fontSize: '0.8rem', 
                            fontWeight: '700',
                            border: '1px solid #C8E6C9',
                            display: 'inline-block'
                          }}>
                            ✅ ผ่านแล้ว (คลิกเพื่อทำใหม่)
                          </span>
                        ) : (
                          <button style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(124, 92, 252, 0.2)',
                            fontFamily: 'inherit',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            เริ่มทดสอบ ({themeQuestions.length} ข้อ) ➔
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (30%): Mr. Path Vertical long bar */}
          <div style={{ flex: '1 1 28%', minWidth: '260px', display: 'flex' }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '2.5rem 1.5rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
              border: '1px solid var(--border)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              position: 'sticky',
              top: '2rem',
              width: '100%',
              minHeight: '100%'
            }}>
              <img 
                src="/images/mr_path_mascot.png" 
                alt="Mr. Path Mascot" 
                style={{
                  width: '110px',
                  height: '110px',
                  objectFit: 'contain',
                  marginBottom: '2rem',
                  filter: 'drop-shadow(0 8px 16px rgba(124, 92, 252, 0.15))',
                }} 
              />
              
              <div style={{
                width: '100%',
                background: 'var(--primary-bg)',
                borderRadius: '20px',
                padding: '1.5rem 1.25rem',
                fontSize: '0.88rem',
                lineHeight: '1.7',
                color: 'var(--text-primary)',
                border: '1px solid var(--primary-light)',
                textAlign: 'left',
                position: 'relative',
                flex: 1
              }}>
                {/* Speech bubble arrow pointing left */}
                <div style={{
                  position: 'absolute',
                  left: '-8px',
                  top: '50px',
                  transform: 'rotate(45deg)',
                  width: '16px',
                  height: '16px',
                  background: 'var(--primary-bg)',
                  borderLeft: '1px solid var(--primary-light)',
                  borderBottom: '1px solid var(--primary-light)',
                }}></div>

                <span style={{ 
                  fontWeight: '800', 
                  color: 'var(--primary)', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.75rem', 
                  fontSize: '0.95rem' 
                }}>
                  <Sparkles size={16} /> คำแนะนำจาก Mr. Path:
                </span>
                
                ด่านจำลองการทำงานสาย <strong>{targetPathObj.name}</strong> ทั้ง 3 ด่านนี้ ได้รับการออกแบบตามความสามารถที่วิชาชีพนั้นต้องการจริงๆ นะครับ! 
                <br /><br />
                ทำกี่ครั้งก็ได้ตามความชอบเพื่ออัปเกรดผลความเข้ากันของระบบ ไม่ต้องกดดันนะครับ ลุยกันเลยครับ!
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ====================================================
           2. DISCOVERY MODE: STANDARD 12 STAGES GRID
           ==================================================== */
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '1.25rem' 
        }}>
          {activeThemes.map((theme, index) => {
            const isCompleted = completedStages.has(theme.id);
            const isConfirming = retakeConfirmId === theme.id;
            const isRecommended = recommendedStages.includes(theme.id);
            const themeQuestions = activeBank.filter(q => q.stageId === theme.id);
            
            return (
              <div 
                key={theme.id}
                className="card"
                onClick={() => { 
                  if (isCompleted) {
                    setRetakeConfirmId(theme.id);
                  } else {
                    startStage(theme); 
                  }
                }}
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  opacity: isCompleted ? 0.75 : 1,
                  border: isCompleted ? '2px solid var(--border)' : isRecommended ? '2px solid var(--primary-light)' : `2px solid transparent`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isConfirming) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConfirming) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                  }
                }}
              >
                {/* Recommended Badge */}
                {isRecommended && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'var(--primary-bg)',
                    color: 'var(--primary)',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    border: '1px solid var(--primary-light)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Star size={10} /> แนะนำ
                  </div>
                )}

                {/* Retake Confirmation Overlay */}
                {isCompleted && isConfirming && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(255, 255, 255, 0.96)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '1rem',
                      zIndex: 10,
                      animation: 'fadeIn 0.2s ease-out'
                    }}
                  >
                    <button 
                      onClick={() => handleRetakeStage(theme)}
                      style={{
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '0.6rem 1rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(76,175,80,0.25)',
                        fontFamily: 'inherit',
                        transition: 'transform 0.1s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      ทำแบบทดสอบอีกครั้ง
                    </button>
                    <button 
                      onClick={() => setRetakeConfirmId(null)}
                      style={{
                        background: '#E91E63',
                        color: 'white',
                        border: 'none',
                        padding: '0.6rem 1rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(233,30,99,0.25)',
                        fontFamily: 'inherit',
                        transition: 'transform 0.1s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}

                {isCompleted && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    background: 'var(--success)', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '10px', 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <CheckCircle size={10} /> ทำแล้ว
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.color, width: '42px', height: '42px', borderRadius: '10px', background: `${theme.color}12`, marginBottom: '0.75rem' }}>
                  {renderStageIcon(theme.icon, { size: 22 })}
                </div>
                
                <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                ด่านที่ {profile?.analysisMode === 'target-lock' ? index + 1 : theme.id}: {theme.name}
              </h3>
              
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {isCompleted ? 'คลิกเพื่อทำแบบทดสอบด่านนี้ใหม่อีกครั้ง' : `คลิกเพื่อเริ่มทำแบบทดสอบ (${themeQuestions.length} ข้อ)`}
              </p>
            </div>
          );
        })}
      </div>
      )}
      <AssessmentMusicPlayer />
    </div>
  );
}
