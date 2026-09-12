import { GroundElementId, GROUND_PRESETS } from "../config/groundElements";
import {
  EnvironmentElementId,
  ENVIRONMENT_PRESETS,
} from "../config/environmentElements";

export { GROUND_PRESETS, ENVIRONMENT_PRESETS };
export type { GroundElementId, EnvironmentElementId };

export interface PlatformConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  isFloating?: boolean;
  element?: GroundElementId; // Elige cualquier isla flotante (ej: 'ground_044', 'ground_047', 'ground_040', etc.)
  scale?: number;
}

export interface GroundSegmentConfig {
  x: number;
  y: number;
  width: number;
  height?: number;
  element?: GroundElementId; // Elige el bloque de suelo (por defecto 'ground_104')
}

export interface GroundElementPlacement {
  element: GroundElementId; // Cualquier pieza del folder ground_elements ('ground_000' a 'ground_104')
  x: number;
  y: number;
  isSolid?: boolean; // Por defecto true (con colisión física sólida). False = decorativo
  scale?: number;
  flipX?: boolean;
  depth?: number;
  hitbox?: {
    width?: number;
    height?: number;
    offsetX?: number;
    offsetY?: number;
  };
}

export interface EnvironmentElementPlacement {
  element: EnvironmentElementId; // Piezas del folder enviroment_elements
  x: number;
  y?: number; // Opcional: si no se especifica, se ancla automáticamente al nivel del suelo en X
  offsetY?: number; // Ajuste vertical fino relativo al suelo (por defecto 0)
  isSolid?: boolean; // Por defecto false para escenografía de entorno. True si se desea colisión sólida
  scale?: number;
  flipX?: boolean;
  depth?: number;
  alpha?: number;
  hitbox?: {
    width?: number;
    height?: number;
    offsetX?: number;
    offsetY?: number;
  };
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
  groundSegments: GroundSegmentConfig[];
  floatingPlatforms: PlatformConfig[];
  groundElements?: GroundElementPlacement[]; // Piezas modulares individuales sueltas combinables
  environmentElements?: EnvironmentElementPlacement[]; // Elementos modulares de escenografía y entorno (enviroment_elements)
  waterHazards: { x: number; y: number; width: number; height: number }[];
  bridges: { x: number; y: number; width: number }[];
  props: PropConfig[];
  enemies: EnemyConfig[];
  carrots: CollectibleConfig[];
  boxes: BoxConfig[];
}

