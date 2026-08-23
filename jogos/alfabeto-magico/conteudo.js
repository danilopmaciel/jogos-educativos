/* ============================================================================
   conteudo.js — palavras, sílabas iniciais e os desenhos do Alfabeto Mágico.
   Depende de: nada. Carregue antes do script do jogo.

   Para acrescentar uma palavra: entre em WORDS, dê a sílaba inicial em ONSET
   e desenhe em ART com a chave sem acento e minúscula (MAÇÃ → ART.maca).
   Os desenhos vivem num viewBox 0 0 120 120; o traço e o arredondamento vêm
   do svgWrap() em lib/base.js, então aqui só entram formas e preenchimentos.
   ========================================================================== */

/* Duas palavras por letra. Regra: as duas palavras de uma mesma letra usam
   SEMPRE o mesmo som inicial, para não embaralhar a relação letra–som.
   Por isso G usa GATO/GALINHA (som /g/) e não GIRAFA (que soa como J). */
const WORDS = {
  A:["ABELHA","ANEL"],   B:["BOLA","BANANA"],   C:["CASA","CACHORRO"],
  D:["DADO","DEDO"],     E:["ESTRELA","ELEFANTE"], F:["FLOR","FOGUETE"],
  G:["GATO","GALINHA"],  H:["HIPOPÓTAMO","HÉLICE"], I:["ILHA","IGREJA"],
  J:["JANELA","JACARÉ"], K:["KIWI","KOALA"],    L:["LUA","LEÃO"],
  M:["MAÇÃ","MONTANHA"], N:["NUVEM","NAVIO"],   O:["OLHO","OVO"],
  P:["PATO","PEIXE"],    Q:["QUEIJO","QUADRADO"], R:["RATO","ROSA"],
  S:["SOL","SAPO"],      T:["TARTARUGA","TREM"], U:["UVA","URSO"],
  V:["VACA","VIOLÃO"],   W:["WAFFLE","WI-FI"],    X:["XÍCARA","XADREZ"],
  Y:["YOGA","YETI"],     Z:["ZEBRA","ZERO"]
};

/* Sílaba inicial, para a aliteração ("ma, ma, maçã"). Repetir o ataque antes
   de dizer a palavra inteira é o exercício central de consciência fonológica.
   Repare no H: a sílaba é só a vogal, porque o agá não soa.
   Vogal sozinha vai ACENTUADA ("ó", não "o"). Sem acento o sintetizador lê
   o artigo/conjunção e reduz: "o" sai [u] e "e" sai [i]. */
const ONSET = {
  ABELHA:"á", ANEL:"á", BOLA:"bo", BANANA:"ba", CASA:"ca", CACHORRO:"ca",
  DADO:"da", DEDO:"de", ESTRELA:"es", ELEFANTE:"é", FLOR:"flo", FOGUETE:"fo",
  GATO:"ga", GALINHA:"ga", HIPOPÓTAMO:"i", HÉLICE:"é", ILHA:"i", IGREJA:"i",
  JANELA:"ja", JACARÉ:"ja", KIWI:"qui", KOALA:"co", LUA:"lu", "LEÃO":"le",
  "MAÇÃ":"ma", MONTANHA:"mon", NUVEM:"nu", NAVIO:"na", OLHO:"ó", OVO:"ó",
  PATO:"pa", PEIXE:"pei", QUEIJO:"quei", QUADRADO:"qua", RATO:"ra", ROSA:"ro",
  SOL:"so", SAPO:"sa", TARTARUGA:"tar", TREM:"tre", UVA:"u", URSO:"ur",
  VACA:"va", "VIOLÃO":"vi", WAFFLE:"uá", "WI-FI":"uái", "XÍCARA":"xi", XADREZ:"xa",
  YOGA:"io", YETI:"ié", ZEBRA:"ze", ZERO:"ze"
};

/* ======================= ILUSTRAÇÕES SVG ======================= */
const ART = {};

ART.abelha = `
  <ellipse cx="46" cy="40" rx="19" ry="12" fill="#ffffffcc" transform="rotate(-28 46 40)"/>
  <ellipse cx="78" cy="38" rx="19" ry="12" fill="#ffffffcc" transform="rotate(22 78 38)"/>
  <path d="M40 56 q-8 -14 -16 -16" /><circle cx="22" cy="38" r="3.5" fill="#241f3d"/>
  <clipPath id="cA"><ellipse cx="62" cy="74" rx="34" ry="25"/></clipPath>
  <ellipse cx="62" cy="74" rx="34" ry="25" fill="#ffd23f"/>
  <g clip-path="url(#cA)" stroke="none" fill="#241f3d">
    <rect x="56" y="46" width="10" height="56"/><rect x="76" y="46" width="10" height="56"/></g>
  <ellipse cx="62" cy="74" rx="34" ry="25"/>
  <circle cx="40" cy="70" r="4" fill="#241f3d"/>
  <path d="M96 74 l14 -6 -13 -5" />`;

ART.anel = `
  <path d="M46 40 l14 -18 14 18 -14 22z" fill="#7ee8fa"/>
  <path d="M46 40 h28 M60 22 v40" stroke-width="2.5"/>
  <circle cx="60" cy="80" r="26" stroke="#f2b632" stroke-width="13"/>
  <circle cx="60" cy="80" r="32.5"/><circle cx="60" cy="80" r="19.5"/>`;

