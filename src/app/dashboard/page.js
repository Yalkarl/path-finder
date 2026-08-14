'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, subscribeUserProfile } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import SkillRadarChart from '@/components/charts/RadarChart';
import GapAnalysisChart from '@/components/charts/GapAnalysisChart';
import { analyzeGaps } from '@/lib/algorithms/gapAnalysis';
import { MrPath } from '@/components/ui/mr-path';

// นำเข้าข้อมูลสำหรับโหมด Target Lock
import { findAlternativePaths } from '@/lib/algorithms/alternativePaths';
import ReadinessGauge from '@/components/charts/ReadinessGauge';
import { calculateMatchPercentage, matchPaths } from '@/lib/algorithms/cosineSimilarity';
import { calculateSkillVector } from '@/lib/algorithms/skillVector';
import { calculateReadiness } from '@/lib/algorithms/readinessCalculator';
import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';
import { SELF_ASSESSMENT_SUBJECTS } from '@/lib/constants/selfAssessmentSubjects';
import { Target, Sliders, BarChart2, FolderOpen, Lightbulb, Trophy, Compass, ChevronRight, Sparkles, BookOpen, Lock, Unlock, Clock } from 'lucide-react';
import { checkAssessmentQuota } from '@/lib/algorithms/dailyAttempts';
import { KahootCharacterSvg } from '@/components/ui/KahootVectorCharacters';

const PROFILE_THAI_MAP = {
  'Autonomous Strategic Analyst': 'นักวิเคราะห์กลยุทธ์อิสระ (Autonomous Strategic Analyst)',
  'Analytical Innovator': 'นักคิดนวัตกรรมเชิงวิเคราะห์ (Analytical Innovator)',
  'Data-Driven Strategist': 'นักวางกลยุทธ์ขับเคลื่อนด้วยข้อมูล (Data-Driven Strategist)',
  'Creative Innovation Leader': 'ผู้นำสร้างสรรค์นวัตกรรม (Creative Innovation Leader)',
  'Systems Problem Solver': 'นักแก้ปัญหาเชิงระบบ (Systems Problem Solver)',
  'Empathic People Leader': 'ผู้นำทีมมุ่งเน้นความเข้าใจผู้คน (Empathic People Leader)',
  'Pragmatic Problem Solver': 'นักแก้ปัญหาเชิงปฏิบัติการ (Pragmatic Problem Solver)',
  'Strategic Tech Innovator': 'นักสร้างสรรค์เทคโนโลยีเชิงกลยุทธ์ (Strategic Tech Innovator)',
  'Analytical Thinker': 'นักคิดวิเคราะห์เชิงกลยุทธ์ (Analytical Thinker)'
};

function formatHybridProfileTitle(rawTitle) {
  if (!rawTitle) return 'นักคิดวิเคราะห์เชิงกลยุทธ์ (Analytical Thinker)';
  if (PROFILE_THAI_MAP[rawTitle]) return PROFILE_THAI_MAP[rawTitle];
  if (/[\u0E00-\u0E7F]/.test(rawTitle)) return rawTitle;
  return `${rawTitle} (${rawTitle})`;
}

