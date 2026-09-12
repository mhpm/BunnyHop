import { describe, it, expect } from "vitest";
import {
  extractShapePoints,
  getPhysicsShapeBounds,
} from "../utils/physicsShapes";

describe("PhysicsShapes Utility - PhysicsEditor Parser", () => {
  const p2Json = {
    bunny_dash: [
      {
        shape: [129, 37, 195, 70, 190, 119, 72, 117, 74, 77, 93, 33],
      },
    ],
  };

  const matterJson = {
    bunny_dash: {
      type: "fromPhysicsEditor",
      fixtures: [
        {
          vertices: [
            [
              { x: 93, y: 33 },
              { x: 74, y: 77 },
              { x: 72, y: 117 },
              { x: 190, y: 119 },
              { x: 195, y: 70 },
              { x: 129, y: 37 },
            ],
          ],
        },
      ],
    },
  };

  it("should extract points correctly from Phaser P2 format", () => {
    const points = extractShapePoints(p2Json, "bunny_dash");
    expect(points).toHaveLength(6);
    expect(points[0]).toEqual({ x: 129, y: 37 });
    expect(points[2]).toEqual({ x: 190, y: 119 });
    expect(points[3]).toEqual({ x: 72, y: 117 });
  });

  it("should extract points correctly from Matter.js format", () => {
    const points = extractShapePoints(matterJson, "bunny_dash");
    expect(points).toHaveLength(6);
    expect(points[0]).toEqual({ x: 93, y: 33 });
    expect(points[2]).toEqual({ x: 72, y: 117 });
    expect(points[3]).toEqual({ x: 190, y: 119 });
  });

  it("should compute exact bounds, dimensions and offsets from P2 JSON", () => {
    const bounds = getPhysicsShapeBounds(null, p2Json, "bunny_dash", {
      frameWidth: 218,
      frameHeight: 125,
      groundBaseline: 87.5,
    });

    expect(bounds.minX).toBe(72);
    expect(bounds.maxX).toBe(195);
    expect(bounds.minY).toBe(33);
    expect(bounds.maxY).toBe(119);
    expect(bounds.width).toBe(123);
    expect(bounds.height).toBe(86);
    expect(bounds.offsetX).toBe(72);
    expect(bounds.offsetY).toBe(33);

    // Flipped offset (facing left)
    expect(bounds.getFlippedOffsetX(218)).toBe(23);

    // Baseline origin alignment: (119 - 87.5) / 125 = 31.5 / 125
    expect(bounds.originY).toBeCloseTo(31.5 / 125, 4);
  });

  it("should compute identical bounds from Matter.js JSON", () => {
    const bounds = getPhysicsShapeBounds(null, matterJson, "bunny_dash", {
      frameWidth: 218,
      frameHeight: 125,
      groundBaseline: 87.5,
    });

    expect(bounds.width).toBe(123);
    expect(bounds.height).toBe(86);
    expect(bounds.offsetX).toBe(72);
    expect(bounds.offsetY).toBe(33);
    expect(bounds.getFlippedOffsetX(218)).toBe(23);
  });

  it("should work for any other arbitrary sprite shape", () => {
    const enemyJson = {
      enemy_turtle: [
        {
          shape: [10, 20, 60, 20, 60, 50, 10, 50],
        },
      ],
    };

    const bounds = getPhysicsShapeBounds(null, enemyJson, "enemy_turtle", {
      frameWidth: 70,
      frameHeight: 60,
    });

    expect(bounds.minX).toBe(10);
    expect(bounds.maxX).toBe(60);
    expect(bounds.width).toBe(50);
    expect(bounds.height).toBe(30);
    expect(bounds.offsetX).toBe(10);
    expect(bounds.offsetY).toBe(20);
    expect(bounds.getFlippedOffsetX(70)).toBe(10);
  });

  it("should use fallback values when data or key is missing", () => {
    const bounds = getPhysicsShapeBounds(null, {}, "missing_shape", {
      fallback: { minX: 15, maxX: 85, minY: 10, maxY: 60 },
      frameWidth: 100,
    });

    expect(bounds.width).toBe(70);
    expect(bounds.height).toBe(50);
    expect(bounds.offsetX).toBe(15);
    expect(bounds.offsetY).toBe(10);
    expect(bounds.getFlippedOffsetX(100)).toBe(15);
  });

  it("should support customHeight to reduce height while keeping base aligned to maxY", () => {
    const bounds = getPhysicsShapeBounds(null, p2Json, "bunny_dash", {
      frameWidth: 218,
      frameHeight: 125,
      groundBaseline: 87.5,
      customHeight: 52,
    });

    expect(bounds.height).toBe(52);
    // Base is at maxY (119), so top is at 119 - 52 = 67
    expect(bounds.offsetY).toBe(67);
    expect(bounds.offsetY + bounds.height).toBe(119);
    // originY remains aligned to maxY
    expect(bounds.originY).toBeCloseTo(31.5 / 125, 4);
  });
});
