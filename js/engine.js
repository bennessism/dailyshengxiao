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


export function ganzhiContext(pillar,animal,library,rules){
 const entry=library.cycle.find(x=>x.ganZhi===pillar);
 if(!entry)throw new Error("Unrecognized sexagenary pillar "+pillar);
 const other=rules.branchElements[animal.branch];
 const current=entry.stemElement;
 const generates=library.elements.generates,controls=library.elements.controls;
 let relation="distinct elemental associations without a direct generating or controlling relationship";
 if(current===other)relation="the same Five Element";
 else if(generates[current]===other)relation=current+" generates "+other+" (stem generates animal's branch element)";
 else if(generates[other]===current)relation=other+" generates "+current+" (animal's branch element generates stem)";
 else if(controls[current]===other)relation=current+" controls "+other+" (stem controls animal's branch element)";
 else if(controls[other]===current)relation=other+" controls "+current+" (animal's branch element controls stem)";
 return {entry,relation,text:entry.description+" Relative to "+animal.name+" ("+animal.branch+"), whose conventional branch element is "+other+", the Five Element comparison is "+relation+". This comparison is a symbolic layer beside the fixed Earthly Branch relationship, not a personal elemental balance."};
}
export function majorRelationships(periodBranch,animals,rules){
 const priority=["六合","六冲","三合组","三会组","六害","相刑","相破"];
 const values=animals.flatMap(animal=>detectRelationships(periodBranch,animal.branch,rules).filter(id=>id!=="常规"&&id!=="同支").map(id=>({id,animal})));
 return values.sort((a,b)=>priority.indexOf(a.id)-priority.indexOf(b.id)||animals.indexOf(a.animal)-animals.indexOf(b.animal));
}
