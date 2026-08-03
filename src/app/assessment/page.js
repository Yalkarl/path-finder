'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, addUsedQuestions } from '@/lib/firestore';
import { calculateSkillVector } from '@/lib/algorithms/skillVector';
import { matchPaths } from '@/lib/algorithms/cosineSimilarity';
import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';
import { ASSESSMENT_BANK, STAGE_THEMES } from '@/lib/constants/assessmentBank';
import { TARGET_CLUSTERS, TARGETED_STAGE_THEMES, TARGETED_ASSESSMENT_BANK } from '@/lib/constants/targetedAssessment';
import { MrPath } from '@/components/ui/mr-path';
import AssessmentMusicPlayer from '@/components/ui/AssessmentMusicPlayer';
import { 
  Home, Gamepad2, GraduationCap, Users, Puzzle, Cpu, Palette, MessageSquare, FlaskConical, Crown, Globe, Compass, 
  Microscope, Scale, Dna, Terminal, Clock, Lightbulb, Leaf, LineChart, TrendingUp, Coins, Plane, Film, Sparkles, 
  FileText, Heart 
} from 'lucide-react';

const STAGE_ICON_MAP = {
  Home, Gamepad2, GraduationCap, Users, Puzzle, Cpu, Palette, MessageSquare, FlaskConical, Crown, Globe, Compass,
  Microscope, Scale, Dna, Terminal, Clock, Lightbulb, Leaf, LineChart, TrendingUp, Coins, Plane, Film, Sparkles
};

function renderStageIcon(iconName, props = {}) {
  const IconComponent = STAGE_ICON_MAP[iconName] || Compass;
  return <IconComponent {...props} />;
}

const OPTION_COLORS = [
  { bg: 'rgba(76,175,80,0.08)', border: 'rgba(76,175,80,0.3)', icon: '🟢', hoverBg: 'rgba(76,175,80,0.15)' },
  { bg: 'rgba(124,92,252,0.08)', border: 'rgba(124,92,252,0.3)', icon: '🟣', hoverBg: 'rgba(124,92,252,0.15)' },
  { bg: 'rgba(255,152,0,0.08)', border: 'rgba(255,152,0,0.3)', icon: '🟠', hoverBg: 'rgba(255,152,0,0.15)' },
  { bg: 'rgba(33,150,243,0.08)', border: 'rgba(33,150,243,0.3)', icon: '🔵', hoverBg: 'rgba(33,150,243,0.15)' },
];

