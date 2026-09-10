export interface PlatformConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  isFloating?: boolean;
}

export interface PropConfig {
  type:
    | "tree"
    | "tree_alt"
    | "bush"
    | "bush_large"
    | "rock"
    | "sign"
    | "fence"
    | "fence_white"
    | "windmill"
    | "barn"
    | "lantern"
    | "haystack"
    | "haycart"
    | "barrel"
    | "carrot_sack"
    | "sunflower"
    | "corn"
    | "tomato"
    | "pumpkin"
    | "strawberry"
    | "cow"
    | "hen"
    | "chick"
    | "water_pond";
  x: number;
  y: number;
  scale?: number;
}

export type PropType = PropConfig["type"];

export interface EnemyConfig {
  type: "ladybug" | "caterpillar" | "snail" | "beetle";
  x: number;
  y: number;
}

export type EnemyType = EnemyConfig["type"];

export interface CollectibleConfig {
  x: number;
  y: number;
  isGold?: boolean;
}

export interface BoxConfig {
  x: number;
  y: number;
}

export interface LevelConfig {
  id: string;
  name: string;
  worldName: string;
  width: number;
  height: number;
  spawn: { x: number; y: number };
  goal?: { x: number; y: number };
  groundSegments: { x: number; y: number; width: number; height: number }[];
  floatingPlatforms: PlatformConfig[];
  waterHazards: { x: number; y: number; width: number; height: number }[];
  bridges: { x: number; y: number; width: number }[];
  props: PropConfig[];
  enemies: EnemyConfig[];
  carrots: CollectibleConfig[];
  boxes: BoxConfig[];
}

export const LEVEL_1_CONFIG: LevelConfig = {
  id: "level_1_1",
  name: "Pradera Soleada (Sunny Meadow)",
  worldName: "Mundo 1 — Pradera",
  width: 10200,
  height: 720,
  spawn: { x: 110, y: 500 }, // bunny initial position

  // Ground platform across the level where the bunny can walk
  groundSegments: [
    { x: 0, y: 600, width: 735, height: 0 }, // Tramo 1 (3 bloques)
    { x: 900, y: 550, width: 980, height: 0 }, // Tramo 2 (más alto, salto de vacío en medio)
    { x: 2100, y: 600, width: 1100, height: 0 }, // Tramo 3
  ],

  // Floating platforms (removed secondary platforms)
  floatingPlatforms: [
    { x: 200, y: 550, width: 247, height: 0, isFloating: true },
    { x: 500, y: 500, width: 247, height: 0, isFloating: true },
  ],

  // Water gap hazards (removed)
  waterHazards: [],

  // Wooden bridges (removed)
  bridges: [],

  // Scenery props (removed trees, fences, farm elements, animals)
  props: [],

  // Enemies (removed all enemies)
  enemies: [],

  // Collectibles: Carrots along the walking platform
  carrots: [
    { x: 300, y: 550 },
    { x: 420, y: 550 },
    { x: 540, y: 550 },
    { x: 680, y: 550 },
    { x: 820, y: 550 },
    { x: 960, y: 550, isGold: true },
    { x: 1120, y: 550 },
    { x: 1280, y: 550 },
    { x: 1440, y: 550 },
    { x: 1600, y: 550, isGold: true },
    { x: 1780, y: 550 },
    { x: 1960, y: 550 },
    { x: 2140, y: 550 },
    { x: 2320, y: 550 },
    { x: 2500, y: 550, isGold: true },
    { x: 2700, y: 550 },
    { x: 2900, y: 550 },
  ],

  // Wooden breakable crates (removed)
  boxes: [],
};
