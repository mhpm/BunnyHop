import Phaser from "phaser";
import { Carrot } from "../objects/Carrot";
import { BreakableBox } from "../objects/BreakableBox";
import { GoalShrine } from "../objects/GoalShrine";
import { Enemy } from "../entities/Enemy";
import { Ladybug } from "../entities/Ladybug";
import { Caterpillar } from "../entities/Caterpillar";
import { Snail } from "../entities/Snail";
import { Beetle } from "../entities/Beetle";
import { ParticleManager } from "../systems/ParticleManager";
import {
  EnemyType,
  PropType,
  GroundElementPlacement,
  EnvironmentElementPlacement,
  GroundSegmentConfig,
} from "./levelData";
import { GroundElementId, GROUND_ELEMENTS_MAP } from "../config/groundElements";
import { getEnvironmentElementMeta } from "../config/environmentElements";

export interface LevelBuilderContext {
  scene: Phaser.Scene;
  platforms: Phaser.Physics.Arcade.StaticGroup;
  boxes: Phaser.Physics.Arcade.StaticGroup;
  enemies: Enemy[];
  carrots: Carrot[];
  particles: ParticleManager;
}

/**
 * LevelBuilder — Implementación del patrón Builder / Factory para la construcción de niveles.
 *
 * Principios SOLID aplicados:
 * - Single Responsibility (SRP): Encapsula las dimensiones, hitboxes, offsets y capas de profundidad de cada entidad.
 * - Open/Closed (OCP): Permite agregar nuevos tipos de plataformas o props sin modificar las escenas.
 * - Dependency Inversion (DIP): Depende de interfaces y grupos de Phaser, no de lógica acoplada.
 */
export class LevelBuilder {
  public static readonly TILE_WIDTH = 245;
  public static readonly TILE_HEIGHT = 95;
  public static readonly TILE_Y_OFFSET = -10;
  public static readonly HITBOX_WIDTH = 225;
  public static readonly HITBOX_HEIGHT = 65;
  public static readonly HITBOX_OFFSET_X = 10;
  public static readonly HITBOX_OFFSET_Y = 20;

  private groundSegments: GroundSegmentConfig[] = [];

  constructor(private context: LevelBuilderContext) {}

  public setGroundSegments(segments: GroundSegmentConfig[]): void {
    this.groundSegments = segments;
  }

  /**
   * Obtiene la cota Y del suelo en la coordenada X dada.
   * Si no coincide exactamente con ningún segmento (p. ej. en un foso), devuelve 600 por defecto.
   */
  public getGroundYAt(x: number): number {
    for (const seg of this.groundSegments) {
      if (x >= seg.x && x <= seg.x + seg.width) {
        return seg.y;
      }
    }
    return 600;
  }

  /**
   * Crea uno o varios bloques de suelo consecutivos en la posición indicada.
   * Permite elegir cualquier elemento de suelo del catálogo (por defecto 'ground_104').
   */
  public createGroundSegment(
    x: number,
    y: number,
    count = 1,
    elementId: GroundElementId = "ground_104",
  ): Phaser.Physics.Arcade.Sprite[] {
    const createdTiles: Phaser.Physics.Arcade.Sprite[] = [];
    const { platforms } = this.context;
    const meta =
      GROUND_ELEMENTS_MAP[elementId] ?? GROUND_ELEMENTS_MAP["ground_104"];

    const tileW = meta.width;
    const tileH = meta.height;
    const hb = meta.hitbox;
    const overlap = 10;

    for (let i = 0; i < count; i++) {
      const tileX = x + i * (tileW - overlap) + tileW / 2;
      const tileY = y + tileH / 2 + LevelBuilder.TILE_Y_OFFSET;

      const tile = platforms.create(
        tileX,
        tileY,
        meta.id,
      ) as Phaser.Physics.Arcade.Sprite;
      tile.setDepth(0);

      // Calibración de la hitbox física sin deformar el sprite visual
      const staticBody = tile.body as Phaser.Physics.Arcade.StaticBody;
      staticBody.width = hb.width;
      staticBody.height = hb.height;
      staticBody.offset.set(hb.offsetX, hb.offsetY);
      staticBody.position.x = tile.x - tile.displayOriginX + hb.offsetX;
      staticBody.position.y = tile.y - tile.displayOriginY + hb.offsetY;

      createdTiles.push(tile);
    }

    return createdTiles;
  }

