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
jogos/
  alfabeto-magico/
    index.html      HTML, CSS e lógica do jogo
    conteudo.js     WORDS, ONSET e os 54 desenhos (ART)
```

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

3. **Nada de "M de Maçã".** Isso ensina associação, não leitura. No lugar entra
   aliteração: repetir o ataque e depois a palavra ("ma, ma, maçã"), com a
   letra inicial destacada em amarelo na tela.

4. **Coerência fonema–grafema.** As duas palavras de uma mesma letra têm sempre
   o mesmo som inicial. Por isso G é GATO/GALINHA, não GIRAFA (que soa /ʒ/).
   Ao acrescentar palavras, respeite isso.

5. **Maiúscula e minúscula juntas** na tela: são a mesma letra.

6. **Números contam em voz alta** um a um antes de dizer o total — é o caminho
   para a cardinalidade. Acima de 5 usa composição ("cinco e dois, sete").

## Voz sintetizada — o que já foi tentado

A qualidade da voz é o ponto fraco e **não depende do código**: depende da voz
instalada no sistema. O que ajuda e já está feito:

- Ranking prioriza vozes de rede (`!localService`), que são neurais; as locais
  antigas (SAPI5, eSpeak) soam metálicas.
- Fala em frases curtas, não tokens soltos — sílaba isolada é onde esses
  sintetizadores soam pior.
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
   particulas → maos.
3. Ponha os dados do jogo num `conteudo.js` ao lado, não no HTML.
4. Adicione um card em `index.html` da raiz.
5. Deixe um link `← Jogos` no canto, como o Alfabeto Mágico tem.

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
`ART` tem três desenhos de reserva fora de uso (girafa, ioiô, waffle) — a razão
de cada um está comentada no fim de `conteudo.js`.
