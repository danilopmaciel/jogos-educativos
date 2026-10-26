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

class MultiplayerManager {
  constructor() {
    this.isOnline = false;
    this.roomId = null;
    this.playerId = "pilot_" + Math.random().toString(36).substring(2, 8);
    this.playerName = "Piloto " + Math.floor(10 + Math.random() * 89);
    this.playerColor = "#ff4757";
    this.players = {}; // { id: { x, z, angle, roll, pitch, steer, turbo, color, name, lap, bestLap } }
    this.isHost = false;
    this.app = null;
    this.db = null;
    this.roomRef = null;
    this.playerRef = null;
    this.isDemoMode = true;
    this.demoBots = [];
    this.onPlayersChange = null;
    this.onRoomStateChange = null;

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
        console.log("Firebase conectado com sucesso ao projeto ryu2anos!");
      } catch (err) {
        console.warn("Realtime Database ainda não inicializado no console. Usando modo de simulação com bots inteligentes:", err);
        this.isDemoMode = true;
      }
    } else {
      this.isDemoMode = true;
    }
  }

  joinRoom(roomId, playerName, playerColor) {
    this.roomId = (roomId || "ROCK").toUpperCase().trim();
    if (playerName) this.playerName = playerName;
    if (playerColor) this.playerColor = playerColor;

    if (this.isOnline && this.db) {
      try {
        this.roomRef = this.db.ref(`rooms/${this.roomId}`);
        this.playerRef = this.roomRef.child(`players/${this.playerId}`);

        this.playerRef.onDisconnect().remove();

        this.playerRef.set({
          id: this.playerId,
          name: this.playerName,
          color: this.playerColor,
          x: 0,
          z: 0,
          angle: 0,
          roll: 0,
          pitch: 0,
          steer: 0,
          turbo: false,
          lap: 1,
          bestLap: 0,
          updatedAt: firebase.database.ServerValue.TIMESTAMP
        });

        this.roomRef.child("players").on("value", snapshot => {
          const val = snapshot.val() || {};
          const others = {};
          for (let id in val) {
            if (id !== this.playerId) {
              others[id] = val[id];
            }
          }
          this.players = others;
          if (this.onPlayersChange) this.onPlayersChange(this.players);
        });

        if (this.onRoomStateChange) {
          this.onRoomStateChange({ status: "connected", roomId: this.roomId, isDemo: false });
        }
        return;
      } catch(e) {
        console.warn("Erro ao conectar à sala remota, usando bots:", e);
      }
    }

    // Modo Demo com Bots concorrentes
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
        x: 0,
        z: 0,
        angle: 0,
        roll: 0,
        pitch: 0,
        steer: 0,
        turbo: false,
        lap: 1
      },
      {
        id: "bot_green_rock",
        name: "🎸 Rock Verde",
        color: "#20bf6b",
        trackT: 0.35,
        speed: 0.48,
        x: 0,
        z: 0,
        angle: 0,
        roll: 0,
        pitch: 0,
        steer: 0,
        turbo: false,
        lap: 1
      },
      {
        id: "bot_yellow_fire",
        name: "🔥 Fogo Dourado",
        color: "#fed330",
        trackT: 0.70,
        speed: 0.56,
        x: 0,
        z: 0,
        angle: 0,
        roll: 0,
        pitch: 0,
        steer: 0,
        turbo: false,
        lap: 1
      }
    ];
  }

  updateMyState(state) {
    if (this.isOnline && this.playerRef) {
      try {
        this.playerRef.update({
          x: Number(state.x.toFixed(2)),
          z: Number(state.z.toFixed(2)),
          angle: Number(state.angle.toFixed(3)),
          roll: Number(state.roll.toFixed(3)),
          pitch: Number(state.pitch.toFixed(3)),
          steer: Number(state.steer.toFixed(3)),
          turbo: !!state.turbo,
          lap: state.lap || 1,
          bestLap: state.bestLap || 0,
          updatedAt: firebase.database.ServerValue.TIMESTAMP
        });
      } catch(e){}
    }
  }

  updateBots(delta, trackCenterFunc) {
    if (!this.isDemoMode || !this.demoBots.length) return this.players;

    const others = {};
    for (let bot of this.demoBots) {
      bot.trackT = (bot.trackT + bot.speed * delta * 0.05) % 1.0;
      
      if (Math.random() < 0.005 && !bot.turbo) {
        bot.turbo = true;
        bot.speed *= 1.6;
        setTimeout(() => {
          bot.turbo = false;
          bot.speed /= 1.6;
        }, 1200);
      }

      if (trackCenterFunc) {
        const pose = trackCenterFunc(bot.trackT);
        bot.x = pose.x;
        bot.z = pose.z;
        bot.angle = pose.angle;
        bot.roll = pose.roll || 0;
        bot.pitch = bot.turbo ? 0.6 : 0;
        bot.steer = pose.steer || 0;
      }

      others[bot.id] = {
        id: bot.id,
        name: bot.name,
        color: bot.color,
        x: bot.x,
        z: bot.z,
        angle: bot.angle,
        roll: bot.roll,
        pitch: bot.pitch,
        steer: bot.steer,
        turbo: bot.turbo,
        lap: bot.lap
      };
    }
    this.players = others;
    return this.players;
  }

  leaveRoom() {
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
    if (this.onRoomStateChange) {
      this.onRoomStateChange({ status: "disconnected" });
    }
  }
}

window.multiplayerManager = new MultiplayerManager();