  /**
   * Crea una plataforma flotante tipo isla.
   * Permite elegir cualquier elemento de ground_elements (por defecto 'ground_044').
   */
  public createPlatform(
    x: number,
    y: number,
    elementId: GroundElementId = "ground_044",
    customWidth?: number,
    customHeight?: number,
  ): Phaser.Physics.Arcade.Sprite {
    const { platforms } = this.context;
    const meta =
      GROUND_ELEMENTS_MAP[elementId] ?? GROUND_ELEMENTS_MAP["ground_044"];

    const platform = platforms.create(
      x + meta.width / 2,
      y + meta.height / 2,
      meta.id,
    ) as Phaser.Physics.Arcade.Sprite;

    const hb = meta.hitbox;
    const bw = customWidth ?? hb.width;
    const bh = customHeight ?? hb.height;

    const staticBody = platform.body as Phaser.Physics.Arcade.StaticBody;
    staticBody.width = bw;
    staticBody.height = bh;
    staticBody.offset.set(hb.offsetX, hb.offsetY);
    staticBody.position.x = platform.x - platform.displayOriginX + hb.offsetX;
    staticBody.position.y = platform.y - platform.displayOriginY + hb.offsetY;
    platform.setDepth(0);

    return platform;
  }

  /**
   * Crea una pieza individual o modular libre del catálogo de ground_elements.
   * Permite combinar cualquier elemento con escala, volteo (flipX), profundidad y colisión sólida opcional.
   */
  public createGroundElement(
    config: GroundElementPlacement,
  ): Phaser.Physics.Arcade.Sprite | Phaser.GameObjects.Image {
    const { platforms, scene } = this.context;
    const meta = GROUND_ELEMENTS_MAP[config.element];
    if (!meta) {
      console.warn(`[LevelBuilder] Elemento no encontrado: ${config.element}`);
      return scene.add.image(config.x, config.y, "ground_104");
    }

    const scale = config.scale ?? 1;
    const depth = config.depth ?? 0;
    const isSolid = config.isSolid !== false;
    const posX = config.x + (meta.width * scale) / 2;
    const posY = config.y + (meta.height * scale) / 2;

    if (isSolid) {
      const sprite = platforms.create(
        posX,
        posY,
        meta.id,
      ) as Phaser.Physics.Arcade.Sprite;
      sprite.setScale(scale);
      sprite.setFlipX(!!config.flipX);
      sprite.setDepth(depth);

      const hb = meta.hitbox;
      const bw = (config.hitbox?.width ?? hb.width) * scale;
      const bh = (config.hitbox?.height ?? hb.height) * scale;
      const ox = (config.hitbox?.offsetX ?? hb.offsetX) * scale;
      const oy = (config.hitbox?.offsetY ?? hb.offsetY) * scale;

      const staticBody = sprite.body as Phaser.Physics.Arcade.StaticBody;
      staticBody.width = bw;
      staticBody.height = bh;
      staticBody.offset.set(ox, oy);
      staticBody.position.x = sprite.x - sprite.displayOriginX + ox;
      staticBody.position.y = sprite.y - sprite.displayOriginY + oy;

      return sprite;
    } else {
      const img = scene.add.image(posX, posY, meta.id);
      img.setScale(scale);
      img.setFlipX(!!config.flipX);
      img.setDepth(depth);
      return img;
    }
  }

