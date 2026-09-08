import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function slice() {
  const image = sharp('src/sprites/bunny.png');
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Let's create an occupancy grid
  // Grid size 8x8 blocks
  const blockSize = 8;
  const gw = Math.ceil(width / blockSize);
  const gh = Math.ceil(height / blockSize);
  const grid = new Uint8Array(gw * gh);

  for (let y = 0; y < height; y++) {
    const gy = Math.floor(y / blockSize);
    for (let x = 0; x < width; x++) {
      const gx = Math.floor(x / blockSize);
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 20) {
        grid[gy * gw + gx] = 1;
      }
    }
  }

  // Find connected components in the grid
  const visited = new Uint8Array(gw * gh);
  const components = [];

  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const idx = gy * gw + gx;
      if (grid[idx] && !visited[idx]) {
        // BFS
        let minX = gx, maxX = gx, minY = gy, maxY = gy;
        let count = 0;
        const queue = [idx];
        visited[idx] = 1;

        while (queue.length > 0) {
          const curr = queue.pop();
          const cy = Math.floor(curr / gw);
          const cx = curr % gw;
          count++;

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          // 8-neighborhood
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = cy + dy;
              const nx = cx + dx;
              if (nx >= 0 && nx < gw && ny >= 0 && ny < gh) {
                const nidx = ny * gw + nx;
                if (grid[nidx] && !visited[nidx]) {
                  visited[nidx] = 1;
                  queue.push(nidx);
                }
              }
            }
          }
        }

        // Only keep significant components (more than 4 blocks = 256 pixels)
        if (count > 4) {
          components.push({
            minX: minX * blockSize,
            maxX: Math.min(width, (maxX + 1) * blockSize),
            minY: minY * blockSize,
            maxY: Math.min(height, (maxY + 1) * blockSize),
            w: (maxX - minX + 1) * blockSize,
            h: (maxY - minY + 1) * blockSize,
            cx: (minX + maxX) / 2 * blockSize,
            cy: (minY + maxY) / 2 * blockSize,
          });
        }
      }
    }
  }

  console.log(`Found ${components.length} components:`);
  // Sort by Y first (rows) then X
  components.sort((a, b) => {
    if (Math.abs(a.cy - b.cy) > 60) {
      return a.cy - b.cy;
    }
    return a.cx - b.cx;
  });

  components.forEach((c, i) => {
    console.log(`Component ${i}: x=${c.minX}..${c.maxX} (${c.w}px), y=${c.minY}..${c.maxY} (${c.h}px), center=(${Math.round(c.cx)}, ${Math.round(c.cy)})`);
  });
}

slice();
