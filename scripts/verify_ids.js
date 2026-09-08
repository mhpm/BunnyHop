import fs from 'fs';
import path from 'path';

const dir = 'public/assets/extracted_all';
const meta = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf8'));

const inspectIds = [2, 4, 6, 13, 15, 17, 18, 20, 26, 28, 29, 33, 35, 37, 38, 39, 40, 41, 42, 43, 49, 50, 52, 53, 66, 69, 70, 76, 77, 82, 87, 90, 96, 98, 100];

for (const id of inspectIds) {
  const item = meta.find(m => m.id === id);
  if (item) {
    console.log(`ID #${id} (${item.filename}): ${item.w}x${item.h} at (${item.x}, ${item.y})`);
  }
}
