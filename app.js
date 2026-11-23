/* IELTS Studio — first version. All data is stored locally in this browser. */
const STORE_KEY = "ieltsStudio.v2";
const LEGACY_STORE_KEY = "ieltsStudio.v1";
const todayISO = () => new Date().toISOString().slice(0,10);
const defaultTasks = [
  {id:"t1",title:"Listening practice",detail:"Complete one focused listening activity",done:false},
  {id:"t2",title:"Vocabulary review",detail:"Review words due today",done:false},
  {id:"t3",title:"Reading practice",detail:"Complete one passage or question set",done:false},
  {id:"t4",title:"Speaking or writing",detail:"Practise one productive skill",done:false}
];
const seedWords = [
  {id:uid(),word:"significant",meaning:"Important or large enough to be noticed",example:"There has been a significant increase in public transport use.",topic:"General",created:todayISO(),due:todayISO(),interval:0,mastered:false},
  {id:uid(),word:"sustainable",meaning:"Able to continue over a period of time without damaging the environment",example:"Cities need to develop more sustainable transport systems.",topic:"Environment",created:todayISO(),due:todayISO(),interval:0,mastered:false},
  {id:uid(),word:"allocate",meaning:"To give something officially for a particular purpose",example:"The government should allocate more funding to education.",topic:"Education",created:todayISO(),due:todayISO(),interval:0,mastered:false}
];
function uid(){return Math.random().toString(36).slice(2,10)}
function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORE_KEY) || localStorage.getItem(LEGACY_STORE_KEY));
    if(saved) return {...saved,tasks:saved.tasks||defaultTasks,words:saved.words||[],mistakes:saved.mistakes||[],exams:saved.exams||[],sessions:saved.sessions||[],essays:saved.essays||[],speaking:saved.speaking||[],activityDays:saved.activityDays||[],practiceResults:saved.practiceResults||{},practiceDrafts:saved.practiceDrafts||{}};
  }catch(e){console.warn("Could not read saved data",e)}
  return {tasks:defaultTasks.map(x=>({...x})),words:seedWords,mistakes:[],exams:[],sessions:[],essays:[],speaking:[],activityDays:[],practiceResults:{},practiceDrafts:{}};
}
let state=loadState();
state.speakingDrafts=state.speakingDrafts||{};
state.tasks=(state.tasks||[]).filter(t=>!String(t.title||"").toLowerCase().includes("listening"));
try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch(e){}

function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(e){console.error("Save failed",e);toast("本地保存失败，请导出备份并检查浏览器存储空间");}renderAll()}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function escapeHTML(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function markActivity(date=todayISO()){if(!state.activityDays.includes(date))state.activityDays.push(date)}
function nav(view){document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id==="view-"+view));document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===view));const active=document.querySelector(`[data-view="${view}"]`);document.getElementById("crumb").textContent=active?active.textContent.trim():view;document.getElementById("sidebar").classList.remove("open");renderAll();window.scrollTo({top:0,behavior:"smooth"})}
document.getElementById("mainNav").addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b)nav(b.dataset.view)});
document.addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b)nav(b.dataset.go)});
document.getElementById("mobileMenu").onclick=()=>document.getElementById("sidebar").classList.toggle("open");
document.getElementById("todayLabel").textContent=new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
document.getElementById("plannerDate").textContent=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"});
function taskHTML(t){return `<label class="task-row ${t.done?"done":""}"><input type="checkbox" data-task="${escapeHTML(t.id)}" ${t.done?"checked":""}><span>${escapeHTML(t.title)}<small style="display:block;margin-top:3px">${escapeHTML(t.detail||"Personal task")}</small></span>${t.done?'<small>Done</small>':'<small>To do</small>'}</label>`}
function renderTasks(){
 const done=state.tasks.filter(t=>t.done).length, pct=state.tasks.length?done/state.tasks.length*100:0;
 document.getElementById("taskCount").textContent=`${done} / ${state.tasks.length} done`;
 document.getElementById("taskProgress").style.width=pct+"%";
 document.getElementById("todayTasks").innerHTML=state.tasks.map(taskHTML).join("")||'<div class="empty-table">No tasks yet.</div>';
 document.getElementById("plannerTasks").innerHTML=state.tasks.map(taskHTML).join("")||'<div class="empty-table">No tasks yet.</div>';
 document.querySelectorAll("[data-task]").forEach(el=>el.onchange=()=>{const t=state.tasks.find(x=>x.id===el.dataset.task);if(t){t.done=el.checked;if(el.checked)markActivity();save();toast(el.checked?"Task completed — progress updated":"Task reopened")}});
 document.getElementById("dashTasks").textContent=done;
}
function overall(scores){const avg=scores.reduce((a,b)=>a+Number(b),0)/scores.length;return Math.round(avg*2)/2}
function renderChart(targetId,large=false){
 const el=document.getElementById(targetId), exams=[...state.exams].sort((a,b)=>a.date.localeCompare(b.date));
 if(!exams.length){el.innerHTML='<div class="empty-state">No results yet. Save your first mock exam to start your score history.</div>';return}
 const W=large?760:480,H=large?270:175,L=large?45:35,R=large?20:12,T=15,B=large?38:28,innerW=W-L-R,innerH=H-T-B;
 const x=i=>L+(exams.length===1?innerW/2:i/(exams.length-1)*innerW), y=v=>T+(9-v)/9*innerH;
 let grid="";for(let v=0;v<=9;v+=1){grid+=`<line x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}" stroke="#eceee8" stroke-width="1"/><text x="${L-10}" y="${y(v)+3}" text-anchor="end" fill="#a0a49b" font-size="${large?10:8}">${v}</text>`}
 const targetY=y(7);
 const points=exams.map((e,i)=>`${x(i)},${y(e.overall)}`).join(" ");
 const circles=exams.map((e,i)=>`<circle cx="${x(i)}" cy="${y(e.overall)}" r="${large?5:4}" fill="#718779" stroke="#fff" stroke-width="2"><title>${escapeHTML(e.name)}: Band ${e.overall}</title></circle><text x="${x(i)}" y="${H-8}" text-anchor="middle" fill="#9a9e95" font-size="${large?9:8}">${escapeHTML(e.date.slice(5))}</text>`).join("");
 el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Overall IELTS band score history">${grid}<line x1="${L}" y1="${targetY}" x2="${W-R}" y2="${targetY}" stroke="#c69b69" stroke-dasharray="5 4"/><text x="${W-R}" y="${targetY-6}" text-anchor="end" fill="#b18a5d" font-size="9">Target 7.0</text><polyline points="${points}" fill="none" stroke="#718779" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${circles}</svg>`;
}
function renderExams(){
 const sorted=[...state.exams].sort((a,b)=>b.date.localeCompare(a.date));
 const rows=sorted.map(e=>`<tr><td>${escapeHTML(e.date)}</td><td>${escapeHTML(e.name)}</td><td>${e.L}</td><td>${e.R}</td><td>${e.W}</td><td>${e.S}</td><td><b>${e.overall}</b></td><td><button class="text-button" data-delete-exam="${e.id}">Delete</button></td></tr>`).join("");
 const html=rows?`<table><thead><tr><th>DATE</th><th>EXAM</th><th>L</th><th>R</th><th>W</th><th>S</th><th>OVERALL</th><th></th></tr></thead><tbody>${rows}</tbody></table>`:'<div class="empty-table">No mock results recorded yet.</div>';
 document.getElementById("examHistory").innerHTML=html;document.getElementById("examCount").textContent=`${sorted.length} exams`;
 document.querySelectorAll("[data-delete-exam]").forEach(b=>b.onclick=()=>{if(confirm("Delete this mock result?")){state.exams=state.exams.filter(x=>x.id!==b.dataset.deleteExam);save()}});
 const latest=sorted[0],best=state.exams.length?Math.max(...state.exams.map(x=>x.overall)):null;
 document.getElementById("dashBand").textContent=latest?latest.overall.toFixed(1):"—";
 document.getElementById("dashBandSub").textContent=latest?latest.date:"Complete a mock exam to begin";
 document.getElementById("progressLatest").textContent=latest?latest.overall.toFixed(1):"—";
 document.getElementById("progressBest").textContent=best?best.toFixed(1):"—";
 document.getElementById("progressMocks").textContent=state.exams.length;
 renderChart("miniChart");renderChart("fullChart",true);
 const skills=["L","R","W","S"],names=["Listening","Reading","Writing","Speaking"];
 document.getElementById("skillComparison").innerHTML=state.exams.length?names.map((n,i)=>{const avg=state.exams.reduce((a,e)=>a+e[skills[i]],0)/state.exams.length;return `<div class="type-list"><div><span>${n}</span><b>${avg.toFixed(1)} average</b></div></div>`}).join(""):'<div class="empty-table">Skill averages will appear after you record mock exam results.</div>';
}
document.getElementById("saveExam").onclick=()=>{
 const scoreIds=["scoreListening","scoreReading","scoreWriting","scoreSpeaking"];
 const raw=scoreIds.map(id=>document.getElementById(id).value.trim());
 const vals=raw.map(Number);
 if(raw.some(v=>v==="")||vals.some(v=>!Number.isFinite(v)||v<0||v>9||Math.round(v*2)!==v*2)){toast("Enter all four band scores in 0.5 steps, from 0 to 9");return}
 const date=document.getElementById("examDate").value||todayISO(),name=document.getElementById("examName").value.trim()||"Practice mock exam";
 state.exams.push({id:uid(),date,name,L:vals[0],R:vals[1],W:vals[2],S:vals[3],overall:overall(vals)});
 markActivity(date);["scoreListening","scoreReading","scoreWriting","scoreSpeaking"].forEach(id=>document.getElementById(id).value="");document.getElementById("examName").value="";save();toast("Mock result saved");
};
document.getElementById("examDate").value=todayISO();