ART.bola = `
  <circle cx="60" cy="62" r="42" fill="#fdfdff"/>
  <path d="M60 34 l17 12 -6 20h-22l-6-20z" fill="#241f3d" stroke="none"/>
  <path d="M60 20v14 M18 62l19-2 M102 62l-19-2 M40 100l9-18 M80 100l-9-18" stroke-width="4"/>
  <circle cx="60" cy="62" r="42"/>`;

ART.banana = `
  <path d="M22 44 q4 46 44 54 q34 6 40 -14 q-16 8 -34 -2 Q46 68 40 40z" fill="#ffd23f"/>
  <path d="M22 44 q-2 -10 6 -12 q6 -1 8 8" fill="#8b6f3a"/>
  <path d="M106 84 q6 -6 2 -12" />`;

ART.casa = `
  <path d="M14 56 L60 20 L106 56" fill="#ff6b6b"/>
  <rect x="26" y="54" width="68" height="50" rx="4" fill="#ffe0b2"/>
  <rect x="50" y="72" width="22" height="32" rx="3" fill="#8d6e63"/>
  <circle cx="67" cy="88" r="2.5" fill="#241f3d" stroke="none"/>
  <rect x="32" y="62" width="14" height="14" rx="2" fill="#7ee8fa"/>
  <rect x="78" y="30" width="12" height="18" rx="2" fill="#ff6b6b"/>`;

ART.cachorro = `
  <path d="M26 40 q-14 -6 -12 26 q2 22 14 20z" fill="#b07d4e"/>
  <path d="M94 40 q14 -6 12 26 q-2 22 -14 20z" fill="#b07d4e"/>
  <ellipse cx="60" cy="62" rx="34" ry="32" fill="#d29b63"/>
  <ellipse cx="60" cy="84" rx="20" ry="16" fill="#ffe0b2"/>
  <ellipse cx="60" cy="76" rx="7" ry="5" fill="#241f3d"/>
  <path d="M60 81 v7 M60 88 q-7 6 -12 0 M60 88 q7 6 12 0" stroke-width="2.5"/>
  <circle cx="46" cy="56" r="4.5" fill="#241f3d"/><circle cx="74" cy="56" r="4.5" fill="#241f3d"/>`;

ART.dado = `
  <rect x="18" y="18" width="84" height="84" rx="18" fill="#fdfdff"/>
  <g fill="#ff5f6d" stroke="none">
    <circle cx="40" cy="40" r="7"/><circle cx="80" cy="40" r="7"/>
    <circle cx="60" cy="60" r="7"/>
    <circle cx="40" cy="80" r="7"/><circle cx="80" cy="80" r="7"/></g>`;

ART.dedo = null;   // DEDO usa handsSVG(1), da lib/maos.js

ART.estrela = `
  <path d="M60 14 l14 31 34 4 -25 23 7 34 -30 -17 -30 17 7 -34 -25 -23 34 -4z" fill="#ffd23f"/>
  <circle cx="50" cy="56" r="3.5" fill="#241f3d"/><circle cx="72" cy="56" r="3.5" fill="#241f3d"/>
  <path d="M52 70 q9 8 18 0" stroke-width="3"/>`;

ART.elefante = `
  <ellipse cx="26" cy="50" rx="20" ry="24" fill="#a8b3c4"/>
  <ellipse cx="94" cy="50" rx="20" ry="24" fill="#a8b3c4"/>
  <circle cx="60" cy="54" r="31" fill="#c3ccd9"/>
  <path d="M60 74 v16 q0 14 12 14 q10 0 10 -10" stroke="#c3ccd9" stroke-width="20"/>
  <path d="M60 74 v16 q0 14 12 14 q10 0 10 -10" stroke-width="2.5"/>
  <path d="M46 80 q-3 9 -7 12" stroke="#fdfdff" stroke-width="6"/>
  <path d="M74 80 q3 9 7 12" stroke="#fdfdff" stroke-width="6"/>
  <circle cx="47" cy="48" r="4.5" fill="#241f3d"/><circle cx="73" cy="48" r="4.5" fill="#241f3d"/>`;

ART.flor = `
  <path d="M60 104 q-6 -26 0 -40" stroke-width="5" stroke="#4caf50"/>
  <path d="M60 84 q-20 -6 -24 8 q18 8 24 -8z" fill="#4caf50"/>
  <g fill="#ff6b9d">
    <circle cx="60" cy="26" r="16"/><circle cx="88" cy="42" r="16"/><circle cx="88" cy="74" r="16"/>
    <circle cx="60" cy="90" r="16"/><circle cx="32" cy="74" r="16"/><circle cx="32" cy="42" r="16"/></g>
  <circle cx="60" cy="58" r="17" fill="#ffd23f"/>`;

ART.foguete = `
  <path d="M60 8 q22 24 22 52 v18 H38 V60 Q38 32 60 8z" fill="#fdfdff"/>
  <path d="M38 62 L18 92 l20 -6z" fill="#ff5f6d"/>
  <path d="M82 62 L102 92 l-20 -6z" fill="#ff5f6d"/>
  <circle cx="60" cy="48" r="11" fill="#6ec6ff"/>
  <path d="M46 78 q14 34 28 0" fill="#ffb347"/>
  <path d="M54 82 q6 20 12 0" fill="#ffd23f" stroke="none"/>`;

