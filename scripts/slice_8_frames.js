import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = 'public/assets/sprites/bunny';
const beetleDir = 'public/assets/sprites/enemies';
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(beetleDir, { recursive: true });

async function findHorizontalClusters(imagePath, count = 8, yMin = 0, yMax = 724) {
  const image = sharp(imagePath);
  const meta = await image.metadata();
  const { width, height } = meta;
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  // Column alpha projection
  const colAlpha = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = yMin; y < Math.min(height, yMax); y++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 30) sum += 1;
    }
    colAlpha[x] = sum;
  }

  // Find intervals where colAlpha > 5
  const intervals = [];
  let inInterval = false;
  let start = 0;

  for (let x = 0; x < width; x++) {
    if (colAlpha[x] > 5 && !inInterval) {
      inInterval = true;
      start = x;
    } else if (colAlpha[x] <= 5 && inInterval) {
      inInterval = false;
      if (x - start > 40) { // At least 40px wide
        intervals.push({ start, end: x });
      }
    }
  }
  if (inInterval && width - start > 40) {
    intervals.push({ start, end: width });
  }

  console.log(`${imagePath} found ${intervals.length} horizontal intervals (target: ${count})`);

  // For each interval, find exact tight Y bounding box
  const boxes = [];
  for (const it of intervals) {
    let minY = height, maxY = 0;
    let minX = it.end, maxX = it.start;

    for (let y = yMin; y < Math.min(height, yMax); y++) {
      for (let x = it.start; x < it.end; x++) {
        const a = data[(y * width + x) * 4 + 3];
        if (a > 30) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }

    if (minY <= maxY) {
      boxes.push({
        left: minX,
        top: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      });
    }
  }

  return { boxes, data, width, height };
}

async function processSheet(filename, animName, frameW = 128, frameH = 128) {
  const filePath = path.join('src/sprites/bunny', filename);
  const { boxes, data, width, height } = await findHorizontalClusters(filePath, 8);

  console.log(`Processing ${animName}: ${boxes.length} frames...`);

  // Target single composite spritesheet: (frameW * 8) x frameH
  const totalW = frameW * 8;
  const compositeOps = [];

  for (let i = 0; i < Math.min(8, boxes.length); i++) {
    const box = boxes[i];

    // Extract cropped character
    const cropped = await sharp(data, { raw: { width, height, channels: 4 } })
      .extract(box)
      .png()
      .toBuffer();

    // Scale character to fit inside (frameW - 16) x (frameH - 16) maintaining aspect ratio
    const resized = await sharp(cropped)
      .resize({
        width: frameW - 20,
        height: frameH - 16,
        fit: 'inside',
      })
      .toBuffer({ resolveWithObject: true });

    // Center horizontally, anchor to bottom with 8px padding
    const leftInFrame = Math.round((frameW - resized.info.width) / 2);
    const topInFrame = frameH - resized.info.height - 8;

    // Save individual frame
    await sharp({
      create: {
        width: frameW,
        height: frameH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: resized.data, left: leftInFrame, top: topInFrame }])
      .png()
      .toFile(path.join(outDir, `${animName}_${i}.png`));

    // Place into composite spritesheet
    compositeOps.push({
      input: resized.data,
      left: i * frameW + leftInFrame,
      top: topInFrame,
    });
  }

  // Create combined 8-frame spritesheet
  await sharp({
    create: {
      width: totalW,
      height: frameH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(compositeOps)
    .png()
    .toFile(path.join(outDir, `${animName}_sheet.png`));

  console.log(`Saved ${animName}_sheet.png (${totalW}x${frameH}) and individual frames!`);
}

// Special extractor for bunny_stomp.png which contains:
// Upper half: Bunny jumping/stomping
// Lower half: Beetle being squashed!
async function processStompAndBeetle() {
  const filePath = 'src/sprites/bunny/bunny_stomp.png';
  const img = sharp(filePath);
  const meta = await img.metadata();
  const { width, height } = meta;
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });

  // 1. Process Bunny part (y: 0..460)
  const bunnyData = await findHorizontalClusters(filePath, 8, 0, 480);
  console.log(`Bunny stomp: ${bunnyData.boxes.length} frames`);

  const frameW = 128, frameH = 128;
  const compositeOps = [];

  for (let i = 0; i < Math.min(8, bunnyData.boxes.length); i++) {
    const box = bunnyData.boxes[i];
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
      .toFile(path.join(outDir, `stomp_${i}.png`));

    compositeOps.push({
      input: resized.data,
      left: i * frameW + leftInFrame,
      top: topInFrame,
    });
  }

  await sharp({
    create: { width: frameW * 8, height: frameH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(compositeOps)
    .png()
    .toFile(path.join(outDir, 'stomp_sheet.png'));

  // 2. Process Beetle part (y: 450..724)
  const beetleData = await findHorizontalClusters(filePath, 8, 450, 724);
  console.log(`Beetle stomp: ${beetleData.boxes.length} frames`);

  // Frame 0-1 is walking beetle, Frame 3-7 is squashed beetle!
  if (beetleData.boxes.length > 0) {
    const walkBox = beetleData.boxes[0];
    const croppedWalk = await sharp(data, { raw: { width, height, channels: 4 } })
      .extract(walkBox)
      .resize({ width: 72, height: 48, fit: 'inside' })
      .png()
      .toFile(path.join(beetleDir, 'beetle_walk.png'));

    // Squash frame (around index 5 or 6)
    const squashIdx = Math.min(5, beetleData.boxes.length - 1);
    const squashBox = beetleData.boxes[squashIdx];
    const croppedSquash = await sharp(data, { raw: { width, height, channels: 4 } })
      .extract(squashBox)
      .resize({ width: 72, height: 38, fit: 'inside' })
      .png()
      .toFile(path.join(beetleDir, 'beetle_squash.png'));

    console.log('Saved beetle_walk.png and beetle_squash.png from stomp sheet!');
  }
}

async function run() {
  await processSheet('bunny_idle.png', 'idle');
  await processSheet('bunny_walking.png', 'walk');
  await processSheet('bunny_jump.png', 'jump');
  await processSheet('bunny_damage.png', 'damage');
  await processStompAndBeetle();
  console.log('ALL 8-FRAME SPRITESHEETS PROCESSED SUCCESSFULLY!');
}

run();
