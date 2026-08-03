const fs = require('fs');
const path = require('path');

const subagentLogPath = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ac8e5cc4-b629-4951-b582-3af40ef163f5\\.system_generated\\logs\\transcript.jsonl';
const parentLogPath = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\214b373c-378d-45c0-8825-7cec11b6b772\\.system_generated\\logs\\transcript.jsonl';

function searchInLog(logPath) {
  if (!fs.existsSync(logPath)) return null;
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'write_to_file' && tc.args && tc.args.TargetFile && tc.args.TargetFile.includes('grades/page.js')) {
            if (tc.args.CodeContent) {
              return tc.args.CodeContent;
            }
          }
        }
      }
    } catch (e) {}
  }
  return null;
}

let code = searchInLog(subagentLogPath);
if (!code) {
  console.log("Not found in subagent log, checking parent log...");
  code = searchInLog(parentLogPath);
}

if (code) {
  fs.writeFileSync('c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\src\\app\\setup\\grades\\page.js', code, 'utf8');
  console.log("Restored setup/grades/page.js from write_to_file tool call!");
} else {
  console.log("Failed to find any write_to_file call for setup/grades/page.js. Trying to clean the current file...");
  // Let's strip line numbers from current file
  const currentPath = 'c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\src\\app\\setup\\grades\\page.js';
  const lines = fs.readFileSync(currentPath, 'utf8').split('\n');
  const cleanedLines = [];
  for (const line of lines) {
    // Check if line matches pattern: whitespace + number + ":" + whitespace + code
    const match = line.match(/^\s*\d+\s*:\s*(.*)$/);
    if (match) {
      cleanedLines.push(match[1]);
    } else {
      // If it doesn't match, and it's not a header line, keep it
      if (!line.includes('Created At:') && !line.includes('Completed At:') && !line.includes('File Path:') && !line.includes('Total Lines:') && !line.includes('Showing lines')) {
        cleanedLines.push(line);
      }
    }
  }
  fs.writeFileSync(currentPath, cleanedLines.join('\n'), 'utf8');
  console.log("Cleaned the current file by stripping line numbers!");
}
