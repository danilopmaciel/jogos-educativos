/* ============================================================================
   maos.js — mãos de desenho animado mostrando 0 a 10 dedos.
   Depende de: base.js (svgWrap).
   Uso: artEl.innerHTML = handsSVG(7);

   A luva é UMA silhueta contínua, não retângulos empilhados — é isso que faz
   parecer desenhada. Os dedos ficam em leque (ângulos diferentes), o contorno
   sobe por um lado do dedo, faz a calota no topo, desce pelo outro e mergulha
   no vale entre os dedos. Contagem brasileira: indicador primeiro, polegar
   entra no 5.
   ========================================================================== */

const GLOVE = "#ffffff", INK = "#1d1d28";
const R1 = d => Math.round(d*10)/10;

/* base do dedo, ângulo de abertura, comprimento e raio */
const FING = [
  {x:48,  y:104, a:-16, len:76, r:14.5},   // indicador
  {x:76,  y:97,  a: -4, len:86, r:15},     // médio
  {x:104, y:101, a:  9, len:77, r:14.5},   // anelar
  {x:128, y:113, a: 23, len:60, r:12.5}    // mindinho
];

function fpt(f, along, side){
  const t  = f.a * Math.PI/180;
  const dx = Math.sin(t), dy = -Math.cos(t);   // direção do dedo
  const px = Math.cos(t), py =  Math.sin(t);   // perpendicular
  return [ R1(f.x + px*side*f.r + dx*along), R1(f.y + py*side*f.r + dy*along) ];
}

function gloveSilhouette(raised){
  let d = "";
  FING.forEach((f, i) => {
    const len = i < raised ? f.len : 26;      // dobrado = só o nó do dedo
    const [lbx,lby] = fpt(f, 0, -1),   [ltx,lty] = fpt(f, len, -1);
    const [rtx,rty] = fpt(f, len, 1),  [rbx,rby] = fpt(f, 0, 1);
    if(i === 0) d += `M${lbx} ${lby} `;
    else {
      const [pbx,pby] = fpt(FING[i-1], 0, 1);
      const deep = (i-1 < raised && i < raised) ? 9 : 4;
      d += `Q${R1((pbx+lbx)/2)} ${R1(Math.max(pby,lby)+deep)} ${lbx} ${lby} `;
    }
    d += `L${ltx} ${lty} A${f.r} ${f.r} 0 0 1 ${rtx} ${rty} L${rbx} ${rby} `;
  });
  d += `Q148 138 144 158 L147 172 `;
  d += `Q160 178 156 202 Q155 218 137 218 L35 218 Q17 218 16 202 Q12 178 25 172 `;
  d += `L28 158 Q22 138 34 118 Z`;
  return d;
}

/* Polegar = casco entre dois círculos (base grossa → ponta fina).
   Uma cápsula de largura constante vira uma "salsicha" atravessada na palma. */
function taperedThumb(x1,y1,r1, x2,y2,r2){
  const dx = x2-x1, dy = y2-y1, dist = Math.hypot(dx,dy);
  const th = Math.atan2(dy,dx), ph = Math.acos((r1-r2)/dist);
  const P = (x,y,r,a) => [R1(x + r*Math.cos(a)), R1(y + r*Math.sin(a))];
  const [ax,ay] = P(x1,y1,r1, th-ph), [bx,by] = P(x2,y2,r2, th-ph);
  const [cx,cy] = P(x2,y2,r2, th+ph), [ex,ey] = P(x1,y1,r1, th+ph);
  return `M${ax} ${ay} L${bx} ${by} A${r2} ${r2} 0 0 1 ${cx} ${cy} `
       + `L${ex} ${ey} A${r1} ${r1} 0 0 1 ${ax} ${ay} Z`;
}
const THUMB_UP   = taperedThumb(46,168,20,  4,124,14);   // aberto, para fora
const THUMB_DOWN = taperedThumb(36,174,20, 74,150,13);   // recolhido junto à palma

function oneHand(up, mirror){
  const nUp = Math.max(0, Math.min(5, up));
  const raised = nUp >= 5 ? 4 : nUp;
  let s = "";
  s += `<path d="${gloveSilhouette(raised)}" fill="${GLOVE}"/>`;
  // os três vincos clássicos do dorso da luva
  s += `<g stroke-width="4"><path d="M84 130 q-3 12 0 18 M103 126 q-2 13 1 19 M120 131 q-1 10 3 16"/></g>`;
  s += `<path d="${nUp >= 5 ? THUMB_UP : THUMB_DOWN}" fill="${GLOVE}"/>`;
  s += `<path d="M30 190 q56 13 112 0" stroke-width="4.5"/>`;
  const g = `<g stroke="${INK}" stroke-width="6">${s}</g>`;
  return mirror ? `<g transform="translate(160,0) scale(-1,1)">${g}</g>` : g;
}

function handsSVG(n){
  n = Math.max(0, Math.min(10, n));
  if(n <= 5) return svgWrap(oneHand(n, false), "-12 -4 180 230");
  // duas mãos: a da esquerda espelhada, mostrando 5
  return svgWrap(
    `<g transform="translate(0,4) rotate(-7 80 130)">${oneHand(5, true)}</g>` +
    `<g transform="translate(158,4) rotate(7 80 130)">${oneHand(n-5, false)}</g>`,
    "-14 -4 350 236");
}
