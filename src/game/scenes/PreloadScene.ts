import Phaser from 'phaser';
import { AssetGenerator } from '../assets/assetGenerator';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  public preload(): void {
    // Generate particle & fallback textures
    AssetGenerator.generateAll(this);

    // 1. Load the 8-frame Bunny Spritesheets
    this.load.spritesheet('bunny_idle', '/assets/sprites/bunny/bunny_idle.png', {
      frameWidth: 128,
      frameHeight: 176,
    });
    // bunny walking
    this.load.spritesheet('bunny_walk', '/assets/sprites/bunny/bunny_walking.png', {
      frameWidth: 128,
      frameHeight: 176,
    });


    // 2. Load Platform & Ground
    this.load.image('rich_platform', '/assets/environment/platform_float.png');
    this.load.image('rich_ground', '/assets/environment/ground_tile.png');

    // 3. Load Items (Carrots)
    this.load.image('rich_carrot', '/assets/items/carrot_rich.png');
    this.load.image('rich_carrot_gold', '/assets/items/carrot_gold_rich.png');

    // 4. Load Parallax Background
    this.load.image('game_background', '/assets/background/background.png');
    //this.load.image('rich_clouds', '/assets/background/clouds_rich.png');
  }

  public create(): void {
    this.createAnimations();
    this.scene.start('GameScene');
  }

  private createAnimations(): void {
    // Bunny Idle Animation: 8 frames (0 to 7) at 128w * 176h
    this.anims.create({
      key: 'bunny_idle_anim',
      frames: this.anims.generateFrameNumbers('bunny_idle', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'bunny_walk_anim',
      frames: this.anims.generateFrameNumbers('bunny_walk', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });
  }
}
