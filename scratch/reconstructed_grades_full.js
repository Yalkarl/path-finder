'use client';
import { useState, useEffect, Suspense } from 'react';
import MrPathGreeting from '@/components/setup/MrPathGreeting';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createUserProfile, getUserProfile, updateUserProfile } from '@/lib/firestore';
import { calculateSkillVector } from '@/lib/algorithms/skillVector';
import { matchPaths } from '@/lib/algorithms/cosineSimilarity';
import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';

const GRADE_OPTIONS = ['', '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4'];

const subjects = [
{ id: 'math', label: 'คณิตศาสตร์', icon: '📐' },
{ id: 'science', label: 'วิทยาศาสตร์ฯ', icon: '🔬' },
{ id: 'thai', label: 'ภาษาไทย', icon: '🇹🇭' },
{ id: 'english', label: 'ภาษาอังกฤษ', icon: '🌐' },
{ id: 'social', label: 'สังคมศึกษาฯ', icon: '📖' },
];

function GradesContent() {
const router = useRouter();
const searchParams = useSearchParams();
const { user } = useAuth();
const [loading, setLoading] = useState(false);
const [name, setName] = useState('');

const isEditMode = searchParams.get('mode') === 'edit';

const [grades, setGrades] = useState({
math: '',
science: '',
thai: '',
english: '',
social: '',
});

useEffect(()
<truncated 7003 bytes>
,
fontWeight: '600',
color: grades[subj.id] !== '' ? 'var(--primary)' : 'var(--text-secondary)',
textAlign: 'center',
cursor: 'pointer',
outline: 'none',
appearance: 'none',
WebkitAppearance: 'none',
MozAppearance: 'none',
}}
>
<option value="" disabled>เกรด</option>
{GRADE_OPTIONS.filter(v => v !== '').map((val) => (
<option key={val} value={val}>{val}</option>
))}
</select>
</div>
))}
</div>

<button
type="submit"
className="btn-primary"
style={{
width: '100%',
padding: '0.85rem',
fontSize: '1rem',
fontWeight: '700',
borderRadius: '14px',
opacity: allFilled ? 1 : 0.6,
cursor: allFilled ? 'pointer' : 'not-allowed',
}}
disabled={loading || !allFilled}
>
{loading
? 'กำลังบันทึกข้อมูล...'
: isEditMode
? 'บันทึก'
: 'ถัดไป →'}
</button>
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

The above content shows the entire, complete file contents of the requested file.
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

if (!savedName && !isEditMode) {
router.push('/setup/profile');
setSelfAssessment(JSON.parse(savedSelf));
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
posnCamp: isPosn ? 'camp1' : null
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

const handleSubmit = async (e) => {
e.preventDefault();
if (!user) return;

setLoading(true);
try {
const finalGrades = {
math: parseFloat(grades.math),
fontWeight: '600',
color: grades[subj.id] !== '' ? 'var(--primary)' : 'var(--text-secondary)',
textAlign: 'center',
cursor: 'pointer',
outline: 'none',
appearance: 'none',
WebkitAppearance: 'none',
MozAppearance: 'none',
}}
>
<option value="" disabled>เกรด</option>
{GRADE_OPTIONS.filter(v => v !== '').map((val) => (
<option key={val} value={val}>{val}</option>
))}
</select>
</div>
))}
</div>

<button
type="submit"
className="btn-primary"
style={{
width: '100%',
padding: '0.85rem',
fontSize: '1rem',
fontWeight: '700',
borderRadius: '14px',
opacity: allFilled ? 1 : 0.6,
cursor: allFilled ? 'pointer' : 'not-allowed',
}}
disabled={loading || !allFilled}
>
{loading
? 'กำลังบันทึกข้อมูล...'
: isEditMode
? 'บันทึก'
: 'ถัดไป →'}
</button>
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

.custom-input-box {
border: 2px dashed #D6D0F9;
border-radius: 12px;
padding: 0.85rem;
background: #FAF9FF;
box-shadow: 0 8px 24px rgba(124, 92, 252, 0.04);
grade: localStorage.getItem('setup_grade') || '',
academics: finalGrades,
analysisMode,
targetPath: analysisMode === 'target-lock' ? targetPath : null,
portfolio: analysisMode === 'target-lock' ? portfolio : [],
customActivities: analysisMode === 'target-lock' ? customList : [],
selfAssessment: analysisMode === 'target-lock' ? selfAssessment : {},
};