function saveSession(skill,name,correct,total,note){
 if(!name.trim()||!Number.isFinite(correct)||!Number.isFinite(total)||correct<0||total<1||correct>total){toast("Please check the material name and scores");return}
 state.sessions.push({id:uid(),skill,name:name.trim(),correct,total,note,date:todayISO()});markActivity();save();toast(`${skill} session saved`);
}
document.getElementById("saveListening").onclick=()=>saveSession("Listening",document.getElementById("listenName").value,Number(document.getElementById("listenCorrect").value),Number(document.getElementById("listenTotal").value),document.getElementById("listenNote").value);
function renderSessions(){
 ["Listening","Reading"].forEach(skill=>{
  const arr=[...state.sessions].filter(s=>s.skill===skill).reverse(),id=skill==="Listening"?"listeningHistory":"readingHistory";
  document.getElementById(skill==="Listening"?"listenCount":"readCount").textContent=`${arr.length} sessions`;
  document.getElementById(id).innerHTML=arr.length?`<table><thead><tr><th>DATE</th><th>MATERIAL</th><th>SCORE</th><th>NOTES</th></tr></thead><tbody>${arr.map(s=>`<tr><td>${s.date}</td><td>${escapeHTML(s.name)}</td><td>${s.correct}/${s.total} (${Math.round(s.correct/s.total*100)}%)</td><td>${escapeHTML(s.note||"—")}</td></tr>`).join("")}</tbody></table>`:'<div class="empty-table">No sessions recorded yet.</div>';
 });
}
document.querySelectorAll(".routine-check").forEach(c=>c.onchange=()=>{if(c.checked){markActivity();save();toast("Listening routine step completed")}});
document.getElementById("essayText").addEventListener("input",()=>{const n=document.getElementById("essayText").value.trim().split(/\s+/).filter(Boolean).length;document.getElementById("wordCount").textContent=`${n} words`});
document.getElementById("saveEssay").onclick=()=>{const text=document.getElementById("essayText").value.trim();if(!text){toast("Write something before saving");return}state.essays.push({id:uid(),type:document.getElementById("essayType").value,prompt:document.getElementById("essayPrompt").value,text,date:todayISO(),words:text.split(/\s+/).length});markActivity();save();localStorage.removeItem('ieltsStudio.pendingEssay');toast("Writing draft saved locally")};
function renderEssays(){const arr=[...state.essays].reverse();document.getElementById("essayHistory").innerHTML=arr.length?`<table><thead><tr><th>DATE</th><th>TYPE</th><th>QUESTION</th><th>WORDS</th><th></th></tr></thead><tbody>${arr.map(e=>`<tr><td>${e.date}</td><td>${escapeHTML(e.type)}</td><td>${escapeHTML(e.prompt||"Personal draft").slice(0,55)}</td><td>${e.words}</td><td><button class="text-button" data-open-essay="${e.id}">Open</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty-table">No saved drafts yet.</div>';document.querySelectorAll("[data-open-essay]").forEach(b=>b.onclick=()=>{const e=state.essays.find(x=>x.id===b.dataset.openEssay);document.getElementById("essayType").value=e.type;document.getElementById("essayPrompt").value=e.prompt;document.getElementById("essayText").value=e.text;document.getElementById("wordCount").textContent=e.words+" words";nav("writing")})}
function renderSpeaking(){ /* Legacy speaking history removed; question notebook is handled below. */ }
const IELTS_VOCAB_TARGET=4000;
function renderWords(){
 const q=(document.getElementById("wordSearch").value||"").toLowerCase(),arr=state.words.filter(w=>(w.word+" "+w.meaning+" "+w.topic).toLowerCase().includes(q));
 document.getElementById("vocabTotal").textContent=IELTS_VOCAB_TARGET.toLocaleString("en-GB");document.getElementById("vocabDue").textContent=state.words.filter(w=>!w.mastered&&(!w.due||w.due<=todayISO())).length;const masteredCount=state.words.filter(w=>w.mastered).length;document.getElementById("vocabMastered").textContent=masteredCount.toLocaleString("en-GB")+" / "+IELTS_VOCAB_TARGET.toLocaleString("en-GB");document.getElementById("dashWords").textContent=masteredCount.toLocaleString("en-GB")+" / 4,000";
 document.getElementById("wordTable").innerHTML=arr.length?`<table><thead><tr><th>WORD</th><th>MEANING</th><th>TOPIC</th><th>REVIEW</th><th></th></tr></thead><tbody>${arr.map(w=>`<tr><td><b>${escapeHTML(w.word)}</b><br><small>${escapeHTML(w.example||"")}${w.collocation?"<br><small>常见搭配："+escapeHTML(w.collocation)+"</small>":""}</small></td><td>${escapeHTML(w.meaning)}</td><td>${escapeHTML(w.topic)}</td><td>${w.mastered?"Mastered":w.due||"Due now"}</td><td><button class="text-button" data-delete-word="${w.id}">Delete</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty-table">No matching words.</div>';
 document.querySelectorAll("[data-delete-word]").forEach(b=>b.onclick=()=>{state.words=state.words.filter(w=>w.id!==b.dataset.deleteWord);save()});
 renderReview();
}
document.getElementById("wordSearch").oninput=renderWords;
document.getElementById("addWord").onclick=()=>{const word=document.getElementById("newWord").value.trim(),meaning=document.getElementById("newMeaning").value.trim();if(!word||!meaning){toast("Add a word and its meaning");return}state.words.unshift({id:uid(),word,meaning,example:document.getElementById("newExample").value.trim(),topic:document.getElementById("newWordTopic").value,created:todayISO(),due:todayISO(),interval:0,mastered:false});["newWord","newMeaning","newExample"].forEach(id=>document.getElementById(id).value="");markActivity();save();toast("Word added to your bank")};
let currentReview=null,revealed=false;
function renderReview(){const due=state.words.filter(w=>!w.mastered&&(!w.due||w.due<=todayISO()));currentReview=due.length?due[Math.floor(Math.random()*due.length)]:null;revealed=false;const card=document.getElementById("reviewCard");card.classList.remove("revealed");card.textContent=currentReview?currentReview.word:(state.words.length?"You are all caught up. Add or review more words.":"Add a few words to start reviewing.");document.getElementById("revealWord").disabled=!currentReview;document.getElementById("reviewAgain").disabled=!currentReview;document.getElementById("reviewKnown").disabled=!currentReview}
document.getElementById("revealWord").onclick=()=>{if(!currentReview)return;revealed=true;const card=document.getElementById("reviewCard");card.classList.add("revealed");card.innerHTML=`<div><b>${escapeHTML(currentReview.meaning)}</b><p style="color:#858b81;font-size:10px;margin:8px 0 0">${escapeHTML(currentReview.example||"No example added yet.")}</p></div>`};
function reviewResult(known){if(!currentReview||!revealed){toast("Reveal the meaning before rating your answer");return}if(known){currentReview.interval=currentReview.interval?Math.min(30,currentReview.interval*2):1;currentReview.due=new Date(Date.now()+currentReview.interval*86400000).toISOString().slice(0,10);if(currentReview.interval>=14)currentReview.mastered=true}else{currentReview.interval=0;currentReview.due=todayISO()}markActivity();save();toast(known?"Review scheduled":"Word added to today's review")}
document.getElementById("reviewKnown").onclick=()=>reviewResult(true);document.getElementById("reviewAgain").onclick=()=>reviewResult(false);

document.getElementById("addMistake").onclick=()=>{const question=document.getElementById("mistakeQuestion").value.trim(),why=document.getElementById("mistakeWhy").value.trim();if(!question||!why){toast("Add the mistake and why it happened");return}state.mistakes.unshift({id:uid(),skill:document.getElementById("mistakeSkill").value,category:document.getElementById("mistakeCategory").value,question,why,fix:document.getElementById("mistakeFix").value.trim(),date:todayISO(),reviewed:false});markActivity();["mistakeQuestion","mistakeWhy","mistakeFix"].forEach(id=>document.getElementById(id).value="");save();toast("Mistake saved")};
function renderMistakes(){
 const fs=document.getElementById("filterSkill").value,fc=document.getElementById("filterCategory").value,allCats=[...new Set(state.mistakes.map(m=>m.category))],catSel=document.getElementById("filterCategory"),old=catSel.value;
 catSel.innerHTML='<option value="All">All categories</option>'+allCats.map(c=>`<option>${escapeHTML(c)}</option>`).join("");if(allCats.includes(old))catSel.value=old;
 const arr=state.mistakes.filter(m=>(fs==="All"||m.skill===fs)&&(catSel.value==="All"||m.category===catSel.value));
 document.getElementById("mistakeList").innerHTML=arr.length?arr.map(m=>`<article class="mistake-card"><div class="mistake-top"><b>${escapeHTML(m.skill)} · ${escapeHTML(m.category)}</b><small>${m.date}</small></div><p><b>Question / mistake:</b> ${escapeHTML(m.question)}</p><p><b>Why it happened:</b> ${escapeHTML(m.why)}</p><p><b>Correct approach:</b> ${escapeHTML(m.fix||"Not added yet")}</p><div class="mistake-top"><button class="text-button" data-reviewed="${m.id}">${m.reviewed?"Reviewed ✓":"Mark reviewed"}</button><button class="text-button" data-delete-mistake="${m.id}">Delete</button></div></article>`).join(""):'<div class="empty-table">No mistakes match this filter.</div>';
 document.querySelectorAll("[data-reviewed]").forEach(b=>b.onclick=()=>{const m=state.mistakes.find(x=>x.id===b.dataset.reviewed);m.reviewed=!m.reviewed;save()});
 document.querySelectorAll("[data-delete-mistake]").forEach(b=>b.onclick=()=>{state.mistakes=state.mistakes.filter(x=>x.id!==b.dataset.deleteMistake);save()});
}
document.getElementById("filterSkill").onchange=renderMistakes;document.getElementById("filterCategory").onchange=renderMistakes;
const questionPool=[
 {category:"Vocabulary",format:"Multiple choice",prompt:"Choose the closest meaning of “substantial”.",options:["Large or important","Temporary","Unusual"],answer:0,explanation:"Substantial commonly means large in amount, degree or importance. The best option is “large or important”."},
 {category:"Vocabulary",format:"Multiple choice",prompt:"Which word best completes the sentence: “The results were ___ with earlier research.”",options:["consistent","consistency","consistently"],answer:0,explanation:"The phrase is “be consistent with”. An adjective is needed after “were”."},
 {category:"Grammar",format:"Multiple choice",prompt:"Choose the grammatically correct sentence.",options:["People is increasingly concerned about climate change.","People are increasingly concerned about climate change.","People be increasingly concerned about climate change."],answer:1,explanation:"“People” is a plural noun, so it takes “are”."},
 {category:"Grammar",format:"Multiple choice",prompt:"Complete the sentence: “If governments invested more, pollution ___ decrease.”",options:["will","would","has"],answer:1,explanation:"This is a second conditional: if + past simple, would + base verb."},
 {category:"Reading strategies",format:"Multiple choice",prompt:"What is skimming mainly used for when reading an IELTS passage?",options:["Finding every date and number","Understanding the general idea and structure","Checking the spelling of unfamiliar words"],answer:1,explanation:"Skimming means reading quickly to understand the overall topic, organisation and main ideas."},
 {category:"Speaking prompts",format:"Speaking prompt",prompt:"Describe a place you enjoy visiting.",guidance:"Say where it is, what you usually do there, who you go with (if anyone), and why you enjoy visiting it.",explanation:"Try to speak for up to two minutes. Add specific details and a short personal example."},
 {category:"Speaking prompts",format:"Speaking prompt",prompt:"Do you think people read fewer books than they did in the past?",guidance:"Give a clear opinion, explain at least one reason, and support it with an example.",explanation:"For a longer answer, consider different age groups or the effect of digital media."},
 {category:"Vocabulary",format:"Multiple choice",prompt:"Which is the most natural collocation?",options:["make a research","conduct research","do a research"],answer:1,explanation:"“Conduct research” is a standard collocation. “Research” is usually uncountable in this meaning."},
 {category:"Grammar",format:"Multiple choice",prompt:"Choose the correct form: “The number of students ___ increased.”",options:["have","has","are"],answer:1,explanation:"The subject is “the number”, which is singular, so use “has”."},
 {category:"Reading strategies",format:"Multiple choice",prompt:"In IELTS Reading True / False / Not Given questions, what does “Not Given” mean?",options:["The passage clearly contradicts the statement","The passage neither confirms nor contradicts the statement","The statement is definitely true"],answer:1,explanation:"“Not Given” means the passage does not provide enough information to decide whether the statement is true or false."},
 {category:"Vocabulary",format:"Multiple choice",prompt:"“Mitigate” is closest in meaning to:",options:["make something less severe","make something more expensive","measure something carefully"],answer:0,explanation:"To mitigate a problem or effect means to make it less serious, harmful or severe."},
 {category:"Grammar",format:"Multiple choice",prompt:"Choose the grammatically correct sentence.",options:["Despite of the rain, we went out.","Despite the rain, we went out.","Although the rain, we went out."],answer:1,explanation:"Use “despite + noun phrase”. Alternatively, say “although it was raining”."}
];
let generatedSet=[];
document.getElementById("buildMock").onclick=()=>{
 const category=document.getElementById("mockArea").value,format=document.getElementById("mockType").value,count=Number(document.getElementById("mockCount").value);
 const pool=questionPool.filter(q=>(category==="All categories"||q.category===category)&&(format==="All formats"||q.format===format));
 if(!pool.length){toast("No questions match this combination");return}
 generatedSet=[...pool].sort(()=>Math.random()-.5).slice(0,Math.min(count,pool.length));
 document.getElementById("mockSet").innerHTML=`<p class="small muted">${generatedSet.length} original practice items · Answers and explanations included</p>`+generatedSet.map((q,i)=>`<div class="mock-question"><span class="question-tag">${escapeHTML(q.category)} · ${escapeHTML(q.format)}</span><b>${i+1}. ${escapeHTML(q.prompt)}</b>${q.options?`<ol class="mock-options" type="A">${q.options.map(o=>`<li>${escapeHTML(o)}</li>`).join("")}</ol><details class="answer-reveal"><summary>Show answer and explanation</summary><p><b>Answer: ${String.fromCharCode(65+q.answer)} — ${escapeHTML(q.options[q.answer])}</b></p><p>${escapeHTML(q.explanation)}</p></details>`:`<p>${escapeHTML(q.guidance)}</p><details class="answer-reveal"><summary>Show practice guidance</summary><p>${escapeHTML(q.explanation)}</p></details>`}</div>`).join("")+`<button class="button button-light" id="finishSet">Mark practice set complete</button>`;
 document.getElementById("finishSet").onclick=()=>{markActivity();save();toast("Practice set completed")};
};
document.getElementById("addTask").onclick=()=>{const v=document.getElementById("customTask").value.trim();if(!v){toast("Enter a task name");return}state.tasks.push({id:uid(),title:v,detail:"Personal study task",done:false});document.getElementById("customTask").value="";save();toast("Task added")};
function renderCalendar(){const el=document.getElementById("calendar"),now=new Date(),year=now.getFullYear(),month=now.getMonth(),first=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate();let html=["S","M","T","W","T","F","S"].map(x=>`<div class="calendar-day head">${x}</div>`).join("");for(let i=0;i<first;i++)html+='<div></div>';for(let d=1;d<=days;d++){const date=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;html+=`<div class="calendar-day ${state.activityDays.includes(date)?"active":""}">${d}</div>`}el.innerHTML=html;document.getElementById("streakNumber").textContent=state.activityDays.length;document.getElementById("dashDays").textContent=state.activityDays.length}
function renderProductiveScores(){["Writing","Speaking"].forEach(skill=>{const id=skill.toLowerCase()+"ScoreHistory",el=document.getElementById(id);if(!el)return;const rows=state.sessions.filter(x=>x.skill===skill).slice().reverse();el.innerHTML=rows.length?`<div class="table-wrap"><table><thead><tr><th>DATE</th><th>PRACTICE</th><th>SELF-ASSESSMENT BAND</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${escapeHTML(x.date)}</td><td>${escapeHTML(x.name)}</td><td><b>${Number(x.band).toFixed(1)}</b></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty-table">暂无自评成绩</div>`})}
function renderAll(){renderTasks();renderWords();renderMistakes();renderExams();renderSessions();renderEssays();renderSpeaking();renderProductiveScores();renderCalendar()}
document.getElementById("startDiagnostic").onclick=runDiagnostic;
const diagnosticQuestions=[
 {area:"Vocabulary",q:"The word “crucial” is closest in meaning to:",opts:["Unimportant","Essential","Uncertain","Frequent"],a:1,why:"Crucial means extremely important or necessary."},
 {area:"Vocabulary",q:"Choose the best collocation:",opts:["strong rain","heavy rain","powerful rain","large rain"],a:1,why:"“Heavy rain” is the natural English collocation."},
 {area:"Vocabulary",q:"“Decline” as a verb most commonly means:",opts:["To increase","To decrease","To explain","To maintain"],a:1,why:"As a verb, decline commonly means to become smaller or lower."},
 {area:"Vocabulary",q:"Choose the best word: “The policy may have a ___ impact on society.”",opts:["significance","significant","significantly","signify"],a:1,why:"An adjective is needed before the noun “impact”."},
 {area:"Grammar",q:"Choose the grammatically correct sentence:",opts:["She have lived here for years.","She has lived here for years.","She living here for years.","She is live here for years."],a:1,why:"Use has + past participle for the present perfect with she."},
 {area:"Grammar",q:"If I ___ more time, I would study another language.",opts:["have","had","will have","having"],a:1,why:"The second conditional uses if + past simple, would + base verb."},
 {area:"Grammar",q:"Choose the correct option: “There are ___ people using public transport.”",opts:["less","much","fewer","little"],a:2,why:"Use fewer with countable plural nouns such as people."},
 {area:"Grammar",q:"Which sentence uses a relative clause correctly?",opts:["The book which I bought it is useful.","The book that I bought is useful.","The book I bought it useful.","The book who I bought is useful."],a:1,why:"The relative pronoun introduces the clause; do not repeat the object with “it”."},
 {area:"Reading",q:"A passage states: “The museum opened in 1985 and attracts over 100,000 visitors annually.” Which statement is supported?",opts:["The museum opened in 1985.","The museum is free.","The museum is the oldest in the country.","All visitors are tourists."],a:0,why:"Only the opening year is explicitly stated."},
 {area:"Reading",q:"In a reading passage, what is the best first step when matching headings?",opts:["Match one familiar word","Read for the paragraph's main idea","Choose the longest heading","Look only at the final sentence"],a:1,why:"Headings summarise the main idea, not one isolated detail."},
 {area:"Reading",q:"The passage says: “Some researchers support the proposal, while others remain unconvinced.” The statement “All researchers support the proposal” is:",opts:["True","False","Not Given"],a:1,why:"The passage explicitly says some researchers do not support it, so “all” is contradicted."},
 {area:"Reading",q:"Which strategy is most useful for locating a specific date?",opts:["Scanning","Skimming","Predicting the conclusion","Reading every word aloud"],a:0,why:"Scanning helps locate specific details such as dates, names and numbers."}
];
let diagIndex=0,diagAnswers=[];
function runDiagnostic(){diagIndex=0;diagAnswers=[];showDiagnosticQuestion()}
function showDiagnosticQuestion(){
 const area=document.getElementById("diagnosticArea"),q=diagnosticQuestions[diagIndex];document.getElementById("diagTitle").textContent="Question "+(diagIndex+1);document.getElementById("diagProgress").textContent=`${diagIndex+1} / ${diagnosticQuestions.length}`;
 area.innerHTML=`<div class="question"><p class="eyebrow">${q.area.toUpperCase()}</p><p>${escapeHTML(q.q)}</p>${q.opts.map((o,i)=>`<label class="option"><input type="radio" name="diagAnswer" value="${i}"><span>${escapeHTML(o)}</span></label>`).join("")}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px"><button class="button button-light" id="diagBack" ${diagIndex===0?"disabled":""}>Back</button><button class="button button-dark" id="diagNext">${diagIndex===diagnosticQuestions.length-1?"Finish test":"Next question →"}</button></div>`;
 document.getElementById("diagBack").onclick=()=>{if(diagIndex>0){diagIndex--;showDiagnosticQuestion()}};
 document.getElementById("diagNext").onclick=()=>{const selected=document.querySelector('input[name="diagAnswer"]:checked');if(!selected){toast("Choose an answer to continue");return}diagAnswers[diagIndex]=Number(selected.value);if(diagIndex<diagnosticQuestions.length-1){diagIndex++;showDiagnosticQuestion()}else showDiagnosticResult()};
}
function showDiagnosticResult(){
 const areas=["Vocabulary","Grammar","Reading"],scores={};areas.forEach(a=>{const indices=diagnosticQuestions.map((q,i)=>q.area===a?i:-1).filter(i=>i>=0);scores[a]=indices.filter(i=>diagAnswers[i]===diagnosticQuestions[i].a).length});
 const total=Object.values(scores).reduce((a,b)=>a+b,0),pct=Math.round(total/diagnosticQuestions.length*100);
 const feedback=pct>=85?"Strong foundation in this short check. Try more challenging IELTS-style practice.":pct>=65?"A developing foundation. Review missed questions and build consistency.":pct>=40?"Some foundations are in place, but targeted vocabulary and grammar work will help.":"Start with core vocabulary and sentence structures, then build towards IELTS question types.";
 document.getElementById("diagTitle").textContent="Your diagnostic result";document.getElementById("diagProgress").textContent=`${total}/${diagnosticQuestions.length} correct`;
 document.getElementById("diagnosticArea").innerHTML=`<div class="info-grid"><div><b>${total}/${diagnosticQuestions.length}</b><small>Correct answers</small></div><div><b>${pct}%</b><small>Accuracy</small></div><div><b>3</b><small>Areas checked</small></div></div>${areas.map(a=>`<div class="type-list"><div><span>${a}</span><b>${scores[a]} / ${diagnosticQuestions.filter(q=>q.area===a).length}</b></div></div>`).join("")}<div class="notice"><b>Learning insight</b><span>${feedback}</span></div><h2 style="margin-top:20px">Review your answers</h2>${diagnosticQuestions.map((q,i)=>`<div class="question"><p>${i+1}. ${escapeHTML(q.q)}</p><p class="small">${diagAnswers[i]===q.a?"✓ Correct":"✕ Your answer: "+escapeHTML(q.opts[diagAnswers[i]])+" · Correct: "+escapeHTML(q.opts[q.a])}</p><p class="small muted">${escapeHTML(q.why)}</p></div>`).join("")}<button class="button button-dark" id="saveDiagnostic">Save result to my learning record</button> <button class="button button-light" id="retryDiagnostic">Try again</button>`;
 document.getElementById("saveDiagnostic").onclick=()=>{state.diagnostic={date:todayISO(),scores,total,pct};markActivity();save();toast("Diagnostic result saved")};document.getElementById("retryDiagnostic").onclick=runDiagnostic;
}
document.getElementById("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="ielts-studio-backup-"+todayISO()+".json";a.click();URL.revokeObjectURL(url);toast("Backup exported")};
document.getElementById("importBtn").onclick=()=>document.getElementById("importFile").click();
document.getElementById("importFile").onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data||!Array.isArray(data.words)||!Array.isArray(data.exams))throw new Error("Invalid backup");if(confirm("Import this backup and replace the data currently stored in this browser?")){state=data;save();toast("Backup imported")}}catch(err){toast("Could not import this file. Check that it is an IELTS Studio backup.")}e.target.value=""};
function renderDashboardDiagnostic(){if(state.diagnostic){const d=state.diagnostic;document.getElementById("dashBandSub").textContent=`Placement check: ${d.pct}% · ${d.date}`}}

