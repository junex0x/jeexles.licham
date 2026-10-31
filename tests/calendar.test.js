/* jeexles.licham calendar regression tests — run: node tests/calendar.test.js */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const { join }=require('node:path');
const ctx={window:{},Date,Math};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(join(__dirname,'..','lunar-core.js'),'utf8'),ctx);
const api=ctx.window.JeexLunar;
const check=(solar,expected)=>{
  const [y,m,d]=solar;
  const ld=api.getLunarDate(d,m,y);
  assert.deepEqual([ld.day,ld.month,ld.year,ld.leap],expected);
};
check([2026,2,17],[1,1,2026,0]);
check([2026,10,31],[22,9,2026,0]);
check([2025,7,25],[1,6,2025,1]);
check([2020,5,23],[1,4,2020,1]);
check([2033,12,22],[1,11,2033,1]);
check([2034,1,20],[1,12,2033,0]);
for(let year=1901;year<=2098;year++) {
  const entries=api.getYearInfo(year);
  assert.ok(entries.length===12||entries.length===13,`Year ${year} count`);
  assert.equal(entries[0].month,1,`Year ${year} first month`);
  assert.equal(entries.at(-1).month,12,`Year ${year} last month`);
  for(let i=0;i<entries.length;i++) {
    const [d,m,y]=api.fromDayNumber(entries[i].jd);
    const result=api.getLunarDate(d,m,y);
    assert.deepEqual([result.day,result.month,result.year,result.leap],
      [1,entries[i].month,year,entries[i].leap],`Year ${year}, month index ${i}`);
    if(i+1<entries.length)assert.ok(entries[i+1].jd-entries[i].jd===29||entries[i+1].jd-entries[i].jd===30);
  }
}
console.log('PASS: New Year, lunar leap months and 198 years of calendar consistency.');
