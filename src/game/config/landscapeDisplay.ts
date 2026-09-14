import type Phaser from 'phaser';
import { getLandscapeSize, unrotatePoint } from '../utils/landscapeLayout';

export function configureLandscapeDisplay(game: Phaser.Game): void {
  const container = document.getElementById('phaser-container');
  if (!container) return;

  const resize = () => {
    // clientWidth/Height exclude CSS rotation, unlike getBoundingClientRect.
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    const size = getLandscapeSize(width, height);
    game.scale.setZoom(size.zoom);
    game.scale.resize(size.width, size.height);
  };

  // Phaser's default pointer conversion assumes an unrotated canvas.
  const transformPointer = game.input.transformPointer;
  game.input.transformPointer = function (pointer, pageX, pageY, wasMove) {
    if (window.matchMedia('(orientation: portrait)').matches) {
      const bounds = game.scale.canvasBounds;
      const point = unrotatePoint(pageX - bounds.x, pageY - bounds.y, bounds.width);
      pageX = bounds.x + point.x * bounds.width / bounds.height;
      pageY = bounds.y + point.y * bounds.height / bounds.width;
    }
    transformPointer.call(this, pointer, pageX, pageY, wasMove);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  game.events.once('destroy', () => {
    observer.disconnect();
    game.input.transformPointer = transformPointer;
  });
}
