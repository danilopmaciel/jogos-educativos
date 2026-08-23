/* ============================================================================
   base.js — utilitários usados por todos os jogos.
   Carregue SEMPRE primeiro. Script clássico (sem `type=module`) de propósito:
   assim o jogo abre com duplo clique, direto do file://, sem servidor.
   ========================================================================== */

const $ = id => document.getElementById(id);

/* "MAÇÃ" -> "maca". Serve para casar palavra com a chave do desenho. */
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "")
                   .replace(/[^A-Za-z]/g, "").toLowerCase();

const rnd  = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];

/* Paleta alegre, de alto contraste sobre fundo escuro. */
const PALETTE = ["#ff5f6d","#ffb347","#ffd23f","#7ee787","#4fd1c5",
                 "#6ec6ff","#a78bfa","#f472b6","#fb923c","#34d399"];

/* Fundo que muda de cor a cada interação. Espera um <div id="bg"> na página. */
let _hue = 250;
function shiftBg(step){
  _hue = (_hue + step) % 360;
  const bg = $("bg");
  if(bg) bg.style.background =
    `radial-gradient(circle at 50% 45%, hsl(${_hue} 72% 32%), hsl(${(_hue+40)%360} 70% 11%) 70%)`;
}

/* Embrulha o miolo de um desenho num <svg>. Os desenhos são feitos num
   viewBox 0 0 120 120 com traço escuro e preenchimentos chapados. */
function svgWrap(inner, vb){
  return `<svg viewBox="${vb || "0 0 120 120"}" xmlns="http://www.w3.org/2000/svg"
    stroke="#241f3d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">${inner}</svg>`;
}