  /**
   * Crea un elemento de entorno del catálogo de enviroment_elements.
   * Se posiciona siempre firmemente sobre el nivel del suelo (origin: 0.5, 1, no flotando).
   * Si config.y no se define, se calcula automáticamente según la altura del suelo en la coordenada X.
   */
  public createEnvironmentElement(
    config: EnvironmentElementPlacement,
  ): Phaser.Physics.Arcade.Sprite | Phaser.GameObjects.Image {
    const { platforms, scene } = this.context;
    const meta = getEnvironmentElementMeta(config.element);

    const scale = config.scale ?? 1;
    const depth = config.depth ?? meta.defaultDepth ?? 1;
    const isSolid = config.isSolid === true;

    // Determinamos la altura del suelo en la coordenada X para que descanse en tierra
    // Se añade un sutil +5px para que la base quede firmemente asentada en el césped sin flotar
    const groundY = config.y !== undefined ? config.y : (this.getGroundYAt(config.x) + 5);
    const targetY = groundY + (config.offsetY ?? 0);
    const posX = config.x;

    if (isSolid) {
      const sprite = platforms.create(
        posX,
        targetY,
        meta.id,
      ) as Phaser.Physics.Arcade.Sprite;
      sprite.setOrigin(0.5, 1);
      sprite.setScale(scale);
      sprite.setFlipX(!!config.flipX);
      sprite.setDepth(depth);
      if (config.alpha !== undefined) sprite.setAlpha(config.alpha);

      const bw = (config.hitbox?.width ?? meta.width) * scale;
      const bh = (config.hitbox?.height ?? meta.height) * scale;
      const ox = (config.hitbox?.offsetX ?? 0) * scale;
      const oy = (config.hitbox?.offsetY ?? 0) * scale;

      const staticBody = sprite.body as Phaser.Physics.Arcade.StaticBody;
      staticBody.width = bw;
      staticBody.height = bh;
      staticBody.offset.set(ox, oy);
      staticBody.position.x = sprite.x - sprite.displayOriginX + ox;
      staticBody.position.y = sprite.y - sprite.displayOriginY + oy;

      return sprite;
    } else {
      const img = scene.add.image(posX, targetY, meta.id);
      img.setOrigin(0.5, 1);
      img.setScale(scale);
      img.setFlipX(!!config.flipX);
      img.setDepth(depth);
      if (config.alpha !== undefined) img.setAlpha(config.alpha);
      return img;
    }
  }

  /**
   * Crea una fila de tablones de puente de madera.
   *
   * @param x Posición X inicial del puente.
   * @param y Posición Y del puente.
   * @param width Ancho total del puente.
   */
  public createBridge(
    x: number,
    y: number,
    width: number,
  ): Phaser.Physics.Arcade.Sprite[] {
    const { platforms } = this.context;
    const count = Math.ceil(width / 32);
    const planks: Phaser.Physics.Arcade.Sprite[] = [];

    for (let i = 0; i < count; i++) {
      const plank = platforms.create(
        x + i * 32 + 16,
        y + 6,
        "tile_bridge",
      ) as Phaser.Physics.Arcade.Sprite;
      plank.refreshBody();
      plank.setDepth(0);
      planks.push(plank);
    }

    return planks;
  }

  /**
   * Crea una zanahoria coleccionable con su animación de flotado y partículas.
   *
   * @param x Posición X de la zanahoria.
   * @param y Posición Y de la zanahoria.
   * @param isGold Si es una zanahoria dorada especial (vale más puntos).
   */
  public createCarrot(x: number, y: number, isGold = false): Carrot {
    const { scene, carrots, particles } = this.context;
    const carrot = new Carrot(scene, x, y, isGold, particles);
    carrots.push(carrot);
    return carrot;
  }

  /**
   * Crea una caja rompible de madera con efecto de partículas al destruirse.
   *
   * @param x Posición X de la caja.
   * @param y Posición Y de la caja.
   */
  public createBox(x: number, y: number): BreakableBox {
    const { scene, boxes, particles } = this.context;
    const box = new BreakableBox(scene, x, y, particles);
    boxes.add(box as unknown as Phaser.GameObjects.GameObject);
    return box;
  }

  /**
   * Crea un enemigo según su tipo ('ladybug' | 'caterpillar' | 'snail' | 'beetle').
   *
   * @param type Tipo de enemigo.
   * @param x Posición X inicial.
   * @param y Posición Y inicial.
   */
  public createEnemy(type: EnemyType, x: number, y: number): Enemy {
    const { scene, enemies, particles } = this.context;
    let enemy: Enemy;

    switch (type) {
      case "ladybug":
        enemy = new Ladybug(scene, x, y, particles);
        break;
      case "caterpillar":
        enemy = new Caterpillar(scene, x, y, particles);
        break;
      case "snail":
        enemy = new Snail(scene, x, y, particles);
        break;
      case "beetle":
      default:
        enemy = new Beetle(scene, x, y, particles);
        break;
    }

    enemies.push(enemy);
    return enemy;
  }