await createUserProfile(user.uid, profileData);
router.push('/assessment');
}
} catch (error) {
console.error("Error saving grades:", error);
} finally {
setLoading(false);
}
};

const allFilled = grades.math !== '' && grades.science !== '' && grades.thai !== '' && grades.english !== '' && grades.social !== '';
const isTargetLock = analysisMode === 'target-lock';
const isFormValid = allFilled && (!isTargetLock || targetPath !== '');
const paths = level === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;

return (
transition: all 0.2s ease;
}
.custom-input-box:focus-within {
border-color: var(--primary);
background: #FAF9FF;
}
@media (min-width: 1024px) {
.setup-container.split-view {
display: grid;
flex-direction: column;
gap: 1.5rem;
width: 100%;
}
.right-panel {
display: flex;
<span style={{ fontSize: '1.25rem' }}>{subj.icon}</span>
<span style={{ fontWeight: '600', color: 'var(--text-primary)' }} className="subject-label">
{subj.label}
</span>
</div>
<div style={{ position: 'relative', width: '100px' }}>
<select
value={grades[subj.id]}
onChange={(e) => setGrades({ ...grades, [subj.id]: e.target.value })}
style={{
width: '100%',
padding: '0.45rem 0.65rem',
borderRadius: '10px',
border: '1px solid var(--border)',
background: '#FFFFFF',
fontWeight: '600',
color: grades[subj.id] !== '' ? 'var(--primary)' : 'var(--text-secondary)',
textAlign: 'center',
cursor: 'pointer',
outline: 'none',
}}
required
>
<option value="" disabled>เกรด</option>
{GRADE_OPTIONS.filter(v => v !== '').map((val) => (
<option key={val} value={val}>{val}</option>
))}
</select>
</div>
</div>
))}
</div>
</div>

