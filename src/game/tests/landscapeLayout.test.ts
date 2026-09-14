import { describe, expect, it } from 'vitest';
import { getLandscapeSize, unrotatePoint } from '../utils/landscapeLayout';

describe('Landscape display', () => {
  it('preserves the visible world and scale across phone rotation', () => {
    expect(getLandscapeSize(390, 844)).toEqual(getLandscapeSize(844, 390));
    const { width, height, zoom } = getLandscapeSize(390, 844);
    expect(width).toBeGreaterThan(height);
    expect(width * zoom).toBeCloseTo(844);
    expect(height * zoom).toBeCloseTo(390);
  });

  it('keeps the full base view on a 4:3 tablet and a wide desktop', () => {
    for (const [w, h] of [[768, 1024], [1920, 1080], [2560, 1080]]) {
      const size = getLandscapeSize(w, h);
      expect(size.width).toBeGreaterThanOrEqual(1280);
      expect(size.height).toBeGreaterThanOrEqual(720);
      expect(size.width * size.zoom).toBeCloseTo(Math.max(w, h));
      expect(size.height * size.zoom).toBeCloseTo(Math.min(w, h));
    }
  });

  it('maps rotated screen corners and center back to landscape controls', () => {
    expect(unrotatePoint(390, 0, 390)).toEqual({ x: 0, y: 0 });
    expect(unrotatePoint(0, 844, 390)).toEqual({ x: 844, y: 390 });
    expect(unrotatePoint(195, 422, 390)).toEqual({ x: 422, y: 195 });
  });
});
