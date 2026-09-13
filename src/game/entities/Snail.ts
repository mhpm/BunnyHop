import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { ParticleManager } from '../systems/ParticleManager';

export class Snail extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'enemy_snail_0', particles);
    this.patrolSpeed = 22;
    this.scoreValue = 80;
    this.health = 1;

    this.setSize(44, 30);
    this.setOffset(2, 10);
    this.play('enemy_snail_walk');
  }

  protected playSquashVisual(): void {
    this.stop();
    this.setTexture('enemy_snail_shell');
    this.setSize(44, 22);

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
