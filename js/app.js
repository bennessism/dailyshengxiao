import {calendarFor,buildReading} from "./engine.js";
const $=id=>document.getElementById(id);
const paths=["animals","relationships","knowledge","yearly","monthly","daily"];
const data=Object.fromEntries(await Promise.all(paths.map(async k=>{
  const res=await fetch("./data/"+k+".json");if(!res.ok)throw new Error(k+" data HTTP "+res.status);return [k,await res.json()];
})));
const periods=["yearly","monthly","daily"];
let active="daily",chosen="rat",calendar=null;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function render(){
 const animal=data.animals.find(a=>a.id===chosen);
 const value=calendar[active], branch=value[1], periodData=data[active];
 const pair=data.animals.find(a=>a.branch===branch);
 const info=buildReading(active,branch,animal,data.relationships,periodData);
 $("title").textContent=animal.han+" · "+animal.name;
 $("summary").textContent=periodData.introduction;
 $("period-caption").textContent=periodData.title+" · "+value+" · "+pair.han+" "+pair.name;
 $("reading").innerHTML='<div class="relationship-tags">'+info.keys.map(k=>'<span class="tag">'+escapeHTML(k)+'</span>').join("")+'</div>'+info.paragraphs.map(p=>'<p>'+escapeHTML(p)+'</p>').join("")+'<p class="context"><strong>Calendar fact:</strong> The '+escapeHTML(active)+' pillar is '+escapeHTML(value)+'. '+escapeHTML(animal.name)+' corresponds to '+escapeHTML(animal.branch)+'. The above relationships follow the configured traditional branch tables, while their meanings are cultural interpretations rather than verified predictions.</p>';
 document.querySelectorAll("[data-period]").forEach(b=>{b.classList.toggle("active",b.dataset.period===active);b.setAttribute("aria-pressed",String(b.dataset.period===active))});
 document.querySelectorAll("[data-animal]").forEach(b=>{b.classList.toggle("active",b.dataset.animal===chosen);b.setAttribute("aria-pressed",String(b.dataset.animal===chosen))});
}
function init(){
 calendar=calendarFor(new Date());
 const day=new Date().toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"});
 $("today").textContent=day;
 $("pillars").innerHTML=[["yearly","年柱"],["monthly","月柱"],["daily","日柱"]].map(([key,label])=>'<div class="pillar"><small>'+label+'</small><strong>'+calendar[key]+'</strong></div>').join("");
 $("animal-grid").innerHTML=data.animals.map(a=>'<button class="animal" data-animal="'+a.id+'" aria-pressed="false"><span class="han">'+a.han+'</span><span>'+a.name+'</span></button>').join("");
 $("knowledge").innerHTML=data.knowledge.map(k=>'<details><summary><span>'+k.name+' · '+k.en+'</span><span class="plus">+</span></summary><p>'+escapeHTML(k.detail)+'</p></details>').join("");
 document.querySelectorAll("[data-animal]").forEach(b=>b.addEventListener("click",()=>{chosen=b.dataset.animal;render()}));
 document.querySelectorAll("[data-period]").forEach(b=>b.addEventListener("click",()=>{active=b.dataset.period;render()}));
 render();
}
try{init();$("engine-status").textContent="Calendar engine ready · lunar-javascript";$("engine-status").className="status ok"}
catch(e){$("engine-status").textContent="Calendar unavailable: "+e.message;$("engine-status").className="status error";console.error(e)}
