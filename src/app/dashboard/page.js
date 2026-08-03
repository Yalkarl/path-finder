'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
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
import { Target, Sliders, BarChart2, FolderOpen, Lightbulb, Trophy, Compass, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [expandedRank, setExpandedRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(p => {
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
        if (p?.resultsUpdated) {
          setIsUpdated(true);
          // รีเซ็ตสถานะแจ้งเตือนหลังแสดงผล
          updateUserProfile(user.uid, { resultsUpdated: false });
        }
      });
    }
  }, [user, router]);

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

  const skillVector = calculateSkillVector(profile.academics || {}, profile.assessment?.responses || [], targetPathForFiltering);
  const pathsObject = profile.educationLevel === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
  const matchRankings = matchPaths(skillVector, pathsObject);

  // การคำนวณคะแนนสำหรับโหมด Target Lock
  const targetPathObj = isTargetLock && profile.targetPath ? (matchRankings.find(p => p.id === profile.targetPath) || pathsObject[profile.targetPath]) : null;
  const readinessPercentage = targetPathObj ? calculateReadiness(skillVector, targetPathObj.benchmark, profile.portfolio, profile.selfAssessment, profile.customActivities || [], profile.targetPath, profile.educationLevel) : 0;
  
  const juniorTargetPaths = profile.educationLevel === 'junior' && profile.targetPaths ? profile.targetPaths : [];
  const readinessPercentages = juniorTargetPaths.map(pathId => {
    if (!pathId) return null;
    const pObj = matchRankings.find(p => p.id === pathId) || pathsObject[pathId];
    if (!pObj) return null;

    // คำนวณ Skill Vector เพื่อกรองชุดคำถามเฉพาะสายม.ต้น
    const pathSkillVector = calculateSkillVector(profile.academics || {}, profile.assessment?.responses || [], pathId);
    const readiness = calculateReadiness(pathSkillVector, pObj.benchmark, profile.portfolio, profile.selfAssessment, profile.customActivities || [], pathId, profile.educationLevel);
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

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      
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
              marginBottom: '1rem' 
            }}>
              <Target size={14} /> โหมดประเมินความพร้อม (Target Lock)
            </span>
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
              <>
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                  โอกาสความพร้อมสอบเข้า: <span style={{ color: 'var(--primary)' }}>
                    {targetPathObj?.name || profile.targetPath}
                  </span>
                  {isUpdated && <UpdateBadge />}
                </h2>
                
                <div style={{ margin: '1rem 0' }}>
                  <ReadinessGauge percentage={readinessPercentage} size={220} strokeWidth={18} />
                </div>

                <p style={{ maxWidth: '480px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '1rem' }}>
                  {targetPathObj?.description}
                </p>
              </>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                className="btn-primary" 
                onClick={() => handleConsultPath(targetPathObj?.name || profile.targetPath)}
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1.5rem' }}
              >
                <MrPath size={24} />
                คุยกับ AI โค้ช เพื่อติวเข้มวางแผนสอบเข้า
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

                    const JUNIOR_PREP_ITEMS = [
                      'เรียนเก็บเนื้อหาบทเรียน ม.ต้น (ม.1-ม.3) ครบถ้วนแล้ว',
                      'เริ่มเรียนเนื้อหาล่วงหน้าของ ม.ปลาย บ้างแล้ว',
                      'อยู่ในชั่วโมงตะลุยโจทย์ข้อสอบเก่า / ข้อสอบเข้า ม.4',
                      'ผ่านคอร์สติวเข้มข้นเฉพาะสายวิชา (เช่น ติวเข้มคณิต-วิทย์ หรือคอร์สเตรียมโดม)',
                      'เคยเข้าร่วมการทดสอบ Pre-Test ของโรงเรียนต่าง ๆ (เช่น Pre-Test ม.4 โรงเรียนสตรีพัทลุง หรือโรงเรียนดัง)',
                      'เคยแข่งขันทักษะวิชาการระดับ ม.ต้น (เช่น งานศิลปหัตถกรรมนักเรียน)',
                      'เคยสอบแข่งขันวัดระดับระดับ ม.ต้น (เช่น สสวท. ม.ต้น, ASMO, TEDET)'
                    ];
                    const isJunior = profile.educationLevel === 'junior';
                    const filteredPortfolio = (profile.portfolio || []).filter(rawItem => {
                      if (!rawItem) return false;
                      const text = typeof rawItem === 'string' ? rawItem : rawItem.text;
                      const isJuniorItem = JUNIOR_PREP_ITEMS.includes(text);
                      return isJunior ? isJuniorItem : !isJuniorItem;
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
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <BarChart2 size={24} style={{ color: 'var(--primary)' }} /> My Skill Matrix
              {isUpdated && <UpdateBadge />}
            </h2>
            <div style={{ marginTop: '1.5rem' }}>
              <SkillRadarChart vector={skillVector} />
            </div>
          </div>

          {/* Match Rankings */}
          <div>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          width: '40px', height: '40px', 
                          background: isTop ? 'var(--accent)' : 'var(--primary-bg)', 
                          color: isTop ? 'white' : 'var(--primary)',
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'bold', fontSize: '1.25rem'
                        }}>
                          #{index + 1}
                        </div>
                        <div>
                          <h3 style={{ margin: 0 }}>{path.name}</h3>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{path.description}</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          background: isTop ? '#FFF3E0' : 'var(--primary-bg)', 
                          color: isTop ? '#E65100' : 'var(--primary)', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '20px', 
                          fontWeight: 'bold' 
                        }}>
                          {path.matchPercentage}% Match
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                          <ChevronRight size={18} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'all 0.2s' }} />
                        </div>
                      </div>
                    </div>

                    {/* Gap Analysis section (Expanded) */}
                    {isExpanded && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)', animation: 'fadeIn 0.3s' }}>
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
