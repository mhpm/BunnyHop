import Phaser from 'phaser';

export class ParticleManager {
  private scene: Phaser.Scene;
  private dustEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private starEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private woodEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initEmitters();
  }

  private initEmitters(): void {
    if (!this.scene.add?.particles || !this.scene.textures?.exists('particle_dust')) return;

    try {
      this.dustEmitter = this.scene.add.particles(0, 0, 'particle_dust', {
        speed: { min: 15, max: 50 },
        lifespan: { min: 250, max: 400 },
        scale: { start: 0.75, end: 0.1 },
        alpha: { start: 0.85, end: 0 },
        emitting: false,
      });
      this.dustEmitter.setDepth(15);

      this.starEmitter = this.scene.add.particles(0, 0, 'particle_star', {
        speed: { min: 30, max: 75 },
        lifespan: { min: 350, max: 500 },
        scale: { start: 0.9, end: 0.2 },
        alpha: { start: 1, end: 0 },
        emitting: false,
      });
      this.starEmitter.setDepth(25);

      this.woodEmitter = this.scene.add.particles(0, 0, 'particle_wood', {
        speed: { min: 40, max: 95 },
        gravityY: 150,
        lifespan: { min: 350, max: 500 },
        scale: { start: 1.0, end: 0.3 },
        alpha: { start: 1, end: 0 },
        rotate: { start: -180, end: 180 },
        emitting: false,
      });
      this.woodEmitter.setDepth(15);
    } catch {
      // Fallback para entornos headless / unit tests
    }
  }

  // Cute dust puff when jumping or landing
  public emitDust(x: number, y: number, count = 4): void {
    if (this.dustEmitter) {
      this.dustEmitter.explode(count, x, y);
      return;
    }

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
    if (this.starEmitter) {
      this.starEmitter.setParticleTint(tint);
      this.starEmitter.explode(count, x, y);
      return;
    }

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
    if (this.woodEmitter) {
      this.woodEmitter.explode(8, x, y);
      return;
    }

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
