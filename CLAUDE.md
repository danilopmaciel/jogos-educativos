# Jogos para Aprender — contexto do projeto

Coleção de jogos de teclado para crianças pequenas em fase de alfabetização.
Inspirado no tinyfingers.net, mas com conteúdo dirigido ao aprendizado em vez
de reações aleatórias.

## Restrições que valem mais que preferências de estilo

- **HTML/CSS/JS puro. Sem build, sem npm, sem framework.** O jogo tem que abrir
  com duplo clique num `file://`, offline, no computador de qualquer pessoa.
- **Scripts clássicos, nunca `type="module"`.** Módulos ES são bloqueados por
  CORS em `file://`. Se você trocar para módulos, o jogo para de abrir sem
  servidor. Já foi decidido; não mude sem um motivo forte.
- **Sem CDN, sem fonte externa, sem imagem externa.** Todo desenho é SVG inline
  e todo som é sintetizado no Web Audio.
- **Público é criança pequena.** Nada de texto denso, nada de penalidade, nada
  de "errado". Toda tecla faz alguma coisa boa acontecer.

## Estrutura

```
index.html                      menu dos jogos
lib/            biblioteca compartilhada — carregue nesta ordem:
  base.js         $, norm, rnd, pick, PALETTE, svgWrap, shiftBg
  fonemas.js      LETTER_NAME, SOM, SPEAK_AS, say
  audio.js        tone/sons + motor de voz (voiceOn, speakSeq, speak)
  particulas.js   fogos, confete, estrelas, riscos, rainbowFlash
  maos.js         handsSVG(0..10) — luva de desenho com os dedos
  trava.js        trava de criança: travar/destravar/travaToggle, travaOn
  controles.js    teclado virtual e gamepad touch para celular/tablet
jogos/
  painel-sensorial/
    index.html      painel sensorial Montessori estilo Pok Pok para 2 e 3 anos
  alfabeto-magico/
    index.html      HTML, CSS e lógica do jogo
    conteudo.js     WORDS, ONSET e os 54 desenhos (ART)
  meteoros/
    index.html      jogo espacial clássico de nave e meteoros
```

`lib/trava.js` não espera nada no HTML — cria o próprio aviso e avisa mudanças
pelo evento `trava` em `document` (`detail:{on, forte}`).
`lib/particulas.js` espera `<canvas id="fx">` e `<div id="flash">` na página.
`lib/base.js` espera `<div id="bg">`. `lib/audio.js` usa `<select id="selVoice">`
se existir.

## Decisões pedagógicas (não desfaça sem conversar)

Estas escolhas vieram de discussão com o usuário e têm razão de ser:

1. **O jogo fala o SOM da letra, não o nome.** O nome atrapalha a decodificação.
   Em português os nomes CV ("bê", "pê") são inofensivos porque o som vem na
   frente, mas os VC ("éfe", "éle", "ême", "êne", "érre", "ésse") põem o som
   depois da vogal: quem junta "éfe + a" chega em "efea", nunca em "fa".
   Existe um botão 🔤 que alterna para o modo nome, como alternativa.

2. **Oclusivas não são faladas isoladas.** /b/, /p/, /t/, /d/, /g/, /k/ não
   existem sem vogal. Em vez de fingir, `SOM` usa duas sílabas com vogais
   diferentes ("ba, bo"): o invariante entre as duas é a consoante.

3. **Nada de "M de Maçã".** Isso ensina associação, não leitura. No lugar
   entra síntese (*blending*): o ataque UMA vez e a palavra emendada
   ("ma, maçã"), com a letra inicial destacada em amarelo na tela. É o
   movimento que a leitura exige — da parte para o todo.

4. **Coerência fonema–grafema.** As duas palavras de uma mesma letra têm sempre
   o mesmo som inicial. Por isso G é GATO/GALINHA, não GIRAFA (que soa /ʒ/).
   Ao acrescentar palavras, respeite isso.

5. **Vogal vai sempre acentuada** — em `SOM` e em `ONSET`. O método fônico
   brasileiro parte do som aberto (/a/, /ɛ/, /i/, /ɔ/, /u/), e há um motivo
   técnico junto: vogal átona reduz em português, e a voz sintetizada lê "o"
   solto como o artigo (= [u]) e "e" solto como a conjunção (= [i]). Foi assim
   que o O passou a soar como U. "ó" e "é" são tônicos por definição e não têm
   para onde reduzir. Nunca escreva um `fala` ou `ONSET` de vogal sem acento.

