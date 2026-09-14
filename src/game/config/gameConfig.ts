import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { GameScene } from "../scenes/GameScene";
import { configureLandscapeDisplay } from "./landscapeDisplay";

export const phaserGameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "phaser-container",
  backgroundColor: "#81D4FA",
  scale: {
    // The landscape wrapper handles rotation; size from its unrotated bounds.
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.NO_CENTER,
    width: 1280,
    height: 720,
  },
  callbacks: {
    postBoot: configureLandscapeDisplay,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 920 },
      debug: false,
    },
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
  scene: [BootScene, PreloadScene, GameScene],
};
