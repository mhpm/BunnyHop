import { useGameStore } from '../../store/gameStore';
import type Phaser from 'phaser';

class AudioManager {
  private ctx: AudioContext | null = null;
  private soundManager: Phaser.Sound.BaseSoundManager | null = null;
  private bgmSound: Phaser.Sound.BaseSound | null = null;
  private bgmPlaying = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private lastSkidTime = 0;
  private readonly bgmSrc = '/assets/music/background_music/bg_music_world_1.mp3';

  constructor() {
    // Lazy initialize AudioContext on user interaction
  }

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      if (typeof window === "undefined") return null;
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playJump(): void {
    if (!useGameStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    // Classic cute cartoon jump boing: sweeps 180Hz -> 480Hz
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playSkid(): void {
    if (!useGameStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (now - this.lastSkidTime < 0.12) return;
    this.lastSkidTime = now;

    const duration = 0.22;

    // 1. Ruido blanco filtrado para fricción con el suelo / césped
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(1400, now);
    bandpass.frequency.exponentialRampToValueAtTime(380, now + duration);
    bandpass.Q.setValueAtTime(2.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.32, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.005, now + duration);

    noiseSource.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);

    // 2. Chirp / squeak caricaturesco y dinámico de derrape
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);

    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.005, now + 0.19);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playCollectCarrot(): void {
    if (!useGameStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Cheerful double chime: C6 -> G6
    const freqs = [1046.5, 1567.98];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';

      const startTime = now + idx * 0.07;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.16);
    });
  }

  public playCollectGoldCarrot(): void {
    if (!useGameStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Magical sparkle arpeggio: C6 -> E6 -> G6 -> C7
    const freqs = [1046.5, 1318.51, 1567.98, 2093.0];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      const startTime = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  }

  public playEnemySquash(): void {
    if (!useGameStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Satisfying cartoon squash pop: rapid drop 550Hz -> 80Hz + noise transient
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.14);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playBoxBreak(): void {
    if (!useGameStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Wooden crunch sound: square wave frequency crunch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  public playHurt(): void {
    if (!useGameStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Ouch! Low cartoon thud + pitch bend down
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playVictory(): void {
    this.pauseBGM();
    if (!useGameStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Victory fanfare: C5, E5, G5, C6 triumphant chords
    const notes = [
      { f: 523.25, d: 0.14, t: 0 },
      { f: 659.25, d: 0.14, t: 0.15 },
      { f: 783.99, d: 0.14, t: 0.3 },
      { f: 1046.5, d: 0.5, t: 0.45 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';

      const startTime = now + note.t;
      osc.frequency.setValueAtTime(note.f, startTime);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + note.d + 0.02);
    });
  }

  public playGameOver(): void {
    this.pauseBGM();
    if (!useGameStore.getState().soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Sad descending notes: D4, C4, Bb3, A3
    const notes = [293.66, 261.63, 233.08, 220.0];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      const startTime = now + idx * 0.25;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.23);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.24);
    });
  }

  /**
   * Inicializa la integración con el SoundManager de Phaser según las mejores prácticas
   * de la skill phaser-audio-and-sound (AudioContext desbloqueado, bucle WebAudio gapless y pauseOnBlur).
   */
  public initPhaserSound(sound: Phaser.Sound.BaseSoundManager): void {
    this.soundManager = sound;

    // Crear o recuperar la instancia retenida de sonido para control continuo
    if (!this.bgmSound && this.soundManager) {
      const existing = this.soundManager.get('bg_music_world_1');
      if (existing) {
        this.bgmSound = existing;
      } else {
        this.bgmSound = this.soundManager.add('bg_music_world_1', {
          loop: true,
          volume: 0.45,
        });
      }
    }

    // Detener cualquier fallback HTML5 previo para evitar sonidos duplicados
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }

    // Sincronizar estado actual
    this.syncMusic();
  }

  private getBGMAudio(): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null;
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio(this.bgmSrc);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.45;
      this.bgmAudio.preload = 'auto';
    }
    return this.bgmAudio;
  }

  public startBGM(): void {
    if (!useGameStore.getState().musicEnabled) return;
    this.bgmPlaying = true;

    // 1. Usar el SoundManager de Phaser si está disponible (WebAudio gapless loop + auto unlock)
    if (this.soundManager && this.bgmSound) {
      if (this.bgmSound.isPaused) {
        this.bgmSound.resume();
        return;
      }

      if (!this.bgmSound.isPlaying) {
        if (this.soundManager.locked) {
          // Práctica recomendada de phaser-audio-and-sound: esperar el evento 'unlocked'
          this.soundManager.once('unlocked', () => {
            if (this.bgmPlaying && useGameStore.getState().musicEnabled) {
              this.bgmSound?.play();
            }
          });
        } else {
          this.bgmSound.play();
        }
      }
      return;
    }

    // 2. Fallback HTML5 Audio en caso de que Phaser aún esté inicializándose
    const audio = this.getBGMAudio();
    if (!audio) return;

    audio.loop = true;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('BGM play esperando interacción del usuario:', err);
      });
    }
  }

  public pauseBGM(): void {
    this.bgmPlaying = false;
    if (this.bgmSound && this.bgmSound.isPlaying) {
      this.bgmSound.pause();
    }
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  public stopBGM(): void {
    this.bgmPlaying = false;
    if (this.bgmSound) {
      this.bgmSound.stop();
    }
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }

  public syncMusic(): void {
    const musicOn = useGameStore.getState().musicEnabled;
    if (musicOn && !this.bgmPlaying) {
      this.startBGM();
    } else if (!musicOn && this.bgmPlaying) {
      this.pauseBGM();
    }
  }
}

export const audioManager = new AudioManager();
