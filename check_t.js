const fs = require('fs');
const p = 'C:/Projects/Keshta-Company-System-Frontend/src/components/dashboard/Transport/TransportList.vue';
const s = fs.readFileSync(p).toString();
const idx = s.indexOf('loadTransport()');
if (idx >= 0) {
  const end = s.indexOf('</div>', idx);
  console.log(s.slice(end-150, end+100));
}
