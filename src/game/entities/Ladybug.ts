import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { ParticleManager } from '../systems/ParticleManager';

export class Ladybug extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'rich_ladybug_walk', particles);
    this.patrolSpeed = 46;
    this.scoreValue = 100;
    this.health = 1;

    this.setSize(44, 30);
    this.setOffset(5, 8);

    // Subtle gentle bobbing walk
    scene.tweens.add({
      targets: this,
      scaleY: 0.92,
      duration: 160,
      yoyo: true,
      repeat: -1,
    });
  }

  protected playSquashVisual(): void {
    this.setTexture('rich_ladybug_squash');
    this.setSize(50, 16);

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
