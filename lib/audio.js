/* ============================================================================
   audio.js — efeitos sonoros sintetizados + voz.
   Depende de: base.js ($).
   Espera opcionalmente na página: <select id="selVoice">.
   ========================================================================== */

/* ----------------------------- EFEITOS ----------------------------------- */
/* Sons gerados por oscilador: nenhum arquivo de áudio, nada para carregar. */
let AC = null;
function ac(){
  if(!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
  return AC;
}

function tone(freq, dur, type, vol, slideTo){
  try{
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, c.currentTime);
    if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, c.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + dur + 0.02);
  }catch(e){}
}
const sPop     = () => tone(560, .18, "triangle", .16, 900);
const sSparkle = () => { [880,1180,1560].forEach((f,i) => setTimeout(() => tone(f,.16,"sine",.12), i*70)); };
const sBoom    = () => { tone(90,.5,"sawtooth",.22,40); setTimeout(sSparkle, 90); };
const sSwoosh  = () => tone(240,.4,"sine",.12,1400);

/* ------------------------------- VOZ -------------------------------------- */
let voiceOn = true;                       // o jogo alterna isto pelo botão 🔊
let voices = [], ptVoices = [], chosenVoice = null;

/* O que separa uma voz natural de uma robótica é a tecnologia por trás:
   vozes de REDE (Google, "Natural"/"Online" da Microsoft) são neurais e soam
   humanas; as locais antigas (SAPI5, eSpeak) são concatenativas e soam
   metálicas. Por isso `localService` pesa NEGATIVO no ranking. */
function voiceScore(v){
  let s = 0;
  if(/pt[-_]?BR/i.test(v.lang)) s += 300;
  if(!v.localService) s += 200;
  if(/natural|neural|online|wavenet|studio/i.test(v.name)) s += 180;
  if(/google/i.test(v.name)) s += 120;
  if(/francisca|thalita|brenda|elza|leila|luciana|camila/i.test(v.name)) s += 40;
  if(/antonio|donato|julio|fabio|felipe/i.test(v.name)) s += 30;
  if(/eloquence|compact|espeak|desktop/i.test(v.name)) s -= 120;
  return s;
}

function loadVoices(){
  if(!window.speechSynthesis) return;
  voices = speechSynthesis.getVoices() || [];
  ptVoices = voices.filter(v => /^pt/i.test(v.lang))
                   .sort((a,b) => voiceScore(b) - voiceScore(a));
  if(!chosenVoice || !ptVoices.includes(chosenVoice)) chosenVoice = ptVoices[0] || null;
  fillVoicePicker();
}

function fillVoicePicker(){
  const sel = $("selVoice");
  if(!sel) return;
  if(!ptVoices.length){ sel.innerHTML = "<option>sem voz pt-BR</option>"; return; }
  sel.innerHTML = ptVoices.map((v,i) =>
    `<option value="${i}">🗣 ${v.name.replace(/Microsoft |Desktop| - Portuguese.*| \(.*?\)/g,"").trim()}</option>`
  ).join("");
  sel.value = String(Math.max(0, ptVoices.indexOf(chosenVoice)));
}

if(window.speechSynthesis){
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;   // a lista chega assíncrona
}

/* Fala uma sequência de trechos. Três coisas ajudam a soar menos robótico:
   1. FRASES, não tokens soltos — o modelo de prosódia precisa de contexto;
      "a letra ême" soa natural, "ême" sozinho sai cortado e metálico.
   2. Uma utterance por trecho — gera uma pausa de respiração de verdade.
   3. Micro-variação de tom e ritmo, para a repetição não sair idêntica
      (é a repetição exata que denuncia a máquina). */
function speakSeq(parts, opts){
  if(!voiceOn || !window.speechSynthesis) return;
  const o = opts || {};
  const jitter = () => 1 + (Math.random() - .5) * .07;
  try{
    speechSynthesis.cancel();
    [].concat(parts).filter(Boolean).forEach(txt => {
      const u = new SpeechSynthesisUtterance(txt);
      u.lang   = "pt-BR";
      u.rate   = (o.rate  != null ? o.rate  : .98) * jitter();
      u.pitch  = (o.pitch != null ? o.pitch : 1.0) * jitter();
      u.volume = 1;
      if(chosenVoice) u.voice = chosenVoice;
      speechSynthesis.speak(u);
    });
  }catch(e){}
}
const speak = (t, o) => speakSeq([t], o);
