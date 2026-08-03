Created At: 2026-07-14T06:23:33Z
Completed At: 2026-07-14T06:23:34Z
File Path: `file:///c:/Users/User/OneDrive/Desktop/Path-Finder/src/app/setup/grades/page.js`
Total Lines: 789
Total Bytes: 40461
Showing lines 1 to 350
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: 'use client';
2: import { useState, useEffect, Suspense } from 'react';
3: import MrPathGreeting from '@/components/setup/MrPathGreeting';
4: import { useRouter, useSearchParams } from 'next/navigation';
5: import { useAuth } from '@/contexts/AuthContext';
6: import { createUserProfile, getUserProfile, updateUserProfile } from '@/lib/firestore';
7: import { calculateSkillVector } from '@/lib/algorithms/skillVector';
8: import { matchPaths } from '@/lib/algorithms/cosineSimilarity';
9: import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';
10: import { SELF_ASSESSMENT_SUBJECTS } from '@/lib/constants/selfAssessmentSubjects';
11: import { getPortfolioCategories } from '@/lib/constants/portfolioOptions';
12: 
13: const GRADE_OPTIONS = ['', '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4'];
14: 
15: const subjects = [
16:   { id: 'math', label: 'คณิตศาสตร์', icon: '📐' },
17:   { id: 'science', label: 'วิทยาศาสตร์ฯ', icon: '🔬' },
18:   { id: 'thai', label: 'ภาษาไทย', icon: '🇹🇭' },
19:   { id: 'english', label: 'ภาษาอังกฤษ', icon: '🌐' },
20:   { id: 'social', label: 'สังคมศึกษาฯ', icon: '📖' },
21: ];
22: 
23: function GradesContent() {
24:   const router = useRouter();
25:   const searchParams = useSearchParams();
26:   const { user } = useAuth();
27:   const [level, setLevel] = useState('junior');
28:   const [loading, setLoading] = useState(false);
29:   const [isEditMode, setIsEditMode] = useState(false);
30: 
31:   con
<truncated 11963 bytes>
splay: 'flex', alignItems: 'center', gap: '0.75rem' }}>
316:                       <span style={{ fontSize: '1.25rem' }}>{subj.icon}</span>
317:                       <span style={{ fontWeight: '600', color: 'var(--text-primary)' }} className="subject-label">
318:                         {subj.label}
319:                       </span>
320:                     </div>
321:                     <div style={{ position: 'relative', width: '100px' }}>
322:                       <select
323:                         value={grades[subj.id]}
324:                         onChange={(e) => setGrades({ ...grades, [subj.id]: e.target.value })}
325:                         style={{
326:                           width: '100%',
327:                           padding: '0.45rem 0.65rem',
328:                           borderRadius: '10px',
329:                           border: '1px solid var(--border)',
330:                           background: '#FFFFFF',
331:                           fontWeight: '600',
332:                           color: grades[subj.id] !== '' ? 'var(--primary)' : 'var(--text-secondary)',
333:                           textAlign: 'center',
334:                           cursor: 'pointer',
335:                           outline: 'none',
336:                         }}
337:                         required
338:                       >
339:                         <option value="" disabled>เกรด</option>
340:                         {GRADE_OPTIONS.filter(v => v !== '').map((val) => (
341:                           <option key={val} value={val}>{val}</option>
342:                         ))}
343:                       </select>
344:                     </div>
345:                   </div>
346:                 ))}
347:               </div>
348:             </div>
349: 
350:             {/* Card 2: Analysis Mode Selection */}
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
