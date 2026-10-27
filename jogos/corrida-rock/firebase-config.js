/* ============================================================================
   FIREBASE CONFIG & GERENCIADOR MULTIPLAYER (CORRIDA ROCK 3D)
   ========================================================================== */

const firebaseConfig = {
  projectId: "ryu2anos",
  appId: "1:720785582808:web:8caadc0e99db70ddc3c5ad",
  storageBucket: "ryu2anos.firebasestorage.app",
  apiKey: "AIzaSyAKqYWSkm2nXAcxIqk-GCNj_gszg_jcUNU",
  authDomain: "ryu2anos.firebaseapp.com",
  databaseURL: "https://ryu2anos-default-rtdb.firebaseio.com",
  messagingSenderId: "720785582808",
  measurementId: "G-MWEERLE6W4"
};

const MP_PALETTE = [
  "#ff4757", // Vermelho Rock
  "#1e90ff", // Azul Elétrico
  "#2ed573", // Verde Neon
  "#ffa502", // Laranja Fogo
  "#a55eea", // Roxo Sônico
  "#00d2d3"  // Ciano Turbo
];

class MultiplayerManager {
  constructor() {
    this.isOnline = false;
    this.roomId = null;
    this.playerId = "pilot_" + Math.random().toString(36).substring(2, 8);
    this.playerName = "Piloto " + Math.floor(10 + Math.random() * 89);
    // Escolhe uma cor vibrante para diferenciar abas/jogadores
    this.playerColor = MP_PALETTE[Math.floor(Math.random() * MP_PALETTE.length)];
    this.players = {}; // { id: { x, z, angle, roll, pitch, steer, turbo, color, name, lap, bestLap } }
    this.app = null;
    this.db = null;
    this.roomRef = null;
    this.playerRef = null;
    this.isDemoMode = false;
    this.demoBots = [];
    this.onPlayersChange = null;
    this.onRoomStateChange = null;
    this.lastState = null;
    this.heartbeatTimer = null;

    this.initFirebase();
  }

  initFirebase() {
    if (firebaseConfig.apiKey && typeof firebase !== "undefined") {
      try {
        if (!firebase.apps.length) {
          this.app = firebase.initializeApp(firebaseConfig);
        } else {
          this.app = firebase.app();
        }
        this.db = firebase.database();
        this.isOnline = true;
        this.isDemoMode = false;
        console.log("Firebase Realtime Database conectado ao projeto ryu2anos!");
      } catch (err) {
        console.warn("Erro ao inicializar Firebase, usando bots locais:", err);
        this.isDemoMode = true;
      }
    } else {
      this.isDemoMode = true;
    }
  }

  joinRoom(roomId, playerName, playerColor, initialPose) {
    this.roomId = (roomId || "ROCK").toUpperCase().trim();
    if (playerName) this.playerName = playerName.trim();
    if (playerColor) this.playerColor = playerColor;

    const startX = initialPose && typeof initialPose.x === "number" ? initialPose.x : 0;
    const startZ = initialPose && typeof initialPose.z === "number" ? initialPose.z : -255;
    const startAngle = initialPose && typeof initialPose.angle === "number" ? initialPose.angle : 0;

    this.lastState = {
      x: startX,
      z: startZ,
      angle: startAngle,
      roll: 0,
      pitch: 0,
      steer: 0,
      turbo: false,
      lap: 1,
      bestLap: 0
    };

    if (this.isOnline && this.db) {
      try {
        this.roomRef = this.db.ref(`rooms/${this.roomId}`);
        this.playerRef = this.roomRef.child(`players/${this.playerId}`);

        // Remove automaticamente ao fechar a aba
        this.playerRef.onDisconnect().remove();

        const initialData = {
          id: this.playerId,
          name: this.playerName,
          color: this.playerColor,
          x: Number(startX.toFixed(2)),
          z: Number(startZ.toFixed(2)),
          angle: Number(startAngle.toFixed(3)),
          roll: 0,
          pitch: 0,
          steer: 0,
          turbo: false,
          lap: 1,
          bestLap: 0,
          updatedAt: Date.now()
        };

        this.playerRef.set(initialData);

        // Escuta todos os jogadores da sala em tempo real
        this.roomRef.child("players").on("value", snapshot => {
          const val = snapshot.val() || {};
          const others = {};
          const now = Date.now();

          for (let id in val) {
            if (id === this.playerId) continue;
            const p = val[id];
            // Remove jogadores inativos há mais de 30s (caso uma aba tenha fechado sem onDisconnect)
            if (p && p.updatedAt && (now - p.updatedAt > 30000)) {
              this.roomRef.child(`players/${id}`).remove().catch(() => {});
              continue;
            }
            others[id] = p;
          }

          this.players = others;
          if (this.onPlayersChange) {
            this.onPlayersChange(this.players);
          }
        });

        // Heartbeat a cada 250ms para manter sincronização mesmo com aba em segundo plano
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => {
          if (this.lastState) {
            this.updateMyState(this.lastState);
          }
        }, 250);

        if (this.onRoomStateChange) {
          this.onRoomStateChange({ status: "connected", roomId: this.roomId, isDemo: false });
        }
        return;
      } catch (e) {
        console.warn("Erro ao conectar à sala remota, ativando modo bots:", e);
      }
    }

