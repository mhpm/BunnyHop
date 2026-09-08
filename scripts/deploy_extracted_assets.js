import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_DIR = 'public/assets/extracted_all';
const ENV_DIR = 'public/assets/environment';
const ITEMS_DIR = 'public/assets/items';
const BG_DIR = 'public/assets/background';

[ENV_DIR, ITEMS_DIR, BG_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function trimAndSave(srcFile, destPath, extraExtract = null) {
  let img = sharp(path.join(SRC_DIR, srcFile));
  if (extraExtract) {
    img = img.extract(extraExtract);
  }
  // Trim transparent borders
  await img.trim().png().toFile(destPath);
  console.log(`Saved: ${destPath}`);
}

async function main() {
  console.log('Deploying extracted assets from assets.png...');

  // 1. COLLECTIBLES
  // Carrot: asset_050.png
  await trimAndSave('asset_050.png', path.join(ITEMS_DIR, 'carrot_rich.png'));

  // Golden Carrot: asset_050.png with golden tint & glow
  const carrotBuf = await sharp(path.join(SRC_DIR, 'asset_050.png')).trim().toBuffer();
  await sharp(carrotBuf)
    .modulate({ hue: 40, saturation: 1.6, brightness: 1.25 })
    .png()
    .toFile(path.join(ITEMS_DIR, 'carrot_gold_rich.png'));
  console.log('Saved: carrot_gold_rich.png');

  // 2. PLATFORMS & GROUND
  // Floating island chunk: asset_076.png (185x79)
  await trimAndSave('asset_076.png', path.join(ENV_DIR, 'platform_float.png'));

  // Ground platform: asset_085.png (265x69)
  await trimAndSave('asset_085.png', path.join(ENV_DIR, 'ground_tile.png'));

  // Wooden platform: asset_090.png
  await trimAndSave('asset_090.png', path.join(ENV_DIR, 'platform_wood.png'));

  // Wooden crate: asset_035.png (68x57)
  await trimAndSave('asset_035.png', path.join(ENV_DIR, 'box_rich.png'));

  // 3. TREES & VEGETATION
  // Big lush tree: asset_002.png (308x356)
  await trimAndSave('asset_002.png', path.join(ENV_DIR, 'tree_rich.png'));

  // Alt tree: asset_004.png (282x348)
  await trimAndSave('asset_004.png', path.join(ENV_DIR, 'tree_alt.png'));

  // Bushes with daisies: asset_098.png & asset_066.png
  await trimAndSave('asset_098.png', path.join(ENV_DIR, 'bush_rich.png'));
  await trimAndSave('asset_066.png', path.join(ENV_DIR, 'bush_large.png'));

  // Crops
  await trimAndSave('asset_037.png', path.join(ENV_DIR, 'sunflower.png'));
  await trimAndSave('asset_038.png', path.join(ENV_DIR, 'corn.png'));
  await trimAndSave('asset_039.png', path.join(ENV_DIR, 'tomato.png'));
  await trimAndSave('asset_042.png', path.join(ENV_DIR, 'pumpkin.png'));
  await trimAndSave('asset_043.png', path.join(ENV_DIR, 'strawberry.png'));

  // 4. PROPS & FARM ARCHITECTURE
  // Windmill: asset_013.png (trim right margin slightly to avoid roof bleed)
  const wmMeta = await sharp(path.join(SRC_DIR, 'asset_013.png')).metadata();
  await trimAndSave('asset_013.png', path.join(ENV_DIR, 'windmill_rich.png'), {
    left: 0,
    top: 0,
    width: wmMeta.width - 10,
    height: wmMeta.height,
  });

  // Red Barn: asset_015.png (crop out hay bales on right and top sign)
  await trimAndSave('asset_015.png', path.join(ENV_DIR, 'barn_rich.png'), {
    left: 8,
    top: 12,
    width: 275,
    height: 210,
  });

  // Directional Sign: asset_017.png
  await trimAndSave('asset_017.png', path.join(ENV_DIR, 'sign_rich.png'));

  // Lantern post: asset_026.png
  await trimAndSave('asset_026.png', path.join(ENV_DIR, 'lantern_rich.png'));

  // Wooden fence: asset_029.png
  await trimAndSave('asset_029.png', path.join(ENV_DIR, 'fence_rich.png'));

  // White farm fence: asset_100.png
  await trimAndSave('asset_100.png', path.join(ENV_DIR, 'fence_white.png'));

  // Hay bale: asset_018.png
  await trimAndSave('asset_018.png', path.join(ENV_DIR, 'haystack_rich.png'));

  // Hay cart: asset_020.png
  await trimAndSave('asset_020.png', path.join(ENV_DIR, 'haycart_rich.png'));

  // Wooden barrel: asset_028.png
  await trimAndSave('asset_028.png', path.join(ENV_DIR, 'barrel_rich.png'));

  // Carrot sack: asset_033.png
  await trimAndSave('asset_033.png', path.join(ENV_DIR, 'carrot_sack.png'));

  // River stone / rock: asset_069.png
  await trimAndSave('asset_069.png', path.join(ENV_DIR, 'rock_rich.png'));

  // Water pond with lilies & cattails: asset_093.png
  await trimAndSave('asset_093.png', path.join(ENV_DIR, 'water_pond.png'));

  // 5. ANIMALS
  // Cow: asset_041.png (trim hay corner on bottom left)
  const cowMeta = await sharp(path.join(SRC_DIR, 'asset_041.png')).metadata();
  await trimAndSave('asset_041.png', path.join(ENV_DIR, 'cow.png'), {
    left: 12,
    top: 0,
    width: cowMeta.width - 12,
    height: cowMeta.height,
  });

  // Hen: asset_051.png
  await trimAndSave('asset_051.png', path.join(ENV_DIR, 'hen.png'));

  // Chick: asset_052.png
  await trimAndSave('asset_052.png', path.join(ENV_DIR, 'chick.png'));

  // 6. BACKGROUND
  // Sun: asset_006.png
  await trimAndSave('asset_006.png', path.join(BG_DIR, 'sun_rich.png'));

  // Clouds: asset_003.png
  await trimAndSave('asset_003.png', path.join(BG_DIR, 'clouds_rich.png'));

  // Mountains & hills: asset_001.png
  await trimAndSave('asset_001.png', path.join(BG_DIR, 'hills_rich.png'));

  console.log('All assets successfully deployed from assets.png!');
}

main().catch(console.error);