ART.gato = `
  <path d="M28 52 L30 16 L56 36z" fill="#9e9e9e"/><path d="M92 52 L90 16 L64 36z" fill="#9e9e9e"/>
  <path d="M34 46 L35 26 L50 38z" fill="#ffb3c1" stroke="none"/><path d="M86 46 L85 26 L70 38z" fill="#ffb3c1" stroke="none"/>
  <ellipse cx="60" cy="66" rx="36" ry="32" fill="#bdbdbd"/>
  <ellipse cx="46" cy="60" rx="6" ry="8" fill="#241f3d"/><ellipse cx="74" cy="60" rx="6" ry="8" fill="#241f3d"/>
  <path d="M60 74 l-5 4 h10z" fill="#ffb3c1"/>
  <path d="M60 78 v4 M60 82 q-7 6 -12 1 M60 82 q7 6 12 1" stroke-width="2.5"/>
  <path d="M18 68 h16 M18 78 h16 M102 68 h-16 M102 78 h-16" stroke-width="2.5"/>`;

ART.galinha = `
  <path d="M92 54 q18 -14 22 2 q2 14 -14 14 q6 -10 -8 -16z" fill="#eceff1"/>
  <ellipse cx="62" cy="76" rx="34" ry="28" fill="#fdfdff"/>
  <circle cx="50" cy="42" r="21" fill="#fdfdff"/>
  <path d="M40 24 q3 -12 10 -5 q4 -12 11 -3 q6 -9 8 6" stroke="#ef4444" stroke-width="9" fill="none"/>
  <path d="M31 44 l-15 5 15 6z" fill="#ffb300"/>
  <path d="M36 54 q-7 10 1 13 q9 1 7 -11z" fill="#ef4444"/>
  <circle cx="45" cy="38" r="4.5" fill="#241f3d"/>
  <path d="M64 70 q24 -6 28 10 q-16 12 -28 -10z" fill="#e0e0e0"/>
  <g stroke="#ffb300" stroke-width="4.5">
    <path d="M52 102 v8 M52 110 l-7 7 M52 110 l7 7"/>
    <path d="M76 102 v8 M76 110 l-7 7 M76 110 l7 7"/></g>`;

ART.hipopotamo = `
  <ellipse cx="60" cy="62" rx="40" ry="32" fill="#a98bc4"/>
  <circle cx="30" cy="34" r="9" fill="#a98bc4"/><circle cx="90" cy="34" r="9" fill="#a98bc4"/>
  <ellipse cx="60" cy="84" rx="28" ry="18" fill="#c9aede"/>
  <ellipse cx="49" cy="80" rx="4" ry="5" fill="#241f3d"/><ellipse cx="71" cy="80" rx="4" ry="5" fill="#241f3d"/>
  <path d="M44 92 q16 10 32 0" stroke-width="3"/>
  <circle cx="45" cy="54" r="4.5" fill="#241f3d"/><circle cx="75" cy="54" r="4.5" fill="#241f3d"/>`;

ART.helice = `
  <g fill="#6ec6ff">
    <ellipse cx="60" cy="30" rx="10" ry="26"/><ellipse cx="60" cy="94" rx="10" ry="26"/>
    <ellipse cx="30" cy="62" rx="26" ry="10"/><ellipse cx="90" cy="62" rx="26" ry="10"/></g>
  <circle cx="60" cy="62" r="14" fill="#ff5f6d"/>
  <circle cx="60" cy="62" r="5" fill="#fdfdff"/>`;

ART.ilha = `
  <path d="M4 96 q16 -8 30 0 t30 0 t30 0 t22 0 v14 H4z" fill="#4fc3f7"/>
  <path d="M18 96 q42 -26 84 0z" fill="#ffe0a3"/>
  <path d="M60 92 V56" stroke-width="6" stroke="#8d6e63"/>
  <path d="M60 56 q-24 -12 -30 6 q20 -6 30 -6z" fill="#43a047"/>
  <path d="M60 56 q24 -12 30 6 q-20 -6 -30 -6z" fill="#43a047"/>
  <path d="M60 56 q-6 -22 -22 -26 q10 14 22 26z" fill="#66bb6a"/>
  <circle cx="96" cy="26" r="12" fill="#ffd23f"/>`;

ART.igreja = `
  <path d="M42 54 L42 104 H98 V54 L70 32z" fill="#ffe0b2"/>
  <path d="M22 60 V104 H42 V60 L32 22z" fill="#fdd0a2"/>
  <path d="M32 22 V6 M26 12 h12" stroke-width="4"/>
  <rect x="60" y="72" width="20" height="32" rx="10" fill="#8d6e63"/>
  <circle cx="70" cy="56" r="8" fill="#7ee8fa"/>
  <path d="M70 48 v16 M62 56 h16" stroke-width="2.5"/>`;

ART.janela = `
  <rect x="18" y="16" width="84" height="88" rx="6" fill="#8d6e63"/>
  <rect x="28" y="26" width="64" height="68" rx="3" fill="#7ee8fa"/>
  <path d="M60 26 V94 M28 60 H92" stroke-width="5"/>
  <path d="M28 26 q14 30 0 68z" fill="#ff6b9d"/>
  <path d="M92 26 q-14 30 0 68z" fill="#ff6b9d"/>
  <circle cx="80" cy="38" r="6" fill="#ffd23f"/>`;

ART.jacare = `
  <path d="M12 76 q40 -22 96 -12 q10 2 8 10 q-2 8 -14 8 H30 q-18 0 -18 -6z" fill="#4caf50"/>
  <path d="M28 74 h64" stroke-width="2.5"/>
  <g fill="#fdfdff" stroke="none">
    <path d="M34 74 l5 8 5 -8z"/><path d="M50 74 l5 8 5 -8z"/><path d="M66 74 l5 8 5 -8z"/><path d="M82 74 l5 8 5 -8z"/></g>
  <circle cx="46" cy="52" r="12" fill="#4caf50"/><circle cx="74" cy="50" r="12" fill="#4caf50"/>
  <circle cx="46" cy="52" r="4.5" fill="#241f3d"/><circle cx="74" cy="50" r="4.5" fill="#241f3d"/>`;

