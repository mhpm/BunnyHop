import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Carrot } from "../objects/Carrot";
import { BreakableBox } from "../objects/BreakableBox";
import { GoalShrine } from "../objects/GoalShrine";
import { ParticleManager } from "../systems/ParticleManager";
import {
  LEVEL_1_CONFIG,
  LevelConfig,
  PropType,
  EnemyType,
} from "../levels/levelData";
import { LevelBuilder } from "../levels/LevelBuilder";
import { useGameStore } from "../../store/gameStore";

export class GameScene extends Phaser.Scene {
  public player!: Player;
  private particles!: ParticleManager;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private boxes!: Phaser.Physics.Arcade.StaticGroup;
  private enemies: Enemy[] = [];
  private carrots: Carrot[] = [];
  private goalShrine?: GoalShrine;
  private currentLevelConfig: LevelConfig = LEVEL_1_CONFIG;
  public levelBuilder!: LevelBuilder;

  // Parallax layers
  private bgClouds!: Phaser.GameObjects.TileSprite;
  private bgTile!: Phaser.GameObjects.TileSprite;
  private fgTile!: Phaser.GameObjects.TileSprite;
  private readonly FG_TEXTURE_HEIGHT = 175;
  private readonly FG_SCALE = 0.35;

  constructor() {
    super({ key: "GameScene" });
  }

  public create(): void {
    const config = this.currentLevelConfig;

    // Reset store stats for this level
    useGameStore.getState().resetLevelStats(config.carrots.length);

    // Set world physics bounds
    this.physics.world.setBounds(
      0,
      0,
      config.width,
      Math.max(config.height + 100, 1400),
    );

    // Initialize particle manager
    this.particles = new ParticleManager(this);

    // Build Parallax Layers
    this.createParallaxBackground();

    // Create Groups
    this.platforms = this.physics.add.staticGroup();
    this.boxes = this.physics.add.staticGroup();
    this.enemies = [];
    this.carrots = [];

    // Initialize LevelBuilder (SOLID Pattern)
    this.levelBuilder = new LevelBuilder({
      scene: this,
      platforms: this.platforms,
      boxes: this.boxes,
      enemies: this.enemies,
      carrots: this.carrots,
      particles: this.particles,
    });

    // Build World Geometry & Objects
    this.buildLevel(config);

    // Spawn Player
    this.player = new Player(
      this,
      config.spawn.x,
      config.spawn.y,
      this.particles,
    );

    // Collisions and Overlaps
    this.setupCollisions();

    // Camera Configuration
    this.setupCamera(config);

    // Keyboard shortcuts (e.g. ESC for pause)
    this.input.keyboard?.on("keydown-ESC", () => {
      const state = useGameStore.getState().gameState;
      if (state === "PLAYING") {
        useGameStore.getState().setGameState("PAUSED");
      } else if (state === "PAUSED") {
        useGameStore.getState().setGameState("PLAYING");
      }
    });
  }

  private createParallaxBackground(): void {
    const viewW = this.scale.width;
    const viewH = this.scale.height;

    // 1. Background (fondo lejano detrás de todo)
    this.bgTile = this.add
      .tileSprite(0, 0, viewW, viewH, "game_background")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-40);

    // 2. Foreground (frente en primer plano: abajo de la pantalla y más pequeño)
    const fgHeight = this.FG_TEXTURE_HEIGHT * this.FG_SCALE;
    this.fgTile = this.add
      .tileSprite(0, viewH, viewW, fgHeight, "game_foreground")
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(100);

