import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function extract() {
  const outDir = 'public/assets/sprites/bunny';
  fs.mkdirSync(outDir, { recursive: true });

  const image = sharp('src/sprites/bunny.png');
  const metadata = await image.metadata();
  const { width, height } = metadata;
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  // Function to find bounding box of non-transparent pixels in a given rectangular search window
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
  // Let's search in vertical band y: 40..290
  // In Row 1, the text "Idle" is on the left (x: 0..160). The 6 bunnies are spaced across x: 50..1200
  console.log('--- Row 1: IDLE ---');
  // Let's find columns in y: 40..290
  const idleWindows = [
    [50, 40, 240, 290],
    [240, 40, 430, 290],
    [430, 40, 620, 290],
    [620, 40, 800, 290],
    [800, 40, 970, 290],
    [970, 40, 1160, 290],
  ];

  for (let i = 0; i < idleWindows.length; i++) {
    const [x1, y1, x2, y2] = idleWindows[i];
    const box = getTightBounds(x1, y1, x2, y2);
    if (box) {
      console.log(`Idle ${i}:`, box);
      // Pad by 4px
      const padded = {
        left: Math.max(0, box.left - 4),
        top: Math.max(0, box.top - 4),
        width: Math.min(width - box.left, box.width + 8),
        height: Math.min(height - box.top, box.height + 8),
      };
      await sharp('src/sprites/bunny.png')
        .extract(padded)
        .toFile(path.join(outDir, `idle_${i}.png`));
    }
  }

  // Row 2: WALKING / RUNNING (9 frames)
  // Vertical band y: 300..530
  // Label "Walking" is at x: 0..180
  console.log('--- Row 2: WALKING ---');
  const walkWindows = [
    [10, 310, 180, 530],
    [180, 310, 340, 530],
    [340, 310, 500, 530],
    [500, 310, 670, 530],
    [670, 310, 840, 530],
    [840, 310, 1020, 530],
    [1020, 310, 1190, 530],
    [1190, 310, 1360, 530],
    [1360, 310, 1530, 530],
  ];

  for (let i = 0; i < walkWindows.length; i++) {
    const [x1, y1, x2, y2] = walkWindows[i];
    const box = getTightBounds(x1, y1, x2, y2);
    if (box) {
      console.log(`Walk ${i}:`, box);
      const padded = {
        left: Math.max(0, box.left - 4),
        top: Math.max(0, box.top - 4),
        width: Math.min(width - box.left, box.width + 8),
        height: Math.min(height - box.top, box.height + 8),
      };
      await sharp('src/sprites/bunny.png')
        .extract(padded)
        .toFile(path.join(outDir, `walk_${i}.png`));
    }
  }

  // Row 3: JUMPING (6 frames)
  // Vertical band y: 530..770
  console.log('--- Row 3: JUMPING ---');
  const jumpWindows = [
    [50, 540, 250, 770],
    [250, 540, 530, 770],
    [530, 540, 760, 770],
    [760, 540, 980, 770],
    [980, 540, 1220, 770],
    [1220, 540, 1460, 770],
  ];

  for (let i = 0; i < jumpWindows.length; i++) {
    const [x1, y1, x2, y2] = jumpWindows[i];
    const box = getTightBounds(x1, y1, x2, y2);
    if (box) {
      console.log(`Jump ${i}:`, box);
      const padded = {
        left: Math.max(0, box.left - 4),
        top: Math.max(0, box.top - 4),
        width: Math.min(width - box.left, box.width + 8),
        height: Math.min(height - box.top, box.height + 8),
      };
      await sharp('src/sprites/bunny.png')
        .extract(padded)
        .toFile(path.join(outDir, `jump_${i}.png`));
    }
  }

  // Row 4: APLASTANDO (STOMP / SQUASH)
  // Vertical band y: 760..1020
  console.log('--- Row 4: STOMP ---');
  const stompWindows = [
    [100, 760, 360, 1020],
    [360, 760, 550, 1020],
    [550, 760, 770, 1020],
    [770, 760, 1000, 1020],
    [1000, 760, 1250, 1020],
    [1250, 760, 1500, 1020],
  ];

  for (let i = 0; i < stompWindows.length; i++) {
    const [x1, y1, x2, y2] = stompWindows[i];
    const box = getTightBounds(x1, y1, x2, y2);
    if (box) {
      console.log(`Stomp ${i}:`, box);
      const padded = {
        left: Math.max(0, box.left - 4),
        top: Math.max(0, box.top - 4),
        width: Math.min(width - box.left, box.width + 8),
        height: Math.min(height - box.top, box.height + 8),
      };
      await sharp('src/sprites/bunny.png')
        .extract(padded)
        .toFile(path.join(outDir, `stomp_${i}.png`));
    }
  }

  console.log('Finished extracting all frames!');
}

extract();