ART.kiwi = `
  <circle cx="60" cy="62" r="44" fill="#8d6e63"/>
  <circle cx="60" cy="62" r="37" fill="#9ccc65"/>
  <ellipse cx="60" cy="62" rx="13" ry="15" fill="#f1f8e9"/>
  <g fill="#241f3d" stroke="none">
    <ellipse cx="60" cy="38" rx="2.6" ry="4"/><ellipse cx="80" cy="48" rx="2.6" ry="4"/>
    <ellipse cx="84" cy="72" rx="2.6" ry="4"/><ellipse cx="66" cy="86" rx="2.6" ry="4"/>
    <ellipse cx="42" cy="82" rx="2.6" ry="4"/><ellipse cx="36" cy="58" rx="2.6" ry="4"/></g>`;

ART.koala = `
  <circle cx="22" cy="46" r="18" fill="#b0bec5"/><circle cx="98" cy="46" r="18" fill="#b0bec5"/>
  <circle cx="22" cy="46" r="10" fill="#eceff1"/><circle cx="98" cy="46" r="10" fill="#eceff1"/>
  <ellipse cx="60" cy="64" rx="34" ry="32" fill="#cfd8dc"/>
  <ellipse cx="60" cy="76" rx="13" ry="11" fill="#455a64"/>
  <circle cx="46" cy="56" r="4.5" fill="#241f3d"/><circle cx="74" cy="56" r="4.5" fill="#241f3d"/>
  <path d="M48 92 q12 8 24 0" stroke-width="2.5"/>`;

ART.lua = `
  <path d="M78 12 a46 46 0 1 0 22 74 A38 38 0 0 1 78 12z" fill="#ffd23f"/>
  <circle cx="66" cy="46" r="4.5" fill="#241f3d"/>
  <path d="M50 62 q12 12 22 2" stroke-width="3"/>
  <g fill="#fff59d"><path d="M22 20 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z"/>
  <path d="M100 100 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z"/></g>`;

ART.leao = `
  <g fill="#e08a2e"><circle cx="60" cy="62" r="46"/></g>
  <g fill="#f0a63c" stroke="none">
    <circle cx="60" cy="14" r="10"/><circle cx="94" cy="28" r="10"/><circle cx="108" cy="62" r="10"/>
    <circle cx="94" cy="96" r="10"/><circle cx="60" cy="110" r="10"/><circle cx="26" cy="96" r="10"/>
    <circle cx="12" cy="62" r="10"/><circle cx="26" cy="28" r="10"/></g>
  <circle cx="60" cy="62" r="46"/>
  <circle cx="60" cy="62" r="31" fill="#ffcc80"/>
  <circle cx="49" cy="56" r="4.5" fill="#241f3d"/><circle cx="71" cy="56" r="4.5" fill="#241f3d"/>
  <path d="M60 68 l-6 5 h12z" fill="#8d5524"/>
  <path d="M60 73 v5 M60 78 q-8 7 -13 1 M60 78 q8 7 13 1" stroke-width="2.5"/>`;

ART.maca = `
  <path d="M60 34 q-30 -14 -40 14 q-10 28 14 52 q12 12 26 0 q14 12 26 0 q24 -24 14 -52 q-10 -28 -40 -14z" fill="#ef4444"/>
  <path d="M60 34 V16" stroke-width="5" stroke="#8d6e63"/>
  <path d="M60 22 q18 -14 30 -4 q-8 16 -30 12z" fill="#4caf50"/>
  <path d="M40 52 q-6 8 -4 18" stroke="#ffffff88" stroke-width="6"/>`;

ART.montanha = `
  <circle cx="94" cy="28" r="13" fill="#ffd23f"/>
  <path d="M4 104 L40 34 L70 82 L86 56 L116 104z" fill="#7986cb"/>
  <path d="M40 34 L26 62 q14 8 28 0z" fill="#fdfdff"/>
  <path d="M86 56 L76 74 q10 6 20 0z" fill="#fdfdff"/>
  <path d="M4 104 h112" stroke-width="4"/>`;

ART.nuvem = `
  <g fill="#fdfdff"><circle cx="42" cy="48" r="20"/><circle cx="70" cy="40" r="24"/>
  <circle cx="92" cy="54" r="17"/><rect x="34" y="48" width="66" height="24" rx="12"/></g>
  <circle cx="60" cy="46" r="3.5" fill="#241f3d"/><circle cx="82" cy="46" r="3.5" fill="#241f3d"/>
  <path d="M64 58 q9 8 16 0" stroke-width="2.5"/>
  <g stroke="#4fc3f7" stroke-width="6">
    <path d="M42 82 v12"/><path d="M62 88 v14"/><path d="M84 82 v12"/></g>`;

ART.navio = `
  <path d="M14 78 h92 l-14 26 H28z" fill="#ef4444"/>
  <path d="M60 74 V16" stroke-width="5" stroke="#8d6e63"/>
  <path d="M60 20 L98 62 H60z" fill="#fdfdff"/>
  <path d="M60 28 L26 62 H60z" fill="#ffd23f"/>
  <path d="M4 104 q14 -8 28 0 t28 0 t28 0 t28 0" stroke="#4fc3f7" stroke-width="5"/>`;