function AIQualitativeInsightsSection({ aiEval, profile }) {
  const likes = Array.isArray(profile?.likes) ? profile.likes : [];
  const dislikes = Array.isArray(profile?.dislikes) ? profile.dislikes : [];

  let rawInsights = Array.isArray(aiEval?.qualitativeInsights) ? [...aiEval.qualitativeInsights] : [];
  let rawAdvice = Array.isArray(aiEval?.actionableAdvice) ? [...aiEval.actionableAdvice] : [];

  // หากล้างข้อมูลสิ่งชอบออก ให้ลบข้อความแคชเก่าของ AI ที่เคยพูดถึงสิ่งชอบออกทันที
  if (likes.length === 0) {
    rawInsights = rawInsights.filter(i => !i.includes('มีความสนใจและแรงจูงใจเด่นชัดในด้าน') && !i.includes('ความสนใจด้าน'));
    rawAdvice = rawAdvice.filter(a => !a.includes('เน้นการทำโปรเจกต์หรือสะสมผลงาน') && !a.includes('ความชอบด้าน'));
  }

  // หากล้างข้อมูลสิ่งที่ไม่ชอบออก ให้ลบข้อความแคชเก่าของ AI ที่เคยพูดถึงสิ่งที่ไม่อินออกทันที
  if (dislikes.length === 0) {
    rawInsights = rawInsights.filter(i => !i.includes('ขอบเขตความสนใจชัดเจนโดยระบุไม่อินกับกิจกรรมด้าน') && !i.includes('ไม่อินกับ'));
  }

  let insights = rawInsights;
  let advice = rawAdvice;

  // เพิ่มบทวิเคราะห์เชิงลึกที่เชื่อมโยงกับสิ่งที่ชอบและสิ่งที่ไม่อินปัจจุบันเท่านั้น
  if (likes.length > 0) {
    const likesText = likes.join(', ');
    const prefInsight = `มีความสนใจและแรงจูงใจเด่นชัดในด้าน ${likesText} ซึ่งเป็นฐานทัพสำคัญในการต่อยอดทักษะตรงสายการเรียน`;
    if (!insights.some(i => i.includes(likesText))) {
      insights.unshift(prefInsight);
    }
  }

  if (dislikes.length > 0) {
    const dislikesText = dislikes.join(', ');
    const dislikeInsight = `ขอบเขตความสนใจชัดเจนโดยระบุไม่ชอบกิจกรรมด้าน ${dislikesText} ช่วยกรองสาขาที่ไม่ตอบโจทย์ออกได้อย่างตรงจุด`;
    if (!insights.some(i => i.includes(dislikesText))) {
      if (insights.length > 1) {
        insights.splice(1, 0, dislikeInsight);
      } else {
        insights.push(dislikeInsight);
      }
    }
  }

  if (likes.length > 0) {
    const likesText = likes[0];
    const prefAdvice = `เน้นการทำโปรเจกต์หรือสะสมผลงาน (Project-based) ที่เกี่ยวข้องกับ ${likesText} เพื่อเพิ่มจุดเด่นในพอร์ตโฟลิโอ`;
    if (!advice.some(a => a.includes(likesText))) {
      advice.unshift(prefAdvice);
    }
  }

  if (insights.length === 0) {
    insights = [
      'มีความสามารถโดดเด่นในการตัดสินใจและวางแผนจัดการเชิงกลยุทธ์ ซึ่งเป็นทักษะสำคัญในระดับบริหารและจัดการโครงการ',
      'ควรเน้นพัฒนาทักษะด้านวิชาการหลักและตรรกะเชิงวิเคราะห์ให้เข้มข้นขึ้นเพื่อเพิ่มความแม่นยำในการตัดสินใจ'
    ];
  }

  if (advice.length === 0) {
    advice = [
      'เริ่มต้นด้วยการศึกษาพื้นฐานการจัดการธุรกิจ หรือภาวะผู้นำ เพื่อต่อยอดทักษะการบริหารที่มี',
      'เข้าร่วมกิจกรรมชมรมหรือทำโปรเจกต์กลุ่มเพื่อประยุกต์ใช้ทักษะการสื่อสารและการวางแผน'
    ];
  }

  insights = insights.map(i =>
    typeof i === 'string'
      ? i.replace(/ผลการทดสอบ\s*SJT/gi, 'ผลการทดสอบแบบทดสอบจำลองสถานการณ์')
         .replace(/ข้อสอบ\s*SJT/gi, 'แบบทดสอบจำลองสถานการณ์')
         .replace(/SJT/gi, 'แบบทดสอบจำลองสถานการณ์')
      : i
  );

  advice = advice.map(a =>
    typeof a === 'string'
      ? a.replace(/ผลการทดสอบ\s*SJT/gi, 'ผลการทดสอบแบบทดสอบจำลองสถานการณ์')
         .replace(/ข้อสอบ\s*SJT/gi, 'แบบทดสอบจำลองสถานการณ์')
         .replace(/SJT/gi, 'แบบทดสอบจำลองสถานการณ์')
      : a
  );

  const hasInsights = insights.length > 0;
  const hasAdvice = advice.length > 0;

  return (
    <div style={{
      marginTop: '1.75rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid var(--border)',
    }}>
      {/* Qualitative Insights Section */}
      {hasInsights && (
        <div style={{ marginBottom: hasAdvice ? '1.25rem' : '0' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '700', 
            color: 'var(--text-primary)', 
            marginTop: 0, 
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            บทวิเคราะห์เชิงพฤติกรรมจาก AI (Qualitative Insights)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '0.2rem' }}>
            {insights.map((insight, idx) => (
              <div key={idx} style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-primary)', 
                lineHeight: '1.6', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.65rem' 
              }}>
                <span style={{ 
                  color: '#F59E0B', 
                  fontSize: '0.75rem', 
                  marginTop: '0.2rem', 
                  flexShrink: 0 
                }}>◆</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inconsistency Warning (if detected) */}
      {aiEval?.inconsistencyDetected && (
        <div style={{
          marginBottom: hasAdvice ? '1.25rem' : '0',
          padding: '0.85rem 1.1rem',
          borderRadius: '14px',
          background: '#FFF5F5',
          border: '1.5px solid #FEB2B2',
          color: '#C53030',
          fontSize: '0.85rem',
          lineHeight: '1.4'
        }}>
          <strong>แจ้งเตือน AI ตรวจพบความขัดแย้งพฤติกรรม (Inconsistency Detected):</strong>
          <div style={{ marginTop: '0.25rem', color: '#9B2C2C' }}>
            {aiEval.inconsistencyReason || 'การเลือกตอบคำถามบางข้อมีทัศนคติขัดแย้งกันเอง หรือมีความแตกต่างระหว่างคำตอบกับ GPAX สะสม'}
          </div>
        </div>
      )}

      {/* Actionable Advice Section */}
      {hasAdvice && (
        <div style={{ 
          padding: '1.1rem 1.25rem', 
          borderRadius: '14px', 
          background: 'var(--primary-bg)', 
          border: '1px dashed var(--primary)' 
        }}>
          <h4 style={{ 
            fontSize: '0.9rem', 
            fontWeight: '700', 
            color: 'var(--primary)', 
            marginTop: 0, 
            marginBottom: '0.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Compass size={16} />
            ข้อแนะนำสำหรับเติมทักษะ (AI Action Roadmap)
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {advice.map((item, idx) => (
              <div key={idx} style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-primary)', 
                lineHeight: '1.5',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.55rem'
              }}>
                <span style={{ color: 'var(--primary)', fontWeight: '700', flexShrink: 0 }}>—</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TargetLockGaugeContainer({ isEvaluating, children }) {
  const [phase, setPhase] = useState(isEvaluating ? 'evaluating' : 'complete');
  const prevEvalRef = useRef(isEvaluating);

  useEffect(() => {
    if (prevEvalRef.current && !isEvaluating) {
      setPhase('shattering');
      const timer = setTimeout(() => {
        setPhase('complete');
      }, 1300);
      return () => clearTimeout(timer);
    } else if (isEvaluating) {
      setPhase('evaluating');
    }
    prevEvalRef.current = isEvaluating;
  }, [isEvaluating]);

  const isLocked = phase === 'evaluating';
  const isShattering = phase === 'shattering';
  const showOverlay = isLocked || isShattering;

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '20px', overflow: 'hidden' }}>
      {/* Target Gauge Content with Blur Transition */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        filter: isLocked ? 'blur(16px)' : isShattering ? 'blur(8px)' : 'blur(0px)',
        opacity: isLocked ? 0.2 : isShattering ? 0.65 : 1,
        transform: isLocked ? 'scale(0.96)' : isShattering ? 'scale(0.99)' : 'scale(1)',
        transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: showOverlay ? 'none' : 'auto',
        userSelect: showOverlay ? 'none' : 'auto'
      }}>
        {children}
      </div>

      {/* Tactical Sniper Scope HUD Overlay */}
      {showOverlay && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at center, rgba(124, 92, 252, 0.12) 0%, rgba(15, 23, 42, 0.65) 85%)',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
          borderRadius: '20px',
          animation: isShattering ? 'overlayFadeOut 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
        }}>
          {/* Sniper HUD Scope Lens & Crosshair SVG */}
          <svg style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible'
          }}>
            <defs>
              <linearGradient id="sniperScopeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C5CFC" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <radialGradient id="sonarPulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={isShattering ? '#10B981' : '#7C5CFC'} stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7C5CFC" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Scope Crosshair Hairlines */}
            {/* Horizontal Center Line */}
            <line x1="5%" y1="50%" x2="95%" y2="50%"
              stroke={isShattering ? '#10B981' : 'rgba(124, 92, 252, 0.6)'}
              strokeWidth="1.5"
              strokeDasharray="10 6 2 6"
              style={{ transition: 'stroke 0.4s ease' }}
            />
            {/* Vertical Center Line */}
            <line x1="50%" y1="5%" x2="50%" y2="95%"
              stroke={isShattering ? '#10B981' : 'rgba(124, 92, 252, 0.6)'}
              strokeWidth="1.5"
              strokeDasharray="10 6 2 6"
              style={{ transition: 'stroke 0.4s ease' }}
            />

            {/* Mil-dot Range Ticks */}
            <circle cx="35%" cy="50%" r="2.5" fill={isShattering ? '#10B981' : '#F59E0B'} />
            <circle cx="65%" cy="50%" r="2.5" fill={isShattering ? '#10B981' : '#F59E0B'} />
            <circle cx="50%" cy="30%" r="2.5" fill={isShattering ? '#10B981' : '#F59E0B'} />
            <circle cx="50%" cy="70%" r="2.5" fill={isShattering ? '#10B981' : '#F59E0B'} />

            {/* Sonar Pulse Wave Ring */}
            <circle cx="50%" cy="50%" r="120" fill="url(#sonarPulse)"
              style={{
                animation: isShattering ? 'none' : 'sonarPulseExpand 2s infinite ease-out',
                transformOrigin: '50% 50%'
              }}
            />

            {/* Outer Rotating Tactical Scope Ring */}
            <circle cx="50%" cy="50%" r="150" fill="none"
              stroke={isShattering ? '#10B981' : 'url(#sniperScopeGrad)'}
              strokeWidth="2.5"
              strokeDasharray="32 12 4 12"
              style={{
                animation: isShattering ? 'sniperLockSnap 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'reticleSpin 10s linear infinite',
                transformOrigin: '50% 50%',
                filter: isShattering ? 'drop-shadow(0 0 16px #10B981)' : 'drop-shadow(0 0 12px rgba(124, 92, 252, 0.5))'
              }}
            />

            {/* Inner Precision Reticle Ring */}
            <circle cx="50%" cy="50%" r="105" fill="none"
              stroke={isShattering ? '#34D399' : '#F59E0B'}
              strokeWidth="2"
              strokeDasharray="16 10"
              style={{
                animation: isShattering ? 'none' : 'reticleSpin 5s linear infinite reverse',
                transformOrigin: '50% 50%',
                opacity: 0.85
              }}
            />

            {/* Corner Tactical Target Brackets */}
            <path d="M 24% 22% L 24% 18% L 28% 18%" fill="none" stroke={isShattering ? '#10B981' : '#F59E0B'} strokeWidth="3" strokeLinecap="round" />
            <path d="M 76% 22% L 76% 18% L 72% 18%" fill="none" stroke={isShattering ? '#10B981' : '#F59E0B'} strokeWidth="3" strokeLinecap="round" />
            <path d="M 24% 78% L 24% 82% L 28% 82%" fill="none" stroke={isShattering ? '#10B981' : '#F59E0B'} strokeWidth="3" strokeLinecap="round" />
            <path d="M 76% 78% L 76% 82% L 72% 82%" fill="none" stroke={isShattering ? '#10B981' : '#F59E0B'} strokeWidth="3" strokeLinecap="round" />
          </svg>

          {/* Central Sniper Scope HUD Card */}
          <div style={{
            position: 'relative',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '1.6rem 2.5rem',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.97), rgba(245, 243, 255, 0.97))',
            borderRadius: '24px',
            border: isShattering ? '2.5px solid #10B981' : '2.5px solid rgba(124, 92, 252, 0.5)',
            boxShadow: isShattering
              ? '0 16px 44px rgba(16, 185, 129, 0.35), 0 0 30px rgba(16, 185, 129, 0.25)'
              : '0 16px 44px rgba(124, 92, 252, 0.28), 0 0 25px rgba(245, 158, 11, 0.2)',
            animation: isShattering ? 'sniperCardLock 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'padlockFloat 2.5s infinite ease-in-out',
            transition: 'all 0.3s ease'
          }}>
            {/* Rangefinder HUD Telemetry Banner */}
            <div style={{
              fontSize: '0.68rem',
              fontWeight: '800',
              letterSpacing: '0.12em',
              color: isShattering ? '#059669' : '#7C5CFC',
              background: isShattering ? 'rgba(16, 185, 129, 0.12)' : 'rgba(124, 92, 252, 0.1)',
              padding: '0.2rem 0.6rem',
              borderRadius: '8px',
              border: isShattering ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(124, 92, 252, 0.2)'
            }}>
              {isShattering ? '[ TARGET LOCKED: 100% ]' : '[ SYS SCANNING TARGET... ]'}
            </div>

            {/* Target Reticle Sniper Icon */}
            <div style={{
              position: 'relative',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: isShattering
                ? 'linear-gradient(135deg, #10B981, #34D399)'
                : 'linear-gradient(135deg, #7C5CFC, #F59E0B)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: isShattering
                ? '0 0 28px rgba(16, 185, 129, 0.7)'
                : '0 0 28px rgba(124, 92, 252, 0.5)',
              transition: 'all 0.4s ease'
            }}>
              <Target size={38} style={{ animation: isLocked ? 'pulse 1.2s infinite' : 'none' }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '800',
                color: isShattering ? '#059669' : '#4C1D95',
                marginBottom: '0.2rem',
                letterSpacing: '0.01em'
              }}>
                {isShattering ? 'TARGET ACQUIRED! ล็อกเป้าหมายสำเร็จ' : 'สแกนและล็อกเป้าหมายความพร้อม'}
              </div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                {isShattering ? 'กำลังแสดงผลการวิเคราะห์โอกาสสอบเข้า...' : 'ระบบกำลังสแกนคำตอบและประเมินเปอร์เซ็นต์ความพร้อม...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tactical Sniper Scope Keyframes */}
      <style>{`
        @keyframes reticleSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes sonarPulseExpand {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes sniperLockSnap {
          0% { transform: scale(1) rotate(0deg); stroke: #7C5CFC; opacity: 1; }
          40% { transform: scale(1.25) rotate(180deg); stroke: #F59E0B; }
          70% { transform: scale(0.95) rotate(360deg); stroke: #10B981; }
          100% { transform: scale(1.1) rotate(360deg); stroke: #10B981; opacity: 0; }
        }
        @keyframes sniperCardLock {
          0% { transform: scale(1); }
          30% { transform: scale(1.08); }
          60% { transform: scale(0.97); }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function DiscoverySkillMatrixContainer({ isEvaluating, vector, academics, aiEval }) {
  const [phase, setPhase] = useState(isEvaluating ? 'evaluating' : 'complete');
  const prevEvalRef = useRef(isEvaluating);

  useEffect(() => {
    if (prevEvalRef.current && !isEvaluating) {
      setPhase('shattering');
      const timer = setTimeout(() => {
        setPhase('complete');
      }, 1300);
      return () => clearTimeout(timer);
    } else if (isEvaluating) {
      setPhase('evaluating');
    }
    prevEvalRef.current = isEvaluating;
  }, [isEvaluating]);

  const isLocked = phase === 'evaluating';
  const isShattering = phase === 'shattering';
  const showOverlay = isLocked || isShattering;

  return (
    <div style={{ position: 'relative', marginTop: '1.5rem', minHeight: '360px', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Skill Radar Chart with Blur Transition */}
      <div style={{
        filter: isLocked ? 'blur(16px)' : isShattering ? 'blur(12px)' : 'blur(0px)',
        opacity: isLocked ? 0.2 : isShattering ? 0.6 : 1,
        transform: isLocked ? 'scale(0.96)' : isShattering ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: showOverlay ? 'none' : 'auto',
        userSelect: showOverlay ? 'none' : 'auto'
      }}>
        <SkillRadarChart vector={vector} academics={academics} aiEval={aiEval} />
      </div>

      {/* PathFinder Themed Locked Padlock & Tech Chains Overlay */}
      {showOverlay && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
          borderRadius: '16px',
          animation: isShattering ? 'overlayFadeOut 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
        }}>
          {/* SVG PathFinder Tech Chains */}
          <svg style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible'
          }}>
            <defs>
              <linearGradient id="pathfinderChainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C5CFC" />
                <stop offset="50%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>

            {/* Tech Chains tethered from 4 corners */}
            {/* Top Left Chain */}
            <line x1="2%" y1="2%" x2="50%" y2="50%" stroke="url(#pathfinderChainGrad)" strokeWidth="8" strokeDasharray="12 8"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(124, 92, 252, 0.4))',
                animation: isShattering ? 'chainBreakTL 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'rpgChainGlow 2s infinite ease-in-out',
                strokeLinecap: 'round'
              }}
            />
            {/* Top Right Chain */}
            <line x1="98%" y1="2%" x2="50%" y2="50%" stroke="url(#pathfinderChainGrad)" strokeWidth="8" strokeDasharray="12 8"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(124, 92, 252, 0.4))',
                animation: isShattering ? 'chainBreakTR 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'rpgChainGlow 2s infinite ease-in-out 0.5s',
                strokeLinecap: 'round'
              }}
            />
            {/* Bottom Left Chain */}
            <line x1="2%" y1="98%" x2="50%" y2="50%" stroke="url(#pathfinderChainGrad)" strokeWidth="8" strokeDasharray="12 8"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(124, 92, 252, 0.4))',
                animation: isShattering ? 'chainBreakBL 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'rpgChainGlow 2s infinite ease-in-out 1s',
                strokeLinecap: 'round'
              }}
            />
            {/* Bottom Right Chain */}
            <line x1="98%" y1="98%" x2="50%" y2="50%" stroke="url(#pathfinderChainGrad)" strokeWidth="8" strokeDasharray="12 8"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(124, 92, 252, 0.4))',
                animation: isShattering ? 'chainBreakBR 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'rpgChainGlow 2s infinite ease-in-out 1.5s',
                strokeLinecap: 'round'
              }}
            />
          </svg>

          {/* Central PathFinder Glassmorphism Padlock Card */}
          <div style={{
            position: 'relative',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '1.6rem 2.5rem',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(248, 246, 255, 0.96))',
            borderRadius: '24px',
            border: '2px solid rgba(124, 92, 252, 0.35)',
            boxShadow: '0 16px 44px rgba(124, 92, 252, 0.2), 0 0 20px rgba(124, 92, 252, 0.1)',
            animation: isShattering ? 'padlockShatter 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'padlockFloat 2.5s infinite ease-in-out'
          }}>
            {/* SVG PathFinder Metallic Padlock Model */}
            <div style={{
              position: 'relative',
              width: '72px',
              height: '72px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: isShattering ? 'drop-shadow(0 0 16px #10B981)' : 'drop-shadow(0 0 14px rgba(124, 92, 252, 0.4))'
            }}>
              <svg width="72" height="72" viewBox="0 0 100 100" fill="none">
                <defs>
                  <linearGradient id="pathfinderLockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C5CFC" />
                    <stop offset="60%" stopColor="#5B21B6" />
                    <stop offset="100%" stopColor="#4C1D95" />
                  </linearGradient>
                  <linearGradient id="shackleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#CBD5E1" />
                    <stop offset="50%" stopColor="#64748B" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                  <radialGradient id="lockGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={isShattering ? '#34D399' : '#A78BFA'} stopOpacity="0.7" />
                    <stop offset="100%" stopColor={isShattering ? '#059669' : '#7C5CFC'} stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Outer Glow Ring */}
                <circle cx="50" cy="50" r="46" fill="url(#lockGlow)" />

                {/* Metallic Shackle */}
                <path
                  d={isShattering ? "M 32 45 V 26 A 18 18 0 0 1 68 26 V 16" : "M 32 45 V 26 A 18 18 0 0 1 68 26 V 45"}
                  fill="none"
                  stroke="url(#shackleGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  style={{ transition: 'all 0.4s ease' }}
                />

                {/* PathFinder Purple Padlock Body */}
                <rect x="22" y="40" width="56" height="46" rx="12" fill="url(#pathfinderLockGrad)" stroke="#F59E0B" strokeWidth="2" />
                
                {/* Corner Accents */}
                <circle cx="29" cy="47" r="2.5" fill="#FBBF24" />
                <circle cx="71" cy="47" r="2.5" fill="#FBBF24" />
                <circle cx="29" cy="79" r="2.5" fill="#FBBF24" />
                <circle cx="71" cy="79" r="2.5" fill="#FBBF24" />

                {/* Keyhole Core */}
                <circle cx="50" cy="58" r="9" fill="#1E1B4B" stroke="#F59E0B" strokeWidth="1.2" />
                <path d="M 50 53 L 54 58 L 50 65 L 46 58 Z" fill={isShattering ? '#10B981' : '#F59E0B'} />
              </svg>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.05rem',
                fontWeight: '800',
                color: isShattering ? '#059669' : '#4C1D95',
                marginBottom: '0.2rem'
              }}>
                {isShattering ? 'ปลดล็อกกราฟทักษะเรียบร้อย!' : 'ถอดรหัสและตรึงกุญแจสมรรถนะ'}
              </div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                {isShattering ? 'กำลังแสดงกราฟ My Skill Matrix...' : 'ระบบกำลังประมวลผลคำตอบเกรดวิชาและแบบทดสอบ...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe Styles */}
      <style>{`
        @keyframes padlockFloat {
          0%, 100% { transform: translateY(0px) scale(1); boxShadow: 0 16px 44px rgba(124, 92, 252, 0.4), 0 0 25px rgba(245, 158, 11, 0.3); }
          50% { transform: translateY(-8px) scale(1.03); boxShadow: 0 22px 54px rgba(245, 158, 11, 0.5), 0 0 35px rgba(192, 132, 252, 0.4); }
        }
        @keyframes padlockShatter {
          0% { transform: scale(1) rotate(0deg); opacity: 1; filter: blur(0px); }
          25% { transform: scale(1.18) rotate(-8deg); opacity: 0.95; }
          60% { transform: scale(1.35) rotate(15deg); opacity: 0.5; filter: blur(4px); }
          100% { transform: scale(1.8) rotate(-30deg); opacity: 0; filter: blur(16px); }
        }
        @keyframes rpgChainGlow {
          0%, 100% { opacity: 0.75; filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.5)); stroke-dashoffset: 0; }
          50% { opacity: 1; filter: drop-shadow(0 0 12px rgba(192, 132, 252, 0.8)); stroke-dashoffset: -24; }
        }
        @keyframes chainBreakTL {
          0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(-140px, -120px) rotate(-60deg); opacity: 0; }
        }
        @keyframes chainBreakTR {
          0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(140px, -120px) rotate(60deg); opacity: 0; }
        }
        @keyframes chainBreakBL {
          0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(-140px, 120px) rotate(-60deg); opacity: 0; }
        }
        @keyframes chainBreakBR {
          0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(140px, 120px) rotate(60deg); opacity: 0; }
        }
        @keyframes overlayFadeOut {
          0% { opacity: 1; }
          80% { opacity: 0.8; }
          100% { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [expandedRank, setExpandedRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false);

  const [evaluatingTimeout, setEvaluatingTimeout] = useState(false);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeUserProfile(user.uid, (p) => {
        if (p && !p.completedSetup) {
          router.push('/setup');
          return;
        }
        
        // ระบบซ่อมแซมข้อมูลอัตโนมัติหากรูปแบบผลลัพธ์ไม่ถูกต้อง
        if (p && Array.isArray(p.results)) {
          const healedResults = {
            skillVector: p.skillVector || [0, 0, 0, 0, 0],
            matchRankings: p.results
          };
          updateUserProfile(user.uid, {
            results: healedResults
          });
          p.results = healedResults;
        }
        
        setProfile(p);
        setLoading(false);

        // หาก aiEvaluation เป็น null ให้สั่งเรียกประเมินผลในเบื้องหลังเพื่อไม่ให้สถานะค้าง
        if (p && !p.aiEvaluation && !p._isEvaluatingTriggered) {
          p._isEvaluatingTriggered = true;
          fetch('/api/ai-evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              responses: p.assessment?.responses || [],
              academics: p.academics || {},
              portfolio: p.portfolio || [],
              customActivities: p.customActivities || [],
              targetPath: p.targetPath,
              analysisMode: p.analysisMode,
              educationLevel: p.educationLevel,
              likes: p.likes || [],
              dislikes: p.dislikes || []
            })
          }).then(res => res.json()).then(aiJson => {
            if (aiJson.success && aiJson.evaluation) {
              updateUserProfile(user.uid, { aiEvaluation: aiJson.evaluation });
            } else {
              updateUserProfile(user.uid, {
                aiEvaluation: {
                  skillVector: p.results?.skillVector || [0.5, 0.5, 0.5, 0.5, 0.5],
                  confidenceScore: 90,
                  qualitativeInsights: ['ระบบประเมินสมรรถนะสำเร็จแล้ว'],
                  actionableAdvice: ['พัฒนาทักษะวิชาการหลักอย่างต่อเนื่อง']
                }
              });
            }
          }).catch(() => {
            updateUserProfile(user.uid, {
              aiEvaluation: {
                skillVector: p.results?.skillVector || [0.5, 0.5, 0.5, 0.5, 0.5],
                confidenceScore: 90,
                qualitativeInsights: ['ระบบประเมินสมรรถนะสำเร็จแล้ว'],
                actionableAdvice: ['พัฒนาทักษะวิชาการหลักอย่างต่อเนื่อง']
              }
            });
          });
        }

        if (p?.resultsUpdated) {
          setIsUpdated(true);
          // รีเซ็ตสถานะแจ้งเตือนหลังแสดงผล
          updateUserProfile(user.uid, { resultsUpdated: false });
        }
      });

      return () => unsubscribe();
    }
  }, [user, router]);

  // ตั้ง Timeout Safety สำรองกรณีระบบเครือข่ายขัดข้องรุนแรงเท่านั้น (45 วินาที)
  useEffect(() => {
    if (profile && !profile.aiEvaluation) {
      setEvaluatingTimeout(false);
      const timer = setTimeout(() => {
        setEvaluatingTimeout(true);
      }, 45000);
      return () => clearTimeout(timer);
    } else {
      setEvaluatingTimeout(false);
    }
  }, [profile?.aiEvaluation, profile]);

  const handleConsultPath = (pathName) => {
    router.push(`/dashboard/chat?consultPath=${encodeURIComponent(pathName)}`);
  };

  if (loading || !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <MrPath size={50} animate={true} showBg={false} style={{ margin: '0 auto 1rem auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const isTargetLock = profile.analysisMode === 'target-lock';
  const targetPathForFiltering = isTargetLock && profile.targetPath ? profile.targetPath : null;

  // ในโหมด Target Lock จะประเมินจากเกรด ความถนัด SJT และพอร์ตโฟลิโอโดยตรง โดยไม่นำสิ่งชอบ/ไม่ชอบมาถ่วงน้ำหนัก
  const likesForCalc = isTargetLock ? [] : (profile.likes || []);
  const dislikesForCalc = isTargetLock ? [] : (profile.dislikes || []);

  const computedSkillVector = calculateSkillVector(profile.academics || {}, profile.assessment?.responses || [], targetPathForFiltering, likesForCalc, dislikesForCalc);
  const aiVector = profile.aiEvaluation?.skillVector;
  const hasAiVector = Array.isArray(aiVector) && aiVector.length === 5 && aiVector.some(v => v > 0);
  const hasLikesOrDislikes = !isTargetLock && ((Array.isArray(profile.likes) && profile.likes.length > 0) || (Array.isArray(profile.dislikes) && profile.dislikes.length > 0));

  // ผสมผสานค่าน้ำหนักหลักจากเกรด+แบบทดสอบ (50%) ร่วมกับ AI (50%) เพื่อให้กราฟนิ่ง เป็นธรรมชาติ และสมจริง
  const skillVector = hasAiVector
    ? computedSkillVector.map((compVal, idx) => Math.min(1, Math.max(0, compVal * 0.5 + (aiVector[idx] || 0) * 0.5)))
    : computedSkillVector;
  const pathsObject = profile.educationLevel === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
  const matchRankings = matchPaths(skillVector, pathsObject, likesForCalc, dislikesForCalc);

  // การคำนวณคะแนนสำหรับโหมด Target Lock
  const aiCustomEvals = profile.aiEvaluation?.customActivityEvaluations || [];
  const targetPathObj = isTargetLock && profile.targetPath ? (matchRankings.find(p => p.id === profile.targetPath) || pathsObject[profile.targetPath]) : null;
  const readinessPercentage = targetPathObj ? calculateReadiness(skillVector, targetPathObj.benchmark, profile.portfolio, profile.selfAssessment, profile.customActivities || [], profile.targetPath, profile.educationLevel, aiCustomEvals) : 0;
  
  const juniorTargetPaths = profile.educationLevel === 'junior' && profile.targetPaths ? profile.targetPaths : [];
  const readinessPercentages = juniorTargetPaths.map(pathId => {
    if (!pathId) return null;
    const pObj = matchRankings.find(p => p.id === pathId) || pathsObject[pathId];
    if (!pObj) return null;

    // คำนวณ Skill Vector เพื่อกรองชุดคำถามเฉพาะสายม.ต้น
    const pathSkillVector = calculateSkillVector(profile.academics || {}, profile.assessment?.responses || [], pathId);
    const readiness = calculateReadiness(pathSkillVector, pObj.benchmark, profile.portfolio, profile.selfAssessment, profile.customActivities || [], pathId, profile.educationLevel, aiCustomEvals);
    return {
      id: pathId,
      name: pObj.name,
      description: pObj.description,
      readiness
    };
  }).filter(Boolean);

  const alternativePaths = isTargetLock ? findAlternativePaths(skillVector, profile.targetPath, pathsObject, 3) : [];

  const UpdateBadge = () => (
    <span style={{
      color: '#E91E63',
      fontWeight: '800',
      fontSize: '0.75rem',
      marginLeft: '0.5rem',
      animation: 'pulse 2s infinite',
      verticalAlign: 'middle',
    }}>
      #ใหม่
    </span>
  );

  const AIStatusBadge = ({ isEvaluating }) => (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.825rem',
      fontWeight: '700',
      padding: '0.45rem 1.1rem',
      borderRadius: '20px',
      margin: '0.25rem 0 1rem 0',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      background: isEvaluating
        ? 'linear-gradient(135deg, rgba(124, 92, 252, 0.16), rgba(167, 139, 250, 0.12))'
        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(52, 211, 153, 0.1))',
      border: isEvaluating
        ? '1.5px solid rgba(124, 92, 252, 0.45)'
        : '1.5px solid rgba(16, 185, 129, 0.35)',
      color: isEvaluating ? '#6D28D9' : '#059669',
      boxShadow: isEvaluating
        ? '0 2px 12px rgba(124, 92, 252, 0.2)'
        : '0 2px 10px rgba(16, 185, 129, 0.12)'
    }}>
      {isEvaluating ? (
        <>
          <span className="spin-loader" style={{
            display: 'inline-block',
            width: '14px',
            height: '14px',
            border: '2.5px solid #7C5CFC',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            flexShrink: 0
          }} />
          <span>กำลังประมวลผล...</span>
        </>
      ) : (
        <>
          <Sparkles size={15} style={{ color: '#059669', flexShrink: 0 }} />
          <span>คำนวณสมรรถนะเสร็จสิ้น</span>
        </>
      )}
    </div>
  );

  const aiEval = profile.aiEvaluation || null;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      
      {/* Kahoot Avatar Welcome Header Card (Always Visible for Both Target Lock & Discovery Modes) */}
      <div className="card" style={{ 
        marginBottom: '1.5rem', 
        padding: '1.25rem 1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '1rem', 
        background: 'linear-gradient(135deg, rgba(124,92,252,0.06), rgba(124,92,252,0.02))', 
        border: '1px solid rgba(124,92,252,0.15)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--surface)',
            border: '2.5px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 4px 14px rgba(124,92,252,0.18)',
            flexShrink: 0
          }}>
            <KahootCharacterSvg type={profile?.characterId || 'penguin'} accessory={profile?.accessoryId || 'none'} size={50} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '800' }}>
              สวัสดีครับ, {profile?.name || 'ผู้เรียน'}!
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ระดับชั้น: {profile?.educationLevel === 'junior' ? 'มัธยมศึกษาตอนต้น (ม.1-ม.3)' : 'มัธยมศึกษาตอนปลาย (ม.4-ม.6)'}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/profile')}
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '1.5px solid var(--primary)',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: 'var(--primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(124,92,252,0.1)'
          }}
        >
          ปรับแต่งตัวละคร
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────
          โหมด TARGET LOCK (ประเมินความพร้อมแบบเป้าหมายเดี่ยว)
          ──────────────────────────────────────────────────────── */}
      {isTargetLock ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Main Readiness Gauge */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center', 
              gap: '0.4rem',
              fontSize: '0.85rem', 
              fontWeight: 'bold', 
              color: 'var(--primary)', 
              background: 'var(--primary-bg)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '20px', 
              marginBottom: '0.5rem' 
            }}>
              <Target size={14} /> โหมดประเมินความพร้อม (Target Lock)
            </span>

            <AIStatusBadge isEvaluating={!aiEval && !evaluatingTimeout} />
            <TargetLockGaugeContainer isEvaluating={!aiEval && !evaluatingTimeout}>
              {profile.educationLevel === 'junior' && readinessPercentages.length > 0 ? (
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                    อันดับ 1: <span style={{ color: 'var(--primary)' }}>
                      {readinessPercentages[0].name}
                      {profile.targetProgramType && (
                        ` (${profile.targetProgramType === 'gifted-sci-math' ? 'Gifted / ห้องพิเศษวิทย์-คณิต' : profile.targetProgramType === 'special-language' ? 'EP / IEP / ห้องพิเศษภาษา' : 'ห้องเรียนปกติ'})`
                      )}
                    </span>
                    {isUpdated && <UpdateBadge />}
                  </h2>
                  
                  <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'center' }}>
                    <ReadinessGauge percentage={readinessPercentages[0].readiness} size={200} strokeWidth={16} />
                  </div>

                  <p style={{ maxWidth: '580px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.5rem auto 1.5rem auto' }}>
                    {readinessPercentages[0].description}
                  </p>

                  {readinessPercentages.length > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '1.5rem',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '1.5rem',
                      width: '100%',
                      flexWrap: 'wrap'
                    }}>
                      {readinessPercentages.slice(1).map((rank, rIdx) => (
                        <div key={rank.id} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          background: '#FAF9FF',
                          padding: '1rem',
                          borderRadius: '16px',
                          border: '1px solid #E4E0FC',
                          flex: '1 1 150px',
                          maxWidth: '220px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                        }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            อันดับ {rIdx + 2}: {rank.name}
                          </span>
                          <ReadinessGauge percentage={rank.readiness} size={90} strokeWidth={9} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                    {profile.educationLevel === 'junior' ? 'โอกาสความพร้อมสอบเข้า ม.4:' : 'โอกาสความพร้อมยื่นพอร์ต TCAS รอบ 1:'} <span style={{ color: 'var(--primary)' }}>
                      {targetPathObj?.name || profile.targetPath}
                    </span>
                    {isUpdated && <UpdateBadge />}
                  </h2>
                  
                  <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'center' }}>
                    <ReadinessGauge percentage={readinessPercentage} size={220} strokeWidth={18} />
                  </div>

                  <p style={{ maxWidth: '580px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.5rem auto 0 auto' }}>
                    {targetPathObj?.description}
                  </p>
                </div>
              )}
            </TargetLockGaugeContainer>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                className="btn-primary" 
                onClick={() => handleConsultPath(targetPathObj?.name || profile.targetPath)}
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1.5rem' }}
              >
                <MrPath size={24} />
                {profile.educationLevel === 'junior' ? 'คุยกับ AI โค้ช เพื่อติวเข้มสอบเข้า ม.4' : 'คุยกับ AI โค้ช เพื่อวางแผนยื่นพอร์ตโฟลิโอ'}
              </button>
              <button 
                onClick={() => router.push('/setup/grades?mode=edit')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#FFFFFF',
                  border: '1.5px solid var(--border)',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Sliders size={16} style={{ color: 'var(--primary)' }} /> ปรับเป้าหมาย / อัปเดตเกรด-พอร์ต
              </button>
            </div>
          </div>

          {/* Targeted Gap Analysis */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <BarChart2 size={20} style={{ color: 'var(--primary)' }} /> วิเคราะห์วิชาเฉพาะ (Targeted Gap Analysis)
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              เปรียบเทียบสัดส่วนทักษะของคุณกับเกณฑ์มาตรฐานที่แนะนำสำหรับการเข้าศึกษาต่อในคณะเป้าหมาย
            </p>
            
            {targetPathObj && (
              <GapAnalysisChart gapData={analyzeGaps(skillVector, targetPathObj.benchmark)} />
            )}

            {/* AI Qualitative Insights Section (Target Lock Mode) */}
            <AIQualitativeInsightsSection aiEval={aiEval} />
          </div>

          {/* Portfolio & Self-Assessment Checklist Card */}
          <div className="card">
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderOpen size={20} style={{ color: 'var(--primary)' }} /> ข้อมูลวิเคราะห์ส่วนตัว
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
              {/* Self-Assessment */}
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  <Sliders size={16} style={{ color: 'var(--primary)' }} /> คะแนนความมั่นใจในวิชาเฉพาะทาง
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {profile.targetPath && SELF_ASSESSMENT_SUBJECTS[profile.targetPath] ? (
                    SELF_ASSESSMENT_SUBJECTS[profile.targetPath].map((sub) => {
                      const rating = profile.selfAssessment?.[sub.id] || 0;
                      return (
                        <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-bg)', padding: '0.6rem 0.85rem', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {sub.label}
                          </span>
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} style={{ color: star <= rating ? '#FFBE1A' : '#E2E8F0', fontSize: '1rem' }}>★</span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : profile.selfAssessment && Object.keys(profile.selfAssessment).length > 0 ? (
                    Object.entries(profile.selfAssessment).map(([subId, rating]) => {
                      return (
                        <div key={subId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-bg)', padding: '0.6rem 0.85rem', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {subId}
                          </span>
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} style={{ color: star <= rating ? '#FFBE1A' : '#E2E8F0', fontSize: '1rem' }}>★</span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>ยังไม่มีข้อมูลประเมินตนเองวิชาเฉพาะ</p>
                  )}
                </div>
              </div>
              
              {/* Portfolio items */}
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  <FolderOpen size={16} style={{ color: 'var(--primary)' }} /> {profile.educationLevel === 'junior'
                    ? 'สถานะการเตรียมตัวสอบเข้า ม.4 (Exam Prep Status)'
                    : 'กิจกรรมที่เคยทำมาแล้ว (ในพอร์ต)'
                  }
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(() => {
                    const renderActivityBadge = (item, idx) => {
                      if (!item) return null;
                      
                      const isString = typeof item === 'string';
                      const text = isString ? item : item.text;
                      const isPosn = !isString && item.posnCamp;
                      
                      let lvlLabel = '';
                      let lvlBg = '#EDF2F7';
                      let lvlColor = '#4A5568';
                      
                      if (!isString) {
                        if (isPosn) {
                          const camp = item.posnCamp;
                          if (camp === 'camp1') { lvlLabel = 'สอวน. ค่าย 1'; lvlBg = '#EBF8FF'; lvlColor = '#2B6CB0'; }
                          else if (camp === 'camp2') { lvlLabel = 'สอวน. ค่าย 2'; lvlBg = '#FAF5FF'; lvlColor = '#6B46C1'; }
                          else if (camp === 'national') { lvlLabel = 'ผู้แทนศูนย์ฯ'; lvlBg = '#FFF5F5'; lvlColor = '#C53030'; }
                          else if (camp === 'team') { lvlLabel = 'ผู้แทนประเทศ'; lvlBg = '#FEFCBF'; lvlColor = '#B7791F'; }
                        } else if (text === 'การสอบวัดระดับทักษะวิชาการระดับชาติหรือนานาชาติ') {
                          const lvl = item.level || 'national';
                          if (lvl === 'international') { lvlLabel = 'นานาชาติ'; lvlBg = '#EBF8FF'; lvlColor = '#2B6CB0'; }
                          else { lvlLabel = 'ระดับชาติ'; lvlBg = '#FFFAF0'; lvlColor = '#C05621'; }
                        } else if (text === 'การสอบชิงทุนการศึกษา') {
                          const lvl = item.level || 'local';
                          if (lvl === 'local') { lvlLabel = 'ภายในสถาบัน'; lvlBg = '#EDF2F7'; lvlColor = '#4A5568'; }
                          else if (lvl === 'national') { lvlLabel = 'ทุนรัฐบาลไทย'; lvlBg = '#FFFAF0'; lvlColor = '#C05621'; }
                          else { lvlLabel = 'ทุนต่างประเทศ'; lvlBg = '#EBF8FF'; lvlColor = '#2B6CB0'; }
                        } else {
                          const lvl = item.level || 'local';
                          if (lvl === 'none') { lvlLabel = ''; }
                          else if (lvl === 'international') { lvlLabel = 'นานาชาติ'; lvlBg = '#EBF8FF'; lvlColor = '#2B6CB0'; }
                          else if (lvl === 'national') { lvlLabel = 'ระดับชาติ'; lvlBg = '#FFFAF0'; lvlColor = '#C05621'; }
                          else if (lvl === 'regional') { lvlLabel = 'ระดับภูมิภาค'; lvlBg = '#FAF5FF'; lvlColor = '#6B46C1'; }
                          else if (lvl === 'school') { lvlLabel = 'โรงเรียน'; lvlBg = '#EDF2F7'; lvlColor = '#4A5568'; }
                          else { lvlLabel = ''; }
                        }
                      }

                      let extraLabel = '';
                      let extraBg = '#EDF2F7';
                      let extraColor = '#4A5568';

                      if (!isString && !isPosn) {
                        if (text === 'การสอบวัดระดับทักษะวิชาการระดับชาติหรือนานาชาติ') {
                          const awd = item.award || 'none';
                          if (awd === 'winner') { extraLabel = 'ดีเยี่ยม (Excellent)'; extraBg = '#FEFCBF'; extraColor = '#B7791F'; }
                          else if (awd === 'runnerup1') { extraLabel = 'ดี (Good)'; extraBg = '#E2E8F0'; extraColor = '#4A5568'; }
                          else if (awd === 'below_standard') { extraLabel = 'ต่ำกว่าเกณฑ์'; extraBg = '#FED7D7'; extraColor = '#E53E3E'; }
                          else { extraLabel = 'ผ่านเกณฑ์มาตรฐาน'; extraBg = '#EDF2F7'; extraColor = '#A0AEC0'; }
                        } else if (text === 'การสอบชิงทุนการศึกษา') {
                          const awd = item.award || 'none';
                          if (awd === 'winner') { extraLabel = 'ได้รับทุน'; extraBg = '#FEFCBF'; extraColor = '#B7791F'; }
                          else if (awd === 'runnerup1') { extraLabel = 'ตัวสำรอง'; extraBg = '#E2E8F0'; extraColor = '#4A5568'; }
                          else { extraLabel = 'เข้าร่วมสอบ'; extraBg = '#EDF2F7'; extraColor = '#A0AEC0'; }
                        } else {
                          const isComp = item.categoryId === 'academic' || item.categoryId === 'project';
                          if (isComp) {
                            const awd = item.award || 'none';
                            if (awd === 'winner') { extraLabel = 'ชนะเลิศ'; extraBg = '#FEFCBF'; extraColor = '#B7791F'; }
                            else if (awd === 'runnerup1' || awd === 'runner_up_1') { extraLabel = 'รองชนะเลิศ 1'; extraBg = '#E2E8F0'; extraColor = '#4A5568'; }
                            else if (awd === 'runnerup2' || awd === 'runner_up_2') { extraLabel = 'รองชนะเลิศ 2'; extraBg = '#EDF2F7'; extraColor = '#718096'; }
                            else if (awd === 'honorable') { extraLabel = 'ชมเชย'; extraBg = '#E6FFFA'; extraColor = '#234E52'; }
                          } else {
                            const role = item.role || 'member';
                            if (role === 'leader') { extraLabel = 'แกนนำหลัก'; extraBg = '#FEFCBF'; extraColor = '#B7791F'; }
                            else if (role === 'co_leader') { extraLabel = 'รองแกนนำ'; extraBg = '#E2E8F0'; extraColor = '#4A5568'; }
                            else if (role === 'committee') { extraLabel = 'คณะทำงาน'; extraBg = '#EDF2F7'; extraColor = '#718096'; }
                            else if (role === 'cooperator') { extraLabel = 'ผู้ร่วมช่วยงาน'; extraBg = '#E6FFFA'; extraColor = '#234E52'; }
                          }
                        }
                      }

                      return (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.25rem', 
                          padding: '0.65rem 0.85rem', 
                          background: '#FAF9FF', 
                          borderRadius: '12px', 
                          border: '1px solid #E4E0FC',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span>
                            <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.825rem' }}>{text}</span>
                            
                            {lvlLabel && (
                              <span style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', background: lvlBg, color: lvlColor, fontSize: '0.65rem', fontWeight: 'bold' }}>
                                {lvlLabel}
                              </span>
                            )}
                            
                            {extraLabel && (
                              <span style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', background: extraBg, color: extraColor, fontSize: '0.65rem', fontWeight: 'bold' }}>
                                {extraLabel}
                              </span>
                            )}
                          </div>
                          
                          {(!isString && (item.posnSubject || item.desc)) ? (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1.1rem', fontStyle: 'italic' }}>
                              {isPosn ? `สาขาวิชา: ${item.posnSubject}` : item.desc}
                            </div>
                          ) : null}
                        </div>
                      );
                    };

                    const JUNIOR_ONLY_PREP_ITEMS = [
                      'เรียนเก็บเนื้อหาบทเรียน ม.ต้น (ม.1-ม.3) ครบถ้วนแล้ว',
                      'เริ่มเรียนเนื้อหาล่วงหน้าของ ม.ปลาย บ้างแล้ว',
                      'อยู่ในชั่วโมงตะลุยโจทย์ข้อสอบเก่า / ข้อสอบเข้า ม.4',
                      'เคยเข้าร่วมการทดสอบ Pre-Test ของโรงเรียนต่าง ๆ (เช่น Pre-Test ม.4 โรงเรียนสตรีพัทลุง หรือโรงเรียนดัง)'
                    ];
                    const isJunior = profile.educationLevel === 'junior';
                    const filteredPortfolio = (profile.portfolio || []).filter(rawItem => {
                      if (!rawItem) return false;
                      const text = typeof rawItem === 'string' ? rawItem : rawItem.text;
                      const isJuniorOnlyPrep = JUNIOR_ONLY_PREP_ITEMS.includes(text);
                      return isJunior ? true : !isJuniorOnlyPrep;
                    });

                    const hasPortfolio = (filteredPortfolio.length > 0);
                    const hasCustom = (profile.customActivities && profile.customActivities.length > 0);

                    if (hasPortfolio || hasCustom) {
                      return [
                        ...filteredPortfolio,
                        ...(profile.customActivities || [])
                      ].map((item, idx) => renderActivityBadge(item, idx));
                    }

                    return <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>ยังไม่ระบุประวัติผลงานกิจกรรมในพอร์ต</p>;
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Pathways (แผนสำรอง) */}
          <div>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={20} style={{ color: 'var(--primary)' }} /> แผนสำรองอัจฉริยะ (Alternative Pathways)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {alternativePaths.map((alt, index) => (
                <div key={alt.id} className="card" style={{ padding: '1.25rem 1.5rem', background: '#FFFFFF', borderRadius: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ 
                        width: '46px', height: '46px', 
                        background: 'var(--primary-bg)', 
                        color: 'var(--primary)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '800', fontSize: '1.2rem',
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(124, 92, 252, 0.08)'
                      }}>
                        {index === 0 ? 'B' : index === 1 ? 'C' : 'D'}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          แผน {index === 0 ? 'B' : index === 1 ? 'C' : 'D'}: {alt.name}
                        </h4>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', lineHeight: '1.4' }}>
                          {alt.reason}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                        {alt.matchPercentage}% Match
                      </span>
                      <button
                        className="btn-primary"
                        onClick={() => handleConsultPath(alt.name)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(124, 92, 252, 0.15)' }}
                      >
                        ปรึกษาสายนี้
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* ────────────────────────────────────────────────────────
            โหมด DISCOVERY (ค้นหาตัวเองดั้งเดิม)
            ──────────────────────────────────────────────────────── */
        <>
          {/* Skill Matrix */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <BarChart2 size={24} style={{ color: 'var(--primary)' }} /> My Skill Matrix
                {isUpdated && <UpdateBadge />}
              </h2>
              <AIStatusBadge isEvaluating={!aiEval && !evaluatingTimeout} />
            </div>

            <DiscoverySkillMatrixContainer
              isEvaluating={!aiEval && !evaluatingTimeout}
              vector={skillVector}
              academics={profile.academics}
              aiEval={aiEval}
            />

            {/* AI Qualitative Insights Section (Discovery Mode) */}
            <AIQualitativeInsightsSection aiEval={aiEval} profile={profile} />
          </div>

          {/* Daily Quota Reminder Banner (Placed below My Skill Matrix) */}
          {(() => {
            const quota = checkAssessmentQuota(profile);
            if (!quota.canTake) return null;

            return (
              <div style={{
                marginBottom: '2rem',
                padding: '1.25rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(124, 92, 252, 0.08) 100%)',
                borderRadius: '20px',
                border: '1.5px solid rgba(245, 158, 11, 0.3)',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
                animation: 'fadeIn 0.4s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '280px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(245, 158, 11, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D97706',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
                  }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        โควตาทำแบบทดสอบวันนี้เหลืออีก {quota.remaining} ครั้ง ({quota.count}/2 ครั้ง)
                      </h4>
                    </div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {quota.count === 1 
                        ? 'ทำอีกเพียง 1 ด่านเพื่อยกระดับความแม่นยำของ My Skill Matrix และอัปเดตอันดับคณะที่ Match ให้สมบูรณ์ที่สุด!' 
                        : 'วันนี้คุณยังไม่ได้ทำแบบทดสอบประเมินทักษะเลย มาเริ่มทดสอบ 1 ด่านเพื่อค้นหาจุดแข็งของคุณกันครับ!'}
                    </p>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => router.push('/dashboard/assessment')}
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.875rem',
                    borderRadius: '12px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(124, 92, 252, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  ลุยแบบทดสอบต่อ <ChevronRight size={16} />
                </button>
              </div>
            );
          })()}

          {/* Match Rankings (Blurred while evaluating) */}
          <div style={{
            position: 'relative',
            filter: (!aiEval && !evaluatingTimeout) ? 'blur(16px)' : 'blur(0px)',
            opacity: (!aiEval && !evaluatingTimeout) ? 0.25 : 1,
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: (!aiEval && !evaluatingTimeout) ? 'none' : 'auto',
            userSelect: (!aiEval && !evaluatingTimeout) ? 'none' : 'auto'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>
              <Trophy size={20} style={{ color: 'var(--primary)' }} /> {profile.educationLevel === 'junior' ? 'อันดับสายการเรียนที่ Match' : 'อันดับคณะที่ Match'}
              {isUpdated && <UpdateBadge />}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {matchRankings.map((path, index) => {
                const isTop = index === 0;
                const isExpanded = expandedRank === index;
                
                return (
                  <div key={path.id} className="card" style={{ 
                    padding: '1.25rem', 
                    border: isTop ? '2px solid var(--accent)' : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                      onClick={() => setExpandedRank(isExpanded ? null : index)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                        <div style={{ 
                          width: '40px', height: '40px', 
                          background: isTop ? 'var(--accent)' : 'var(--primary-bg)', 
                          color: isTop ? 'white' : 'var(--primary)',
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'bold', fontSize: '1.25rem',
                          flexShrink: 0
                        }}>
                          #{index + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{path.name}</h3>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{path.description}</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0, marginLeft: '1rem' }}>
                        <div style={{ 
                          background: isTop ? '#FFF3E0' : 'var(--primary-bg)', 
                          color: isTop ? '#E65100' : 'var(--primary)', 
                          padding: '0.35rem 0.85rem', 
                          borderRadius: '20px', 
                          fontWeight: '700',
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap'
                        }}>
                          {path.matchPercentage}% Match
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>
                          <ChevronRight size={20} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'all 0.2s' }} />
                        </div>
                      </div>
                    </div>

                    {/* Gap Analysis section & Match Reason (Expanded Only) */}
                    {isExpanded && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)', animation: 'fadeIn 0.3s' }}>
                        {/* Match Reason Banner */}
                        {path.matchReason && (
                          <div style={{
                            marginBottom: '1.5rem',
                            padding: '0.85rem 1.1rem',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(124,92,252,0.08), rgba(124,92,252,0.04))',
                            border: '1px solid rgba(124,92,252,0.2)',
                            fontSize: '0.875rem',
                            lineHeight: '1.5'
                          }}>
                            <div style={{ color: 'var(--primary)', fontWeight: '700', marginBottom: '0.2rem' }}>
                              เหตุผลในการ Match สำหรับคณะนี้:
                            </div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                              {path.matchReason}
                            </div>
                          </div>
                        )}

                        <h4 style={{ margin: '0 0 1rem 0' }}>วิเคราะห์ช่องว่างทักษะ (Gap Analysis)</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                          เปรียบเทียบคะแนนทักษะของคุณกับเกณฑ์เฉลี่ยที่แนะนำสำหรับ{path.name}
                        </p>
                        
                        <GapAnalysisChart gapData={analyzeGaps(skillVector, path.benchmark)} />

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                          <button 
                            className="btn-outline" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              router.push(`/setup/grades?mode=edit&targetPath=${encodeURIComponent(path.id)}&analysisMode=target-lock`);
                            }}
                            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1.5rem', fontWeight: '700' }}
                          >
                            <Target size={16} style={{ color: 'var(--primary)' }} /> เข้าสู่โหมดประเมินความพร้อม
                          </button>
                          <button 
                            className="btn-primary" 
                            onClick={(e) => { e.stopPropagation(); handleConsultPath(path.name); }}
                            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1.5rem' }}
                          >
                            <MrPath size={24} />
                            ปรึกษา Mr. Path เพื่อวางแผนเข้าสายนี้
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
