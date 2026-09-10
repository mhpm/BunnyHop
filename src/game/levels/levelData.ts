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
  width: 5800,
  height: 720,
  spawn: { x: 120, y: 520 },

  // Segmentos de tierra firme con elevaciones y abismos/agujeros calculados
  groundSegments: [
    // Zona 1: Inicio seguro y aprendizaje
    { x: 0, y: 600, width: 735, height: 0 },       // Tramo 1 (3 bloques: x 0 a 735)
    { x: 895, y: 600, width: 490, height: 0 },     // Tramo 2 (2 bloques tras el 1er agujero de 160px: x 895 a 1385)

    // Zona 2: Meseta elevada
    { x: 1680, y: 480, width: 735, height: 0 },    // Tramo 3 (3 bloques elevados: x 1680 a 2415)

    // Zona 4: Pilares de ritmo y saltos de precisión
    { x: 3760, y: 550, width: 245, height: 0 },    // Pilar 1 (1 bloque: x 3760 a 4005)
    { x: 4160, y: 550, width: 245, height: 0 },    // Pilar 2 (1 bloque: x 4160 a 4405)

    // Zona 5: Gran pradera de meta final
    { x: 4760, y: 600, width: 980, height: 0 },    // Tramo final (4 bloques: x 4760 a 5740)
  ],

  // Plataformas flotantes (islas flotantes conectadas como escalones lógicos)
  floatingPlatforms: [
    // Conector hacia la meseta elevada (Zona 2)
    { x: 1440, y: 510, width: 140, height: 30, isFloating: true },

    // Isla secreta alta encima de la meseta (recompensa zanahoria dorada)
    { x: 1900, y: 340, width: 140, height: 30, isFloating: true },

    // Zona 3: El Archipiélago flotante sobre el gran abismo (escalera ascendente y descendente)
    { x: 2490, y: 460, width: 140, height: 30, isFloating: true }, // Escalón 1
    { x: 2740, y: 400, width: 140, height: 30, isFloating: true }, // Escalón 2
    { x: 2990, y: 320, width: 140, height: 30, isFloating: true }, // Cumbre del archipiélago (oro)
    { x: 3250, y: 400, width: 140, height: 30, isFloating: true }, // Descenso 1
    { x: 3500, y: 470, width: 140, height: 30, isFloating: true }, // Descenso 2

    // Zona 4: Trampolín hacia la pradera final
    { x: 4490, y: 470, width: 140, height: 30, isFloating: true },
  ],

  // Peligros de agua y puentes (preparados para futuras expansiones)
  waterHazards: [],
  bridges: [],
  props: [],
  enemies: [],
  boxes: [],

  // Zanahorias colocadas lógicamente para guiar saltos (parábolas) y recompensar exploración
  carrots: [
    // --- Zona 1: Pradera inicial y primer salto guiado en arco ---
    { x: 260, y: 550 },
    { x: 380, y: 550 },
    { x: 500, y: 550 },
    // Arco sobre el primer abismo (x: 735 a 895)
    { x: 770, y: 510 },
    { x: 815, y: 470 }, // Cúspide del salto
    { x: 860, y: 510 },
    // Tierra tras el salto
    { x: 970, y: 550 },
    { x: 1100, y: 550 },

    // --- Zona 2: Subida a la meseta y ruta alta secreta ---
    { x: 1530, y: 460 }, // Sobre la plataforma flotante conectora
    { x: 1800, y: 430 },
    { x: 1980, y: 430 },
    { x: 2160, y: 430 },
    // Zanahoria dorada secreta en la isla alta
    { x: 1990, y: 280, isGold: true },

    // --- Zona 3: El Archipiélago Flotante en el cielo ---
    { x: 2580, y: 410 },
    { x: 2700, y: 360 }, // Arco entre isla 1 e isla 2
    { x: 2830, y: 350 },
    // Gran recompensa en la cumbre más alta del archipiélago
    { x: 3080, y: 260, isGold: true },
    // Camino de descenso acrobático
    { x: 3200, y: 340 },
    { x: 3340, y: 350 },
    { x: 3590, y: 420 },

    // --- Zona 4: Pilares de precisión ---
    { x: 3880, y: 500 },
    // Arco entre pilares
    { x: 4060, y: 470 },
    { x: 4280, y: 500 },
    // Trampolín final
    { x: 4580, y: 420 },

    // --- Zona 5: Carrera triunfal hacia el Santuario de la Meta ---
    { x: 4880, y: 550 },
    { x: 5020, y: 550 },
    { x: 5160, y: 510, isGold: true }, // Trofeo dorado antes de la meta
    { x: 5300, y: 550 },
  ],

  // Meta del nivel: Santuario brillante al final del recorrido
  goal: { x: 5460, y: 610 },
};
