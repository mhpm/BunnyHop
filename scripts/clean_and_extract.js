import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function cleanAndExtract() {
  const outDir = 'public/assets/sprites/bunny';
  fs.mkdirSync(outDir, { recursive: true });

  const image = sharp('src/sprites/bunny.png');
  const metadata = await image.metadata();
  const { width, height } = metadata;
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  // 1. Clear label regions by setting alpha to 0
  const labelRegions = [
    { x1: 0, y1: 0, x2: 190, y2: 65 },       // "Idle"
    { x1: 0, y1: 270, x2: 210, y2: 325 },   // "Walking"
    { x1: 0, y1: 510, x2: 220, y2: 575 },   // "Jumping"
    { x1: 0, y1: 740, x2: 440, y2: 805 },   // "Aplastando a un enemigo"
  ];

  for (const reg of labelRegions) {
    for (let y = reg.y1; y <= reg.y2; y++) {
      for (let x = reg.x1; x <= reg.x2; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = (y * width + x) * 4;
          data[idx + 3] = 0; // Transparent
        }
      }
    }
  }

  // Helper to find tight bounding box
  function getTightBounds(x1, y1, x2, y2) {
    let minX = x2, maxX = x1, minY = y2, maxY = y1;
    let found = false;

    for (let y = y1; y < y2; y++) {
      for (let x = x1; x < x2; x++) {
        const a = data[(y * width + x) * 4 + 3];
        if (a > 25) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) return null;
    return {
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  }

  // Row 1: IDLE (6 frames)
  console.log('--- EXTRACTING IDLE (6 frames) ---');
  const idleCols = [
    [30, 240],
    [240, 430],
    [430, 620],
    [620, 800],
    [800, 970],
    [970, 1160],
  ];

  for (let i = 0; i < idleCols.length; i++) {
    const [x1, x2] = idleCols[i];
    const box = getTightBounds(x1, 50, x2, 290);
    if (box) {
      console.log(`Idle ${i}:`, box);
      const pad = 4;
      await sharp(data, { raw: { width, height, channels: 4 } })
        .extract({
          left: Math.max(0, box.left - pad),
          top: Math.max(0, box.top - pad),
          width: Math.min(width - box.left, box.width + pad * 2),
          height: Math.min(height - box.top, box.height + pad * 2),
        })
        .toFile(path.join(outDir, `idle_${i}.png`));
    }
  }

  // Row 2: WALKING (9 frames)
  console.log('--- EXTRACTING WALKING (9 frames) ---');
  const walkCols = [
    [10, 175],
    [175, 340],
    [340, 510],
    [510, 675],
    [675, 845],
    [845, 1025],
    [1025, 1190],
    [1190, 1360],
    [1360, 1530],
  ];

  for (let i = 0; i < walkCols.length; i++) {
    const [x1, x2] = walkCols[i];
    const box = getTightBounds(x1, 310, x2, 530);
    if (box) {
      console.log(`Walk ${i}:`, box);
      const pad = 4;
      await sharp(data, { raw: { width, height, channels: 4 } })
        .extract({
          left: Math.max(0, box.left - pad),
          top: Math.max(0, box.top - pad),
          width: Math.min(width - box.left, box.width + pad * 2),
          height: Math.min(height - box.top, box.height + pad * 2),
        })
        .toFile(path.join(outDir, `walk_${i}.png`));
    }
  }

  // Row 3: JUMPING (6 frames)
  console.log('--- EXTRACTING JUMPING (6 frames) ---');
  const jumpCols = [
    [50, 240],
    [240, 520],
    [520, 750],
    [750, 970],
    [970, 1220],
    [1220, 1460],
  ];

  for (let i = 0; i < jumpCols.length; i++) {
    const [x1, x2] = jumpCols[i];
    const box = getTightBounds(x1, 530, x2, 770);
    if (box) {
      console.log(`Jump ${i}:`, box);
      const pad = 4;
      await sharp(data, { raw: { width, height, channels: 4 } })
        .extract({
          left: Math.max(0, box.left - pad),
          top: Math.max(0, box.top - pad),
          width: Math.min(width - box.left, box.width + pad * 2),
          height: Math.min(height - box.top, box.height + pad * 2),
        })
        .toFile(path.join(outDir, `jump_${i}.png`));
    }
  }

  // Row 4: STOMPING & BEETLE SQUASH (6 frames)
  console.log('--- EXTRACTING STOMP / BEETLE (6 frames) ---');
  const stompCols = [
    [100, 360],
    [360, 560],
    [560, 780],
    [780, 1010],
    [1010, 1250],
    [1250, 1500],
  ];

  for (let i = 0; i < stompCols.length; i++) {
    const [x1, x2] = stompCols[i];
    const box = getTightBounds(x1, 790, x2, 1020);
    if (box) {
      console.log(`Stomp ${i}:`, box);
      const pad = 4;
      await sharp(data, { raw: { width, height, channels: 4 } })
        .extract({
          left: Math.max(0, box.left - pad),
          top: Math.max(0, box.top - pad),
          width: Math.min(width - box.left, box.width + pad * 2),
          height: Math.min(height - box.top, box.height + pad * 2),
        })
        .toFile(path.join(outDir, `stomp_${i}.png`));
    }
  }

  console.log('Successfully cleaned and extracted all sprite frames!');
}

cleanAndExtract();
