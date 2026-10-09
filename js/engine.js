const ORDER="子丑寅卯辰巳午未申酉戌亥";
const HAS=(pairs,a,b)=>pairs.some(p=>p.includes(a)&&p.includes(b)&&a!==b);
export function detectRelationships(a,b,rules){
  const out=[];
  if(a===b)out.push("同支");
  if(HAS(rules.sixHarmony,a,b))out.push("六合");
  if(HAS(rules.sixClash,a,b))out.push("六冲");
  if(HAS(rules.sixHarm,a,b))out.push("六害");
  if(HAS(rules.sixBreak,a,b))out.push("相破");
  if(a!==b&&rules.punishments.some(p=>p.kind==="pair"&&p.members.includes(a)&&p.members.includes(b)))out.push("相刑");
  if(a===b&&rules.punishments.some(p=>p.kind==="self"&&p.members.includes(a)))out.push("相刑");
  if(a!==b&&rules.threeHarmony.some(g=>g.members.includes(a)&&g.members.includes(b)))out.push("三合组");
  if(a!==b&&rules.seasonalMeeting.some(g=>g.members.includes(a)&&g.members.includes(b)))out.push("三会组");
  return out.length?out:["常规"];
}
export function calendarFor(date){
  if(!globalThis.Solar)throw new Error("Chinese calendar library unavailable");
  // The calendar follows the visitor's local clock. Midnight is the day boundary.
  const s=Solar.fromYmdHms(date.getFullYear(),date.getMonth()+1,date.getDate(),date.getHours(),date.getMinutes(),date.getSeconds());
  const l=s.getLunar();
  const year=l.getYearInGanZhiExact(),month=l.getMonthInGanZhiExact(),day=l.getDayInGanZhiExact2();
  const result={year,month,day};
  for(const [k,v] of Object.entries(result)){
    if(typeof v!=="string"||v.length!==2||!ORDER.includes(v[1]))throw new Error("Invalid "+k+" pillar: "+v);
  }
  return result;
}
export function buildReading(period,branch,animal,rules,library){
  const keys=detectRelationships(branch,animal.branch,rules);
  const entry=library.pairings?.[animal.branch+"_"+branch];
  return {keys,paragraphs:entry?[entry.statement]:keys.map(k=>library.interpretations[k]?.statement||"").filter(Boolean)};
}
