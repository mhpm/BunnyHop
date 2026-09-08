import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = 'public/assets/sprites/bunny';
fs.mkdirSync(outDir, { recursive: true });

async function sliceGridSheet(filename, animName, frameW = 128, frameH = 128, yMin = 0, yMax = 724) {
  const filePath = path.join('src/sprites/bunny', filename);
  const img = sharp(filePath);
  const meta = await img.metadata();
  const { width, height } = meta;
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });

  const colW = width / 8; // 271.5px
  const compositeOps = [];

  for (let i = 0; i < 8; i++) {
    const x1 = Math.round(i * colW);
    const x2 = Math.round((i + 1) * colW);

    // Find tight non-transparent bounds inside this column
    let minX = x2, maxX = x1, minY = yMax, maxY = yMin;
    let found = false;

    for (let y = yMin; y < Math.min(height, yMax); y++) {
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

    if (found && maxX > minX && maxY > minY) {
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
        .resize({ width: frameW - 20, height: frameH - 16, fit: 'inside' })
        .toBuffer({ resolveWithObject: true });

      const leftInFrame = Math.round((frameW - resized.info.width) / 2);
      const topInFrame = frameH - resized.info.height - 8;

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

  // Save 8-frame spritesheet
  await sharp({
    create: { width: frameW * 8, height: frameH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(compositeOps)
    .png()
    .toFile(path.join(outDir, `${animName}_sheet.png`));

  console.log(`Grid sliced ${animName}: 8 frames, saved ${animName}_sheet.png`);
}

async function runGrid() {
  await sliceGridSheet('bunny_idle.png', 'idle');
  await sliceGridSheet('bunny_walking.png', 'walk');
  await sliceGridSheet('bunny_jump.png', 'jump');
  await sliceGridSheet('bunny_damage.png', 'damage');
  // For stomp: y: 0..480 is bunny
  await sliceGridSheet('bunny_stomp.png', 'stomp', 128, 128, 0, 480);
  console.log('ALL 5 8-FRAME SPRITESHEETS CREATED PERFECTLY!');
}

runGrid();
