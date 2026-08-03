const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ac8e5cc4-b629-4951-b582-3af40ef163f5\\.system_generated\\logs\\transcript.jsonl';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  // Find lines with view_file output for setup/grades/page.js
  let foundContent = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      // Look for a step that contains the text of grades/page.js
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'view_file' && tc.args && tc.args.AbsolutePath && tc.args.AbsolutePath.includes('grades/page.js')) {
            console.log("Found tool call view_file for grades/page.js");
          }
        }
      }
      
      // Let's also check step output/content
      if (obj.content && obj.content.includes('export default function GradesStep')) {
        console.log("Found content with GradesStep");
        // Check if it's the full content
        if (obj.content.includes('use client') && obj.content.includes('JUNIOR_PATHS')) {
          foundContent = obj.content;
        }
      }
      
      if (obj.output && obj.output.includes('export default function GradesStep')) {
        console.log("Found output with GradesStep");
        if (obj.output.includes('use client') && obj.output.includes('JUNIOR_PATHS')) {
          foundContent = obj.output;
        }
      }
    } catch (e) {
      // ignore parse errors for incomplete lines
    }
  }
  
  if (foundContent) {
    console.log("Successfully extracted original content!");
    // Clean up markdown formatting if it is inside a markdown code block
    let cleanCode = foundContent;
    const match = cleanCode.match(/```js([\s\S]*?)```/) || cleanCode.match(/```javascript([\s\S]*?)```/) || cleanCode.match(/```([\s\S]*?)```/);
    if (match) {
      cleanCode = match[1];
    }
    
    // Also remove line numbers if they were added (e.g., "1: use client")
    // Wait, let's see if the lines have line numbers. If not, just write it.
    fs.writeFileSync('c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\src\\app\\setup\\grades\\page.js', cleanCode.trim(), 'utf8');
    console.log("Restored grades/page.js successfully!");
  } else {
    console.log("Could not find full grades/page.js content in logs. Searching other log file...");
    // Let's also try parent conversation log
    const parentLogPath = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\214b373c-378d-45c0-8825-7cec11b6b772\\.system_generated\\logs\\transcript.jsonl';
    if (fs.existsSync(parentLogPath)) {
      const pContent = fs.readFileSync(parentLogPath, 'utf8');
      const pLines = pContent.split('\n');
      for (const line of pLines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.content && obj.content.includes('export default function GradesStep') && obj.content.includes('use client')) {
            foundContent = obj.content;
          }
          if (obj.output && obj.output.includes('export default function GradesStep') && obj.output.includes('use client')) {
            foundContent = obj.output;
          }
        } catch (e) {}
      }
      if (foundContent) {
        let cleanCode = foundContent;
        const match = cleanCode.match(/```js([\s\S]*?)```/) || cleanCode.match(/```javascript([\s\S]*?)```/) || cleanCode.match(/```([\s\S]*?)```/);
        if (match) cleanCode = match[1];
        fs.writeFileSync('c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\src\\app\\setup\\grades\\page.js', cleanCode.trim(), 'utf8');
        console.log("Restored grades/page.js from parent logs successfully!");
      } else {
        console.log("Not found in parent logs either.");
      }
    }
  }
} catch (error) {
  console.error("Error running restore:", error);
}
