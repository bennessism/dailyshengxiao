import {detectRelationships} from "./engine.js";

const NAMES={六合:"Six Harmonies",六冲:"Six Clashes",六害:"Six Harms",相破:"Breaks",相刑:"Punishments",三合组:"shared Three Harmonies group",三会组:"shared Seasonal Meeting group",同支:"the same branch",刑组关联:"shared punishment trio"};
const GEN={Wood:"Fire",Fire:"Earth",Earth:"Metal",Metal:"Water",Water:"Wood"};
const CON={Wood:"Earth",Earth:"Water",Water:"Fire",Fire:"Metal",Metal:"Wood"};
const PERIOD={daily:{label:"today",verb:"Today, ",end:"Take time to assess the immediate situation before committing."},monthly:{label:"this month",verb:"Across this month, ",end:"Keep expectations clear and revisit arrangements as circumstances develop."},yearly:{label:"this year",verb:"Over the year, ",end:"Keep a workable longer-term plan and review it as conditions change."}};
const EFFECTS={
 六合:["supports finding common ground","cooperation and agreement","Invite a useful conversation or shared effort","Build trust through consistent cooperation","Invest in partnerships that can last"],
 六冲:["sets opposing tendencies against one another","different priorities or sudden changes","Slow down before responding or deciding","Leave room for adjustments and avoid forcing a timetable","Plan for changes, protect important commitments and remain adaptable"],
 六害:["brings a traditional theme of indirect friction","unclear expectations or interference","Check a misunderstanding before it grows","Clarify roles and promises before frustration accumulates","Strengthen boundaries and communication instead of allowing small grievances to linger"],
 相刑:["highlights pressure and consequences","obligations or competing expectations","Consider consequences before taking a firm position","Respond steadily to repeated demands and constraints","Build sustainable discipline and deal with recurring pressure systematically"],
 相破:["adds the possibility of interruptions","a promising arrangement needing repair","Double-check a detail even when things appear settled","Review agreements and correct weak points early","Maintain flexibility and repair fragile arrangements before relying on them"],
 三合组:["shares membership in a traditional three-branch harmony group","a common elemental direction","Look for a useful shared objective","Coordinate sustained work around common strengths","Cultivate a consistent direction, without assuming a complete 三合 formation"],
 三会组:["belongs to the same seasonal meeting group","a shared seasonal tendency","Work with the day's prevailing pace","Use the month's seasonal rhythm to organize priorities","Build routines that suit the seasonal theme, without assuming a complete 三会 formation"],
 同支:["repeats the same branch's characteristics","familiar strengths as well as habits","Use familiar strengths without repeating an old mistake","Revisit routines and refine what is already working","Strengthen long-established habits while making room for improvement"]
};
const PRIMARY=["六合","六冲","六害","相刑","相破","三合组","三会组","同支"];
function elementText(a,b){
 const x=a.element,y=b.element;
 if(x===y)return `Both branches belong to ${x}; their similar elemental quality brings a common emphasis, not an automatic harmony.`;
 if(GEN[x]===y)return `${a.name}'s ${x} generates ${b.name}'s ${y} (相生), a traditional image of giving support or energy outward.`;
 if(GEN[y]===x)return `${b.name}'s ${y} generates ${a.name}'s ${x} (相生), a traditional image of receiving nourishment or support.`;
 if(CON[x]===y)return `${a.name}'s ${x} controls ${b.name}'s ${y} (相克), suggesting the need to regulate or direct competing tendencies.`;
 if(CON[y]===x)return `${b.name}'s ${y} controls ${a.name}'s ${x} (相克), a symbol of boundaries and restraint rather than certain misfortune.`;
 return `Their elements are ${x} and ${y}, giving different traditional qualities to the comparison.`;
}
function groupNames(group,animals){return group.members.map(b=>animals.find(a=>a.branch===b)?.name||b).join(", ")}
function overlapText(label,p,animal,other,period,rules,animals){
 if(label==="刑组关联"){const g=rules.punishments.find(x=>x.kind==="three-branch"&&x.members.includes(animal.branch)&&x.members.includes(other.branch));return `They also share the ${g?.name||"traditional"} punishment trio (${g?.members.join("·")||""}); this pair alone does not complete the three-branch punishment.`;}
 let e=EFFECTS[label];if(!e)return "";
 const group=label==="三合组"?rules.threeHarmony.find(g=>g.members.includes(animal.branch)&&g.members.includes(other.branch)):label==="三会组"?rules.seasonalMeeting.find(g=>g.members.includes(animal.branch)&&g.members.includes(other.branch)):null;
 const formation=group?` They share the ${group.element} group (${groupNames(group,animals)}), but two branches alone do not complete the formation.`:"";
 return `However, ${animal.name} and ${other.name} also have ${label} (${NAMES[label]}), which ${e[0]}. ${e[period==="daily"?2:period==="monthly"?3:4]}.${formation}`;
}
export function composeReading(period,selected,calendar,animals,rules,profiles){
 const position={daily:"day",monthly:"month",yearly:"year"}[period];
 const b=calendar[position][1],other=animals.find(a=>a.branch===b),profile=profiles[selected.id],pair=profile.counterparts[other.id];
 const actual=detectRelationships(selected.branch,b,rules);
 const keys=actual.slice();
 const sharedPunishment=rules.punishments.some(x=>x.kind==="three-branch"&&selected.branch!==b&&x.members.includes(selected.branch)&&x.members.includes(b));
 if(sharedPunishment)keys.push("刑组关联");
 const real=keys.filter(k=>k!=="常规"&&k!=="刑组关联");
 const chosen=PRIMARY.find(k=>real.includes(k)),secondary=real.filter(k=>k!==chosen);
 const p=PERIOD[period];
 const introductory=`${other.name} (${b}) is the ${p.label} branch, associated here with ${profiles[other.id].traditionalTraits}; ${selected.name} (${selected.branch}) is traditionally described as ${profile.traditionalTraits}.`;
 let headline,first;
 if(chosen){
  const effect=EFFECTS[chosen];
  headline=`${selected.name} · ${other.name}: ${NAMES[chosen]}`;
  first=`${selected.name} and ${other.name} form ${chosen}, which traditionally ${effect[0]}. For ${selected.name}, the practical emphasis ${p.label} is to ${effect[period==="daily"?2:period==="monthly"?3:4].charAt(0).toLowerCase()+effect[period==="daily"?2:period==="monthly"?3:4].slice(1)}. ${pair.counterpartCaution}`;
 }else{
  headline=`${selected.name} · ${other.name}: Elements and character`;
  first=`No listed direct harmony, clash, harm, break or other special pair applies between ${selected.name} and ${other.name}. ${elementText(selected,other)} For ${selected.name}, ${p.label} calls for ${period==='yearly'?profile.longTermAdvice:profile.immediateAdvice}. ${pair.counterpartCaution}`;
 }
 const paragraphs=[introductory,first];
 for(const k of secondary)paragraphs.push(overlapText(k,p,selected,other,period,rules,animals));
 if(sharedPunishment)paragraphs.push(overlapText("刑组关联",p,selected,other,period,rules,animals));
 if(chosen && !secondary.length && period!=="daily")paragraphs.push(elementText(selected,other));
 // Each reading also acknowledges the actual background branches, without treating them as a second independent prediction.
 const surrounds=(period==="yearly"?["month","day"]:period==="monthly"?["year","day"]:["month","year"]);
 const context=surrounds.map(k=>{
  const x=animals.find(a=>a.branch===calendar[k][1]);const relations=detectRelationships(selected.branch,x.branch,rules).filter(v=>v!=="常规"&&v!=="同支");
  const main=PRIMARY.find(v=>relations.includes(v));
  const tail=relations.filter(v=>v!==main);
  return {k,x,main,tail};
 });
 const contextWords=context.map(c=>`the ${c.k}'s ${c.x.name} (${c.x.branch}) ${c.main?`brings ${c.main}${c.tail.length?` alongside ${c.tail.join(" and ")}`:""}`:`has no highlighted direct pairing with ${selected.name}`}`);
 if(period==="daily")paragraphs.push(`In the wider context, ${contextWords.join(", while ")}. The day may be easier or harder than the broader period depending on these different branch relationships.`);
 else if(period==="monthly")paragraphs.push(`The broader year matters too: ${contextWords[0]}. The current day adds a shorter note: ${contextWords[1]}. The month can therefore offer a different direction from the surrounding year.`);
 else paragraphs.push(`Within that annual theme, ${contextWords[0]}, while ${contextWords[1]}. The annual relationship remains the longer-running theme even when a particular month or day differs.`);
 const present=new Set([selected.branch,calendar.year[1],calendar.month[1],calendar.day[1]]);
 for(const [kind,groups] of [["三合",rules.threeHarmony],["三会",rules.seasonalMeeting]]){
  const full=groups.find(group=>group.members.includes(selected.branch)&&group.members.every(branch=>present.has(branch)));
  if(full)paragraphs.push(`Across the selected animal and the recorded year, month and day, all three branches of the ${full.element} ${kind} group (${full.members.join("·")}) are present. This is a complete three-branch grouping in this limited comparison, unlike merely sharing two members; a full birth-chart assessment would require further context.`);
 }
 return {keys,headline,paragraphs};
}
