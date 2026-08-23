/* ============================================================================
   trava.js — "trava de criança": impede que o teclado e o mouse escapem do
   jogo enquanto a criança bate no teclado. Depende de: base.js ($).

   O QUE DÁ E O QUE NÃO DÁ PARA BLOQUEAR — leia antes de mexer
   JavaScript comum NÃO segura a tecla Windows, o Alt+Tab nem o Ctrl+Alt+Del:
   quem trata essas teclas é o sistema operacional, muito antes da página.
   O único mecanismo que o navegador oferece é a Keyboard Lock API
   (`navigator.keyboard.lock()`), e ela tem três condições:
     1. só funciona em TELA CHEIA;
     2. só existe em navegadores Chromium (Chrome, Edge, Brave);
     3. exige contexto seguro — `file://` conta, então o jogo offline funciona.
   É por isso que o tinyfingers insiste em tela cheia: não é estilo, é a única
   forma de a página receber a tecla Windows em vez do menu Iniciar.
   Ctrl+Alt+Del continua passando. Isso nenhuma página do mundo bloqueia.

   COMO O ADULTO SAI
   Segurando ESC por 1,5 s — o mesmo gesto que o Chrome já pede quando há
   keyboard lock ativo, para os dois estados não brigarem. Um toque rápido no
   ESC não faz nada, que é justamente o ponto.
   ========================================================================== */

let travaOn = false;
const ESC_MS = 1500;            // quanto tempo o ESC tem que ficar apertado
let escIni = 0, escTimer = null;

/* Aviso criado por JS: assim qualquer jogo ganha a trava sem mudar o HTML. */
let avisoEl = null;
function aviso(txt, prog){
  if(!avisoEl){
    avisoEl = document.createElement("div");
    avisoEl.style.cssText =
      "position:fixed;left:50%;top:2.4vh;transform:translateX(-50%);z-index:20;" +
      "padding:.45em 1.1em;border-radius:999px;background:rgba(10,8,30,.85);" +
      "color:#fff;font:inherit;font-weight:800;font-size:min(2.3vh,3.4vw);" +
      "letter-spacing:.04em;white-space:nowrap;pointer-events:none;opacity:0;" +
      "transition:opacity .25s;backdrop-filter:blur(6px);overflow:hidden;";
    avisoEl.innerHTML = "<span></span>" +
      "<i style='position:absolute;left:0;top:0;bottom:0;width:0;background:#ffffff28'></i>";
    document.body.appendChild(avisoEl);
  }
  avisoEl.firstChild.textContent = txt || "";
  avisoEl.lastChild.style.width = ((prog || 0) * 100) + "%";
  avisoEl.style.opacity = txt ? "1" : "0";
}

/* ------------------------------ LIGA/DESLIGA ------------------------------ */
function emitir(){
  document.dispatchEvent(new CustomEvent("trava", {detail:{on:travaOn, forte:travaForte}}));
}

/* true quando a Keyboard Lock pegou de verdade — ou seja, quando a tecla
   Windows realmente chega aqui em vez de abrir o menu Iniciar. */
let travaForte = false;

async function travar(){
  if(travaOn) return;
  /* A ordem importa: o lock só pega depois que a tela cheia já entrou. */
  try{
    if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
  }catch(e){}

  /* Sem tela cheia não existe trava — e um cadeado que mente é pior que
     cadeado nenhum, porque o adulto larga a criança sozinha confiando nele.
     Então aqui a gente desiste em voz alta em vez de fingir que travou. */
  if(!document.fullscreenElement){
    aviso("⚠ Sem tela cheia o teclado não trava", 0);
    setTimeout(() => { if(!travaOn) aviso(""); }, 3200);
    return;
  }

  travaForte = false;
  try{ await navigator.keyboard?.lock?.(); travaForte = true; }catch(e){}

  travaOn = true;
  aviso(travaForte ? "🔒 Travado — segure ESC para sair"
                   : "🔒 Tela cheia — a tecla Windows ainda escapa (use Chrome)", 0);
  setTimeout(() => { if(travaOn) aviso(""); }, 3200);
  emitir();
}

function destravar(){
  if(!travaOn) return;
  travaOn = false; travaForte = false;
  cancelaEsc();
  try{ navigator.keyboard?.unlock?.(); }catch(e){}
  try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){}
  aviso("🔓 Destravado", 0);
  setTimeout(() => { if(!travaOn) aviso(""); }, 1400);
  emitir();
}

const travaToggle = () => travaOn ? destravar() : travar();

/* ------------------------------- ESC SEGURADO ----------------------------- */
function cancelaEsc(){
  if(escTimer){ clearInterval(escTimer); escTimer = null; }
  if(travaOn) aviso("");
}
function tiqueEsc(){
  const p = (Date.now() - escIni) / ESC_MS;
  if(p >= 1){ destravar(); return; }
  aviso("Segure para sair…", p);
}

/* -------------------------- TECLADO: fase de captura ----------------------
   Captura (3º argumento `true`) para chegar ANTES do jogo. O preventDefault
   engole o que o navegador faria — Ctrl+W, Ctrl+T, F5, Meta — sem impedir que
   o jogo continue reagindo à tecla, porque preventDefault não interrompe a
   propagação. Só o ESC é engolido de vez, com stopImmediatePropagation. */
addEventListener("keydown", e => {
  if(!travaOn) return;
  if(e.key === "Escape"){
    e.preventDefault(); e.stopImmediatePropagation();
    if(!escTimer){ escIni = Date.now(); escTimer = setInterval(tiqueEsc, 60); }
    return;
  }
  e.preventDefault();
}, true);

addEventListener("keyup", e => {
  if(e.key === "Escape"){ e.preventDefault(); cancelaEsc(); }
}, true);

/* Se a tela cheia cair por fora (F11, botão do navegador), a trava cai junto:
   sem tela cheia o lock não vale mais, e um cadeado que mente é pior que nada. */
document.addEventListener("fullscreenchange", () => {
  if(travaOn && !document.fullscreenElement) destravar();
});

/* Fechar a aba sem querer é o acidente mais comum. Só enquanto travado. */
addEventListener("beforeunload", e => {
  if(!travaOn) return;
  e.preventDefault(); e.returnValue = "";
});

/* -------------------------------- MOUSE ----------------------------------
   Estes valem SEMPRE, travado ou não: num jogo de criança nada aqui tem uso.
   O botão esquerdo continua livre — é ele que dispara os efeitos e clica nos
   controles. O que morre é o efeito colateral dele: seleção de texto, arrastar
   o desenho para fora, e o menu do botão direito. */
["contextmenu", "dragstart", "selectstart"].forEach(t =>
  addEventListener(t, e => e.preventDefault(), true));

addEventListener("auxclick", e => e.preventDefault(), true);      // botão do meio
addEventListener("mousedown", e => {
  if(e.button !== 0) e.preventDefault();   // meio, direito, voltar/avançar
}, true);
addEventListener("dblclick", e => e.preventDefault(), true);
