const fs = require('fs');

const code = fs.readFileSync('src/app/setup/grades/page.js', 'utf8');

let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;
let insideString = null; // ' or " or `
let escaped = false;

for (let i = 0; i < code.length; i++) {
  const char = code[i];
  
  if (escaped) {
    escaped = false;
    continue;
  }
  
  if (char === '\\') {
    escaped = true;
    continue;
  }
  
  if (insideString) {
    if (char === insideString) {
      insideString = null;
    }
    continue;
  }
  
  if (char === "'" || char === '"' || char === '`') {
    insideString = char;
    continue;
  }
  
  // Ignore comments
  if (char === '/' && code[i+1] === '/') {
    while (i < code.length && code[i] !== '\n') {
      i++;
    }
    continue;
  }
  
  if (char === '/' && code[i+1] === '*') {
    i += 2;
    while (i < code.length && !(code[i] === '*' && code[i+1] === '/')) {
      i++;
    }
    i++;
    continue;
  }
  
  if (char === '{') braceCount++;
  if (char === '}') braceCount--;
  if (char === '(') {
    parenCount++;
    console.log(`Open paren at line ${code.substring(0, i).split('\n').length}: count is ${parenCount}`);
  }
  if (char === ')') {
    parenCount--;
    console.log(`Close paren at line ${code.substring(0, i).split('\n').length}: count is ${parenCount}`);
  }
  if (char === '[') bracketCount++;
  if (char === ']') bracketCount--;
  
  if (braceCount < 0) {
    console.log(`Unbalanced brace (}) at index ${i}, around line: ${code.substring(0, i).split('\n').length}`);
    braceCount = 0;
  }
  if (parenCount < 0) {
    console.log(`Unbalanced paren ()) at index ${i}, around line: ${code.substring(0, i).split('\n').length}`);
    parenCount = 0;
  }
  if (bracketCount < 0) {
    console.log(`Unbalanced bracket (]) at index ${i}, around line: ${code.substring(0, i).split('\n').length}`);
    bracketCount = 0;
  }
}

console.log('Final counts:', { braceCount, parenCount, bracketCount });
