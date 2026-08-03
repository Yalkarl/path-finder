const fs = require('fs');
const path = require('path');

const researcherLogPath = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ac8e5cc4-b629-4951-b582-3af40ef163f5\\.system_generated\\logs\\transcript.jsonl';

if (fs.existsSync(researcherLogPath)) {
  const content = fs.readFileSync(researcherLogPath, 'utf8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      // We are looking for the step where the researcher viewed grades/page.js
      if (obj.output && obj.output.includes('export default function GradesStep') && obj.output.includes('use client') && obj.output.includes('JUNIOR_PATHS')) {
        // Let's print out how long it is
        console.log("Found matching output in researcher logs! Length:", obj.output.length);
        // Let's see if we can write this to a temporary file for analysis
        fs.writeFileSync('c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\scratch\\grades_backup_raw.txt', obj.output, 'utf8');
        console.log("Wrote raw backup to scratch/grades_backup_raw.txt");
        return;
      }
    } catch (e) {}
  }
  console.log("Could not find view_file output in researcher log.");
} else {
  console.log("Researcher log path does not exist.");
}
