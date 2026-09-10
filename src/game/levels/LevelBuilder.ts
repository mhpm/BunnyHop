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
import { EnemyType, PropType } from "./levelData";

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

  constructor(private context: LevelBuilderContext) {}

  /**
   * Crea uno o varios bloques de suelo consecutivos en la posición indicada.
   *
   * @param x Posición X donde comienza el bloque (borde izquierdo).
   * @param y Altura del suelo (superficie donde pisa el personaje).
   * @param count Cantidad de bloques consecutivos (por defecto 1).
   * @returns Array con los sprites creados.
   */
  public createGroundSegment(
    x: number,
    y: number,
    count = 1,
  ): Phaser.Physics.Arcade.Sprite[] {
    const createdTiles: Phaser.Physics.Arcade.Sprite[] = [];
    const { platforms } = this.context;

    for (let i = 0; i < count; i++) {
      const tileX =
        x + i * LevelBuilder.TILE_WIDTH + LevelBuilder.TILE_WIDTH / 2;
      const tileY =
        y + LevelBuilder.TILE_HEIGHT / 2 + LevelBuilder.TILE_Y_OFFSET;

      const tile = platforms.create(
        tileX,
        tileY,
        "ground_tile",
      ) as Phaser.Physics.Arcade.Sprite;
      tile.setDepth(0);

      // Calibración de la hitbox física sin deformar el sprite visual
      const staticBody = tile.body as Phaser.Physics.Arcade.StaticBody;
      staticBody.width = LevelBuilder.HITBOX_WIDTH;
      staticBody.height = LevelBuilder.HITBOX_HEIGHT;
      staticBody.offset.set(LevelBuilder.HITBOX_OFFSET_X, LevelBuilder.HITBOX_OFFSET_Y);
      staticBody.position.x = tile.x - tile.displayOriginX + LevelBuilder.HITBOX_OFFSET_X;
      staticBody.position.y = tile.y - tile.displayOriginY + LevelBuilder.HITBOX_OFFSET_Y;

      createdTiles.push(tile);
    }

    return createdTiles;
  }

  /**
   * Crea una plataforma flotante tipo isla.
   *
   * @param x Posición X de la plataforma.
   * @param y Posición Y de la plataforma.
   * @returns El sprite de la plataforma con su colisión configurada.
   */
  public createPlatform(x: number, y: number): Phaser.Physics.Arcade.Sprite {
    const { platforms } = this.context;
    const platform = platforms.create(
      x + 92,
      y + 40,
      "rich_platform",
    ) as Phaser.Physics.Arcade.Sprite;

    const staticBody = platform.body as Phaser.Physics.Arcade.StaticBody;
    staticBody.width = 140;
    staticBody.height = 30;
    staticBody.offset.set(6, 45);
    staticBody.position.x = platform.x - platform.displayOriginX + 6;
    staticBody.position.y = platform.y - platform.displayOriginY + 45;
    platform.setDepth(0);

    return platform;
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
