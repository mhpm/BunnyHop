import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = 'public/assets/sprites/bunny';
fs.mkdirSync(outDir, { recursive: true });

async function sliceByValleys(filename, animName, frameW = 128, frameH = 128, yMin = 0, yMax = 724) {
  const filePath = path.join('src/sprites/bunny', filename);
  const img = sharp(filePath);
  const meta = await img.metadata();
  const { width, height } = meta;
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });

  // Column alpha projection
  const proj = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = yMin; y < Math.min(height, yMax); y++) {
      if (data[(y * width + x) * 4 + 3] > 30) sum++;
    }
    proj[x] = sum;
  }

  // Smooth projection
  const smoothed = new Float32Array(width);
  for (let x = 3; x < width - 3; x++) {
    smoothed[x] = (proj[x-2] + proj[x-1] + proj[x] + proj[x+1] + proj[x+2]) / 5;
  }

  // Find 7 valley cuts dividing the 8 characters
  // Roughly expected around width * 1/8, 2/8, 3/8, 4/8, 5/8, 6/8, 7/8
  const cuts = [0];
  for (let i = 1; i < 8; i++) {
    const expectedX = Math.round((i / 8) * width);
    // Search window around expectedX (+- 80px)
    let minVal = Infinity;
    let minX = expectedX;
    for (let x = expectedX - 75; x <= expectedX + 75; x++) {
      if (x > 0 && x < width && smoothed[x] < minVal) {
        minVal = smoothed[x];
        minX = x;
      }
    }
    cuts.push(minX);
  }
  cuts.push(width);

  console.log(`${animName} cut lines:`, cuts);

  const compositeOps = [];
  for (let i = 0; i < 8; i++) {
    const x1 = cuts[i];
    const x2 = cuts[i + 1];

    // Find tight bounds of character inside this valley segment
    let minX = x2, maxX = x1, minY = yMax, maxY = yMin;
    let found = false;

    for (let y = yMin; y < Math.min(height, yMax); y++) {
      for (let x = x1; x < x2; x++) {
        if (data[(y * width + x) * 4 + 3] > 30) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (found) {
      const box = {
        left: minX,
        top: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      };

      const cropped = await sharp(data, { raw: { width, height, channels: 4 } })
        .extract(box)
        .png()
        .toBuffer();

      const resized = await sharp(cropped)
        .resize({ width: frameW - 16, height: frameH - 12, fit: 'inside' })
        .toBuffer({ resolveWithObject: true });

      const leftInFrame = Math.round((frameW - resized.info.width) / 2);
      const topInFrame = frameH - resized.info.height - 6;

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
  }

  await sharp({
    create: { width: frameW * 8, height: frameH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(compositeOps)
    .png()
    .toFile(path.join(outDir, `${animName}_sheet.png`));

  console.log(`Saved ${animName}_sheet.png successfully!`);
}

async function sliceStompManual(frameW = 128, frameH = 128) {
  const filePath = 'src/sprites/bunny/bunny_stomp.png';
  const img = sharp(filePath);
  const meta = await img.metadata();
  const { width, height } = meta;
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });

  const cuts = [0, 276, 580, 920, 1230, 1540, 1840, 2172];
  const compositeOps = [];

  for (let i = 0; i < 7; i++) {
    const x1 = cuts[i];
    const x2 = cuts[i + 1];

    let minX = x2, maxX = x1, minY = height, maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
      for (let x = x1; x < x2; x++) {
        if (data[(y * width + x) * 4 + 3] > 30) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (found) {
      const box = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
      const cropped = await sharp(data, { raw: { width, height, channels: 4 } })
        .extract(box)
        .png()
        .toBuffer();

      const resized = await sharp(cropped)
        .resize({ width: frameW - 16, height: frameH - 12, fit: 'inside' })
        .toBuffer({ resolveWithObject: true });

      const leftInFrame = Math.round((frameW - resized.info.width) / 2);
      const topInFrame = frameH - resized.info.height - 6;

      await sharp({
        create: { width: frameW, height: frameH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite([{ input: resized.data, left: leftInFrame, top: topInFrame }])
        .png()
        .toFile(path.join(outDir, `stomp_${i}.png`));

      compositeOps.push({
        input: resized.data,
        left: i * frameW + leftInFrame,
        top: topInFrame,
      });
    }
  }

  // Duplicate last landing frame as frame 7 so it has 8 frames
  if (compositeOps.length === 7) {
    compositeOps.push({
      input: compositeOps[6].input,
      left: 7 * frameW + Math.round((frameW - 100) / 2),
      top: compositeOps[6].top,
    });
  }

  await sharp({
    create: { width: frameW * 8, height: frameH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(compositeOps)
    .png()
    .toFile(path.join(outDir, 'stomp_sheet.png'));

  console.log('Saved stomp_sheet.png with 8 frames!');
}

async function run() {
  await sliceByValleys('bunny_idle.png', 'idle');
  await sliceByValleys('bunny_walking.png', 'walk');
  await sliceByValleys('bunny_jump.png', 'jump');
  await sliceByValleys('bunny_damage.png', 'damage');
  await sliceStompManual();
  console.log('ALL VALLEYS SLICED 100% CLEANLY!');
}

run();
