import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public create(): void {
    // Immediate transition to Preload
    this.scene.start('PreloadScene');
  }
}
