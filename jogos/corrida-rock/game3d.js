/* ============================================================================
   CORRIDA ROCK 3D — ENGINE THREE.JS (ESTILO ROCK N' ROLL RACING SNES)
   ========================================================================== */

class Game3D {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.carGroup = null;
    this.carBody = null;
    this.carParts = null;
    this.forceVectorArrow = null;
    this.ghostGroup = null;
    this.otherCars = {}; // { id: THREE.Group }
    this.trackDimensions = null;
    this.clock = new THREE.Clock();

    this.initScene();
    this.buildSNESPlanetEnvironment();
    this.buildTrack();
    this.buildPlayerCar();
    this.buildForceVector();
    this.setupLighting();

    window.addEventListener("resize", () => this.onResize());
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#0c081e");
    this.scene.fog = new THREE.FogExp2("#0c081e", 0.0006);

    // Câmera isométrica em perspectiva clássica estilo Rock n' Roll Racing SNES
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(35, aspect, 1, 5000);
    this.camera.position.set(0, 480, 520);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight("#9c88ff", 0.9);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight("#fff4cc", 1.8);
    dirLight.position.set(300, 700, 250);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 50;
    dirLight.shadow.camera.far = 2000;
    const d = 700;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0003;
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight("#e84393", 0.7);
    rimLight.position.set(-350, 200, -350);
    this.scene.add(rimLight);
  }

  buildSNESPlanetEnvironment() {
    // Chão alienígena rochoso estilo planeta Chem VI / Bogmire
    const groundGeo = new THREE.PlaneGeometry(3200, 3200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: "#130e2a",
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Formações de cristais e monólitos alienígenas nas bordas do circuito
    const crystalGeo = new THREE.ConeGeometry(12, 50, 5);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: "#6c5ce7",
      emissive: "#5f27cd",
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.8
    });

    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const dist = 600 + (i % 4) * 50;
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(Math.cos(angle) * dist, 20, Math.sin(angle) * dist);
      crystal.rotation.x = (Math.random() - 0.5) * 0.35;
      crystal.rotation.z = (Math.random() - 0.5) * 0.35;
      crystal.castShadow = true;
      this.scene.add(crystal);
    }
  }

  buildTrack() {
    const w = 1040;
    const h = 720;
    const roadWidth = 210; // Pista espaçosa e concêntrica
    const r = 260; // r > roadWidth garante raio interno positivo (ir = 50 > 0)!

    this.trackDimensions = { w, h, roadWidth, r };

    const shape = new THREE.Shape();
    const halfW = w / 2;
    const halfH = h / 2;

    // Perímetro externo arredondado
    shape.moveTo(-halfW + r, -halfH);
    shape.lineTo(halfW - r, -halfH);
    shape.absarc(halfW - r, -halfH + r, r, -Math.PI / 2, 0, false);
    shape.lineTo(halfW, halfH - r);
    shape.absarc(halfW - r, halfH - r, r, 0, Math.PI / 2, false);
    shape.lineTo(-halfW + r, halfH);
    shape.absarc(-halfW + r, halfH - r, r, Math.PI / 2, Math.PI, false);
    shape.lineTo(-halfW, -halfH + r);
    shape.absarc(-halfW + r, -halfH + r, r, Math.PI, Math.PI * 1.5, false);

    // Ilha interna (furo concêntrico perfeito com ir = r - roadWidth = 50 > 0)
    const hole = new THREE.Path();
    const iw = halfW - roadWidth;
    const ih = halfH - roadWidth;
    const ir = r - roadWidth; // +50 (positivo! Evita inversão dos cantos!)

    hole.moveTo(-iw + ir, -ih);
    hole.lineTo(iw - ir, -ih);
    hole.absarc(iw - ir, -ih + ir, ir, -Math.PI / 2, 0, false);
    hole.lineTo(iw, ih - ir);
    hole.absarc(iw - ir, ih - ir, ir, 0, Math.PI / 2, false);
    hole.lineTo(-iw + ir, ih);
    hole.absarc(-iw + ir, ih - ir, ir, Math.PI / 2, Math.PI, false);
    hole.lineTo(-iw, -ih + ir);
    hole.absarc(-iw + ir, -ih + ir, ir, Math.PI, Math.PI * 1.5, false);

    shape.holes.push(hole);

    // Asfalto extrudado com relevo e chanfro
    const extrudeSettings = { depth: 4, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 3, bevelThickness: 2 };
    const trackGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const trackMat = new THREE.MeshStandardMaterial({
      color: "#25213b",
      roughness: 0.6,
      metalness: 0.3
    });

    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = 0;
    trackMesh.receiveShadow = true;
    this.scene.add(trackMesh);

    // Linha amarela tracejada central
    this.buildCenterRoadLine(halfW, halfH, roadWidth);

    // Zebras contínuas ao longo de todo o perímetro
    this.buildContinuousCurbs(w, h, roadWidth, r, ir);

    // Pórtico com semáforo luminoso
    this.buildSNESGantry(halfW, halfH, roadWidth);
  }

  buildCenterRoadLine(halfW, halfH, roadWidth) {
    const lineMat = new THREE.MeshBasicMaterial({ color: "#ffd23f" });
    const dashGeo = new THREE.BoxGeometry(16, 0.4, 3);
    const midTopZ = -halfH + roadWidth / 2;
    const midBottomZ = halfH - roadWidth / 2;

    for (let x = -halfW + roadWidth; x <= halfW - roadWidth; x += 36) {
      const d1 = new THREE.Mesh(dashGeo, lineMat);
      d1.position.set(x, 6.2, midTopZ);
      this.scene.add(d1);

      const d2 = new THREE.Mesh(dashGeo, lineMat);
      d2.position.set(x, 6.2, midBottomZ);
      this.scene.add(d2);
    }
  }

  buildContinuousCurbs(w, h, roadWidth, r, ir) {
    const redMat = new THREE.MeshStandardMaterial({ color: "#ff4757", roughness: 0.35 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: "#f1f2f6", roughness: 0.35 });
    const blockGeo = new THREE.BoxGeometry(16, 5, 8);

    const halfW = w / 2;
    const halfH = h / 2;
    const left = -halfW + r;
    const right = halfW - r;
    const top = -halfH + r;
    const bottom = halfH - r;

    // 1. Zebras Externas: Retas
    for (let x = left; x <= right; x += 18) {
      const mat = (Math.floor(x / 18) % 2 === 0) ? redMat : whiteMat;
      const topC = new THREE.Mesh(blockGeo, mat);
      topC.position.set(x, 6.2, -halfH - 2);
      topC.castShadow = true;
      this.scene.add(topC);

      const botC = new THREE.Mesh(blockGeo, (Math.floor(x / 18) % 2 === 0) ? whiteMat : redMat);
      botC.position.set(x, 6.2, halfH + 2);
      botC.castShadow = true;
      this.scene.add(botC);
    }

    for (let z = top; z <= bottom; z += 18) {
      const mat = (Math.floor(z / 18) % 2 === 0) ? redMat : whiteMat;
      const leftC = new THREE.Mesh(blockGeo, mat);
      leftC.rotation.y = Math.PI / 2;
      leftC.position.set(-halfW - 2, 6.2, z);
      leftC.castShadow = true;
      this.scene.add(leftC);

      const rightC = new THREE.Mesh(blockGeo, (Math.floor(z / 18) % 2 === 0) ? whiteMat : redMat);
      rightC.rotation.y = Math.PI / 2;
      rightC.position.set(halfW + 2, 6.2, z);
      rightC.castShadow = true;
      this.scene.add(rightC);
    }

    // 2. Zebras Externas: 4 Cantos Arredondados
    const cornerSteps = 14;
    const cornerArcs = [
      { cx: right, cz: top, aStart: -Math.PI / 2, aEnd: 0 },
      { cx: right, cz: bottom, aStart: 0, aEnd: Math.PI / 2 },
      { cx: left, cz: bottom, aStart: Math.PI / 2, aEnd: Math.PI },
      { cx: left, cz: top, aStart: Math.PI, aEnd: Math.PI * 1.5 }
    ];

    cornerArcs.forEach(c => {
      for (let i = 0; i < cornerSteps; i++) {
        const phi = c.aStart + ((i + 0.5) / cornerSteps) * (c.aEnd - c.aStart);
        const bx = c.cx + (r + 2) * Math.cos(phi);
        const bz = c.cz + (r + 2) * Math.sin(phi);
        const mesh = new THREE.Mesh(blockGeo, (i % 2 === 0) ? redMat : whiteMat);
        mesh.position.set(bx, 6.2, bz);
        // Alinhado com a tangente do arco (phi + PI/2): rotation.y = -(phi + Math.PI / 2)
        mesh.rotation.y = -phi - Math.PI / 2;
        mesh.castShadow = true;
        this.scene.add(mesh);
      }
    });

    // 3. Zebras Internas: Retas e Curvas Arredondadas Concêntricas (ir = 50 > 0)
    const iw = halfW - roadWidth;
    const ih = halfH - roadWidth;

    // Retas horizontais internas (entre os arcos dos cantos)
    for (let x = -iw + ir + 8; x <= iw - ir - 8; x += 18) {
      const mat = (Math.floor(x / 18) % 2 === 0) ? redMat : whiteMat;
      const inTop = new THREE.Mesh(blockGeo, mat);
      inTop.position.set(x, 6.2, -ih);
      inTop.castShadow = true;
      this.scene.add(inTop);

      const inBot = new THREE.Mesh(blockGeo, (Math.floor(x / 18) % 2 === 0) ? whiteMat : redMat);
      inBot.position.set(x, 6.2, ih);
      inBot.castShadow = true;
      this.scene.add(inBot);
    }

    // Retas verticais internas (entre os arcos dos cantos)
    for (let z = -ih + ir + 8; z <= ih - ir - 8; z += 18) {
      const mat = (Math.floor(z / 18) % 2 === 0) ? redMat : whiteMat;
      const inLeft = new THREE.Mesh(blockGeo, mat);
      inLeft.rotation.y = Math.PI / 2;
      inLeft.position.set(-iw, 6.2, z);
      inLeft.castShadow = true;
      this.scene.add(inLeft);

      const inRight = new THREE.Mesh(blockGeo, (Math.floor(z / 18) % 2 === 0) ? whiteMat : redMat);
      inRight.rotation.y = Math.PI / 2;
      inRight.position.set(iw, 6.2, z);
      inRight.castShadow = true;
      this.scene.add(inRight);
    }

    // Curvas nos 4 cantos internos (contornando o furo suavemente na tangente)
    const innerCornerSteps = 5;
    const innerCornerArcs = [
      { cx: iw - ir, cz: -ih + ir, aStart: -Math.PI / 2, aEnd: 0 },
      { cx: iw - ir, cz: ih - ir, aStart: 0, aEnd: Math.PI / 2 },
      { cx: -iw + ir, cz: ih - ir, aStart: Math.PI / 2, aEnd: Math.PI },
      { cx: -iw + ir, cz: -ih + ir, aStart: Math.PI, aEnd: Math.PI * 1.5 }
    ];

    innerCornerArcs.forEach(c => {
      for (let i = 0; i < innerCornerSteps; i++) {
        const phi = c.aStart + ((i + 0.5) / innerCornerSteps) * (c.aEnd - c.aStart);
        const bx = c.cx + ir * Math.cos(phi);
        const bz = c.cz + ir * Math.sin(phi);
        const mesh = new THREE.Mesh(blockGeo, (i % 2 === 0) ? redMat : whiteMat);
        mesh.position.set(bx, 6.2, bz);
        // Alinhado com a tangente do arco interno: rotation.y = -(phi + Math.PI / 2)
        mesh.rotation.y = -phi - Math.PI / 2;
        mesh.castShadow = true;
        this.scene.add(mesh);
      }
    });
  }

  buildSNESGantry(halfW, halfH, roadWidth) {
    const gantry = new THREE.Group();
    const trussMat = new THREE.MeshStandardMaterial({ color: "#ffd23f", metalness: 0.8, roughness: 0.25 });
    const colGeo = new THREE.CylinderGeometry(5, 5, 130, 12);

    // Postes afastados 25px para fora do asfalto para não haver colisão ou obstrução visual da passagem
    const postOuterZ = -halfH - 25;
    const postInnerZ = -(halfH - roadWidth) + 25;

    const post1 = new THREE.Mesh(colGeo, trussMat);
    post1.position.set(0, 65, postOuterZ);
    post1.castShadow = true;
    gantry.add(post1);

    const post2 = new THREE.Mesh(colGeo, trussMat);
    post2.position.set(0, 65, postInnerZ);
    post2.castShadow = true;
    gantry.add(post2);

    const beamLen = Math.abs(postOuterZ - postInnerZ) + 16;
    const beamGeo = new THREE.BoxGeometry(14, 14, beamLen);
    const beam = new THREE.Mesh(beamGeo, trussMat);
    beam.position.set(0, 120, (postOuterZ + postInnerZ) / 2);
    beam.castShadow = true;
    gantry.add(beam);

    // Semáforo com luzes neon de largada no centro da via
    const roadCenterZ = -halfH + roadWidth / 2;
    const lampGeo = new THREE.SphereGeometry(4.5, 16, 16);
    const redLight = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: "#ff4757" }));
    redLight.position.set(8, 120, roadCenterZ - 24);
    gantry.add(redLight);

    const yellowLight = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: "#ffa502" }));
    yellowLight.position.set(8, 120, roadCenterZ);
    gantry.add(yellowLight);

    const greenLight = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: "#2ed573" }));
    greenLight.position.set(8, 120, roadCenterZ + 24);
    gantry.add(greenLight);

    // Linha de chegada quadriculada no chão
    const sqSize = 16;
    const cols = Math.floor(roadWidth / sqSize);
    const matW = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.2 });
    const matB = new THREE.MeshStandardMaterial({ color: "#161324", roughness: 0.4 });
    const tileGeo = new THREE.PlaneGeometry(sqSize, sqSize);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = new THREE.Mesh(tileGeo, (r + c) % 2 === 0 ? matW : matB);
        tile.rotation.x = -Math.PI / 2;
        tile.position.set((r - 0.5) * sqSize, 6.15, -halfH + c * sqSize + sqSize / 2);
        tile.receiveShadow = true;
        gantry.add(tile);
      }
    }

    this.scene.add(gantry);
  }

  /* Gerador de Texturas Procedurais Estilo Rock n' Roll Racing */
  createCarBodyTexture(colorHex) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Pintura base metálica
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Sombreamento lateral e chanfros de armadura
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "rgba(255,255,255,0.22)");
    grad.addColorStop(0.5, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Faixas Duplas de Corrida (Racing Stripes Douradas e Brancas)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 196, 512, 120);
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(0, 206, 512, 42);
    ctx.fillRect(0, 264, 512, 42);
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 248, 512, 16);

    // Chamas / Raios Laterais Estilo Hot-Rod SNES
    ctx.fillStyle = "#ffd23f";
    for (let side of [45, 385]) {
      ctx.beginPath();
      ctx.moveTo(420, side);
      ctx.lineTo(240, side + 18);
      ctx.lineTo(290, side + 36);
      ctx.lineTo(140, side + 48);
      ctx.lineTo(310, side + 72);
      ctx.lineTo(420, side + 80);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#ff6b6b";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Grelhas de ventilação (Louvers) no capô e linhas de painel
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, 480, 480);

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(340 + i * 16, 140, 8, 42);
      ctx.fillRect(340 + i * 16, 330, 8, 42);
    }

    // Emblema numérico #01 nas portas/capô
    for (let cy of [95, 415]) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(210, cy, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#161324";
      ctx.stroke();

      ctx.fillStyle = "#161324";
      ctx.font = "900 38px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("77", 210, cy + 2);
    }

    // Rebites metálicos nas bordas
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    for (let x = 32; x < 490; x += 36) {
      ctx.beginPath();
      ctx.arc(x, 28, 3.5, 0, Math.PI * 2);
      ctx.arc(x, 484, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createCabinTexture(colorHex) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // Vidro escuro azulado refletivo
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(0.45, "#1e293b");
    grad.addColorStop(0.55, "#38bdf8");
    grad.addColorStop(0.65, "#1e293b");
    grad.addColorStop(1, "#090d16");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Gaiola de proteção interna (Roll Cage) e moldura metálica
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 240, 240);

    // Reflexo diagonal no para-brisa
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(95, 0);
    ctx.lineTo(20, 256);
    ctx.lineTo(0, 256);
    ctx.closePath();
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  createWheelTextures() {
    if (this._wheelTexCache) return this._wheelTexCache;

    // 1. Textura da banda de rodagem do pneu (gomos off-road)
    const treadCanvas = document.createElement("canvas");
    treadCanvas.width = 256;
    treadCanvas.height = 64;
    const tCtx = treadCanvas.getContext("2d");
    tCtx.fillStyle = "#181622";
    tCtx.fillRect(0, 0, 256, 64);
    tCtx.fillStyle = "#2d2a3e";
    for (let x = 0; x < 256; x += 32) {
      tCtx.fillRect(x + 4, 4, 18, 24);
      tCtx.fillRect(x + 14, 36, 18, 24);
    }
    const treadTex = new THREE.CanvasTexture(treadCanvas);
    treadTex.wrapS = THREE.RepeatWrapping;
    treadTex.wrapT = THREE.RepeatWrapping;

    // 2. Textura da roda esportiva de 5 raios dourada
    const rimCanvas = document.createElement("canvas");
    rimCanvas.width = 256;
    rimCanvas.height = 256;
    const rCtx = rimCanvas.getContext("2d");
    const cx = 128, cy = 128;

    rCtx.fillStyle = "#151320";
    rCtx.fillRect(0, 0, 256, 256);

    // Anel externo do pneu e aro metálico
    rCtx.beginPath();
    rCtx.arc(cx, cy, 120, 0, Math.PI * 2);
    rCtx.fillStyle = "#1c192b";
    rCtx.fill();

    rCtx.beginPath();
    rCtx.arc(cx, cy, 82, 0, Math.PI * 2);
    rCtx.fillStyle = "#0f0e17";
    rCtx.fill();
    rCtx.lineWidth = 10;
    rCtx.strokeStyle = "#ffd23f";
    rCtx.stroke();

    // 5 Raios Estrela (Cragar / Muscle Car Rim)
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      rCtx.save();
      rCtx.translate(cx, cy);
      rCtx.rotate(ang);
      rCtx.fillStyle = "#ffd23f";
      rCtx.beginPath();
      rCtx.moveTo(-14, 0);
      rCtx.lineTo(-8, 78);
      rCtx.lineTo(8, 78);
      rCtx.lineTo(14, 0);
      rCtx.closePath();
      rCtx.fill();
      rCtx.restore();
    }

    // Cubo central cromado e parafusos
    rCtx.beginPath();
    rCtx.arc(cx, cy, 22, 0, Math.PI * 2);
    rCtx.fillStyle = "#dfe4ea";
    rCtx.fill();
    rCtx.lineWidth = 4;
    rCtx.strokeStyle = "#151320";
    rCtx.stroke();

    const rimTex = new THREE.CanvasTexture(rimCanvas);
    this._wheelTexCache = { treadTex, rimTex };
    return this._wheelTexCache;
  }

  /* Modelagem autêntica do carro estilo Marauder / Rock n' Roll Racing SNES */
  buildCarMesh(colorHex = "#ff4757", isGhost = false) {
    const group = new THREE.Group();

    const bodyTex = this.createCarBodyTexture(colorHex);
    const cabinTex = this.createCabinTexture(colorHex);
    const { treadTex, rimTex } = this.createWheelTextures();

    const bodyMat = new THREE.MeshStandardMaterial({
      map: isGhost ? null : bodyTex,
      color: isGhost ? colorHex : "#ffffff",
      metalness: isGhost ? 0.3 : 0.55,
      roughness: isGhost ? 0.4 : 0.32,
      transparent: isGhost,
      opacity: isGhost ? 0.55 : 1.0
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: "#eef2f6",
      metalness: 0.95,
      roughness: 0.12
    });

    const glassMat = new THREE.MeshStandardMaterial({
      map: isGhost ? null : cabinTex,
      color: isGhost ? "#18142c" : "#ffffff",
      metalness: 0.85,
      roughness: 0.12,
      transparent: isGhost,
      opacity: isGhost ? 0.45 : 0.98
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: "#1e1b2e",
      metalness: 0.7,
      roughness: 0.4
    });

    // GRUPO SUSPENSO DA CARROCERIA (Pivô em y = 13 para dar molejo completo nas curvas!)
    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 13;
    group.add(bodyGroup);

    // 1. Chassi musculoso principal (Comprimento = eixo X, Largura = eixo Z)
    const chassiGeo = new THREE.BoxGeometry(56, 13, 34);
    const chassi = new THREE.Mesh(chassiGeo, bodyMat);
    chassi.position.y = 0;
    chassi.castShadow = !isGhost;
    chassi.receiveShadow = !isGhost;
    bodyGroup.add(chassi);

    // Para-lamas alargados (Fender flares musculosos sobre as 4 rodas)
    const fenderGeo = new THREE.BoxGeometry(18, 6, 38);
    const fenderF = new THREE.Mesh(fenderGeo, darkMetalMat);
    fenderF.position.set(16, -2, 0);
    bodyGroup.add(fenderF);
    const fenderR = new THREE.Mesh(fenderGeo, darkMetalMat);
    fenderR.position.set(-16, -2, 0);
    bodyGroup.add(fenderR);

    // Para-choque dianteiro cromado (Bullbar frontal em +X)
    const bumperGeo = new THREE.BoxGeometry(4, 5, 36);
    const frontBumper = new THREE.Mesh(bumperGeo, chromeMat);
    frontBumper.position.set(28.5, -3.5, 0);
    bodyGroup.add(frontBumper);

    // Grade frontal escura
    const grilleGeo = new THREE.BoxGeometry(2, 6, 18);
    const grille = new THREE.Mesh(grilleGeo, darkMetalMat);
    grille.position.set(28.2, 0, 0);
    bodyGroup.add(grille);

    // Cabine com vidro texturizado e reflexos
    const cabinGeo = new THREE.BoxGeometry(28, 11, 26);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(-3, 10, 0);
    cabin.castShadow = !isGhost;
    bodyGroup.add(cabin);

    // Teto da cabine na cor do carro
    const roofGeo = new THREE.BoxGeometry(24, 2, 24);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(-3, 15.6, 0);
    bodyGroup.add(roof);

    // Supercharger / Blower V8 cromado no capô (+X é a frente!)
    const blowerBaseGeo = new THREE.BoxGeometry(13, 5, 14);
    const blowerBase = new THREE.Mesh(blowerBaseGeo, darkMetalMat);
    blowerBase.position.set(15, 7, 0);
    bodyGroup.add(blowerBase);

    const blowerGeo = new THREE.BoxGeometry(11, 6, 12);
    const blower = new THREE.Mesh(blowerGeo, chromeMat);
    blower.position.set(15, 11, 0);
    blower.castShadow = !isGhost;
    bodyGroup.add(blower);

    // Entradas triplas de ar (Bugcatcher Scoop) com borboletas vermelhas
    const scoopGeo = new THREE.CylinderGeometry(2.2, 2.2, 5, 12);
    scoopGeo.rotateZ(Math.PI / 2);
    const redValveMat = new THREE.MeshBasicMaterial({ color: "#ff4757" });
    for (let zOff of [-4, 0, 4]) {
      const scoop = new THREE.Mesh(scoopGeo, chromeMat);
      scoop.position.set(20, 12.2, zOff);
      bodyGroup.add(scoop);

      const valve = new THREE.Mesh(new THREE.CircleGeometry(1.7, 10), redValveMat);
      valve.rotation.y = Math.PI / 2;
      valve.position.set(22.6, 12.2, zOff);
      bodyGroup.add(valve);
    }

    // Escapamentos laterais duplos cromados (Side Pipes)
    const pipeGeo = new THREE.CylinderGeometry(2.2, 2.2, 28, 12);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeL = new THREE.Mesh(pipeGeo, chromeMat);
    pipeL.position.set(-8, -4.5, -18.5);
    bodyGroup.add(pipeL);
    const pipeR = new THREE.Mesh(pipeGeo, chromeMat);
    pipeR.position.set(-8, -4.5, 18.5);
    bodyGroup.add(pipeR);

    // Chamas de Nitro nos escapamentos traseiros (visíveis durante o Turbo!)
    const flameGeo = new THREE.ConeGeometry(3.2, 16, 10);
    flameGeo.rotateZ(Math.PI / 2); // Aponta para -X (para trás)
    const flameMat = new THREE.MeshBasicMaterial({ color: "#00d2d3" });
    const flameL = new THREE.Mesh(flameGeo, flameMat);
    flameL.position.set(-28, -4.5, -18.5);
    flameL.visible = false;
    bodyGroup.add(flameL);

    const flameR = new THREE.Mesh(flameGeo, flameMat);
    flameR.position.set(-28, -4.5, 18.5);
    flameR.visible = false;
    bodyGroup.add(flameR);

    // Aerofólio esportivo traseiro (-X é a traseira)
    const wingGeo = new THREE.BoxGeometry(9, 2.5, 38);
    const wing = new THREE.Mesh(wingGeo, bodyMat);
    wing.position.set(-25, 15, 0);
    wing.rotation.z = -0.15; // Inclinado para downforce
    wing.castShadow = !isGhost;
    bodyGroup.add(wing);

    const wingPostGeo = new THREE.BoxGeometry(4, 10, 2.5);
    const wp1 = new THREE.Mesh(wingPostGeo, chromeMat);
    wp1.position.set(-25, 10, -13);
    bodyGroup.add(wp1);
    const wp2 = new THREE.Mesh(wingPostGeo, chromeMat);
    wp2.position.set(-25, 10, 13);
    bodyGroup.add(wp2);

    // Faróis dianteiros duplos brilhantes (+X)
    const lampMat = new THREE.MeshBasicMaterial({ color: "#7ee8fa" });
    const lampGeo = new THREE.BoxGeometry(2, 4.5, 7);
    const fl1 = new THREE.Mesh(lampGeo, lampMat);
    fl1.position.set(28.1, 0.5, -11);
    bodyGroup.add(fl1);
    const fl2 = new THREE.Mesh(lampGeo, lampMat);
    fl2.position.set(28.1, 0.5, 11);
    bodyGroup.add(fl2);

    // Lanternas de freio traseiras (-X)
    const brakeMat = new THREE.MeshBasicMaterial({ color: "#ff4757" });
    const bl1 = new THREE.Mesh(lampGeo, brakeMat);
    bl1.position.set(-28.1, 0.5, -11);
    bodyGroup.add(bl1);
    const bl2 = new THREE.Mesh(lampGeo, brakeMat);
    bl2.position.set(-28.1, 0.5, 11);
    bodyGroup.add(bl2);

    // 2. RODAS COM TEXTURA DE GOMOS E ARO ESTRELA DE 5 PONTAS:
    // CylinderGeometry tem [lateral (banda de rodagem), topo (aro), base (aro)]
    const wheelMaterials = [
      new THREE.MeshStandardMaterial({ map: treadTex, roughness: 0.85, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: rimTex, roughness: 0.25, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ map: rimTex, roughness: 0.25, metalness: 0.8 })
    ];

    const wheelGeo = new THREE.CylinderGeometry(10.5, 10.5, 9, 24);
    wheelGeo.rotateX(Math.PI / 2); // Eixo ao longo de Z (roda alinhada para frente em X)

    const wheelFL = new THREE.Mesh(wheelGeo, wheelMaterials);
    const wheelFR = new THREE.Mesh(wheelGeo, wheelMaterials);
    const wheelRL = new THREE.Mesh(wheelGeo, wheelMaterials);
    const wheelRR = new THREE.Mesh(wheelGeo, wheelMaterials);

    wheelFL.position.set(16, 10.5, -20);
    wheelFR.position.set(16, 10.5, 20);
    wheelRL.position.set(-16, 10.5, -20);
    wheelRR.position.set(-16, 10.5, 20);

    [wheelFL, wheelFR, wheelRL, wheelRR].forEach(w => {
      w.castShadow = !isGhost;
    });

    // Amortecedores e Molas Helicoidais amarelas visíveis entre as rodas e o chassi
    const springMat = new THREE.MeshStandardMaterial({ color: "#ffd23f", metalness: 0.85, roughness: 0.15 });
    const springGeo = new THREE.CylinderGeometry(3.0, 3.0, 10, 12);

    const sFL = new THREE.Mesh(springGeo, springMat);
    sFL.position.set(16, 12, -15);
    const sFR = new THREE.Mesh(springGeo, springMat);
    sFR.position.set(16, 12, 15);
    const sRL = new THREE.Mesh(springGeo, springMat);
    sRL.position.set(-16, 12, -15);
    const sRR = new THREE.Mesh(springGeo, springMat);
    sRR.position.set(-16, 12, 15);

    group.add(wheelFL, wheelFR, wheelRL, wheelRR);
    group.add(sFL, sFR, sRL, sRR);

    return {
      group,
      bodyGroup,
      bodyMesh: chassi,
      roofMesh: roof,
      wingMesh: wing,
      flames: { l: flameL, r: flameR },
      wheels: { fl: wheelFL, fr: wheelFR, rl: wheelRL, rr: wheelRR },
      springs: { fl: sFL, fr: sFR, rl: sRL, rr: sRR },
      setColor: (newColorHex) => {
        const newTex = this.createCarBodyTexture(newColorHex);
        bodyMat.map = newTex;
        bodyMat.needsUpdate = true;
      }
    };
  }

  buildPlayerCar() {
    const carData = this.buildCarMesh("#ff4757", false);
    this.carGroup = carData.group;
    this.carBody = carData.bodyGroup;
    this.carParts = carData;
    this.scene.add(this.carGroup);

    const startZ = -this.trackDimensions.h / 2 + this.trackDimensions.roadWidth / 2;
    this.carGroup.position.set(0, 6, startZ);
  }

  buildForceVector() {
    this.forceVectorArrow = new THREE.Group();

    // A flecha agora aponta no eixo +Z por padrão (lado direito do carro: +Z)
    // CylinderGeometry padrão é no eixo Y; rotacionamos em X para alinhar ao eixo Z
    const shaftGeo = new THREE.CylinderGeometry(2.4, 2.4, 46, 16);
    shaftGeo.rotateX(Math.PI / 2);
    const shaftMat = new THREE.MeshBasicMaterial({ color: "#7ee8fa" });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.z = 23;
    this.forceVectorArrow.add(shaft);

    const tipGeo = new THREE.ConeGeometry(8, 20, 16);
    tipGeo.rotateX(Math.PI / 2);
    const tip = new THREE.Mesh(tipGeo, shaftMat);
    tip.position.z = 50;
    this.forceVectorArrow.add(tip);

    const featherGeo = new THREE.BoxGeometry(1.5, 12, 16);
    const fletchMat = new THREE.MeshBasicMaterial({ color: "#ffd23f" });
    const feather = new THREE.Mesh(featherGeo, fletchMat);
    feather.position.set(0, 0, 6);
    this.forceVectorArrow.add(feather);

    this.forceVectorArrow.position.set(0, 18, 0);
    this.forceVectorArrow.visible = false;
    this.carGroup.add(this.forceVectorArrow);
  }

  updatePlayerCar(physicsCar) {
    if (!this.carGroup) return;

    this.carGroup.position.x = physicsCar.x;
    this.carGroup.position.y = 6; // Topo do asfalto chanfrado
    this.carGroup.position.z = physicsCar.z;
    this.carGroup.rotation.y = -physicsCar.angle;

    // 1. Molejo completo da Suspensão e Amortecedores (Roll, Pitch e Bounce vertical)
    if (this.carBody) {
      const bounceY = physicsCar.bounceY || 0;
      // Inclinação lateral (roll) pronunciada nas curvas + empinada (pitch) no turbo/aceleração
      this.carBody.rotation.x = physicsCar.roll * 0.42;
      this.carBody.rotation.z = physicsCar.pitch * 0.25;
      this.carBody.position.y = 13 + bounceY - Math.abs(physicsCar.roll) * 1.4 + physicsCar.pitch * 1.2;

      if (this.carParts && this.carParts.springs) {
        const r = physicsCar.roll;
        const p = physicsCar.pitch;
        const b = bounceY * 0.08;
        this.carParts.springs.fl.scale.y = Math.max(0.4, 1.0 + r * 0.55 + p * 0.35 + b);
        this.carParts.springs.fr.scale.y = Math.max(0.4, 1.0 - r * 0.55 + p * 0.35 + b);
        this.carParts.springs.rl.scale.y = Math.max(0.4, 1.0 + r * 0.48 - p * 0.35 + b);
        this.carParts.springs.rr.scale.y = Math.max(0.4, 1.0 - r * 0.48 - p * 0.35 + b);
      }

      // Chamas do escapamento durante o Turbo
      if (this.carParts && this.carParts.flames) {
        const showFlames = !!physicsCar.turboActive;
        this.carParts.flames.l.visible = showFlames;
        this.carParts.flames.r.visible = showFlames;
        if (showFlames) {
          const flicker = 0.8 + Math.random() * 0.5;
          this.carParts.flames.l.scale.set(1, flicker, 1);
          this.carParts.flames.r.scale.set(1, flicker, 1);
        }
      }
    }

    // 2. Rodas com esterçamento dianteiro e giro com gomos visíveis
    if (this.carParts && this.carParts.wheels) {
      this.carParts.wheels.fl.rotation.y = -physicsCar.steerAngle;
      this.carParts.wheels.fr.rotation.y = -physicsCar.steerAngle;

      const spinSpeed = physicsCar.speed * 0.16;
      this.carParts.wheels.fl.rotation.z += spinSpeed;
      this.carParts.wheels.fr.rotation.z += spinSpeed;
      this.carParts.wheels.rl.rotation.z += spinSpeed;
      this.carParts.wheels.rr.rotation.z += spinSpeed;
    }

    // 3. Vetor Força Lateral (+Z = direita, -Z = esquerda)
    if (physicsCar.vectorLeftActive || physicsCar.vectorRightActive) {
      this.forceVectorArrow.visible = true;
      const isLeft = physicsCar.vectorLeftActive;
      this.forceVectorArrow.rotation.y = isLeft ? Math.PI : 0;
      this.forceVectorArrow.position.set(0, 18, isLeft ? -10 : 10);
    } else {
      this.forceVectorArrow.visible = false;
    }

    // 4. Câmera Isométrica com Foco 100% no Carrinho (Mobile & Desktop)
    // Nunca deixa o carro sair da tela, adaptando a distância em telas verticais (mobile)
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    const isPortrait = aspect < 1.0;
    const zoomScale = isPortrait ? Math.min(1.45, 0.92 / Math.max(0.45, aspect)) : 1.0;

    const leadDist = Math.min(32, physicsCar.speed * 4.5);
    const focusX = this.carGroup.position.x + Math.cos(physicsCar.angle) * leadDist;
    const focusZ = this.carGroup.position.z + Math.sin(physicsCar.angle) * leadDist;

    const camHeight = 390 * zoomScale;
    const camOffsetZ = 390 * zoomScale;
    // No celular vertical, desloca ligeiramente o foco para que o carro fique acima dos botões touch
    const screenBiasZ = isPortrait ? 32 : 10;

    const targetCamX = focusX;
    const targetCamZ = focusZ + camOffsetZ;

    if (!this._camInitialized) {
      this.camera.position.set(targetCamX, camHeight, targetCamZ);
      this._camLookX = focusX;
      this._camLookZ = focusZ + screenBiasZ;
      this._camInitialized = true;
    } else {
      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.16;
      this.camera.position.y += (camHeight - this.camera.position.y) * 0.12;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.16;
      this._camLookX += (focusX - this._camLookX) * 0.22;
      this._camLookZ += ((focusZ + screenBiasZ) - this._camLookZ) * 0.22;
    }

    this.camera.lookAt(this._camLookX, 8, this._camLookZ);
  }

  buildNameSprite(nameText, colorHex = "#7ee8fa") {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(12, 8, 30, 0.85)";
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 48, 20);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((nameText || "Piloto").substring(0, 14), 128, 33);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(65, 16, 1);
    sprite.position.set(0, 44, 0);
    return sprite;
  }

  updateOtherCars(playersData) {
    if (!playersData) return;

    for (let id in playersData) {
      const p = playersData[id];
      let oCar = this.otherCars[id];

      if (!oCar) {
        const carData = this.buildCarMesh(p.color || "#1e90ff", false);
        const label = this.buildNameSprite(p.name || "Piloto", p.color || "#7ee8fa");
        carData.group.add(label);
        carData.group.position.set(p.x || 0, 6, p.z || -255);
        carData.group.rotation.y = -(p.angle || 0);
        oCar = carData;
        this.otherCars[id] = oCar;
        this.scene.add(oCar.group);
      }

      const dx = p.x - oCar.group.position.x;
      const dz = p.z - oCar.group.position.z;
      const moveSpeed = Math.hypot(dx, dz);

      oCar.group.position.x += dx * 0.35;
      oCar.group.position.y = 6;
      oCar.group.position.z += dz * 0.35;
      oCar.group.rotation.y = -(p.angle || 0);

      if (oCar.bodyGroup) {
        oCar.bodyGroup.rotation.x = (p.roll || 0) * 0.42;
        oCar.bodyGroup.rotation.z = (p.pitch || 0) * 0.25;
      }
      if (oCar.wheels) {
        oCar.wheels.fl.rotation.y = -(p.steer || 0);
        oCar.wheels.fr.rotation.y = -(p.steer || 0);
        const spin = Math.min(0.8, moveSpeed * 0.1);
        oCar.wheels.fl.rotation.z += spin;
        oCar.wheels.fr.rotation.z += spin;
        oCar.wheels.rl.rotation.z += spin;
        oCar.wheels.rr.rotation.z += spin;
      }
    }

    for (let id in this.otherCars) {
      if (!playersData[id]) {
        this.scene.remove(this.otherCars[id].group);
        delete this.otherCars[id];
      }
    }
  }

  updateGhostCar(ghostPose) {
    if (!ghostPose) {
      if (this.ghostGroup) this.ghostGroup.group.visible = false;
      return;
    }

    if (!this.ghostGroup) {
      this.ghostGroup = this.buildCarMesh("#7ee8fa", true);
      this.scene.add(this.ghostGroup.group);
    }

    this.ghostGroup.group.visible = true;
    this.ghostGroup.group.position.set(ghostPose.x, 6, ghostPose.z);
    this.ghostGroup.group.rotation.y = -ghostPose.angle;

    if (this.ghostGroup.bodyGroup) {
      this.ghostGroup.bodyGroup.rotation.x = (ghostPose.roll || 0) * 0.42;
      this.ghostGroup.bodyGroup.rotation.z = (ghostPose.pitch || 0) * 0.25;
    }
    if (this.ghostGroup.wheels) {
      this.ghostGroup.wheels.fl.rotation.y = -(ghostPose.steerAngle || 0);
      this.ghostGroup.wheels.fr.rotation.y = -(ghostPose.steerAngle || 0);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

window.Game3D = Game3D;
