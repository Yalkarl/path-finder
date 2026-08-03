const fs = require('fs');
const filePath = 'c:\\Users\\User\\OneDrive\\Desktop\\Path-Finder\\src\\app\\setup\\grades\\page.js';
const buf = fs.readFileSync(filePath);
const text = buf.toString('utf8');
fs.writeFileSync(filePath, text, 'utf8');
console.log('Repair completed!');
