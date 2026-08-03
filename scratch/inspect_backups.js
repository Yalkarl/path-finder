const fs = require('fs');
const path = require('path');

const scratchDir = 'c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\scratch';
const files = fs.readdirSync(scratchDir);

for (const file of files) {
  if (file.startsWith('found_content_parent_') && file.endsWith('.txt')) {
    const fullPath = path.join(scratchDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    console.log(`File: ${file}, Size: ${content.length}`);
    if (content.length > 2000) {
      console.log("  Lines 1-5:");
      const lines = content.split('\n').slice(0, 5);
      lines.forEach(l => console.log("    ", l));
      console.log("  Lines last-5:");
      const lastLines = content.split('\n').slice(-5);
      lastLines.forEach(l => console.log("    ", l));
    }
  }
}
