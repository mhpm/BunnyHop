import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { LEVEL_1_CONFIG } from '../levels/levelData';

describe('Bunny Hop - Game Store & Rules', () => {
  beforeEach(() => {
    useGameStore.getState().resetLevelStats(25);
  });

  it('should initialize with 3 lives and 0 carrots', () => {
    const state = useGameStore.getState();
    expect(state.lives).toBe(3);
    expect(state.carrots).toBe(0);
    expect(state.score).toBe(0);
    expect(state.gameState).toBe('PLAYING');
  });

  it('should add carrots and update score correctly', () => {
    const store = useGameStore.getState();
    store.addCarrot(1);
    expect(useGameStore.getState().carrots).toBe(1);
    expect(useGameStore.getState().score).toBe(100);

    // Collect golden carrot (+5)
    store.addCarrot(5);
    expect(useGameStore.getState().carrots).toBe(6);
    expect(useGameStore.getState().score).toBe(600);
  });

  it('should decrease lives and trigger game over when lives reach 0', () => {
    const store = useGameStore.getState();
    store.loseLife();
    expect(useGameStore.getState().lives).toBe(2);
    expect(useGameStore.getState().gameState).toBe('PLAYING');

    store.loseLife();
    expect(useGameStore.getState().lives).toBe(1);

    store.loseLife();
    expect(useGameStore.getState().lives).toBe(0);
    expect(useGameStore.getState().gameState).toBe('GAMEOVER');
  });

  it('should calculate 3 stars if 90% or more carrots collected', () => {
    const store = useGameStore.getState();
    store.resetLevelStats(20);
    store.addCarrot(19); // 19/20 = 95%
    store.completeLevel();

    expect(useGameStore.getState().stars).toBe(3);
    expect(useGameStore.getState().gameState).toBe('VICTORY');
  });

  it('should calculate 2 stars if 50% to 89% carrots collected', () => {
    const store = useGameStore.getState();
    store.resetLevelStats(20);
    store.addCarrot(12); // 12/20 = 60%
    store.completeLevel();

    expect(useGameStore.getState().stars).toBe(2);
    expect(useGameStore.getState().gameState).toBe('VICTORY');
  });

  it('should calculate 1 star if less than 50% carrots collected', () => {
    const store = useGameStore.getState();
    store.resetLevelStats(20);
    store.addCarrot(4); // 4/20 = 20%
    store.completeLevel();

    expect(useGameStore.getState().stars).toBe(1);
    expect(useGameStore.getState().gameState).toBe('VICTORY');
  });
});

describe('Bunny Hop - Stomp Mechanics Logic', () => {
  const isStomp = (velocityY: number, playerY: number, enemyY: number): boolean => {
    return velocityY > 0 && playerY + 12 < enemyY;
  };

  it('should identify downward stomp correctly', () => {
    // Player falling down (vy = 250) and positioned above enemy (player.y = 540, enemy.y = 590)
    expect(isStomp(250, 540, 590)).toBe(true);
  });

  it('should reject stomp when player is moving upwards (jumping into enemy)', () => {
    // Player moving upward (vy = -300)
    expect(isStomp(-300, 540, 590)).toBe(false);
  });

  it('should reject stomp on lateral hit (same vertical level)', () => {
    // Player on same vertical height as enemy (player.y = 585, enemy.y = 590)
    expect(isStomp(100, 585, 590)).toBe(false);
  });
});

describe('Bunny Hop - Level 1 Configuration', () => {
  it('should have valid level 1 properties', () => {
    expect(LEVEL_1_CONFIG.id).toBe('level_1_1');
    expect(LEVEL_1_CONFIG.width).toBeGreaterThanOrEqual(3000);
    expect(LEVEL_1_CONFIG.groundSegments.length).toBeGreaterThan(0);
    expect(LEVEL_1_CONFIG.carrots.length).toBeGreaterThan(10);
  });

  it('should have golden carrots for bonus exploration', () => {
    const goldCarrots = LEVEL_1_CONFIG.carrots.filter((c) => c.isGold);
    expect(goldCarrots.length).toBeGreaterThanOrEqual(2);
  });
});
