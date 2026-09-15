import Phaser from "phaser";
import { AssetGenerator } from "../assets/assetGenerator";
import { GROUND_ELEMENTS_LIST } from "../config/groundElements";
import { ENVIRONMENT_ELEMENTS_LIST } from "../config/environmentElements";
import { audioManager } from "../systems/AudioManager";

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
    // bunny dash shape definition (from PhysicsEditor)
    this.load.json("bunny_dash_shape", "/assets/sprites/bunny/dash.json");

    // 2. Load Platform & Ground (catálogo de ground_elements)
    GROUND_ELEMENTS_LIST.forEach((el) => {
      this.load.image(el.id, `/assets/environment/ground_elements/${el.file}`);
    });

    // 2.5 Load Environment Elements (únicamente desde enviroment_elements)
    ENVIRONMENT_ELEMENTS_LIST.forEach((el) => {
      this.load.image(el.id, `/assets/environment/enviroment_elements/${el.file}`);
    });

    // 3. Load Items (Carrots)
    this.load.image("rich_carrot", "/assets/items/carrot_rich.png");
    this.load.spritesheet("golden_carrot", "/assets/items/golden_carrot.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    // Ladybug walk animation: 4 frames (256x256 each)
    this.load.spritesheet(
      "enemy_ladybug",
      "/assets/sprites/enemies/ladybug/ladybug.png",
      {
        frameWidth: 256,
        frameHeight: 256,
      },
    );
    this.load.image(
      "enemy_ladybug_dead",
      "/assets/sprites/enemies/ladybug/ladydie.png",
    );
    this.load.spritesheet(
      "enemy_bee_flying",
      "/assets/sprites/enemies/bee/bee_flying.png",
      {
        frameWidth: 256,
        frameHeight: 256,
      },
    );
    this.load.image(
      "enemy_bee_dead",
      "/assets/sprites/enemies/bee/bee_die.png",
    );

    // 4. Load Parallax Background & Foreground
    this.load.image("game_background", "/assets/background/background.png");
    this.load.image(
      "game_foreground",
      "/assets/background/background_front.png?v=2",
    );

    // 5. Load Goal Shrine
    this.load.image("rich_goal", "/assets/environment/goal.png");

    // 6. Load Background Music (Phaser audio pipeline)
    this.load.audio(
      "bg_music_world_1",
      "/assets/music/background_music/bg_music_world_1.mp3",
    );
    this.load.audio(
      "main_title_music",
      "/assets/music/background_music/main_title.mp3",
    );
  }

  public create(): void {
    this.createAnimations();
    audioManager.initPhaserSound(
      this.sound,
      this.cache.audio.exists("bg_music_world_1"),
      this.cache.audio.exists("main_title_music"),
    );
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

    // Enemy Walking Animations (phaser-animations standard)
    this.anims.create({
      key: "enemy_ladybug_walk",
      frames: this.anims.generateFrameNumbers("enemy_ladybug", {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "enemy_bee_flying",
      frames: this.anims.generateFrameNumbers("enemy_bee_flying", {
        start: 0,
        end: 2,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "enemy_caterpillar_walk",
      frames: [{ key: "enemy_caterpillar_0" }, { key: "enemy_caterpillar_1" }],
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: "enemy_snail_walk",
      frames: [{ key: "enemy_snail_0" }, { key: "enemy_snail_1" }],
      frameRate: 3,
      repeat: -1,
    });
    this.anims.create({
      key: "enemy_beetle_walk",
      frames: [{ key: "enemy_beetle_0" }, { key: "enemy_beetle_1" }],
      frameRate: 6,
      repeat: -1,
    });
  }
}
