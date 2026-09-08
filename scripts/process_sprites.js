import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processSprites() {
  const outDir = 'public/assets/sprites/bunny';
  fs.mkdirSync(outDir, { recursive: true });

  const img = sharp('src/sprites/bunny.png');
  const meta = await img.metadata();
  const { width, height } = meta;
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });

  // Erase all banner labels and their shadow lines
  const eraseBoxes = [
    { x1: 0, y1: 0, x2: 170, y2: 65 },       // "Idle"
    { x1: 0, y1: 260, x2: 200, y2: 330 },   // "Walking"
    { x1: 0, y1: 500, x2: 200, y2: 575 },   // "Jumping"
    { x1: 0, y1: 730, x2: 380, y2: 800 },   // "Aplastando..."
  ];

  for (const b of eraseBoxes) {
    for (let y = b.y1; y <= b.y2; y++) {
      for (let x = b.x1; x <= b.x2; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          data[(y * width + x) * 4 + 3] = 0;
        }
      }
    }
  }

  function getCrop(x1, y1, x2, y2) {
    let minX = x2, maxX = x1, minY = y2, maxY = y1;
    let found = false;

    for (let y = y1; y < y2; y++) {
      for (let x = x1; x < x2; x++) {
        const a = data[(y * width + x) * 4 + 3];
        if (a > 30) {
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

  async function saveNormalizedFrame(box, filename) {
    const croppedBuffer = await sharp(data, { raw: { width, height, channels: 4 } })
      .extract(box)
      .png()
      .toBuffer();

    const resized = await sharp(croppedBuffer)
      .resize({
        width: 100,
        height: 100,
        fit: 'inside',
      })
      .toBuffer({ resolveWithObject: true });

    const targetW = 120;
    const targetH = 120;
    const padX = Math.round((targetW - resized.info.width) / 2);
    const padY = targetH - resized.info.height - 8;

    await sharp({
      create: {
        width: targetW,
        height: targetH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: resized.data, left: padX, top: padY }])
      .png()
      .toFile(path.join(outDir, filename));
  }

  // --- ROW 1: IDLE (6 frames) ---
  const idleCols = [
    [50, 230],
    [240, 420],
    [430, 610],
    [620, 790],
    [790, 965],
    [970, 1140],
  ];
  for (let i = 0; i < idleCols.length; i++) {
    const [x1, x2] = idleCols[i];
    const box = getCrop(x1, 60, x2, 280);
    if (box) {
      await saveNormalizedFrame(box, `idle_${i}.png`);
    }
  }

  // --- ROW 2: WALKING / RUN (9 frames) ---
  const walkCols = [
    [10, 170],
    [170, 335],
    [340, 500],
    [510, 670],
    [675, 840],
    [845, 1020],
    [1025, 1185],
    [1190, 1355],
    [1360, 1520],
  ];
  for (let i = 0; i < walkCols.length; i++) {
    const [x1, x2] = walkCols[i];
    const box = getCrop(x1, 325, x2, 525);
    if (box) {
      await saveNormalizedFrame(box, `walk_${i}.png`);
    }
  }

  // --- ROW 3: JUMPING (6 frames) ---
  const jumpCols = [
    [70, 220],
    [230, 510],
    [580, 750],
    [780, 970],
    [1000, 1210],
    [1230, 1440],
  ];
  for (let i = 0; i < jumpCols.length; i++) {
    const [x1, x2] = jumpCols[i];
    const box = getCrop(x1, 530, x2, 765);
    if (box) {
      await saveNormalizedFrame(box, `jump_${i}.png`);
    }
  }

  // --- ROW 4: STOMP (6 frames) ---
  const stompCols = [
    [100, 340],
    [360, 550],
    [570, 770],
    [790, 1000],
    [1030, 1240],
    [1260, 1480],
  ];
  for (let i = 0; i < stompCols.length; i++) {
    const [x1, x2] = stompCols[i];
    const box = getCrop(x1, 800, x2, 1015);
    if (box) {
      await saveNormalizedFrame(box, `stomp_${i}.png`);
    }
  }

  // Escarabajo (Beetle) Walk - tight crop excluding bunny foot
  const beetleBox = getCrop(170, 938, 290, 1005);
  if (beetleBox) {
    const croppedBeetle = await sharp(data, { raw: { width, height, channels: 4 } })
      .extract(beetleBox)
      .png()
      .toBuffer();

    fs.mkdirSync('public/assets/sprites/enemies', { recursive: true });
    await sharp(croppedBeetle)
      .resize({ width: 72, height: 50, fit: 'inside' })
      .toFile('public/assets/sprites/enemies/beetle_walk.png');
    console.log('Saved clean beetle_walk.png!');
  }

  // Escarabajo (Beetle) Squashed - tight crop excluding stars
  const beetleSquashBox = getCrop(1040, 928, 1220, 1005);
  if (beetleSquashBox) {
    const croppedSquash = await sharp(data, { raw: { width, height, channels: 4 } })
      .extract(beetleSquashBox)
      .png()
      .toBuffer();

    await sharp(croppedSquash)
      .resize({ width: 72, height: 40, fit: 'inside' })
      .toFile('public/assets/sprites/enemies/beetle_squash.png');
    console.log('Saved clean beetle_squash.png!');
  }

  console.log('Updated all sprites with ultra-clean cropping!');
}

processSprites();
