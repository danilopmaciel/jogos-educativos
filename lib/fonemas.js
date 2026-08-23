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

     • VOGAIS → som básico, prolongado, SEMPRE COM ACENTO AGUDO.
       Duas razões, e a segunda é a que dói:
       1. O método fônico brasileiro parte do som ABERTO da vogal (/a/, /ɛ/,
          /i/, /ɔ/, /u/). É o mais audível e o que menos se confunde com o
          vizinho — /ɛ/ não vira /i/, /ɔ/ não vira /u/.
       2. Vogal átona em português reduz. Escrita solta e sem acento, a voz
          sintetizada lê "o" como o artigo (= [u]) e "e" como a conjunção
          (= [i]). Era exatamente o bug do "O com som de U". "ó" e "é" são
          tônicos por definição de acento: a voz não tem para onde reduzir.

     • CONTÍNUAS (F,M,N,S,V,Z) → o som esticado, do jeito clássico ("mmmm"),
       e depois em sílaba. L e R também são contínuas, mas "llll"/"rrrr" a voz
       sintetizada não sustenta — soletra. Ficam só na sílaba.

     • OCLUSIVAS (B,D,P,T,C,G,K,Q) → não existem sem vogal. Qualquer material
       que prometa "só o /b/" está apoiando numa vogal escondida. Em vez de
       fingir, usamos duas sílabas com vogais DIFERENTES ("ba, bo"): o que se
       repete entre as duas é justamente a consoante, e é isso que a criança
       tem que isolar. Repetir a MESMA sílaba duas vezes ("ôh, ôh") não isola
       nada — não faça isso.

     • H → tratado com honestidade: sozinho não tem som.
     • ipa → o que aparece escrito na tela, entre barras.
   `fala` é uma lista; cada item vira uma utterance, com pausa entre elas. */
const SOM = {
  A:{ipa:"/a/",    fala:["ááá"]},
  B:{ipa:"/b/",    fala:["ba, bo"]},
  C:{ipa:"/k/",    fala:["ca, co"]},
  D:{ipa:"/d/",    fala:["da, do"]},
  E:{ipa:"/ɛ/",    fala:["ééé"]},
  F:{ipa:"/f/",    fala:["ffff","fa, fo"]},
  G:{ipa:"/g/",    fala:["ga, go"]},
  H:{ipa:"(mudo)", fala:["o agá sozinho não tem som"]},
  I:{ipa:"/i/",    fala:["iii"]},
  J:{ipa:"/ʒ/",    fala:["ja, jo"]},
  K:{ipa:"/k/",    fala:["ca, co"]},   // mesmo fonema do C — é a verdade, não erro
  L:{ipa:"/l/",    fala:["la, lo"]},
  M:{ipa:"/m/",    fala:["mmmm","ma, mo"]},
  N:{ipa:"/n/",    fala:["nnnn","na, no"]},
  O:{ipa:"/ɔ/",    fala:["óóó"]},
  P:{ipa:"/p/",    fala:["pa, po"]},
  /* Q em português nunca aparece sem o U. "qua" traz um /kw/ que embaralha o
     fonema; "que, qui" deixa o /k/ limpo. */
  Q:{ipa:"/k/",    fala:["que, qui"]},
  R:{ipa:"/ʁ/",    fala:["ra, ro"]},   // R inicial é o forte, de RATO e ROSA
  S:{ipa:"/s/",    fala:["ssss","sa, so"]},
  T:{ipa:"/t/",    fala:["ta, to"]},
  U:{ipa:"/u/",    fala:["uuu"]},
  V:{ipa:"/v/",    fala:["vvvv","va, vo"]},
  W:{ipa:"/w/",    fala:["o dáblio soa como u"]},
  X:{ipa:"/ʃ/",    fala:["xa, xe"]},
  Y:{ipa:"/i/",    fala:["o ípsilon soa como i"]},
  Z:{ipa:"/z/",    fala:["zzzz","za, zo"]}
};

/* Grafia fonética para o sintetizador pt-BR. Palavras estrangeiras precisam
   ser escritas "à brasileira", senão a voz soletra ou põe sotaque errado. */
const SPEAK_AS = {
  "WAFFLE":"uáfel", "WI-FI":"uái fái", "KIWI":"quiui", "KOALA":"coala",
  "YOGA":"ioga", "YETI":"iéti"
};
const say = w => SPEAK_AS[w] || w;
