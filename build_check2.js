const fs = require('fs');
const s = fs.readFileSync('build2.txt','utf8');
const lines = s.split(/\r?\n/);
for (let i = Math.max(0, lines.length - 40); i < lines.length; i++) {
  if (lines[i]) console.log(lines[i]);
}