// ===== IELTS Studio v2: real answerable practice with automatic marking =====
const skillBanks = {

 listening: {
  script: `Hello, this is a message for people who have registered for the university study skills workshop. The workshop will take place on Thursday the fourteenth of May, not Wednesday as stated in the first email. Please arrive at the West Building, room 204, by 9:15. The session begins at half past nine and finishes at twelve fifteen. You do not need to bring a laptop, but please bring a notebook. A light lunch will be provided. If you have any questions, contact the organiser, Helen Carter, by email before Monday.`,
  questions: [
   ["On which day will the workshop take place?",["Wednesday","Thursday","Friday","Monday"],1,"The speaker corrects the earlier email: Thursday."],
   ["What is the date of the workshop?",["The 4th of May","The 14th of May","The 15th of May","The 24th of May"],1,"The date is the fourteenth of May."],
   ["Where will the workshop be held?",["East Building, room 204","West Building, room 204","West Building, room 214","Library, room 204"],1,"The location is West Building, room 204."],
   ["What time should participants arrive?",["9:00","9:15","9:30","9:45"],1,"Participants should arrive by 9:15."],
   ["When does the session finish?",["11:45","12:00","12:15","12:30"],2,"It finishes at twelve fifteen."],
   ["What should participants bring?",["A laptop","A printed ticket","A notebook","A packed lunch"],2,"A notebook is required; a laptop is not needed."],
   ["What will be provided?",["Breakfast","A light lunch","A notebook","A laptop"],1,"A light lunch will be provided."],
   ["Who is the organiser?",["Helen Carter","Hannah Cooper","Helen Cooper","Harriet Carter"],0,"The organiser is Helen Carter."],
   ["How should participants contact the organiser?",["By phone","In person","By email","By post"],2,"The speaker asks people to contact her by email."],
   ["By when should questions be sent?",["Before Monday","After Monday","On Thursday morning","Before Friday"],0,"Questions should be sent before Monday."]
  ]
 }
};
const skillQuizState = {reading:state.practiceResults?.reading||null,listening:state.practiceResults?.listening||null};

