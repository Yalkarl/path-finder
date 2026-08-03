Created At: 2026-07-13T14:08:22Z
Completed At: 2026-07-13T14:08:23Z
File Path: `file:///c:/Users/User/OneDrive/Desktop/Path-Finder/src/app/setup/grades/page.js`
Total Lines: 498
Total Bytes: 21406
Showing lines 1 to 498
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
10: import { PORTFOLIO_CATEGORIES } from '@/lib/constants/portfolioOptions';
11: import { SELF_ASSESSMENT_SUBJECTS } from '@/lib/constants/selfAssessmentSubjects';
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
27:   const [loading, setLoading] = useState(false);
28:   const [name, setName] = useState('');
29:   const [educationLevel, setEducationLevel] = useState('senior');
30: 
31:   //
<truncated 20237 bytes>
  <input
442:                           type="range"
443:                           min="1"
444:                           max="5"
445:                           value={score}
446:                           onChange={(e) => setSelfAssessment({ ...selfAssessment, [sub.id]: parseInt(e.target.value) })}
447:                           style={{
448:                             width: '100%',
449:                             accentColor: 'var(--primary)',
450:                             cursor: 'pointer',
451:                           }}
452:                         />
453:                       </div>
454:                     );
455:                   })}
456:                 </div>
457:               </div>
458:             )}
459:           </div>
460:         )}
461: 
462:         <button
463:           type="submit"
464:           className="btn-primary"
465:           style={{
466:             width: '100%',
467:             padding: '0.85rem',
468:             fontSize: '1rem',
469:             fontWeight: '700',
470:             borderRadius: '14px',
471:             opacity: isFormValid ? 1 : 0.6,
472:             cursor: isFormValid ? 'pointer' : 'not-allowed',
473:           }}
474:           disabled={loading || !isFormValid}
475:         >
476:           {loading
477:             ? 'กำลังบันทึกข้อมูล...'
478:             : isEditMode
479:               ? 'บันทึก'
480:               : 'ถัดไป →'}
481:         </button>
482:       </form>
483:     </div>
484:   );
485: }
486: 
487: export default function GradesStep() {
488:   return (
489:     <Suspense fallback={
490:       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
491:         <p style={{ color: 'var(--text-secondary)' }}>กำลังโหลด...</p>
492:       </div>
493:     }>
494:       <GradesContent />
495:     </Suspense>
496:   );
497: }
498: 
The above content shows the entire, complete file contents of the requested file.
