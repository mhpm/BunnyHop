import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function makeContactSheet() {
  const dir = 'public/assets/extracted_all';
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf8'));

  // We have 124 items. Let's make a grid of 12 columns x 11 rows. Each cell 128x128.
  const cols = 12;
  const rows = Math.ceil(meta.length / cols);
  const cell = 128;
  const sheetW = cols * cell;
  const sheetH = rows * cell;

  const composites = [];

  for (let i = 0; i < meta.length; i++) {
    const item = meta[i];
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = c * cell;
    const y = r * cell;

    const imgPath = path.join(dir, item.filename);
    const resized = await sharp(imgPath)
      .resize({ width: cell - 8, height: cell - 24, fit: 'inside' })
      .toBuffer();

    composites.push({
      input: resized,
      left: x + 4,
      top: y + 4,
    });
  }

  const base = sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: { r: 240, g: 244, b: 248, alpha: 1 },
    },
  });

  const outPath = 'C:\\Users\\miche\\.gemini\\antigravity-ide\\brain\\543d315a-cf69-4f74-9f94-b84265894667\\assets_contact_sheet.png';
  await base.composite(composites).png().toFile(outPath);
  console.log('Contact sheet saved to:', outPath);
}

makeContactSheet().catch(console.error);
