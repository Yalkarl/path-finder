const fs = require('fs');
const path = require('path');

const researcherLogPath = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ac8e5cc4-b629-4951-b582-3af40ef163f5\\.system_generated\\logs\\transcript.jsonl';
const parentLogPath = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\214b373c-378d-45c0-8825-7cec11b6b772\\.system_generated\\logs\\transcript.jsonl';

function inspectLog(logPath, name) {
  if (!fs.existsSync(logPath)) {
    console.log(`${name} does not exist.`);
    return;
  }
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  console.log(`Inspecting ${name}, lines: ${lines.length}`);
  
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (!line) continue;
    if (line.includes('grades/page.js')) {
      console.log(`Line ${idx} contains 'grades/page.js'`);
      try {
        const obj = JSON.parse(line);
        console.log("  Step Type:", obj.type);
        if (obj.tool_calls) {
          console.log("  Tool Calls:", JSON.stringify(obj.tool_calls.map(tc => ({ name: tc.name, args: tc.args }))));
        }
        if (obj.output && obj.output.length > 100) {
          console.log("  Output length:", obj.output.length);
          fs.writeFileSync(`c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\scratch\\found_output_${name}_${idx}.txt`, obj.output, 'utf8');
        }
        if (obj.content && obj.content.length > 100) {
          console.log("  Content length:", obj.content.length);
          fs.writeFileSync(`c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\scratch\\found_content_${name}_${idx}.txt`, obj.content, 'utf8');
        }
      } catch (e) {
        console.log("  Error parsing JSON line");
      }
    }
  }
}

inspectLog(researcherLogPath, 'researcher');
inspectLog(parentLogPath, 'parent');
