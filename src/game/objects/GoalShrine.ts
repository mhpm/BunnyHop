import Phaser from 'phaser';
import { ParticleManager } from '../systems/ParticleManager';
import { useGameStore } from '../../store/gameStore';

export class GoalShrine extends Phaser.Physics.Arcade.Sprite {
  private particles: ParticleManager;
  public reached = false;

  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'goal_shrine');
    this.particles = particles;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.setSize(48, 70);
    this.setOffset(8, 14);

    // Glowing aura / floating sparkle
    scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public activate(): void {
    if (this.reached) return;
    this.reached = true;

    // Victory particle explosion
    this.particles.emitStars(this.x, this.y - 20, 16, 0xffd700);
    this.particles.emitStars(this.x, this.y - 40, 12, 0xffeb3b);

    this.scene.time.delayedCall(800, () => {
      useGameStore.getState().completeLevel();
    });
  }
}
