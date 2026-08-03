const fs = require('fs');
const path = require('path');

const scratchDir = 'c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\scratch';
const files = fs.readdirSync(scratchDir);

let bestFile = null;
let maxLength = 0;

for (const file of files) {
  if (file.startsWith('found_content_parent_') && file.endsWith('.txt')) {
    const fullPath = path.join(scratchDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    // Check if it has 'use client' and 'GradesContent' or 'grades' and doesn't contain '<truncated'
    if (content.includes('use client') && content.includes('function GradesContent') && !content.includes('truncated')) {
      if (content.length > maxLength) {
        maxLength = content.length;
        bestFile = fullPath;
      }
    }
  }
}

if (bestFile) {
  console.log(`Found best file: ${bestFile} with length ${maxLength}`);
  let cleanCode = fs.readFileSync(bestFile, 'utf8');
  // Strip lines like "1: 'use client';" to just "'use client';"
  const lines = cleanCode.split('\n');
  const cleanedLines = [];
  for (const line of lines) {
    const match = line.match(/^\s*\d+\s*:\s*(.*)$/);
    if (match) {
      cleanedLines.push(match[1]);
    } else {
      if (!line.includes('Created At:') && !line.includes('Completed At:') && !line.includes('File Path:') && !line.includes('Total Lines:') && !line.includes('Showing lines')) {
        cleanedLines.push(line);
      }
    }
  }
  const codeToWrite = cleanedLines.join('\n');
  fs.writeFileSync('c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\src\\app\\setup\\grades\\page.js', codeToWrite, 'utf8');
  console.log("Restored setup/grades/page.js from backup file successfully!");
} else {
  console.log("No complete clean backup file found in scratch.");
}
