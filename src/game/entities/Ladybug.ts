import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { ParticleManager } from "../systems/ParticleManager";

export class Ladybug extends Enemy {
  private jumpTimer?: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    particles: ParticleManager,
    variant: "normal" | "aggressive" = "normal",
  ) {
    super(scene, x, y, "enemy_ladybug", particles);
    const isAggressive = variant === "aggressive";
    this.patrolSpeed = isAggressive ? 82 : 46;
    this.scoreValue = 100;
    this.health = 1;

    // The new spritesheet uses 256x256 frames; keep the enemy at its original
    // in-game size while preserving the full animation artwork.
    const visualScale = 0.1975;
    this.setScale(visualScale);
    this.setFlipX(this.direction < 0);
    // Arcade hitbox values are source-pixel values and are multiplied by the
    // sprite scale. Use inverse-scaled values to keep a 44x30 world hitbox.
    this.setSize(44 / visualScale, 30 / visualScale);
    // Align the hitbox bottom with the feet of the 256px artwork.
    this.setOffset(2 / visualScale, 12 / visualScale);
    this.play("enemy_ladybug_walk");

    if (isAggressive) {
      this.jumpTimer = scene.time.addEvent({
        delay: 1600,
        startAt: 850,
        loop: true,
        callback: this.tryAggressiveJump,
        callbackScope: this,
      });
    }
  }

  public override update(): void {
    if (this.isDefeated) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Turn before leaving the current platform instead of falling into a gap.
    if (body.blocked.down && this.isAtPlatformEdge(body)) {
      this.direction *= -1;
    }

    // Enemy.update() handles walls and velocity; this correction keeps the
    // artwork facing the actual walking direction in every turn case.
    super.update();
    this.setFlipX(this.direction < 0);
  }

  private isAtPlatformEdge(body: Phaser.Physics.Arcade.Body): boolean {
    const probeX = this.direction > 0 ? body.right + 2 : body.left - 2;
    const supportBodies = this.scene.physics.overlapRect(
      probeX - 2,
      body.bottom - 2,
      4,
      6,
      false,
      true,
    );

    return supportBodies.length === 0;
  }

  private tryAggressiveJump(): void {
    if (!this.active || this.isDefeated || !this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down || body.touching.down) {
      this.setVelocityY(-430);
    }
  }

  protected playSquashVisual(): void {
    this.jumpTimer?.remove();
    this.jumpTimer = undefined;
    this.stop();
    this.setTexture("enemy_ladybug_dead");
    const visualScale = 0.1975;
    this.setScale(visualScale);
    this.setSize(48 / visualScale, 16 / visualScale);
    this.setOffset(2 / visualScale, 10 / visualScale);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y + 8,
      duration: 600,
      delay: 350,
      ease: "Quad.easeIn",
      onComplete: () => this.destroy(),
    });
  }
}
