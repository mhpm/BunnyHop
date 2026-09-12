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
  private runInertiaTimer = 0; // Inercia física tras sprint (ms)
  private runInertiaSpeed = 0;
  private runInertiaDir = 1;
  private readonly maxRunInertiaTime = 480; // Ventana de inercia suave tras correr

  // Double-tap sprint detection (activar velocidad al presionar dos veces)
  private doubleTapTimer = 0;
  private readonly doubleTapMaxDelay = 320; // Ventana máxima para doble toque (ms)
  private lastTapDir: "left" | "right" | "none" = "none";
  private isDoubleTapRunning = false;
  private wasTouchLeft = false;
  private wasTouchRight = false;

  // Dash & Slide
  public isDashing = false;
  private currentDashSpeed = 0;
  private dashDirection = 1;
  private readonly dashDeceleration = 450; // Deceleración gradual (px/s²)
  private dashDustTimer = 0;
  private currentHitbox: "standing" | "dash" = "standing";

  public setHitboxMode(mode: "standing" | "dash"): void {
    if (this.currentHitbox === mode) return;

    if (mode === "dash") {
      // Ajuste de anclaje visual (origin) para la textura de 218x125px:
      // Con las patas en y=118 y las texturas de pie con altura ~175px (centro 87.5px),
      // situamos el anclaje vertical en 31/125 para que el conejo repose exactamente sobre el suelo sin flotar
      this.setOrigin(0.5, 31 / 125);
      const dashWidth = 140;
      const dashHeight = 60;
      this.setSize(dashWidth, dashHeight);
      this.setOffset(50, 58); // Caja rectangular horizontal centrada (140x60) en contacto con el suelo
      this.currentHitbox = "dash";
    } else {
      // Restauramos el anclaje centrado y la caja vertical estándar (60 ancho x 120 alto)
      this.setOrigin(0.5, 0.5);
      this.setSize(60, 120);
      this.setOffset(40, 55);
      this.currentHitbox = "standing";
    }
  }

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
  public touchDash = false;

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

      this.scene.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      ]);
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

    // 3. Movement & Dash handling
    let downHolding = false;
    if (!this.isHurt) {
      const left =
        (this.cursors?.left?.isDown ?? false) ||
        (this.wasdKeys?.left?.isDown ?? false) ||
        this.touchLeft;
      const right =
        (this.cursors?.right?.isDown ?? false) ||
        (this.wasdKeys?.right?.isDown ?? false) ||
        this.touchRight;
      downHolding =
        (this.cursors?.down?.isDown ?? false) ||
        (this.wasdKeys?.down?.isDown ?? false) ||
        this.touchDash;

      // Detección de pulsación inicial (flanco ascendente / just pressed)
      const leftJustPressed =
        (this.cursors?.left && Phaser.Input.Keyboard.JustDown(this.cursors.left)) ||
        (this.wasdKeys?.left && Phaser.Input.Keyboard.JustDown(this.wasdKeys.left)) ||
        (this.touchLeft && !this.wasTouchLeft);

      const rightJustPressed =
        (this.cursors?.right && Phaser.Input.Keyboard.JustDown(this.cursors.right)) ||
        (this.wasdKeys?.right && Phaser.Input.Keyboard.JustDown(this.wasdKeys.right)) ||
        (this.touchRight && !this.wasTouchRight);

      this.wasTouchLeft = this.touchLeft;
      this.wasTouchRight = this.touchRight;

      // Temporizador de doble toque
      if (this.doubleTapTimer > 0) {
        this.doubleTapTimer = Math.max(0, this.doubleTapTimer - delta);
        if (this.doubleTapTimer === 0) {
          this.lastTapDir = "none";
        }
      }

      // Evaluar doble toque para iniciar sprint
      if (leftJustPressed) {
        if (this.lastTapDir === "left" && this.doubleTapTimer > 0) {
          this.isDoubleTapRunning = true;
          this.doubleTapTimer = 0;
          this.lastTapDir = "none";
        } else {
          this.lastTapDir = "left";
          this.doubleTapTimer = this.doubleTapMaxDelay;
        }
      } else if (rightJustPressed) {
        if (this.lastTapDir === "right" && this.doubleTapTimer > 0) {
          this.isDoubleTapRunning = true;
          this.doubleTapTimer = 0;
          this.lastTapDir = "none";
        } else {
          this.lastTapDir = "right";
          this.doubleTapTimer = this.doubleTapMaxDelay;
        }
      }

      // Determine desired horizontal input direction
      let desiredDir: "left" | "right" | "none" = "none";
      if (left && !right) {
        desiredDir = "left";
      } else if (right && !left) {
        desiredDir = "right";
      }

      // Track continuous hold time for sprint (starts running after 2 seconds)
      if (desiredDir !== "none" && desiredDir === this.currentMoveDir) {
        this.moveHoldTimer += delta;
      } else if (desiredDir !== "none") {
        // Al cambiar de dirección sin haber hecho doble toque en esa nueva dirección, se desactiva el sprint rápido
        if (
          (desiredDir === "left" && !leftJustPressed) ||
          (desiredDir === "right" && !rightJustPressed)
        ) {
          this.isDoubleTapRunning = false;
        }
        this.currentMoveDir = desiredDir;
        this.moveHoldTimer = 0;
        this.runInertiaTimer = 0; // Changing direction cancels previous run inertia
      } else {
        // User released horizontal movement keys
        if (this.isRunning) {
          // Grant running inertia so character glides smoothly rather than stopping dead
          this.runInertiaTimer = this.maxRunInertiaTime;
          this.runInertiaSpeed = this.moveSpeed * this.runSpeedMultiplier;
          this.runInertiaDir = this.flipX ? -1 : 1;
        }
        this.currentMoveDir = "none";
        this.moveHoldTimer = 0;
        this.isDoubleTapRunning = false;
      }

      // Activar correr por doble toque O por mantener presionado 2 segundos
      this.isRunning =
        this.isDoubleTapRunning || this.moveHoldTimer >= this.runThresholdTime;

      // Update facing direction when advancing
      if (desiredDir === "left") {
        this.setFlipX(true);
      } else if (desiredDir === "right") {
        this.setFlipX(false);
      }

      // --- DASH / CROUCH LOGIC ---
      // Whenever down/dash is held on the ground: ALWAYS activate dash mode!
      // (Works when quieto, caminando, or corriendo!)
      if (downHolding && (isGrounded || this.coyoteTimer > 0)) {
        if (!this.isDashing) {
          this.isDashing = true;
          this.dashDustTimer = 0;

          if (this.isRunning) {
            // High-speed sprint dash
            this.dashDirection = this.flipX ? -1 : 1;
            this.currentDashSpeed = this.moveSpeed * this.runSpeedMultiplier;
            this.particles.emitDust(this.x, this.y + 30, 6);
            audioManager.playJump();
          } else if (this.runInertiaTimer > 0) {
            // Dash launched during running inertia coast
            this.dashDirection = this.runInertiaDir;
            this.currentDashSpeed = this.runInertiaSpeed;
            this.setFlipX(this.dashDirection < 0);
            this.particles.emitDust(this.x, this.y + 30, 6);
            audioManager.playJump();
          } else if (desiredDir !== "none") {
            // Walking dash
            this.dashDirection = desiredDir === "left" ? -1 : 1;
            this.currentDashSpeed = this.moveSpeed;
            this.particles.emitDust(this.x, this.y + 30, 3);
          } else {
            // Standing still (quieto): crouch dash pose!
            this.dashDirection = this.flipX ? -1 : 1;
            this.currentDashSpeed = 0;
          }

          // Consume run inertia once dash starts
          this.runInertiaTimer = 0;
          this.isRunning = false;
          this.moveHoldTimer = 0;
        }

        // Active dash physics: gradually lose speed (decelerate)
        const hitWall =
          (this.dashDirection > 0 && body.blocked.right) ||
          (this.dashDirection < 0 && body.blocked.left);

        if (hitWall) {
          this.currentDashSpeed = 0;
        }

        if (this.currentDashSpeed > 0) {
          this.currentDashSpeed = Math.max(
            0,
            this.currentDashSpeed - this.dashDeceleration * (delta / 1000),
          );
          this.setVelocityX(this.currentDashSpeed * this.dashDirection);

          // Continuous sliding dust trail
          this.dashDustTimer += delta;
          if (this.dashDustTimer >= 70 && this.currentDashSpeed > 60) {
            this.dashDustTimer = 0;
            const dustOffsetX = this.dashDirection > 0 ? -22 : 22;
            this.particles.emitDust(this.x + dustOffsetX, this.y + 30, 2);
          }
        } else {
          // Speed depleted to 0: stays in crouched dash pose until down is released
          this.setVelocityX(0);
        }
      } else {
        // Not holding down or not on ground: exit dash mode
        this.isDashing = false;
        this.currentDashSpeed = 0;

        // Standard movement
        const currentSpeed = this.isRunning
          ? this.moveSpeed * this.runSpeedMultiplier
          : this.moveSpeed;

        if (desiredDir === "left") {
          this.setVelocityX(-currentSpeed);
        } else if (desiredDir === "right") {
          this.setVelocityX(currentSpeed);
        } else {
          // Coast with running inertia if active
          if (this.runInertiaTimer > 0 && Math.abs(body.velocity.x) > 0) {
            this.runInertiaTimer = Math.max(0, this.runInertiaTimer - delta);
            const ratio = this.runInertiaTimer / this.maxRunInertiaTime;
            const inertiaSpeed = this.runInertiaSpeed * ratio;
            this.setVelocityX(inertiaSpeed * this.runInertiaDir);

            // Dust while coasting with inertia
            this.runDustTimer += delta;
            if (this.runDustTimer >= 150) {
              this.runDustTimer = 0;
              const dustOffsetX = this.runInertiaDir > 0 ? -16 : 16;
              this.particles.emitDust(this.x + dustOffsetX, this.y + 30, 2);
            }
          } else {
            this.runInertiaTimer = 0;
            this.setVelocityX(0);
          }
        }

        // Running dust effect when sprinting on the ground
        if (this.isRunning && isGrounded && Math.abs(body.velocity.x) > 0) {
          this.runDustTimer += delta;
          if (this.runDustTimer >= 180) {
            this.runDustTimer = 0;
            const dustOffsetX = this.flipX ? 16 : -16;
            this.particles.emitDust(this.x + dustOffsetX, this.y + 30, 2);
          }
        } else if (!this.runInertiaTimer) {
          this.runDustTimer = 0;
        }
      }

      // Execute jump if buffered and within coyote time (can jump out of dash)
      if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
        if (this.isDashing) {
          this.isDashing = false;
          this.currentDashSpeed = 0;
          this.setHitboxMode("standing");
        }
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
    this.updateAnimation(
      isGrounded,
      body.velocity.x,
      body.velocity.y,
      downHolding,
    );

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
    this.runInertiaTimer = 0;
    this.isDashing = false;
    this.currentDashSpeed = 0;
    this.currentMoveDir = "none";
    this.isDoubleTapRunning = false;
    this.doubleTapTimer = 0;
    this.lastTapDir = "none";
    this.setHitboxMode("standing");
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
    this.runInertiaTimer = 0;
    this.isDashing = false;
    this.currentDashSpeed = 0;
    this.currentMoveDir = "none";
    this.isDoubleTapRunning = false;
    this.doubleTapTimer = 0;
    this.lastTapDir = "none";
    this.setHitboxMode("standing");
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
    this.runInertiaTimer = 0;
    this.isDashing = false;
    this.currentDashSpeed = 0;
    this.currentMoveDir = "none";
    this.isDoubleTapRunning = false;
    this.doubleTapTimer = 0;
    this.lastTapDir = "none";
    this.setHitboxMode("standing");
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

  private updateAnimation(
    isGrounded: boolean,
    vx: number,
    _vy: number,
    downHolding: boolean,
  ): void {
    if (!this.body) return;

    // 1. PRIORIDAD TOTAL AL DASH / AGACHARSE:
    // Si se mantiene presionado abajo o está en dash, JAMÁS se activa la animación de jump
    if (this.isDashing || downHolding) {
      this.anims.timeScale = 1;
      this.play("bunny_dash_anim", true);
      this.setHitboxMode("dash");
      return;
    }

    // 2. SALTO / EN EL AIRE (Solo si NO se mantiene abajo y NO está en dash)
    if (!isGrounded) {
      this.anims.timeScale = 1;
      this.play("bunny_jump_anim", true);
      this.setHitboxMode("standing");
      this.setOffset(36, 53);
      return;
    }

    // 3. MOVIMIENTO EN TIERRA (Correr / Caminar)
    this.setHitboxMode("standing");
    if (Math.abs(vx) > 10) {
      if (this.isRunning || this.runInertiaTimer > 0) {
        this.anims.timeScale = 1;
        this.play("bunny_run_anim", true);
        this.setOffset(48, 55);
      } else {
        this.anims.timeScale = 1;
        this.play("bunny_walk_anim", true);
        this.setOffset(40, 55);
      }
    } else {
      // 4. QUIETO (IDLE)
      this.anims.timeScale = 1;
      this.play("bunny_idle_anim", true);
      this.setOffset(40, 55);
    }
  }
}
