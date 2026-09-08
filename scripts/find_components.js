import sharp from 'sharp';
import fs from 'fs';

async function findComponents() {
  const { data, info } = await sharp('public/assets/assets.png').raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  // Threshold binary mask
  const mask = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    if (data[i * 4 + 3] > 25) {
      mask[i] = 1;
    }
  }

  // Connected component labeling using BFS
  const visited = new Uint8Array(W * H);
  const components = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      if (mask[idx] === 1 && visited[idx] === 0) {
        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;
        let pixelCount = 0;

        const queue = [x, y];
        visited[idx] = 1;

        let qHead = 0;
        while (qHead < queue.length) {
          const cx = queue[qHead++];
          const cy = queue[qHead++];
          pixelCount++;

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          // 4-neighborhood
          const neighbors = [
            [cx - 1, cy],
            [cx + 1, cy],
            [cx, cy - 1],
            [cx, cy + 1],
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
              const nIdx = ny * W + nx;
              if (mask[nIdx] === 1 && visited[nIdx] === 0) {
                visited[nIdx] = 1;
                queue.push(nx, ny);
              }
            }
          }
        }

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;

        // Filter out tiny noise (less than 30 pixels)
        if (pixelCount > 30) {
          components.push({
            minX,
            minY,
            maxX,
            maxY,
            width,
            height,
            pixelCount,
          });
        }
      }
    }
  }

  console.log(`Found ${components.length} connected components!`);

  // Sort by Y then X
  components.sort((a, b) => a.minY - b.minY || a.minX - b.minX);

  components.forEach((c, i) => {
    console.log(
      `#${i + 1}: box [${c.minX}, ${c.minY}, ${c.width}, ${c.height}], area=${c.width * c.height}, pixels=${c.pixelCount}`
    );
  });
}

findComponents().catch(console.error);