{/* Card 2: Analysis Mode Selection */}
<div className="card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
<h3 style={{ marginTop: 0, marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '700' }}>
🎯 โหมดการประเมิน
</h3>
<div style={{ display: 'flex', gap: '0.75rem' }}>
<div
onClick={() => setAnalysisMode('discovery')}
style={{
flex: 1,
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
<div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>🔍</div>
<div style={{ fontSize: '0.85rem', fontWeight: '700' }}>ค้นหาตัวตน</d
{/* LEFT PANEL */}
<div className={`left-panel ${isTargetLock ? 'sticky-left' : ''}`}>
{/* Mascot Greeting */}
<MrPathGreeting message="ใส่เกรดของแต่ละวิชาและเลือกเป้าหมายการวิเคราะห์ด้วยนะครับ 😊" />

{/* Card 1: เกรดวิชาหลัก */}
<div style={{
background: 'var(--surface)',
borderRadius: '20px',
padding: '1.5rem',
boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
border: '1px solid var(--border)',
}}>
<h3 style={{
marginTop: 0,
marginBottom: '1.25rem',
fontSize: '1rem',
fontWeight: '700',
color: 'var(--text-primary)',
borderBottom: '1px solid var(--border)',
paddingBottom: '0.75rem',
}}>
เกรดวิชาหลัก
</h3>

<div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
{subjects.map((subj) => (
<div
key={subj.id}
style={{
display: 'flex',
alignItems: 'center',
justifyContent: 'space-between',
padding: '0.7rem 0.85rem',
background: grades[subj.id] !== '' ? 'var(--primary-bg)' : '#F9F9FB',
borderRadius: '12px',
transition: 'background 0.2s ease',
}}
>
<div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
<span style={{ fontSize: '1.25rem' }}>{subj.icon}</span>
<span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
{subj.label}
</span>
</div>
<select
value={grades[subj.id]}
onChange={(e) => handleChange(subj.id, e.target.value)}
required
style={{
width: '90px',
padding: '0.45rem 0.5rem',
fontSize: '1rem',
fontWeight: '700',
color: 'var(--text-primary)',
borderBottom: '1px solid var(--border)',
paddingBottom: '0.75rem',
}}>
เกรดวิชาหลัก
</h3>

<div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
{subjects.map((subj) => (
<div
key={subj.id}
style={{
display: 'flex',
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
<option value="">-- เลือกสายการเรียนเป้าหมาย --</option>
{Object.values(paths).map((path) => (
<option key={path.id} value={path.id}>{path.name}</option>
))}
</select>
</div>

{/* Card 4: Portfolio Checklist */}
{targetPath && (
<div className="card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
<h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
📂 กิจกรรมและพอร์ตผลงาน (เลือกข้อที่ตรง)
</h3>
<p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 0, marginBottom: '1rem' }}>
ข้อมูลนี้จะช่วยให้ Mr. Path ทำการ Gap Analysis เพื่อแนะนำสิ่งที่ต้องทำเพิ่มเติมได้แม่นยำยิ่งขึ้นครับ
</p>

<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
{getPortfolioCategories(targetPath).map((cat) => {
const isExpanded = expandedCategories[cat.id];

<div key={cat.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF' }}>
<div
onClick={() => toggleCategory(cat.id)}
style={{
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
padding: '0.75rem 1rem',
background: isExpanded ? 'var(--primary-bg)' : '#FFFFFF',
cursor: 'pointer',
fontWeight: '700',
fontSize: '0.85rem',
color: isExpanded ? 'var(--primary)' : 'var(--text-primary)',
userSelect: 'none',
borderBottom: isExpanded ? '1px solid var(--border)' : 'none'
}}
className="accordion-header"
>
<span>{cat.label}</span>
<span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
{isExpanded ? '▲ ซ่อน' : '▼ ขยาย'}
</span>
</div>

{isExpanded && (
{isExpanded && (
<div style={{ padding: '1rem', background: '#FAFAFC', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
{/* Standard checkboxes */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
{cat.items.map((item) => {
const isChecked = portfolio.includes(item);
return (
<label key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
<input
type="checkbox"
checked={isChecked}
onChange={() => {
if (isChecked) {
setPortfolio(portfolio.filter(x => x !== item));
} else {
setPortfolio([...portfolio, item]);
}
}}
style={{ marginTop: '0.15rem', cursor: 'pointer' }}
borderBottom: isExpanded ? '1px solid var(--border)' : 'none'
}}
className="accordion-header"
>
<span>{cat.label}</span>
<span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
{isExpanded ? '▲ ซ่อน' : '▼ ขยาย'}
</span>
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
level: 'local',
award: 'none',
role: 'member',
count: 1,
desc: '',
posnCamp: isPosn ? 'camp1' : null
};

return (
<div key={item} style={{ 
display: 'flex', 
flexDirection: 'column', 
gap: '0.5rem', 
padding: '0.65rem',
background: isChecked ? '#FAF9FF' : 'transparent',
border: isChecked ? '1px solid #E4E0FC' : '1px solid transparent',
borderRadius: '12px',
transition: 'all 0.25s ease'
}}>
<label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: isChecked ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: isChecked ? '600' : 'normal' }}>
<input
type="checkbox"

type="checkbox"
checked={isChecked}
onChange={() => handleToggleItem(item, cat.id)}
style={{ marginTop: '0.15rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
/>
<span style={{ lineHeight: '1.3' }}>{item}</span>
</label>

{/* Inline Config Panel */}
{isChecked && (
<div style={{ 
display: 'flex', 
flexDirection: 'column', 
gap: '0.5rem', 
padding: '0.75rem', 
background: '#FFFFFF', 
borderRadius: '8px
}}
disabled={loading || !isFormValid}
>
</>
) : (
<>
<select
value={itemObj.posnCamp || 'camp1'}
onChange={(e) => handleUpdateItem(item, { posnCamp: e.target.value })}
style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
>
<option value="camp1">ค่าย 1</option>
<option value="camp2">ค่าย 2</option>
<option value="national">ค่าย 3 / ผู้แทนศูนย์ฯ</option>
<option value="team">ผู้แทนประเทศไทย</option>
</select>
</div>
) : (
/* Standard / Custom config */
<div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
<div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
<span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>ระดับ:</span>
<select
style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
>
<option value="คณิตศาสตร์">คณิตศาสตร์</option>
<option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
<option value="เคมี">เคมี</option>
<option value="ชีววิทยา">ชีววิทยา</option>
<option value="ฟิสิกส์">ฟิสิกส์</option>
<option value="ดาราศาสตร์">ดาราศาสตร์</option>
<option va
type="button"
onClick={() => handleAddCustom(cat.id)}
</div>
) : (
/* Standard / Custom config */
<div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
<div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
<span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>ระดับ:</span>
<select
value={itemObj.level || 'local'}
onChange={(e) => handleUpdateItem(item, { level: e.target.value })}
style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
>
<option value="local">🏫 โรงเรียน/ทั่วไป</option>
<option value="regional">🏆 ระดับภูมิภาค/จังหวัด</option>
<option value="national">🇹🇭 ระดับชาติ</option>

</div>


{/* Custom
style={{
<div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
{customList.map((item, idx) => {
if (item.categoryId !== cat.id) return null;

let lvlLabel = '';
let lvlColor = '';
let lvlBg = '';
if (item.level === 'international') { lvlLabel = '🌍 นานาชาติ'; lvlColor = '#3182CE'; lvlBg = '#EBF8FF'; }
else if (item.level === 'national') { lvlLabel = '🇹🇭 ระดับชาติ'; lvlColor = '#DD6B20'; lvlBg = '#FFFAF0'; }
else if (item.level === 'regional') { lvlLabel = '🏆 ระดับภาค'; lvlColor = '#805AD5'; lvlBg = '#FAF5FF'; }
else { lvlLabel = '🏫 ทั่วไป'; lvlColor = '#718096'; lvlBg = '#EDF2F7'; }

let awdLabel = '';
<span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-primary)', marginLeft: '0.3rem' }}>บทบาท:</span>
<select
value={itemObj.role || 'member'}
onChange={(e) => handleUpdateItem(item, { role: e.target.value })}
style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
>
<option value="member">🎗️ สมาชิกทั่วไป</option>
<option value="cooperator">🏅 ผู้ร่วมประสานงาน</option>
<option value="committee">🥉 คณะทำงาน/กรรมการ</option>
<option value="co_leader">🥈 รองหัวหน้า/รองแกนนำ</option>
<option value="leader">🥇 หัวหน้า/แกนนำหลัก</option>
</select>
</>
)}
</div>

<input
type="text"
value={itemObj.desc || ''}
onChange={(e) => handleUpdateItem(item, { desc: e.target.value })}
placeholder="📝 รายละเอียด/ชื่อกิจกรรมสั้นๆ..."
style={{
width: '100%',
padding: '0.35rem 0.5rem',
borderRadius: '6px',
border: '1px solid var(--border)',
fontSize: '0.75rem',
outline: 'none',
marginTop: '0.15rem'
}}

<input
type="text"
value={itemObj.desc || ''}
onChange={(e) => handleUpdateItem(item, { desc: e.target.value })}
placeholder="📝 รายละเอียด/ชื่อกิจกรรมสั้นๆ..."
style={{
width: '100%',
padding: '0.35rem 0.5rem',
borderRadius: '6px',
border: '1px solid var(--border)',
fontSize: '0.75rem',
outline: 'none',
marginTop: '0.15rem'
}}
/>
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
placeholder={`พิมพ์ชื่อผลงาน/หัวข้อเพิ่มเติม...`}
style={{
flex: '2 1 180px',
padding: '0.45rem 0.65rem',
เลื่อนปรับความมั่นใจ/ความรู้ของคุณในแต่ละหัวข้อหลัก (ระดับ 1 - 5 คะแนน)
</p>
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#F9F9FB', padding: '1rem', borderRadius: '16px' }}>
{SELF_ASSESSMENT_SUBJECTS[targetPath].map((sub) => {
const val = selfAssessment[sub.id] || 3;
? 'บันทึก'
: 'ถัดไป →'}
</button>
</div>
)}
</div>
</form>
</div>
);
}

export default function GradesStep() {
return (
max="5"
value={val}
onChange={(e) => setSelfAssessment({ ...selfAssessment, [sub.id]: parseInt(e.target.value) })}
style={{
width: '100%',
accentColor: 'var(--primary)',
cursor: 'pointer'
}}
/>
</div>
);
})}
</div>
</div>
)}

{/* Submit button when in Target Lock Mode */}
<button
type="submit"
className="btn-primary"
style={{
width: '100%',
padding: '0.85rem',
fontSize: '1rem',
fontWeight: '700',
borderRadius: '14px',
opacity: isFormValid ? 1 : 0.6,
cursor: isFormValid ? 'pointer' : 'not-allowed',
boxShadow: '0 4px 12px rgba(124, 92, 252, 0.2)',
marginTop: '0.5rem',
transition: 'all 0.2s ease'
}}
disabled={loading || !isFormValid}
>
{loading ? 'กำลังบันทึกข้อมูล...' : isEditMode ? 'บันทึก' : 'ถัดไป →'}
</button>
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
awdBg = '#E2E8F0'; 
}
else if (item.award === 'runnerup2') { 
awdLabel = isComp ? '🥉 รองชนะเลิศ 2/ทองแดง' : '🥉 คณะทำงาน'; 
awdColor = '#718096'; 
awdBg = '#EDF2F7'; 
}
else if (item.award === 'honorable') { 
awdLabel = isComp ? '🏅 ชมเชย' : '🏅 ผู้ช่วยงาน'; 
awdColor = '#319795'; 
awdBg = '#E6FFFA'; 
}
else { 
awdLabel = isComp ? '🎗️ เข้าร่วม' : '🎗️ สมาชิก/ทั่วไป'; 
awdColor = '#A0AEC0'; 
awdBg = '#F7FAFC'; 
}

return (
<div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.75rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
onClick={() => handleRemoveCustom(idx)}
style={{ background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
>
✕
</button>
</div>
);
})}
</div>
({item.desc})
</span>
)}
</div>
<button
type="button"
onClick={() => handleRemoveCustom(idx)}
style={{ background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
>
✕
</button>
</div>
);
})}
</div>
)}
</div>
)}                    color: isExpanded ? 'var(--primary)' : 'var(--text-primary)',
userSelect: 'none'
}}
className="accordion-header"
>
<span>{cat.label}</span>
<span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
{isExpanded ? '▲ ซ่อน' : '▼ ขยาย'}
</span>
</div>

{isExpanded && (
{lvlLabel}
</span>
<span style={{ padding: '0.1rem 0.3rem', borderRadius: '4px', background: awdBg, color: awdColor, fontWeight: 'bold', fontSize: '0.65rem' }}>
{awdLabel}
</span>
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
style={{ background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
>
✕
</button>
</div>
);
})}
</div>
)}
</div>
)}
</div>
)})}
</div>
</div>
)}

{/* Card 4: Self-Assessment Scale */}
{targetPath && SELF_ASSESSMENT_SUBJECTS[targetPath] && (
<div style={{
background: 'var(--surface)',
borderRadius: '20px',
padding: '1.5rem',
boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
border: '1px solid var(--border)',
}}>
<label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
// MISSING LINE 891
// MISSING LINE 892
// MISSING LINE 893
// MISSING LINE 894
value={score}
onChange={(e) => setSelfAssessment({ ...selfAssessment, [sub.id]: parseInt(e.target.value) })}
style={{
width: '100%',
accentColor: 'var(--primary)',
cursor: 'pointer',
}}
/>
</div>
);
})}
</div>
</div>
)}
</div>
)}

}}
/>
</div>
);
})}
</div>
</div>
)}

{/* ปุ่มส่งสำหรับโหมด Target Lock (คอลัมน์ขวา) */}
<button
type="submit"
className="btn-primary"
style={{
width: '100%',
padding: '0.85rem',
fontSize: '1rem',
fontWeight: '700',
borderRadius: '14px',
opacity: isFormValid ? 1 : 0.6,
cursor: isFormValid ? 'pointer' : 'not-allowed',
boxShadow: '0 4px 12px rgba(124, 92, 252, 0.2)',
marginTop: '0.5rem'
}}
disabled={loading || !isFormValid}
>
{loading
? 'กำลังบันทึกข้อมูล...'
: isEditMode
? 'บันทึก'
: 'ถัดไป →'}
</button>
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
