import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { ParticleManager } from '../systems/ParticleManager';

export class Caterpillar extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'rich_caterpillar_walk', particles);
    this.patrolSpeed = 32;
    this.scoreValue = 120;
    this.health = 1;

    this.setSize(52, 28);
    this.setOffset(4, 10);

    // Cute crawl undulation
    scene.tweens.add({
      targets: this,
      scaleX: 1.08,
      scaleY: 0.94,
      duration: 220,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  protected playSquashVisual(): void {
    this.setTexture('rich_caterpillar_squash');
    this.setSize(56, 16);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y + 8,
      duration: 600,
      delay: 350,
      ease: 'Quad.easeIn',
      onComplete: () => this.destroy(),
    });
  }
}
