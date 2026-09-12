# Bunny Hop — AI Agent Instructions & Guidelines

## 🌟 Game Overview
**Bunny Hop** is a charming, high-performance 2D platformer built with **Phaser**, **React**, **TypeScript**, and **Vite** (run with **Bun**).

---

## 🎯 Mandatory Phaser Skills Usage
24 official Phaser skills from Skills Hub are installed in this workspace under `.agents/skills/`.
**Rule:** When implementing or modifying any game feature, **always consult the corresponding official skill** located in `.agents/skills/<skill-name>/SKILL.md` before writing or changing code.

### Quick Reference of Available Skills:
- **Audio & Sound**: `.agents/skills/phaser-audio-and-sound/SKILL.md`
- **Arcade Physics**: `.agents/skills/phaser-physics-arcade/SKILL.md`
- **Matter.js Physics**: `.agents/skills/phaser-physics-matter/SKILL.md`
- **Asset Loading**: `.agents/skills/phaser-loading-assets/SKILL.md`
- **Sprites & Images**: `.agents/skills/phaser-sprites-and-images/SKILL.md`
- **Animations**: `.agents/skills/phaser-animations/SKILL.md`
- **Cameras & Viewports**: `.agents/skills/phaser-cameras/SKILL.md`
- **Particles & FX**: `.agents/skills/phaser-particles/SKILL.md`
- **Tweens**: `.agents/skills/phaser-tweens/SKILL.md`
- **Scenes & Lifecycle**: `.agents/skills/phaser-scenes/SKILL.md`
- **Scale & Responsive**: `.agents/skills/phaser-scale-and-responsive/SKILL.md`
- **Tilemaps**: `.agents/skills/phaser-tilemaps/SKILL.md`
- **Graphics & Shapes**: `.agents/skills/phaser-graphics-and-shapes/SKILL.md`
- **Filters & PostFX**: `.agents/skills/phaser-filters-and-postfx/SKILL.md`
- **Events System**: `.agents/skills/phaser-events-system/SKILL.md`
- **Timers & Clock**: `.agents/skills/phaser-time-and-timers/SKILL.md`
- **Game Object Components**: `.agents/skills/phaser-game-object-components/SKILL.md`
- **Groups & Containers**: `.agents/skills/phaser-groups-and-containers/SKILL.md`
- **Curves & Paths**: `.agents/skills/phaser-curves-and-paths/SKILL.md`
- **Data Manager**: `.agents/skills/phaser-data-manager/SKILL.md`
- **Game Setup & Config**: `.agents/skills/phaser-game-setup-and-config/SKILL.md`
- **Phaser 4 Features**: `.agents/skills/phaser-v4-new-features/SKILL.md`
- **v3 to v4 Migration**: `.agents/skills/phaser-v3-to-v4-migration/SKILL.md`
- **Render Textures**: `.agents/skills/phaser-render-textures/SKILL.md`

---

## 🔒 Project Invariants & Ground Rules
1. **Asset Locations**:
   - Scenery / environment elements MUST come strictly from `public/assets/environment/enviroment_elements/`.
   - Ground terrain modules come from `public/assets/environment/ground_elements/`.
   - Never reference deleted loose props (`rich_*` loose files were deleted).
2. **Terrain Snapping**:
   - All environment scenery must be grounded firmly to the terrain (`origin: (0.5, 1)`).
3. **Quality Gates**:
   - `bun test` must pass all tests with 0 failures.
   - `bun x tsc --noEmit` must pass with 0 type errors.
   - Zero missing texture boxes (black boxes with green diagonal slashes) or console errors.
