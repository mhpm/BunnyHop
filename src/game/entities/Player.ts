import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager';
import { ParticleManager } from '../systems/ParticleManager';
import { useGameStore } from '../../store/gameStore';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private particles: ParticleManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };

  // Physics constants
  private readonly moveSpeed = 230;
  private readonly jumpForce = 490;
  private readonly bounceForce = 410;

  // Jump helpers
  private coyoteTimer = 0;
  private readonly coyoteTime = 120; // ms
  private jumpBufferTimer = 0;
  private readonly jumpBufferTime = 120; // ms
  private wasGrounded = false;
  private lastFallVelocity = 0;
  private isJumping = false;

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

  constructor(scene: Phaser.Scene, x: number, y: number, particles: ParticleManager) {
    super(scene, x, y, 'bunny_idle', 0);
    this.particles = particles;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale 128x176 sprite to cute platformer proportions
    this.setScale(0.60);

    // Hitbox around Bunny's body and feet (bottom aligned at y=176)
    this.setSize(60, 120);
    this.setOffset(34, 40); // ajuste el hitbox
    this.setCollideWorldBounds(true);
    this.setBounce(0);

    this.initControls();
    this.play('bunny_idle_anim');
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
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }

    // Check jump input
    const jumpPressed =
      (this.cursors?.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
      (this.wasdKeys?.up && Phaser.Input.Keyboard.JustDown(this.wasdKeys.up)) ||
      (this.wasdKeys?.space && Phaser.Input.Keyboard.JustDown(this.wasdKeys.space)) ||
      this.touchJump;

    if (jumpPressed) {
      this.jumpBufferTimer = this.jumpBufferTime;
      this.touchJump = false;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
    }

    // 3. Movement handling
    if (!this.isHurt) {
      const left = this.cursors?.left?.isDown || this.wasdKeys?.left?.isDown || this.touchLeft;
      const right = this.cursors?.right?.isDown || this.wasdKeys?.right?.isDown || this.touchRight;

      if (left) {
        this.setVelocityX(-this.moveSpeed);
        this.setFlipX(true);
      } else if (right) {
        this.setVelocityX(this.moveSpeed);
        this.setFlipX(false);
      } else {
        this.setVelocityX(0);
      }

      // Execute jump if buffered and within coyote time
      if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
        this.doJump();
      }

      // Variable jump height: release jump early to cut upward velocity
      const jumpHolding =
        this.cursors?.up?.isDown ||
        this.wasdKeys?.up?.isDown ||
        this.wasdKeys?.space?.isDown ||
        this.touchJump;

      if (!jumpHolding && body.velocity.y < -120) {
        this.setVelocityY(body.velocity.y * 0.5);
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
    audioManager.playJump();
    this.particles.emitDust(this.x, this.y + 30, 4);

    // Jump stretch tween
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.54,
      scaleY: 0.68,
      duration: 110,
      yoyo: true,
      ease: 'Quad.easeOut',
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
      ease: 'Quad.easeOut',
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
    this.setVelocity(0, -320);
    this.setCollideWorldBounds(false);
    audioManager.playGameOver();

    // Spin and fall
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      alpha: 0,
      duration: 1200,
      ease: 'Quad.easeIn',
      onComplete: () => {
        useGameStore.getState().setGameState('GAMEOVER');
      },
    });
  }

  public celebrateVictory(): void {
    this.isVictorious = true;
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

    if (isGrounded && Math.abs(vx) > 0) {
      this.play('bunny_walk_anim', true);
    } else {
      this.play('bunny_idle_anim', true);
    }
  }
}