ART.olho = `
  <path d="M8 62 q52 -46 104 0 q-52 46 -104 0z" fill="#fdfdff"/>
  <circle cx="60" cy="62" r="24" fill="#4fc3f7"/>
  <circle cx="60" cy="62" r="11" fill="#241f3d"/>
  <circle cx="52" cy="54" r="5" fill="#fdfdff" stroke="none"/>
  <path d="M8 62 q52 -46 104 0 q-52 46 -104 0z"/>
  <path d="M22 34 l8 10 M60 20 v12 M98 34 l-8 10" stroke-width="4"/>`;

ART.ovo = `
  <path d="M22 74 q-6 -26 16 -34 q10 -22 34 -14 q26 -2 30 22 q18 14 4 32 q-6 20 -30 14 q-24 12 -38 -6 q-14 -2 -16 -14z" fill="#fdfdff"/>
  <circle cx="60" cy="62" r="20" fill="#ffb300"/>
  <circle cx="53" cy="55" r="6" fill="#ffd54f" stroke="none"/>`;

ART.pato = `
  <ellipse cx="58" cy="78" rx="38" ry="26" fill="#ffd23f"/>
  <circle cx="86" cy="46" r="19" fill="#ffd23f"/>
  <path d="M100 44 q18 2 16 10 q-2 8 -18 6z" fill="#ff9800"/>
  <circle cx="88" cy="40" r="4" fill="#241f3d"/>
  <path d="M40 72 q18 -12 34 4 q-16 16 -34 -4z" fill="#ffca28"/>
  <path d="M20 76 q-12 4 -6 14" stroke-width="4"/>`;

ART.peixe = `
  <path d="M58 48 q6 -16 24 -12 q-10 10 -24 12z" fill="#ff7043"/>
  <path d="M58 76 q6 16 24 12 q-10 -10 -24 -12z" fill="#ff7043"/>
  <path d="M96 62 l20 -22 v44z" fill="#ff7043"/>
  <path d="M30 62 q34 -34 66 0 q-32 34 -66 0z" fill="#ff8a65"/>
  <path d="M52 40 q10 22 0 44" stroke-width="2.5"/>
  <path d="M62 66 q12 8 22 0" fill="#ff7043" stroke="none"/>
  <circle cx="43" cy="57" r="5" fill="#241f3d"/>
  <path d="M35 66 q5 4 9 0" stroke-width="2.5"/>
  <g fill="#4fc3f7" stroke="none"><circle cx="20" cy="34" r="6"/><circle cx="9" cy="50" r="4"/></g>`;

ART.queijo = `
  <path d="M10 78 L96 26 l10 8 -8 54z" fill="#ffe082"/>
  <path d="M10 78 L98 88 v14 L10 92z" fill="#ffb300"/>
  <path d="M98 88 l8 -54 v54z" fill="#ffa000"/>
  <path d="M10 78 L96 26 l10 8 -8 54z"/>
  <g fill="#f9a825" stroke="#c77800" stroke-width="2">
    <circle cx="38" cy="70" r="7"/><circle cx="62" cy="58" r="8"/><circle cx="80" cy="44" r="5"/>
    <circle cx="58" cy="80" r="5"/></g>`;

ART.quadrado = `
  <rect x="20" y="20" width="80" height="80" rx="6" fill="#6ec6ff"/>
  <rect x="34" y="34" width="52" height="52" rx="4" fill="#ffd23f"/>
  <rect x="48" y="48" width="24" height="24" rx="3" fill="#ff5f6d"/>`;

ART.rato = `
  <circle cx="26" cy="40" r="18" fill="#b0bec5"/><circle cx="26" cy="40" r="10" fill="#f8bbd0"/>
  <circle cx="88" cy="34" r="15" fill="#b0bec5"/><circle cx="88" cy="34" r="8" fill="#f8bbd0"/>
  <ellipse cx="58" cy="66" rx="34" ry="28" fill="#cfd8dc"/>
  <path d="M24 84 q-16 12 -6 20" stroke-width="4"/>
  <circle cx="46" cy="60" r="4.5" fill="#241f3d"/><circle cx="70" cy="62" r="4.5" fill="#241f3d"/>
  <circle cx="88" cy="76" r="6" fill="#f06292"/>
  <path d="M78 72 h-24 M78 82 h-24" stroke-width="2"/>`;

ART.rosa = `
  <path d="M60 104 V56" stroke-width="5" stroke="#4caf50"/>
  <path d="M60 84 q-22 -8 -26 8 q20 8 26 -8z" fill="#4caf50"/>
  <path d="M60 70 q22 -8 26 8 q-20 8 -26 -8z" fill="#4caf50"/>
  <circle cx="60" cy="42" r="30" fill="#e91e63"/>
  <path d="M60 42 m-20 0 a20 20 0 1 1 12 18 a13 13 0 1 1 -3 -22 a7 7 0 1 1 5 8"
        stroke="#ad1457" stroke-width="4"/>`;

ART.sol = `
  <g stroke="#ffb300" stroke-width="7">
    <path d="M60 6 v14 M60 104 v14 M6 62 h14 M100 62 h14
             M22 24 l10 10 M88 90 l10 10 M98 24 l-10 10 M32 90 l-10 10"/></g>
  <circle cx="60" cy="62" r="34" fill="#ffd23f"/>
  <circle cx="48" cy="56" r="4.5" fill="#241f3d"/><circle cx="72" cy="56" r="4.5" fill="#241f3d"/>
  <path d="M46 72 q14 14 28 0" stroke-width="3.5"/>
  <circle cx="38" cy="72" r="6" fill="#ff8a80" stroke="none" opacity=".8"/>
  <circle cx="82" cy="72" r="6" fill="#ff8a80" stroke="none" opacity=".8"/>`;