// Reading data is imported by the owner into this browser; copyrighted passage text is
// deliberately not committed to this public repository.
let readingBankCache=null;
let readingBankLoadStarted=false;
function getReadingBank(){
 if(readingBankCache)return readingBankCache;
 try{return JSON.parse(localStorage.getItem("ieltsStudio.readingBank")||"null")}catch(e){return null}
}
function openReadingDatabase(){
 return new Promise((resolve,reject)=>{
  if(!window.indexedDB){reject(new Error("IndexedDB unavailable"));return}
  const request=indexedDB.open("ieltsStudioPersonalData",1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains("readingBank"))db.createObjectStore("readingBank")};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error("Database open failed"));
 });
}
async function restoreReadingBank(){
 const db=await openReadingDatabase();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction("readingBank","readonly"),request=tx.objectStore("readingBank").get("main");
  request.onsuccess=()=>{readingBankCache=request.result||null;db.close();resolve(readingBankCache)};
  request.onerror=()=>{db.close();reject(request.error||new Error("Database read failed"))};
 });
}
async function saveReadingBank(data){
 const db=await openReadingDatabase();
 await new Promise((resolve,reject)=>{
  const tx=db.transaction("readingBank","readwrite");tx.objectStore("readingBank").put(data,"main");
  tx.oncomplete=()=>{db.close();resolve()};
  tx.onerror=()=>{db.close();reject(tx.error||new Error("Database write failed"))};
  tx.onabort=()=>{db.close();reject(tx.error||new Error("Database write aborted"))};
 });
 readingBankCache=data;readingBankLoadStarted=true;
}
async function clearReadingBank(){
 try{const db=await openReadingDatabase();await new Promise((resolve,reject)=>{const tx=db.transaction("readingBank","readwrite");tx.objectStore("readingBank").delete("main");tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}catch(e){}
 readingBankCache=null;localStorage.removeItem("ieltsStudio.readingBank");
}
function readingQuestionHTML(q,i,answer){
 const id="rq-"+i, type=q.type||"short";
 const label=q.number||i+1;
 if(type==="multi_select"){
  const selected=Array.isArray(answer)?answer:[];
  return '<div class="question quiz-question" data-q="'+i+'"><span class="question-tag">'+escapeHTML(q.typeLabel||"多项选择")+'</span><b>'+escapeHTML(label+". "+q.prompt)+'</b><div class="answer-options">'+(q.options||[]).map(o=>{const val=typeof o==="string"?o:(o.value||o.label||o.text||"");return '<label class="option"><input type="checkbox" name="'+id+'" value="'+escapeHTML(val)+'" '+(selected.some(v=>normAnswer(v)===normAnswer(val))?"checked":"")+'><span>'+escapeHTML(val)+'</span></label>'}).join("")+'</div><small class="muted">请选择 '+(q.requiredSelections||"指定数量")+' 项</small></div>';
 }
 if(type==="matching"){
  const opts=q.options||[];
  return '<div class="question quiz-question" data-q="'+i+'"><span class="question-tag">'+escapeHTML(q.typeLabel||"匹配题")+'</span><label class="reading-answer-label"><b>'+escapeHTML(label+". "+q.prompt)+'</b><select name="'+id+'"><option value="">请选择</option>'+opts.map(o=>{const val=typeof o==="string"?o:(o.value||o.label||o.text||"");return '<option value="'+escapeHTML(val)+'" '+(normAnswer(answer)===normAnswer(val)?"selected":"")+'>'+escapeHTML(val)+'</option>'}).join("")+'</select></label></div>';
 }
 if(type==="mcq"||type==="multiple_choice"||type==="matching"||type==="heading_match"){
  const opts=q.options||[];
  return `<div class="question quiz-question" data-q="${i}"><span class="question-tag">${escapeHTML(q.typeLabel||({mcq:"选择题",multiple_choice:"选择题",matching:"匹配题",heading_match:"段落标题匹配"}[type]||"匹配题"))}</span><b>${escapeHTML(label+". "+q.prompt)}</b><div class="answer-options">${opts.map((o,j)=>{const val=typeof o==="string"?o:(o.value||o.label||o.text||"");return `<label class="option"><input type="radio" name="${id}" value="${escapeHTML(val)}" ${normAnswer(answer)===normAnswer(val)?"checked":""}><span>${escapeHTML(val)}</span></label>`}).join("")}</div></div>`;
 }
 if(type==="tfng"||type==="true_false_not_given")return `<div class="question quiz-question"><span class="question-tag">TRUE / FALSE / NOT GIVEN</span><b>${escapeHTML(label+". "+q.prompt)}</b><div class="answer-options">${["TRUE","FALSE","NOT GIVEN"].map(v=>`<label class="option"><input type="radio" name="${id}" value="${v}" ${normAnswer(answer)===normAnswer(v)?"checked":""}><span>${v}</span></label>`).join("")}</div></div>`;
 if(type==="yesno"||type==="yes_no_not_given")return `<div class="question quiz-question"><span class="question-tag">YES / NO / NOT GIVEN</span><b>${escapeHTML(label+". "+q.prompt)}</b><div class="answer-options">${["YES","NO","NOT GIVEN"].map(v=>`<label class="option"><input type="radio" name="${id}" value="${v}" ${normAnswer(answer)===normAnswer(v)?"checked":""}><span>${v}</span></label>`).join("")}</div></div>`;
 if((type==="multi_gap"||type==="completion"||type==="table_completion"||type==="note_completion"||type==="summary_completion")&&Array.isArray(q.blanks)){
  const vals=Array.isArray(answer)?answer:[];
  return `<div class="question quiz-question"><span class="question-tag">${escapeHTML(q.typeLabel||"多空填空题")}</span><b>${escapeHTML(label+". "+q.prompt)}</b>${q.blanks.map((hint,j)=>`<label class="reading-answer-label"><b>${escapeHTML(typeof hint==="string"?hint:(hint.label||("空格 "+(j+1))))}</b><input type="text" data-reading-answer="${i}-${j}" value="${escapeHTML(vals[j]||"")}" placeholder="Answer ${j+1}"></label>`).join("")}</div>`;
 }
 return `<div class="question quiz-question"><span class="question-tag">${escapeHTML(q.typeLabel||"填空题")}</span><label class="reading-answer-label"><b>${escapeHTML(label+". "+q.prompt)}</b><input type="text" data-reading-answer="${i}" value="${escapeHTML(answer||"")}" placeholder="Type your answer here"></label></div>`;
}
function renderSkillQuiz(skill){
 const root=document.getElementById(skill+"Quiz"); if(!root)return;
 if(skill==="reading"){
  const bank=getReadingBank();
  if(!bank&&!readingBankLoadStarted){
   readingBankLoadStarted=true;
   root.innerHTML='<div class="reading-empty"><h2>正在读取你的个人题库…</h2><p>首次打开可能需要几秒钟。</p></div>';
   restoreReadingBank().then(()=>renderSkillQuiz("reading")).catch(()=>{readingBankLoadStarted=true;renderSkillQuiz("reading")});
   return;
  }
  if(!bank||!Array.isArray(bank.passages)||!bank.passages.length){
   document.body.classList.remove("reading-page-open");
   root.innerHTML=`<div class="reading-empty"><div class="reading-empty-icon">▤</div><h2>导入个人阅读题库</h2><p>导入个人题库 JSON 后，文章和练习会保存在当前浏览器中，不会上传到 GitHub。</p><label class="button button-dark import-reading-label" for="readingBankFile">选择阅读题库 JSON</label><input id="readingBankFile" type="file" accept="application/json,.json" hidden><small>题库需包含 passages 数组；支持选择、判断、填空、匹配等题型。</small></div>`;
   const picker=document.getElementById("readingBankFile");
   picker.onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data.passages)||!data.passages.length)throw new Error("Invalid format");await saveReadingBank(data);state.practiceResults=state.practiceResults||{};Object.keys(state.practiceResults).forEach(k=>{if(k.startsWith("reading:"))delete state.practiceResults[k]});state.practiceDrafts=state.practiceDrafts||{};Object.keys(state.practiceDrafts).forEach(k=>{if(k.startsWith("reading:"))delete state.practiceDrafts[k]});localStorage.removeItem("ieltsStudio.activePassage");skillQuizState.reading=null;save();renderSkillQuiz("reading");toast("181 篇阅读文章已保存到本浏览器")}catch(err){toast("导入失败：请检查文件，或确认浏览器允许本地存储")}e.target.value=""};
   return;
  }
  const passageIndex=Number(localStorage.getItem("ieltsStudio.activePassage")||0);
  const passage=bank.passages[Math.min(Math.max(0,passageIndex),bank.passages.length-1)];
  const result=state.practiceResults?.["reading:"+passage.id];
  if(result?.submitted){
   document.body.classList.add("reading-page-open");
   const total=passage.questions.reduce((n,q)=>n+(q.marks||1),0), pct=Math.round(result.correct/total*100);
   root.innerHTML=`<div class="reading-result"><div class="reading-result-top"><div><p class="eyebrow">MARKING COMPLETE</p><h2>${escapeHTML(passage.title)}</h2><p class="muted">已完成批阅，逐题核对你的答案。</p></div><div class="reading-score"><strong>${result.correct}/${total}</strong><span>${pct}% 正确率</span></div></div><div class="reading-review-list">${passage.questions.map((q,i)=>{const ok=result.marks[i],u=result.answers[i]??"";return `<article class="reading-review-item ${ok?"is-correct":"is-wrong"}"><div class="review-status">${ok?"✓ 正确":"✕ 错误"}</div><b>${escapeHTML((q.number||i+1)+". "+q.prompt)}</b><p>你的答案：${escapeHTML(Array.isArray(u)?u.join(" / "):(u||"未作答"))}　·　正确答案：${escapeHTML(Array.isArray(q.answers||q.answer)?(q.answers||q.answer).join(" / "):(q.answer??""))}</p>${q.questionTranslation?'<small>题目翻译：'+escapeHTML(q.questionTranslation)+'</small>':''}${q.explanation?'<small>'+escapeHTML(q.explanation)+'</small>':''}${(q.evidence||[]).map(e=>'<div class="reading-evidence"><small>'+escapeHTML(e.location||"原文依据")+'</small><blockquote>'+escapeHTML(e.quote||"")+'</blockquote>'+(e.translation?'<small>'+escapeHTML(e.translation)+'</small>':'')+'</div>').join('')}</article>`}).join("")}</div><button class="button button-dark" id="readingRetry">重新练习</button><button class="button button-light" id="readingBackList">返回文章列表</button></div>`;
   document.getElementById("readingRetry").onclick=()=>{delete state.practiceResults["reading:"+passage.id];save();renderSkillQuiz("reading")};
   document.getElementById("readingBackList").onclick=()=>{localStorage.removeItem("ieltsStudio.activePassage");document.body.classList.remove("reading-page-open");renderSkillQuiz("reading")};
   return;
  }
  if(!localStorage.getItem("ieltsStudio.activePassage")){
   document.body.classList.remove("reading-page-open");
   root.innerHTML=`<div class="reading-library-head"><div><p class="eyebrow">YOUR READING LIBRARY</p><h2>阅读题库</h2><p class="muted">共 ${bank.passages.length} 篇文章 · ${bank.passages.reduce((n,p)=>n+(p.scoreCount||p.questions.length),0)} 个答题点 · 选择一篇开始练习</p></div><button class="button button-light" id="replaceReadingBank">更换题库</button></div><div class="reading-library-grid">${bank.passages.map((p,i)=>`<button class="reading-library-card" data-passage="${i}"><span>${"P"+((p.group||"Reading Passage 1").match(/Passage\s*(\d)/i)?.[1]||"1")}</span><b>${escapeHTML(p.title)}</b><small>${p.scoreCount||p.questions.length} 道题 · ${(p.group||"").replace(/Reading\s*/i,"")}</small><em>开始练习 →</em></button>`).join("")}</div>`;
   root.querySelectorAll("[data-passage]").forEach(b=>b.onclick=()=>{localStorage.setItem("ieltsStudio.activePassage",b.dataset.passage);renderSkillQuiz("reading")});
   document.getElementById("replaceReadingBank").onclick=async()=>{await clearReadingBank();readingBankLoadStarted=true;renderSkillQuiz("reading")};
   return;
  }
  const answers=state.practiceDrafts?.["reading:"+passage.id]||{};
  document.body.classList.add("reading-page-open");
  root.innerHTML=`<div class="reading-practice-toolbar"><button class="text-button" id="readingBack">← 返回文章列表</button><span>${escapeHTML(passage.title)}</span><span>${passage.scoreCount||passage.questions.length} 题</span></div><div class="reading-split"><article class="reading-article-pane"><div class="reading-pane-title"><p class="eyebrow">READING PASSAGE</p><h2>${escapeHTML(passage.title)}</h2></div><div class="reading-article-text">${escapeHTML(passage.text).replace(/\\n/g,"<br><br>")}</div></article><section class="reading-questions-pane"><div class="reading-pane-title"><p class="eyebrow">QUESTIONS</p><h2>答题区</h2><p class="muted">按题目要求选择或填写答案，完成后统一提交批阅。</p></div><div class="reading-question-list">${passage.questions.map((q,i)=>{const group=(passage.taskGroups||[]).find(g=>g.id===q.taskId);const prev=passage.questions[i-1];const asset=group?.diagramAssetId?passage.assets?.[group.diagramAssetId]:null;const diagram=asset?'<figure class="reading-diagram"><img src="data:'+asset.mediaType+';base64,'+asset.data+'" alt="'+escapeHTML(asset.alt||group.diagramTitle||"Question diagram")+'"><figcaption>'+escapeHTML(group.diagramTitle||"Diagram")+'</figcaption></figure>':'';const heading=!prev||prev.taskId!==q.taskId?'<div class="reading-task-heading"><b>'+escapeHTML(group?.heading||q.typeLabel||"Questions")+'</b>'+(group?.instructions||[]).map(x=>'<small>'+escapeHTML(x)+'</small>').join('')+diagram+'</div>':'';const prepared={...q,options:q.options||passage.optionSets?.[q.optionSet]||[]};return heading+readingQuestionHTML(prepared,i,answers[i])}).join("")}</div><button class="button button-dark reading-submit" id="submit-reading">提交答案并批阅</button></section></div>`;
  document.getElementById("readingBack").onclick=()=>{localStorage.removeItem("ieltsStudio.activePassage");document.body.classList.remove("reading-page-open");renderSkillQuiz("reading")};
  root.querySelectorAll("input[name^='rq-']").forEach(el=>el.onchange=()=>{const index=el.name.slice(3);if(el.type==="checkbox"){const values=[...root.querySelectorAll('input[name="'+el.name+'"]:checked')].map(x=>x.value);saveReadingDraft(passage,index,values)}else saveReadingDraft(passage,index,el.value)});
  root.querySelectorAll("select[name^='rq-']").forEach(el=>el.onchange=()=>saveReadingDraft(passage,el.name.slice(3),el.value));
  root.querySelectorAll("[data-reading-answer]").forEach(el=>el.oninput=()=>saveReadingDraft(passage,el.dataset.readingAnswer,el.value));
  document.getElementById("submit-reading").onclick=()=>{
   const chosen=passage.questions.map((q,i)=>{const name="rq-"+i,checked=[...root.querySelectorAll('input[name="'+name+'"]:checked')].map(el=>el.value),select=root.querySelector('select[name="'+name+'"]'),radio=root.querySelector('input[name="'+name+'"]:checked'),multi=q.blanks?.map((_,j)=>root.querySelector('[data-reading-answer="'+i+'-'+j+'"]')?.value.trim()||""),input=root.querySelector('[data-reading-answer="'+i+'"]');return q.type==="multi_select"?checked:(multi||(select?.value||radio?.value||input?.value.trim()||""))});
   const marks=passage.questions.map((q,i)=>answerMatches(chosen[i],q));
   const correct=marks.reduce((sum,ok,i)=>sum+(ok?(passage.questions[i].marks||1):0),0);
   state.practiceResults=state.practiceResults||{};state.practiceResults["reading:"+passage.id]={submitted:true,correct,answers:chosen,marks};
   const totalMarks=passage.questions.reduce((n,q)=>n+(q.marks||1),0);
   state.sessions.push({id:uid(),skill:"Reading",name:passage.title,correct,total:totalMarks,note:"个人阅读题库自动批阅",date:todayISO(),percent:Math.round(correct/totalMarks*100)});
   state.mistakes=state.mistakes||[];
   passage.questions.forEach((q,i)=>{if(!marks[i])state.mistakes.push({id:uid(),skill:"Reading",category:q.typeLabel||q.type||"Reading",question:q.prompt,userAnswer:Array.isArray(chosen[i])?chosen[i].join(" / "):chosen[i],correctAnswer:Array.isArray(q.answers||q.answer)?(q.answers||q.answer).join(" / "):q.answer,source:passage.title,date:todayISO(),note:"来自阅读练习自动批阅"})});
   markActivity();save();renderSkillQuiz("reading");toast(`批阅完成：${correct}/${totalMarks}，${Math.round(correct/totalMarks*100)}%`);
  };
  return;
 }
 const bank=skillBanks[skill],prior=skillQuizState[skill];
 if(prior&&prior.submitted){root.innerHTML=`<div class="quiz-result"><div class="info-grid"><div><b>${prior.correct}/${bank.questions.length}</b><small>答对题数</small></div><div><b>${Math.round(prior.correct/bank.questions.length*100)}%</b><small>正确率</small></div><div><b>${prior.raw}/40</b><small>折算答对数</small></div></div><h3>答案解析</h3>${bank.questions.map((q,i)=>`<div class="question"><b>${i+1}. ${escapeHTML(q[0])}</b><p class="small">${prior.answers[i]===q[2]?'✓ 回答正确':'✕ 你的答案：'+escapeHTML(q[1][prior.answers[i]]||'未作答')+'；正确答案：'+escapeHTML(q[1][q[2]])}</p><p class="small muted">${escapeHTML(q[3])}</p></div>`).join('')}<button class="button button-dark" id="retry-${skill}">再做一次</button></div>`;document.getElementById('retry-'+skill).onclick=()=>{skillQuizState[skill]=null;state.practiceResults[skill]=null;state.practiceDrafts[skill]={};save();renderSkillQuiz(skill)};return;}
 const answers=prior?.answers||state.practiceDrafts?.[skill]||{};
 let html=`<div class="audio-box"><p>先听录音，建议不要边听边看文字稿。</p><button class="button button-light" id="playListening">▶ 播放 / 重播听力材料</button><span class="small muted">浏览器语音合成 · 可重复播放</span></div>`;
 html+=bank.questions.map((q,i)=>`<div class="question quiz-question"><b>${i+1}. ${escapeHTML(q[0])}</b>${q[1].map((o,j)=>`<label class="option"><input type="radio" name="${skill}-${i}" value="${j}" ${Number(answers[i])===j?'checked':''}><span>${String.fromCharCode(65+j)}. ${escapeHTML(o)}</span></label>`).join('')}</div>`).join('');
 html+=`<button class="button button-dark" id="submit-${skill}">提交答案并查看成绩</button>`;root.innerHTML=html;
 root.querySelectorAll('input[type=radio]').forEach(el=>el.addEventListener('change',()=>{const m=el.name.match(/-(\\d+)$/);if(!m)return;state.practiceDrafts[skill]=state.practiceDrafts[skill]||{};state.practiceDrafts[skill][m[1]]=Number(el.value);try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(e){}}));
 document.getElementById('playListening').onclick=()=>{if(!('speechSynthesis'in window)){toast('当前浏览器不支持语音播放');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(bank.script);u.lang='en-GB';u.rate=.88;speechSynthesis.speak(u)};
 document.getElementById('submit-'+skill).onclick=()=>{const chosen=bank.questions.map((q,i)=>{const el=document.querySelector(`input[name="${skill}-${i}"]:checked`);return el?Number(el.value):null});if(chosen.some(x=>x===null)){toast('还有题目没有作答，请完成全部题目');return}const correct=chosen.filter((a,i)=>a===bank.questions[i][2]).length;state.sessions.push({id:uid(),skill:'Listening',name:'IELTS Studio Listening Practice 01',correct,total:bank.questions.length,note:'自动判分练习',date:todayISO(),percent:Math.round(correct/bank.questions.length*100)});markActivity();skillQuizState[skill]={submitted:true,correct,answers:chosen,raw:correct*4};state.practiceResults[skill]=skillQuizState[skill];state.practiceDrafts[skill]={};save();renderSkillQuiz(skill);toast(`完成！答对 ${correct}/${bank.questions.length}`);};
}
function saveReadingDraft(passage,index,value){state.practiceDrafts=state.practiceDrafts||{};const key="reading:"+passage.id;state.practiceDrafts[key]=state.practiceDrafts[key]||{};const parts=String(index).split("-");if(parts.length===2){const qi=parts[0],bi=Number(parts[1]);state.practiceDrafts[key][qi]=state.practiceDrafts[key][qi]||[];state.practiceDrafts[key][qi][bi]=value}else{state.practiceDrafts[key][index]=value}try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch(e){}}
function assessmentMarkup(kind,labels){return `<div class="score-fields">${labels.map((x,i)=>`<label>${x}<select id="${kind}Band${i}">${Array.from({length:19},(_,j)=>j*.5).map(v=>`<option value="${v}" ${v===5?'selected':''}>${v.toFixed(1)}</option>`).join('')}</select></label>`).join('')}</div><label>练习名称<input id="${kind}Name" placeholder="例如：Task 2 — Education / Speaking Part 2"></label><button class="button button-dark" id="save${kind}Assessment">计算并保存自评分</button><div id="${kind}AssessmentResult"></div>`}
const writingRoot=document.getElementById('writingAssessment'); if(writingRoot)writingRoot.innerHTML=assessmentMarkup('Writing',['Task Response / Achievement','Coherence & Cohesion','Lexical Resource','Grammar Range & Accuracy']);
const speakingRoot=document.getElementById('speakingAssessment'); if(speakingRoot)speakingRoot.innerHTML=assessmentMarkup('Speaking',['Fluency & Coherence','Lexical Resource','Grammar Range & Accuracy','Pronunciation']);
function setupAssessment(kind){const btn=document.getElementById('save'+kind+'Assessment');if(!btn)return;btn.onclick=()=>{const vals=[0,1,2,3].map(i=>Number(document.getElementById(kind+'Band'+i).value));const avg=vals.reduce((a,b)=>a+b,0)/4;const band=Math.round(avg*2)/2;const name=document.getElementById(kind+'Name').value.trim()||(kind+' self-assessment');const record={id:uid(),skill:kind,date:todayISO(),name,correct:0,total:0,note:'Self-assessed band '+band.toFixed(1)+' · '+vals.map(v=>v.toFixed(1)).join('/'),band};state.sessions.push(record);markActivity();save();document.getElementById(kind+'AssessmentResult').innerHTML=`<div class="notice"><b>你的自评参考分：${band.toFixed(1)}</b><span>四项标准原始平均分：${avg.toFixed(2)}。该分数仅供练习追踪，不是官方评分或 AI 批改结果。</span></div>`;toast(kind+' 自评分已保存');}}
setupAssessment('Writing');setupAssessment('Speaking');
renderSkillQuiz('reading');renderSkillQuiz('listening');
// Persist unfinished essay drafts while typing; restore the latest unsaved text after refresh.
const essayTextEl=document.getElementById('essayText');
if(essayTextEl){const draft=JSON.parse(localStorage.getItem('ieltsStudio.pendingEssay')||'null');if(draft&&!essayTextEl.value){document.getElementById('essayType').value=draft.type||'Writing Task 2';document.getElementById('essayPrompt').value=draft.prompt||'';essayTextEl.value=draft.text||'';document.getElementById('wordCount').textContent=(draft.text||'').trim().split(/\s+/).filter(Boolean).length+' words';}essayTextEl.addEventListener('input',()=>{localStorage.setItem('ieltsStudio.pendingEssay',JSON.stringify({type:document.getElementById('essayType').value,prompt:document.getElementById('essayPrompt').value,text:essayTextEl.value}));});}


