const y=document.getElementById("y");if(y){y.textContent=new Date().getFullYear()}
const prefersReduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches
const io=!prefersReduced?new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}})},{threshold:.18}):null
document.querySelectorAll(".reveal").forEach(el=>{if(io)io.observe(el);else el.classList.add("visible")})
document.querySelectorAll("[data-scroller]").forEach(scroller=>{const wrap=scroller.parentElement;const prev=wrap.querySelector(".prev");const next=wrap.querySelector(".next");const step=()=>Math.min(440,scroller.clientWidth*.9);const scrollBy=(dx)=>scroller.scrollBy({left:dx,behavior:"smooth"});if(prev)prev.addEventListener("click",()=>scrollBy(-step()));if(next)next.addEventListener("click",()=>scrollBy(step()));let isDown=false;let startX=0;let scrollLeft=0;const onDown=e=>{isDown=true;startX=("touches"in e?e.touches[0].pageX:e.pageX);scrollLeft=scroller.scrollLeft};const onMove=e=>{if(!isDown)return;e.preventDefault();const x=("touches"in e?e.touches[0].pageX:e.pageX);const walk=(x-startX);scroller.scrollLeft=scrollLeft-walk};const onUp=()=>{isDown=false};scroller.addEventListener("mousedown",onDown);scroller.addEventListener("mousemove",onMove);window.addEventListener("mouseup",onUp);scroller.addEventListener("touchstart",onDown,{passive:true});scroller.addEventListener("touchmove",onMove,{passive:false});scroller.addEventListener("touchend",onUp)})
document.querySelectorAll('a[target="_blank"]').forEach(a=>{a.setAttribute("rel","noopener noreferrer")})

