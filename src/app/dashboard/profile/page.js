'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';
import { calculateSkillVector } from '@/lib/algorithms/skillVector';
import { matchPaths } from '@/lib/algorithms/cosineSimilarity';
import { User, Settings, Edit2, Compass, BookOpen, Globe, BookMarked, FlaskConical, Target } from 'lucide-react';

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

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(p => {
        if (p) {
          setProfile(p);
          setName(p.name || '');
          setGrade(p.grade || p.gradeLevel || '');
        }
      });
    }
  }, [user]);

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

      {/* Section 1: User Info */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 250px' }}>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.25rem' }}>ข้อมูลผู้ใช้</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              ข้อมูลนี้จะถูกใช้ใน PathFinder เพื่อให้ Mr. Path สามารถเรียกชื่อคุณได้อย่างถูกต้อง
            </p>
          </div>
          <div style={{ flex: '1 1 350px' }}>
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

            <button
              className="btn-primary"
              onClick={() => { handleSaveName(); handleSaveGrade(); }}
              disabled={saving}
              style={{ padding: '0.6rem 2rem', fontSize: '0.9rem' }}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
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
            <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.25rem' }}>เกรดวิชาหลัก</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              เกรดจะถูกแปลงเป็นเวกเตอร์ฐานรากทางวิชาการ (Academic Vector) เพื่อวิเคราะห์ช่องว่างสมรรถนะ (Gap Analysis)
            </p>
          </div>
          <div style={{ flex: '1 1 350px' }}>
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
