/* Reading question bank prototype. Uses the existing local Reading passage and marking data. */
(function(){
 const moduleData={
  id:"reading-urban-green-spaces",
  title:"Urban Green Spaces 城市绿地",
  test:"Practice Set 01",
  passageNo:"Passage 1",
  difficulty:"2.5",
  frequency:"高频",
  type:"Multiple Choice",
  source:"原创 IELTS 风格练习",
  passage:skillBanks.reading.passage,
  questions:skillBanks.reading.questions
 };
 function progress(){state.practiceResults=state.practiceResults||{};state.practiceResults.readingModules=state.practiceResults.readingModules||{};return state.practiceResults.readingModules;}
 function el(tag,cls,html){const n=document.createElement(tag);if(cls)n.className=cls;if(html!==undefined)n.innerHTML=html;return n;}
 function render(){
  const root=document.getElementById("readingQuiz");if(!root)return;
  const q=(document.getElementById("readingSearch")?.value||"").toLowerCase();
  const level=document.getElementById("readingLevel")?.value||"全部";
  const sort=document.getElementById("readingSort")?.value||"default";
  const done=!!progress()[moduleData.id]?.submitted;
  const matches=(moduleData.title+" "+moduleData.passageNo+" "+moduleData.type).toLowerCase().includes(q)&&(level==="全部"||level===moduleData.frequency);
  root.innerHTML="";
  const head=el("div","reading-library-head");
  head.innerHTML='<div><p class="eyebrow">READING QUESTION BANK</p><h2>阅读题库浏览</h2><p class="muted small">选择一个 Passage 独立练习。完成后自动判分，并记录进度与错题。</p></div><div class="reading-library-progress"><b>'+(done?"1":"0")+' / 1</b><span>已完成模块</span></div>';
  root.appendChild(head);
  const filters=el("div","reading-filter-row");
  filters.innerHTML='<input id="readingSearch" class="reading-search" placeholder="搜索题目…" value="'+q.replace(/"/g,"&quot;")+'"><select id="readingLevel"><option>全部</option><option>高频</option><option>中频</option><option>低频</option></select><select id="readingSort"><option value="default">默认排序</option><option value="title">按名称排序</option></select>';
  root.appendChild(filters);
  filters.querySelector("#readingLevel").value=level;filters.querySelector("#readingSort").value=sort;
  filters.querySelector("#readingSearch").addEventListener("input",render);
  filters.querySelector("#readingLevel").addEventListener("change",render);
  filters.querySelector("#readingSort").addEventListener("change",render);
  const grid=el("div","reading-bank-grid");root.appendChild(grid);
  if(matches){
   const card=el("article","reading-bank-card");
   card.innerHTML='<div class="reading-card-top"><span class="reading-card-icon">▤</span><span class="reading-status '+(done?"is-done":"")+'">'+(done?"已完成":"待练习")+'</span></div><h3>'+moduleData.title+'</h3><div class="reading-meta">'+moduleData.test+'　|　'+moduleData.passageNo+'　|　Reading　|　'+moduleData.frequency+'　|　难度 '+moduleData.difficulty+'</div><p class="reading-card-detail">'+moduleData.questions.length+' 道题 · '+moduleData.type+' · '+moduleData.source+'</p><div class="reading-card-actions"><button class="button button-dark" id="startReading">开始练习</button><button class="button button-light" id="previewReading">文章预览</button></div>';
   grid.appendChild(card);
   card.querySelector("#startReading").onclick=start;
   card.querySelector("#previewReading").onclick=preview;
  }else grid.innerHTML='<div class="empty-table">没有找到符合条件的阅读模块。</div>';
 }
 function workspace(){return document.getElementById("readingWorkspace");}
 function preview(){
  const box=workspace();box.innerHTML="";
  const passage=el("div","reading-passage");
  passage.innerHTML='<div class="reading-workspace-head"><div><p class="eyebrow">PASSAGE PREVIEW</p><h2>'+moduleData.title+'</h2></div><button class="button button-dark" id="previewStart">开始练习</button></div><p>'+moduleData.passage+'</p><p class="small muted">'+moduleData.source+' · 当前没有单独 PDF 文件，因此先提供网页文章预览。</p>';
  box.appendChild(passage);passage.querySelector("#previewStart").onclick=start;box.scrollIntoView({behavior:"smooth",block:"start"});
 }
 function start(){
  const box=workspace();box.innerHTML="";
  const shell=el("div","reading-practice-shell");
  shell.innerHTML='<div class="reading-workspace-head"><div><p class="eyebrow">'+moduleData.test+' · '+moduleData.passageNo+'</p><h2>'+moduleData.title+'</h2><p class="small muted">共 '+moduleData.questions.length+' 题 · 提交后自动判分</p></div><button class="button button-light" id="backReading">返回题库</button></div><div class="reading-passage"><h3>Reading Passage</h3><p>'+moduleData.passage+'</p></div><div class="reading-questions" id="readingQuestions"></div><button class="button button-dark" id="submitReading">提交答案并查看成绩</button><div id="readingResult"></div>';
  box.appendChild(shell);
  shell.querySelector("#backReading").onclick=render;
  const list=shell.querySelector("#readingQuestions");
  moduleData.questions.forEach((item,i)=>{
   const q=el("div","question quiz-question");q.innerHTML='<b>'+(i+1)+'. '+item[0]+'</b>'+item[1].map((option,j)=>'<label class="option"><input type="radio" name="reading-answer-'+i+'" value="'+j+'"><span>'+String.fromCharCode(65+j)+'. '+option+'</span></label>').join("");
   list.appendChild(q);
  });
  shell.querySelector("#submitReading").onclick=()=>{
   const answers=moduleData.questions.map((item,i)=>{const checked=shell.querySelector('input[name="reading-answer-'+i+'"]:checked');return checked?Number(checked.value):null;});
   if(answers.some(x=>x===null)){toast("还有题目没有作答，请完成全部题目");return;}
   const correct=answers.filter((a,i)=>a===moduleData.questions[i][2]).length;
   progress()[moduleData.id]={submitted:true,correct:correct,total:moduleData.questions.length,answers:answers,date:todayISO()};
   state.sessions.push({id:uid(),skill:"Reading",name:moduleData.title,correct:correct,total:moduleData.questions.length,note:"题库模块自动判分",date:todayISO(),percent:Math.round(correct/moduleData.questions.length*100)});
   moduleData.questions.forEach((item,i)=>{if(answers[i]!==item[2])state.mistakes.push({id:uid(),skill:"Reading",category:"Multiple Choice",question:moduleData.title+" · "+(i+1)+". "+item[0],why:"你的答案："+item[1][answers[i]]+"；正确答案："+item[1][item[2]]+"。"+item[3],fix:"回到文章定位对应信息，注意题干与原文的同义替换。",date:todayISO(),reviewed:false});});
   markActivity();save();
   const result=shell.querySelector("#readingResult");
   result.innerHTML='<div class="quiz-result"><div class="info-grid"><div><b>'+correct+'/'+moduleData.questions.length+'</b><small>答对题数</small></div><div><b>'+Math.round(correct/moduleData.questions.length*100)+'%</b><small>正确率</small></div><div><b>已完成</b><small>模块状态</small></div></div><h3>答案解析</h3>'+moduleData.questions.map((item,i)=>'<div class="question"><b>'+(i+1)+'. '+item[0]+'</b><p class="small">'+(answers[i]===item[2]?"✓ 回答正确":"✕ 你的答案："+item[1][answers[i]]+"；正确答案："+item[1][item[2]])+'</p><p class="small muted">'+item[3]+'</p></div>').join("")+'<button class="button button-dark" id="backAfterReading">返回阅读题库</button></div>';
   result.querySelector("#backAfterReading").onclick=render;
   toast("完成！答对 "+correct+"/"+moduleData.questions.length+"，错题已自动收录");
  };
  box.scrollIntoView({behavior:"smooth",block:"start"});
 }
 render();
 window.addEventListener("hashchange",render);
})();
