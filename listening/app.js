const PART_COUNTS={P1:38,P2:24,P3:35,P4:50};
let catalogue={tests:[]},activePart="P1",activeFrequency="全部";
const list=document.getElementById("testList"),search=document.getElementById("search"),count=document.getElementById("resultCount"),title=document.getElementById("listTitle");
function render(){
 const q=search.value.trim().toLowerCase();
 const items=catalogue.tests.filter(t=>t.part===activePart&&(activeFrequency==="全部"||t.frequency===activeFrequency)&&(!q||String(t.title||"").toLowerCase().includes(q)));
 title.textContent=activePart.replace("P","Part ")+" 题目";
 count.textContent=items.length+" / "+(PART_COUNTS[activePart]||0)+" 套";
 if(!items.length){
  list.innerHTML='<div class="empty"><strong>题目文件正在接入</strong>这一部分共有 '+(PART_COUNTS[activePart]||0)+' 套练习。题库目录和原始 HTML 页面迁入后，这里会显示可直接打开的题目；目前不会放入虚构题目或无效入口。</div>';
  return;
 }
 list.innerHTML=items.map(t=>'<a class="test" href="'+encodeURI(t.path)+'"><div class="meta"><span>'+t.part+'</span><span class="tag">'+t.frequency+'</span></div><strong>'+escapeHtml(t.title)+'</strong><div class="meta"><span>'+(t.pdf?'含 PDF':'无 PDF')+'</span><span>打开练习 →</span></div></a>').join("");
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
document.querySelectorAll("[data-part]").forEach(b=>b.addEventListener("click",()=>{activePart=b.dataset.part;document.querySelectorAll("[data-part]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));render();}));
document.querySelectorAll("[data-frequency]").forEach(b=>b.addEventListener("click",()=>{activeFrequency=b.dataset.frequency;document.querySelectorAll("[data-frequency]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));render();}));
search.addEventListener("input",render);
fetch("catalog.json").then(r=>{if(!r.ok)throw Error("catalog");return r.json();}).then(data=>{catalogue=data;render();}).catch(()=>{count.textContent="题库目录尚未接入";list.innerHTML='<div class="empty"><strong>暂时无法读取题库目录</strong>请稍后刷新页面。</div>';});