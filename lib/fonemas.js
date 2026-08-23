/* ============================================================================
   fonemas.js — tabelas de alfabetização em português do Brasil.
   Reutilizável por qualquer jogo de letra/leitura. Depende de: nada.

   POR QUE O SOM E NÃO O NOME DA LETRA
   O nome atrapalha a decodificação. Em português os nomes se dividem em dois
   tipos e só um deles é inofensivo:
     • CV  — "bê", "cê", "dê", "pê", "tê": o som vem NA FRENTE. Atrapalha pouco.
     • VC  — "éfe", "éle", "ême", "êne", "érre", "ésse": o som vem DEPOIS.
             A criança que junta "éfe + a" chega em "efea", nunca em "fa".
   Por isso o padrão dos jogos é falar o FONEMA. O nome fica como alternativa
   (botão 🔤) para quem quiser ensinar o alfabeto antes.
   ========================================================================== */

/* NOMES DAS LETRAS — ajuste aqui se alguma soar errada na sua voz.
   Não é o nome "correto" que está escrito, e sim COMO deve ser lido.
   Truque: um "h" mudo no fim força o sintetizador a ler foneticamente, em vez
   de consultar a tabela interna de nomes de letra — que em várias vozes traz
   "é" no lugar de "ê" e "ó" no lugar de "ô". */
const LETTER_NAME = {
  A:"á", B:"bê", C:"cê", D:"dê", E:"êh", F:"éfe", G:"gê", H:"agá", I:"i",
  J:"jota", K:"cá", L:"éle", M:"ême", N:"êne", O:"ôh", P:"pê", Q:"quê",
  R:"érre", S:"ésse", T:"tê", U:"u", V:"vê", W:"dáblio", X:"xis",
  Y:"ípsilon", Z:"zê"
};

/* SOM DAS LETRAS — é isto que os jogos falam por padrão.

   A REGRA QUE MANDA EM TUDO AQUI: CADA SOM, UMA VEZ SÓ.
   Repetição não ensina — cansa e polui. A criança precisa ouvir o alvo limpo
   e uma vez, não três. Então cada letra fala a MENOR UNIDADE HONESTA do seu
   fonema, e para por aí:

     • VOGAIS → uma vogal, acentuada. "á", não "ááá".
       O acento agudo não é enfeite, resolve dois problemas:
       1. O método fônico brasileiro parte do som ABERTO (/a/, /ɛ/, /i/, /ɔ/,
          /u/) — é o mais audível e o que menos se confunde com o vizinho.
       2. Vogal átona reduz em português. Solta e sem acento, a voz lê "o"
          como o artigo (= [u]) e "e" como a conjunção (= [i]) — era o bug do
          "O com som de U". Vogal acentuada é tônica e não tem para onde
          reduzir.

     • CONTÍNUAS (F,M,N,S,V,Z) → só o som esticado ("mmmm"). Um som sustentado
       é UM fonema, não repetição: dá para segurar /m/ o tempo que quiser sem
       nunca virar sílaba. Não emende "ma, mo" depois — aí sim seriam três
       /m/ seguidos. A sílaba a criança encontra sozinha na palavra, no
       segundo toque. L e R também são contínuas, mas "llll"/"rrrr" a voz
       sintetizada não sustenta: soletra. Essas duas ficam na sílaba.

     • OCLUSIVAS (B,D,P,T,C,G,K,Q) → não existem sem vogal. Qualquer material
       que prometa "só o /b/" está apoiando numa vogal escondida. Em vez de
       fingir, usamos DUAS sílabas com vogais DIFERENTES ("ba, bo"). Isso não
       contraria a regra de cima: é a menor unidade honesta possível, e o par
       existe para VARIAR a vogal — o que sobra igual entre as duas é a
       consoante, e é ela que a criança tem que isolar. Duas sílabas IGUAIS
       ("ôh, ôh") não isolam nada; isso é repetição, e é proibido.

     • H → tratado com honestidade: sozinho não tem som.
     • ipa → o que aparece escrito na tela, entre barras.
   `fala` é uma lista; cada item vira uma utterance, com pausa entre elas.
   Hoje toda letra tem UM item só — se você for pôr um segundo, pergunte antes
   se ele não está repetindo o fonema que o primeiro já deu. */
const SOM = {
  A:{ipa:"/a/",    fala:["á"]},
  B:{ipa:"/b/",    fala:["ba, bo"]},
  C:{ipa:"/k/",    fala:["ca, co"]},
  D:{ipa:"/d/",    fala:["da, do"]},
  E:{ipa:"/ɛ/",    fala:["é"]},
  F:{ipa:"/f/",    fala:["ffff"]},
  G:{ipa:"/g/",    fala:["ga, go"]},
  H:{ipa:"(mudo)", fala:["o agá sozinho não tem som"]},
  I:{ipa:"/i/",    fala:["i"]},
  J:{ipa:"/ʒ/",    fala:["ja, jo"]},
  K:{ipa:"/k/",    fala:["ca, co"]},   // mesmo fonema do C — é a verdade, não erro
  L:{ipa:"/l/",    fala:["la, lo"]},
  M:{ipa:"/m/",    fala:["mmmm"]},
  N:{ipa:"/n/",    fala:["nnnn"]},
  O:{ipa:"/ɔ/",    fala:["ó"]},
  P:{ipa:"/p/",    fala:["pa, po"]},
  /* Q em português nunca aparece sem o U. "qua" traz um /kw/ que embaralha o
     fonema; "que, qui" deixa o /k/ limpo. */
  Q:{ipa:"/k/",    fala:["que, qui"]},
  R:{ipa:"/ʁ/",    fala:["ra, ro"]},   // R inicial é o forte, de RATO e ROSA
  S:{ipa:"/s/",    fala:["ssss"]},
  T:{ipa:"/t/",    fala:["ta, to"]},
  U:{ipa:"/u/",    fala:["u"]},
  V:{ipa:"/v/",    fala:["vvvv"]},
  W:{ipa:"/w/",    fala:["o dáblio soa como u"]},
  X:{ipa:"/ʃ/",    fala:["xa, xe"]},
  Y:{ipa:"/i/",    fala:["o ípsilon soa como i"]},
  Z:{ipa:"/z/",    fala:["zzzz"]}
};

/* Grafia fonética para o sintetizador pt-BR. Palavras estrangeiras precisam
   ser escritas "à brasileira", senão a voz soletra ou põe sotaque errado. */
const SPEAK_AS = {
  "WAFFLE":"uáfel", "WI-FI":"uái fái", "KIWI":"quiui", "KOALA":"coala",
  "YOGA":"ioga", "YETI":"iéti"
};
const say = w => SPEAK_AS[w] || w;
