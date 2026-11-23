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
const speakingPrompts=[["Part 1 · Work or study","Do you work or are you a student?"],["Part 1 · Hometown","What do you like most about your hometown?"],["Part 1 · Daily routine","Which part of your day do you enjoy most?"],["Part 2 · Describe a skill","Describe a skill you would like to learn. You should say what it is, why you want to learn it and how you would learn it."],["Part 2 · A memorable journey","Describe a journey that you remember well. You should say where you went, who you went with and why it was memorable."],["Part 3 · Technology","How has technology changed the way people communicate?"],["Part 3 · Education","Should universities focus more on practical skills or academic knowledge?"]];
document.getElementById("newPrompt").onclick=()=>{const p=speakingPrompts[Math.floor(Math.random()*speakingPrompts.length)];document.getElementById("speakingPart").textContent=p[0];document.getElementById("speakingPrompt").textContent=p[1]};
document.getElementById("saveSpeaking").onclick=()=>{const topic=document.getElementById("speakingTopic").value.trim(),reflection=document.getElementById("speakingReflection").value.trim();if(!topic&&!reflection){toast("Add a topic or reflection first");return}state.speaking.push({id:uid(),part:document.getElementById("speakingPartSelect").value,topic,reflection,date:todayISO()});markActivity();save();toast("Speaking practice saved")};
function renderSpeaking(){const arr=[...state.speaking].reverse();document.getElementById("speakingHistory").innerHTML=arr.length?`<table><thead><tr><th>DATE</th><th>PART</th><th>TOPIC</th><th>REFLECTION</th></tr></thead><tbody>${arr.map(x=>`<tr><td>${x.date}</td><td>${escapeHTML(x.part)}</td><td>${escapeHTML(x.topic)}</td><td>${escapeHTML(x.reflection).slice(0,100)||"—"}</td></tr>`).join("")}</tbody></table>`:'<div class="empty-table">No speaking sessions yet.</div>'}
let timerSeconds=60,timerInterval=null;
function updateTimer(){document.getElementById("timerDisplay").textContent=`${String(Math.floor(timerSeconds/60)).padStart(2,"0")}:${String(timerSeconds%60).padStart(2,"0")}`}
document.getElementById("timerStart").onclick=()=>{if(timerInterval){clearInterval(timerInterval);timerInterval=null;document.getElementById("timerStart").textContent="Resume";return}document.getElementById("timerStart").textContent="Pause";timerInterval=setInterval(()=>{timerSeconds--;updateTimer();if(timerSeconds<=0){clearInterval(timerInterval);timerInterval=null;document.getElementById("timerStart").textContent="Start";toast("Speaking timer finished")}},1000)};
document.getElementById("timerReset").onclick=()=>{clearInterval(timerInterval);timerInterval=null;timerSeconds=60;updateTimer();document.getElementById("timerStart").textContent="Start"};
function renderWords(){
 const q=(document.getElementById("wordSearch").value||"").toLowerCase(),arr=state.words.filter(w=>(w.word+" "+w.meaning+" "+w.topic).toLowerCase().includes(q));
 document.getElementById("vocabTotal").textContent=state.words.length;document.getElementById("vocabDue").textContent=state.words.filter(w=>!w.mastered&&(!w.due||w.due<=todayISO())).length;document.getElementById("vocabMastered").textContent=state.words.filter(w=>w.mastered).length;document.getElementById("dashWords").textContent=state.words.length;
 document.getElementById("wordTable").innerHTML=arr.length?`<table><thead><tr><th>WORD</th><th>MEANING</th><th>TOPIC</th><th>REVIEW</th><th></th></tr></thead><tbody>${arr.map(w=>`<tr><td><b>${escapeHTML(w.word)}</b><br><small>${escapeHTML(w.example||"")}</small></td><td>${escapeHTML(w.meaning)}</td><td>${escapeHTML(w.topic)}</td><td>${w.mastered?"Mastered":w.due||"Due now"}</td><td><button class="text-button" data-delete-word="${w.id}">Delete</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty-table">No matching words.</div>';
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
function getReadingBank(){try{return JSON.parse(localStorage.getItem("ieltsStudio.readingBank")||"null")}catch(e){return null}}
function normAnswer(v){return String(v??"").trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?;:]/g,"").replace(/\s+/g," ")}
function answerMatches(user, q){
 if(Array.isArray(q.answers)||Array.isArray(q.answer)){
  const expected=q.answers||q.answer;
  const actual=Array.isArray(user)?user:[user];
  return expected.length===actual.length&&expected.every((v,i)=>[v,...((q.acceptable||[])[i]||[])].map(normAnswer).includes(normAnswer(actual[i])));
 }
 const accepted=[q.answer,...(q.acceptable||[])].filter(x=>x!==undefined&&x!==null).map(normAnswer);
 return accepted.includes(normAnswer(user));
}
function readingQuestionHTML(q,i,answer){
 const id="rq-"+i, type=q.type||"short";
 const label=q.number||i+1;
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
  if(!bank||!Array.isArray(bank.passages)||!bank.passages.length){
   document.body.classList.remove("reading-page-open");
   root.innerHTML=`<div class="reading-empty"><div class="reading-empty-icon">▤</div><h2>导入你的 PDF 阅读题库</h2><p>阅读练习会采用左侧文章、右侧题目的双栏布局。题库文件只保存在当前浏览器，不会上传到公开 GitHub。</p><label class="button button-dark import-reading-label" for="readingBankFile">选择阅读题库 JSON</label><input id="readingBankFile" type="file" accept="application/json,.json" hidden><small>题库需包含 passages 数组；支持选择、判断、填空、匹配等题型。</small></div>`;
   const picker=document.getElementById("readingBankFile");
   picker.onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data.passages)||!data.passages.length)throw new Error("Invalid format");localStorage.setItem("ieltsStudio.readingBank",JSON.stringify(data));state.practiceResults.reading=null;skillQuizState.reading=null;renderSkillQuiz("reading");toast("阅读题库已导入到本浏览器")}catch(err){toast("导入失败：请检查题库 JSON 格式")}e.target.value=""};
   return;
  }
  const passageIndex=Number(localStorage.getItem("ieltsStudio.activePassage")||0);
  const passage=bank.passages[Math.min(Math.max(0,passageIndex),bank.passages.length-1)];
  const result=state.practiceResults?.["reading:"+passage.id];
  if(result?.submitted){
   document.body.classList.add("reading-page-open");
   const total=passage.questions.length, pct=Math.round(result.correct/total*100);
   root.innerHTML=`<div class="reading-result"><div class="reading-result-top"><div><p class="eyebrow">MARKING COMPLETE</p><h2>${escapeHTML(passage.title)}</h2><p class="muted">已完成批阅，逐题核对你的答案。</p></div><div class="reading-score"><strong>${result.correct}/${total}</strong><span>${pct}% 正确率</span></div></div><div class="reading-review-list">${passage.questions.map((q,i)=>{const ok=result.marks[i],u=result.answers[i]??"";return `<article class="reading-review-item ${ok?"is-correct":"is-wrong"}"><div class="review-status">${ok?"✓ 正确":"✕ 错误"}</div><b>${escapeHTML((q.number||i+1)+". "+q.prompt)}</b><p>你的答案：${escapeHTML(Array.isArray(u)?u.join(" / "):(u||"未作答"))}　·　正确答案：${escapeHTML(Array.isArray(q.answers||q.answer)?(q.answers||q.answer).join(" / "):(q.answer??""))}</p>${q.explanation?`<small>${escapeHTML(q.explanation)}</small>`:""}</article>`}).join("")}</div><button class="button button-dark" id="readingRetry">重新练习</button><button class="button button-light" id="readingBackList">返回文章列表</button></div>`;
   document.getElementById("readingRetry").onclick=()=>{delete state.practiceResults["reading:"+passage.id];save();renderSkillQuiz("reading")};
   document.getElementById("readingBackList").onclick=()=>{localStorage.removeItem("ieltsStudio.activePassage");document.body.classList.remove("reading-page-open");renderSkillQuiz("reading")};
   return;
  }
  if(!localStorage.getItem("ieltsStudio.activePassage")){
   document.body.classList.remove("reading-page-open");
   root.innerHTML=`<div class="reading-library-head"><div><p class="eyebrow">YOUR READING LIBRARY</p><h2>阅读题库</h2><p class="muted">共 ${bank.passages.length} 篇文章 · 选择一篇开始练习</p></div><button class="button button-light" id="replaceReadingBank">更换题库</button></div><div class="reading-library-grid">${bank.passages.map((p,i)=>`<button class="reading-library-card" data-passage="${i}"><span>PASSAGE ${String(i+1).padStart(2,"0")}</span><b>${escapeHTML(p.title)}</b><small>${p.questions.length} 道题 · ${escapeHTML(p.group||"Reading practice")}</small><em>开始练习 →</em></button>`).join("")}</div>`;
   root.querySelectorAll("[data-passage]").forEach(b=>b.onclick=()=>{localStorage.setItem("ieltsStudio.activePassage",b.dataset.passage);renderSkillQuiz("reading")});
   document.getElementById("replaceReadingBank").onclick=()=>{localStorage.removeItem("ieltsStudio.readingBank");renderSkillQuiz("reading")};
   return;
  }
  const answers=state.practiceDrafts?.["reading:"+passage.id]||{};
  document.body.classList.add("reading-page-open");
  root.innerHTML=`<div class="reading-practice-toolbar"><button class="text-button" id="readingBack">← 返回文章列表</button><span>${escapeHTML(passage.title)}</span><span>${passage.questions.length} 题</span></div><div class="reading-split"><article class="reading-article-pane"><div class="reading-pane-title"><p class="eyebrow">READING PASSAGE</p><h2>${escapeHTML(passage.title)}</h2></div><div class="reading-article-text">${escapeHTML(passage.text).replace(/\\n/g,"<br><br>")}</div></article><section class="reading-questions-pane"><div class="reading-pane-title"><p class="eyebrow">QUESTIONS</p><h2>答题区</h2><p class="muted">按题目要求选择或填写答案，完成后统一提交批阅。</p></div><div class="reading-question-list">${passage.questions.map((q,i)=>readingQuestionHTML(q,i,answers[i])).join("")}</div><button class="button button-dark reading-submit" id="submit-reading">提交答案并批阅</button></section></div>`;
  document.getElementById("readingBack").onclick=()=>{localStorage.removeItem("ieltsStudio.activePassage");document.body.classList.remove("reading-page-open");renderSkillQuiz("reading")};
  root.querySelectorAll("input[name^='rq-']").forEach(el=>el.onchange=()=>saveReadingDraft(passage,el.name.slice(3),el.value));
  root.querySelectorAll("[data-reading-answer]").forEach(el=>el.oninput=()=>saveReadingDraft(passage,el.dataset.readingAnswer,el.value));
  document.getElementById("submit-reading").onclick=()=>{
   const chosen=passage.questions.map((q,i)=>{const radio=root.querySelector(`input[name="rq-${i}"]:checked`),multi=q.blanks?.map((_,j)=>root.querySelector(`[data-reading-answer="${i}-${j}"]`)?.value.trim()||""),input=root.querySelector(`[data-reading-answer="${i}"]`);return radio?radio.value:(multi||input?.value.trim()||"")});
   const marks=passage.questions.map((q,i)=>answerMatches(chosen[i],q));
   const correct=marks.filter(Boolean).length;
   state.practiceResults=state.practiceResults||{};state.practiceResults["reading:"+passage.id]={submitted:true,correct,answers:chosen,marks};
   state.sessions.push({id:uid(),skill:"Reading",name:passage.title,correct,total:passage.questions.length,note:"PDF 阅读题库自动批阅",date:todayISO(),percent:Math.round(correct/passage.questions.length*100)});
   state.mistakes=state.mistakes||[];
   passage.questions.forEach((q,i)=>{if(!marks[i])state.mistakes.push({id:uid(),skill:"Reading",category:q.typeLabel||q.type||"Reading",question:q.prompt,userAnswer:Array.isArray(chosen[i])?chosen[i].join(" / "):chosen[i],correctAnswer:Array.isArray(q.answers||q.answer)?(q.answers||q.answer).join(" / "):q.answer,source:passage.title,date:todayISO(),note:"来自阅读练习自动批阅"})});
   markActivity();save();renderSkillQuiz("reading");toast(`批阅完成：${correct}/${passage.questions.length}，${Math.round(correct/passage.questions.length*100)}%`);
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

renderAll();renderDashboardDiagnostic();