ART.sapo = `
  <circle cx="38" cy="34" r="17" fill="#66bb6a"/><circle cx="82" cy="34" r="17" fill="#66bb6a"/>
  <circle cx="38" cy="34" r="9" fill="#fdfdff"/><circle cx="82" cy="34" r="9" fill="#fdfdff"/>
  <circle cx="38" cy="35" r="4.5" fill="#241f3d"/><circle cx="82" cy="35" r="4.5" fill="#241f3d"/>
  <ellipse cx="60" cy="72" rx="40" ry="30" fill="#4caf50"/>
  <path d="M26 74 q34 24 68 0" stroke-width="3.5"/>
  <circle cx="34" cy="62" r="3" fill="#2e7d32" stroke="none"/>
  <circle cx="86" cy="62" r="3" fill="#2e7d32" stroke="none"/>`;

ART.tartaruga = `
  <ellipse cx="26" cy="82" rx="12" ry="9" fill="#8bc34a"/><ellipse cx="94" cy="82" rx="12" ry="9" fill="#8bc34a"/>
  <circle cx="100" cy="52" r="15" fill="#8bc34a"/>
  <path d="M20 58 q40 -34 80 0 q-40 20 -80 0z" fill="#a1887f"/>
  <ellipse cx="60" cy="62" rx="42" ry="28" fill="#8d6e63"/>
  <path d="M20 58 q40 -34 80 0 q-40 20 -80 0z" fill="#795548"/>
  <g stroke-width="2.5"><path d="M60 34 V60 M34 50 l14 12 M86 50 l-14 12 M40 74 l12 -12 M80 74 l-12 -12"/></g>
  <circle cx="106" cy="48" r="3.5" fill="#241f3d"/>`;

ART.trem = `
  <rect x="10" y="52" width="54" height="38" rx="6" fill="#ef4444"/>
  <rect x="64" y="34" width="44" height="56" rx="6" fill="#ef4444"/>
  <rect x="74" y="44" width="24" height="20" rx="3" fill="#7ee8fa"/>
  <rect x="20" y="62" width="16" height="16" rx="3" fill="#ffd23f"/>
  <rect x="4" y="88" width="112" height="8" rx="4" fill="#455a64"/>
  <circle cx="30" cy="98" r="10" fill="#37474f"/><circle cx="60" cy="98" r="10" fill="#37474f"/>
  <circle cx="94" cy="98" r="10" fill="#37474f"/>
  <rect x="74" y="18" width="14" height="18" rx="3" fill="#455a64"/>
  <g fill="#eceff1" stroke="none" opacity=".9">
    <circle cx="82" cy="12" r="8"/><circle cx="66" cy="6" r="6"/><circle cx="96" cy="4" r="5"/></g>`;

ART.uva = `
  <path d="M60 32 V16 q0 -8 12 -10" stroke-width="4" stroke="#8d6e63"/>
  <path d="M72 8 q18 -6 26 6 q-18 8 -26 -6z" fill="#4caf50"/>
  <g fill="#8e44ad">
    <circle cx="60" cy="40" r="13"/><circle cx="42" cy="58" r="13"/><circle cx="78" cy="58" r="13"/>
    <circle cx="60" cy="64" r="13"/><circle cx="30" cy="80" r="13"/><circle cx="90" cy="80" r="13"/>
    <circle cx="60" cy="88" r="13"/><circle cx="45" cy="100" r="12"/><circle cx="76" cy="100" r="12"/></g>`;

ART.urso = `
  <circle cx="24" cy="34" r="16" fill="#8d6e63"/><circle cx="96" cy="34" r="16" fill="#8d6e63"/>
  <circle cx="24" cy="34" r="8" fill="#bcaaa4"/><circle cx="96" cy="34" r="8" fill="#bcaaa4"/>
  <circle cx="60" cy="66" r="36" fill="#a1887f"/>
  <ellipse cx="60" cy="80" rx="20" ry="15" fill="#d7ccc8"/>
  <ellipse cx="60" cy="72" rx="7" ry="5" fill="#241f3d"/>
  <path d="M60 77 v6 M60 83 q-8 6 -13 0 M60 83 q8 6 13 0" stroke-width="2.5"/>
  <circle cx="46" cy="56" r="4.5" fill="#241f3d"/><circle cx="74" cy="56" r="4.5" fill="#241f3d"/>`;

ART.vaca = `
  <path d="M16 44 q-12 -4 -12 10 q0 12 14 10z" fill="#f8bbd0"/>
  <path d="M104 44 q12 -4 12 10 q0 12 -14 10z" fill="#f8bbd0"/>
  <path d="M28 28 q-8 -14 4 -16 q10 -2 10 12z" fill="#ffe0b2"/>
  <path d="M92 28 q8 -14 -4 -16 q-10 -2 -10 12z" fill="#ffe0b2"/>
  <ellipse cx="60" cy="60" rx="36" ry="32" fill="#fdfdff"/>
  <circle cx="40" cy="42" r="9" fill="#241f3d" stroke="none"/>
  <circle cx="84" cy="52" r="7" fill="#241f3d" stroke="none"/>
  <circle cx="46" cy="58" r="4.5" fill="#241f3d"/><circle cx="72" cy="58" r="4.5" fill="#241f3d"/>
  <ellipse cx="60" cy="84" rx="24" ry="17" fill="#f8bbd0"/>
  <circle cx="51" cy="82" r="3.5" fill="#c2185b" stroke="none"/>
  <circle cx="69" cy="82" r="3.5" fill="#c2185b" stroke="none"/>`;

