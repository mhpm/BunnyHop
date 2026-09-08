import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function grid() {
  const meta = await sharp('public/assets/assets.png').metadata();
  const W = meta.width;
  const H = meta.height;
  const cols = 4;
  const rows = 4;
  const cellW = Math.floor(W / cols);
  const cellH = Math.floor(H / rows);

  const outDir = 'public/assets/grid_debug';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = c * cellW;
      const top = r * cellH;
      const outPath = path.join(outDir, `cell_r${r}_c${c}.png`);
      await sharp('public/assets/assets.png')
        .extract({ left, top, width: cellW, height: cellH })
        .toFile(outPath);
      console.log(`Cell r=${r}, c=${c}: ${left},${top} -> ${outPath}`);
    }
  }
}

grid().catch(console.error);
