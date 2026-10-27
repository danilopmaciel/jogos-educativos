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

  /* Modelagem autêntica do carro estilo Marauder / Rock n' Roll Racing SNES */
  buildCarMesh(colorHex = "#ff4757", isGhost = false) {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: isGhost ? 0.3 : 0.85,
      roughness: isGhost ? 0.4 : 0.22,
      transparent: isGhost,
      opacity: isGhost ? 0.55 : 1.0
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: "#dfe4ea",
      metalness: 0.95,
      roughness: 0.1
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: "#18142c",
      metalness: 0.9,
      roughness: 0.1,
      transparent: isGhost,
      opacity: isGhost ? 0.45 : 0.95
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: "#151320",
      roughness: 0.8,
      metalness: 0.1
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: "#ffd23f",
      metalness: 0.85,
      roughness: 0.2
    });

    // 1. Chassi musculoso do carro (Comprimento = eixo X, Largura = eixo Z)
    const chassiGeo = new THREE.BoxGeometry(56, 14, 34);
    const chassi = new THREE.Mesh(chassiGeo, bodyMat);
    chassi.position.y = 13;
    chassi.castShadow = !isGhost;
    chassi.receiveShadow = !isGhost;
    group.add(chassi);

    // Cabine com vidro
    const cabinGeo = new THREE.BoxGeometry(28, 12, 26);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(-2, 23, 0);
    cabin.castShadow = !isGhost;
    group.add(cabin);

    // Supercharger / Blower cromado no capô (+X é a frente do carro!)
    const blowerGeo = new THREE.BoxGeometry(12, 8, 14);
    const blower = new THREE.Mesh(blowerGeo, chromeMat);
    blower.position.set(16, 22, 0);
    blower.castShadow = !isGhost;
    group.add(blower);

    // Entradas duplas de ar no topo do soprador
    const scoopGeo = new THREE.BoxGeometry(4, 4, 4);
    const s1 = new THREE.Mesh(scoopGeo, chromeMat);
    s1.position.set(22, 23, -4);
    group.add(s1);
    const s2 = new THREE.Mesh(scoopGeo, chromeMat);
    s2.position.set(22, 23, 4);
    group.add(s2);

    // Escapamentos laterais duplos cromados (apontando para trás no eixo X)
    const pipeGeo = new THREE.CylinderGeometry(2, 2, 26, 12);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeL = new THREE.Mesh(pipeGeo, chromeMat);
    pipeL.position.set(-10, 8, -18);
    group.add(pipeL);
    const pipeR = new THREE.Mesh(pipeGeo, chromeMat);
    pipeR.position.set(-10, 8, 18);
    group.add(pipeR);

    // Faixa central amarela de corrida
    const stripeGeo = new THREE.BoxGeometry(56.2, 14.2, 8);
    const stripe = new THREE.Mesh(stripeGeo, goldMat);
    stripe.position.y = 13;
    group.add(stripe);

    // Aerofólio esportivo traseiro (-X é a traseira)
    const wingGeo = new THREE.BoxGeometry(8, 3, 38);
    const wing = new THREE.Mesh(wingGeo, bodyMat);
    wing.position.set(-26, 28, 0);
    wing.castShadow = !isGhost;
    group.add(wing);

    const wingPostGeo = new THREE.CylinderGeometry(1.5, 1.5, 12);
    const wp1 = new THREE.Mesh(wingPostGeo, chromeMat);
    wp1.position.set(-26, 22, -14);
    group.add(wp1);
    const wp2 = new THREE.Mesh(wingPostGeo, chromeMat);
    wp2.position.set(-26, 22, 14);
    group.add(wp2);

    // Faróis dianteiros duplos brilhantes (+X)
    const lampMat = new THREE.MeshBasicMaterial({ color: "#7ee8fa" });
    const lampGeo = new THREE.BoxGeometry(2, 5, 7);
    const fl1 = new THREE.Mesh(lampGeo, lampMat);
    fl1.position.set(28, 13, -10);
    group.add(fl1);
    const fl2 = new THREE.Mesh(lampGeo, lampMat);
    fl2.position.set(28, 13, 10);
    group.add(fl2);

    // Lanternas de freio traseiras (-X)
    const brakeMat = new THREE.MeshBasicMaterial({ color: "#ff4757" });
    const bl1 = new THREE.Mesh(lampGeo, brakeMat);
    bl1.position.set(-28, 13, -11);
    group.add(bl1);
    const bl2 = new THREE.Mesh(lampGeo, brakeMat);
    bl2.position.set(-28, 13, 11);
    group.add(bl2);

    // 2. RODAS ALINHADAS PERFEITAMENTE:
    // O cilindro em Three.js nasce no eixo Y.
    // Para rodar como pneu no plano de rolamento X, o eixo do cilindro deve ficar ao longo de Z!
    // Logo, rotacionamos o CylinderGeometry em X (rotateX(Math.PI / 2))!
    const wheelGeo = new THREE.CylinderGeometry(10, 10, 8, 24);
    wheelGeo.rotateX(Math.PI / 2); // Eixo ao longo de Z (roda alinhada para frente em X)

    const wheelFL = new THREE.Mesh(wheelGeo, tireMat);
    const wheelFR = new THREE.Mesh(wheelGeo, tireMat);
    const wheelRL = new THREE.Mesh(wheelGeo, tireMat);
    const wheelRR = new THREE.Mesh(wheelGeo, tireMat);

    wheelFL.position.set(16, 10, -20);
    wheelFR.position.set(16, 10, 20);
    wheelRL.position.set(-16, 10, -20);
    wheelRR.position.set(-16, 10, 20);

    // Calotas douradas
    [wheelFL, wheelFR, wheelRL, wheelRR].forEach(w => {
      w.castShadow = !isGhost;
      const rimGeo = new THREE.CylinderGeometry(5.5, 5.5, 8.2, 16);
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, goldMat);
      w.add(rim);
    });

    // Amortecedores e Molas Helicoidais amarelas
    const springMat = new THREE.MeshStandardMaterial({ color: "#ffd23f", metalness: 0.9, roughness: 0.1 });
    const springGeo = new THREE.CylinderGeometry(2.5, 2.5, 9, 12);

    const sFL = new THREE.Mesh(springGeo, springMat);
    sFL.position.set(16, 13, -14);
    const sFR = new THREE.Mesh(springGeo, springMat);
    sFR.position.set(16, 13, 14);
    const sRL = new THREE.Mesh(springGeo, springMat);
    sRL.position.set(-16, 13, -14);
    const sRR = new THREE.Mesh(springGeo, springMat);
    sRR.position.set(-16, 13, 14);

    group.add(wheelFL, wheelFR, wheelRL, wheelRR);
    group.add(sFL, sFR, sRL, sRR);

    return {
      group,
      bodyMesh: chassi,
      wheels: { fl: wheelFL, fr: wheelFR, rl: wheelRL, rr: wheelRR },
      springs: { fl: sFL, fr: sFR, rl: sRL, rr: sRR }
    };
  }

  buildPlayerCar() {
    const carData = this.buildCarMesh("#ff4757", false);
    this.carGroup = carData.group;
    this.carBody = carData.bodyMesh;
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
    this.carGroup.position.y = 6; // Topo do asfalto chanfrado (depth 4 + bevelThickness 2 = 6)
    this.carGroup.position.z = physicsCar.z;
    this.carGroup.rotation.y = -physicsCar.angle;

    // Amortecedores com compressão lateral ativa
    if (this.carBody) {
      this.carBody.rotation.x = physicsCar.roll * 0.22;
      this.carBody.rotation.z = -physicsCar.pitch * 0.14;
      this.carBody.position.y = 13 + Math.abs(physicsCar.roll) * 1.5 - physicsCar.pitch * 2.0;

      if (this.carParts && this.carParts.springs) {
        this.carParts.springs.fl.scale.y = 1.0 - physicsCar.roll * 0.45;
        this.carParts.springs.fr.scale.y = 1.0 + physicsCar.roll * 0.45;
        this.carParts.springs.rl.scale.y = 1.0 - physicsCar.roll * 0.35 + physicsCar.pitch * 0.3;
        this.carParts.springs.rr.scale.y = 1.0 + physicsCar.roll * 0.35 + physicsCar.pitch * 0.3;
      }
    }

    // Rodas com esterçamento dianteiro e rotação ao longo de Z (giro para frente do pneu)
    if (this.carParts && this.carParts.wheels) {
      // Invertemos o sinal para esterçar corretamente de acordo com o referencial Three.js
      this.carParts.wheels.fl.rotation.y = -physicsCar.steerAngle;
      this.carParts.wheels.fr.rotation.y = -physicsCar.steerAngle;

      const spinSpeed = physicsCar.speed * 0.14;
      this.carParts.wheels.fl.rotation.z += spinSpeed;
      this.carParts.wheels.fr.rotation.z += spinSpeed;
      this.carParts.wheels.rl.rotation.z += spinSpeed;
      this.carParts.wheels.rr.rotation.z += spinSpeed;
    }

    // Vetor Força Lateral:
    // +Z é o lado direito do carro, -Z é o lado esquerdo do carro
    if (physicsCar.vectorLeftActive || physicsCar.vectorRightActive) {
      this.forceVectorArrow.visible = true;
      const isLeft = physicsCar.vectorLeftActive;
      // Para esquerda (-Z): rotaciona 180° (Math.PI) em torno do eixo Y
      // Para direita (+Z): sem rotação adicional (0)
      this.forceVectorArrow.rotation.y = isLeft ? Math.PI : 0;
      this.forceVectorArrow.position.set(0, 18, isLeft ? -10 : 10);
    } else {
      this.forceVectorArrow.visible = false;
    }

    // Câmera isométrica acompanhando o carro suavemente
    const targetCamX = this.carGroup.position.x * 0.45;
    const targetCamZ = this.carGroup.position.z * 0.45 + 500;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.08;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.08;
    this.camera.lookAt(this.carGroup.position.x * 0.3, 0, this.carGroup.position.z * 0.3);
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

      if (oCar.bodyMesh) {
        oCar.bodyMesh.rotation.x = (p.roll || 0) * 0.22;
        oCar.bodyMesh.rotation.z = -(p.pitch || 0) * 0.14;
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

    if (this.ghostGroup.bodyMesh) {
      this.ghostGroup.bodyMesh.rotation.x = (ghostPose.roll || 0) * 0.22;
      this.ghostGroup.bodyMesh.rotation.z = -(ghostPose.pitch || 0) * 0.14;
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
