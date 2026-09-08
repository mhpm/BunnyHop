import { useGameStore } from '../../store/gameStore';

class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmPlaying = false;
  private bgmInterval: number | null = null;

  constructor() {
    // Lazy initialize AudioContext on user interaction
  }

  private getContext(): AudioContext | null {
    if (!this.ctx) {
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

  public startBGM(): void {
    if (this.bgmPlaying || !useGameStore.getState().musicEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.bgmPlaying = true;
    // Cheerful cartoon melody pattern in C Major (Sunny Meadow theme)
    // C, E, G, A, G, E, D, C, etc.
    const melody = [
      523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25,
      659.25, 783.99, 1046.5, 880.0, 783.99, 659.25, 587.33, 523.25
    ];
    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.bgmPlaying || !useGameStore.getState().musicEnabled) {
        this.stopBGM();
        return;
      }
      const currentCtx = this.getContext();
      if (!currentCtx) return;

      const now = currentCtx.currentTime;
      const freq = melody[noteIndex % melody.length];
      noteIndex++;

      // Soft marimba-like tone
      const osc = currentCtx.createOscillator();
      const gain = currentCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(currentCtx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    };

    // 160 BPM eighth notes => approx 187ms per note
    this.bgmInterval = window.setInterval(playNextNote, 220);
  }

  public stopBGM(): void {
    this.bgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public syncMusic(): void {
    const musicOn = useGameStore.getState().musicEnabled;
    if (musicOn && !this.bgmPlaying) {
      this.startBGM();
    } else if (!musicOn && this.bgmPlaying) {
      this.stopBGM();
    }
  }
}

export const audioManager = new AudioManager();
