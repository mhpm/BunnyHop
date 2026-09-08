import Phaser from 'phaser';

export class ParticleManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Cute dust puff when jumping or landing
  public emitDust(x: number, y: number, count = 4): void {
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.image(x + (Math.random() - 0.5) * 16, y, 'particle_dust');
      p.setScale(Phaser.Math.FloatBetween(0.4, 0.9));
      p.setAlpha(0.8);

      this.scene.tweens.add({
        targets: p,
        x: p.x + (Math.random() - 0.5) * 30,
        y: p.y - Phaser.Math.FloatBetween(4, 18),
        scale: 0.1,
        alpha: 0,
        duration: 320,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  // Golden star sparkles for carrots
  public emitStars(x: number, y: number, count = 6, tint = 0xffd700): void {
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.image(x, y, 'particle_star');
      p.setTint(tint);
      p.setScale(Phaser.Math.FloatBetween(0.5, 1.0));
      const angle = (i / count) * Math.PI * 2;
      const speed = Phaser.Math.FloatBetween(25, 55);

      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        angle: 180,
        scale: 0.2,
        alpha: 0,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  // Enemy squash effect: squash cloud + stars + bouncing score text
  public emitSquash(x: number, y: number, score = 100): void {
    this.emitDust(x, y, 6);
    this.emitStars(x, y, 5, 0xffeb3b);

    // Floating score popup text
    const text = this.scene.add.text(x, y - 10, `+${score}`, {
      fontFamily: 'Fredoka, Nunito, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#FFF',
      stroke: '#3E2723',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: y - 48,
      alpha: 0,
      scale: 1.2,
      duration: 650,
      ease: 'Back.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  // Wooden splinter explosion
  public emitWoodSplinters(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const p = this.scene.add.image(x, y, 'particle_wood');
      p.setScale(Phaser.Math.FloatBetween(0.6, 1.2));
      const vx = (Math.random() - 0.5) * 70;
      const vy = -Phaser.Math.FloatBetween(30, 80);

      this.scene.tweens.add({
        targets: p,
        x: x + vx,
        y: y + vy + 50,
        angle: Phaser.Math.Between(-180, 180),
        alpha: 0,
        duration: 450,
        ease: 'Quad.easeIn',
        onComplete: () => p.destroy(),
      });
    }
  }
}
