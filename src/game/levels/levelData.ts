import { GroundElementId, GROUND_PRESETS } from "../config/groundElements";

export { GROUND_PRESETS };
export type { GroundElementId };

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
  width: 20800,
  height: 720,
  spawn: { x: 110, y: 520 },

  // =========================================================================
  // 1. SEGMENTOS DE SUELO CONTINUO (Tramos de tierra firme con variantes)
  // =========================================================================
  groundSegments: [
    // --- SECCIÓN 1: La Pradera de los Primeros Pasos (0 a 3400) ---
    { x: 0, y: 600, width: 950, element: "ground_104" }, // Suelo 1: Aprendizaje y arranque (4 bloques)
    { x: 1110, y: 600, width: 715, element: "ground_100" }, // Suelo 2: Tras el 1er agujero de 160px (3 bloques)
    { x: 2120, y: 480, width: 715, element: "ground_101" }, // Suelo 3: Meseta suave elevada (3 bloques)
    { x: 3180, y: 600, width: 715, element: "ground_104" }, // Suelo 4: Retorno a cota baja (3 bloques)

    // --- SECCIÓN 2: Las Colinas Escalonadas y Doble Ruta (3895 a 7200) ---
    { x: 4440, y: 460, width: 950, element: "ground_099" }, // Suelo 5: Meseta florida elevada (4 bloques)
    { x: 5510, y: 520, width: 245, element: "ground_102" }, // Pilar Escalonado 1 (1 bloque)
    { x: 5880, y: 460, width: 245, element: "ground_103" }, // Pilar Escalonado 2 (1 bloque)
    { x: 6470, y: 580, width: 715, element: "ground_104" }, // Suelo 6: Llanura tras descenso aéreo (3 bloques)

    // --- SECCIÓN 3: El Gran Desfiladero y Oasis Central (7185 a 10800) ---
    { x: 9020, y: 600, width: 1185, element: "ground_100" }, // Suelo 7: Oasis central de velocidad (5 bloques)
    { x: 10470, y: 550, width: 480, element: "ground_102" }, // Suelo 8: Entrada al valle de pilares (2 bloques)

    // --- SECCIÓN 4: El Valle de los Pilares de Ritmo (10940 a 14300) ---
    { x: 11090, y: 530, width: 245, element: "ground_103" }, // Pilar Ritmo A (1 bloque)
    { x: 11470, y: 470, width: 245, element: "ground_102" }, // Pilar Ritmo B (1 bloque)
    { x: 11850, y: 410, width: 245, element: "ground_104" }, // Pilar Ritmo C (1 bloque)
    { x: 12470, y: 430, width: 245, element: "ground_103" }, // Pilar Ritmo D (1 bloque)
    { x: 12840, y: 500, width: 245, element: "ground_102" }, // Pilar Ritmo E (1 bloque)
    { x: 13210, y: 570, width: 245, element: "ground_104" }, // Pilar Ritmo F (1 bloque)
    { x: 13580, y: 580, width: 715, element: "ground_099" }, // Suelo 9: Meseta intermedia (3 bloques)

    // --- SECCIÓN 5: Las Islas del Viento y Valle Bajo (14295 a 17600) ---
    { x: 16030, y: 590, width: 950, element: "ground_100" }, // Suelo 10: Gran aterrizaje acrobático (4 bloques)
    { x: 17140, y: 590, width: 715, element: "ground_101" }, // Suelo 11: Llanura previa a la subida final (3 bloques)

    // --- SECCIÓN 6: La Gran Avenida Triunfal y Meta (17855 a 20800) ---
    { x: 18460, y: 420, width: 950, element: "ground_099" }, // Suelo 12: Terraza real elevada (4 bloques)
    { x: 19780, y: 600, width: 950, element: "ground_104" }, // Suelo 13: Pradera del Santuario Final (4 bloques)
  ],

  // =========================================================================
  // 2. PLATAFORMAS FLOTANTES (Islas combinando los distintos tipos del folder)
  // =========================================================================
  floatingPlatforms: [
    // --- Sección 1: Aprendizaje e isla secreta ---
    { x: 1890, y: 510, element: "ground_044", isFloating: true }, // Isla con flor conectora (153px)
    { x: 2360, y: 340, element: "ground_040", isFloating: true }, // Isla secreta alta (210px, oro)
    { x: 2920, y: 520, element: "ground_043", isFloating: true }, // Isla mediana de descenso (183px)

    // --- Sección 2: Doble ruta y despegue ---
    { x: 3980, y: 540, element: "ground_046", isFloating: true }, // Ruta baja: Isla compacta (131px)
    { x: 4160, y: 440, element: "ground_047", isFloating: true }, // Ruta alta: Gran isla ancha (212px, oro)
    { x: 6200, y: 380, element: "ground_045", isFloating: true }, // Isla grande de paso alto (187px)

    // --- Sección 3: El Archipiélago Celeste sobre el Gran Abismo (7 islas) ---
    { x: 7280, y: 510, element: "ground_044", isFloating: true }, // Isla Celeste 1 (153px)
    { x: 7510, y: 440, element: "ground_043", isFloating: true }, // Isla Celeste 2 (183px)
    { x: 7770, y: 370, element: "ground_047", isFloating: true }, // Isla Celeste 3 (212px)
    { x: 8060, y: 290, element: "ground_045", isFloating: true }, // Isla Cima del Mundo (187px, oro)
    { x: 8320, y: 380, element: "ground_040", isFloating: true }, // Isla Descenso A (210px)
    { x: 8610, y: 450, element: "ground_046", isFloating: true }, // Isla Descenso B (131px)
    { x: 8820, y: 500, element: "ground_039", isFloating: true }, // Isla Descenso C redondeada (130px)
    { x: 10280, y: 510, element: "ground_042", isFloating: true }, // Isla puente a pilares (118px)

    // --- Sección 4: Vértice aéreo sobre los pilares ---
    { x: 12180, y: 320, element: "ground_040", isFloating: true }, // Cumbre de los pilares (210px, oro)

    // --- Sección 5: Las Islas del Viento (Cadena acrobática de 7 islas) ---
    { x: 14380, y: 500, element: "ground_044", isFloating: true }, // Isla Viento 1 (153px)
    { x: 14610, y: 440, element: "ground_041", isFloating: true }, // Isla Viento 2 mini (95px)
    { x: 14780, y: 380, element: "ground_042", isFloating: true }, // Isla Viento 3 compacta (118px)
    { x: 14980, y: 350, element: "ground_047", isFloating: true }, // Isla Viento 4 ancha (212px)
    { x: 15280, y: 280, element: "ground_046", isFloating: true }, // Isla Viento 5 la aguja (131px, oro)
    { x: 15500, y: 380, element: "ground_045", isFloating: true }, // Isla Viento 6 grande (187px)
    { x: 15770, y: 470, element: "ground_043", isFloating: true }, // Isla Viento 7 lanzadera (183px)

    // --- Sección 6: Subida real y meta ---
    { x: 17940, y: 510, element: "ground_044", isFloating: true }, // Escalón real 1 (153px)
    { x: 18180, y: 440, element: "ground_040", isFloating: true }, // Escalón real 2 (210px)
    { x: 18830, y: 270, element: "ground_045", isFloating: true }, // Trono celeste sobre terraza (187px, oro)
    { x: 19500, y: 500, element: "ground_047", isFloating: true }, // Gran rampa flotante final (212px)
  ],

  // =========================================================================
  // 3. PIEZAS MODULARES LIBRES (Columnas subterráneas y acantilados)
  // =========================================================================
  groundElements: [
    // Sección 1: Abismos iniciales
    { element: "ground_000", x: 880, y: 680, isSolid: false, depth: -5 },
    { element: "ground_004", x: 1110, y: 680, isSolid: false, depth: -5 },

    // Sección 2: Acantilados de la meseta florida
    { element: "ground_006", x: 4440, y: 550, isSolid: false, depth: -5 },
    { element: "ground_021", x: 5320, y: 550, isSolid: false, depth: -5 },

    // Sección 3: Cimientos bajo los bordes del Gran Desfiladero
    { element: "ground_000", x: 7100, y: 670, isSolid: false, depth: -5 },
    { element: "ground_004", x: 9020, y: 680, isSolid: false, depth: -5 },

    // Sección 4: Cimientos de piedra bajo los pilares de ritmo
    { element: "ground_027", x: 11110, y: 620, isSolid: false, depth: -5 },
    { element: "ground_028", x: 11490, y: 560, isSolid: false, depth: -5 },
    { element: "ground_030", x: 11870, y: 500, isSolid: false, depth: -5 },
    { element: "ground_029", x: 12490, y: 520, isSolid: false, depth: -5 },

    // Sección 5: Paredes del valle bajo las Islas del Viento
    { element: "ground_006", x: 14200, y: 670, isSolid: false, depth: -5 },
    { element: "ground_021", x: 16030, y: 670, isSolid: false, depth: -5 },

    // Sección 6: Terraza real
    { element: "ground_024", x: 18460, y: 510, isSolid: false, depth: -5 },
    { element: "ground_025", x: 19340, y: 510, isSolid: false, depth: -5 },
  ],

  // =========================================================================
  // 4. ZANAHORIAS Y TROFEOS DORADOS (Guiando parábolas de salto en las 6 zonas)
  // =========================================================================
  carrots: [
    // --- Sección 1: Pradera de inicio ---
    { x: 260, y: 550 },
    { x: 380, y: 550 },
    { x: 520, y: 550 },
    { x: 680, y: 550 },
    { x: 820, y: 550 },
    // Arco sobre el 1er agujero
    { x: 990, y: 520 },
    { x: 1030, y: 470 },
    { x: 1070, y: 520 },
    // Suelo 2
    { x: 1200, y: 550 },
    { x: 1360, y: 550 },
    { x: 1520, y: 550 },
    // Subida y meseta suave
    { x: 1960, y: 460 },
    { x: 2240, y: 430 },
    { x: 2460, y: 270, isGold: true }, // [ORO 1] Isla secreta alta
    { x: 2580, y: 430 },
    { x: 2720, y: 430 },
    { x: 3010, y: 470 },
    { x: 3280, y: 550 },
    { x: 3500, y: 550 },
    { x: 3720, y: 550 },

    // --- Sección 2: Colinas escalonadas y doble ruta ---
    { x: 4040, y: 490 },
    { x: 4260, y: 370, isGold: true }, // [ORO 2] Ruta alta de riesgo
    { x: 4560, y: 410 },
    { x: 4760, y: 410 },
    { x: 4960, y: 410 },
    { x: 5160, y: 410 },
    { x: 5360, y: 410 },
    // Pilares
    { x: 5630, y: 470 },
    { x: 5790, y: 440 },
    { x: 6000, y: 410 },
    { x: 6290, y: 320 },
    { x: 6410, y: 450 },
    { x: 6600, y: 530 },
    { x: 6800, y: 530 },
    { x: 7000, y: 530 },

    // --- Sección 3: El Gran Archipiélago Celeste ---
    { x: 7350, y: 460 },
    { x: 7600, y: 390 },
    { x: 7870, y: 320 },
    { x: 8150, y: 210, isGold: true }, // [ORO 3] Cumbre del archipiélago
    { x: 8420, y: 330 },
    { x: 8670, y: 400 },
    { x: 8880, y: 450 },
    // Oasis central (recta de velocidad)
    { x: 9140, y: 550 },
    { x: 9340, y: 550 },
    { x: 9540, y: 550 },
    { x: 9740, y: 550 },
    { x: 9940, y: 550 },
    { x: 10140, y: 550 },
    { x: 10340, y: 460 },
    { x: 10600, y: 500 },
    { x: 10800, y: 500 },

    // --- Sección 4: El Valle de los Pilares de Ritmo ---
    { x: 11210, y: 480 },
    { x: 11380, y: 450 },
    { x: 11590, y: 420 },
    { x: 11760, y: 390 },
    { x: 11970, y: 360 },
    { x: 12280, y: 240, isGold: true }, // [ORO 4] Cumbre de los pilares
    { x: 12590, y: 380 },
    { x: 12960, y: 450 },
    { x: 13330, y: 520 },
    { x: 13700, y: 530 },
    { x: 13900, y: 530 },
    { x: 14100, y: 530 },

    // --- Sección 5: Las Islas del Viento ---
    { x: 14450, y: 450 },
    { x: 14650, y: 390 },
    { x: 14840, y: 330 },
    { x: 15040, y: 300 },
    { x: 15120, y: 300 },
    { x: 15340, y: 200, isGold: true }, // [ORO 5] La Aguja Celeste
    { x: 15590, y: 330 },
    { x: 15860, y: 420 },
    // Aterrizaje y foso final
    { x: 16150, y: 540 },
    { x: 16400, y: 540 },
    { x: 16650, y: 540 },
    { x: 16900, y: 540 },
    { x: 17060, y: 460 }, // Arco sobre foso
    { x: 17300, y: 540 },
    { x: 17550, y: 540 },
    { x: 17750, y: 540 },

    // --- Sección 6: La Gran Avenida Triunfal y Meta ---
    { x: 18010, y: 460 },
    { x: 18280, y: 390 },
    { x: 18580, y: 370 },
    { x: 18780, y: 370 },
    { x: 18920, y: 190, isGold: true }, // [ORO 6] Trono celeste real
    { x: 19080, y: 370 },
    { x: 19300, y: 370 },
    { x: 19600, y: 450 },
    // Gran recta final
    { x: 19880, y: 550 },
    { x: 20020, y: 550 },
    { x: 20160, y: 550 },
    { x: 20300, y: 530 },
  ],

  // =========================================================================
  // 5. META FINAL DEL NIVEL (Santuario al final de los 20,800 px)
  // =========================================================================
  goal: { x: 20450, y: 610 },

  waterHazards: [],
  bridges: [],
  props: [],
  enemies: [],
  boxes: [],
};
