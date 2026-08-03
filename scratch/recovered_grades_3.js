Created At: 2026-07-13T18:15:42Z
Completed At: 2026-07-13T18:15:43Z
File Path: `file:///c:/Users/User/OneDrive/Desktop/Path-Finder/src/app/setup/grades/page.js`
Total Lines: 104
Total Bytes: 4119
Showing lines 1 to 100
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: Created At: 2026-07-12T10:38:45Z
2: Completed At: 2026-07-12T10:38:46Z
3: File Path: `file:///c:/Users/User/OneDrive/Desktop/Path-Finder/src/app/setup/grades/page.js`
4: Total Lines: 269
5: Total Bytes: 9318
6: Showing lines 1 to 269
7: The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
8: 1: 'use client';
9: 2: import { useState, useEffect, Suspense } from 'react';
10: 3: import MrPathGreeting from '@/components/setup/MrPathGreeting';
11: 4: import { useRouter, useSearchParams } from 'next/navigation';
12: 5: import { useAuth } from '@/contexts/AuthContext';
13: 6: import { createUserProfile, getUserProfile, updateUserProfile } from '@/lib/firestore';
14: 7: import { calculateSkillVector } from '@/lib/algorithms/skillVector';
15: 8: import { matchPaths } from '@/lib/algorithms/cosineSimilarity';
16: 9: import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';
17: 10: 
18: 11: const GRADE_OPTIONS = ['', '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4'];
19: 12: 
20: 13: const subjects = [
21: 14:   { id: 'math', label: 'คณิตศาสตร์', icon: '📐' },
22: 15:   { id: 'science', label: 'วิทยาศาสตร์ฯ', icon: '🔬' },
23: 16:   { id: 'thai', label: 'ภาษาไทย', icon: '🇹🇭' },
24: 17:   { id: 'english', label: 'ภาษาอังกฤษ', icon: '🌐' },
25: 18:   { id: 'social', label: '
<truncated 960 bytes>
19:                   appearance: 'none',
54: 220:                   WebkitAppearance: 'none',
55: 221:                   MozAppearance: 'none',
56: 222:                 }}
57: 223:               >
58: 224:                 <option value="" disabled>เกรด</option>
59: 225:                 {GRADE_OPTIONS.filter(v => v !== '').map((val) => (
60: 226:                   <option key={val} value={val}>{val}</option>
61: 227:                 ))}
62: 228:               </select>
63: 229:             </div>
64: 230:           ))}
65: 231:         </div>
66: 232: 
67: 233:         <button
68: 234:           type="submit"
69: 235:           className="btn-primary"
70: 236:           style={{
71: 237:             width: '100%',
72: 238:             padding: '0.85rem',
73: 239:             fontSize: '1rem',
74: 240:             fontWeight: '700',
75: 241:             borderRadius: '14px',
76: 242:             opacity: allFilled ? 1 : 0.6,
77: 243:             cursor: allFilled ? 'pointer' : 'not-allowed',
78: 244:           }}
79: 245:           disabled={loading || !allFilled}
80: 246:         >
81: 247:           {loading
82: 248:             ? 'กำลังบันทึกข้อมูล...'
83: 249:             : isEditMode
84: 250:               ? 'บันทึก'
85: 251:               : 'ถัดไป →'}
86: 252:         </button>
87: 253:       </form>
88: 254:     </div>
89: 255:   );
90: 256: }
91: 257: 
92: 258: export default function GradesStep() {
93: 259:   return (
94: 260:     <Suspense fallback={
95: 261:       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
96: 262:         <p style={{ color: 'var(--text-secondary)' }}>กำลังโหลด...</p>
97: 263:       </div>
98: 264:     }>
99: 265:       <GradesContent />
100: 266:     </Suspense>
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
