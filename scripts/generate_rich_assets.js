import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = 'public/assets/environment';
const enemyDir = 'public/assets/sprites/enemies';
const itemDir = 'public/assets/items';
const bgDir = 'public/assets/background';

[outDir, enemyDir, itemDir, bgDir].forEach((d) => fs.mkdirSync(d, { recursive: true }));

async function svgToPng(svgString, outPath, width, height) {
  await sharp(Buffer.from(svgString))
    .resize(width, height)
    .png()
    .toFile(outPath);
  console.log(`Generated: ${outPath}`);
}

async function generateAll() {
  // ----------------------------------------------------
  // 1. FLOATING PLATFORM (Floating island from reference)
  // ----------------------------------------------------
  const platformSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" width="200" height="80">
    <!-- Dirt Base with organic rounded bottom -->
    <path d="M 10 20 
             Q 10 65 30 72 
             Q 100 76 170 72 
             Q 190 65 190 20 
             Z" 
          fill="#6D4C41" stroke="#3E2723" stroke-width="3" stroke-linejoin="round" />
    
    <!-- Dirt Shadows and Layers -->
    <path d="M 20 40 Q 100 50 180 40 Q 170 70 100 74 Q 30 70 20 40 Z" fill="#5D4037" />
    <path d="M 25 50 Q 100 60 175 50 Q 165 72 100 74 Q 35 72 25 50 Z" fill="#4E342E" />

    <!-- Embedded Pebbles in Dirt -->
    <ellipse cx="50" cy="55" rx="8" ry="5" fill="#8D6E63" stroke="#3E2723" stroke-width="1.5" />
    <ellipse cx="140" cy="58" rx="10" ry="6" fill="#795548" stroke="#3E2723" stroke-width="1.5" />
    <ellipse cx="95" cy="62" rx="6" ry="4" fill="#A1887F" stroke="#3E2723" stroke-width="1.5" />
    <ellipse cx="80" cy="45" rx="5" ry="3" fill="#8D6E63" />
    <ellipse cx="120" cy="48" rx="6" ry="4" fill="#8D6E63" />

    <!-- Lush Grass Clumps hanging down -->
    <!-- Dark green shadow layer behind grass lobes -->
    <path d="M 6 18
             Q 15 36 28 32
             Q 45 40 60 30
             Q 75 42 95 32
             Q 115 42 135 30
             Q 155 42 172 32
             Q 185 36 194 18
             L 194 8 Q 194 2 188 2
             L 12 2 Q 6 2 6 8 Z"
          fill="#33691E" stroke="#1B5E20" stroke-width="3" stroke-linejoin="round" />

    <!-- Main Vibrant Green Grass -->
    <path d="M 6 15
             Q 15 32 28 28
             Q 45 36 60 26
             Q 75 38 95 28
             Q 115 38 135 26
             Q 155 38 172 28
             Q 185 32 194 15
             L 194 6 Q 194 2 188 2
             L 12 2 Q 6 2 6 6 Z"
          fill="#4CAF50" />

    <!-- Bright Lime Highlight Curve on Top of Grass -->
    <path d="M 10 4 L 190 4 Q 192 4 192 7 L 192 9
             Q 155 24 135 16
             Q 115 26 95 18
             Q 75 28 60 18
             Q 45 26 28 18
             Q 15 22 8 9 L 8 7 Q 8 4 10 4 Z"
          fill="#8BC34A" />

    <!-- Soft White Sun Highlights on Grass Crest -->
    <ellipse cx="40" cy="6" rx="14" ry="2" fill="rgba(255,255,255,0.4)" />
    <ellipse cx="100" cy="6" rx="20" ry="2" fill="rgba(255,255,255,0.4)" />
    <ellipse cx="160" cy="6" rx="16" ry="2" fill="rgba(255,255,255,0.4)" />
  </svg>`;
  await svgToPng(platformSvg, `${outDir}/platform_float.png`, 200, 80);

  // ----------------------------------------------------
  // 2. SEAMLESS GROUND SURFACE (Lush grass with deep earthy cross section)
  // ----------------------------------------------------
  const groundSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96" width="128" height="96">
    <!-- Dirt Block -->
    <rect x="0" y="16" width="128" height="80" fill="#6D4C41" />
    <rect x="0" y="44" width="128" height="52" fill="#5D4037" />
    <rect x="0" y="70" width="128" height="26" fill="#4E342E" />

    <!-- Dirt Texture Pebbles -->
    <ellipse cx="20" cy="35" rx="7" ry="4" fill="#8D6E63" stroke="#3E2723" stroke-width="1.2" />
    <ellipse cx="85" cy="40" rx="9" ry="5" fill="#795548" stroke="#3E2723" stroke-width="1.2" />
    <ellipse cx="50" cy="65" rx="10" ry="6" fill="#795548" stroke="#3E2723" stroke-width="1.2" />
    <ellipse cx="110" cy="72" rx="7" ry="4" fill="#8D6E63" stroke="#3E2723" stroke-width="1.2" />
    <ellipse cx="30" cy="82" rx="5" ry="3" fill="#6D4C41" />
    <ellipse cx="80" cy="85" rx="8" ry="4" fill="#6D4C41" />

    <!-- Grass Base Shadow -->
    <path d="M 0 16
             Q 16 32 32 24
             Q 48 34 64 24
             Q 80 34 96 24
             Q 112 32 128 24
             L 128 0 L 0 0 Z"
          fill="#33691E" stroke="#1B5E20" stroke-width="2.5" />

    <!-- Vibrant Grass Body -->
    <path d="M 0 14
             Q 16 28 32 20
             Q 48 30 64 20
             Q 80 30 96 20
             Q 112 28 128 20
             L 128 0 L 0 0 Z"
          fill="#4CAF50" />

    <!-- Lime Top Highlights -->
    <path d="M 0 0 L 128 0 L 128 8
             Q 112 18 96 12
             Q 80 20 64 12
             Q 48 20 32 12
             Q 16 18 0 10 Z"
          fill="#8BC34A" />

    <!-- Sun Gleam Line -->
    <line x1="0" y1="2" x2="128" y2="2" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
  </svg>`;
  await svgToPng(groundSvg, `${outDir}/ground_tile.png`, 128, 96);

  // ----------------------------------------------------
  // 3. CARTOON OAK TREE (From reference)
  // ----------------------------------------------------
  const treeSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 180" width="140" height="180">
    <!-- Trunk with curved roots and wood bark lines -->
    <path d="M 52 180
             Q 56 120 54 85
             L 86 85
             Q 84 120 88 180
             Z"
          fill="#6D4C41" stroke="#3E2723" stroke-width="3" stroke-linejoin="round" />
    <!-- Trunk shadow & bark -->
    <path d="M 54 90 Q 56 130 53 180 L 64 180 Q 66 130 64 90 Z" fill="#5D4037" />
    <path d="M 74 95 Q 76 135 73 180 L 78 180 Q 80 135 78 95 Z" fill="#5D4037" />

    <!-- Branch left -->
    <path d="M 56 110 Q 38 100 32 90 Q 42 94 56 100 Z" fill="#6D4C41" stroke="#3E2723" stroke-width="2" />

    <!-- Canopy: Multi-layered cloud-like spheres -->
    <!-- Dark Green Base Canopy Shadow -->
    <circle cx="70" cy="65" r="48" fill="#2E7D32" stroke="#1B5E20" stroke-width="3" />
    <circle cx="42" cy="72" r="32" fill="#2E7D32" stroke="#1B5E20" stroke-width="3" />
    <circle cx="98" cy="72" r="32" fill="#2E7D32" stroke="#1B5E20" stroke-width="3" />

    <!-- Main Green Foliage -->
    <circle cx="70" cy="58" r="44" fill="#43A047" />
    <circle cx="42" cy="66" r="28" fill="#43A047" />
    <circle cx="98" cy="66" r="28" fill="#43A047" />
    <circle cx="70" cy="40" r="34" fill="#4CAF50" />

    <!-- Light Lime Highlights -->
    <circle cx="64" cy="32" r="26" fill="#81C784" />
    <circle cx="38" cy="58" r="18" fill="#81C784" />
    <circle cx="96" cy="58" r="18" fill="#81C784" />

    <!-- Sunny White Shimmer -->
    <ellipse cx="60" cy="24" rx="14" ry="7" fill="rgba(255,255,255,0.4)" />
  </svg>`;
  await svgToPng(treeSvg, `${outDir}/tree_rich.png`, 140, 180);

  // ----------------------------------------------------
  // 4. FLUFFY BUSH WITH FLOWERS (From reference)
  // ----------------------------------------------------
  const bushSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 54" width="90" height="54">
    <!-- Bush Silhouette -->
    <circle cx="28" cy="32" r="22" fill="#2E7D32" stroke="#1B5E20" stroke-width="2.5" />
    <circle cx="62" cy="32" r="22" fill="#2E7D32" stroke="#1B5E20" stroke-width="2.5" />
    <circle cx="45" cy="24" r="24" fill="#2E7D32" stroke="#1B5E20" stroke-width="2.5" />

    <!-- Main Green -->
    <circle cx="28" cy="30" r="20" fill="#4CAF50" />
    <circle cx="62" cy="30" r="20" fill="#4CAF50" />
    <circle cx="45" cy="22" r="21" fill="#66BB6A" />

    <!-- Highlights -->
    <circle cx="45" cy="16" r="14" fill="#81C784" />

    <!-- Little Cute White Flowers with Yellow Centers -->
    <g transform="translate(24, 24)">
      <circle cx="0" cy="0" r="4" fill="#FFF" />
      <circle cx="0" cy="0" r="1.8" fill="#FFCA28" />
    </g>
    <g transform="translate(64, 28)">
      <circle cx="0" cy="0" r="4" fill="#FFF" />
      <circle cx="0" cy="0" r="1.8" fill="#FFCA28" />
    </g>
    <g transform="translate(46, 36)">
      <circle cx="0" cy="0" r="3.5" fill="#FFF" />
      <circle cx="0" cy="0" r="1.5" fill="#FFCA28" />
    </g>
  </svg>`;
  await svgToPng(bushSvg, `${outDir}/bush_rich.png`, 90, 54);

  // ----------------------------------------------------
  // 5. WOODEN FENCE (From reference)
  // ----------------------------------------------------
  const fenceSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 44" width="80" height="44">
    <!-- Cross rails -->
    <rect x="0" y="12" width="80" height="7" fill="#8D6E63" stroke="#4E342E" stroke-width="2" />
    <rect x="0" y="26" width="80" height="7" fill="#8D6E63" stroke="#4E342E" stroke-width="2" />

    <!-- 3 Pickets with pointed tops -->
    <path d="M 10 44 L 10 10 L 16 4 L 22 10 L 22 44 Z" fill="#A1887F" stroke="#4E342E" stroke-width="2" stroke-linejoin="round" />
    <path d="M 37 44 L 37 10 L 43 4 L 49 10 L 49 44 Z" fill="#A1887F" stroke="#4E342E" stroke-width="2" stroke-linejoin="round" />
    <path d="M 64 44 L 64 10 L 70 4 L 76 10 L 76 44 Z" fill="#A1887F" stroke="#4E342E" stroke-width="2" stroke-linejoin="round" />

    <!-- Nails -->
    <circle cx="16" cy="15" r="1.5" fill="#3E2723" />
    <circle cx="16" cy="29" r="1.5" fill="#3E2723" />
    <circle cx="43" cy="15" r="1.5" fill="#3E2723" />
    <circle cx="43" cy="29" r="1.5" fill="#3E2723" />
    <circle cx="70" cy="15" r="1.5" fill="#3E2723" />
    <circle cx="70" cy="29" r="1.5" fill="#3E2723" />
  </svg>`;
  await svgToPng(fenceSvg, `${outDir}/fence_rich.png`, 80, 44);

  // ----------------------------------------------------
  // 6. MOSSY ROCKS (From reference)
  // ----------------------------------------------------
  const rockSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 40" width="70" height="40">
    <!-- Big Rock -->
    <ellipse cx="44" cy="24" rx="22" ry="14" fill="#78909C" stroke="#37474F" stroke-width="2" />
    <ellipse cx="42" cy="22" rx="18" ry="10" fill="#90A4AE" />

    <!-- Small Rock -->
    <ellipse cx="18" cy="28" rx="14" ry="10" fill="#607D8B" stroke="#37474F" stroke-width="2" />
    <ellipse cx="17" cy="26" rx="11" ry="7" fill="#78909C" />

    <!-- Green Moss on Rocks -->
    <path d="M 32 14 Q 44 8 56 15 Q 50 18 42 16 Q 36 20 32 14 Z" fill="#8BC34A" stroke="#558B2F" stroke-width="1.5" />
    <ellipse cx="16" cy="22" rx="6" ry="3" fill="#8BC34A" />
  </svg>`;
  await svgToPng(rockSvg, `${outDir}/rock_rich.png`, 70, 40);

  // ----------------------------------------------------
  // 7. CARROT WOODEN SIGNPOST (From reference)
  // ----------------------------------------------------
  const signSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 64" width="54" height="64">
    <!-- Post -->
    <rect x="23" y="24" width="8" height="40" fill="#6D4C41" stroke="#3E2723" stroke-width="2" />
    <!-- Board -->
    <rect x="4" y="6" width="46" height="30" rx="4" fill="#A1887F" stroke="#4E342E" stroke-width="2.5" />
    <rect x="7" y="9" width="40" height="24" rx="2" fill="#8D6E63" />

    <!-- Carved Orange Carrot Icon -->
    <path d="M 27 28 Q 23 20 23 14 L 31 14 Q 31 20 27 28 Z" fill="#FF9800" stroke="#E65100" stroke-width="1.5" />
    <!-- Leaf -->
    <path d="M 27 14 L 25 10 L 27 12 L 29 10 Z" stroke="#4CAF50" stroke-width="2" fill="none" stroke-linecap="round" />
  </svg>`;
  await svgToPng(signSvg, `${outDir}/sign_rich.png`, 54, 64);

  // ----------------------------------------------------
  // 8. WOODEN CRATE (From reference)
  // ----------------------------------------------------
  const boxSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
    <rect x="2" y="2" width="44" height="44" rx="3" fill="#A1887F" stroke="#4E342E" stroke-width="3" />
    <!-- Planks border -->
    <rect x="7" y="7" width="34" height="34" fill="#8D6E63" stroke="#4E342E" stroke-width="2" />
    <!-- Cross braces X -->
    <line x1="7" y1="7" x2="41" y2="41" stroke="#4E342E" stroke-width="3" />
    <line x1="41" y1="7" x2="7" y2="41" stroke="#4E342E" stroke-width="3" />
    <line x1="7" y1="7" x2="41" y2="41" stroke="#A1887F" stroke-width="1.5" />
    <line x1="41" y1="7" x2="7" y2="41" stroke="#A1887F" stroke-width="1.5" />
    <!-- Rivets -->
    <circle cx="5" cy="5" r="2" fill="#3E2723" />
    <circle cx="43" cy="5" r="2" fill="#3E2723" />
    <circle cx="5" cy="43" r="2" fill="#3E2723" />
    <circle cx="43" cy="43" r="2" fill="#3E2723" />
  </svg>`;
  await svgToPng(boxSvg, `${outDir}/box_rich.png`, 48, 48);

  // ----------------------------------------------------
  // 9. CARROT & GOLDEN CARROT (From reference)
  // ----------------------------------------------------
  const carrotSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
    <!-- Green Leaves -->
    <path d="M 20 18 Q 12 10 10 2 Q 18 8 20 16 Z" fill="#4CAF50" stroke="#2E7D32" stroke-width="1.5" />
    <path d="M 20 18 Q 20 6 20 0 Q 24 6 20 16 Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.5" />
    <path d="M 20 18 Q 28 10 30 2 Q 22 8 20 16 Z" fill="#4CAF50" stroke="#2E7D32" stroke-width="1.5" />

    <!-- Orange Body -->
    <path d="M 12 18 Q 10 32 20 48 Q 30 32 28 18 Q 20 14 12 18 Z" fill="#FF9800" stroke="#E65100" stroke-width="2.5" stroke-linejoin="round" />

    <!-- Ridges -->
    <path d="M 14 24 Q 20 22 24 24" stroke="#F57C00" stroke-width="2" stroke-linecap="round" fill="none" />
    <path d="M 16 32 Q 20 30 23 32" stroke="#F57C00" stroke-width="2" stroke-linecap="round" fill="none" />
    <path d="M 18 40 Q 20 38 22 40" stroke="#F57C00" stroke-width="1.5" stroke-linecap="round" fill="none" />

    <!-- Specular Highlight -->
    <path d="M 15 20 Q 14 28 17 38" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round" fill="none" />
  </svg>`;
  await svgToPng(carrotSvg, `${itemDir}/carrot_rich.png`, 40, 50);

  const goldCarrotSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 56" width="46" height="56">
    <!-- Golden Aura Glow -->
    <circle cx="23" cy="28" r="22" fill="rgba(255, 235, 59, 0.35)" />

    <!-- Golden Leaves -->
    <path d="M 23 18 Q 15 10 13 2 Q 21 8 23 16 Z" fill="#D4E157" stroke="#9E9D24" stroke-width="1.5" />
    <path d="M 23 18 Q 23 6 23 0 Q 27 6 23 16 Z" fill="#FFEE58" stroke="#9E9D24" stroke-width="1.5" />
    <path d="M 23 18 Q 31 10 33 2 Q 25 8 23 16 Z" fill="#D4E157" stroke="#9E9D24" stroke-width="1.5" />

    <!-- Shiny Gold Body -->
    <path d="M 15 18 Q 13 32 23 48 Q 33 32 31 18 Q 23 14 15 18 Z" fill="#FFD700" stroke="#FF8F00" stroke-width="2.5" stroke-linejoin="round" />

    <!-- Gold Ridges -->
    <path d="M 17 24 Q 23 22 27 24" stroke="#FFA000" stroke-width="2" stroke-linecap="round" fill="none" />
    <path d="M 19 32 Q 23 30 26 32" stroke="#FFA000" stroke-width="2" stroke-linecap="round" fill="none" />

    <!-- Sparkle Stars -->
    <polygon points="8,16 10,12 14,14 11,17 12,21 9,18 5,19 7,16" fill="#FFF" />
    <polygon points="36,36 38,32 42,34 39,37 40,41 37,38 33,39 35,36" fill="#FFF" />
    <path d="M 18 20 Q 17 28 20 38" stroke="rgba(255,255,255,0.85)" stroke-width="3" stroke-linecap="round" fill="none" />
  </svg>`;
  await svgToPng(goldCarrotSvg, `${itemDir}/carrot_gold_rich.png`, 46, 56);

  // ----------------------------------------------------
  // 10. LADYBUG (MARIQUITA) - From reference
  // ----------------------------------------------------
  const ladybugWalkSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 40" width="54" height="40">
    <!-- Little Black Legs -->
    <path d="M 14 28 L 8 36 M 24 30 L 22 38 M 34 28 L 38 36" stroke="#212121" stroke-width="3" stroke-linecap="round" />

    <!-- Shiny Red Dome Shell -->
    <path d="M 6 26 Q 8 6 28 6 Q 48 6 48 26 Z" fill="#E53935" stroke="#B71C1C" stroke-width="2.5" stroke-linejoin="round" />

    <!-- Black Spots -->
    <circle cx="16" cy="18" r="3.5" fill="#212121" />
    <circle cx="26" cy="12" r="3.5" fill="#212121" />
    <circle cx="36" cy="18" r="3.5" fill="#212121" />
    <circle cx="28" cy="22" r="2.5" fill="#212121" />

    <!-- Cute Black Head -->
    <ellipse cx="44" cy="23" rx="8" ry="7" fill="#212121" stroke="#000" stroke-width="1.5" />
    <!-- White Eye with black pupil and shine -->
    <ellipse cx="46" cy="21" rx="3.5" ry="3.5" fill="#FFF" />
    <circle cx="47" cy="21" r="2" fill="#212121" />
    <circle cx="48" cy="20" r="0.9" fill="#FFF" />

    <!-- Cute Antennae -->
    <path d="M 48 18 Q 53 14 52 10" stroke="#212121" stroke-width="2" stroke-linecap="round" fill="none" />
    <circle cx="52" cy="10" r="1.5" fill="#212121" />

    <!-- Shell Gloss Highlight -->
    <path d="M 12 12 Q 22 8 32 8" stroke="rgba(255,255,255,0.6)" stroke-width="2.5" stroke-linecap="round" fill="none" />
  </svg>`;
  await svgToPng(ladybugWalkSvg, `${enemyDir}/ladybug_walk.png`, 54, 40);

  const ladybugSquashSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 22" width="54" height="22">
    <!-- Squashed Flat Ladybug -->
    <ellipse cx="27" cy="14" rx="24" ry="7" fill="#E53935" stroke="#B71C1C" stroke-width="2" />
    <ellipse cx="42" cy="14" rx="8" ry="5" fill="#212121" />
    <circle cx="16" cy="14" r="2.5" fill="#212121" />
    <circle cx="28" cy="14" r="2.5" fill="#212121" />
    <!-- X X dizzy eye -->
    <line x1="40" y1="12" x2="44" y2="16" stroke="#FFF" stroke-width="1.5" />
    <line x1="44" y1="12" x2="40" y2="16" stroke="#FFF" stroke-width="1.5" />
  </svg>`;
  await svgToPng(ladybugSquashSvg, `${enemyDir}/ladybug_squash.png`, 54, 22);

  // ----------------------------------------------------
  // 11. CATERPILLAR (ORUGA) - From reference
  // ----------------------------------------------------
  const caterpillarWalkSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" width="60" height="40">
    <!-- 4 Segmented Green Spheres with Black Outlines -->
    <circle cx="12" cy="24" r="8" fill="#7CB342" stroke="#33691E" stroke-width="2" />
    <circle cx="24" cy="22" r="9" fill="#8BC34A" stroke="#33691E" stroke-width="2" />
    <circle cx="36" cy="24" r="9" fill="#7CB342" stroke="#33691E" stroke-width="2" />
    <!-- Head -->
    <circle cx="48" cy="20" r="10" fill="#8BC34A" stroke="#33691E" stroke-width="2" />

    <!-- Antennae with yellow tips -->
    <path d="M 46 12 Q 44 4 40 2" stroke="#33691E" stroke-width="2" stroke-linecap="round" fill="none" />
    <circle cx="40" cy="2" r="2" fill="#FFEB3B" />
    <path d="M 50 12 Q 52 4 56 3" stroke="#33691E" stroke-width="2" stroke-linecap="round" fill="none" />
    <circle cx="56" cy="3" r="2" fill="#FFEB3B" />

    <!-- Cute Big Eyes with shine -->
    <circle cx="51" cy="18" r="3.5" fill="#FFF" />
    <circle cx="52" cy="18" r="2" fill="#212121" />
    <circle cx="53" cy="17" r="1" fill="#FFF" />

    <!-- Cute Smile -->
    <path d="M 52 24 Q 50 26 48 24" stroke="#212121" stroke-width="1.5" stroke-linecap="round" fill="none" />

    <!-- Little Yellow Feet -->
    <circle cx="12" cy="32" r="3" fill="#FFCA28" stroke="#33691E" stroke-width="1" />
    <circle cx="24" cy="31" r="3" fill="#FFCA28" stroke="#33691E" stroke-width="1" />
    <circle cx="36" cy="32" r="3" fill="#FFCA28" stroke="#33691E" stroke-width="1" />
  </svg>`;
  await svgToPng(caterpillarWalkSvg, `${enemyDir}/caterpillar_walk.png`, 60, 40);

  const caterpillarSquashSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 22" width="60" height="22">
    <!-- Squashed Caterpillar Accordion -->
    <ellipse cx="12" cy="14" rx="7" ry="5" fill="#7CB342" stroke="#33691E" stroke-width="1.5" />
    <ellipse cx="24" cy="14" rx="7" ry="5" fill="#8BC34A" stroke="#33691E" stroke-width="1.5" />
    <ellipse cx="36" cy="14" rx="7" ry="5" fill="#7CB342" stroke="#33691E" stroke-width="1.5" />
    <ellipse cx="48" cy="14" rx="8" ry="6" fill="#8BC34A" stroke="#33691E" stroke-width="1.5" />
    <!-- X X Eye -->
    <line x1="46" y1="12" x2="50" y2="16" stroke="#212121" stroke-width="1.5" />
    <line x1="50" y1="12" x2="46" y2="16" stroke="#212121" stroke-width="1.5" />
  </svg>`;
  await svgToPng(caterpillarSquashSvg, `${enemyDir}/caterpillar_squash.png`, 60, 22);

  // ----------------------------------------------------
  // 12. SNAIL (CARACOL) - From reference
  // ----------------------------------------------------
  const snailWalkSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 42" width="56" height="42">
    <!-- Beige Body with tail and eyestalk -->
    <path d="M 6 34 Q 24 32 40 33 Q 48 33 50 24 Q 52 14 48 10 Q 45 10 44 14 Q 44 26 36 30 L 6 34 Z" fill="#FFE0B2" stroke="#A1887F" stroke-width="2" stroke-linejoin="round" />
    <!-- Big Eye on stalk -->
    <circle cx="48" cy="10" r="4" fill="#FFF" stroke="#A1887F" stroke-width="1.5" />
    <circle cx="49" cy="10" r="2" fill="#212121" />
    <circle cx="50" cy="9" r="1" fill="#FFF" />

    <!-- Cute Brown Spiral Shell -->
    <ellipse cx="22" cy="22" rx="16" ry="14" fill="#8D6E63" stroke="#4E342E" stroke-width="2.5" />
    <ellipse cx="22" cy="22" rx="11" ry="9" fill="#A1887F" stroke="#4E342E" stroke-width="2" />
    <ellipse cx="22" cy="22" rx="6" ry="5" fill="#6D4C41" stroke="#4E342E" stroke-width="2" />
  </svg>`;
  await svgToPng(snailWalkSvg, `${enemyDir}/snail_walk.png`, 56, 42);

  const snailSquashSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 30" width="56" height="30">
    <!-- Snail retracted in shell -->
    <ellipse cx="28" cy="16" rx="20" ry="12" fill="#8D6E63" stroke="#4E342E" stroke-width="2.5" />
    <ellipse cx="28" cy="16" rx="14" ry="8" fill="#A1887F" stroke="#4E342E" stroke-width="2" />
    <ellipse cx="28" cy="16" rx="8" ry="4" fill="#6D4C41" stroke="#4E342E" stroke-width="1.5" />
  </svg>`;
  await svgToPng(snailSquashSvg, `${enemyDir}/snail_squash.png`, 56, 30);

  // ----------------------------------------------------
  // 13. PARALLAX BACKGROUND LAYERS
  // ----------------------------------------------------
  // Sky gradient with sun
  const skySvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4FC3F7" />
        <stop offset="60%" stop-color="#B3E5FC" />
        <stop offset="100%" stop-color="#FFF9C4" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#skyGrad)" />
    <!-- Sun glow in upper right -->
    <circle cx="680" cy="120" r="90" fill="rgba(255,255,255,0.18)" />
    <circle cx="680" cy="120" r="55" fill="rgba(255,245,157,0.45)" />
    <circle cx="680" cy="120" r="32" fill="#FFFDE7" />
  </svg>`;
  await svgToPng(skySvg, `${bgDir}/sky_rich.png`, 800, 600);

  // Fluffy clouds layer
  const cloudsSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240" width="800" height="240">
    <!-- Cloud 1 -->
    <g transform="translate(120, 80) scale(1.2)">
      <ellipse cx="0" cy="12" rx="42" ry="20" fill="rgba(207,216,220,0.5)" />
      <circle cx="-25" cy="0" r="22" fill="#FFF" />
      <circle cx="0" cy="-8" r="28" fill="#FFF" />
      <circle cx="25" cy="0" r="22" fill="#FFF" />
      <ellipse cx="0" cy="10" rx="38" ry="16" fill="#FFF" />
    </g>
    <!-- Cloud 2 -->
    <g transform="translate(420, 130) scale(0.95)">
      <ellipse cx="0" cy="12" rx="42" ry="20" fill="rgba(207,216,220,0.5)" />
      <circle cx="-25" cy="0" r="22" fill="#FFF" />
      <circle cx="0" cy="-8" r="28" fill="#FFF" />
      <circle cx="25" cy="0" r="22" fill="#FFF" />
      <ellipse cx="0" cy="10" rx="38" ry="16" fill="#FFF" />
    </g>
    <!-- Cloud 3 -->
    <g transform="translate(700, 70) scale(1.3)">
      <ellipse cx="0" cy="12" rx="42" ry="20" fill="rgba(207,216,220,0.5)" />
      <circle cx="-25" cy="0" r="22" fill="#FFF" />
      <circle cx="0" cy="-8" r="28" fill="#FFF" />
      <circle cx="25" cy="0" r="22" fill="#FFF" />
      <ellipse cx="0" cy="10" rx="38" ry="16" fill="#FFF" />
    </g>
  </svg>`;
  await svgToPng(cloudsSvg, `${bgDir}/clouds_rich.png`, 800, 240);

  // Distant pastel rolling hills with windmill and cottage
  const hillsSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 320" width="1000" height="320">
    <!-- Back Hill (Pale teal-green) -->
    <path d="M 0 320
             Q 250 140 500 220
             Q 750 150 1000 240
             L 1000 320 Z"
          fill="#A5D6A7" opacity="0.85" />

    <!-- Front Hill (Vibrant mint meadow) -->
    <path d="M 0 320
             Q 300 170 600 250
             Q 800 180 1000 270
             L 1000 320 Z"
          fill="#81C784" />

    <!-- Cute Distant Windmill on the hill -->
    <g transform="translate(260, 160)">
      <polygon points="-12,45 -6,0 6,0 12,45" fill="#795548" stroke="#4E342E" stroke-width="2" />
      <circle cx="0" cy="0" r="3.5" fill="#3E2723" />
      <!-- 4 Blades -->
      <line x1="-24" y1="-24" x2="24" y2="24" stroke="#4E342E" stroke-width="2.5" />
      <line x1="-24" y1="24" x2="24" y2="-24" stroke="#4E342E" stroke-width="2.5" />
      <polygon points="-24,-24 -14,-14 -10,-18 -20,-28" fill="#FFF8E1" stroke="#4E342E" stroke-width="1" />
      <polygon points="24,24 14,14 10,18 20,28" fill="#FFF8E1" stroke="#4E342E" stroke-width="1" />
      <polygon points="-24,24 -14,14 -10,18 -20,28" fill="#FFF8E1" stroke="#4E342E" stroke-width="1" />
      <polygon points="24,-24 14,-14 10,-18 20,-28" fill="#FFF8E1" stroke="#4E342E" stroke-width="1" />
    </g>

    <!-- Cute Distant Cottage with chimney -->
    <g transform="translate(720, 210)">
      <rect x="-16" y="0" width="32" height="24" fill="#FFF3E0" stroke="#795548" stroke-width="2" />
      <polygon points="-20,0 0,-16 20,0" fill="#E53935" stroke="#B71C1C" stroke-width="2" />
      <rect x="8" y="-18" width="6" height="10" fill="#795548" />
    </g>
  </svg>`;
  await svgToPng(hillsSvg, `${bgDir}/hills_rich.png`, 1000, 320);

  // Midground green tree ridge
  const midTreesSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 160" width="800" height="160">
    <path d="M 0 160
             Q 50 110 100 120
             Q 150 90 220 110
             Q 300 80 380 115
             Q 460 85 540 120
             Q 620 90 700 110
             Q 750 95 800 115
             L 800 160 Z"
          fill="#66BB6A" opacity="0.9" />
    <!-- Rounded leafy tree crowns -->
    <circle cx="80" cy="115" r="30" fill="#4CAF50" />
    <circle cx="190" cy="100" r="35" fill="#43A047" />
    <circle cx="340" cy="95" r="40" fill="#4CAF50" />
    <circle cx="500" cy="100" r="38" fill="#43A047" />
    <circle cx="660" cy="105" r="32" fill="#4CAF50" />
  </svg>`;
  await svgToPng(midTreesSvg, `${bgDir}/midtrees_rich.png`, 800, 160);

  console.log('ALL RICH ENVIRONMENT ASSETS GENERATED SUCCESSFULLY!');
}

generateAll();
