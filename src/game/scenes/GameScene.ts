import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Ladybug } from '../entities/Ladybug';
import { Caterpillar } from '../entities/Caterpillar';
import { Snail } from '../entities/Snail';
import { Beetle } from '../entities/Beetle';
import { Carrot } from '../objects/Carrot';
import { BreakableBox } from '../objects/BreakableBox';
import { GoalShrine } from '../objects/GoalShrine';
import { ParticleManager } from '../systems/ParticleManager';
import { LEVEL_1_CONFIG, LevelConfig } from '../levels/levelData';
import { useGameStore } from '../../store/gameStore';

export class GameScene extends Phaser.Scene {
  public player!: Player;
  private particles!: ParticleManager;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private boxes!: Phaser.Physics.Arcade.StaticGroup;
  private enemies: Enemy[] = [];
  private carrots: Carrot[] = [];
  private goalShrine?: GoalShrine;
  private currentLevelConfig: LevelConfig = LEVEL_1_CONFIG;

  // Parallax background layers
  private bgClouds!: Phaser.GameObjects.TileSprite;

  constructor() {
    super({ key: 'GameScene' });
  }

  public create(): void {
    const config = this.currentLevelConfig;

    // Reset store stats for this level
    useGameStore.getState().resetLevelStats(config.carrots.length);

    // Set world physics bounds
    this.physics.world.setBounds(0, 0, config.width, config.height + 100);

    // Initialize particle manager
    this.particles = new ParticleManager(this);

    // Build Parallax Layers
    this.createParallaxBackground();

    // Create Groups
    this.platforms = this.physics.add.staticGroup();
    this.boxes = this.physics.add.staticGroup();
    this.enemies = [];
    this.carrots = [];

    // Build World Geometry & Objects
    this.buildLevel(config);

    // Spawn Player
    this.player = new Player(this, config.spawn.x, config.spawn.y, this.particles);

    // Collisions and Overlaps
    this.setupCollisions();

    // Camera Configuration
    this.setupCamera(config);

    // Keyboard shortcuts (e.g. ESC for pause)
    this.input.keyboard?.on('keydown-ESC', () => {
      const state = useGameStore.getState().gameState;
      if (state === 'PLAYING') {
        useGameStore.getState().setGameState('PAUSED');
      } else if (state === 'PAUSED') {
        useGameStore.getState().setGameState('PLAYING');
      }
    });
  }

  private createParallaxBackground(): void {
    // User requested panoramic background (2172 x 724)
    // ScrollFactor (0.465, 0) smoothly tracks across the 3200px level without repeating
    this.add.image(0, 0, 'game_background')
      .setOrigin(0, 0)
      .setScrollFactor(0.465, 0)
      .setDepth(-40);

    // Subtle gentle clouds drift in upper sky
    //this.bgClouds = this.add.tileSprite(0, 10, 1280 * 2, 100, 'rich_clouds')
    //  .setOrigin(0, 0)
    //  .setScrollFactor(0.12, 0)
    //  .setAlpha(0.65)
    //  .setDepth(-35);
  }