    this.updateBackgroundSize();
  }

  private updateBackgroundSize(): void {
    const viewW = this.scale.width;
    const viewH = this.scale.height;

    // Background lejano
    if (this.bgTile) {
      this.bgTile.setSize(viewW, viewH);
      const scale = Math.max(1, viewH / 768);
      this.bgTile.setTileScale(scale, scale);
    }

    // Foreground del frente (anclado abajo de la pantalla, pequeño y sutil)
    if (this.fgTile) {
      const fgHeight = this.FG_TEXTURE_HEIGHT * this.FG_SCALE;
      this.fgTile.setPosition(0, viewH + 3);
      this.fgTile.setSize(viewW, fgHeight);
      this.fgTile.setTileScale(this.FG_SCALE, this.FG_SCALE);
      this.fgTile.tilePositionY = 0;
    }
  }

  /**
   * Métodos declarativos de construcción de nivel (disponibles para diseño a medida)
   */
  public createGroundSegment(
    x: number,
    y: number,
    count = 1,
  ): Phaser.Physics.Arcade.Sprite[] {
    return this.levelBuilder.createGroundSegment(x, y, count);
  }

  public createPlatform(x: number, y: number): Phaser.Physics.Arcade.Sprite {
    return this.levelBuilder.createPlatform(x, y);
  }

  public createBridge(
    x: number,
    y: number,
    width: number,
  ): Phaser.Physics.Arcade.Sprite[] {
    return this.levelBuilder.createBridge(x, y, width);
  }

  public createCarrot(x: number, y: number, isGold = false): Carrot {
    return this.levelBuilder.createCarrot(x, y, isGold);
  }

  public createBox(x: number, y: number): BreakableBox {
    return this.levelBuilder.createBox(x, y);
  }

  public createEnemy(type: EnemyType, x: number, y: number): Enemy {
    return this.levelBuilder.createEnemy(type, x, y);
  }

  public createProp(
    type: PropType,
    x: number,
    y: number,
    scale?: number,
  ): Phaser.GameObjects.Image {
    return this.levelBuilder.createProp(type, x, y, scale);
  }

  public createGoal(x: number, y: number): GoalShrine {
    this.goalShrine = this.levelBuilder.createGoal(x, y);
    return this.goalShrine;
  }

  /**
   * Construye el nivel a partir de la configuración o usando métodos directos
   */
  private buildLevel(config: LevelConfig): void {
    // 1. Elementos escénicos / Props
    config.props.forEach((p) => this.createProp(p.type, p.x, p.y, p.scale));

    // 2. Segmentos de suelo continuo
    config.groundSegments.forEach((g) => {
      const tileCount =
        g.width > 0 ? Math.ceil(g.width / LevelBuilder.TILE_WIDTH) : 10;
      this.createGroundSegment(g.x, g.y, tileCount);
    });

    // 3. Plataformas flotantes
    config.floatingPlatforms.forEach((plat) =>
      this.createPlatform(plat.x, plat.y),
    );

    // 4. Puentes de madera
    config.bridges.forEach((b) => this.createBridge(b.x, b.y, b.width));

    // 5. Charcos y peligros de agua
    config.waterHazards.forEach((w) =>
      this.levelBuilder.createWaterHazard(w.x, w.y, w.width),
    );

    // 6. Cajas rompibles
    config.boxes.forEach((box) => this.createBox(box.x, box.y));

    // 7. Zanahorias coleccionables
    config.carrots.forEach((c) => this.createCarrot(c.x, c.y, c.isGold));

    // 8. Enemigos
    config.enemies.forEach((e) => this.createEnemy(e.type, e.x, e.y));

    // 9. Meta final
    if (config.goal) {
      this.createGoal(config.goal.x, config.goal.y);
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
        const box = boxObj as unknown as BreakableBox;
        const pBody = player.body as Phaser.Physics.Arcade.Body;

        // Break if stomping from above
        if (pBody.velocity.y > 0 && player.y + 10 < box.y) {
          box.break();
          player.bounce();
        }
      },
      undefined,
      this,
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
    cam.setBounds(
      0,
      0,
      config.width,
      Math.max(config.height, this.scale.height),
    );
    cam.startFollow(this.player, true, 0.08, 0.08, 0, 40);

    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      cam.setBounds(
        0,
        0,
        config.width,
        Math.max(config.height, gameSize.height),
      );
      this.updateBackgroundSize();
    });
  }

  public update(time: number, delta: number): void {
    const gameState = useGameStore.getState().gameState;

    if (gameState === "PAUSED") {
      return;
    }

    // Slowly scroll clouds across sky
    if (this.bgClouds) {
      this.bgClouds.tilePositionX += 0.2;
    }

    // Parallax suave del fondo (más lento: 0.35x)
    if (this.bgTile) {
      this.bgTile.tilePositionX = this.cameras.main.scrollX * 0.35;
    }

    // Parallax del frente (más rápido: 1.25x para efecto de cercanía en primer plano)
    if (this.fgTile) {
      this.fgTile.tilePositionX =
        (this.cameras.main.scrollX * 1.25) / this.FG_SCALE;
    }

    // Update player
    if (this.player) {
      this.player.update(time, delta);

      // Pit death check
      if (
        this.player.y > this.currentLevelConfig.height + 40 &&
        !this.player.isDead
      ) {
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
