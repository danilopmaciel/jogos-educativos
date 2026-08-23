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
     • vogais            → som prolongado ("ááá")
     • contínuas (F,M,N,S,V,Z) → o som esticado, do jeito clássico ("mmmm")
     • oclusivas (B,D,P,T,C,G,K,Q) → não existem sem vogal. Qualquer material
       que prometa "só o /b/" está apoiando numa vogal escondida. Em vez de
       fingir, usamos duas sílabas com vogais diferentes ("ba, bo"): o que se
       repete entre as duas é justamente a consoante.
     • H → tratado com honestidade: sozinho não tem som.
     • ipa → o que aparece escrito na tela, entre barras.
   `fala` é uma lista; cada item vira uma utterance, com pausa entre elas. */
const SOM = {
  A:{ipa:"/a/",    fala:["ááá"]},
  B:{ipa:"/b/",    fala:["ba, bo"]},
  C:{ipa:"/k/",    fala:["ca, co"]},
  D:{ipa:"/d/",    fala:["da, do"]},
  E:{ipa:"/e/",    fala:["êh, êh"]},
  F:{ipa:"/f/",    fala:["ffff","fa, fo"]},
  G:{ipa:"/g/",    fala:["ga, go"]},
  H:{ipa:"(mudo)", fala:["o agá sozinho não tem som"]},
  I:{ipa:"/i/",    fala:["iii"]},
  J:{ipa:"/ʒ/",    fala:["ja, jo"]},
  K:{ipa:"/k/",    fala:["ca, co"]},
  L:{ipa:"/l/",    fala:["la, lo"]},
  M:{ipa:"/m/",    fala:["mmmm","ma, mo"]},
  N:{ipa:"/n/",    fala:["nnnn","na, no"]},
  O:{ipa:"/o/",    fala:["ôh, ôh"]},
  P:{ipa:"/p/",    fala:["pa, po"]},
  Q:{ipa:"/k/",    fala:["qua, que"]},
  R:{ipa:"/ʁ/",    fala:["ra, ro"]},
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
  "WATT":"váti", "WI-FI":"uái fái", "KIWI":"quiui", "KOALA":"coala",
  "YOGA":"ioga", "YETI":"iéti"
};
const say = w => SPEAK_AS[w] || w;
