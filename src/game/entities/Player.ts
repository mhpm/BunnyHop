import Phaser from "phaser";
import { audioManager } from "../systems/AudioManager";
import { ParticleManager } from "../systems/ParticleManager";
import { useGameStore } from "../../store/gameStore";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private particles: ParticleManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };

  // Physics constants
  private readonly moveSpeed = 230;
  private readonly runSpeedMultiplier = 1.8; // 20% más rápido al correr
  private readonly runThresholdTime = 2000; // 2 segundos manteniendo la dirección para correr
  private readonly jumpForce = 510;
  private readonly bounceForce = 410;

  // Jump helpers
  private coyoteTimer = 0;
  private readonly coyoteTime = 120; // ms
  private jumpBufferTimer = 0;
  private readonly jumpBufferTime = 120; // ms
  private wasGrounded = false;
  private lastFallVelocity = 0;
  public isJumping = false;
  private wasTouchJump = false;
  private hasCutJump = false;

  // Running & Sprinting
  public isRunning = false;
  private moveHoldTimer = 0;
  private currentMoveDir: "left" | "right" | "none" = "none";
  private runDustTimer = 0;

  // State flags
  public isHurt = false;
  public isInvulnerable = false;
  public isDead = false;
  public isVictorious = false;
  public isStomping = false;

  // External touch controls input
  public touchLeft = false;
  public touchRight = false;
  public touchJump = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    particles: ParticleManager,
  ) {
    super(scene, x, y, "bunny_idle", 0);
    this.particles = particles;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale 128x176 sprite to cute platformer proportions
    this.setScale(0.6);

    // Hitbox around Bunny's body and feet (bottom aligned at y=176)
    this.setSize(60, 120);
    this.setOffset(40, 55); // ajuste el hitbox
    this.setCollideWorldBounds(true);
    this.setBounce(0);

    this.initControls();
    this.play("bunny_idle_anim");
  }

  private initControls(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasdKeys = this.scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      }) as { [key: string]: Phaser.Input.Keyboard.Key };
    }
  }

  public update(_time: number, delta: number): void {
    if (this.isDead || this.isVictorious) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const isGrounded = body.blocked.down || body.touching.down;

    // Track downward speed while airborne
    if (!isGrounded && body.velocity.y > 0) {
      this.lastFallVelocity = body.velocity.y;
    }

    // 1. Landing detection (only after a real jump/fall)
    if (!this.wasGrounded && isGrounded) {
      this.isStomping = false;
      if (this.lastFallVelocity > 120) {
        this.particles.emitDust(this.x, this.y + 30, 4);
      }
      this.lastFallVelocity = 0;
    }

    // 2. Coyote time & jump buffer counters
    if (isGrounded) {
      this.coyoteTimer = this.coyoteTime;
      this.hasCutJump = false;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }

    // Detect just-pressed edge for touch jump (maintains touchJump as held state)
    const touchJumpJustPressed = this.touchJump && !this.wasTouchJump;
    this.wasTouchJump = this.touchJump;

    // Check jump input
    const jumpPressed =
      (this.cursors?.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
      (this.wasdKeys?.up && Phaser.Input.Keyboard.JustDown(this.wasdKeys.up)) ||
      (this.wasdKeys?.space &&
        Phaser.Input.Keyboard.JustDown(this.wasdKeys.space)) ||
      touchJumpJustPressed;

    if (jumpPressed) {
      this.jumpBufferTimer = this.jumpBufferTime;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
    }

    // 3. Movement handling
    if (!this.isHurt) {
      const left =
        this.cursors?.left?.isDown ||
        this.wasdKeys?.left?.isDown ||
        this.touchLeft;
      const right =
        this.cursors?.right?.isDown ||
        this.wasdKeys?.right?.isDown ||
        this.touchRight;

      let desiredDir: "left" | "right" | "none" = "none";
      if (left && !right) {
        desiredDir = "left";
      } else if (right && !left) {
        desiredDir = "right";
      }

      // Track continuous hold time for the direction (sprint after 2 seconds)
      if (desiredDir !== "none" && desiredDir === this.currentMoveDir) {
        this.moveHoldTimer += delta;
      } else if (desiredDir !== "none") {
        this.currentMoveDir = desiredDir;
        this.moveHoldTimer = 0;
      } else {
        this.currentMoveDir = "none";
        this.moveHoldTimer = 0;
      }

      this.isRunning = this.moveHoldTimer >= this.runThresholdTime;
      const currentSpeed = this.isRunning
        ? this.moveSpeed * this.runSpeedMultiplier
        : this.moveSpeed;

      if (desiredDir === "left") {
        this.setVelocityX(-currentSpeed);
        this.setFlipX(true);
      } else if (desiredDir === "right") {
        this.setVelocityX(currentSpeed);
        this.setFlipX(false);
      } else {
        this.setVelocityX(0);
      }

      // Running dust effect when sprinting on the ground
      if (this.isRunning && isGrounded && Math.abs(body.velocity.x) > 0) {
        this.runDustTimer += delta;
        if (this.runDustTimer >= 200) {
          this.runDustTimer = 0;
          const dustOffsetX = this.flipX ? 16 : -16;
          this.particles.emitDust(this.x + dustOffsetX, this.y + 30, 2);
        }
      } else {
        this.runDustTimer = 0;
      }

      // Execute jump if buffered and within coyote time
      if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
        this.doJump();
      }

      // Variable jump height: release jump early to cut upward velocity smoothly once
      const jumpHolding =
        this.cursors?.up?.isDown ||
        this.wasdKeys?.up?.isDown ||
        this.wasdKeys?.space?.isDown ||
        this.touchJump;

      if (!this.hasCutJump && !jumpHolding && body.velocity.y < -160) {
        this.setVelocityY(Math.max(body.velocity.y * 0.55, -250));
        this.hasCutJump = true;
      }
    }

    // 4. Update animations & visual state
    this.updateAnimation(isGrounded, body.velocity.x, body.velocity.y);

    this.wasGrounded = isGrounded;
  }

  private doJump(): void {
    this.setVelocityY(-this.jumpForce);
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.isStomping = false;
    this.isJumping = true;
    this.hasCutJump = false;
    audioManager.playJump();
    this.particles.emitDust(this.x, this.y + 30, 4);

    // Jump stretch tween
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.54,
      scaleY: 0.68,
      duration: 110,
      yoyo: true,
      ease: "Quad.easeOut",
    });
  }

  // Enemy Stomp Bounce
  public bounce(): void {
    this.setVelocityY(-this.bounceForce);
    this.coyoteTimer = 0;
    this.isStomping = true;
    this.isJumping = true;
    audioManager.playJump();

    // Impact squash
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.68,
      scaleY: 0.48,
      duration: 80,
      yoyo: true,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.isStomping = false;
      },
    });
  }

  // Damage / Hurt handling
  public takeDamage(fromX: number): void {
    if (this.isInvulnerable || this.isDead || this.isVictorious) return;

    audioManager.playHurt();
    useGameStore.getState().loseLife();

    const livesLeft = useGameStore.getState().lives;
    if (livesLeft <= 0) {
      this.die();
      return;
    }

    // Knockback
    this.isHurt = true;
    this.isInvulnerable = true;
    this.moveHoldTimer = 0;
    this.isRunning = false;
    this.currentMoveDir = "none";
    const knockbackDir = this.x < fromX ? -1 : 1;
    this.setVelocity(knockbackDir * 190, -280);

    // Screen shake
    this.scene.cameras.main.shake(180, 0.012);

    // Recover from knockback after 350ms
    this.scene.time.delayedCall(350, () => {
      this.isHurt = false;
    });

    // Invulnerability flashing (1.2s i-frames)
    this.scene.tweens.add({
      targets: this,
      alpha: 0.25,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.setAlpha(1);
        this.isInvulnerable = false;
      },
    });
  }

  public die(): void {
    this.isDead = true;
    this.moveHoldTimer = 0;
    this.isRunning = false;
    this.currentMoveDir = "none";
    this.setVelocity(0, -320);
    this.setCollideWorldBounds(false);
    audioManager.playGameOver();

    // Spin and fall
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      alpha: 0,
      duration: 1200,
      ease: "Quad.easeIn",
      onComplete: () => {
        useGameStore.getState().setGameState("GAMEOVER");
      },
    });
  }

  public celebrateVictory(): void {
    this.isVictorious = true;
    this.moveHoldTimer = 0;
    this.isRunning = false;
    this.currentMoveDir = "none";
    this.setVelocity(0, -220);
    audioManager.playVictory();

    this.scene.tweens.add({
      targets: this,
      scaleX: 0.49,
      scaleY: 0.39,
      duration: 250,
      yoyo: true,
      repeat: 3,
    });
  }

  private updateAnimation(isGrounded: boolean, vx: number, _vy: number): void {
    if (!this.body) return;

    if (!isGrounded) {
      this.anims.timeScale = 1;
      this.play("bunny_jump_anim", true);
      this.setOffset(36, 53);
    } else if (Math.abs(vx) > 0) {
      if (this.isRunning) {
        this.anims.timeScale = 1;
        this.play("bunny_run_anim", true);
        this.setOffset(48, 55);
      } else {
        this.anims.timeScale = 1;
        this.play("bunny_walk_anim", true);
        this.setOffset(40, 55);
      }
    } else {
      this.anims.timeScale = 1;
      this.play("bunny_idle_anim", true);
      this.setOffset(40, 55);
    }
  }
}
