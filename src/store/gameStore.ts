import { create } from 'zustand';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

interface GameStore {
  // Game Flow
  gameState: GameState;
  setGameState: (state: GameState) => void;

  // Level & Stats
  currentWorld: number;
  currentLevel: number;
  lives: number;
  maxLives: number;
  carrots: number;
  totalLevelCarrots: number;
  score: number;
  highScore: number;
  stars: number;

  // Audio Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  toggleMusic: () => void;

  // Actions
  addCarrot: (value?: number) => void;
  addScore: (points: number) => void;
  loseLife: () => void;
  gainLife: () => void;
  resetLevelStats: (totalCarrots?: number) => void;
  completeLevel: () => void;
  startNewGame: () => void;

  // Debug
  debugMode: boolean;
  toggleDebugMode: () => void;
}

const getStorage = (key: string, fallback: string): string => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key) ?? fallback;
    }
  } catch {
    // fallback
  }
  return fallback;
};

const setStorage = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'MENU',
  setGameState: (state) => set({ gameState: state }),

  currentWorld: 1,
  currentLevel: 1,
  lives: 3,
  maxLives: 3,
  carrots: 0,
  totalLevelCarrots: 25,
  score: 0,
  highScore: parseInt(getStorage('bunny_hop_high_score', '0'), 10),
  stars: 0,

  soundEnabled: getStorage('bunny_hop_sound', 'true') !== 'false',
  musicEnabled: getStorage('bunny_hop_music', 'true') !== 'false',
  setSoundEnabled: (enabled) => {
    setStorage('bunny_hop_sound', String(enabled));
    set({ soundEnabled: enabled });
  },
  setMusicEnabled: (enabled) => {
    setStorage('bunny_hop_music', String(enabled));
    set({ musicEnabled: enabled });
  },
  toggleSound: () => {
    const next = !get().soundEnabled;
    get().setSoundEnabled(next);
  },
  toggleMusic: () => {
    const next = !get().musicEnabled;
    get().setMusicEnabled(next);
  },

  addCarrot: (value = 1) =>
    set((state) => {
      const newCarrots = state.carrots + value;
      const newScore = state.score + value * 100;
      const newHighScore = Math.max(newScore, state.highScore);
      setStorage('bunny_hop_high_score', String(newHighScore));
      return { carrots: newCarrots, score: newScore, highScore: newHighScore };
    }),

  addScore: (points) =>
    set((state) => {
      const newScore = state.score + points;
      const newHighScore = Math.max(newScore, state.highScore);
      setStorage('bunny_hop_high_score', String(newHighScore));
      return { score: newScore, highScore: newHighScore };
    }),

  loseLife: () =>
    set((state) => {
      const newLives = Math.max(0, state.lives - 1);
      return {
        lives: newLives,
        gameState: newLives === 0 ? 'GAMEOVER' : state.gameState,
      };
    }),

  gainLife: () =>
    set((state) => ({
      lives: Math.min(state.maxLives, state.lives + 1),
    })),

  resetLevelStats: (totalCarrots = 25) =>
    set(() => ({
      lives: 3,
      carrots: 0,
      totalLevelCarrots: totalCarrots,
      score: 0,
      stars: 0,
      gameState: 'PLAYING',
    })),

  completeLevel: () =>
    set((state) => {
      const ratio = state.totalLevelCarrots > 0 ? state.carrots / state.totalLevelCarrots : 1;
      let stars = 1;
      if (ratio >= 0.9) stars = 3;
      else if (ratio >= 0.5) stars = 2;

      return {
        stars,
        gameState: 'VICTORY',
      };
    }),

  startNewGame: () => {
    get().resetLevelStats(25);
  },

  debugMode: false,
  toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),
}));
