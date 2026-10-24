const fs = require('fs');
const s = fs.readFileSync('build_out.txt','utf8');
const lines = s.split(/\r?\n/);
for (let i = lines.length - 60; i < lines.length; i++) {
  if (lines[i] !== undefined) console.log(lines[i]);
}
