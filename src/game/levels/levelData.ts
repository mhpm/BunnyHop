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
  element?: GroundElementId;
  scale?: number;
}

export interface GroundSegmentConfig {
  x: number;
  y: number;
  width: number;
  height?: number;
  element?: GroundElementId;
}

export interface GroundElementPlacement {
  element: GroundElementId;
  x: number;
  y: number;
  isSolid?: boolean;
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
  element: EnvironmentElementId;
  x: number;
  y?: number;
  offsetY?: number;
  isSolid?: boolean;
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
  groundElements?: GroundElementPlacement[];
  environmentElements?: EnvironmentElementPlacement[];
  waterHazards: { x: number; y: number; width: number; height: number }[];
  bridges: { x: number; y: number; width: number }[];
  props: PropConfig[];
  enemies: EnemyConfig[];
  carrots: CollectibleConfig[];
  boxes: BoxConfig[];
}

/**
 * Sendero de las Raíces Doradas
 *
 * El camino principal se diseñó con las capacidades reales del conejo:
 * - salto: 510 px/s con gravedad de 920 px/s² (altura máxima aproximada: 141 px);
 * - avance: 230 px/s (alcance de salto aproximado: 255 px);
 * - carrera: 414 px/s (alcance aproximado: 459 px);
 * - deslizamiento, control en el aire y rebote al pisar enemigos.
 *
 * Los saltos normales del camino principal dejan entre 165 y 190 px de hueco.
 * Solo el barranco de la carrera mide 310 px y cuenta con una pista de 760 px
 * para activar el sprint antes de despegar. Las rutas altas son opcionales.
 */