    // Fallback: Modo Demo com Bots concorrentes
    this.isDemoMode = true;
    this.setupDemoBots();
    if (this.onRoomStateChange) {
      this.onRoomStateChange({ status: "connected", roomId: this.roomId, isDemo: true });
    }
  }

  setupDemoBots() {
    this.demoBots = [
      {
        id: "bot_turbo_blue",
        name: "⚡ Trovão Azul",
        color: "#3867d6",
        trackT: 0.12,
        speed: 0.52,
        x: 0, z: -255, angle: 0, roll: 0, pitch: 0, steer: 0, turbo: false, lap: 1
      },
      {
        id: "bot_green_rock",
        name: "🎸 Rock Verde",
        color: "#20bf6b",
        trackT: 0.35,
        speed: 0.48,
        x: 0, z: -255, angle: 0, roll: 0, pitch: 0, steer: 0, turbo: false, lap: 1
      }
    ];
  }

  updateMyState(state) {
    this.lastState = state;
    if (this.isOnline && this.playerRef) {
      try {
        this.playerRef.update({
          name: this.playerName,
          color: this.playerColor,
          x: Number(state.x.toFixed(2)),
          z: Number(state.z.toFixed(2)),
          angle: Number(state.angle.toFixed(3)),
          roll: Number((state.roll || 0).toFixed(3)),
          pitch: Number((state.pitch || 0).toFixed(3)),
          steer: Number((state.steer || 0).toFixed(3)),
          turbo: !!state.turbo,
          lap: state.lap || 1,
          bestLap: state.bestLap || 0,
          updatedAt: Date.now()
        });
      } catch (e) {}
    }
  }

  updateBots(delta, trackCenterFunc) {
    if (!this.isDemoMode || !this.demoBots.length) return this.players;

    const others = {};
    for (let bot of this.demoBots) {
      bot.trackT = (bot.trackT + bot.speed * delta * 0.05) % 1.0;
      if (trackCenterFunc) {
        const pose = trackCenterFunc(bot.trackT);
        bot.x = pose.x;
        bot.z = pose.z;
        bot.angle = pose.angle;
        bot.roll = pose.roll || 0;
        bot.pitch = bot.turbo ? 0.6 : 0;
        bot.steer = pose.steer || 0;
      }
      others[bot.id] = { ...bot };
    }
    this.players = others;
    return this.players;
  }

  leaveRoom() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.playerRef) {
      this.playerRef.remove();
      this.playerRef = null;
    }
    if (this.roomRef) {
      this.roomRef.off();
      this.roomRef = null;
    }
    this.roomId = null;
    this.players = {};
    this.demoBots = [];
  }
}

window.multiplayerManager = new MultiplayerManager();
