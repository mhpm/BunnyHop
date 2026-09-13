import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { ParticleManager } from '../systems/ParticleManager';

export class Ladybug extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'enemy_ladybug_0', particles);
    this.patrolSpeed = 46;
    this.scoreValue = 100;
    this.health = 1;

    this.setSize(44, 30);
    this.setOffset(2, 10);
    this.play('enemy_ladybug_walk');
  }

  protected playSquashVisual(): void {
    this.stop();
    this.setTexture('enemy_ladybug_squash');
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
