const fs = require('fs');
const s = fs.readFileSync('build_out.txt').toString();
const arr = s.split(/\r?\n/);
for (var i = Math.max(0, arr.length - 40); i < arr.length; i++) {
  console.log(arr[i]);
}
