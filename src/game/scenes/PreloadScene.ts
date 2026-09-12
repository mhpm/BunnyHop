import Phaser from "phaser";
import { AssetGenerator } from "../assets/assetGenerator";
import { GROUND_ELEMENTS_LIST } from "../config/groundElements";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  public preload(): void {
    // Generate particle & fallback textures
    AssetGenerator.generateAll(this);

    // 1. Load the 8-frame Bunny Spritesheets
    this.load.spritesheet(
      "bunny_idle",
      "/assets/sprites/bunny/bunny_idle.png",
      {
        frameWidth: 118,
        frameHeight: 174,
      },
    );
    // bunny walking
    this.load.spritesheet(
      "bunny_walk",
      "/assets/sprites/bunny/bunny_walking.png",
      {
        frameWidth: 128,
        frameHeight: 175,
      },
    );
    // bunny jumping (1 frame 120x173)
    this.load.spritesheet(
      "bunny_jump",
      "/assets/sprites/bunny/bunny_jump.png",
      {
        frameWidth: 120,
        frameHeight: 173,
      },
    );
    // bunny running (8 frames 150x175)
    this.load.spritesheet(
      "bunny_run",
      "/assets/sprites/bunny/bunny_running.png",
      {
        frameWidth: 164,
        frameHeight: 175,
      },
    );
    // bunny dash (1 frame 218x125)
    this.load.spritesheet(
      "bunny_dash",
      "/assets/sprites/bunny/bunny_dash.png",
      {
        frameWidth: 218,
        frameHeight: 125,
      },
    );

    // 2. Load Platform & Ground (incluyendo todo el catálogo de ground_elements)
    this.load.image("rich_platform", "/assets/environment/platform_float.png");
    this.load.image("ground_tile", "/assets/environment/ground_tile.png");

    GROUND_ELEMENTS_LIST.forEach((el) => {
      this.load.image(el.id, `/assets/environment/ground_elements/${el.file}`);
    });

    // 3. Load Items (Carrots)
    this.load.image("rich_carrot", "/assets/items/carrot_rich.png");
    this.load.spritesheet("golden_carrot", "/assets/items/golden_carrot.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    // 4. Load Parallax Background & Foreground
    this.load.image("game_background", "/assets/background/background.png");
    this.load.image(
      "game_foreground",
      "/assets/background/background_front.png?v=2",
    );

    // 5. Load Goal Shrine
    this.load.image("rich_goal", "/assets/environment/goal.png");
  }

  public create(): void {
    this.createAnimations();
    this.scene.start("GameScene");
  }

  private createAnimations(): void {
    // Bunny Idle Animation: 8 frames (0 to 7) at 128w * 176h
    this.anims.create({
      key: "bunny_idle_anim",
      frames: this.anims.generateFrameNumbers("bunny_idle", {
        start: 0,
        end: 2,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "bunny_walk_anim",
      frames: this.anims.generateFrameNumbers("bunny_walk", {
        start: 0,
        end: 7,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "bunny_jump_anim",
      frames: this.anims.generateFrameNumbers("bunny_jump", {
        start: 0,
        end: 0,
      }),
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: "bunny_run_anim",
      frames: this.anims.generateFrameNumbers("bunny_run", {
        start: 0,
        end: 4,
      }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "bunny_dash_anim",
      frames: this.anims.generateFrameNumbers("bunny_dash", {
        start: 0,
        end: 0,
      }),
      frameRate: 1,
      repeat: -1,
    });

    // Golden Carrot Sparkling Animation: 4 frames (0 to 3) at 128w * 128h
    this.anims.create({
      key: "golden_carrot_anim",
      frames: this.anims.generateFrameNumbers("golden_carrot", {
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });
  }
}
