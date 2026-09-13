import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { ParticleManager } from '../systems/ParticleManager';

export class Caterpillar extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'enemy_caterpillar_0', particles);
    this.patrolSpeed = 32;
    this.scoreValue = 120;
    this.health = 1;

    this.setSize(48, 28);
    this.setOffset(2, 10);
    this.play('enemy_caterpillar_walk');
  }

  protected playSquashVisual(): void {
    this.stop();
    this.setTexture('enemy_caterpillar_squash');
    this.setSize(48, 16);

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