export default function AssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [scenarios, setScenarios] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      const userProfile = await getUserProfile(user.uid);
      if (!userProfile) {
        router.push('/setup');
        return;
      }
      setProfile(userProfile);

      if (userProfile.analysisMode === 'target-lock' && userProfile.targetPath) {
        // Targeted role-play stage 1
        const clusterKey = TARGET_CLUSTERS[userProfile.targetPath] || 'engineering';
        const themes = TARGETED_STAGE_THEMES[clusterKey] || [];
        const theme = themes[0];
        const stageQuestions = TARGETED_ASSESSMENT_BANK.filter(q => q.stageId === theme?.id);
        
        setCurrentTheme(theme);
        setScenarios(stageQuestions);
      } else {
        // Randomly pick 1 theme out of 12 for the setup assessment
        const randomStageId = Math.floor(Math.random() * 12) + 1;
        const theme = STAGE_THEMES.find(t => t.id === randomStageId);
        const stageQuestions = ASSESSMENT_BANK.filter(q => q.stageId === randomStageId);
        
        setCurrentTheme(theme);
        setScenarios(stageQuestions);
      }
      setLoading(false);
    };
    init();
  }, [user, router]);

  const handleSelectOption = async (weights) => {
    const newResponses = [...responses, { questionId: scenarios[currentIndex].id, weights }];
    setResponses(newResponses);

    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await finishAssessment(newResponses);
    }
  };

  const finishAssessment = async (finalResponses) => {
    setSaving(true);
    try {
      const targetPathForFiltering = profile.analysisMode === 'target-lock' && profile.targetPath ? profile.targetPath : null;
      const skillVector = calculateSkillVector(profile.academics, finalResponses, targetPathForFiltering);
      const pathsObject = profile.educationLevel === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
      const rankings = matchPaths(skillVector, pathsObject);
      
      // Save used question IDs
      const questionIds = scenarios.map(s => s.id);

      await updateUserProfile(user.uid, {
        completedSetup: true,
        usedQuestionIds: questionIds,
        assessment: {
          responses: finalResponses,
          completedAt: new Date().toISOString()
        },
        results: {
          skillVector,
          matchRankings: rankings
        }
      });

      router.push('/dashboard');
    } catch (err) {
      console.error('Error finishing assessment:', err);
      alert('เกิดข้อผิดพลาดในการประมวลผล');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F2F0FF 0%, #E8E4FF 50%, rgba(255, 234, 167, 0.15) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <MrPath size={80} animate={true} showBg={false} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: '600', marginTop: '1rem' }}>Mr. Path กำลังเตรียมสถานการณ์จำลอง...</p>
        </div>
      </div>
    );
  }

  if (saving) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F2F0FF 0%, #E8E4FF 50%, rgba(255, 234, 167, 0.15) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <MrPath size={80} animate={true} showBg={false} />
          <p style={{ color: 'var(--primary)', fontWeight: 'bold', marginTop: '1rem' }}>กำลังประมวลผลอัจฉริยะ...</p>
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) return <div style={{ textAlign: 'center', padding: '2rem' }}>ไม่มีคำถามแบบทดสอบ</div>;

  const currentScenario = scenarios[currentIndex];
  const progress = ((currentIndex) / scenarios.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem 1rem',
      display: 'flex',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F2F0FF 0%, #E8E4FF 50%, rgba(255, 234, 167, 0.15) 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      <div style={{ maxWidth: '600px', width: '100%', position: 'relative', zIndex: 10 }}>
        
        {/* Mascot Greeting */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '0.75rem', 
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'var(--surface)',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <MrPath size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                แบบทดสอบนี้อยู่ในธีม <strong>{currentTheme?.name}</strong>
                {currentTheme && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', color: currentTheme.color }}>
                    {renderStageIcon(currentTheme.icon, { size: 18 })}
                  </span>
                )}
              </span>
              <br/>
              ตอบได้ตามใจเลยนะครับ — ไม่มีผิดไม่มีถูก แค่ให้รู้สึกสนุก!
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>คำถามที่ {currentIndex + 1}/{scenarios.length}</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1);
                    setResponses(prev => prev.slice(0, -1));
                  } else {
                    router.push('/setup/grades');
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                ← ย้อนกลับ
              </button>
              <span style={{ 
                background: currentTheme?.color || 'var(--primary)', 
                color: 'white', 
                padding: '0.15rem 0.75rem', 
                borderRadius: '12px', 
                fontSize: '0.75rem', 
                fontWeight: '600' 
              }}>
                Scenario {currentIndex + 1}
              </span>
            </div>
          </div>
          <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              background: `linear-gradient(90deg, ${currentTheme?.color || 'var(--primary)'}, var(--primary-light))`, 
              width: `${progress}%`,
              transition: 'width 0.5s ease',
              borderRadius: '4px'
            }}></div>
          </div>
        </div>

        {/* Scenario Card */}
        <div className="card" style={{ 
          marginBottom: '1.5rem', 
          animation: 'fadeIn 0.4s ease-out',
          borderTop: `4px solid ${currentTheme?.color || 'var(--primary)'}`,
          padding: '1.5rem',
        }} key={currentIndex}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            {currentTheme && (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentTheme.color }}>
                {renderStageIcon(currentTheme.icon, { size: 24 })}
              </span>
            )}
            <h2 style={{ color: currentTheme?.color || 'var(--primary)', marginTop: 0, marginBottom: 0, fontSize: '1.1rem' }}>{currentScenario.title}</h2>
          </div>
          <p style={{ fontSize: '1rem', lineHeight: '1.7', margin: 0, color: 'var(--text-primary)' }}>
            {currentScenario.description}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {currentScenario.options.map((option, idx) => {
            const colorScheme = OPTION_COLORS[idx % OPTION_COLORS.length];
            // Split option text to extract title and description
            const parts = option.text.split(' ');
            const prefix = parts[0]; // ก., ข., etc.
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
