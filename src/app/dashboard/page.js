'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
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

import AssessmentMusicPlayer from '@/components/ui/AssessmentMusicPlayer';

function TargetLockGaugeContainer({ isEvaluating, onPhaseChange, children }) {
  // scanning -> locking -> charged -> impact -> shatter -> complete
  const [phase, setPhase] = useState(isEvaluating ? 'scanning' : 'complete');
  const prevEvalRef = useRef(null);
  const audioElemRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeoutsRef = useRef([]);

  // Clear timers and animation frames safely
  const stopTracking = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  const updatePhase = useCallback((newPhase) => {
    setPhase(newPhase);
    onPhaseChange?.(newPhase);
  }, [onPhaseChange]);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Listen to global sound change event
  useEffect(() => {
    const handleSoundChange = (e) => {
      const isMuted = e?.detail?.muted ?? (localStorage.getItem('pathfinder_audio_muted') === 'true');
      if (isMuted && audioElemRef.current) {
        audioElemRef.current.pause();
      } else if (!isMuted && audioElemRef.current && phaseRef.current !== 'complete') {
        audioElemRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('pathfinder_sound_change', handleSoundChange);
    return () => window.removeEventListener('pathfinder_sound_change', handleSoundChange);
  }, []);

  // Audio-driven time detector loop: locks at 6.8s, fires at 8.0s, never reveals early
  const startAudioSyncedSequence = useCallback(() => {
    stopTracking();
    updatePhase('scanning');

    const isMuted = typeof window !== 'undefined' && localStorage.getItem('pathfinder_audio_muted') === 'true';
    let audio = audioElemRef.current;
    if (!audio) {
      audio = new Audio('/audio/sniperv2.mp3');
      audio.preload = 'auto';
      audioElemRef.current = audio;
    }
    audio.currentTime = 0;
    // Start softly for gentle fade-in
    audio.volume = 0.05;

    if (!isMuted) {
      audio.play().catch(() => {
        // If autoplay is blocked without user interaction, visual timeline still runs smoothly
      });
    }

    // High-precision tracking of audio playback time
    const startTime = performance.now();
    const targetVolume = 0.65;
    const fadeInDuration = 2.5; // Smoothly fade in over 2.5 seconds

    const trackTime = () => {
      // Use real audio currentTime if playing, or wall-clock time if muted/blocked
      const currentTime = (audio && !audio.paused && audio.currentTime > 0)
        ? audio.currentTime
        : (performance.now() - startTime) / 1000;

      // Smooth volume fade-in (from soft 0.05 to full 0.65)
      if (audio && !isMuted && !audio.paused) {
        if (currentTime < fadeInDuration) {
          const ratio = Math.max(0, currentTime / fadeInDuration);
          audio.volume = Math.min(targetVolume, Math.max(0.05, 0.05 + (targetVolume - 0.05) * ratio));
        } else {
          audio.volume = targetVolume;
        }
      }

      if (currentTime < 5.8) {
        updatePhase('scanning');
      } else if (currentTime < 6.8) {
        updatePhase('locking');
      } else if (currentTime < 8.0) {
        updatePhase('charged'); // Hold lock firmly during bolt cocking
      } else if (currentTime < 8.15) {
        updatePhase('impact'); // Gunshot impact flash + screen shake at 8.0s!
      } else if (currentTime < 9.8) {
        updatePhase('shatter'); // Shockwave burst & shatter unblur
      } else {
        updatePhase('complete'); // Reveal readiness results only after shot & shockwave!
        return; // Stop animation loop
      }

      animFrameRef.current = requestAnimationFrame(trackTime);
    };

    animFrameRef.current = requestAnimationFrame(trackTime);
  }, [updatePhase]);

  useEffect(() => {
    if (isEvaluating) {
      // Actively evaluating: run the complete synced audio timeline
      startAudioSyncedSequence();
    } else if (!isEvaluating && prevEvalRef.current === null) {
      // Already evaluated prior to mounting: display results immediately
      updatePhase('complete');
    }
    prevEvalRef.current = isEvaluating;
  }, [isEvaluating, startAudioSyncedSequence, updatePhase]);

  // Clean up on component unmount only
  useEffect(() => {
    return () => {
      stopTracking();
      if (audioElemRef.current) {
        audioElemRef.current.pause();
        audioElemRef.current.currentTime = 0;
      }
    };
  }, []);

  const isScanning = phase === 'scanning';
  const isLocking = phase === 'locking';
  const isCharged = phase === 'charged';
  const isImpact = phase === 'impact';
  const isShatter = phase === 'shatter';
  const showScope = isScanning || isLocking || isCharged;

  // Purple progress ring: circumference for r=55 ≈ 345.6
  const progressCirc = 2 * Math.PI * 55;

  return (
    <div style={{
      position: 'relative', width: '100%', borderRadius: '20px', overflow: 'hidden',
      animation: isImpact ? 'tlScreenShake 0.15s ease-out' : 'none'
    }}>
      {/* Content */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%',
        filter: showScope ? 'blur(14px) saturate(0.7)' : isImpact ? 'blur(2px) brightness(1.5)' : 'blur(0px)',
        opacity: showScope ? 0.3 : 1,
        transition: isImpact ? 'all 0.1s ease-out' : isShatter ? 'filter 0.4s ease-out, opacity 0.4s ease-out' : 'all 0.8s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: phase !== 'complete' ? 'none' : 'auto',
        userSelect: phase !== 'complete' ? 'none' : 'auto'
      }}>
        {children}
      </div>

      {/* === Scope Overlay (Full Tactical Sniper HUD) === */}
      {showScope && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.5) 0%, rgba(245, 243, 255, 0.8) 60%, rgba(235, 230, 254, 0.94) 100%)',
          backdropFilter: 'blur(12px)', zIndex: 10, borderRadius: '20px',
          boxShadow: 'inset 0 0 50px rgba(124, 92, 252, 0.1)',
          border: '1px solid rgba(124, 92, 252, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', userSelect: 'none'
        }}>
          {/* Background Tech Grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.45,
            backgroundImage: `
              linear-gradient(to right, rgba(124, 92, 252, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(124, 92, 252, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }} />

          {/* 4 Corner Tech Brackets */}
          <div style={{ position: 'absolute', top: '14px', left: '16px', width: '22px', height: '22px', borderTop: '2.5px solid #7C5CFC', borderLeft: '2.5px solid #7C5CFC', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '14px', right: '16px', width: '22px', height: '22px', borderTop: '2.5px solid #7C5CFC', borderRight: '2.5px solid #7C5CFC', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '14px', left: '16px', width: '22px', height: '22px', borderBottom: '2.5px solid #7C5CFC', borderLeft: '2.5px solid #7C5CFC', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '14px', right: '16px', width: '22px', height: '22px', borderBottom: '2.5px solid #7C5CFC', borderRight: '2.5px solid #7C5CFC', pointerEvents: 'none' }} />

          {/* HUD Top Bar Telemetry */}
          <div style={{
            position: 'absolute', top: '14px', left: '44px', right: '44px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '10.5px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.8px',
            color: '#6D28D9', pointerEvents: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: isLocking || isCharged ? '#10B981' : '#F59E0B',
                boxShadow: isLocking || isCharged ? '0 0 8px #10B981' : '0 0 6px #F59E0B',
                animation: 'tlPulseDot 1.2s ease-in-out infinite'
              }} />
              <span>{isCharged ? 'TARGET LOCKED [ 100% ]' : isLocking ? 'LOCKING TARGET...' : 'ACQUIRING TARGET // AI OPTICS'}</span>
            </div>
            <div style={{ color: '#8B5CF6', opacity: 0.85 }}>ZOOM 4.8X // ELEV: +0.24°</div>
          </div>

          {/* HUD Bottom Bar Telemetry */}
          <div style={{
            position: 'absolute', bottom: '14px', left: '44px', right: '44px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '10px', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.6px',
            color: '#7C5CFC', opacity: 0.85, pointerEvents: 'none'
          }}>
            <div>SYS.DIAG: ACTIVE // TCAS-01</div>
            <div>STATUS: {isCharged ? 'ARMED & READY' : isLocking ? 'CALIBRATING...' : 'SCANNING VECTOR'}</div>
          </div>

          {/* Wandering scope group - moves during scanning, snaps center on lock */}
          <div style={{
            position: 'relative',
            width: '100%', height: '100%',
            animation: isScanning ? 'tlScopeWander 5.8s ease-in-out infinite' : 'none',
            transition: !isScanning ? 'transform 0.4s cubic-bezier(0.22,0.61,0.36,1)' : 'none',
            transform: !isScanning ? 'translate(0,0)' : undefined
          }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
              <defs>
                <linearGradient id="tlScopeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C5CFC" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <radialGradient id="tlLensGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(124, 92, 252, 0.08)" />
                  <stop offset="70%" stopColor="rgba(124, 92, 252, 0.02)" />
                  <stop offset="100%" stopColor="rgba(124, 92, 252, 0.18)" />
                </radialGradient>
              </defs>

              {/* Tactical Lens Shading Circle */}
              <circle cx="50%" cy="50%" r="130" fill="url(#tlLensGlow)" stroke="rgba(124, 92, 252, 0.25)" strokeWidth="1.5" />

              {/* Crosshair lines with central opening */}
              <line x1="0%" y1="50%" x2="42%" y2="50%" stroke="rgba(124,92,252,0.6)" strokeWidth="1.2" />
              <line x1="58%" y1="50%" x2="100%" y2="50%" stroke="rgba(124,92,252,0.6)" strokeWidth="1.2" />
              <line x1="50%" y1="0%" x2="50%" y2="42%" stroke="rgba(124,92,252,0.6)" strokeWidth="1.2" />
              <line x1="50%" y1="58%" x2="50%" y2="100%" stroke="rgba(124,92,252,0.6)" strokeWidth="1.2" />

              {/* Rangefinder Mil-dots on horizontal crosshair */}
              {[18, 26, 34, 66, 74, 82].map(p => (
                <circle key={`mh${p}`} cx={`${p}%`} cy="50%" r="2" fill="#D97706" opacity="0.8" />
              ))}

              {/* Elevation Hash marks on vertical crosshair */}
              {[20, 28, 36, 64, 72, 80].map(p => (
                <line key={`mv${p}`} x1="48.5%" y1={`${p}%`} x2="51.5%" y2={`${p}%`} stroke="#7C5CFC" strokeWidth="1.2" opacity="0.75" />
              ))}

              {/* Reticle Center Box / Target Locked Frame */}
              <rect x="calc(50% - 12px)" y="calc(50% - 12px)" width="24" height="24" fill={isCharged ? "rgba(16, 185, 129, 0.15)" : "none"} stroke={isCharged ? "#10B981" : "#F59E0B"} strokeWidth={isCharged ? "2" : "1.2"} strokeDasharray={isCharged ? "none" : "3 3"} style={{ filter: isCharged ? 'drop-shadow(0 0 8px #10B981)' : 'none', transition: 'all 0.2s ease' }} />
              <polygon points="50%,47% 53%,50% 50%,53% 47%,50%" fill={isCharged ? "#10B981" : "none"} stroke={isCharged ? "#10B981" : "#F59E0B"} strokeWidth="1.5" opacity={isCharged ? 1 : 0.85} />

              {/* Outer compass ring */}
              <circle cx="50%" cy="50%" r="130" fill="none" stroke="url(#tlScopeGrad)" strokeWidth="2" strokeDasharray="18 6 3 6"
                style={{ animation: 'tlRingSpin 12s linear infinite', transformOrigin: '50% 50%', filter: 'drop-shadow(0 0 6px rgba(124,92,252,0.3))' }} />

              {/* Middle dashed scope ring */}
              <circle cx="50%" cy="50%" r="85" fill="none" stroke="rgba(217, 119, 6, 0.45)" strokeWidth="1.5" strokeDasharray="10 6"
                style={{ animation: 'tlRingSpin 7s linear infinite reverse', transformOrigin: '50% 50%' }} />

              {/* 4 Scope cardinal markers (N/E/S/W ticks) */}
              <line x1="50%" y1="calc(50% - 130px)" x2="50%" y2="calc(50% - 120px)" stroke="#7C5CFC" strokeWidth="2.5" />
              <line x1="50%" y1="calc(50% + 120px)" x2="50%" y2="calc(50% + 130px)" stroke="#7C5CFC" strokeWidth="2.5" />
              <line x1="calc(50% - 130px)" y1="50%" x2="calc(50% - 120px)" y2="50%" stroke="#7C5CFC" strokeWidth="2.5" />
              <line x1="calc(50% + 120px)" y1="50%" x2="calc(50% + 130px)" y2="50%" stroke="#7C5CFC" strokeWidth="2.5" />

              {/* === PURPLE PROGRESS ARC === */}
              {/* Background track ring */}
              <circle cx="50%" cy="50%" r="55" fill="none" stroke="rgba(124,92,252,0.18)" strokeWidth="5" />
              {/* Filling purple arc */}
              <circle cx="50%" cy="50%" r="55" fill="none"
                stroke={isCharged ? '#7C5CFC' : '#8B5CF6'}
                strokeWidth={isCharged ? '6.5' : '4.5'}
                strokeLinecap="round"
                strokeDasharray={progressCirc}
                strokeDashoffset={isScanning ? undefined : 0}
                style={{
                  transformOrigin: '50% 50%',
                  transform: 'rotate(-90deg)',
                  filter: isCharged
                    ? 'drop-shadow(0 0 10px rgba(124,92,252,0.9)) drop-shadow(0 0 20px rgba(139,92,246,0.6))'
                    : isLocking
                    ? 'drop-shadow(0 0 6px rgba(124,92,252,0.6))'
                    : 'drop-shadow(0 0 3px rgba(124,92,252,0.35))',
                  animation: isScanning
                    ? `tlArcFillSlow 5.8s ease-in-out infinite`
                    : isLocking
                    ? `tlArcFillFast 1.0s cubic-bezier(0.22,0.61,0.36,1) forwards`
                    : 'none',
                  strokeDashoffset: isCharged ? 0 : undefined,
                  transition: isCharged ? 'stroke-width 0.3s ease, filter 0.3s ease' : 'none'
                }}
              />

              {/* Sonar sweep */}
              <circle cx="50%" cy="50%" r="42" fill="none" stroke="rgba(124,92,252,0.14)" strokeWidth="24"
                strokeDasharray="65 200"
                style={{ animation: 'tlRingSpin 2.5s linear infinite', transformOrigin: '50% 50%' }} />
            </svg>
          </div>

          {/* Charged glow pulse overlay */}
          {isCharged && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '20px',
              background: 'radial-gradient(circle at center, rgba(124,92,252,0.22) 0%, transparent 60%)',
              animation: 'tlChargedPulse 0.3s ease-in-out'
            }} />
          )}
        </div>
      )}

      {/* === Impact Flash === */}
      {isImpact && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20, borderRadius: '20px',
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(124,92,252,0.5) 40%, transparent 80%)',
          animation: 'tlImpactFlash 0.15s ease-out forwards'
        }} />
      )}

      {/* === Shockwave === */}
      {isShatter && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 15, borderRadius: '20px', pointerEvents: 'none', overflow: 'hidden'
        }}>
          {[0, 1, 2].map(i => (
            <div key={`ring-${i}`} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: '40px', height: '40px',
              marginLeft: '-20px', marginTop: '-20px',
              borderRadius: '50%',
              border: `${2.5 - i * 0.6}px solid rgba(124, 92, 252, ${0.7 - i * 0.2})`,
              boxShadow: `0 0 ${16 - i * 4}px rgba(124, 92, 252, ${0.3 - i * 0.08})`,
              animation: `tlShockwave 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) ${i * 0.08}s forwards`,
              opacity: 0
            }} />
          ))}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * 360;
            const dist = 70 + (i % 3) * 35;
            const tx = Math.cos(angle * Math.PI / 180) * dist;
            const ty = Math.sin(angle * Math.PI / 180) * dist;
            const size = 3 + (i % 3);
            return (
              <div key={`sp-${i}`} style={{
                position: 'absolute', left: '50%', top: '50%',
                width: `${size}px`, height: `${size}px`,
                marginLeft: `${-size / 2}px`, marginTop: `${-size / 2}px`,
                borderRadius: '50%',
                background: i % 3 === 0 ? '#A78BFA' : i % 3 === 1 ? '#7C5CFC' : '#fff',
                boxShadow: `0 0 ${size * 2}px ${i % 3 === 0 ? 'rgba(167,139,250,0.8)' : 'rgba(124,92,252,0.8)'}`,
                opacity: 0,
                animation: `tlSparkFly 0.55s cubic-bezier(0.22,0.61,0.36,1) ${i * 0.015}s forwards`,
                '--spark-tx': `${tx}px`, '--spark-ty': `${ty}px`,
              }} />
            );
          })}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            width: '14px', height: '14px', marginLeft: '-7px', marginTop: '-7px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fff 0%, rgba(124,92,252,0.6) 50%, transparent 100%)',
            boxShadow: '0 0 30px rgba(255,255,255,0.8), 0 0 50px rgba(124,92,252,0.4)',
            animation: 'tlCenterGlow 0.6s ease-out forwards'
          }} />
        </div>
      )}

      <style>{`
        @keyframes tlScopeWander {
          0%   { transform: translate(0px, 0px); }
          10%  { transform: translate(120px, -50px); }
          20%  { transform: translate(-100px, 60px); }
          30%  { transform: translate(140px, 40px); }
          40%  { transform: translate(-130px, -55px); }
          50%  { transform: translate(-60px, 65px); }
          60%  { transform: translate(150px, -30px); }
          70%  { transform: translate(-140px, 0px); }
          80%  { transform: translate(80px, 60px); }
          90%  { transform: translate(-50px, -60px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes tlRingSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes tlArcFillSlow {
          0%   { stroke-dashoffset: ${progressCirc}; }
          50%  { stroke-dashoffset: ${progressCirc * 0.35}; }
          100% { stroke-dashoffset: ${progressCirc}; }
        }
        @keyframes tlArcFillFast {
          0%   { stroke-dashoffset: ${progressCirc * 0.35}; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes tlChargedPulse {
          0%   { opacity: 0; }
          50%  { opacity: 1; }
          100% { opacity: 0.6; }
        }
        @keyframes tlScreenShake {
          0%   { transform: translate(0, 0); }
          20%  { transform: translate(-4px, 3px); }
          40%  { transform: translate(5px, -3px); }
          60%  { transform: translate(-3px, 4px); }
          80%  { transform: translate(3px, -2px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes tlImpactFlash {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes tlShockwave {
          0%   { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(18); opacity: 0; }
        }
        @keyframes tlSparkFly {
          0%   { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--spark-tx), var(--spark-ty)) scale(0.1); }
        }
        @keyframes tlCenterGlow {
          0%   { transform: scale(0); opacity: 1; }
          40%  { transform: scale(3); opacity: 0.8; }
          100% { transform: scale(5); opacity: 0; }
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
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isEvaluating) {
      setPhase('evaluating');
    }
    prevEvalRef.current = isEvaluating;
  }, [isEvaluating]);

  const isLocked = phase === 'evaluating';
  const isShattering = phase === 'shattering';
  const showOverlay = isLocked || isShattering;

  // 5 Constellation Star Vertices
  const radius = 115;
  const stars = [
    { name: 'ตรรกะ', en: 'LOGIC', angle: -Math.PI / 2, color: '#7C5CFC' },
    { name: 'วิทยาศาสตร์', en: 'SCIENCE', angle: -Math.PI / 2 + (2 * Math.PI) / 5, color: '#06B6D4' },
    { name: 'ภาษา', en: 'LANG', angle: -Math.PI / 2 + (4 * Math.PI) / 5, color: '#10B981' },
    { name: 'ศิลปะ', en: 'ART', angle: -Math.PI / 2 + (6 * Math.PI) / 5, color: '#F59E0B' },
    { name: 'การบริหาร', en: 'MGMT', angle: -Math.PI / 2 + (8 * Math.PI) / 5, color: '#EC4899' }
  ].map(s => ({
    ...s,
    x: Math.cos(s.angle) * radius,
    y: Math.sin(s.angle) * radius
  }));

  // Build outer pentagon & inner star lines
  const outerPolygonPoints = stars.map(s => `calc(50% + ${s.x}px),calc(50% + ${s.y}px)`).join(' ');
  const innerStarIndices = [0, 2, 4, 1, 3, 0];
  const innerStarPoints = innerStarIndices.map(i => `calc(50% + ${stars[i].x}px),calc(50% + ${stars[i].y}px)`).join(' ');

  return (
    <div style={{ position: 'relative', marginTop: '1.5rem', minHeight: '360px', borderRadius: '20px', overflow: 'hidden' }}>
      {/* Skill Radar Chart with Soft Ethereal Blur */}
      <div style={{
        filter: isLocked ? 'blur(10px)' : isShattering ? 'blur(3px)' : 'blur(0px)',
        opacity: isLocked ? 0.35 : isShattering ? 0.85 : 1,
        transform: isLocked ? 'scale(0.97)' : isShattering ? 'scale(0.99)' : 'scale(1)',
        transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: showOverlay ? 'none' : 'auto',
        userSelect: showOverlay ? 'none' : 'auto'
      }}>
        <SkillRadarChart vector={vector} academics={academics} aiEval={aiEval} />
      </div>

      {/* Constellation Skill Forge Overlay */}
      {showOverlay && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 50%, rgba(124, 92, 252, 0.08) 0%, rgba(255, 255, 255, 0.72) 100%)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
          borderRadius: '20px',
          animation: isShattering ? 'constellationFadeOut 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
        }}>
          {/* SVG Constellation Map */}
          <svg style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible'
          }}>
            <defs>
              {/* Star Glow Gradient */}
              <radialGradient id="starGlowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7C5CFC" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#7C5CFC" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C5CFC" />
                <stop offset="50%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>

            {/* Delicate Astrological Orbital Rings */}
            <circle cx="50%" cy="50%" r="65" fill="none" stroke="rgba(124, 92, 252, 0.12)" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="50%" cy="50%" r="115" fill="none" stroke="rgba(124, 92, 252, 0.18)" strokeWidth="1" />
            <circle cx="50%" cy="50%" r="160" fill="none" stroke="rgba(124, 92, 252, 0.15)" strokeWidth="1.2" strokeDasharray="4 16"
              style={{ animation: 'orbitRingSpin 24s linear infinite', transformOrigin: '50% 50%' }} />

            {/* Inner Star Chords (Faint geometric lines) */}
            <polyline
              points={innerStarPoints}
              fill="rgba(124, 92, 252, 0.03)"
              stroke="rgba(124, 92, 252, 0.22)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />

            {/* Outer Constellation Polygon Beam with Traveling Starlight Flow */}
            <polygon
              points={outerPolygonPoints}
              fill="rgba(124, 92, 252, 0.05)"
              stroke="url(#beamGrad)"
              strokeWidth="2"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(124, 92, 252, 0.35))',
                strokeDasharray: '12 6',
                animation: 'constellationBeamFlow 3s linear infinite'
              }}
            />

            {/* 5 Radiant Constellation Stars */}
            {stars.map((star, idx) => {
              const cx = `calc(50% + ${star.x}px)`;
              const cy = `calc(50% + ${star.y}px)`;
              return (
                <g key={idx}>
                  {/* Outer Pulsing Starlight Aura */}
                  <circle cx={cx} cy={cy} r="18" fill="none" stroke={isShattering ? '#10B981' : star.color} strokeWidth="1"
                    style={{
                      animation: `starlightPulse 2s ease-in-out infinite ${idx * 0.4}s`,
                      transformOrigin: `${cx} ${cy}`
                    }} />

                  {/* 4-Point Star Diamond Flare */}
                  <g style={{
                    animation: `starFlareSpin 8s linear infinite ${idx * 0.3}s`,
                    transformOrigin: `${cx} ${cy}`
                  }}>
                    <path
                      d={`M ${star.x} ${star.y - 10} Q ${star.x} ${star.y} ${star.x + 10} ${star.y} Q ${star.x} ${star.y} ${star.x} ${star.y + 10} Q ${star.x} ${star.y} ${star.x - 10} ${star.y} Z`}
                      fill={isShattering ? '#10B981' : star.color}
                      style={{
                        transform: `translate(calc(50% - 0px), calc(50% - 0px))`,
                        filter: `drop-shadow(0 0 6px ${isShattering ? '#10B981' : star.color})`
                      }}
                    />
                  </g>

                  {/* Star Core Dot */}
                  <circle cx={cx} cy={cy} r="4" fill="#FFFFFF" stroke={isShattering ? '#10B981' : star.color} strokeWidth="2" />

                  {/* Star Name Label */}
                  <text
                    x={`calc(50% + ${star.x * 1.28}px)`}
                    y={`calc(50% + ${star.y * 1.28 + 4}px)`}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize="11"
                    fontWeight="700"
                    style={{ letterSpacing: '0.02em', filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.8))' }}
                  >
                    {star.name}
                  </text>
                </g>
              );
            })}

            {/* Central Celestial Nexus Star */}
            <circle cx="50%" cy="50%" r="5" fill="#7C5CFC" style={{ filter: 'drop-shadow(0 0 8px #7C5CFC)' }} />
          </svg>

          {/* Minimalist Floating Constellation Telemetry Pill */}
          <div style={{
            position: 'absolute',
            bottom: '1.25rem',
            zIndex: 15,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.55rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            border: isShattering ? '1.5px solid #10B981' : '1.5px solid rgba(124, 92, 252, 0.3)',
            boxShadow: '0 8px 24px rgba(124, 92, 252, 0.12)',
            transition: 'all 0.3s ease'
          }}>
            <span style={{
              fontSize: '0.9rem',
              color: isShattering ? '#10B981' : '#7C5CFC',
              display: 'inline-block',
              animation: 'starTwinkle 1.5s ease-in-out infinite'
            }}>✦</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: '800',
                letterSpacing: '0.08em',
                color: isShattering ? '#059669' : '#7C5CFC',
                textTransform: 'uppercase',
                fontFamily: 'monospace'
              }}>
                {isShattering ? 'CONSTELLATION ALIGNED' : 'CONSTELLATION SKILL FORGE'}
              </span>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-secondary)'
              }}>
                {isShattering ? 'กลุ่มดาว 5 มิติทักษะเรียงตัวสมบูรณ์' : 'กำลังถักทอเส้นใยกลุ่มดาว 5 มิติทักษะ...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Constellation Keyframe Animations */}
      <style>{`
        @keyframes constellationBeamFlow {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -36; }
        }
        @keyframes orbitRingSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes starlightPulse {
          0%, 100% { r: 12; opacity: 0.4; }
          50%      { r: 20; opacity: 0.9; }
        }
        @keyframes starFlareSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes starTwinkle {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50%      { transform: scale(1.3); opacity: 1; filter: drop-shadow(0 0 6px #7C5CFC); }
        }
        @keyframes constellationFadeOut {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.03); pointer-events: none; }
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
  const [targetLockPhase, setTargetLockPhase] = useState('complete');

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeUserProfile(user.uid, (p) => {
        const hasCompleted = p && (p.completedSetup || p.results || p.academics);
        if (p && !hasCompleted) {
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

  const AIStatusBadge = ({ isEvaluating, label }) => {
    const defaultCompleteText = isTargetLock ? 'คำนวณสมรรถนะเสร็จสิ้น' : 'ประมวลผล 5 มิติทักษะเสร็จสิ้น';
    const completeText = label || defaultCompleteText;

    return (
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
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(251, 191, 36, 0.12))'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(52, 211, 153, 0.1))',
        border: isEvaluating
          ? '1.5px solid rgba(245, 158, 11, 0.45)'
          : '1.5px solid rgba(16, 185, 129, 0.35)',
        color: isEvaluating ? '#D97706' : '#059669',
        boxShadow: isEvaluating
          ? '0 2px 12px rgba(245, 158, 11, 0.2)'
          : '0 2px 10px rgba(16, 185, 129, 0.12)'
      }}>
        {isEvaluating ? (
          <>
            <span className="spin-loader" style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '2.5px solid #F59E0B',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              flexShrink: 0
            }} />
            <span>กำลังประมวลผล...</span>
          </>
        ) : (
          <>
            <Sparkles size={15} style={{ color: '#059669', flexShrink: 0 }} />
            <span>{completeText}</span>
          </>
        )}
      </div>
    );
  };

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

            <AIStatusBadge isEvaluating={(!aiEval && !evaluatingTimeout) || targetLockPhase === 'scanning'} />
            <TargetLockGaugeContainer isEvaluating={!aiEval && !evaluatingTimeout} onPhaseChange={setTargetLockPhase}>
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

          {/* Target Lock Evaluation Details (Blurred until Readiness Gauge finishes reveal) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            filter: targetLockPhase !== 'complete' ? 'blur(12px)' : 'blur(0px)',
            opacity: targetLockPhase !== 'complete' ? 0.3 : 1,
            pointerEvents: targetLockPhase !== 'complete' ? 'none' : 'auto',
            userSelect: targetLockPhase !== 'complete' ? 'none' : 'auto',
            transition: 'all 1.0s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
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
      {/* Floating Sound Toggle Button for both Target Lock & Discovery modes */}
      <AssessmentMusicPlayer />
    </div>
  );
}
