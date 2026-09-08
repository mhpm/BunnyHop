import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { ParticleManager } from '../systems/ParticleManager';

export class Snail extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'rich_snail_walk', particles);
    this.patrolSpeed = 22;
    this.scoreValue = 80;
    this.health = 1;

    this.setSize(48, 32);
    this.setOffset(4, 8);

    // Slow bobbing
    scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      duration: 350,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  protected playSquashVisual(): void {
    this.setTexture('rich_snail_squash');
    this.setSize(50, 22);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y + 6,
      duration: 600,
      delay: 350,
      ease: 'Quad.easeIn',
      onComplete: () => this.destroy(),
    });
  }
}
