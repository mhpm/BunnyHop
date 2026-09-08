import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { ParticleManager } from '../systems/ParticleManager';

export class Beetle extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'rich_beetle_walk', particles);
    this.patrolSpeed = 52;
    this.scoreValue = 200;
    this.health = 2; // Armored

    this.setSize(56, 36);
    this.setOffset(8, 8);

    // Fast crawl bob
    scene.tweens.add({
      targets: this,
      scaleY: 0.94,
      duration: 120,
      yoyo: true,
      repeat: -1,
    });
  }

  protected playSquashVisual(): void {
    this.setTexture('rich_beetle_squash');
    this.setSize(64, 26);

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