const tw=document.getElementById("tetris-wrap")
const tc=document.getElementById("tetris")
const tn=document.getElementById("tetris-next")
const ts=document.getElementById("tetris-start")
const tt=document.getElementById("tetris-theme")
const tov=document.getElementById("tetris-overlay")
const tscore=document.getElementById("tetris-score")
if(tc&&tn){
  const ctx=tc.getContext("2d");const nctx=tn.getContext("2d");const COLS=10,ROWS=20,SZ=30
  const SHAPES={I:[[1,1,1,1]],J:[[1,0,0],[1,1,1]],L:[[0,0,1],[1,1,1]],O:[[1,1],[1,1]],S:[[0,1,1],[1,1,0]],T:[[0,1,0],[1,1,1]],Z:[[1,1,0],[0,1,1]]}
  const K=Object.keys(SHAPES)
  let board,cur,next,dropInt=700,acc=0,last=0,run=false,paused=false,score=0,theme="light"
  const colorsLight={I:"#7bc5f8",J:"#6a9bd8",L:"#f7b267",O:"#f7e06b",S:"#7bd88f",T:"#c59cf6",Z:"#ff8e8e",G:"#e7eef3"}
  const colorsDark={I:"#4aa3df",J:"#517fc3",L:"#e79854",O:"#d9c64c",S:"#4fc97b",T:"#a787e7",Z:"#ff6e6e",G:"#0f1b23"}
  const colorOf=(k)=> (theme==="dark"?colorsDark:colorsLight)[k]
  const empty=()=>Array.from({length:ROWS},()=>Array(COLS).fill(0))
  const rand=()=>K[(Math.random()*K.length)|0]
  const makePiece=(k)=>({k,shape:SHAPES[k].map(r=>r.slice()),x:3,y:0})
  const rotate=(m)=>m[0].map((_,i)=>m.map(r=>r[i]).reverse())
  const collide=(b,p)=>{for(let y=0;y<p.shape.length;y++)for(let x=0;x<p.shape[y].length;x++){if(p.shape[y][x]){const ny=p.y+y,nx=p.x+x;if(nx<0||nx>=COLS||ny>=ROWS||b[ny]?.[nx])return true}}return false}
  const merge=(b,p)=>{for(let y=0;y<p.shape.length;y++)for(let x=0;x<p.shape[y].length;x++)if(p.shape[y][x])b[p.y+y][p.x+x]=p.k}
  const clear=()=>{let lines=0;for(let y=ROWS-1;y>=0;y--){if(board[y].every(v=>v)){board.splice(y,1);board.unshift(Array(COLS).fill(0));lines++;y++}}if(lines){score+= [0,40,100,300,800][lines];tscore.textContent=score}}
  const drawCell=(x,y,k)=>{ctx.fillStyle=k?colorOf(k):colorOf("G");ctx.fillRect(x*SZ+1,y*SZ+1,SZ-2,SZ-2)}
  const draw=()=>{ctx.fillStyle=theme==="dark"?"#0c141a":"#fff";ctx.fillRect(0,0,tc.width,tc.height);for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)drawCell(x,y,board[y][x]);for(let y=0;y<cur.shape.length;y++)for(let x=0;x<cur.shape[y].length;x++)if(cur.shape[y][x])drawCell(cur.x+x,cur.y+y,cur.k)}
  const drawNext=()=>{nctx.fillStyle=theme==="dark"?"#0c141a":"#fff";nctx.fillRect(0,0,tn.width,tn.height);const s=next.shape;const offX=(4-s[0].length)/2,offY=(4-s.length)/2;for(let y=0;y<s.length;y++)for(let x=0;x<s[y].length;x++)if(s[y][x]){nctx.fillStyle=colorOf(next.k);nctx.fillRect((x+offX)*20+1,(y+offY)*20+1,18,18)}}
  const spawn=()=>{cur=next||makePiece(rand());next=makePiece(rand());cur.x=3;cur.y=0;if(collide(board,cur)){stop();}}
  const step=(t)=>{if(!run||paused)return;const dt=t-last;last=t;acc+=dt;if(acc>dropInt){acc=0;down()}draw();drawNext();requestAnimationFrame(step)}
  const start=()=>{board=empty();score=0;tscore.textContent=score;next=makePiece(rand());spawn();run=true;paused=false;acc=0;last=performance.now();if(tov)tov.style.display="none";if(tw)tw.focus();requestAnimationFrame(step)}
  const stop=()=>{run=false;paused=false;if(tov){tov.style.display="grid";tov.querySelector(".play-inline span").textContent="重新开始"}}
  const down=()=>{cur.y++;if(collide(board,cur)){cur.y--;merge(board,cur);clear();spawn()}}
  const hard=()=>{while(!collide(board,{...cur,y:cur.y+1}))cur.y++;down()}
  const move=(dx)=>{cur.x+=dx;if(collide(board,cur))cur.x-=dx}
  const turn=()=>{const r=rotate(cur.shape);const keep=cur.shape;cur.shape=r;if(collide(board,cur))cur.shape=keep}
  const toggleTheme=()=>{if(!tw)return;theme=theme==="light"?"dark":"light";tw.classList.toggle("dark",theme==="dark");tt.textContent=theme==="dark"?"日间":"夜间";draw();drawNext()}
  if(tov)tov.addEventListener("click",()=>start())
  if(ts)ts.addEventListener("click",()=>{if(!run)start();else if(!paused){paused=true;ts.textContent="继续"}else{paused=false;ts.textContent="暂停";last=performance.now();if(tw)tw.focus();requestAnimationFrame(step)}})
  if(tt)tt.addEventListener("click",toggleTheme)
  const onKey=(e)=>{if(!run||paused)return;const k=e.key;if(k==="ArrowLeft"||k==="ArrowRight"||k==="ArrowDown"||k==="ArrowUp"||k===" "){e.preventDefault();e.stopPropagation()}switch(k){case"ArrowLeft":move(-1);break;case"ArrowRight":move(1);break;case"ArrowDown":down();break;case"ArrowUp":turn();break;case" ":hard();break;case"P":case"p":paused=true;ts.textContent="继续";break;case"R":case"r":start();break}}
  if(tw)tw.addEventListener("keydown",onKey,{passive:false})
}

const cloud=document.getElementById("tag-cloud")
if(cloud){
  const tags=["理财","养生","运营","羽毛球","快走","阅读","细节控","旅行","火锅","椰子鸡","AI","洞察","敏感","复盘","橘猫","播客","星盘","学习"]
  const W=cloud.clientWidth||600,H=cloud.clientHeight||320,placed=[]
  const tryPlace=(w,h,maxTry=200)=>{for(let i=0;i<maxTry;i++){const left=8+Math.random()*(W-w-16);const top=8+Math.random()*(H-h-16);const r={l:left,t:top,r:left+w,b:top+h};let ok=true;for(const p of placed){if(!(r.r<p.l||r.l>p.r||r.b<p.t||r.t>p.b)){ok=false;break}}if(ok){placed.push(r);return{left,top}}}return null}
  tags.forEach((t,i)=>{
    const el=document.createElement("span");el.className="bubble";el.textContent=t
    const size=12+Math.round((t.length%6)*2)+ (["AI","洞察","学习"].includes(t)?6:0);el.style.fontSize=`${size}px`
    const bw=t.length*size*0.75+28,bh=size+18
    const pos=tryPlace(bw,bh)||{left:8+((i*24)%Math.max(16,W-bw-16)),top:8+((i*18)%Math.max(16,H-bh-16))}
    el.style.left=`${pos.left}px`;el.style.top=`${pos.top}px`
    el.style.animation=`floaty ${3 + (i%5)}s ease-in-out ${-(i%3)}s infinite alternate`
    cloud.appendChild(el)
  })
}
