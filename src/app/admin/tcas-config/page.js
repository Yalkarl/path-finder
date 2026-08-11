'use client';
import { useState } from 'react';
import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';
import { Sliders, Save, CheckCircle2, ShieldCheck, RefreshCw, FileText, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminTcasConfigPage() {
  const router = useRouter();
  const [academicYear, setAcademicYear] = useState('2026');
  const [selectedPath, setSelectedPath] = useState('medicine');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Default weights state
  const [weights, setWeights] = useState({
    gpax: 10,
    tpat1: 30,
    alevelSci: 30,
    alevelMath: 20,
    tgat: 10
  });

  const [pdfParsing, setPdfParsing] = useState(false);

  const paths = { ...SENIOR_PATHS, ...JUNIOR_PATHS };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSimulatePdfParse = () => {
    setPdfParsing(true);
    setTimeout(() => {
      setWeights({
        gpax: 15,
        tpat1: 35,
        alevelSci: 25,
        alevelMath: 15,
        tgat: 10
      });
      setPdfParsing(false);
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F2F0FF 0%, #E8E4FF 100%)',
      padding: '2rem 1rem',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              border: '1px solid var(--border)',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}
          >
            <ArrowLeft size={16} /> กลับสู่ Dashboard
          </button>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'var(--primary-bg)',
            color: 'var(--primary)',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '700'
          }}>
            <ShieldCheck size={16} /> Admin Management System
          </span>
        </div>

        <div className="card" style={{ padding: '2rem', borderRadius: '24px', background: 'white', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, color: 'var(--text-primary)', fontSize: '1.4rem' }}>
            <Sliders style={{ color: 'var(--primary)' }} /> ระบบจัดการเกณฑ์ TCAS ประจำปีการศึกษา (Admin Config)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            ปรับแต่งสัดส่วนค่าน้ำหนักเกณฑ์ยื่นรายปีการศึกษา หรือสกัดข้อมูลสัดส่วนจากไฟล์ระเบียบการ TCAS (PDF) เพื่ออัปเดต 5D Skill Vector Benchmark โดยไม่ต้องแตะโค้ด
          </p>

          <form onSubmit={handleSave}>
            {/* Year & Faculty Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  ปีการศึกษา TCAS:
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border)', fontWeight: '600', outline: 'none' }}
                >
                  <option value="2026">TCAS 69 (ปีการศึกษา 2569)</option>
                  <option value="2025">TCAS 68 (ปีการศึกษา 2568)</option>
                  <option value="2024">TCAS 67 (ปีการศึกษา 2567)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  เลือกคณะ/สาขาเป้าหมาย:
                </label>
                <select
                  value={selectedPath}
                  onChange={(e) => setSelectedPath(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border)', fontWeight: '600', outline: 'none' }}
                >
                  {Object.values(paths).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* PDF Scraper Simulation Card */}
            <div style={{ background: '#FAF9FF', border: '1.5px dashed var(--primary)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText style={{ color: 'var(--primary)' }} size={20} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>PDF Text Extractor Engine</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ทดสอบสกัดเปอร์เซ็นต์จากไฟล์ระเบียบการ TCAS (PDF)</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulatePdfParse}
                  disabled={pdfParsing}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <RefreshCw size={14} className={pdfParsing ? 'animate-spin' : ''} />
                  {pdfParsing ? 'กำลังสกัดข้อมูลจาก PDF...' : 'สกัดข้อมูลจาก PDF ตัวอย่าง'}
                </button>
              </div>
            </div>

            {/* Weight Inputs */}
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              สัดส่วนค่าน้ำหนักเกณฑ์คัดเลือก (%) — [ คณะ: {paths[selectedPath]?.name || selectedPath} ]
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>1. GPAX สะสม (เกรดเฉลี่ยสะสม)</span>
                <input
                  type="number"
                  value={weights.gpax}
                  onChange={(e) => setWeights({ ...weights, gpax: parseFloat(e.target.value) || 0 })}
                  style={{ width: '80px', padding: '0.35rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: '700' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>2. TPAT1 (กสพท) / ความถนัดเฉพาะทาง</span>
                <input
                  type="number"
                  value={weights.tpat1}
                  onChange={(e) => setWeights({ ...weights, tpat1: parseFloat(e.target.value) || 0 })}
                  style={{ width: '80px', padding: '0.35rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: '700' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>3. A-Level สายวิทยาศาสตร์</span>
                <input
                  type="number"
                  value={weights.alevelSci}
                  onChange={(e) => setWeights({ ...weights, alevelSci: parseFloat(e.target.value) || 0 })}
                  style={{ width: '80px', padding: '0.35rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: '700' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>4. A-Level คณิตศาสตร์</span>
                <input
                  type="number"
                  value={weights.alevelMath}
                  onChange={(e) => setWeights({ ...weights, alevelMath: parseFloat(e.target.value) || 0 })}
                  style={{ width: '80px', padding: '0.35rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: '700' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>5. TGAT (สมรรถนะการทำงาน/ภาษา)</span>
                <input
                  type="number"
                  value={weights.tgat}
                  onChange={(e) => setWeights({ ...weights, tgat: parseFloat(e.target.value) || 0 })}
                  style={{ width: '80px', padding: '0.35rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: '700' }}
                />
              </div>
            </div>

            {savedSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F0FDF4', color: '#15803D', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>
                <CheckCircle2 size={18} /> บันทึกและแปลงเป็น 5D Skill Vector Benchmark เรียบร้อยแล้ว!
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: '700',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Save size={18} /> บันทึกและอัปเดตเกณฑ์ประจำปี
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
