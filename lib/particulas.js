/* ============================================================================
   particulas.js — fogos, confete, estrelas e riscos de luz num <canvas>.
   Depende de: base.js (rnd, pick, PALETTE, $) e audio.js (sBoom, sSparkle, sSwoosh).
   Espera na página: <canvas id="fx"> e, para o clarão, <div id="flash">.
   ========================================================================== */

const cv = $("fx"), ctx = cv.getContext("2d");
let parts = [];

function resize(){
  cv.width  = innerWidth  * devicePixelRatio;
  cv.height = innerHeight * devicePixelRatio;
  cv.style.width  = innerWidth + "px";
  cv.style.height = innerHeight + "px";
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
addEventListener("resize", resize); resize();

function P(o){
  parts.push(Object.assign({x:0, y:0, vx:0, vy:0, g:.16, life:1, decay:.012,
    size:6, color:"#fff", shape:"circle", rot:0, vr:0, trail:0}, o));
}
function limparParticulas(){ parts = []; }

function fireworks(x, y, hueBase){
  const n = 70;
  for(let i=0;i<n;i++){
    const a = (Math.PI*2*i)/n + rnd(-.05,.05), sp = rnd(3,9);
    P({x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, g:.09, size:rnd(2.5,5.5), trail:1,
       decay:rnd(.008,.018), color:`hsl(${(hueBase+rnd(-30,30))|0} 95% ${rnd(55,75)|0}%)`});
  }
  sBoom();
}
function confetti(){
  for(let i=0;i<90;i++){
    P({x:rnd(0,innerWidth), y:rnd(-innerHeight*.3,0), vx:rnd(-1.5,1.5), vy:rnd(1,4), g:.06,
       size:rnd(6,13), shape:"rect", rot:rnd(0,6), vr:rnd(-.2,.2), decay:.006, color:pick(PALETTE)});
  }
  sSparkle();
}
function starBurst(){
  const cx = innerWidth/2, cy = innerHeight/2;
  for(let i=0;i<50;i++){
    const a = rnd(0,Math.PI*2), sp = rnd(4,12);
    P({x:cx, y:cy, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, g:.02, size:rnd(8,18), shape:"star",
       rot:rnd(0,6), vr:rnd(-.15,.15), decay:.014, color:pick(PALETTE)});
  }
  sSparkle();
}
function sprinkle(x, y, color){
  for(let i=0;i<22;i++){
    const a = rnd(0,Math.PI*2), sp = rnd(1.5,6);
    P({x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-2, g:.14, size:rnd(3,7),
       decay:.02, color:color || pick(PALETTE)});
  }
}
function streak(dir){
  const w = innerWidth, h = innerHeight;
  for(let i=0;i<40;i++){
    const base = {size:rnd(4,9), g:0, decay:.02, color:pick(PALETTE), trail:1};
    if(dir === "ArrowLeft")  P({...base, x:w, y:rnd(0,h), vx:rnd(-16,-8), vy:rnd(-1,1)});
    if(dir === "ArrowRight") P({...base, x:0, y:rnd(0,h), vx:rnd(8,16),   vy:rnd(-1,1)});
    if(dir === "ArrowUp")    P({...base, x:rnd(0,w), y:h, vx:rnd(-1,1), vy:rnd(-16,-8)});
    if(dir === "ArrowDown")  P({...base, x:rnd(0,w), y:0, vx:rnd(-1,1), vy:rnd(8,16)});
  }
  sSwoosh();
}
function rainbowFlash(){
  const flashEl = $("flash");
  if(!flashEl) return;
  flashEl.style.background = `linear-gradient(${(Math.random()*360)|0}deg,
    #ff5f6d,#ffb347,#ffd23f,#7ee787,#4fd1c5,#6ec6ff,#a78bfa)`;
  flashEl.animate([{opacity:0},{opacity:.75},{opacity:0}], {duration:900, easing:"ease-out"});
  sSparkle();
}

function starPath(g, x, y, r, rot){
  g.beginPath();
  for(let i=0;i<10;i++){
    const rr = i%2 ? r*.45 : r, a = rot + i*Math.PI/5 - Math.PI/2;
    g[i ? "lineTo" : "moveTo"](x + Math.cos(a)*rr, y + Math.sin(a)*rr);
  }
  g.closePath();
}

function loop(){
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for(let i=parts.length-1;i>=0;i--){
    const p = parts[i];
    p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .992; p.rot += p.vr; p.life -= p.decay;
    if(p.life <= 0 || p.y > innerHeight + 80){ parts.splice(i,1); continue; }
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
    if(p.trail){
      ctx.lineWidth = p.size*.8; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(p.x,p.y);
      ctx.lineTo(p.x - p.vx*2.2, p.y - p.vy*2.2); ctx.stroke();
    } else if(p.shape === "rect"){
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillRect(-p.size/2, -p.size/3, p.size, p.size*.66); ctx.restore();
    } else if(p.shape === "star"){
      starPath(ctx, p.x, p.y, p.size, p.rot); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(loop);
}
loop();
