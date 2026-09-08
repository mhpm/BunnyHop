import Phaser from 'phaser';

/**
 * Procedural Asset Generator for Bunny Hop
 * Generates ultra-crisp vector-style 2D cartoon textures matching the reference sheet
 * with 100% fidelity directly into Phaser's TextureManager.
 */

export class AssetGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    // Player textures are loaded from the official 8-frame spritesheets in PreloadScene
    this.createEnemyTextures(scene);
    this.createCollectibleTextures(scene);
    this.createEnvironmentTextures(scene);
    this.createBackgroundTextures(scene);
    this.createParticleTextures(scene);
  }

  // Helper to create a canvas texture in Phaser
  private static makeCanvas(
    scene: Phaser.Scene,
    key: string,
    width: number,
    height: number,
    drawFn: (ctx: CanvasRenderingContext2D) => void
  ): void {
    if (scene.textures.exists(key)) return;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      drawFn(ctx);
      scene.textures.addCanvas(key, canvas);
    }
  }

  // ----------------------------------------------------
  // ENEMIES (MARIQUITA, ORUGA, CARACOL, ESCARABAJO)
  // ----------------------------------------------------
  private static createEnemyTextures(scene: Phaser.Scene): void {
    const w = 48;
    const h = 48;

    // --- ENEMY 1: MARIQUITA (LADYBUG) ---
    // Walk 1
    this.makeCanvas(scene, 'enemy_ladybug_0', w, h, (ctx) => {
      this.drawLadybug(ctx, w, h, 0);
    });
    // Walk 2
    this.makeCanvas(scene, 'enemy_ladybug_1', w, h, (ctx) => {
      this.drawLadybug(ctx, w, h, 1);
    });
    // Squashed
    this.makeCanvas(scene, 'enemy_ladybug_squash', w, h, (ctx) => {
      ctx.save();
      ctx.translate(w / 2, h - 10);
      // Flattened shell
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Spots
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(-8, -1, 2, 0, Math.PI * 2);
      ctx.arc(8, -1, 2, 0, Math.PI * 2);
      ctx.arc(0, 1, 2, 0, Math.PI * 2);
      ctx.fill();
      // Squashed head
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.ellipse(16, 0, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dizzy eyes
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(15, -2);
      ctx.lineTo(18, 1);
      ctx.moveTo(18, -2);
      ctx.lineTo(15, 1);
      ctx.stroke();
      ctx.restore();
    });

    // --- ENEMY 2: ORUGA (CATERPILLAR) ---
    this.makeCanvas(scene, 'enemy_caterpillar_0', w, h, (ctx) => {
      this.drawCaterpillar(ctx, w, h, 0);
    });
    this.makeCanvas(scene, 'enemy_caterpillar_1', w, h, (ctx) => {
      this.drawCaterpillar(ctx, w, h, 1);
    });
    this.makeCanvas(scene, 'enemy_caterpillar_squash', w, h, (ctx) => {
      ctx.save();
      ctx.translate(w / 2, h - 8);
      // Flattened segmented body
      ctx.fillStyle = '#7CB342';
      for (let i = -16; i <= 16; i += 8) {
        ctx.beginPath();
        ctx.ellipse(i, 0, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Dead 'X X' eye
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(14, -2);
      ctx.lineTo(18, 2);
      ctx.moveTo(18, -2);
      ctx.lineTo(14, 2);
      ctx.stroke();
      ctx.restore();
    });

    // --- ENEMY 3: CARACOL (SNAIL) ---
    this.makeCanvas(scene, 'enemy_snail_0', w, h, (ctx) => {
      this.drawSnail(ctx, w, h, 0);
    });
    this.makeCanvas(scene, 'enemy_snail_1', w, h, (ctx) => {
      this.drawSnail(ctx, w, h, 1);
    });
    this.makeCanvas(scene, 'enemy_snail_squash', w, h, (ctx) => {
      ctx.save();
      ctx.translate(w / 2, h - 12);
      // Shell flat
      ctx.fillStyle = '#8D6E63';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4E342E';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Spiral
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();
    });

    // --- ENEMY 4: ARMORED BEETLE (ESCARABAJO) ---
    this.makeCanvas(scene, 'enemy_beetle_0', w, h, (ctx) => {
      this.drawBeetle(ctx, w, h, 0);
    });
    this.makeCanvas(scene, 'enemy_beetle_1', w, h, (ctx) => {
      this.drawBeetle(ctx, w, h, 1);
    });
    this.makeCanvas(scene, 'enemy_beetle_squash', w, h, (ctx) => {
      ctx.save();
      ctx.translate(w / 2, h - 10);
      ctx.fillStyle = '#37474F';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });
  }

  private static drawLadybug(ctx: CanvasRenderingContext2D, w: number, h: number, step: number): void {
    ctx.save();
    ctx.translate(w / 2, h / 2 + 6);

    // Legs
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 2;
    const legOffset = step === 0 ? 2 : -2;
    [-8, 0, 8].forEach((lx) => {
      ctx.beginPath();
      ctx.moveTo(lx, 6);
      ctx.lineTo(lx + legOffset, 12);
      ctx.stroke();
    });

    // Red Shell
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.arc(0, 0, 14, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Black Spots
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(-7, -5, 2.5, 0, Math.PI * 2);
    ctx.arc(-2, -9, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -5, 2.5, 0, Math.PI * 2);
    ctx.arc(7, -1, 2, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(12, 1, 6, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(14, -1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(15, -1, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Antennae
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(14, -3);
    ctx.quadraticCurveTo(18, -8, 20, -6);
    ctx.stroke();

    ctx.restore();
  }

  private static drawCaterpillar(ctx: CanvasRenderingContext2D, w: number, h: number, step: number): void {
    ctx.save();
    ctx.translate(w / 2, h / 2 + 8);

    const undulation = step === 0 ? 0 : 2;
    // 4 Segments
    const segments = [
      { x: -14, y: 0, r: 6 },
      { x: -6, y: -undulation, r: 7 },
      { x: 2, y: 0, r: 7 },
      { x: 10, y: -2, r: 8 }, // Head
    ];

    segments.forEach((seg, idx) => {
      ctx.fillStyle = idx === 3 ? '#8BC34A' : '#7CB342';
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, seg.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#558B2F';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Belly feet
      ctx.fillStyle = '#FFCA28';
      ctx.beginPath();
      ctx.arc(seg.x, seg.y + seg.r, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Head details (seg index 3)
    const head = segments[3];
    // Eye
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(head.x + 3, head.y - 2, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(head.x + 4, head.y - 2, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Antennae
    ctx.strokeStyle = '#558B2F';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(head.x + 1, head.y - 7);
    ctx.lineTo(head.x + 3, head.y - 12);
    ctx.stroke();
    ctx.fillStyle = '#FFCA28';
    ctx.beginPath();
    ctx.arc(head.x + 3, head.y - 12, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private static drawSnail(ctx: CanvasRenderingContext2D, w: number, h: number, _step: number): void {
    ctx.save();
    ctx.translate(w / 2, h / 2 + 8);

    // Slug body (beige/cream)
    ctx.fillStyle = '#FFE0B2';
    ctx.beginPath();
    ctx.moveTo(-16, 6);
    ctx.quadraticCurveTo(0, 4, 14, 5);
    ctx.quadraticCurveTo(18, -2, 16, -6); // Eyestalk
    ctx.lineTo(13, 0);
    ctx.lineTo(-14, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#BCAAA4';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eyestalk & Eye
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(16, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(17, -6, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Shell (Spiral Brown)
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.arc(-2, -2, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shell Spiral line
    ctx.strokeStyle = '#D7CCC8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-2, -2, 6, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.restore();
  }

  private static drawBeetle(ctx: CanvasRenderingContext2D, w: number, h: number, step: number): void {
    ctx.save();
    ctx.translate(w / 2, h / 2 + 6);

    // Legs
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 2.5;
    const legOffset = step === 0 ? 2 : -2;
    [-8, 0, 8].forEach((lx) => {
      ctx.beginPath();
      ctx.moveTo(lx, 6);
      ctx.lineTo(lx + legOffset, 13);
      ctx.stroke();
    });

    // Spiky Purple-Gray Carapace
    ctx.fillStyle = '#455A64';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Spikes on back
    ctx.fillStyle = '#37474F';
    const spikes = [-8, -2, 4];
    spikes.forEach((sx) => {
      ctx.beginPath();
      ctx.moveTo(sx - 3, -8);
      ctx.lineTo(sx, -15);
      ctx.lineTo(sx + 3, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Glowing eyes
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(11, -1, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ----------------------------------------------------
  // COLLECTIBLES & PROPS
  // ----------------------------------------------------
  private static createCollectibleTextures(scene: Phaser.Scene): void {
    // 1. Carrot (Standard +1)
    this.makeCanvas(scene, 'item_carrot', 32, 32, (ctx) => {
      ctx.save();
      ctx.translate(16, 16);

      // Green Leafy Greens (Top)
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.ellipse(-4, -10, 3, 6, -0.3, 0, Math.PI * 2);
      ctx.ellipse(0, -12, 3.5, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(4, -10, 3, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Orange Carrot Body
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.quadraticCurveTo(-7, 2, 0, 13);
      ctx.quadraticCurveTo(7, 2, 6, -6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#E65100';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ridges
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 1;
      [-2, 2, 6].forEach((ry) => {
        ctx.beginPath();
        ctx.moveTo(-3, ry);
        ctx.lineTo(3, ry);
        ctx.stroke();
      });

      // Highlight shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.ellipse(-2, -2, 1.5, 5, -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 2. Golden Carrot (Extra points)
    this.makeCanvas(scene, 'item_carrot_gold', 36, 36, (ctx) => {
      ctx.save();
      ctx.translate(18, 18);

      // Golden Sparkle Aura
      ctx.fillStyle = 'rgba(255, 235, 59, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Golden leaves
      ctx.fillStyle = '#C0CA33';
      ctx.beginPath();
      ctx.ellipse(-4, -10, 3, 6, -0.3, 0, Math.PI * 2);
      ctx.ellipse(0, -12, 3.5, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(4, -10, 3, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Gold Body
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.quadraticCurveTo(-7, 2, 0, 13);
      ctx.quadraticCurveTo(7, 2, 6, -6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FF8F00';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sparkles
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-8, -4, 2, 0, Math.PI * 2);
      ctx.arc(8, 6, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 3. Heart (Life)
    this.makeCanvas(scene, 'item_heart', 28, 28, (ctx) => {
      ctx.save();
      ctx.translate(14, 14);

      ctx.fillStyle = '#FF1744';
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(-11, 2, -11, -8, 0, -5);
      ctx.bezierCurveTo(11, -8, 11, 2, 0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#C51162';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(-4, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 4. Wooden Breakable Box (Caja)
    this.makeCanvas(scene, 'box_wood', 36, 36, (ctx) => {
      ctx.save();
      // Main wooden block
      ctx.fillStyle = '#A1887F';
      ctx.fillRect(0, 0, 36, 36);
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 36, 36);

      // Inner plank border
      ctx.strokeStyle = '#6D4C41';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(4, 4, 28, 28);

      // Diagonal cross (X)
      ctx.beginPath();
      ctx.moveTo(4, 4);
      ctx.lineTo(32, 32);
      ctx.moveTo(32, 4);
      ctx.lineTo(4, 32);
      ctx.stroke();

      // Corner rivets
      ctx.fillStyle = '#4E342E';
      [
        [6, 6],
        [30, 6],
        [6, 30],
        [30, 30],
      ].forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.arc(rx, ry, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    });
  }

  // ----------------------------------------------------
  // ENVIRONMENT TILES & SCENERY PROPS
  // ----------------------------------------------------
  private static createEnvironmentTextures(scene: Phaser.Scene): void {
    const ts = 32;

    // 1. tile_grass_top (Grass top + rich brown soil)
    this.makeCanvas(scene, 'tile_grass_top', ts, ts, (ctx) => {
      // Earth soil
      ctx.fillStyle = '#795548';
      ctx.fillRect(0, 8, ts, ts - 8);

      // Soil texture speckles
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(4, 14, 4, 3);
      ctx.fillRect(18, 22, 5, 3);
      ctx.fillRect(12, 26, 3, 3);
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(10, 12, 3, 2);
      ctx.fillRect(24, 16, 4, 2);

      // Grass Top layer (Lush rounded green)
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.rect(0, 0, ts, 10);
      ctx.fill();

      // Draping wavy blades
      ctx.fillStyle = '#8BC34A';
      for (let x = 2; x < ts; x += 6) {
        ctx.beginPath();
        ctx.arc(x, 10, 3.5, 0, Math.PI);
        ctx.fill();
      }

      ctx.strokeStyle = '#388E3C';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(ts, 10);
      ctx.stroke();
    });

    // 2. tile_dirt (Solid subterranean soil)
    this.makeCanvas(scene, 'tile_dirt', ts, ts, (ctx) => {
      ctx.fillStyle = '#795548';
      ctx.fillRect(0, 0, ts, ts);

      // Texture dots & stones
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(4, 6, 5, 4);
      ctx.fillRect(18, 18, 6, 4);
      ctx.fillRect(8, 24, 4, 3);
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(14, 8, 4, 3);
      ctx.fillRect(22, 10, 5, 3);
      ctx.fillRect(2, 18, 3, 3);
    });

    // 3. tile_platform_float (Floating island chunk with rounded edges)
    this.makeCanvas(scene, 'tile_platform_float', 64, 32, (ctx) => {
      // Rounded island bottom
      ctx.fillStyle = '#795548';
      ctx.beginPath();
      ctx.roundRect(2, 6, 60, 24, [0, 0, 12, 12]);
      ctx.fill();
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Grass top
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.roundRect(0, 0, 64, 10, [6, 6, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#8BC34A';
      for (let x = 6; x < 60; x += 8) {
        ctx.beginPath();
        ctx.arc(x, 10, 4, 0, Math.PI);
        ctx.fill();
      }
    });

    // 4. prop_tree (Lush Cartoon Tree from reference)
    this.makeCanvas(scene, 'prop_tree', 96, 120, (ctx) => {
      ctx.save();
      // Trunk (Curved warm brown)
      ctx.fillStyle = '#6D4C41';
      ctx.beginPath();
      ctx.moveTo(40, 120);
      ctx.quadraticCurveTo(44, 80, 42, 60);
      ctx.lineTo(54, 60);
      ctx.quadraticCurveTo(52, 80, 56, 120);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#4E342E';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Branch
      ctx.beginPath();
      ctx.moveTo(43, 75);
      ctx.quadraticCurveTo(30, 70, 26, 65);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#6D4C41';
      ctx.stroke();

      // Leafy Canopy (Cloud tiers of vibrant greens)
      const foliage = [
        { x: 48, y: 45, r: 34, c: '#388E3C' }, // Dark green shadow base
        { x: 30, y: 38, r: 24, c: '#4CAF50' },
        { x: 66, y: 38, r: 24, c: '#4CAF50' },
        { x: 48, y: 26, r: 26, c: '#66BB6A' }, // Light highlight top
      ];
      foliage.forEach((f) => {
        ctx.fillStyle = f.c;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    });

    // 5. prop_bush (Cute Bush with little white flower buds)
    this.makeCanvas(scene, 'prop_bush', 54, 32, (ctx) => {
      ctx.save();
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(16, 20, 14, 0, Math.PI * 2);
      ctx.arc(38, 20, 14, 0, Math.PI * 2);
      ctx.arc(27, 14, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#81C784';
      ctx.beginPath();
      ctx.arc(27, 12, 10, 0, Math.PI * 2);
      ctx.fill();

      // White flowers
      ctx.fillStyle = '#FFFFFF';
      [
        [16, 16],
        [36, 18],
        [27, 24],
      ].forEach(([fx, fy]) => {
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath();
        ctx.arc(fx, fy, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
      });
      ctx.restore();
    });

    // 6. prop_rock (River stones with moss)
    this.makeCanvas(scene, 'prop_rock', 48, 28, (ctx) => {
      ctx.save();
      // Main big rock
      ctx.fillStyle = '#78909C';
      ctx.beginPath();
      ctx.ellipse(28, 16, 18, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#455A64';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Small companion rock
      ctx.fillStyle = '#90A4AE';
      ctx.beginPath();
      ctx.ellipse(12, 20, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Green moss
      ctx.fillStyle = '#8BC34A';
      ctx.beginPath();
      ctx.ellipse(26, 9, 8, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 7. prop_sign (Carrot wooden signpost)
    this.makeCanvas(scene, 'prop_sign', 36, 44, (ctx) => {
      ctx.save();
      // Post
      ctx.fillStyle = '#795548';
      ctx.fillRect(16, 20, 5, 24);

      // Wooden board
      ctx.fillStyle = '#A1887F';
      ctx.beginPath();
      ctx.roundRect(3, 4, 30, 20, [3, 3, 3, 3]);
      ctx.fill();
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Carved Carrot Icon
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.moveTo(15, 8);
      ctx.lineTo(21, 8);
      ctx.lineTo(18, 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(17, 6, 2, 3);

      ctx.restore();
    });

    // 8. prop_fence (Rustic wooden fence)
    this.makeCanvas(scene, 'prop_fence', 48, 28, (ctx) => {
      ctx.save();
      ctx.fillStyle = '#8D6E63';
      ctx.strokeStyle = '#4E342E';
      ctx.lineWidth = 1.5;

      // 2 horizontal rails
      ctx.fillRect(0, 8, 48, 4);
      ctx.strokeRect(0, 8, 48, 4);
      ctx.fillRect(0, 16, 48, 4);
      ctx.strokeRect(0, 16, 48, 4);

      // 3 vertical pickets
      [6, 22, 38].forEach((fx) => {
        ctx.beginPath();
        ctx.moveTo(fx, 28);
        ctx.lineTo(fx, 6);
        ctx.lineTo(fx + 3, 2);
        ctx.lineTo(fx + 6, 6);
        ctx.lineTo(fx + 6, 28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    });

    // 9. water_tile (Sparkling animated blue water stream)
    this.makeCanvas(scene, 'tile_water', ts, ts, (ctx) => {
      ctx.fillStyle = '#29B6F6';
      ctx.fillRect(0, 0, ts, ts);

      // Wave foam lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, 6);
      ctx.quadraticCurveTo(10, 3, 18, 6);
      ctx.quadraticCurveTo(26, 9, 32, 6);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 18);
      ctx.quadraticCurveTo(8, 15, 16, 18);
      ctx.quadraticCurveTo(24, 21, 32, 18);
      ctx.stroke();
    });

    // 10. bridge_tile (Wooden plank bridge)
    this.makeCanvas(scene, 'tile_bridge', ts, 12, (ctx) => {
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(0, 0, ts, 12);
      ctx.strokeStyle = '#4E342E';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, ts, 12);
      // Plank division
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(16, 12);
      ctx.stroke();
      // Rope ties
      ctx.fillStyle = '#D7CCC8';
      ctx.fillRect(2, 2, 4, 8);
      ctx.fillRect(26, 2, 4, 8);
    });

    // 11. goal_shrine (Level complete goal shrine / giant golden carrot flag)
    this.makeCanvas(scene, 'goal_shrine', 64, 84, (ctx) => {
      ctx.save();
      // Golden Carrot Statue on stone pedestal
      // Stone base
      ctx.fillStyle = '#90A4AE';
      ctx.fillRect(16, 64, 32, 20);
      ctx.strokeStyle = '#455A64';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 64, 32, 20);

      // Gold Carrot Trophy
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(22, 26);
      ctx.quadraticCurveTo(20, 44, 32, 62);
      ctx.quadraticCurveTo(44, 44, 42, 26);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FF8F00';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Green crown
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.ellipse(27, 18, 5, 10, -0.2, 0, Math.PI * 2);
      ctx.ellipse(32, 14, 5, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(37, 18, 5, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Star sparkle top
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(32, 8, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // ----------------------------------------------------
  // PARALLAX BACKGROUND LAYERS
  // ----------------------------------------------------
  private static createBackgroundTextures(scene: Phaser.Scene): void {
    // 1. bg_sky (Azure sunny gradient)
    this.makeCanvas(scene, 'bg_sky', 512, 512, (ctx) => {
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#4FC3F7'); // Vivid blue top
      grad.addColorStop(0.65, '#B3E5FC'); // Soft light sky
      grad.addColorStop(1, '#FFF3E0'); // Warm sunny horizon glow
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Gentle sun rays in upper right
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.arc(420, 80, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 245, 157, 0.35)';
      ctx.beginPath();
      ctx.arc(420, 80, 45, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. bg_clouds (Seamless fluffy cumulus clouds)
    this.makeCanvas(scene, 'bg_clouds', 640, 240, (ctx) => {
      ctx.clearRect(0, 0, 640, 240);
      const drawCloud = (cx: number, cy: number, s: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);
        // Shadow base
        ctx.fillStyle = 'rgba(207, 216, 220, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 8, 30, 0, Math.PI * 2);
        ctx.arc(-26, 12, 22, 0, Math.PI * 2);
        ctx.arc(26, 12, 22, 0, Math.PI * 2);
        ctx.fill();

        // White cloud body
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.arc(-25, 6, 20, 0, Math.PI * 2);
        ctx.arc(25, 6, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawCloud(100, 70, 1.2);
      drawCloud(320, 120, 0.9);
      drawCloud(540, 60, 1.3);
    });

    // 3. bg_hills (Distant rolling green hills with windmills and cottage silhouettes)
    this.makeCanvas(scene, 'bg_hills', 800, 300, (ctx) => {
      ctx.clearRect(0, 0, 800, 300);

      // Back hill (Soft pastel green-blue)
      ctx.fillStyle = '#A5D6A7';
      ctx.beginPath();
      ctx.moveTo(0, 300);
      ctx.quadraticCurveTo(200, 130, 400, 210);
      ctx.quadraticCurveTo(600, 140, 800, 230);
      ctx.lineTo(800, 300);
      ctx.closePath();
      ctx.fill();

      // Front hill (Vibrant meadow green)
      ctx.fillStyle = '#81C784';
      ctx.beginPath();
      ctx.moveTo(0, 300);
      ctx.quadraticCurveTo(240, 170, 500, 240);
      ctx.quadraticCurveTo(680, 180, 800, 260);
      ctx.lineTo(800, 300);
      ctx.closePath();
      ctx.fill();

      // Cute distant windmill silhouette
      ctx.save();
      ctx.translate(200, 140);
      ctx.fillStyle = '#6D4C41';
      ctx.beginPath();
      ctx.moveTo(-8, 30);
      ctx.lineTo(-4, 0);
      ctx.lineTo(4, 0);
      ctx.lineTo(8, 30);
      ctx.closePath();
      ctx.fill();
      // Windmill blades
      ctx.strokeStyle = '#4E342E';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-15, -15);
      ctx.lineTo(15, 15);
      ctx.moveTo(-15, 15);
      ctx.lineTo(15, -15);
      ctx.stroke();
      ctx.restore();
    });

    // 4. bg_trees_mid (Midground tree tops)
    this.makeCanvas(scene, 'bg_trees_mid', 640, 180, (ctx) => {
      ctx.clearRect(0, 0, 640, 180);
      ctx.fillStyle = '#66BB6A';
      for (let x = 0; x < 640; x += 40) {
        const h = 40 + Math.sin(x * 0.1) * 15;
        ctx.beginPath();
        ctx.arc(x + 20, 180 - h, 28, Math.PI, 0);
        ctx.fill();
      }
    });
  }

  // ----------------------------------------------------
  // PARTICLE SPRITES
  // ----------------------------------------------------
  private static createParticleTextures(scene: Phaser.Scene): void {
    // 1. Star sparkle (For carrot collection & stomps)
    this.makeCanvas(scene, 'particle_star', 16, 16, (ctx) => {
      ctx.save();
      ctx.translate(8, 8);
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * 7, -Math.sin(((18 + i * 72) * Math.PI) / 180) * 7);
        ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * 3, -Math.sin(((54 + i * 72) * Math.PI) / 180) * 3);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // 2. Cartoon dust puff (For jump, landing, and squash)
    this.makeCanvas(scene, 'particle_dust', 16, 16, (ctx) => {
      ctx.fillStyle = 'rgba(245, 245, 245, 0.85)';
      ctx.beginPath();
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Wooden splinter chunk (For crate destruction)
    this.makeCanvas(scene, 'particle_wood', 12, 12, (ctx) => {
      ctx.fillStyle = '#8D6E63';
      ctx.beginPath();
      ctx.moveTo(2, 2);
      ctx.lineTo(10, 4);
      ctx.lineTo(6, 10);
      ctx.closePath();
      ctx.fill();
    });
  }
}
