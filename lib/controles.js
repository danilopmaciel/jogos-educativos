/* ============================================================================
   controles.js — teclado virtual e gamepad touch integrados na própria página.
   Permite jogar no smartphone e tablet sem precisar do teclado nativo do sistema.
   ========================================================================== */

(function(){
  const defaultMode = window.CONTROLES_DEFAULT_MODE || "teclado";
  let currentMode = defaultMode;
  let isCollapsed = false;
  const activeKeys = new Set();
  let repeatInterval = null;

  /* Injeção de estilos CSS dos controles */
  const style = document.createElement("style");
  style.id = "styleVirtualControls";
  style.textContent = `
    #virtualControls {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px 6px calc(env(safe-area-inset-bottom, 0px) + 6px);
      background: rgba(12, 9, 28, 0.95);
      border-top: 2px solid rgba(255, 210, 63, 0.35);
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.6);
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
      font-family: inherit;
      transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.3, 1);
    }

    #virtualControls.collapsed {
      transform: translateY(calc(100% - 34px));
    }

    /* Barra de seleção no topo do painel */
    .vc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 640px;
      padding: 0 4px 6px;
      gap: 8px;
    }

    .vc-tabs {
      display: flex;
      gap: 6px;
      background: rgba(255, 255, 255, 0.12);
      padding: 3px;
      border-radius: 999px;
    }

    .vc-tab {
      background: transparent;
      border: 0;
      color: rgba(255, 255, 255, 0.75);
      padding: 4px 12px;
      font-size: 13px;
      font-weight: 800;
      border-radius: 999px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s ease;
      touch-action: manipulation;
    }

    .vc-tab.active {
      background: #ffd23f;
      color: #12102a;
      box-shadow: 0 2px 8px rgba(255, 210, 63, 0.5);
    }

    .vc-toggle-btn {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 999px;
      cursor: pointer;
      touch-action: manipulation;
    }

    .vc-panel {
      width: 100%;
      max-width: 640px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* MODO TECLADO */
    .vc-row {
      display: flex;
      justify-content: center;
      gap: 3px;
      width: 100%;
    }

    .vc-key {
      flex: 1;
      height: 38px;
      min-width: 0;
      max-width: 56px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 7px;
      color: #fff;
      font-size: clamp(14px, 4.2vw, 19px);
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 3px 0 rgba(0, 0, 0, 0.4);
      transition: transform 0.05s, background 0.1s;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    .vc-key:active, .vc-key.pressed {
      transform: translateY(2px);
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
      background: rgba(255, 255, 255, 0.45);
      color: #ffd23f;
    }

    .vc-key.num {
      background: rgba(110, 198, 255, 0.25);
      border-color: rgba(110, 198, 255, 0.45);
      color: #7ee8fa;
    }

    .vc-key.action {
      flex: 1.4;
      font-size: clamp(11px, 3.2vw, 14px);
      background: rgba(255, 95, 109, 0.28);
      border-color: rgba(255, 95, 109, 0.45);
    }

    .vc-key.space {
      flex: 2.8;
      background: rgba(255, 210, 63, 0.25);
      border-color: rgba(255, 210, 63, 0.45);
      color: #ffd23f;
      font-size: clamp(13px, 3.8vw, 16px);
    }

    /* MODO GAMEPAD */
    .vc-gamepad-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 4px 8px 2px;
      gap: 12px;
    }

    .vc-dpad {
      display: grid;
      grid-template-columns: repeat(3, 48px);
      grid-template-rows: repeat(3, 44px);
      gap: 4px;
    }

    .vc-dpad .vc-btn {
      width: 48px;
      height: 44px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 20px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 3px 0 rgba(0, 0, 0, 0.4);
      touch-action: manipulation;
    }

    .vc-dpad .vc-btn:active, .vc-dpad .vc-btn.pressed {
      transform: translateY(2px);
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
      background: #7ee8fa;
      color: #12102a;
    }

    .vc-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .vc-btn-action {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff5f6d, #ff9a44);
      border: 2px solid rgba(255, 255, 255, 0.5);
      color: #fff;
      font-size: 15px;
      font-weight: 900;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 5px 0 rgba(0, 0, 0, 0.4), 0 0 16px rgba(255, 95, 109, 0.5);
      touch-action: manipulation;
    }

    .vc-btn-action:active, .vc-btn-action.pressed {
      transform: translateY(3px);
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
      filter: brightness(1.25);
    }

    .vc-btn-secondary {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 210, 63, 0.35);
      border: 1.5px solid rgba(255, 210, 63, 0.7);
      color: #ffd23f;
      font-size: 15px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35);
      touch-action: manipulation;
    }

    .vc-btn-secondary:active, .vc-btn-secondary.pressed {
      transform: translateY(2px);
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
      background: #ffd23f;
      color: #12102a;
    }
  `;
  document.head.appendChild(style);

  /* Disparo de evento de teclado para o jogo */
  function dispatchKey(keyName, type){
    type = type || "keydown";
    const code = keyName === " " ? "Space" : (keyName.length === 1 ? "Key" + keyName.toUpperCase() : keyName);
    
    // Auto-iniciar o jogo caso o botão de início ainda esteja na tela
    const startBtn = document.getElementById("btnStart");
    if(startBtn && typeof startBtn.click === "function"){
      startBtn.click();
    }

    const event = new KeyboardEvent(type, {
      key: keyName,
      code: code,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
  }

  function pressKey(keyName){
    if(navigator.vibrate) try{ navigator.vibrate(12); }catch(e){}
    dispatchKey(keyName, "keydown");
    setTimeout(() => dispatchKey(keyName, "keyup"), 100);
  }

  /* Criação do container principal */
  const container = document.createElement("div");
  container.id = "virtualControls";

  // Cabeçalho / Abas
  const header = document.createElement("div");
  header.className = "vc-header";
  header.innerHTML = `
    <div class="vc-tabs">
      <button type="button" class="vc-tab ${currentMode === 'teclado' ? 'active' : ''}" data-mode="teclado">🔤 Teclado</button>
      <button type="button" class="vc-tab ${currentMode === 'gamepad' ? 'active' : ''}" data-mode="gamepad">🎮 Controle</button>
    </div>
    <button type="button" class="vc-toggle-btn" id="vcToggle">⌄ Ocultar</button>
  `;
  container.appendChild(header);

  // Painel de Conteúdo
  const panel = document.createElement("div");
  panel.className = "vc-panel";
  container.appendChild(panel);

  /* Renderiza o modo atual */
  function renderControls(){
    panel.innerHTML = "";

    if(currentMode === "teclado"){
      // Linha 1: Números
      const numRow = document.createElement("div");
      numRow.className = "vc-row";
      ["1","2","3","4","5","6","7","8","9","0"].forEach(n => {
        const btn = document.createElement("div");
        btn.className = "vc-key num";
        btn.textContent = n;
        btn.dataset.key = n;
        numRow.appendChild(btn);
      });
      panel.appendChild(numRow);

      // Linhas QWERTY
      const rows = [
        ["Q","W","E","R","T","Y","U","I","O","P"],
        ["A","S","D","F","G","H","J","K","L"],
        ["Z","X","C","V","B","N","M"]
      ];

      rows.forEach((rowKeys, idx) => {
        const row = document.createElement("div");
        row.className = "vc-row";

        if(idx === 2){
          const bs = document.createElement("div");
          bs.className = "vc-key action";
          bs.innerHTML = "⌫";
          bs.dataset.key = "Backspace";
          row.appendChild(bs);
        }

        rowKeys.forEach(k => {
          const btn = document.createElement("div");
          btn.className = "vc-key";
          btn.textContent = k;
          btn.dataset.key = k;
          row.appendChild(btn);
        });

        if(idx === 2){
          const enter = document.createElement("div");
          enter.className = "vc-key action";
          enter.innerHTML = "✨";
          enter.dataset.key = "Enter";
          row.appendChild(enter);
        }

        panel.appendChild(row);
      });

      // Linha inferior de ações
      const bottomRow = document.createElement("div");
      bottomRow.className = "vc-row";

      const spaceBtn = document.createElement("div");
      spaceBtn.className = "vc-key space";
      spaceBtn.innerHTML = "🎆 Espaço 🎆";
      spaceBtn.dataset.key = " ";
      bottomRow.appendChild(spaceBtn);

      panel.appendChild(bottomRow);

    } else {
      // MODO GAMEPAD
      const gamepadContainer = document.createElement("div");
      gamepadContainer.className = "vc-gamepad-container";

      // D-PAD (Esquerda)
      const dpad = document.createElement("div");
      dpad.className = "vc-dpad";
      dpad.innerHTML = `
        <div></div>
        <div class="vc-btn" data-key="ArrowUp" data-continuous="true">▲</div>
        <div></div>
        <div class="vc-btn" data-key="ArrowLeft" data-continuous="true">◄</div>
        <div></div>
        <div class="vc-btn" data-key="ArrowRight" data-continuous="true">►</div>
        <div></div>
        <div class="vc-btn" data-key="ArrowDown" data-continuous="true">▼</div>
        <div></div>
      `;
      gamepadContainer.appendChild(dpad);

      // Botões de Ação (Direita)
      const actions = document.createElement("div");
      actions.className = "vc-actions";
      actions.innerHTML = `
        <div class="vc-btn-secondary" data-key="Enter" title="Estrelas">✨</div>
        <div class="vc-btn-action" data-key=" " data-continuous="true" title="Tiro / Ação">
          <span style="font-size:22px">🚀</span>
          <span>TIRO</span>
        </div>
      `;
      gamepadContainer.appendChild(actions);

      panel.appendChild(gamepadContainer);
    }

    bindTouchEvents();
  }

  /* Manipulação de eventos Touch / Pointer */
  function bindTouchEvents(){
    const keys = panel.querySelectorAll("[data-key]");

    keys.forEach(el => {
      const key = el.dataset.key;
      const isContinuous = el.dataset.continuous === "true";

      const start = (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.add("pressed");

        if(isContinuous){
          activeKeys.add(key);
          dispatchKey(key, "keydown");
          if(!repeatInterval){
            repeatInterval = setInterval(() => {
              activeKeys.forEach(k => dispatchKey(k, "keydown"));
            }, 60);
          }
        } else {
          pressKey(key);
        }
      };

      const end = (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.remove("pressed");

        if(isContinuous){
          activeKeys.delete(key);
          dispatchKey(key, "keyup");
          if(activeKeys.size === 0 && repeatInterval){
            clearInterval(repeatInterval);
            repeatInterval = null;
          }
        }
      };

      el.addEventListener("pointerdown", start);
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
      el.addEventListener("pointerleave", end);
    });
  }

  /* Alternância de Abas */
  header.querySelectorAll(".vc-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.stopPropagation();
      header.querySelectorAll(".vc-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentMode = tab.dataset.mode;
      renderControls();
    });
  });

  /* Botão de Recolher / Expandir */
  const toggleBtn = header.querySelector("#vcToggle");
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    isCollapsed = !isCollapsed;
    container.classList.toggle("collapsed", isCollapsed);
    toggleBtn.textContent = isCollapsed ? "⌃ Teclado / Controle" : "⌄ Ocultar";
  });

  /* Inicialização imediata e segura */
  function mount(){
    if(!document.body) return;
    if(!document.getElementById("virtualControls")){
      document.body.appendChild(container);
      renderControls();
    }
  }

  if(document.body){
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }

  /* Expõe API global */
  window.VirtualControls = {
    setMode(mode){
      currentMode = mode;
      header.querySelectorAll(".vc-tab").forEach(t => {
        t.classList.toggle("active", t.dataset.mode === mode);
      });
      renderControls();
    },
    toggle(show){
      isCollapsed = show !== undefined ? !show : !isCollapsed;
      container.classList.toggle("collapsed", isCollapsed);
      toggleBtn.textContent = isCollapsed ? "⌃ Teclado / Controle" : "⌄ Ocultar";
    }
  };
})();
