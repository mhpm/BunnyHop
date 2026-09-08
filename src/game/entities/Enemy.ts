import Phaser from 'phaser';
import { ParticleManager } from '../systems/ParticleManager';
import { audioManager } from '../systems/AudioManager';
import { useGameStore } from '../../store/gameStore';

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected particles: ParticleManager;
  protected patrolSpeed: number = 40;
  protected direction: number = -1; // -1 = Left, 1 = Right
  public isDefeated: boolean = false;
  protected scoreValue: number = 100;
  protected health: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, particles: ParticleManager) {
    super(scene, x, y, texture);
    this.particles = particles;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setVelocityX(this.direction * this.patrolSpeed);
  }

  public update(): void {
    if (this.isDefeated) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    // Turn around if blocked by a wall or boundary
    if (body.blocked.left) {
      this.direction = 1;
      this.setFlipX(true);
    } else if (body.blocked.right) {
      this.direction = -1;
      this.setFlipX(false);
    }

    this.setVelocityX(this.direction * this.patrolSpeed);
  }

  public onStomped(): boolean {
    if (this.isDefeated) return false;

    this.health--;
    if (this.health <= 0) {
      this.defeat();
      return true; // Enemy defeated
    } else {
      // Just damaged / bounced
      audioManager.playEnemySquash();
      this.particles.emitStars(this.x, this.y, 4, 0xffeb3b);
      return false;
    }
  }

  protected defeat(): void {
    this.isDefeated = true;
    this.setVelocity(0, 0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    audioManager.playEnemySquash();
    this.particles.emitSquash(this.x, this.y, this.scoreValue);
    useGameStore.getState().addScore(this.scoreValue);

    this.playSquashVisual();
  }

  protected abstract playSquashVisual(): void;
}
