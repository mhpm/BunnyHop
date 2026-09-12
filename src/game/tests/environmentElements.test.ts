import { describe, it, expect } from "vitest";
import {
  ENVIRONMENT_ELEMENTS_MAP,
  ENVIRONMENT_ELEMENTS_LIST,
  getEnvironmentElementMeta,
  ENVIRONMENT_PRESETS,
} from "../config/environmentElements";
import { LEVEL_1_CONFIG } from "../levels/levelData";

describe("Environment Elements System", () => {
  it("should have pre-configured environment elements strictly from public/assets/environment/enviroment_elements", () => {
    expect(ENVIRONMENT_ELEMENTS_LIST.length).toBe(30);
    expect(ENVIRONMENT_ELEMENTS_MAP["enviroment_021"]).toBeDefined();
    expect(ENVIRONMENT_ELEMENTS_MAP["enviroment_021"].width).toBe(191);
    expect(ENVIRONMENT_ELEMENTS_MAP["enviroment_021"].height).toBe(230);
    expect(ENVIRONMENT_ELEMENTS_MAP["enviroment_021"].file).toBe("enviroment_021.png");
  });

  it("should provide safe fallback for new or unmapped elements via getEnvironmentElementMeta", () => {
    const metaKnown = getEnvironmentElementMeta("enviroment_022");
    expect(metaKnown.id).toBe("enviroment_022");
    expect(metaKnown.width).toBe(120);

    // Dynamic unmapped element (e.g. future element added to folder)
    const metaFuture = getEnvironmentElementMeta("enviroment_100.png");
    expect(metaFuture.id).toBe("enviroment_100");
    expect(metaFuture.file).toBe("enviroment_100.png");
    expect(metaFuture.category).toBe("prop");
    expect(metaFuture.width).toBe(128);
    expect(metaFuture.height).toBe(128);
  });

  it("should have valid ENVIRONMENT_PRESETS strictly from enviroment_elements", () => {
    expect(ENVIRONMENT_PRESETS.STRUCTURE_TALL_1).toBeDefined();
    expect(ENVIRONMENT_PRESETS.BLOCK_MEDIUM_1).toBeDefined();
    expect(ENVIRONMENT_PRESETS.FOLIAGE_BUSH_1).toBeDefined();
  });

  it("should contain valid environmentElements in LEVEL_1_CONFIG configured at ground level", () => {
    expect(LEVEL_1_CONFIG.environmentElements).toBeDefined();
    expect(LEVEL_1_CONFIG.environmentElements!.length).toBeGreaterThan(0);

    for (const item of LEVEL_1_CONFIG.environmentElements!) {
      expect(item.element).toBeDefined();
      expect(typeof item.x).toBe("number");
      // y is optional (auto-snaps to ground level when undefined)
      if (item.y !== undefined) {
        expect(typeof item.y).toBe("number");
      }
      const meta = getEnvironmentElementMeta(item.element);
      expect(meta).toBeDefined();
      expect(meta.width).toBeGreaterThan(0);
      expect(meta.height).toBeGreaterThan(0);
    }
  });
});
