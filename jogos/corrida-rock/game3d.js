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
    this.forceVectorArrow = null;
    this.turboFlameParticles = [];
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
    // Fundo espacial roxo/cósmico característico dos planetas do SNES (ex: Planet Chem 6 / Bogmire / New Mojave)
    this.scene.background = new THREE.Color("#0a0618");
    this.scene.fog = new THREE.FogExp2("#0a0618", 0.00085);

    // Câmera isométrica em ângulo clássico de 45° (Rock n' Roll Racing SNES)
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 1, 4000);
    this.camera.position.set(0, 520, 560);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    // Luz ambiente com tom arroxeado/azulado sci-fi
    const ambientLight = new THREE.AmbientLight("#8c7ae6", 0.85);
    this.scene.add(ambientLight);

    // Sol cósmico forte com contraste arcade
    const dirLight = new THREE.DirectionalLight("#fff2a8", 1.6);
    dirLight.position.set(320, 650, 280);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 50;
    dirLight.shadow.camera.far = 1800;
    const d = 650;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0004;
    this.scene.add(dirLight);

    // Luz de preenchimento magenta/neon (estilo visual anos 90)
    const neonRim = new THREE.DirectionalLight("#e056fd", 0.65);
    neonRim.position.set(-350, 220, -320);
    this.scene.add(neonRim);
  }

  buildSNESPlanetEnvironment() {
    // 1. Chão do planeta alienígena (terreno rochoso escuro com relevo)
    const groundGeo = new THREE.PlaneGeometry(3000, 3000, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: "#0f0b24",
      roughness: 0.9,
      metalness: 0.15
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Cristais e estruturas alienígenas nas bordas do circuito (estilo cenários do SNES)
    const crystalGeo = new THREE.ConeGeometry(14, 45, 6);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: "#686de0",
      emissive: "#4834d4",
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.8
    });

    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const dist = 580 + (i % 3) * 60;
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(Math.cos(angle) * dist, 18, Math.sin(angle) * dist);
      crystal.rotation.x = (Math.random() - 0.5) * 0.4;
      crystal.rotation.z = (Math.random() - 0.5) * 0.4;
      crystal.castShadow = true;
      this.scene.add(crystal);
    }
  }

  buildTrack() {
    // Dimensões do circuito 3D - Pista bem mais ampla
    const w = 840;
    const h = 600;
    const roadWidth = 220; // Pista extra larga
    const r = 160;

    this.trackDimensions = { w, h, roadWidth, r };

    // Caminho da pista 2D para extrusão com curvas suaves
    const shape = new THREE.Shape();
    const halfW = w / 2;
    const halfH = h / 2;

    shape.moveTo(-halfW + r, -halfH);
    shape.lineTo(halfW - r, -halfH);
    shape.absarc(halfW - r, -halfH + r, r, -Math.PI / 2, 0, false);
    shape.lineTo(halfW, halfH - r);
    shape.absarc(halfW - r, halfH - r, r, 0, Math.PI / 2, false);
    shape.lineTo(-halfW + r, halfH);
    shape.absarc(-halfW + r, halfH - r, r, Math.PI / 2, Math.PI, false);
    shape.lineTo(-halfW, -halfH + r);
    shape.absarc(-halfW + r, -halfH + r, r, Math.PI, Math.PI * 1.5, false);

    // Furo central (Miolo da pista / Ilha interna)
    const hole = new THREE.Path();
    const iw = halfW - roadWidth;
    const ih = halfH - roadWidth;
    const ir = Math.max(30, r - roadWidth * 0.85);

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

    // Pista com relevo robusto e chanfrado 3D
    const extrudeSettings = { depth: 4, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 3, bevelThickness: 2 };
    const trackGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Asfalto escuro com leve reflexo metálico e borracha de pneu (estilo asfalto futurista do Rock n Roll Racing)
    const trackMat = new THREE.MeshStandardMaterial({
      color: "#28243c",
      roughness: 0.55,
      metalness: 0.35
    });

    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = 0;
    trackMesh.receiveShadow = true;
    this.scene.add(trackMesh);

    // Linha guia amarela tracejada central no asfalto
    this.buildCenterRoadLine(halfW, halfH, roadWidth);

    // Zebras chanfradas estilo arcade SNES
    this.buildSNESCurbs(halfW, halfH, roadWidth);

    // Pórtico de Largada / Chegada com luzes de semáforo
    this.buildSNESGantry(halfW, halfH, roadWidth);
  }

  buildCenterRoadLine(halfW, halfH, roadWidth) {
    const lineMat = new THREE.MeshBasicMaterial({ color: "#ffd23f" });
    const dashGeo = new THREE.BoxGeometry(14, 0.4, 3);
    const midTopZ = -halfH + roadWidth / 2;
    const midBottomZ = halfH - roadWidth / 2;

    for (let x = -halfW + roadWidth; x <= halfW - roadWidth; x += 32) {
      const d1 = new THREE.Mesh(dashGeo, lineMat);
      d1.position.set(x, 4.2, midTopZ);
      this.scene.add(d1);

      const d2 = new THREE.Mesh(dashGeo, lineMat);
      d2.position.set(x, 4.2, midBottomZ);
      this.scene.add(d2);
    }
  }

  buildSNESCurbs(halfW, halfH, roadWidth) {
    const redMat = new THREE.MeshStandardMaterial({ color: "#eb2f06", roughness: 0.35 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: "#f5f6fa", roughness: 0.35 });

    // Barreiras e zebras segmentadas nas laterais
    const blockGeo = new THREE.BoxGeometry(18, 5, 8);

    for (let x = -halfW + 60; x <= halfW - 60; x += 20) {
      const isRed = (Math.floor(x / 20) % 2 === 0);
      const mat = isRed ? redMat : whiteMat;

      // Borda Externa Superior e Inferior
      const cTop = new THREE.Mesh(blockGeo, mat);
      cTop.position.set(x, 4.5, -halfH - 2);
      cTop.castShadow = true;
      this.scene.add(cTop);

      const cBottom = new THREE.Mesh(blockGeo, mat);
      cBottom.position.set(x, 4.5, halfH + 2);
      cBottom.castShadow = true;
      this.scene.add(cBottom);

      // Borda Interna Superior e Inferior
      const cInTop = new THREE.Mesh(blockGeo, mat);
      cInTop.position.set(x * 0.7, 4.5, -halfH + roadWidth + 2);
      cInTop.castShadow = true;
      this.scene.add(cInTop);

      const cInBottom = new THREE.Mesh(blockGeo, mat);
      cInBottom.position.set(x * 0.7, 4.5, halfH - roadWidth - 2);
      cInBottom.castShadow = true;
      this.scene.add(cInBottom);
    }
  }

  buildSNESGantry(halfW, halfH, roadWidth) {
    const gantry = new THREE.Group();

    // Vigas treliçadas amarelas estilo industrial rock
    const trussMat = new THREE.MeshStandardMaterial({ color: "#fbc531", metalness: 0.7, roughness: 0.3 });
    const colGeo = new THREE.CylinderGeometry(5, 5, 130, 8);

    const post1 = new THREE.Mesh(colGeo, trussMat);
    post1.position.set(0, 65, -halfH);
    post1.castShadow = true;
    gantry.add(post1);

    const post2 = new THREE.Mesh(colGeo, trussMat);
    post2.position.set(0, 65, -halfH + roadWidth);
    post2.castShadow = true;
    gantry.add(post2);

    const beamGeo = new THREE.BoxGeometry(14, 14, roadWidth + 8);
    const beam = new THREE.Mesh(beamGeo, trussMat);
    beam.position.set(0, 120, -halfH + roadWidth / 2);
    beam.castShadow = true;
    gantry.add(beam);

    // Semáforo com luzes neon de largada (Vermelha, Amarela, Verde)
    const lampGeo = new THREE.SphereGeometry(4, 16, 16);
    const redLight = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: "#ff4757" }));
    redLight.position.set(8, 120, -halfH + roadWidth / 2 - 20);
    gantry.add(redLight);

    const yellowLight = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: "#ffa502" }));
    yellowLight.position.set(8, 120, -halfH + roadWidth / 2);
    gantry.add(yellowLight);

    const greenLight = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: "#2ed573" }));
    greenLight.position.set(8, 120, -halfH + roadWidth / 2 + 20);
    gantry.add(greenLight);

    // Linha de chegada quadriculada no chão
    const sqSize = 16;
    const cols = Math.floor(roadWidth / sqSize);
    const matW = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.2 });
    const matB = new THREE.MeshStandardMaterial({ color: "#1e272e", roughness: 0.4 });
    const tileGeo = new THREE.PlaneGeometry(sqSize, sqSize);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = new THREE.Mesh(tileGeo, (r + c) % 2 === 0 ? matW : matB);
        tile.rotation.x = -Math.PI / 2;
        tile.position.set((r - 0.5) * sqSize, 4.2, -halfH + c * sqSize + sqSize / 2);
        tile.receiveShadow = true;
        gantry.add(tile);
      }
    }

    this.scene.add(gantry);
  }

  /* Modelagem do Carro estilo Rock n' Roll Racing SNES (Marauder / Crusher / Battle Trak) */
  buildCarMesh(colorHex = "#eb2f06", isGhost = false) {
    const group = new THREE.Group();

    // Materiais
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: isGhost ? 0.3 : 0.85,
      roughness: isGhost ? 0.4 : 0.2,
      transparent: isGhost,
      opacity: isGhost ? 0.55 : 1.0
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: "#dfe4ea",
      metalness: 0.95,
      roughness: 0.1
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: "#2f3542",
      metalness: 0.9,
      roughness: 0.1,
      transparent: isGhost,
      opacity: isGhost ? 0.45 : 0.95
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: "#1e272e",
      roughness: 0.85,
      metalness: 0.05
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: "#eccc68",
      metalness: 0.9,
      roughness: 0.15
    });

    // 1. Chassi Musculoso (Muscle Car off-road / Mad Max)
    const chassiGeo = new THREE.BoxGeometry(56, 14, 34);
    const chassi = new THREE.Mesh(chassiGeo, bodyMat);
    chassi.position.y = 12;
    chassi.castShadow = !isGhost;
    chassi.receiveShadow = !isGhost;
    group.add(chassi);

    // Cabine arredondada e inclinada
    const cabinGeo = new THREE.BoxGeometry(28, 12, 26);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(-2, 22, 0);
    cabin.castShadow = !isGhost;
    group.add(cabin);

    // Supercharger / Soprador de ar cromado no capô (clássico dos carros do jogo!)
    const blowerGeo = new THREE.BoxGeometry(10, 8, 12);
    const blower = new THREE.Mesh(blowerGeo, chromeMat);
    blower.position.set(16, 21, 0);
    blower.castShadow = !isGhost;
    group.add(blower);

    const scoopGeo = new THREE.CylinderGeometry(2, 2, 8, 12);
    scoopGeo.rotateZ(Math.PI / 2);
    const scoop1 = new THREE.Mesh(scoopGeo, chromeMat);
    scoop1.position.set(22, 23, -3.5);
    group.add(scoop1);
    const scoop2 = new THREE.Mesh(scoopGeo, chromeMat);
    scoop2.position.set(22, 23, 3.5);
    group.add(scoop2);

    // Escapamentos laterais cromados duplos
    const pipeGeo = new THREE.CylinderGeometry(1.8, 1.8, 30, 12);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeL = new THREE.Mesh(pipeGeo, chromeMat);
    pipeL.position.set(-8, 8, -18);
    group.add(pipeL);
    const pipeR = new THREE.Mesh(pipeGeo, chromeMat);
    pipeR.position.set(-8, 8, 18);
    group.add(pipeR);

    // Faixa amarela de corrida central
    const stripeGeo = new THREE.BoxGeometry(56.2, 14.2, 8);
    const stripe = new THREE.Mesh(stripeGeo, goldMat);
    stripe.position.y = 12;
    group.add(stripe);

    // Aerofólio Alto Esportivo Traseiro
    const wingGeo = new THREE.BoxGeometry(8, 3, 38);
    const wing = new THREE.Mesh(wingGeo, bodyMat);
    wing.position.set(-25, 28, 0);
    wing.castShadow = !isGhost;
    group.add(wing);

    const wingPostGeo = new THREE.CylinderGeometry(1.5, 1.5, 12);
    const wp1 = new THREE.Mesh(wingPostGeo, chromeMat);
    wp1.position.set(-25, 22, -14);
    group.add(wp1);
    const wp2 = new THREE.Mesh(wingPostGeo, chromeMat);
    wp2.position.set(-25, 22, 14);
    group.add(wp2);

    // Faróis dianteiros duplos com xenônio
    const lampMat = new THREE.MeshBasicMaterial({ color: "#70a1ff" });
    const lampGeo = new THREE.BoxGeometry(2, 4, 6);
    const fl1 = new THREE.Mesh(lampGeo, lampMat);
    fl1.position.set(28, 13, -11);
    group.add(fl1);
    const fl2 = new THREE.Mesh(lampGeo, lampMat);
    fl2.position.set(28, 13, 11);
    group.add(fl2);

    // Lanternas de freio traseiras vermelhas
    const brakeMat = new THREE.MeshBasicMaterial({ color: "#ff4757" });
    const bl1 = new THREE.Mesh(lampGeo, brakeMat);
    bl1.position.set(-28, 13, -12);
    group.add(bl1);
    const bl2 = new THREE.Mesh(lampGeo, brakeMat);
    bl2.position.set(-28, 13, 12);
    group.add(bl2);

    // 2. Rodas Grandes e Pneus Off-road com Garras (estilo Marauder)
    const wheelGeo = new THREE.CylinderGeometry(10, 10, 8, 24);
    wheelGeo.rotateZ(Math.PI / 2);

    const wheelFL = new THREE.Mesh(wheelGeo, tireMat);
    const wheelFR = new THREE.Mesh(wheelGeo, tireMat);
    const wheelRL = new THREE.Mesh(wheelGeo, tireMat);
    const wheelRR = new THREE.Mesh(wheelGeo, tireMat);

    wheelFL.position.set(16, 9, -20);
    wheelFR.position.set(16, 9, 20);
    wheelRL.position.set(-16, 9, -20);
    wheelRR.position.set(-16, 9, 20);

    // Calotas metálicas douradas
    [wheelFL, wheelFR, wheelRL, wheelRR].forEach(w => {
      w.castShadow = !isGhost;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 8.2, 12), goldMat);
      rim.rotation.z = Math.PI / 2;
      w.add(rim);
    });

    // Amortecedores e Molas Helicoidais amarelas esportivas
    const springMat = new THREE.MeshStandardMaterial({ color: "#fbc531", metalness: 0.9, roughness: 0.1 });
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
    const carData = this.buildCarMesh("#eb2f06", false);
    this.carGroup = carData.group;
    this.carBody = carData.bodyMesh;
    this.carParts = carData;
    this.scene.add(this.carGroup);

    this.carGroup.position.set(0, 0, -190);
  }

  buildForceVector() {
    this.forceVectorArrow = new THREE.Group();

    // Haste de energia neon
    const shaftGeo = new THREE.CylinderGeometry(2.4, 2.4, 46, 16);
    shaftGeo.rotateX(Math.PI / 2);
    const shaftMat = new THREE.MeshBasicMaterial({ color: "#00d2d3" });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.z = 23;
    this.forceVectorArrow.add(shaft);

    // Ponta de flecha com brilho
    const tipGeo = new THREE.ConeGeometry(8, 20, 16);
    tipGeo.rotateX(Math.PI / 2);
    const tip = new THREE.Mesh(tipGeo, shaftMat);
    tip.position.z = 50;
    this.forceVectorArrow.add(tip);

    // Penas da flecha (Fletching)
    const featherGeo = new THREE.BoxGeometry(1.5, 12, 16);
    const fletchMat = new THREE.MeshBasicMaterial({ color: "#feca57" });
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
    this.carGroup.position.z = physicsCar.z;
    this.carGroup.rotation.y = -physicsCar.angle;

    // Amortecedores com compressão lateral ativa
    if (this.carBody) {
      this.carBody.rotation.x = physicsCar.roll * 0.24;
      this.carBody.rotation.z = -physicsCar.pitch * 0.16;
      this.carBody.position.y = 12 + Math.abs(physicsCar.roll) * 1.8 - physicsCar.pitch * 2.2;

      if (this.carParts && this.carParts.springs) {
        this.carParts.springs.fl.scale.y = 1.0 - physicsCar.roll * 0.5;
        this.carParts.springs.fr.scale.y = 1.0 + physicsCar.roll * 0.5;
        this.carParts.springs.rl.scale.y = 1.0 - physicsCar.roll * 0.4 + physicsCar.pitch * 0.35;
        this.carParts.springs.rr.scale.y = 1.0 + physicsCar.roll * 0.4 + physicsCar.pitch * 0.35;
      }
    }

    if (this.carParts && this.carParts.wheels) {
      this.carParts.wheels.fl.rotation.y = physicsCar.steerAngle;
      this.carParts.wheels.fr.rotation.y = physicsCar.steerAngle;

      const spinSpeed = physicsCar.speed * 0.14;
      this.carParts.wheels.fl.rotation.x += spinSpeed;
      this.carParts.wheels.fr.rotation.x += spinSpeed;
      this.carParts.wheels.rl.rotation.x += spinSpeed;
      this.carParts.wheels.rr.rotation.x += spinSpeed;
    }

    // Vetor Força Lateral
    if (physicsCar.vectorLeftActive || physicsCar.vectorRightActive) {
      this.forceVectorArrow.visible = true;
      const isLeft = physicsCar.vectorLeftActive;
      this.forceVectorArrow.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;
      this.forceVectorArrow.position.z = isLeft ? -12 : 12;
    } else {
      this.forceVectorArrow.visible = false;
    }

    // Câmera isométrica acompanhando o carro suavemente
    const targetCamX = this.carGroup.position.x * 0.42;
    const targetCamZ = this.carGroup.position.z * 0.42 + 480;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.08;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.08;
    this.camera.lookAt(this.carGroup.position.x * 0.28, 0, this.carGroup.position.z * 0.28);
  }

  updateOtherCars(playersData) {
    if (!playersData) return;

    for (let id in playersData) {
      const p = playersData[id];
      let oCar = this.otherCars[id];

      if (!oCar) {
        const carData = this.buildCarMesh(p.color || "#0984e3", false);
        oCar = carData;
        this.otherCars[id] = oCar;
        this.scene.add(oCar.group);
      }

      oCar.group.position.x += (p.x - oCar.group.position.x) * 0.25;
      oCar.group.position.z += (p.z - oCar.group.position.z) * 0.25;
      oCar.group.rotation.y = -p.angle;

      if (oCar.bodyMesh) {
        oCar.bodyMesh.rotation.x = (p.roll || 0) * 0.24;
        oCar.bodyMesh.rotation.z = -(p.pitch || 0) * 0.16;
      }
      if (oCar.wheels) {
        oCar.wheels.fl.rotation.y = p.steer || 0;
        oCar.wheels.fr.rotation.y = p.steer || 0;
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
      this.ghostGroup = this.buildCarMesh("#00d2d3", true);
      this.scene.add(this.ghostGroup.group);
    }

    this.ghostGroup.group.visible = true;
    this.ghostGroup.group.position.set(ghostPose.x, 0, ghostPose.z);
    this.ghostGroup.group.rotation.y = -ghostPose.angle;

    if (this.ghostGroup.bodyMesh) {
      this.ghostGroup.bodyMesh.rotation.x = (ghostPose.roll || 0) * 0.24;
      this.ghostGroup.bodyMesh.rotation.z = -(ghostPose.pitch || 0) * 0.16;
    }
    if (this.ghostGroup.wheels) {
      this.ghostGroup.wheels.fl.rotation.y = ghostPose.steerAngle || 0;
      this.ghostGroup.wheels.fr.rotation.y = ghostPose.steerAngle || 0;
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
