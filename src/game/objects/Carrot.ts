import Phaser from 'phaser';
import { ParticleManager } from '../systems/ParticleManager';
import { audioManager } from '../systems/AudioManager';
import { useGameStore } from '../../store/gameStore';

export class Carrot extends Phaser.Physics.Arcade.Sprite {
  private particles: ParticleManager;
  public isGold: boolean;
  private isCollected = false;

  constructor(scene: Phaser.Scene, x: number, y: number, isGold = false, particles: ParticleManager) {
    super(scene, x, y, isGold ? 'rich_carrot_gold' : 'rich_carrot');
    this.isGold = isGold;
    this.particles = particles;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static physics body

    this.setSize(28, 42);
    this.setOffset(6, 4);

    // Floating bobbing motion
    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 1100 + Math.random() * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtle scale pulsing
    scene.tweens.add({
      targets: this,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public collect(): void {
    if (this.isCollected) return;
    this.isCollected = true;

    if (this.isGold) {
      audioManager.playCollectGoldCarrot();
      this.particles.emitStars(this.x, this.y, 12, 0xffeb3b);
      useGameStore.getState().addCarrot(5);
    } else {
      audioManager.playCollectCarrot();
      this.particles.emitStars(this.x, this.y, 7, 0xffa726);
      useGameStore.getState().addCarrot(1);
    }

    // Floating collect animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 32,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 380,
      ease: 'Back.easeOut',
      onComplete: () => this.destroy(),
    });
  }
}
