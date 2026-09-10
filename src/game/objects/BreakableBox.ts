import Phaser from 'phaser';
import { ParticleManager } from '../systems/ParticleManager';
import { audioManager } from '../systems/AudioManager';
import { useGameStore } from '../../store/gameStore';

export class BreakableBox extends Phaser.Physics.Arcade.Sprite {
  private particles: ParticleManager;
  private _isDestroyed = false;

  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'rich_box');
    this.particles = particles;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body

    this.setSize(46, 46);
  }

  public break(): void {
    if (this._isDestroyed) return;
    this._isDestroyed = true;

    audioManager.playBoxBreak();
    this.particles.emitWoodSplinters(this.x, this.y);
    useGameStore.getState().addScore(50);

    // Chance to spawn carrot from box!
    if (Math.random() < 0.75) {
      this.particles.emitStars(this.x, this.y, 6, 0xff9800);
      useGameStore.getState().addCarrot(1);
    }

    this.destroy();
  }
}
