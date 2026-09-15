import { describe, expect, it } from "vitest";
import { ENVIRONMENT_ELEMENTS_MAP } from "../config/environmentElements";
import { GROUND_ELEMENTS_MAP } from "../config/groundElements";
import { LEVEL_1_CONFIG } from "../levels/levelData";

const WALK_JUMP_REACH = 255;
const SPRINT_JUMP_REACH = 459;
const MAX_JUMP_HEIGHT = 141;
const SAFE_STANDARD_GAP = 200;
const SAFE_SPRINT_GAP = 350;
const REQUIRED_SPRINT_RUNWAY = 700;

function supportingGround(x: number) {
  return LEVEL_1_CONFIG.groundSegments.find(
    (segment) => x >= segment.x && x <= segment.x + segment.width,
  );
}

describe("Level 1 traversal design", () => {
  it("keeps every mandatory gap within the bunny's measured abilities", () => {
    const segments = [...LEVEL_1_CONFIG.groundSegments].sort((a, b) => a.x - b.x);

    for (let index = 1; index < segments.length; index += 1) {
      const previous = segments[index - 1];
      const current = segments[index];
      const previousEnd = previous.x + previous.width;
      const gap = current.x - previousEnd;
      const bridge = LEVEL_1_CONFIG.bridges.find(
        (item) => item.x <= previousEnd && item.x + item.width >= current.x,
      );

      if (bridge) {
        expect(bridge.x + bridge.width).toBeGreaterThanOrEqual(current.x);
        continue;
      }

      if (gap <= SAFE_STANDARD_GAP) {
        expect(gap).toBeLessThan(WALK_JUMP_REACH);
        continue;
      }

      expect(gap).toBeLessThanOrEqual(SAFE_SPRINT_GAP);
      expect(gap).toBeLessThan(SPRINT_JUMP_REACH);
      expect(previous.width).toBeGreaterThanOrEqual(REQUIRED_SPRINT_RUNWAY);
    }
  });

  it("places spawn, goal and enemies on real ground", () => {
    expect(supportingGround(LEVEL_1_CONFIG.spawn.x)).toBeDefined();
    expect(LEVEL_1_CONFIG.goal).toBeDefined();
    expect(supportingGround(LEVEL_1_CONFIG.goal!.x)).toBeDefined();

    for (const enemy of LEVEL_1_CONFIG.enemies) {
      expect(supportingGround(enemy.x)).toBeDefined();
    }
  });

  it("grounds the complete footprint of every environment element", () => {
    for (const item of LEVEL_1_CONFIG.environmentElements ?? []) {
      expect(item.y).toBeUndefined();

      const ground = supportingGround(item.x);
      const meta = ENVIRONMENT_ELEMENTS_MAP[item.element];
      const halfWidth = (meta.width * (item.scale ?? 1)) / 2;

      expect(ground).toBeDefined();
      expect(item.x - halfWidth).toBeGreaterThanOrEqual(ground!.x);
      expect(item.x + halfWidth).toBeLessThanOrEqual(ground!.x + ground!.width);
    }
  });

  it("uses reachable height changes and valid terrain assets", () => {
    const surfaces = LEVEL_1_CONFIG.floatingPlatforms.map((platform) => {
      const meta = GROUND_ELEMENTS_MAP[platform.element ?? "ground_044"];
      return platform.y + meta.hitbox.offsetY;
    });

    // Every ascent remains below the bunny's approximate jump apex even when
    // a platform hitbox is recalibrated to better match its artwork.
    expect(600 - surfaces[1]).toBeLessThanOrEqual(MAX_JUMP_HEIGHT);
    expect(surfaces[1] - surfaces[2]).toBeLessThanOrEqual(MAX_JUMP_HEIGHT);
    expect(600 - surfaces[4]).toBeLessThanOrEqual(MAX_JUMP_HEIGHT);
    expect(surfaces[4] - surfaces[5]).toBeLessThanOrEqual(MAX_JUMP_HEIGHT);

    for (const segment of LEVEL_1_CONFIG.groundSegments) {
      expect(GROUND_ELEMENTS_MAP[segment.element ?? "ground_104"]).toBeDefined();
    }
  });
});
