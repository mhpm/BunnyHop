import Phaser from "phaser";

export interface ShapePoint {
  x: number;
  y: number;
}

export interface ShapeBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  originX: number;
  originY: number;
  /**
   * Calcula el offset.x adecuado cuando el sprite está reflejado horizontalmente (flipX = true).
   */
  getFlippedOffsetX: (frameWidth: number) => number;
}

export interface ShapeBoundsOptions {
  /** Ancho del frame del spritesheet en píxeles (ej. 218) */
  frameWidth?: number;
  /** Alto del frame del spritesheet en píxeles (ej. 125) */
  frameHeight?: number;
  /**
   * Distancia en píxeles desde el centro del sprite hasta el suelo en la postura estándar de pie.
   * En BunnyHop, las texturas de pie tienen ~175px de alto y origin 0.5 (centro en 87.5px).
   * Por defecto: 87.5
   */
  groundBaseline?: number;
  /** Altura personalizada (útil para agacharse/dash dejando fuera las orejas sin que flote) */
  customHeight?: number;
  /** Ancho personalizado para la caja de colisión */
  customWidth?: number;
  /** Valores de respaldo si no se encuentra el JSON o no contiene vértices válidos */
  fallback?: { minX: number; maxX: number; minY: number; maxY: number };
}

/**
 * Extrae todos los puntos {x, y} de una definición exportada por PhysicsEditor,
 * soportando automáticamente:
 * - Formato Phaser P2: { [key]: [ { "shape": [x1, y1, x2, y2, ...] } ] }
 * - Formato Matter.js: { [key]: { "fixtures": [ { "vertices": [ [ { x, y } ] ] } ] } }
 * - Formato directo de puntos: { [key]: [ { x, y } ] }
 */
export function extractShapePoints(
  shapeData: any,
  shapeKey: string
): ShapePoint[] {
  const points: ShapePoint[] = [];
  if (!shapeData) return points;

  // Si el JSON contiene el objeto raíz o la clave específica
  const target = shapeData[shapeKey] ?? shapeData;

  // 1. Formato Phaser P2 (Array de fixtures con propiedad "shape" como array plano [x, y, x, y, ...])
  if (Array.isArray(target)) {
    for (const item of target) {
      if (item && Array.isArray(item.shape)) {
        for (let i = 0; i < item.shape.length; i += 2) {
          points.push({
            x: Number(item.shape[i]),
            y: Number(item.shape[i + 1]),
          });
        }
      } else if (item && typeof item.x === "number" && typeof item.y === "number") {
        points.push({ x: item.x, y: item.y });
      }
    }
  }

  // 2. Formato Matter.js (Objeto con "fixtures" -> "vertices" -> polígonos -> {x, y})
  const fixtures = target?.fixtures ?? shapeData?.fixtures;
  if (Array.isArray(fixtures)) {
    for (const fixture of fixtures) {
      if (Array.isArray(fixture.vertices)) {
        for (const poly of fixture.vertices) {
          if (Array.isArray(poly)) {
            for (const pt of poly) {
              if (pt && typeof pt.x === "number" && typeof pt.y === "number") {
                points.push({ x: Number(pt.x), y: Number(pt.y) });
              }
            }
          }
        }
      }
    }
  }

  return points;
}

/**
 * Analiza un JSON de PhysicsEditor y calcula las dimensiones y coordenadas óptimas para Phaser Arcade Physics.
 *
 * @param source Puede ser una escena de Phaser (para leer de `scene.cache.json`) o directamente un objeto JSON.
 * @param cacheKeyOrData Clave de la caché de Phaser (ej. "bunny_dash_shape") o el objeto JSON directo.
 * @param shapeKey Nombre de la forma dentro del JSON (ej. "bunny_dash").
 * @param options Opciones de ancho, alto y alineación con el suelo.
 */
export function getPhysicsShapeBounds(
  source: Phaser.Scene | any,
  cacheKeyOrData: string | any,
  shapeKey: string,
  options: ShapeBoundsOptions = {}
): ShapeBounds {
  let shapeData: any = null;

  if (typeof cacheKeyOrData === "string") {
    // Es una clave de la caché de Phaser
    if (source && "cache" in source && source.cache?.json) {
      shapeData = source.cache.json.get(cacheKeyOrData);
    }
  } else {
    // Es el objeto directo
    shapeData = cacheKeyOrData;
  }

  const points = extractShapePoints(shapeData, shapeKey);

  let minX: number;
  let maxX: number;
  let minY: number;
  let maxY: number;

  if (points.length > 0) {
    minX = points[0].x;
    maxX = points[0].x;
    minY = points[0].y;
    maxY = points[0].y;

    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  } else if (options.fallback) {
    minX = options.fallback.minX;
    maxX = options.fallback.maxX;
    minY = options.fallback.minY;
    maxY = options.fallback.maxY;
  } else {
    // Valores estándar por defecto
    minX = 0;
    maxX = options.frameWidth ?? 100;
    minY = 0;
    maxY = options.frameHeight ?? 100;
  }

  const width = options.customWidth ?? Math.max(1, maxX - minX);
  const height = options.customHeight ?? Math.max(1, maxY - minY);
  // Si se especifica una altura personalizada (ej. más baja para agacharse),
  // situamos la parte superior de forma que la base inferior coincida exactamente con maxY (el suelo)
  const offsetY = options.customHeight !== undefined ? maxY - height : minY;
  const offsetX = minX;

  const frameHeight = options.frameHeight ?? maxY;
  const groundBaseline = options.groundBaseline ?? 87.5;

  // Anclaje visual (originY): la base del polígono (maxY) debe coincidir con groundBaseline (87.5px)
  const displayOriginY = maxY - groundBaseline;
  const originY = frameHeight > 0 ? displayOriginY / frameHeight : 0.5;

  return {
    minX,
    maxX,
    minY,
    maxY,
    width,
    height,
    offsetX,
    offsetY,
    originX: 0.5,
    originY,
    getFlippedOffsetX: (frameWidth: number) => {
      return Math.max(0, frameWidth - maxX);
    },
  };
}

/**
 * Función utilitaria para aplicar instantáneamente la caja de colisión y el anclaje a un Arcade Sprite.
 *
 * @param sprite El sprite al que aplicar el hitbox.
 * @param bounds Los límites calculados con getPhysicsShapeBounds.
 * @param frameWidth Ancho del frame (para calcular el reflejo si flipX está activo).
 * @param updateOrigin Si es true, ajusta también el setOrigin del sprite para que no flote.
 */
export function applyArcadeHitbox(
  sprite: Phaser.Physics.Arcade.Sprite,
  bounds: ShapeBounds,
  frameWidth = 218,
  updateOrigin = true
): void {
  if (updateOrigin) {
    sprite.setOrigin(bounds.originX, bounds.originY);
  }

  sprite.setSize(bounds.width, bounds.height);
  const offsetX = sprite.flipX ? bounds.getFlippedOffsetX(frameWidth) : bounds.offsetX;
  sprite.setOffset(offsetX, bounds.offsetY);
}