export const LEVEL_1_CONFIG: LevelConfig = {
  id: "level_1_1",
  name: "Sendero de las Raíces Doradas",
  worldName: "Mundo 1 — Bosque del Viento",
  width: 10500,
  height: 720,
  spawn: { x: 140, y: 500 },

  // El ancho de cada tramo coincide con su cobertura visual real, incluido el
  // solapamiento de 10 px entre módulos que aplica LevelBuilder.
  groundSegments: [
    // 1. Pradera inicial: espacio para aprender movimiento y salto variable.
    { x: 0, y: 600, width: 1420, element: "ground_104" },

    // 2. Arroyo de piedra: tres saltos normales con cambios de altura suaves.
    { x: 1590, y: 600, width: 950, element: "ground_104" },
    { x: 2730, y: 520, width: 245, element: "ground_104" },
    { x: 3160, y: 570, width: 480, element: "ground_104" },

    // 3. Arboleda: ruta baja con enemigos y ruta aérea opcional.
    { x: 4140, y: 600, width: 1185, element: "ground_104" },

    // 4. Pista de raíces: aceleración y barranco de 310 px.
    { x: 5490, y: 600, width: 1420, element: "ground_104" },

    // 5. Jardín de los escarabajos: combate o evasión por las copas.
    { x: 7220, y: 600, width: 950, element: "ground_104" },

    // 6. Ascenso final y santuario.
    { x: 8340, y: 540, width: 715, element: "ground_104" },
    { x: 9220, y: 600, width: 1185, element: "ground_104" },
  ],

  floatingPlatforms: [
    // Un primer islote seguro permite practicar salto sin riesgo de caída.
    { x: 650, y: 474, element: "ground_043", isFloating: true },

    // Ruta de las copas: escalones de 100, 80 y 80 px de desnivel.
    { x: 4300, y: 481, element: "ground_045", isFloating: true },
    { x: 4570, y: 394, element: "ground_043", isFloating: true },
    { x: 4850, y: 481, element: "ground_045", isFloating: true },

    // Segunda ruta alta, útil para esquivar enemigos o buscar la dorada.
    { x: 7470, y: 471, element: "ground_045", isFloating: true },
    { x: 7740, y: 384, element: "ground_043", isFloating: true },
    { x: 8020, y: 471, element: "ground_045", isFloating: true },
  ],

  // No hay piezas sueltas sin apoyo: todo el relieve jugable pertenece a un
  // tramo de suelo o a una plataforma reconocible.
  groundElements: [],

  // Todos estos elementos omiten Y. LevelBuilder calcula la altura del tramo
  // que hay bajo su centro y los dibuja con origin (0.5, 1), apoyados al suelo.
  environmentElements: [
    // Pradera inicial.
    { element: "enviroment_021", x: 210, scale: 0.85, depth: -3 },
    { element: "enviroment_026", x: 480, scale: 0.85, depth: 1 },
    { element: "enviroment_012", x: 1030, scale: 0.72, depth: -1 },
    { element: "enviroment_024", x: 1280, scale: 0.8, depth: -3 },

    // Orillas y puente roto.
    { element: "enviroment_020", x: 1690, scale: 0.9, depth: 1 },
    { element: "enviroment_023", x: 2050, scale: 0.72, depth: -3 },
    { element: "enviroment_041", x: 2400, scale: 0.8, depth: -1 },
    { element: "enviroment_025", x: 2850, scale: 0.8, depth: 1 },
    { element: "enviroment_034", x: 3280, scale: 0.82, depth: 2 },
    { element: "enviroment_018", x: 3510, scale: 0.65, depth: -1 },

    // Arboleda y ruta de las copas.
    { element: "enviroment_021", x: 4250, scale: 0.72, depth: -3 },
    { element: "enviroment_037", x: 4770, scale: 0.72, depth: -1 },
    { element: "enviroment_056", x: 5160, scale: 0.82, depth: 1 },

    // Pista de raíces y preparación del salto largo.
    { element: "enviroment_012", x: 5600, scale: 0.7, depth: -1 },
    { element: "enviroment_059", x: 6250, scale: 0.72, depth: -1 },
    { element: "enviroment_022", x: 6620, scale: 0.78, depth: -3 },

    // Jardín de los escarabajos.
    { element: "enviroment_023", x: 7330, scale: 0.68, depth: -3 },
    { element: "enviroment_026", x: 7720, scale: 0.72, depth: -1 },
    { element: "enviroment_038", x: 8060, scale: 0.5, depth: -1 },

    // Ascenso y santuario final.
    { element: "enviroment_024", x: 8480, scale: 0.75, depth: -3 },
    { element: "enviroment_036", x: 8820, scale: 0.78, flipX: true, depth: 2 },
    { element: "enviroment_021", x: 9380, scale: 0.78, depth: -3 },
    { element: "enviroment_040", x: 9700, scale: 0.5, depth: -1 },
    { element: "enviroment_026", x: 9920, scale: 0.78, depth: 1 },
    { element: "enviroment_023", x: 10300, scale: 0.78, flipX: true, depth: -3 },
  ],

  // La cadena de zanahorias marca la ruta segura y dibuja el arco de cada salto.
  carrots: [
    // 1. Pradera y práctica de salto.
    { x: 320, y: 545 },
    { x: 500, y: 545 },
    { x: 665, y: 500 },
    { x: 740, y: 430, isGold: true },
    { x: 815, y: 500 },
    { x: 1080, y: 545 },
    { x: 1320, y: 545 },
    { x: 1460, y: 520 },
    { x: 1510, y: 460 },
    { x: 1570, y: 520 },

    // 2. Arroyo de piedra y puente roto.
    { x: 1780, y: 545 },
    { x: 2210, y: 545 },
    { x: 2580, y: 500 },
    { x: 2650, y: 430 },
    { x: 2720, y: 465 },
    { x: 2850, y: 455 },
    { x: 3020, y: 455 },
    { x: 3100, y: 415 },
    { x: 3170, y: 500 },
    { x: 3390, y: 515 },
    { x: 3690, y: 520 },
    { x: 3850, y: 520 },
    { x: 4010, y: 520 },

    // 3. Dos caminos por la arboleda.
    { x: 4240, y: 545 },
    { x: 4390, y: 445 },
    { x: 4660, y: 350, isGold: true },
    { x: 4940, y: 445 },
    { x: 5200, y: 545 },
    { x: 5360, y: 520 },
    { x: 5430, y: 465 },
    { x: 5500, y: 520 },

    // 4. Pista y salto de carrera.
    { x: 5620, y: 545 },
    { x: 5860, y: 545 },
    { x: 6060, y: 545 },
    { x: 6280, y: 545 },
    { x: 6510, y: 545 },
    { x: 6740, y: 545 },
    { x: 6970, y: 500 },
    { x: 7065, y: 420 },
    { x: 7160, y: 500 },

    // 5. Jardín de enemigos y ruta alta.
    { x: 7300, y: 545 },
    { x: 7560, y: 435 },
    { x: 7830, y: 340, isGold: true },
    { x: 8110, y: 435 },
    { x: 8210, y: 500 },
    { x: 8280, y: 440 },
    { x: 8350, y: 480 },

    // 6. Último ascenso y avenida del santuario.
    { x: 8520, y: 485 },
    { x: 8800, y: 485 },
    { x: 8990, y: 465 },
    { x: 9135, y: 455 },
    { x: 9270, y: 525 },
    { x: 9500, y: 545 },
    { x: 9750, y: 545 },
  ],

  // El puente cubre el vacío entre el arroyo y la arboleda.
  bridges: [{ x: 3640, y: 570, width: 500 }],

  // La ruta alta permite esquivarlos; pisarlos activa el rebote del conejo.
  enemies: [
    { type: "snail", x: 4480, y: 540 },
    { type: "ladybug", x: 5140, y: 540 },
    { type: "caterpillar", x: 7460, y: 540 },
    { type: "beetle", x: 8050, y: 540 },
  ],

  boxes: [],
  props: [],
  waterHazards: [],
  goal: { x: 10150, y: 600 },
};
