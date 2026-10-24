const fs = require('fs');
const s = fs.readFileSync('src/components/dashboard/Transport/TransportList.vue').toString();
console.log((s.match(/Card/g)||[]).length);
console.log(s.includes('CardContent'));
console.log(s.includes('CardHeader'));
console.log(s.includes('CardTitle'));
console.log(s.includes("from '@/components/ui/card'"));
