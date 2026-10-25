/* ============================================================================
   CORRIDA ROCK 3D — ENGINE THREE.JS (PISTA, CARRO, AMORTECEDORES E SHADERS)
   ========================================================================== */

class Game3D {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.carGroup = null;
    this.carBody = null;
    this.wheels = [];
    this.suspensionArms = [];
    this.forceVectorArrow = null;
    this.turboParticles = [];
    this.ghostGroup = null;
    this.otherCars = {}; // { id: THREE.Group }
    this.trackMeshes = [];
    this.trackDimensions = null;
    this.clock = new THREE.Clock();

    this.initScene();
    this.buildTrack();
    this.buildPlayerCar();
    this.buildForceVector();
    this.setupLighting();

    window.addEventListener("resize", () => this.onResize());
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#120e24");
    this.scene.fog = new THREE.FogExp2("#120e24", 0.0012);

    // Câmera isométrica com visão superior em perspectiva dramática
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 3000);
    this.camera.position.set(0, 580, 520);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    // Luz ambiente suave
    const ambientLight = new THREE.AmbientLight("#a29bfe", 0.75);
    this.scene.add(ambientLight);

    // Luz Direcional Principal (Sol do circuito com sombras nítidas)
    const dirLight = new THREE.DirectionalLight("#fff2cc", 1.4);
    dirLight.position.set(250, 600, 300);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 50;
    dirLight.shadow.camera.far = 1600;
    const d = 600;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Luz secundária quente de preenchimento (estilo pôr do sol rock n' roll)
    const rimLight = new THREE.DirectionalLight("#ff7675", 0.6);
    rimLight.position.set(-300, 200, -300);
    this.scene.add(rimLight);
  }

  buildTrack() {
    // Dimensões do circuito 3D
    const w = 820;
    const h = 580;
    const roadWidth = 210; // Pista extra larga
    const r = 160;

    this.trackDimensions = { w, h, roadWidth, r };

    // 1. Chão com grama e relevo
    const groundGeo = new THREE.PlaneGeometry(2400, 2400);
    const groundMat = new THREE.MeshStandardMaterial({
      color: "#0c0a1a",
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Criação do caminho da pista em 2D Shape extrudado
    const shape = new THREE.Shape();
    const halfW = w / 2;
    const halfH = h / 2;

    // Retângulo arredondado externo
    shape.moveTo(-halfW + r, -halfH);
    shape.lineTo(halfW - r, -halfH);
    shape.absarc(halfW - r, -halfH + r, r, -Math.PI / 2, 0, false);
    shape.lineTo(halfW, halfH - r);
    shape.absarc(halfW - r, halfH - r, r, 0, Math.PI / 2, false);
    shape.lineTo(-halfW + r, halfH);
    shape.absarc(-halfW + r, halfH - r, r, Math.PI / 2, Math.PI, false);
    shape.lineTo(-halfW, -halfH + r);
    shape.absarc(-halfW + r, -halfH + r, r, Math.PI, Math.PI * 1.5, false);

    // Furo central (Ilha interna)
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

    // Asfalto com relevo de 3 unidades
    const extrudeSettings = { depth: 3, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 2, bevelThickness: 1.5 };
    const trackGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const trackMat = new THREE.MeshStandardMaterial({
      color: "#242038",
      roughness: 0.65,
      metalness: 0.25
    });

    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = 0;
    trackMesh.receiveShadow = true;
    this.scene.add(trackMesh);

    // 3. Zebras (Curbs) chanfradas vermelhas e brancas nas bordas
    this.build3DCurbs(shape, hole, r, ir);

    // 4. Linha de Chegada Quadriculada 3D
    this.build3DFinishLine(halfW, halfH, roadWidth);
  }

  build3DCurbs(shape, hole, r, ir) {
    // Material brilhante das zebras
    const curbMatWhite = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.4 });
    const curbMatRed = new THREE.MeshStandardMaterial({ color: "#ff4757", roughness: 0.4 });

    // Cria anéis chanfrados simples para marcar o perímetro
    const curbGeo = new THREE.BoxGeometry(16, 4, 16);
    // Borda estilizada nas retas principais
    for (let x = -280; x <= 280; x += 32) {
      // Borda externa superior e inferior
      const c1 = new THREE.Mesh(curbGeo, (x / 32) % 2 === 0 ? curbMatRed : curbMatWhite);
      c1.position.set(x, 2, -290);
      c1.receiveShadow = true;
      this.scene.add(c1);

      const c2 = new THREE.Mesh(curbGeo, (x / 32) % 2 === 0 ? curbMatWhite : curbMatRed);
      c2.position.set(x, 2, 290);
      c2.receiveShadow = true;
      this.scene.add(c2);
    }
  }

  build3DFinishLine(halfW, halfH, roadWidth) {
    const finishGroup = new THREE.Group();
    const sqSize = 18;
    const rows = 2;
    const cols = Math.floor(roadWidth / sqSize);

    const matWhite = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3 });
    const matDark = new THREE.MeshStandardMaterial({ color: "#161324", roughness: 0.5 });
    const tileGeo = new THREE.PlaneGeometry(sqSize, sqSize);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const mat = (r + c) % 2 === 0 ? matWhite : matDark;
        const tile = new THREE.Mesh(tileGeo, mat);
        tile.rotation.x = -Math.PI / 2;
        tile.position.set((r - 0.5) * sqSize, 3.2, -halfH + c * sqSize + sqSize / 2);
        tile.receiveShadow = true;
        finishGroup.add(tile);
      }
    }

    // Pórtico metálico 3D de largada com letreiro Rock
    const postMat = new THREE.MeshStandardMaterial({ color: "#ffd23f", metalness: 0.8, roughness: 0.2 });
    const postGeo = new THREE.CylinderGeometry(4, 4, 120, 16);
    const post1 = new THREE.Mesh(postGeo, postMat);
    post1.position.set(0, 60, -halfH);
    post1.castShadow = true;
    finishGroup.add(post1);

    const post2 = new THREE.Mesh(postGeo, postMat);
    post2.position.set(0, 60, -halfH + roadWidth);
    post2.castShadow = true;
    finishGroup.add(post2);

    const crossbeamGeo = new THREE.BoxGeometry(10, 12, roadWidth);
    const crossbeam = new THREE.Mesh(crossbeamGeo, postMat);
    crossbeam.position.set(0, 115, -halfH + roadWidth / 2);
    crossbeam.castShadow = true;
    finishGroup.add(crossbeam);

    this.scene.add(finishGroup);
  }

  buildCarMesh(colorHex = "#ff4757", isGhost = false) {
    const group = new THREE.Group();

    // Materiais
    const carMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: isGhost ? 0.2 : 0.82,
      roughness: isGhost ? 0.3 : 0.25,
      transparent: isGhost,
      opacity: isGhost ? 0.55 : 1.0
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: "#18142c",
      metalness: 0.9,
      roughness: 0.1,
      transparent: isGhost,
      opacity: isGhost ? 0.45 : 0.95
    });

    const wheelMat = new THREE.MeshStandardMaterial({
      color: "#1a1727",
      roughness: 0.8,
      metalness: 0.1
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: "#ffd23f",
      metalness: 0.85,
      roughness: 0.2
    });

    // 1. Chassi principal do carro com formato esportivo aerodinâmico
    const bodyGeo = new THREE.BoxGeometry(54, 16, 34);
    const bodyMesh = new THREE.Mesh(bodyGeo, carMat);
    bodyMesh.position.y = 12;
    bodyMesh.castShadow = !isGhost;
    bodyMesh.receiveShadow = !isGhost;
    group.add(bodyMesh);

    // Cabine com para-brisa em cunha
    const cabinGeo = new THREE.BoxGeometry(26, 12, 28);
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(-2, 22, 0);
    cabinMesh.castShadow = !isGhost;
    group.add(cabinMesh);

    // Faixa central de corrida dourada/amarela
    const stripeGeo = new THREE.BoxGeometry(54.2, 16.2, 8);
    const stripeMat = new THREE.MeshStandardMaterial({ color: "#ffd23f", roughness: 0.3 });
    const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
    stripeMesh.position.y = 12;
    group.add(stripeMesh);

    // Aerofólio Traseiro Esportivo
    const spoilerWingGeo = new THREE.BoxGeometry(8, 3, 36);
    const spoilerWing = new THREE.Mesh(spoilerWingGeo, stripeMat);
    spoilerWing.position.set(-24, 26, 0);
    spoilerWing.castShadow = !isGhost;
    group.add(spoilerWing);

    const spoilerLegGeo = new THREE.CylinderGeometry(1.5, 1.5, 10);
    const leg1 = new THREE.Mesh(spoilerLegGeo, carMat);
    leg1.position.set(-24, 21, -12);
    group.add(leg1);
    const leg2 = new THREE.Mesh(spoilerLegGeo, carMat);
    leg2.position.set(-24, 21, 12);
    group.add(leg2);

    // Faróis dianteiros xenônio brilhantes
    const lightMat = new THREE.MeshBasicMaterial({ color: "#7ee8fa" });
    const lightGeo = new THREE.BoxGeometry(2, 5, 8);
    const headlightL = new THREE.Mesh(lightGeo, lightMat);
    headlightL.position.set(27, 12, -10);
    group.add(headlightL);
    const headlightR = new THREE.Mesh(lightGeo, lightMat);
    headlightR.position.set(27, 12, 10);
    group.add(headlightR);

    // 2. Rodas independentes com amortecedores visíveis
    const wheelGeo = new THREE.CylinderGeometry(8, 8, 7, 24);
    wheelGeo.rotateZ(Math.PI / 2); // Rodas no plano Z/X

    const wheelFL = new THREE.Mesh(wheelGeo, wheelMat);
    const wheelFR = new THREE.Mesh(wheelGeo, wheelMat);
    const wheelRL = new THREE.Mesh(wheelGeo, wheelMat);
    const wheelRR = new THREE.Mesh(wheelGeo, wheelMat);

    wheelFL.position.set(16, 8, -19);
    wheelFR.position.set(16, 8, 19);
    wheelRL.position.set(-16, 8, -19);
    wheelRR.position.set(-16, 8, 19);

    [wheelFL, wheelFR, wheelRL, wheelRR].forEach(w => {
      w.castShadow = !isGhost;
      // Calotas metálicas
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 7.2, 12), rimMat);
      cap.rotation.z = Math.PI / 2;
      w.add(cap);
    });

    // Braços de suspensão com mola espiral vermelha
    const springMat = new THREE.MeshStandardMaterial({ color: "#ff4757", metalness: 0.9, roughness: 0.1 });
    const springGeo = new THREE.CylinderGeometry(2, 2, 8, 12);

    const sFL = new THREE.Mesh(springGeo, springMat);
    sFL.position.set(16, 12, -14);
    const sFR = new THREE.Mesh(springGeo, springMat);
    sFR.position.set(16, 12, 14);
    const sRL = new THREE.Mesh(springGeo, springMat);
    sRL.position.set(-16, 12, -14);
    const sRR = new THREE.Mesh(springGeo, springMat);
    sRR.position.set(-16, 12, 14);

    group.add(wheelFL, wheelFR, wheelRL, wheelRR);
    group.add(sFL, sFR, sRL, sRR);

    return {
      group,
      bodyMesh,
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

    // Posição inicial na reta de largada
    this.carGroup.position.set(0, 0, -185);
  }

  buildForceVector() {
    // Criação da Flecha 3D de Força Lateral em Neon
    this.forceVectorArrow = new THREE.Group();

    // Haste brilhante da flecha
    const shaftGeo = new THREE.CylinderGeometry(2.2, 2.2, 45, 16);
    shaftGeo.rotateX(Math.PI / 2);
    const shaftMat = new THREE.MeshBasicMaterial({ color: "#7ee8fa" });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.z = 22.5;
    this.forceVectorArrow.add(shaft);

    // Ponta farpada da flecha (Cone afiado)
    const tipGeo = new THREE.ConeGeometry(7, 18, 16);
    tipGeo.rotateX(Math.PI / 2);
    const tip = new THREE.Mesh(tipGeo, shaftMat);
    tip.position.z = 48;
    this.forceVectorArrow.add(tip);

    // Penas na cauda (Fletching clássico em 3D)
    const fletchMat = new THREE.MeshBasicMaterial({ color: "#ffd23f" });
    const featherGeo = new THREE.BoxGeometry(1.5, 10, 14);
    const feather = new THREE.Mesh(featherGeo, fletchMat);
    feather.position.set(0, 0, 5);
    this.forceVectorArrow.add(feather);

    this.forceVectorArrow.position.set(0, 16, 0);
    this.forceVectorArrow.visible = false;
    this.carGroup.add(this.forceVectorArrow);
  }

  updatePlayerCar(physicsCar) {
    if (!this.carGroup) return;

    // 1. Atualiza posição e rotação global do carro no mundo 3D
    // Coordenadas 2D (x, y) mapeadas para o plano 3D (X, Z)
    this.carGroup.position.x = physicsCar.x;
    this.carGroup.position.z = physicsCar.z;
    this.carGroup.rotation.y = -physicsCar.angle;

    // 2. SISTEMA DE AMORTECEDORES E SUSPENSÃO 3D REAL (Compressão Lateral / Roll & Pitch)
    if (this.carBody) {
      // Body Roll (inclina na direção externa da curva com base na compressão das molas)
      this.carBody.rotation.x = physicsCar.roll * 0.22;
      // Body Pitch (empina aceleração / afunda dianteira)
      this.carBody.rotation.z = -physicsCar.pitch * 0.14;
      // Deslocamento vertical do chassi conforme compressão
      this.carBody.position.y = 12 + Math.abs(physicsCar.roll) * 1.5 - physicsCar.pitch * 2.0;

      // Deformação visual das molas dos amortecedores
      if (this.carParts && this.carParts.springs) {
        this.carParts.springs.fl.scale.y = 1.0 - physicsCar.roll * 0.45;
        this.carParts.springs.fr.scale.y = 1.0 + physicsCar.roll * 0.45;
        this.carParts.springs.rl.scale.y = 1.0 - physicsCar.roll * 0.35 + physicsCar.pitch * 0.3;
        this.carParts.springs.rr.scale.y = 1.0 + physicsCar.roll * 0.35 + physicsCar.pitch * 0.3;
      }
    }

    // 3. Esterçamento das Rodas Dianteiras
    if (this.carParts && this.carParts.wheels) {
      this.carParts.wheels.fl.rotation.y = physicsCar.steerAngle;
      this.carParts.wheels.fr.rotation.y = physicsCar.steerAngle;

      // Giro contínuo dos pneus com base na velocidade
      const spinSpeed = physicsCar.speed * 0.12;
      this.carParts.wheels.fl.rotation.x += spinSpeed;
      this.carParts.wheels.fr.rotation.x += spinSpeed;
      this.carParts.wheels.rl.rotation.x += spinSpeed;
      this.carParts.wheels.rr.rotation.x += spinSpeed;
    }

    // 4. O Vetor Força Lateral em 3D
    if (physicsCar.vectorLeftActive || physicsCar.vectorRightActive) {
      this.forceVectorArrow.visible = true;
      const isLeft = physicsCar.vectorLeftActive;
      this.forceVectorArrow.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;
      this.forceVectorArrow.position.z = isLeft ? -12 : 12;
    } else {
      this.forceVectorArrow.visible = false;
    }

    // 5. Câmera acompanha o carro suavemente com visão isométrica esportiva
    const targetCamX = this.carGroup.position.x * 0.45;
    const targetCamZ = this.carGroup.position.z * 0.45 + 500;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.08;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.08;
    this.camera.lookAt(this.carGroup.position.x * 0.3, 0, this.carGroup.position.z * 0.3);
  }

  updateOtherCars(playersData) {
    if (!playersData) return;

    // Atualiza ou cria carros de outros jogadores / bots na cena
    for (let id in playersData) {
      const p = playersData[id];
      let oCar = this.otherCars[id];

      if (!oCar) {
        const carData = this.buildCarMesh(p.color || "#3867d6", false);
        oCar = carData;
        this.otherCars[id] = oCar;
        this.scene.add(oCar.group);
      }

      // Interpolação suave de posição e rotação
      oCar.group.position.x += (p.x - oCar.group.position.x) * 0.25;
      oCar.group.position.z += (p.z - oCar.group.position.z) * 0.25;
      oCar.group.rotation.y = -p.angle;

      if (oCar.bodyMesh) {
        oCar.bodyMesh.rotation.x = (p.roll || 0) * 0.22;
        oCar.bodyMesh.rotation.z = -(p.pitch || 0) * 0.14;
      }
      if (oCar.wheels) {
        oCar.wheels.fl.rotation.y = p.steer || 0;
        oCar.wheels.fr.rotation.y = p.steer || 0;
      }
    }

    // Remove jogadores que saíram
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
    this.ghostGroup.group.position.set(ghostPose.x, 0, ghostPose.z);
    this.ghostGroup.group.rotation.y = -ghostPose.angle;

    if (this.ghostGroup.bodyMesh) {
      this.ghostGroup.bodyMesh.rotation.x = (ghostPose.roll || 0) * 0.22;
      this.ghostGroup.bodyMesh.rotation.z = -(ghostPose.pitch || 0) * 0.14;
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
