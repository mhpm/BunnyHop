import Phaser from 'phaser';
import { ParticleManager } from '../systems/ParticleManager';
import { useGameStore } from '../../store/gameStore';

export class GoalShrine extends Phaser.Physics.Arcade.Sprite {
  private particles: ParticleManager;
  public reached = false;

  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'rich_goal');
    this.particles = particles;

    scene.add.existing(this);

    const targetScale = 0.12;
    this.setScale(targetScale);
    this.setOrigin(0.5, 1);
    this.setDepth(1);

    // Static bodies keep the transform they had when they were created.
    // Configure the visible shrine first so its trigger is aligned with it.
    scene.physics.add.existing(this, true);

    const hitWidth = 100;
    const hitHeight = 130;
    const staticBody = this.body as Phaser.Physics.Arcade.StaticBody;
    staticBody.setSize(hitWidth, hitHeight, false);
    staticBody.setOffset(this.displayWidth / 2 - hitWidth / 2, this.displayHeight - hitHeight);

    // Glowing aura / floating sparkle
    scene.tweens.add({
      targets: this,
      scaleX: targetScale * 1.04,
      scaleY: targetScale * 1.04,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public activate(): void {
    if (this.reached) return;
    this.reached = true;

    this.scene.tweens.killTweensOf(this);

    // Victory particle explosion
    this.particles.emitStars(this.x, this.y - 70, 24, 0xffd700);
    this.particles.emitStars(this.x, this.y - 100, 18, 0xffeb3b);

    useGameStore.getState().completeLevel();
  }
}
