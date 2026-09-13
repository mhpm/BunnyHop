import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { ParticleManager } from '../systems/ParticleManager';

export class Beetle extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'enemy_beetle_0', particles);
    this.patrolSpeed = 52;
    this.scoreValue = 200;
    this.health = 2; // Armored

    this.setSize(48, 32);
    this.setOffset(2, 10);
    this.play('enemy_beetle_walk');
  }

  protected playSquashVisual(): void {
    this.stop();
    this.setTexture('enemy_beetle_squash');
    this.setSize(48, 20);

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
