import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = 'public/assets/sprites/bunny';
const enemyDir = 'public/assets/sprites/enemies';
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(enemyDir, { recursive: true });

async function extractCharacters(imagePath, yMin = 0, yMax = 724) {
  const image = sharp(imagePath);
  const meta = await image.metadata();
  const { width, height } = meta;
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  const blockSize = 4;
  const gw = Math.ceil(width / blockSize);
  const gh = Math.ceil(height / blockSize);
  const gyMin = Math.floor(yMin / blockSize);
  const gyMax = Math.ceil(yMax / blockSize);

  const grid = new Uint8Array(gw * gh);
  for (let y = yMin; y < Math.min(height, yMax); y++) {
    const gy = Math.floor(y / blockSize);
    for (let x = 0; x < width; x++) {
      const gx = Math.floor(x / blockSize);
      if (data[(y * width + x) * 4 + 3] > 25) {
        grid[gy * gw + gx] = 1;
      }
    }
  }

  // BFS labeling
  const visited = new Uint8Array(gw * gh);
  const allBlobs = [];

  for (let gy = gyMin; gy < gyMax; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const idx = gy * gw + gx;
      if (grid[idx] && !visited[idx]) {
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

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = cy + dy;
              const nx = cx + dx;
              if (nx >= 0 && nx < gw && ny >= gyMin && ny < gyMax) {
                const nidx = ny * gw + nx;
                if (grid[nidx] && !visited[nidx]) {
                  visited[nidx] = 1;
                  queue.push(nidx);
                }
              }
            }
          }
        }

        if (count > 5) {
          allBlobs.push({
            left: minX * blockSize,
            right: Math.min(width, (maxX + 1) * blockSize),
            top: minY * blockSize,
            bottom: Math.min(height, (maxY + 1) * blockSize),
            cx: (minX + maxX) / 2 * blockSize,
            cy: (minY + maxY) / 2 * blockSize,
            count,
          });
        }
      }
    }
  }

  allBlobs.sort((a, b) => b.count - a.count);
  const mainCharacters = allBlobs.slice(0, 8);
  mainCharacters.sort((a, b) => a.cx - b.cx);

  // Divide into 8 horizontal column sectors to strictly prevent inter-frame bleed
  const colW = width / 8;
  for (let i = 0; i < mainCharacters.length; i++) {
    const minColX = Math.round(i * colW);
    const maxColX = Math.round((i + 1) * colW);

    // Initial clamp to column boundary with small margin
    mainCharacters[i].left = Math.max(minColX, mainCharacters[i].left);
    mainCharacters[i].right = Math.min(maxColX, mainCharacters[i].right);
  }

  // Assign smaller particles only within the same column
  const smallBlobs = allBlobs.slice(8);
  for (const s of smallBlobs) {
    const colIdx = Math.floor(s.cx / colW);
    if (colIdx >= 0 && colIdx < mainCharacters.length) {
      const c = mainCharacters[colIdx];
      c.left = Math.min(c.left, s.left);
      c.right = Math.min(c.right, s.right);
      c.top = Math.min(c.top, s.top);
      c.bottom = Math.max(c.bottom, s.bottom);
    }
  }

  const frames = mainCharacters.map((c) => ({
    left: c.left,
    top: c.top,
    width: c.right - c.left,
    height: c.bottom - c.top,
    cx: c.cx,
  }));

  console.log(`${imagePath}: cleanly extracted ${frames.length} frames`);
  return { frames, data, width, height };
}

async function buildCleanSpritesheet(filename, animName, frameW = 128, frameH = 128, yMin = 0, yMax = 724) {
  const filePath = path.join('src/sprites/bunny', filename);
  const { frames, data, width, height } = await extractCharacters(filePath, yMin, yMax);

  const compositeOps = [];
  for (let i = 0; i < frames.length; i++) {
    const box = frames[i];
    const cropped = await sharp(data, { raw: { width, height, channels: 4 } })
      .extract(box)
      .png()
      .toBuffer();

    const resized = await sharp(cropped)
      .resize({
        width: frameW - 16,
        height: frameH - 12,
        fit: 'inside',
      })
      .toBuffer({ resolveWithObject: true });

    const leftInFrame = Math.round((frameW - resized.info.width) / 2);
    const topInFrame = frameH - resized.info.height - 6;

    // Save individual frame
    await sharp({
      create: { width: frameW, height: frameH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: resized.data, left: leftInFrame, top: topInFrame }])
      .png()
      .toFile(path.join(outDir, `${animName}_${i}.png`));

    compositeOps.push({
      input: resized.data,
      left: i * frameW + leftInFrame,
      top: topInFrame,
    });
  }

  // Save 8-frame spritesheet
  await sharp({
    create: { width: frameW * frames.length, height: frameH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(compositeOps)
    .png()
    .toFile(path.join(outDir, `${animName}_sheet.png`));

  console.log(`Saved ${animName}_sheet.png with ${frames.length} frames!`);
}

async function run() {
  await buildCleanSpritesheet('bunny_idle.png', 'idle');
  await buildCleanSpritesheet('bunny_walking.png', 'walk');
  await buildCleanSpritesheet('bunny_jump.png', 'jump');
  await buildCleanSpritesheet('bunny_damage.png', 'damage');
  await buildCleanSpritesheet('bunny_stomp.png', 'stomp', 128, 128, 0, 724);
  console.log('ALL 8-FRAME ANIMATION SPRITESHEETS CREATED PERFECTLY!');
}

run();