// ===== IELTS Studio: skill templates and built-in core vocabulary =====
const coreIELTSWords=[
["analyse","分析；细致研究","Researchers have analysed the effects of social media on young people.","analyse data · analyse the results","Education"],
["approach","方法；途径","A balanced approach to education can benefit all students.","a practical approach · adopt an approach","Education"],
["assess","评估；评价","It is important to assess students' progress regularly.","assess performance · assess the impact","Education"],
["attain","达到；获得","Many graduates find it difficult to attain their career goals.","attain a goal · attain a high level","Work"],
["beneficial","有益的","Regular exercise is beneficial to physical and mental health.","highly beneficial · beneficial effects","Health"],
["challenge","挑战；难题","Rising living costs present a serious challenge for families.","face a challenge · pose a challenge","Society"],
["contribute","促成；贡献","Public transport can contribute to a reduction in traffic congestion.","contribute to growth · make a contribution","Society"],
["crucial","至关重要的","Early childhood education plays a crucial role in development.","a crucial role · crucial factor","Education"],
["decline","下降；减少","The number of people using printed newspapers has declined.","a sharp decline · decline in numbers","Technology"],
["demonstrate","表明；证明；展示","The findings demonstrate a clear link between sleep and concentration.","clearly demonstrate · demonstrate that","Education"],
["diverse","多样的","Large cities often have diverse communities and cultures.","a diverse range · culturally diverse","Culture"],
["efficient","高效的","An efficient public transport system can reduce commuting time.","highly efficient · energy-efficient","Technology"],
["emerge","出现；显现","New forms of online communication continue to emerge.","emerge as · emerging trend","Technology"],
["enable","使能够","Digital tools enable students to access learning materials remotely.","enable someone to do · enable access","Education"],
["establish","建立；确立","The study aims to establish whether the policy has been effective.","establish a relationship · establish a system","Society"],
["evidence","证据；依据","There is growing evidence that green spaces improve wellbeing.","strong evidence · evidence suggests that","Education"],
["expenditure","支出；开支","Public expenditure on healthcare has increased in recent years.","government expenditure · household expenditure","Economy"],
["factor","因素","Cost is an important factor when people choose where to live.","key factor · contributing factor","Society"],
["fluctuate","波动","House prices tend to fluctuate depending on market conditions.","fluctuate significantly · fluctuate between","Economy"],
["impact","影响","Technology has had a profound impact on the way people work.","have an impact on · negative impact","Technology"],
["implement","实施；执行","Local authorities need to implement effective recycling policies.","implement a policy · implement changes","Environment"],
["increasingly","越来越；日益","People are increasingly concerned about air quality.","increasingly important · increasingly popular","Society"],
["indicate","表明；显示","The results indicate that online learning can be effective.","indicate a trend · figures indicate that","Education"],
["inequality","不平等","Access to quality education can help reduce social inequality.","income inequality · reduce inequality","Society"],
["innovative","创新的","Innovative solutions are needed to address urban problems.","innovative approach · innovative technology","Technology"],
["maintain","维持；保持","It can be difficult to maintain a healthy work-life balance.","maintain standards · maintain a balance","Work"],
["majority","大多数","The majority of participants preferred flexible working hours.","the vast majority · majority of people","Society"],
["mitigate","减轻；缓解","Planting trees can help mitigate the effects of urban heat.","mitigate the risk · mitigate the impact","Environment"],
["obtain","获得；取得","Students can obtain reliable information from academic sources.","obtain information · obtain permission","Education"],
["participate","参与","Young people should be encouraged to participate in community activities.","participate in a discussion · active participation","Society"],
["perceive","看待；认为","People may perceive the same issue in different ways.","be perceived as · perceive something as","Culture"],
["priority","优先事项","Improving public healthcare should be a national priority.","top priority · give priority to","Health"],
["reliable","可靠的","It is essential to use reliable sources when conducting research.","reliable information · reliable evidence","Education"],
["significant","显著的；重要的","There has been a significant increase in renewable energy use.","significant change · significant difference","Environment"],
["strategy","策略；方法","A clear strategy is needed to improve students' writing skills.","effective strategy · long-term strategy","Education"],
["sustainable","可持续的","Cities need to develop more sustainable transport systems.","sustainable development · sustainable energy","Environment"],
["tend","往往；倾向于","People tend to spend more time online than in the past.","tend to do · tend to be","Society"],
["transform","彻底改变","The internet has transformed the way people access information.","transform the way · be transformed by","Technology"],
["vary","变化；不同","The quality of public services can vary between regions.","vary considerably · vary from ... to ...","Society"],
["widespread","广泛的","Smartphone use has become widespread across different age groups.","widespread use · widespread concern","Technology"],
["consequence","结果；后果","One possible consequence of longer working hours is increased stress.","as a consequence · serious consequences","Work"],
["consume","消费；消耗","Modern households consume large amounts of energy.","consume resources · consumer behaviour","Environment"],
["regulate","监管；调节","Governments need to regulate online platforms more effectively.","regulate an industry · government regulation","Technology"],
["urbanisation","城市化","Rapid urbanisation can place pressure on housing and infrastructure.","rapid urbanisation · urban development","Environment"],
["wellbeing","幸福感；身心健康","Flexible working arrangements may improve employees' wellbeing.","mental wellbeing · overall wellbeing","Health"],
["conventional","传统的；常规的","Some students prefer conventional classroom teaching.","conventional methods · conventional approach","Education"],
["withdraw","撤回；退出","Some participants decided to withdraw from the research project.","withdraw from a course · withdraw support","Education"],
["therefore","因此","Housing is expensive; therefore, many people live farther from work.","therefore, it is important · and therefore","Writing"]
];
if(!state.vocabSeedVersion){
 const existing=new Set((state.words||[]).map(w=>String(w.word||"").toLowerCase()));
 coreIELTSWords.forEach(x=>{if(!existing.has(x[0].toLowerCase()))state.words.push({id:uid(),word:x[0],meaning:x[1],example:x[2],collocation:x[3],topic:x[4],created:todayISO(),due:todayISO(),interval:0,mastered:false,source:"IELTS Studio core vocabulary"})});
 state.vocabSeedVersion=1;try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch(e){}
}
const listeningSection=document.getElementById("view-listening");
if(listeningSection&&!document.getElementById("listeningRoadmap")){
 listeningSection.querySelector(".page-heading").insertAdjacentHTML("afterend","<div class='skill-roadmap listening-roadmap' id='listeningRoadmap'><div class='roadmap-heading'><div><p class='eyebrow'>LISTENING TEST STRUCTURE</p><h2>四个 Section，逐步练习</h2><p>后续按真实题目逐段替换录音、题型和答案；当前示例只用于测试页面流程。</p></div><span class='roadmap-count'>4 sections</span></div><div class='roadmap-steps'><article><b>01</b><strong>Everyday conversation</strong><small>日常对话 · 表格/信息填空</small></article><article><b>02</b><strong>Everyday monologue</strong><small>生活场景独白 · 选择/匹配</small></article><article><b>03</b><strong>Academic discussion</strong><small>学术讨论 · 多人交流</small></article><article><b>04</b><strong>Academic lecture</strong><small>学术讲座 · 笔记/摘要填空</small></article></div><p class='roadmap-note'>录音区、题目区、答案解析和练习记录已经预留。正式音频与题目后续接入。</p></div>");
}
const writingSection=document.getElementById("view-writing");
if(writingSection&&!document.getElementById("writingTemplateHub")){
 writingSection.querySelector(".page-heading").insertAdjacentHTML("afterend","<div class='skill-roadmap writing-template-hub' id='writingTemplateHub'><div class='roadmap-heading'><div><p class='eyebrow'>WRITING PRACTICE TEMPLATES</p><h2>选择任务，开始写作</h2><p>先把 Task 1 / Task 2 的题型和练习流程搭好；下面是原创示例题，后续可直接替换成你的正式题目。</p></div><span class='roadmap-count'>Task 1 + Task 2</span></div><div class='writing-template-grid'><article class='writing-template-card'><span class='template-tag'>TASK 1 · ACADEMIC</span><h3>Charts, graphs & tables</h3><p>描述数据、比较趋势、概括主要特征。</p><button class='button button-light' data-writing-preset='academic'>载入示例题目</button></article><article class='writing-template-card'><span class='template-tag'>TASK 1 · GENERAL</span><h3>Letter writing</h3><p>根据情境写正式、半正式或非正式信件。</p><button class='button button-light' data-writing-preset='general'>载入示例题目</button></article><article class='writing-template-card'><span class='template-tag'>TASK 2</span><h3>Essay writing</h3><p>观点讨论、利弊分析、问题解决和双边讨论。</p><button class='button button-light' data-writing-preset='task2'>载入示例题目</button></article></div><div class='writing-tools-row'><div><b>写作计时器</b><small>Task 1 建议 20 分钟 · Task 2 建议 40 分钟</small></div><strong id='writingTimerDisplay'>40:00</strong><button class='button button-dark' id='writingTimerStart'>开始</button><button class='button button-light' id='writingTimerReset'>重置</button></div><p class='template-footnote'>草稿保存在当前浏览器；自评仅用于学习追踪，不等于官方评分或 AI 批改。</p></div>");
}
const writingPresets={
 academic:{type:"Writing Task 1 — Academic",prompt:"The chart below shows the percentage of people using different forms of transport to commute to work in a city between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant."},
 general:{type:"Writing Task 1 — General Training",prompt:"You recently moved to a new neighbourhood and would like to join a local sports centre. Write a letter to the manager. In your letter, explain why you are writing, describe the facilities you are interested in, and ask about membership options."},
 task2:{type:"Writing Task 2",prompt:"Some people believe that governments should spend more money on public transport, while others think that building more roads is a better solution to traffic congestion. Discuss both views and give your own opinion."}
};
document.querySelectorAll("[data-writing-preset]").forEach(btn=>btn.addEventListener("click",()=>{
 const p=writingPresets[btn.dataset.writingPreset];document.getElementById("essayType").value=p.type;document.getElementById("essayPrompt").value=p.prompt;document.getElementById("essayText").focus();toast("示例题目已载入，可以开始写作");
}));
let writingTimerSeconds=2400,writingTimerInterval=null;
function updateWritingTimer(){const el=document.getElementById("writingTimerDisplay");if(el)el.textContent=String(Math.floor(writingTimerSeconds/60)).padStart(2,"0")+":"+String(writingTimerSeconds%60).padStart(2,"0")}
document.getElementById("writingTimerStart")?.addEventListener("click",()=>{
 const btn=document.getElementById("writingTimerStart");
 if(writingTimerInterval){clearInterval(writingTimerInterval);writingTimerInterval=null;btn.textContent="继续";return}
 btn.textContent="暂停";writingTimerInterval=setInterval(()=>{writingTimerSeconds--;updateWritingTimer();if(writingTimerSeconds<=0){clearInterval(writingTimerInterval);writingTimerInterval=null;btn.textContent="开始";toast("写作时间结束")}},1000);
});
document.getElementById("writingTimerReset")?.addEventListener("click",()=>{
 clearInterval(writingTimerInterval);writingTimerInterval=null;writingTimerSeconds=document.getElementById("essayType").value.includes("Task 1")?1200:2400;updateWritingTimer();document.getElementById("writingTimerStart").textContent="开始";
});
document.getElementById("essayType")?.addEventListener("change",()=>{writingTimerSeconds=document.getElementById("essayType").value.includes("Task 1")?1200:2400;updateWritingTimer()});
const speakingLibrary={
 1:[
 ["Work or study",["Do you work or are you a student?","What subject are you studying?","Why did you choose that subject?","What do you find most interesting about your studies?","What would you like to do after you finish your studies?"]],
 ["Hometown",["Where is your hometown?","What do you like most about your hometown?","Has your hometown changed much in recent years?","Is there anything you dislike about your hometown?","Would you like to live there in the future?"]],
 ["Home and accommodation",["Do you live in a house or an apartment?","Who do you live with?","Which room do you like most in your home?","What would you like to change about your home?","Would you like to move to a different home in the future?"]],
 ["Daily routine",["What is your daily routine like?","Which part of the day do you enjoy most?","Do you usually have the same routine every day?","Has your daily routine changed recently?","Would you like to change anything about your routine?"]],
 ["Reading",["Do you enjoy reading?","What kind of books do you like to read?","Did you read more when you were younger?","Do you prefer printed books or e-books?","Do you often visit libraries or bookshops?"]],
 ["Music",["What kind of music do you usually listen to?","When do you usually listen to music?","Did you learn to play a musical instrument as a child?","Have your music preferences changed over time?","Would you like to learn a musical instrument?"]],
 ["Friends",["Do you prefer spending time with one friend or a group of friends?","How often do you meet your friends?","What do you usually do with your friends?","Do you prefer making friends online or in person?","Have your friendships changed since childhood?"]],
 ["Food",["What kind of food do you like?","Do you prefer eating at home or eating out?","Can you cook?","What food did you enjoy when you were a child?","Is there any food you dislike?"]],
 ["Weather",["What kind of weather do you like most?","What is the weather usually like in your hometown?","Does the weather affect your mood?","What do you usually do on rainy days?","Do you prefer hot or cold weather?"]],
 ["Transport",["How do you usually travel around your city?","What is the most popular means of transport in your hometown?","Do you often use public transport?","How could transport in your area be improved?","Do you prefer travelling by car or public transport?"]],
 ["Technology",["What piece of technology do you use most every day?","When did you first start using a computer?","Do you think you use your phone too much?","Is there any technology you would like to buy?","How has technology changed your daily life?"]],
 ["Photography",["Do you like taking photographs?","What do you usually take photos of?","Do you prefer taking photos with a phone or a camera?","Do you often look at old photographs?","Would you like to learn more about photography?"]],
 ["Weekends",["What do you usually do at weekends?","Do you prefer relaxing or going out at weekends?","Did you do the same things at weekends when you were a child?","Do you make plans for your weekends?","Would you like to have more free time at weekends?"]],
 ["Learning",["Do you prefer learning alone or with other people?","What do you find difficult about learning?","How do you usually remember new information?","Did you enjoy learning new things as a child?","What would you like to learn in the future?"]],
 ["Public places",["Is there a public place near your home that you often visit?","Do you prefer parks or shopping centres?","What do people usually do in public places in your city?","Have public places in your area changed recently?","What public facilities would you like your city to have?"]]
 ],
 2:[
 ["A skill you would like to learn",["Describe a skill you would like to learn.","What the skill is","Why you want to learn it","How you would learn it","And explain how this skill might be useful in the future"]],
 ["A memorable journey",["Describe a journey that you remember well.","Where you went","Who you went with","What happened during the journey","And explain why you remember it"]],
 ["A person who inspired you",["Describe a person who has inspired you.","Who this person is","How you know them","What they have done","And explain why they inspired you"]],
 ["A useful website",["Describe a website you often use.","What the website is","How you found it","What you use it for","And explain why you find it useful"]],
 ["A memorable event",["Describe an event that you attended and enjoyed.","What the event was","Where it took place","Who you went with","And explain why you enjoyed it"]],
 ["A place you would like to visit",["Describe a place you would like to visit in the future.","Where it is","What you know about it","Who you would go with","And explain why you want to visit it"]],
 ["A book or story",["Describe a book or story that you enjoyed.","What it is about","When you read it","Who recommended it to you","And explain why you liked it"]],
 ["A time you helped someone",["Describe a time when you helped another person.","Who you helped","What the problem was","What you did","And explain how you felt about helping them"]],
 ["An important decision",["Describe an important decision you made.","What the decision was","When you made it","What the result was","And explain why it was important"]],
 ["A creative person",["Describe someone you know who is creative.","Who the person is","What they create","How you know about their work","And explain why you think they are creative"]]
 ],
 3:[
 ["Technology and communication",["How has technology changed the way people communicate?","Do you think online communication can replace face-to-face conversations?","What are the disadvantages of relying too much on digital communication?","Do different generations use communication technology differently?"]],
 ["Education and work",["Should universities focus more on practical skills or academic knowledge?","What skills are most important for young people entering the workplace?","Should employers provide more training for their staff?","How might the relationship between education and work change in the future?"]],
 ["Cities and public spaces",["Why are public spaces important in modern cities?","How can governments encourage people to use public spaces?","Should cities spend more money on parks or shopping facilities?","How can public spaces bring different communities together?"]],
 ["Work-life balance",["Why do some people find it difficult to maintain a good work-life balance?","What can employers do to help their staff?","Do you think people work longer hours now than in the past?","How important is free time for a person's wellbeing?"]],
 ["Advertising and consumer behaviour",["How does advertising influence people's decisions?","Should advertising aimed at children be restricted?","Why do some people buy things they do not really need?","How has online shopping changed the way companies advertise?"]],
 ["Online learning",["Can online learning replace traditional classroom education?","What are the main advantages and disadvantages of studying online?","Do students learn better independently or in a classroom?","How might technology change education in the future?"]],
 ["Tourism",["How can tourism benefit local communities?","What problems can mass tourism create?","Should governments limit the number of tourists visiting popular places?","How can tourists behave more responsibly?"]],
 ["Social relationships",["Has modern technology made friendships stronger or weaker?","Why do some people find it difficult to make new friends?","Are friendships at work different from friendships outside work?","How important are social relationships for older people?"]],
 ["The environment",["Who should take more responsibility for protecting the environment: individuals or governments?","Why do some people find it difficult to live in an environmentally friendly way?","Should companies be punished for causing pollution?","How can schools encourage children to protect the environment?"]],
 ["Culture and tradition",["Why is it important to preserve traditional culture?","Can traditions change over time?","How does globalisation affect local cultures?","Should young people be encouraged to learn traditional skills?"]],
 ["Public transport",["How can governments persuade more people to use public transport?","What are the main problems with public transport in large cities?","Should public transport be free?","How might transport systems change in the future?"]],
 ["Children and creativity",["Why is creativity important for children?","How can schools encourage children to be creative?","Do you think children today have enough time for creative activities?","Is it better for children to learn arts at school or at home?"]]
 ]
};
let activeSpeakingPart=1,speakingTemplateSeconds=30,speakingTemplateInterval=null;
function renderSpeakingLibrary(){
 const items=speakingLibrary[activeSpeakingPart];
 document.getElementById("speakingLibraryTitle").textContent="Part "+activeSpeakingPart+" · 题目列表";
 document.getElementById("speakingPromptCount").textContent=items.length+" 个话题";
 document.getElementById("speakingPromptLibrary").innerHTML=items.map((p,i)=>{
  const preview=activeSpeakingPart===2?p[1].slice(1,4).join(" · "):p[1].slice(0,2).join(" · ");
  const count=activeSpeakingPart===2?"Cue Card":p[1].length+" 道问题";
  return "<button class='speaking-prompt-item' data-speaking-prompt='"+i+"'><span>"+String(i+1).padStart(2,"0")+" · "+count+"</span><b>"+escapeHTML(p[0])+"</b><small>"+escapeHTML(preview)+"</small><em>打开练习 →</em></button>";
 }).join("");
 document.querySelectorAll("[data-speaking-prompt]").forEach(btn=>btn.onclick=()=>{
  activeSpeakingPrompt=Number(btn.dataset.speakingPrompt);
  renderSpeakingAnswerEditor();
  document.getElementById("speakingTemplateHub").hidden=true;
  document.getElementById("speakingAnswerPage").hidden=false;
  window.scrollTo({top:0,behavior:"smooth"});
 });
}
let activeSpeakingPrompt=0;
document.querySelectorAll("[data-speaking-part]").forEach(btn=>btn.addEventListener("click",()=>{
 activeSpeakingPart=Number(btn.dataset.speakingPart);activeSpeakingPrompt=0;
 document.getElementById("speakingTemplateHub").hidden=false;document.getElementById("speakingAnswerPage").hidden=true;
 document.querySelectorAll(".speaking-part-card").forEach(x=>x.classList.toggle("active",x===btn));
 renderSpeakingLibrary();renderSpeakingAnswerEditor();
}));
function renderSpeakingAnswerEditor(){
 const area=document.getElementById("speakingAnswerText");if(!area)return;
 const items=speakingLibrary[activeSpeakingPart],p=items[activeSpeakingPrompt]||items[0];
 const key="part"+activeSpeakingPart+"_q"+activeSpeakingPrompt;
 const saved=state.speakingDrafts[key]??(activeSpeakingPrompt===0?(state.speakingDrafts["part"+activeSpeakingPart]||""):"");
 area.value=saved;
 document.getElementById("speakingAnswerTitle").textContent="Part "+activeSpeakingPart+" · 我的笔记";
 document.getElementById("speakingSelectedTitle").textContent=p[0];
 document.getElementById("speakingSelectedPrompt").textContent=(activeSpeakingPart===2?p[1][0]+"\\n\\nYou should say:\\n"+p[1].slice(1).map(x=>"• "+x).join("\\n"):p[1].map((q,i)=>(i+1)+". "+q).join("\\n"));
 document.getElementById("speakingAnswerStatus").textContent=saved?"已载入这道题上次保存的答案":"这道题还没有答案";
}
document.getElementById("backToSpeakingQuestions")?.addEventListener("click",()=>{document.getElementById("speakingAnswerPage").hidden=true;document.getElementById("speakingTemplateHub").hidden=false;window.scrollTo({top:0,behavior:"smooth"})});
document.getElementById("speakingAnswerText")?.addEventListener("input",e=>{
 state.speakingDrafts["part"+activeSpeakingPart+"_q"+activeSpeakingPrompt]=e.target.value;
 try{localStorage.setItem(STORE_KEY,JSON.stringify(state));document.getElementById("speakingAnswerStatus").textContent="已自动保存 · "+new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"})}catch(err){document.getElementById("speakingAnswerStatus").textContent="自动保存失败，请点击保存按钮"}
});
document.getElementById("saveSpeakingAnswer")?.addEventListener("click",()=>{
 const area=document.getElementById("speakingAnswerText");state.speakingDrafts["part"+activeSpeakingPart+"_q"+activeSpeakingPrompt]=area.value;
 try{localStorage.setItem(STORE_KEY,JSON.stringify(state));toast("Part "+activeSpeakingPart+" 的笔记已保存")}catch(e){toast("保存失败，请导出学习数据")}
});
renderSpeakingLibrary();renderSpeakingAnswerEditor();updateWritingTimer();

renderAll();renderDashboardDiagnostic();
