# Jogos para Aprender

Jogos de teclado para crianças pequenas em fase de alfabetização.
HTML puro: abre com duplo clique, funciona offline, não instala nada.

## Como usar

Abra `index.html` e escolha um jogo. Ou vá direto em
`jogos/alfabeto-magico/index.html`.

Recomendo apertar **⛶ Tela cheia** antes de entregar o teclado para a criança.

## Alfabeto Mágico

| Tecla | 1º toque | 2º toque |
|---|---|---|
| Letra `A`–`Z` | a letra grande + o **som** dela (/m/) | palavra com desenho e aliteração ("ma, ma, maçã") |
| Número `0`–`9` | o algarismo + o nome | as mãos com a quantidade de dedos, contando em voz alta |

Outras teclas:

- **Espaço** — fogos de artifício em sequência
- **Enter** — explosão de estrelas e clarão colorido
- **Setas** — riscos de luz atravessando a tela
- **Vírgula, ponto, `!`, `?`** — confete, e a voz diz o nome do sinal
- **Backspace** — limpa a tela
- **Clique/toque** — fogos no ponto tocado (bom para tablet)

Botões no canto superior direito (aparecem ao passar o mouse):

- 🗣 escolher a voz em português instalada no computador
- 🔈 testar a voz escolhida
- 🔤 alternar entre **som da letra** (padrão) e **nome da letra**
- ⛶ tela cheia
- 🔊 ligar/desligar a voz

## Sobre a voz

O jogo usa a síntese de voz do próprio navegador, então a qualidade depende do
que está instalado no sistema. Se soar robótica:

- abra no **Chrome**, que costuma expor a voz *Google português do Brasil*
  (de rede, bem mais natural);
- ou instale uma voz **Natural** no Windows: Configurações → Hora e idioma →
  Idioma e região → Português (Brasil) → Opções de idioma → Voz.

Depois escolha a voz nova no seletor 🗣.

## Por que o som da letra e não o nome

Porque é o som que serve para ler. Quem aprende "éfe" e tenta juntar com "a"
chega em "efea", não em "fa" — o nome dessas letras traz o som depois da vogal.
Os detalhes das escolhas pedagógicas estão no `CLAUDE.md`.

## Estrutura

```
index.html      menu
lib/            código compartilhado entre os jogos
jogos/          um diretório por mini-game
```

Para adicionar um jogo novo, veja `CLAUDE.md`.