6. **Cada som, uma vez só.** Vale para a tabela `SOM`, para o `ONSET` e para
   qualquer fala nova. Repetição não ensina — cansa e empurra a palavra, que é
   o alvo, para o fim. Nada de "ááá", nada de "ma, ma, maçã", nada de dizer a
   palavra duas vezes. Cada letra fala a MENOR UNIDADE HONESTA do seu fonema:

   | tipo | fala | por quê |
   |---|---|---|
   | vogal | `"á"` | uma vogal acentuada já é o fonema inteiro |
   | contínua F M N S V Z | `"mmmm"` | som sustentado é UM fonema, não repetição — dá para segurar /m/ sem nunca virar sílaba |
   | oclusiva B D P T C G K Q | `"ba, bo"` | /b/ não existe sem vogal; o par varia a VOGAL para o que sobra igual ser a consoante |
   | L, R | `"la, lo"` | são contínuas, mas "llll"/"rrrr" a voz soletra em vez de sustentar |

   As duas sílabas das oclusivas não são exceção à regra: são a menor unidade
   possível, e são DIFERENTES entre si de propósito. Duas sílabas iguais
   ("ôh, ôh") não isolam nada — isso é repetição, e é proibido.

   **A única exceção é a contagem** (decisão 8): ali o número volta no fim
   ("um, dois, três… três dedos") porque é exatamente assim que se ensina
   cardinalidade. Não "conserte" isso.

7. **Maiúscula e minúscula juntas** na tela: são a mesma letra.

8. **Números contam em voz alta** um a um antes de dizer o total — é o caminho
   para a cardinalidade. Acima de 5 usa composição ("cinco e dois, sete").

## Voz sintetizada — o que já foi tentado

A qualidade da voz é o ponto fraco e **não depende do código**: depende da voz
instalada no sistema. O que ajuda e já está feito:

- Ranking prioriza vozes de rede (`!localService`), que são neurais; as locais
  antigas (SAPI5, eSpeak) soam metálicas.
- Fala em frases curtas, não tokens soltos — sílaba isolada é onde esses
  sintetizadores soam pior. Por isso ataque e palavra vão na MESMA utterance,
  separados por vírgula (`"ma, maçã"`): a vírgula dá a pausa curta da síntese
  sem cortar a frase em duas e deixar a sílaba sozinha.
- Uma utterance por trecho, para gerar pausa de respiração real.
- Micro-variação de tom e ritmo, para a repetição não sair idêntica.
- `LETTER_NAME` usa "êh" e "ôh" com **h mudo**: força leitura fonética e evita
  que a voz consulte sua tabela interna, que costuma trazer "é" no lugar de "ê".
- `SPEAK_AS` reescreve estrangeirismos à brasileira (watt → "váti").

Se o usuário reclamar de voz robótica de novo, a resposta honesta é trocar a
voz no seletor, não mexer nos parâmetros.

## Como adicionar um mini-game

1. Crie `jogos/<nome>/index.html`.
2. Inclua as libs que precisar, **nesta ordem**: base → fonemas → audio →
   particulas → maos → trava → controles.
3. Ponha os dados do jogo num `conteudo.js` ao lado, não no HTML.
4. Adicione um card em `index.html` da raiz.
5. Deixe um link `← Jogos` no canto, como o Alfabeto Mágico tem.

## Trava de criança (`lib/trava.js`)

Como no tinyfingers: enquanto a criança bate no teclado, nada pode tirá-la do
jogo. O que é possível e o que não é:

- **Tecla Windows, Alt+Tab, Ctrl+W, F5** — só a Keyboard Lock API segura, e ela
  exige **tela cheia** e **Chromium** (Chrome/Edge). É por isso que o
  tinyfingers força tela cheia: não é estilo, é a única via. `file://` conta
  como contexto seguro, então o jogo offline funciona.
- **Ctrl+Alt+Del** — nenhuma página do mundo bloqueia. Não tente.
- **Se a tela cheia falhar, `travar()` RECUSA e avisa** em vez de ligar o
  cadeado. Um cadeado que mente é pior que nenhum: o adulto sai de perto
  confiando nele.
- **Botão direito, botão do meio, arrastar, selecionar, duplo clique** ficam
  bloqueados **sempre**, travado ou não — num jogo de criança nada disso serve.
  O **clique esquerdo continua livre**: é ele que dispara os efeitos.
- **Saída do adulto: segurar ESC por 1,5 s.** É de propósito o mesmo gesto que
  o Chrome já exige com keyboard lock, para os dois estados não brigarem.
- Travado, `body` ganha a classe `travado` e o `#tools` some — senão a criança
  clica em "← Jogos" e sai.
- Travado, **toda** tecla vira efeito, inclusive Ctrl+alguma-coisa: o atalho já
  foi engolido, então não há motivo para a tecla ficar muda.

## Como testar

Não há suíte de testes. O que dá para automatizar:

- **Sintaxe:** `node --check` em cada arquivo de `lib/` e em `conteudo.js`.
- **Desenhos:** cada valor de `ART` é um fragmento SVG. Dá para embrulhar em
  `<svg>` e validar como XML, e renderizar em PNG (cairosvg) para conferir
  visualmente — foi assim que os 54 desenhos foram revisados.
- **A voz e as animações só dão para conferir abrindo no navegador.**

## Estado atual

Alfabeto Mágico está completo: 26 letras com som, 52 palavras com desenho,
números de 0 a 9 com as mãos, efeitos em espaço/enter/setas/pontuação.
`ART` tem três desenhos de reserva fora de uso (girafa, ioiô, watt) — a razão
de cada um está comentada no fim de `conteudo.js`.
