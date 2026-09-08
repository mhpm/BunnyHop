import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function cropAll() {
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

        if (pixelCount > 50) {
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

  // Sort by Y then X
  components.sort((a, b) => a.minY - b.minY || a.minX - b.minX);

  const outDir = 'public/assets/extracted_all';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const metadataList = [];

  for (let i = 0; i < components.length; i++) {
    const c = components[i];
    const filename = `asset_${String(i + 1).padStart(3, '0')}.png`;
    const outPath = path.join(outDir, filename);

    await sharp('public/assets/assets.png')
      .extract({ left: c.minX, top: c.minY, width: c.width, height: c.height })
      .toFile(outPath);

    metadataList.push({
      id: i + 1,
      filename,
      x: c.minX,
      y: c.minY,
      w: c.width,
      h: c.height,
      pixels: c.pixelCount,
    });
  }

  fs.writeFileSync(path.join(outDir, 'metadata.json'), JSON.stringify(metadataList, null, 2));
  console.log(`Cropped ${components.length} components into ${outDir}`);
}

cropAll().catch(console.error);