  private buildLevel(config: LevelConfig): void {
    // 1. Scenery Props (All firmly grounded at prop.y with origin 0.5, 1)
    config.props.forEach((prop) => {
      let textureKey = 'rich_bush';
      let depth = 1;
      let scale = prop.scale ?? 1;

      switch (prop.type) {
        case 'tree':
          textureKey = 'rich_tree';
          depth = -4;
          scale = 0.85;
          break;
        case 'tree_alt':
          textureKey = 'rich_tree_alt';
          depth = -4;
          scale = 0.85;
          break;
        case 'barn':
          textureKey = 'rich_barn';
          depth = -5;
          scale = 0.95;
          break;
        case 'windmill':
          textureKey = 'rich_windmill';
          depth = -5;
          scale = 0.95;
          break;
        case 'sign':
          textureKey = 'rich_sign';
          depth = 2;
          scale = 0.8;
          break;
        case 'fence':
          textureKey = 'rich_fence';
          depth = 1;
          scale = 0.85;
          break;
        case 'fence_white':
          textureKey = 'rich_fence_white';
          depth = 1;
          scale = 0.95;
          break;
        case 'lantern':
          textureKey = 'rich_lantern';
          depth = 2;
          scale = 0.85;
          break;
        case 'bush':
          textureKey = 'rich_bush';
          depth = 2;
          scale = 0.9;
          break;
        case 'bush_large':
          textureKey = 'rich_bush_large';
          depth = 2;
          scale = 0.85;
          break;
        case 'rock':
          textureKey = 'rich_rock';
          depth = 1;
          scale = 0.85;
          break;
        case 'haystack':
          textureKey = 'rich_haystack';
          depth = 1;
          scale = 0.85;
          break;
        case 'haycart':
          textureKey = 'rich_haycart';
          depth = 1;
          scale = 0.85;
          break;
        case 'barrel':
          textureKey = 'rich_barrel';
          depth = 1;
          scale = 0.8;
          break;
        case 'carrot_sack':
          textureKey = 'rich_carrot_sack';
          depth = 1;
          scale = 0.85;
          break;
        case 'sunflower':
          textureKey = 'rich_sunflower';
          depth = 1;
          scale = 0.85;
          break;
        case 'corn':
          textureKey = 'rich_corn';
          depth = 1;
          scale = 0.85;
          break;
        case 'tomato':
          textureKey = 'rich_tomato';
          depth = 1;
          scale = 0.85;
          break;
        case 'pumpkin':
          textureKey = 'rich_pumpkin';
          depth = 1;
          scale = 0.8;
          break;
        case 'strawberry':
          textureKey = 'rich_strawberry';
          depth = 1;
          scale = 0.8;
          break;
        case 'cow':
          textureKey = 'rich_cow';
          depth = 1;
          scale = 0.8;
          break;
        case 'hen':
          textureKey = 'rich_hen';
          depth = 2;
          scale = 0.75;
          break;
        case 'chick':
          textureKey = 'rich_chick';
          depth = 2;
          scale = 0.75;
          break;
      }

      this.add
        .image(prop.x, prop.y, textureKey)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setDepth(depth);
    });

    // 2. Ground Segments (Using seamless rich_ground tiles, 265x69)
    config.groundSegments.forEach((ground) => {
      const tileW = 265;
      const tileH = 69;
      const count = Math.ceil(ground.width / tileW);

      for (let c = 0; c < count; c++) {
        const x = ground.x + c * tileW + tileW / 2;
        const y = ground.y + tileH / 2;

        const groundTile = this.platforms.create(x, y, 'rich_ground') as Phaser.Physics.Arcade.Sprite;
        // Snug collision body on the grass surface
        groundTile.setSize(tileW, 40);
        groundTile.setOffset(0, 0);
        groundTile.refreshBody();
        groundTile.setDepth(0);

        // Fill deep soil below if needed
        const remainingDepth = ground.height - tileH;
        if (remainingDepth > 0) {
          const dirtFill = this.add.rectangle(x, y + tileH / 2 + remainingDepth / 2, tileW, remainingDepth, 0x4E342E);
          dirtFill.setDepth(0);
        }
      }
    });

    // 3. Floating Platforms (Using rich_platform floating islands, 185x79)
    config.floatingPlatforms.forEach((plat) => {
      const p = this.platforms.create(plat.x + 92, plat.y + 40, 'rich_platform') as Phaser.Physics.Arcade.Sprite;
      p.setSize(175, 24);
      p.setOffset(5, 2);
      p.refreshBody();
      p.setDepth(0);
    });

    // 4. Wooden Bridges
    config.bridges.forEach((bridge) => {
      const count = Math.ceil(bridge.width / 32);
      for (let i = 0; i < count; i++) {
        const b = this.platforms.create(bridge.x + i * 32 + 16, bridge.y + 6, 'tile_bridge') as Phaser.Physics.Arcade.Sprite;
        b.refreshBody();
        b.setDepth(0);
      }
    });

    // 5. Water Hazards (Water pond with water lilies & cattails from assets.png)
    config.waterHazards.forEach((hazard) => {
      const pond = this.add.image(hazard.x + hazard.width / 2, hazard.y - 12, 'rich_water_pond');
      pond.setOrigin(0.5, 0.5);
      pond.setDepth(0);
      this.tweens.add({
        targets: pond,
        scaleY: 0.97,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // 6. Breakable Boxes
    config.boxes.forEach((box) => {
      const b = new BreakableBox(this, box.x, box.y, this.particles);
      this.boxes.add(b);
    });

    // 7. Collectible Carrots
    config.carrots.forEach((c) => {
      const carrot = new Carrot(this, c.x, c.y, !!c.isGold, this.particles);
      this.carrots.push(carrot);
    });

    // 8. Enemies
    config.enemies.forEach((enemyCfg) => {
      let enemy: Enemy;
      if (enemyCfg.type === 'ladybug') {
        enemy = new Ladybug(this, enemyCfg.x, enemyCfg.y, this.particles);
      } else if (enemyCfg.type === 'caterpillar') {
        enemy = new Caterpillar(this, enemyCfg.x, enemyCfg.y, this.particles);
      } else if (enemyCfg.type === 'snail') {
        enemy = new Snail(this, enemyCfg.x, enemyCfg.y, this.particles);
      } else {
        enemy = new Beetle(this, enemyCfg.x, enemyCfg.y, this.particles);
      }
      this.enemies.push(enemy);
    });

    // 9. Goal Shrine (optional)
    if (config.goal) {
      this.goalShrine = new GoalShrine(this, config.goal.x, config.goal.y, this.particles);
    }
  }

  private setupCollisions(): void {
    // Player vs Platforms
    this.physics.add.collider(this.player, this.platforms);

    // Enemies vs Platforms
    this.enemies.forEach((enemy) => {
      this.physics.add.collider(enemy, this.platforms);
    });

    // Player vs Boxes
    this.physics.add.collider(
      this.player,
      this.boxes,
      (playerObj, boxObj) => {
        const player = playerObj as Player;
        const box = boxObj as BreakableBox;
        const pBody = player.body as Phaser.Physics.Arcade.Body;

        // Break if stomping from above
        if (pBody.velocity.y > 0 && player.y + 10 < box.y) {
          box.break();
          player.bounce();
        }
      },
      undefined,
      this
    );

    // Player vs Carrots
    this.carrots.forEach((carrot) => {
      this.physics.add.overlap(this.player, carrot, () => {
        carrot.collect();
      });
    });

    // Player vs Enemies
    this.enemies.forEach((enemy) => {
      this.physics.add.overlap(this.player, enemy, () => {
        this.handlePlayerEnemyOverlap(this.player, enemy);
      });
    });

    // Player vs Goal Shrine
    if (this.goalShrine) {
      this.physics.add.overlap(this.player, this.goalShrine, () => {
        if (!this.goalShrine?.reached) {
          this.goalShrine?.activate();
          this.player.celebrateVictory();
        }
      });
    }
  }

  private handlePlayerEnemyOverlap(player: Player, enemy: Enemy): void {
    if (enemy.isDefeated || player.isDead || player.isVictorious) return;

    const pBody = player.body as Phaser.Physics.Arcade.Body;

    // Stomp condition: Player falling down AND bottom intersects enemy top
    const isStomp = pBody.velocity.y > 0 && player.y + 14 < enemy.y;

    if (isStomp) {
      const defeated = enemy.onStomped();
      player.bounce();
      if (!defeated) {
        // Armored enemy took 1 hit, push it slightly
        enemy.setVelocityX(enemy.x > player.x ? 80 : -80);
      }
    } else {
      // Lateral impact: Player hurt & knockback
      player.takeDamage(enemy.x);
    }
  }

  private setupCamera(config: LevelConfig): void {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, config.width, config.height);
    cam.startFollow(this.player, true, 0.08, 0.08, 0, 40);
  }

  public update(time: number, delta: number): void {
    const gameState = useGameStore.getState().gameState;

    if (gameState === 'PAUSED') {
      return;
    }

    // Slowly scroll clouds across sky
    if (this.bgClouds) {
      this.bgClouds.tilePositionX += 0.2;
    }

    // Update player
    if (this.player) {
      this.player.update(time, delta);

      // Pit death check
      if (this.player.y > this.currentLevelConfig.height + 40 && !this.player.isDead) {
        this.player.die();
      }
    }

    // Update enemies
    this.enemies.forEach((enemy) => {
      if (enemy.active) {
        enemy.update();
      }
    });
  }

  public restartCurrentLevel(): void {
    this.scene.restart();
  }
}