ART.violao = `
  <path d="M60 40 q22 0 22 20 q0 12 -8 18 q-10 8 -10 18 q0 14 -14 14 q-14 0 -14 -14
           q0 -10 -10 -18 q-8 -6 -8 -18 q0 -20 22 -20z" fill="#c98a3c" transform="translate(0,-2)"/>
  <rect x="54" y="4" width="12" height="42" rx="3" fill="#8d6e63"/>
  <rect x="50" y="0" width="20" height="12" rx="3" fill="#6d4c41"/>
  <circle cx="60" cy="72" r="12" fill="#4e342e"/>
  <g stroke="#fdfdff" stroke-width="1.6"><path d="M55 46 V104 M60 46 V104 M65 46 V104"/></g>`;

ART.waffle = `
  <rect x="18" y="24" width="84" height="76" rx="12" fill="#e0a458"/>
  <g stroke="#a86e2e" stroke-width="4">
    <path d="M18 48 h84 M18 72 h84 M42 24 v76 M66 24 v76 M90 24 v76"/></g>
  <rect x="18" y="24" width="84" height="76" rx="12"/>
  <rect x="46" y="36" width="30" height="22" rx="4" fill="#fff59d"/>
  <path d="M60 36 q-8 -14 6 -18 q10 -3 12 6 q2 10 -8 12" fill="#ef5350"/>
  <path d="M60 22 v-8" stroke="#43a047" stroke-width="4"/>`;

ART.wifi = `
  <g stroke="#4fc3f7" stroke-width="11" stroke-linecap="round" fill="none">
    <path d="M18 56 q42 -44 84 0"/>
    <path d="M34 76 q26 -26 52 0"/>
    <path d="M48 94 q12 -12 24 0"/></g>
  <circle cx="60" cy="106" r="8" fill="#4fc3f7"/>`;

ART.xicara = `
  <path d="M26 48 h58 v26 q0 18 -18 18 H44 q-18 0 -18 -18z" fill="#fdfdff"/>
  <path d="M84 54 q20 -4 20 12 q0 16 -20 12" fill="none" stroke-width="7" stroke="#fdfdff"/>
  <path d="M84 54 q20 -4 20 12 q0 16 -20 12"/>
  <path d="M26 48 h58 v26 q0 18 -18 18 H44 q-18 0 -18 -18z"/>
  <ellipse cx="55" cy="98" rx="38" ry="8" fill="#e0e0e0"/>
  <path d="M40 60 h30" stroke="#ff5f6d" stroke-width="5"/>
  <g stroke="#b0bec5" stroke-width="4">
    <path d="M42 36 q6 -8 0 -16"/><path d="M56 32 q6 -8 0 -16"/><path d="M70 36 q6 -8 0 -16"/></g>`;

ART.xadrez = `
  <rect x="16" y="16" width="88" height="88" rx="6" fill="#fdfdff"/>
  <g fill="#241f3d" stroke="none">
    <rect x="16" y="16" width="22" height="22"/><rect x="60" y="16" width="22" height="22"/>
    <rect x="38" y="38" width="22" height="22"/><rect x="82" y="38" width="22" height="22"/>
    <rect x="16" y="60" width="22" height="22"/><rect x="60" y="60" width="22" height="22"/>
    <rect x="38" y="82" width="22" height="22"/><rect x="82" y="82" width="22" height="22"/></g>
  <rect x="16" y="16" width="88" height="88" rx="6"/>`;

ART.yoga = `
  <ellipse cx="60" cy="104" rx="46" ry="8" fill="#a78bfa"/>
  <path d="M22 96 q10 -18 38 -18 q28 0 38 18 q-14 6 -38 6 q-24 0 -38 -6z" fill="#f8a5c2"/>
  <path d="M60 46 q-16 2 -18 20 q-2 16 18 16 q20 0 18 -16 q-2 -18 -18 -20z" fill="#7ee8fa"/>
  <path d="M46 58 q-22 8 -22 30" stroke="#ffc89b" stroke-width="10"/>
  <path d="M74 58 q22 8 22 30" stroke="#ffc89b" stroke-width="10"/>
  <circle cx="24" cy="88" r="7" fill="#ffc89b"/><circle cx="96" cy="88" r="7" fill="#ffc89b"/>
  <circle cx="60" cy="30" r="16" fill="#ffc89b"/>
  <path d="M46 24 q14 -14 28 0 q-14 -4 -28 0z" fill="#5d4037"/>
  <path d="M53 32 q2 3 4 0 M63 32 q2 3 4 0" stroke-width="2.5"/>
  <path d="M54 38 q6 5 12 0" stroke-width="2.5"/>`;

