import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const MASTER_PATH = 'public/assets/assets.png';

async function main() {
  const meta = await sharp(MASTER_PATH).metadata();
  console.log('Master dimensions:', meta.width, meta.height);

  // Helper to extract a region
  async function extract(name, left, top, width, height, outDir = 'public/assets/extracted_debug') {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outPath = path.join(outDir, name);
    await sharp(MASTER_PATH)
      .extract({ left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) })
      .toFile(outPath);
    console.log(`Saved ${outPath} (${width}x${height})`);
    return outPath;
  }

  // Let's test extract the major sections to verify bounding boxes
  await extract('platforms_section.png', 1260, 35, 265, 195);
  await extract('props_section.png', 10, 550, 500, 140);
  await extract('collectibles_section.png', 525, 550, 260, 140);
  await extract('trees_section.png', 475, 265, 285, 255);
  await extract('bushes_section.png', 780, 265, 245, 255);
  await extract('rocks_section.png', 1035, 265, 215, 255);
  await extract('water_section.png', 1255, 265, 270, 255);
  await extract('interactables_section.png', 805, 550, 365, 140);
  await extract('clouds_section.png', 10, 715, 260, 115);
  await extract('mountains_section.png', 285, 715, 355, 115);
  await extract('forest_section.png', 655, 715, 305, 115);
  await extract('atmospheric_section.png', 975, 715, 220, 115);
  await extract('extra_section.png', 1210, 715, 315, 115);
  await extract('panorama_banner.png', 0, 855, 1536, 169);
  await extract('tiles_ground_section.png', 10, 35, 375, 195);
}

main().catch(console.error);
