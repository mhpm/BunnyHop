import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { ParticleManager } from "../systems/ParticleManager";

export class Bee extends Enemy {
  private readonly flightAmplitude: number;
  private readonly flightAngularSpeed: number;
  private flightPhase = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    particles: ParticleManager,
    variant: "normal" | "aggressive" = "normal",
  ) {
    super(scene, x, y, "enemy_bee_flying", particles);
    const isAggressive = variant === "aggressive";
    this.patrolSpeed = isAggressive ? 48 : 34;
    // Keep the current rhythm, but give the bee a taller flight path.
    this.flightAmplitude = isAggressive ? 92 : 60;
    this.flightAngularSpeed = isAggressive ? 7.2 : 6.5;
    this.scoreValue = 150;
    this.health = 1;

    const visualScale = 0.2;
    this.setScale(visualScale);
    this.setFlipX(this.direction < 0);
    if (isAggressive) {
      // Red tint marks the faster, more dangerous bee at a glance.
      this.setTint(0xff6868);
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    // Keep a compact collision area around the bee's body, in world pixels.
    this.setSize(42 / visualScale, 30 / visualScale);
    this.setOffset(4 / visualScale, 12 / visualScale);
    this.setVelocityY(-this.flightAmplitude * this.flightAngularSpeed);
    this.play("enemy_bee_flying");
  }

  public override update(): void {
    if (this.isDefeated) return;

    // Use a sine-wave velocity so the bee eases smoothly at the top and
    // bottom instead of moving in a sharp up/down triangle pattern.
    const deltaSeconds = Math.min(this.scene.game.loop.delta, 50) / 1000;
    this.flightPhase += deltaSeconds * this.flightAngularSpeed;
    this.setVelocityY(
      -Math.cos(this.flightPhase) *
        this.flightAmplitude *
        this.flightAngularSpeed,
    );

    super.update();
    this.setFlipX(this.direction < 0);
  }

  protected playSquashVisual(): void {
    this.stop();
    this.clearTint();
    this.setTexture("enemy_bee_dead");

    const visualScale = 0.2;
    this.setScale(visualScale);
    this.setSize(42 / visualScale, 18 / visualScale);
    this.setOffset(4 / visualScale, 58 / visualScale);

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
