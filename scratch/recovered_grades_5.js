Created At: 2026-07-04T15:38:33Z
Completed At: 2026-07-04T15:38:34Z
File Path: `file:///c:/Users/User/OneDrive/Desktop/Path-Finder/src/app/setup/grades/page.js`
Total Lines: 267
Total Bytes: 9234
Showing lines 1 to 267
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
10: 
11: const GRADE_OPTIONS = ['', '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4'];
12: 
13: const subjects = [
14:   { id: 'math', label: 'คณิตศาสตร์', icon: '📐' },
15:   { id: 'science', label: 'วิทยาศาสตร์ฯ', icon: '🔬' },
16:   { id: 'thai', label: 'ภาษาไทย', icon: '🇹🇭' },
17:   { id: 'english', label: 'ภาษาอังกฤษ', icon: '🌐' },
18:   { id: 'social', label: 'สังคมศึกษาฯ', icon: '📖' },
19: ];
20: 
21: function GradesContent() {
22:   const router = useRouter();
23:   const searchParams = useSearchParams();
24:   const { user } = useAuth();
25:   const [loading, setLoading] = useState(false);
26:   const [name, setName] = useState('');
27: 
28:   const isEditMode = searchParams.get('mode') === 'edit';
29: 
30:   const [grades, setGrades] = useState({
31:     math: '',
32:     science: '',
33:     thai: '',
34:     english: '',
35:     social: '',
36:   });
37: 
38:   useEffect(()
<truncated 6909 bytes>
,
212:                   fontWeight: '600',
213:                   color: grades[subj.id] !== '' ? 'var(--primary)' : 'var(--text-secondary)',
214:                   textAlign: 'center',
215:                   cursor: 'pointer',
216:                   outline: 'none',
217:                   appearance: 'none',
218:                   WebkitAppearance: 'none',
219:                   MozAppearance: 'none',
220:                 }}
221:               >
222:                 <option value="" disabled>เกรด</option>
223:                 {GRADE_OPTIONS.filter(v => v !== '').map((val) => (
224:                   <option key={val} value={val}>{val}</option>
225:                 ))}
226:               </select>
227:             </div>
228:           ))}
229:         </div>
230: 
231:         <button
232:           type="submit"
233:           className="btn-primary"
234:           style={{
235:             width: '100%',
236:             padding: '0.85rem',
237:             fontSize: '1rem',
238:             fontWeight: '700',
239:             borderRadius: '14px',
240:             opacity: allFilled ? 1 : 0.6,
241:             cursor: allFilled ? 'pointer' : 'not-allowed',
242:           }}
243:           disabled={loading || !allFilled}
244:         >
245:           {loading
246:             ? 'กำลังบันทึกข้อมูล...'
247:             : isEditMode
248:               ? 'บันทึก'
249:               : 'ถัดไป →'}
250:         </button>
251:       </form>
252:     </div>
253:   );
254: }
255: 
256: export default function GradesStep() {
257:   return (
258:     <Suspense fallback={
259:       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
260:         <p style={{ color: 'var(--text-secondary)' }}>กำลังโหลด...</p>
261:       </div>
262:     }>
263:       <GradesContent />
264:     </Suspense>
265:   );
266: }
267: 
The above content shows the entire, complete file contents of the requested file.
