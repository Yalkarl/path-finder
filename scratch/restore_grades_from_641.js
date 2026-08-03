const fs = require('fs');
const path = require('path');

const srcPath = 'c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\scratch\\found_content_parent_641.txt';
const destPath = 'c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\src\\app\\setup\\grades\\page.js';

if (fs.existsSync(srcPath)) {
  const content = fs.readFileSync(srcPath, 'utf8');
  const lines = content.split('\n');
  const cleanedLines = [];
  
  for (const line of lines) {
    // Match line pattern like " 265:   );" or "10: const GRADE_OPTIONS = ...;"
    const match = line.match(/^\s*\d+\s*:\s*(.*)$/);
    if (match) {
      cleanedLines.push(match[1]);
    } else {
      if (!line.includes('Created At:') && !line.includes('Completed At:') && !line.includes('File Path:') && !line.includes('Total Lines:') && !line.includes('Showing lines') && !line.includes('The above content shows')) {
        cleanedLines.push(line);
      }
    }
  }
  
  fs.writeFileSync(destPath, cleanedLines.join('\n').trim(), 'utf8');
  console.log("Restored setup/grades/page.js to pristine 267-line version!");
} else {
  console.log("Source backup file 641.txt does not exist.");
}