  /**
   * Crea un elemento decorativo del escenario (árboles, flores, graneros, molinos, vallas).
   *
   * @param type Tipo de elemento decorativo.
   * @param x Posición X.
   * @param y Posición Y (alineado en la base con origin 0.5, 1).
   * @param customScale Escala opcional.
   */
  public createProp(
    type: PropType,
    x: number,
    y: number,
    customScale?: number,
  ): Phaser.GameObjects.Image {
    const { scene } = this.context;
    let textureKey = "rich_bush";
    let depth = 1;
    let scale = customScale ?? 1;

    switch (type) {
      case "tree":
        textureKey = "rich_tree";
        depth = -4;
        scale = customScale ?? 0.85;
        break;
      case "tree_alt":
        textureKey = "rich_tree_alt";
        depth = -4;
        scale = customScale ?? 0.85;
        break;
      case "barn":
        textureKey = "rich_barn";
        depth = -5;
        scale = customScale ?? 0.95;
        break;
      case "windmill":
        textureKey = "rich_windmill";
        depth = -5;
        scale = customScale ?? 0.95;
        break;
      case "sign":
        textureKey = "rich_sign";
        depth = 2;
        scale = customScale ?? 0.8;
        break;
      case "fence":
        textureKey = "rich_fence";
        depth = 1;
        scale = customScale ?? 0.85;
        break;
      case "fence_white":
        textureKey = "rich_fence_white";
        depth = 1;
        scale = customScale ?? 0.95;
        break;
      case "lantern":
        textureKey = "rich_lantern";
        depth = 2;
        scale = customScale ?? 0.85;
        break;
      case "bush":
        textureKey = "rich_bush";
        depth = 2;
        scale = customScale ?? 0.9;
        break;
      case "bush_large":
        textureKey = "rich_bush_large";
        depth = 2;
        scale = customScale ?? 0.85;
        break;
      case "rock":
        textureKey = "rich_rock";
        depth = 1;
        scale = customScale ?? 0.85;
        break;
      case "haystack":
        textureKey = "rich_haystack";
        depth = 1;
        scale = customScale ?? 0.85;
        break;
      case "haycart":
        textureKey = "rich_haycart";
        depth = 1;
        scale = customScale ?? 0.85;
        break;
      case "barrel":
        textureKey = "rich_barrel";
        depth = 1;
        scale = customScale ?? 0.8;
        break;
      case "carrot_sack":
        textureKey = "rich_carrot_sack";
        depth = 1;
        scale = customScale ?? 0.85;
        break;
      case "sunflower":
        textureKey = "rich_sunflower";
        depth = 1;
        scale = customScale ?? 0.85;
        break;
      case "corn":
        textureKey = "rich_corn";
        depth = 1;
        scale = customScale ?? 0.85;
        break;
      case "tomato":
        textureKey = "rich_tomato";
        depth = 1;
        scale = customScale ?? 0.85;
        break;
      case "pumpkin":
        textureKey = "rich_pumpkin";
        depth = 1;
        scale = customScale ?? 0.8;
        break;
      case "strawberry":
        textureKey = "rich_strawberry";
        depth = 1;
        scale = customScale ?? 0.8;
        break;
      case "cow":
        textureKey = "rich_cow";
        depth = 1;
        scale = customScale ?? 0.8;
        break;
      case "hen":
        textureKey = "rich_hen";
        depth = 2;
        scale = customScale ?? 0.75;
        break;
      case "chick":
        textureKey = "rich_chick";
        depth = 2;
        scale = customScale ?? 0.75;
        break;
    }

    return scene.add
      .image(x, y, textureKey)
      .setOrigin(0.5, 1)
      .setScale(scale)
      .setDepth(depth);
  }

  /**
   * Crea un charco de agua animado.
   *
   * @param x Posición X.
   * @param y Posición Y.
   * @param width Ancho del charco.
   */
  public createWaterHazard(
    x: number,
    y: number,
    width: number,
  ): Phaser.GameObjects.Image {
    const { scene } = this.context;
    const pond = scene.add.image(x + width / 2, y - 12, "rich_water_pond");
    pond.setOrigin(0.5, 0.5);
    pond.setDepth(0);

    scene.tweens.add({
      targets: pond,
      scaleY: 0.97,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return pond;
  }

  /**
   * Crea el santuario / altar de meta del nivel.
   *
   * @param x Posición X.
   * @param y Posición Y.
   */
  public createGoal(x: number, y: number): GoalShrine {
    const { scene, particles } = this.context;
    return new GoalShrine(scene, x, y, particles);
  }
}