ART.yeti = `
  <ellipse cx="26" cy="76" rx="12" ry="20" fill="#dceefb"/>
  <ellipse cx="94" cy="76" rx="12" ry="20" fill="#dceefb"/>
  <ellipse cx="60" cy="82" rx="32" ry="28" fill="#eaf6ff"/>
  <ellipse cx="42" cy="106" rx="15" ry="9" fill="#cfe4f5"/>
  <ellipse cx="78" cy="106" rx="15" ry="9" fill="#cfe4f5"/>
  <path d="M34 44 q-3 -15 10 -13 q0 -16 14 -12 q7 -13 18 -5 q13 3 10 16 q7 10 -3 18z" fill="#f2faff"/>
  <circle cx="60" cy="46" r="25" fill="#f2faff"/>
  <ellipse cx="60" cy="55" rx="17" ry="13" fill="#dceefb"/>
  <ellipse cx="60" cy="50" rx="5.5" ry="4" fill="#607d8b"/>
  <path d="M52 60 q8 8 16 0" stroke-width="3"/>
  <circle cx="50" cy="38" r="4" fill="#241f3d"/><circle cx="70" cy="38" r="4" fill="#241f3d"/>`;

ART.zebra = `
  <path d="M28 26 L32 6 L48 22z" fill="#fdfdff"/><path d="M92 26 L88 6 L72 22z" fill="#fdfdff"/>
  <clipPath id="cZ"><ellipse cx="60" cy="64" rx="34" ry="36"/></clipPath>
  <ellipse cx="60" cy="64" rx="34" ry="36" fill="#fdfdff"/>
  <g clip-path="url(#cZ)" fill="#241f3d" stroke="none">
    <path d="M26 30 q16 10 6 22 q-14 -6 -18 -10z"/>
    <path d="M94 30 q-16 10 -6 22 q14 -6 18 -10z"/>
    <path d="M52 28 h10 l-4 22 h-8z"/><path d="M70 30 h9 l-6 20 h-8z"/>
    <path d="M22 66 h20 l-4 12 h-20z"/><path d="M98 66 h-20 l4 12 h20z"/></g>
  <ellipse cx="60" cy="64" rx="34" ry="36"/>
  <ellipse cx="60" cy="86" rx="18" ry="14" fill="#cfd8dc"/>
  <circle cx="53" cy="84" r="3" fill="#241f3d"/><circle cx="67" cy="84" r="3" fill="#241f3d"/>
  <circle cx="45" cy="56" r="4.5" fill="#241f3d"/><circle cx="75" cy="56" r="4.5" fill="#241f3d"/>`;

ART.zero = `
  <ellipse cx="60" cy="62" rx="34" ry="46" stroke="#a78bfa" stroke-width="18"/>
  <ellipse cx="60" cy="62" rx="43" ry="55"/><ellipse cx="60" cy="62" rx="25" ry="37"/>
  <circle cx="60" cy="62" r="10" fill="#ffd23f" stroke="none"/>`;

/* --------------------------- BANCO DE RESERVA ---------------------------
   Desenhos prontos que hoje não estão em WORDS. GIRAFA e IOIÔ saíram por
   coerência fonema–grafema (girafa soa /ʒ/, não /g/; ioiô se escreve com I).
   WATT saiu por coerência também: "váti" começa em /v/, e a letra W ensina /w/.
   Ficam aqui para outros jogos aproveitarem. */

ART.girafa = `
  <path d="M45 116 V48 h20 v68" fill="#f2b845"/>
  <ellipse cx="46" cy="30" rx="10" ry="6" fill="#f2b845" transform="rotate(-30 46 30)"/>
  <ellipse cx="88" cy="30" rx="10" ry="6" fill="#f2b845" transform="rotate(30 88 30)"/>
  <path d="M58 20 v-8 M76 20 v-8" stroke-width="4"/>
  <circle cx="58" cy="10" r="4.5" fill="#8d6e63"/><circle cx="76" cy="10" r="4.5" fill="#8d6e63"/>
  <ellipse cx="67" cy="34" rx="25" ry="18" fill="#f2b845"/>
  <ellipse cx="82" cy="42" rx="11" ry="9" fill="#e09a2e"/>
  <circle cx="80" cy="40" r="2" fill="#241f3d" stroke="none"/>
  <circle cx="88" cy="44" r="2" fill="#241f3d" stroke="none"/>
  <circle cx="60" cy="30" r="4" fill="#241f3d"/>
  <g fill="#a3682a" stroke="none">
    <circle cx="46" cy="62" r="6"/><circle cx="62" cy="76" r="6"/><circle cx="46" cy="92" r="6"/>
    <circle cx="62" cy="104" r="5"/><circle cx="60" cy="54" r="5"/></g>`;

ART.ioio = `
  <path d="M60 8 q10 26 0 34" stroke-width="4"/>
  <circle cx="60" cy="70" r="40" fill="#ff5f6d"/>
  <circle cx="60" cy="70" r="26" fill="#ffd23f"/>
  <circle cx="60" cy="70" r="12" fill="#fdfdff"/>
  <circle cx="60" cy="70" r="4" fill="#241f3d"/>`;

ART.watt = `
  <g stroke="#ffb300" stroke-width="6">
    <path d="M60 6 v10 M20 24 l8 8 M100 24 l-8 8 M6 62 h11 M103 62 h11"/></g>
  <path d="M60 18 q-31 0 -31 29 q0 17 13 26 q6 4 6 11 h24 q0 -7 6 -11 q13 -9 13 -26 q0 -29 -31 -29z" fill="#ffe082"/>
  <path d="M48 52 q6 -12 12 0 q6 12 12 0" stroke="#ff9800" stroke-width="3.5"/>
  <rect x="45" y="84" width="30" height="11" rx="4" fill="#b0bec5"/>
  <rect x="47" y="95" width="26" height="10" rx="4" fill="#90a4ae"/>
  <path d="M52 105 h16 v6 q0 4 -8 4 q-8 0 -8 -4z" fill="#78909c"/>`;