export const LEVEL_1_CONFIG: LevelConfig = {
  id: "level_1_1",
  name: "Pradera del Viento y Cavernas (Windy Meadow & Dash Caverns)",
  worldName: "Mundo 1 — Desafío de Velocidad y Deslizamiento",
  width: 16800,
  height: 720,
  spawn: { x: 120, y: 520 },

  // =========================================================================
  // 1. SEGMENTOS DE SUELO CONTINUO (Tramos de tierra firme variados)
  // =========================================================================
  groundSegments: [
    // --- ZONA 1: Pradera de Iniciación y Arranque (0 a 1600) ---
    { x: 0, y: 600, width: 1600, element: "ground_104" }, // Suelo inicial plano para acelerar y probar el dash

    // --- ZONA 2: Meseta Tras el Gran Cañón (1980 a 3700) ---
    // (Foso de 380px entre 1600 y 1980 -> ¡Requiere sprint a máxima velocidad para cruzar!)
    { x: 1980, y: 600, width: 600, element: "ground_100" }, // Zona de aterrizaje y aceleración
    { x: 2650, y: 540, width: 1050, element: "ground_101" }, // Meseta elevada con el Gran Túnel de Rocas

    // --- ZONA 3: El Desfiladero de Pilares de Ritmo (4050 a 6800) ---
    // (Foso de 350px entre 3700 y 4050)
    { x: 4050, y: 520, width: 500, element: "ground_102" }, // Rampa intermedia
    { x: 4750, y: 440, width: 245, element: "ground_103" }, // Pilar de Salto de Ritmo 1
    { x: 5150, y: 380, width: 245, element: "ground_102" }, // Pilar de Salto de Ritmo 2 (más alto)
    { x: 5600, y: 460, width: 245, element: "ground_103" }, // Pilar de Salto de Ritmo 3 (descenso)
    { x: 6050, y: 600, width: 750, element: "ground_099" }, // Aterrizaje inferior

    // --- ZONA 4: La Gran Pista de Despegue (7000 a 8600) ---
    // (Pista larga para ganar máxima velocidad -> barrera baja -> salto sobre abismo)
    { x: 7000, y: 600, width: 1600, element: "ground_100" }, // Pista continua con túnel bajo al final

    // --- ZONA 5: Valle del Archipiélago y Caverna Subterránea (9000 a 12200) ---
    // (Foso de 400px entre 8600 y 9000 -> Requiere Sprint-Jump o Dash-Jump)
    { x: 9000, y: 560, width: 800, element: "ground_101" }, // Meseta tras el salto épico
    { x: 10050, y: 600, width: 1100, element: "ground_104" }, // Caverna baja subterránea
    { x: 11400, y: 540, width: 800, element: "ground_102" }, // Rampa de salida

    // --- ZONA 6: La Gran Avenida Triunfal y Meta (12600 a 16600) ---
    // (Foso de 400px entre 12200 y 12600)
    { x: 12600, y: 480, width: 950, element: "ground_099" }, // Terraza florida previa a la meta
    { x: 13800, y: 600, width: 2800, element: "ground_104" }, // Avenida final con el Santuario Dorado
  ],

  // =========================================================================
  // 2. PLATAFORMAS FLOTANTES E ISLAS (Saltos aéreos y techos de túneles bajos)
  // =========================================================================
  floatingPlatforms: [
    // --- TÚNEL BAJO 1: La Primera Barrera de Deslizamiento (Zona 1) ---
    // Techo a y=465 sobre suelo y=600 -> Hueco libre de 50px (¡Conejo de pie de 72px choca, en Dash pasa!)
    { x: 950, y: 465, element: "ground_040", isFloating: true }, // Placa de roca baja (210px)

    // --- TÚNEL BAJO 2: La Caverna de Roca y Zanahoria Dorada (Zona 2) ---
    // Dos bloques consecutivos a y=405 sobre suelo y=540 -> Hueco libre de 50px a lo largo de 300px
    { x: 2850, y: 405, element: "ground_013", isFloating: true }, // Bloque de roca 1 (159px)
    { x: 3000, y: 405, element: "ground_010", isFloating: true }, // Bloque de roca 2 (138px)

    // --- ISLAS CELESTES Y RUTA ALTA (Zona 3) ---
    { x: 4400, y: 350, element: "ground_044", isFloating: true }, // Isla con flor previa
    { x: 5350, y: 220, element: "ground_041", isFloating: true }, // Mini isla en el cielo (Zanahoria Dorada 2)
    { x: 5850, y: 340, element: "ground_046", isFloating: true }, // Isla intermedia de bajada

    // --- TÚNEL BAJO 3: La Barrera de la Pista de Despegue (Zona 4) ---
    // Techo justo antes del abismo: ¡debes esprintar, deslizarte por debajo y saltar al salir!
    { x: 8100, y: 465, element: "ground_047", isFloating: true }, // Isla ancha (212px) actuando como barrera baja

    // --- EL ARCHIPIÉLAGO CELESTE (Zona 5: Escalera de islas) ---
    { x: 9500, y: 420, element: "ground_045", isFloating: true }, // Isla grande (187px)
    { x: 9800, y: 320, element: "ground_043", isFloating: true }, // Isla mediana (183px)
    { x: 10150, y: 220, element: "ground_042", isFloating: true }, // Isla compacta con Zanahoria Dorada 3!
    { x: 10550, y: 340, element: "ground_047", isFloating: true }, // Isla ancha de descenso

    // --- TÚNEL BAJO 4: Laberinto Bajo Subterráneo (Zona 5) ---
    { x: 10400, y: 465, element: "ground_016", isFloating: true }, // Bloque de techo 1
    { x: 10600, y: 465, element: "ground_017", isFloating: true }, // Bloque de techo 2

    // --- ISLAS DE LA ZONA FINAL (Zona 6) ---
    { x: 13200, y: 380, element: "ground_044", isFloating: true }, // Isla de entrada al santuario
    { x: 13550, y: 280, element: "ground_041", isFloating: true }, // Mini isla con Zanahoria Dorada 4!
    { x: 14600, y: 465, element: "ground_040", isFloating: true }, // Arco triunfal bajo
  ],

  // =========================================================================
  // 3. PIEZAS MODULARES LIBRES (Pilares, acantilados y cimientos)
  // =========================================================================
  groundElements: [
    // Columnas y acantilados bajo los abismos
    { element: "ground_000", x: 1500, y: 680, isSolid: false, depth: -5 },
    { element: "ground_004", x: 1980, y: 680, isSolid: false, depth: -5 },

    // Cimientos del cañón
    { element: "ground_006", x: 3600, y: 620, isSolid: false, depth: -5 },
    { element: "ground_021", x: 4050, y: 620, isSolid: false, depth: -5 },

    // Pilares de piedra verticales
    { element: "ground_027", x: 4770, y: 530, isSolid: false, depth: -5 },
    { element: "ground_028", x: 5170, y: 470, isSolid: false, depth: -5 },
    { element: "ground_030", x: 5620, y: 550, isSolid: false, depth: -5 },

    // Columnas del abismo de despegue
    { element: "ground_000", x: 8500, y: 680, isSolid: false, depth: -5 },
    { element: "ground_004", x: 9000, y: 680, isSolid: false, depth: -5 },

    // Acantilado de la terraza real
    { element: "ground_024", x: 12600, y: 570, isSolid: false, depth: -5 },
    { element: "ground_025", x: 13500, y: 570, isSolid: false, depth: -5 },
  ],

  // =========================================================================
  // 3.5 ELEMENTOS MODULARES DE ENTORNO (únicamente desde enviroment_elements)
  // =========================================================================
  environmentElements: [
    // --- Zona 1: Entrada y Portal del Túnel 1 (Suelo a 600) ---
    { element: "enviroment_021", x: 250, depth: -2 }, // Árbol frondoso ancestral de fondo
    { element: "enviroment_019", x: 450, depth: 1 }, // Arbusto verde de pradera
    { element: "enviroment_012", x: 620, depth: 0 }, // Roca con vegetación
    { element: "enviroment_022", x: 820, depth: -1 }, // Pino de fondo
    { element: "enviroment_026", x: 1350, depth: 1 }, // Roca decorativa
    { element: "enviroment_023", x: 1550, depth: -2 }, // Árbol / estructura alta

    // --- Zona 2: Meseta y Caverna de Roca (Suelo a 600 y 540) ---
    { element: "enviroment_020", x: 2050, depth: 1 }, // Piedra pequeña
    { element: "enviroment_021", x: 2350, depth: -2 }, // Árbol en meseta
    { element: "enviroment_034", x: 2750, depth: -1 }, // Bloque de ruina
    { element: "enviroment_035", x: 3100, depth: -1 }, // Bloque de ruina 2
    { element: "enviroment_040", x: 3450, depth: 1 }, // Roca alargada de terreno

    // --- Zona 3: Cañón de Columnas Verticales ---
    { element: "enviroment_024", x: 4200, depth: 1 },
    { element: "enviroment_028", x: 4800, depth: -1 },
    { element: "enviroment_022", x: 5500, depth: -1 },
    { element: "enviroment_019", x: 6150, depth: 1 },

    // --- Zona 4: Pista de Despegue (Suelo a 600) ---
    { element: "enviroment_021", x: 7100, depth: -2 },
    { element: "enviroment_018", x: 7850, depth: 1 },
    { element: "enviroment_040", x: 8400, depth: 1 },

    // --- Zona 5: Tramo del Laberinto y Templo ---
    { element: "enviroment_023", x: 9100, depth: -2 },
    { element: "enviroment_034", x: 10400, depth: -1 },
    { element: "enviroment_035", x: 11000, depth: -1 },
    { element: "enviroment_026", x: 11450, depth: 1 },

    // --- Zona 6: Meta Real (Suelo a 480 y 600) ---
    { element: "enviroment_021", x: 14050, depth: -2 },
    { element: "enviroment_022", x: 15100, depth: -1 },
    { element: "enviroment_038", x: 15400, depth: 1 },
    { element: "enviroment_021", x: 16100, depth: -2, scale: 1.1, flipX: true },
  ],

  // =========================================================================
  // 4. ZANAHORIAS Y TROFEOS DORADOS (Guiando parábolas de salto y túneles)
  // =========================================================================
  carrots: [
    // --- Zona 1: Inicio y Túnel Bajo 1 ---
    { x: 300, y: 550 },
    { x: 450, y: 550 },
    { x: 600, y: 550 },
    { x: 750, y: 550 },
    // Zanahorias dentro del Túnel 1 (a ras de suelo y=575)
    { x: 980, y: 575 },
    { x: 1040, y: 575 },
    { x: 1100, y: 575 },
    { x: 1250, y: 550 },
    { x: 1400, y: 550 },
    // Parábola del Gran Salto de Sprint 1 (sobre el foso de 380px)
    { x: 1680, y: 510 },
    { x: 1790, y: 440 },
    { x: 1900, y: 510 },

    // --- Zona 2: Meseta y Caverna de Roca ---
    { x: 2100, y: 550 },
    { x: 2300, y: 550 },
    { x: 2500, y: 500 },
    { x: 2700, y: 490 },
    // ¡Zanahoria Dorada 1 dentro del túnel largo de roca!
    { x: 2950, y: 515, isGold: true },
    { x: 3200, y: 490 },
    { x: 3400, y: 490 },
    // Salto sobre el foso de 350px hacia Zona 3
    { x: 3780, y: 470 },
    { x: 3880, y: 410 },
    { x: 3970, y: 470 },

    // --- Zona 3: Pilares de Ritmo y Cumbre Aérea ---
    { x: 4200, y: 470 },
    { x: 4470, y: 310 }, // Sobre isla de flor
    { x: 4870, y: 390 }, // Sobre pilar 1
    { x: 5270, y: 330 }, // Sobre pilar 2
    // ¡Zanahoria Dorada 2 en la mini isla celeste más alta!
    { x: 5400, y: 170, isGold: true },
    { x: 5720, y: 410 }, // Sobre pilar 3
    { x: 5920, y: 300 }, // Sobre isla intermedia
    { x: 6200, y: 550 },
    { x: 6450, y: 550 },
    { x: 6700, y: 550 },

    // --- Zona 4: Pista de Despegue (Sprint -> Slide -> Leap) ---
    { x: 7150, y: 550 },
    { x: 7350, y: 550 },
    { x: 7550, y: 550 },
    { x: 7750, y: 550 },
    // Zanahorias bajo la barrera de deslizamiento
    { x: 8150, y: 575 },
    { x: 8250, y: 575 },
    // Gran parábola del salto tras el dash sobre el abismo de 400px
    { x: 8680, y: 490 },
    { x: 8780, y: 420 },
    { x: 8880, y: 490 },

    // --- Zona 5: El Archipiélago Celeste y Caverna Subterránea ---
    { x: 9150, y: 510 },
    { x: 9350, y: 510 },
    { x: 9550, y: 380 },
    { x: 9850, y: 280 },
    // ¡Zanahoria Dorada 3 en la cima del archipiélago!
    { x: 10200, y: 180, isGold: true },
    { x: 10600, y: 300 },
    // Zanahorias dentro del túnel subterráneo bajo
    { x: 10450, y: 575 },
    { x: 10550, y: 575 },
    { x: 10650, y: 575 },
    { x: 10900, y: 550 },
    { x: 11200, y: 550 },
    { x: 11500, y: 500 },
    { x: 11800, y: 490 },
    { x: 12100, y: 490 },

    // --- Zona 6: Avenida Triunfal y Meta ---
    { x: 12700, y: 440 },
    { x: 12900, y: 440 },
    // ¡Zanahoria Dorada 4 sobre la isla del santuario!
    { x: 13600, y: 240, isGold: true },
    { x: 13900, y: 550 },
    { x: 14100, y: 550 },
    { x: 14300, y: 550 },
    { x: 14500, y: 550 },
    // Zanahoria bajo el arco triunfal
    { x: 14650, y: 575 },
    { x: 14750, y: 575 },
    { x: 15000, y: 550 },
    { x: 15300, y: 550 },
  ],

  // =========================================================================
  // 5. CAJAS ROMPIBLES (Vacío: sin referencias nulas)
  // =========================================================================
  boxes: [],

  // =========================================================================
  // 6. ELEMENTOS ESCÉNICOS Y DECORATIVOS (Props clásicos eliminados; se usa environmentElements)
  // =========================================================================
  props: [],

  // =========================================================================
  // 7. META FINAL DEL NIVEL (Santuario al final del mundo)
  // =========================================================================
  goal: { x: 15600, y: 610 },

  waterHazards: [],
  bridges: [],
  enemies: [], // Sin enemigos según la petición del usuario
};
