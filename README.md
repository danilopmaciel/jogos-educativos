# Jogos para Aprender

Coleção de jogos interativos e educativos para crianças pequenas em fase de alfabetização.  
HTML puro: abre com duplo clique, funciona offline, não instala nada e agora com **suporte completo para celulares e tablets**.

🌐 **Jogue online no GitHub Pages:** [https://danilopmaciel.github.io/jogos-educativos/](https://danilopmaciel.github.io/jogos-educativos/)

---

## Como Usar

- **No computador:** Abra `index.html` e escolha um jogo. Recomendo apertar **⛶ Tela cheia** ou **🔓 Travar teclado** antes de entregar o teclado para a criança.
- **No celular ou tablet:** Acesse o link do GitHub Pages. O jogo conta com **teclado virtual na própria tela** e modo **🎮 controle com D-Pad e botão de ação**, sem acionar o teclado nativo do aparelho.

---

## Jogos Disponíveis

### 1. 🔤 Alfabeto Mágico
Focado no método fônico e síntese de sons (*blending*).

| Tecla | 1º toque | 2º toque |
|---|---|---|
| Letra `A`–`Z` | A letra grande + o **som** dela (/m/) | Palavra com desenho e síntese ("ma, maçã") |
| Número `0`–`9` | O algarismo + o nome | As mãos com a quantidade de dedos, contando em voz alta |

Outras teclas:
- **Espaço** — fogos de artifício em sequência
- **Enter** — explosão de estrelas e clarão colorido
- **Setas** — riscos de luz atravessando a tela
- **Vírgula, ponto, `!`, `?`** — confete e nome do sinal falado
- **Backspace** — limpa a tela
- **Clique/toque** — fogos no ponto tocado

### 2. 🚀 Nave no Espaço (Meteoros)
Um jogo clássico no estilo arcade (Asteroids) sem frustração infantil:

- **Nave:** Triângulo espacial com propulsão a fogo e física suave.
- **Tiros:** Feixes de luz laser coloridos que transformam meteoros em estrelas.
- **Meteoros:** Polígonos geométricos com letras e números que se dividem em fragmentos menores.
- **Sem Game Over:** Ao encostar num meteoro, a nave ativa um escudo estelar de arco-íris e ricocheteia suavemente com confetes.

---

## 📱 Controles Mobile na Tela

Ao abrir em smartphones ou tablets, uma barra flutuante na parte inferior oferece:
- **🔤 Teclado Virtual:** Letras A–Z e números grandes e coloridos, com botões de Espaço e Enter.
- **🎮 Controle / D-Pad:** Botões direcionais (◄ ▲ ► ▼) e botão grande de tiro/ação 🚀 com suporte a multi-touch (mover e atirar simultaneamente).
- **Seletor de Modo:** Alterne facilmente entre o teclado e o controle de jogo.

---

## Sobre a Voz

O jogo usa a síntese de voz do próprio navegador:
- No **Chrome / Android**, selecione a voz *Google português do Brasil* no menu 🗣 (neural e natural).
- No **Windows**, instale uma voz *Natural* em Configurações → Hora e idioma → Idioma e região → Português (Brasil) → Voz.

---

## Estrutura do Projeto

```
index.html                  Menu principal dos jogos
lib/                        Código compartilhado
  base.js                   Utilitários, paleta de cores e SVG
  fonemas.js                Tabela de fonemas e pronúncias pedagógicas
  audio.js                  Síntese de som (Web Audio) e motor de voz
  particulas.js             Fogos, estrelas, confete e clarão
  maos.js                   Desenho vetorial das mãos com contagem de dedos
  trava.js                  Trava de teclado para crianças (tela cheia + ESC)
  controles.js              Teclado virtual e D-Pad touch para smartphones
jogos/
  alfabeto-magico/          Mini-game do alfabeto fônico e números
  meteoros/                 Mini-game espacial com nave e meteoros
```

Para detalhes pedagógicos e adição de novos mini-games, consulte o `CLAUDE.md`.
