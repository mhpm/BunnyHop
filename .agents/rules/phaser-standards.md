# Phaser Development Standards & Official Skills

Este proyecto (Bunny Hop) utiliza Phaser para todo el motor de juego 2D. Para garantizar la máxima calidad, rendimiento y adherencia a las mejores prácticas oficiales de Phaser, se han instalado 24 skills oficiales en el workspace bajo `.agents/skills/`.

## 📜 Regla de Oro
**Siempre que se implemente, modifique o depure una característica del juego en Phaser, se DEBE consultar el archivo `SKILL.md` correspondiente en `.agents/skills/` antes de escribir o cambiar código.**

---

## 📚 Índice de Skills Oficiales Disponibles en `.agents/skills/`

| Característica / Dominio | Skill del Workspace | Archivo de Instrucciones |
| :--- | :--- | :--- |
| **Sprites e Imágenes** | `phaser-sprites-and-images` | [SKILL.md](file:///.agents/skills/phaser-sprites-and-images/SKILL.md) |
| **Animaciones y Frames** | `phaser-animations` | [SKILL.md](file:///.agents/skills/phaser-animations/SKILL.md) |
| **Carga de Assets y Loader** | `phaser-loading-assets` | [SKILL.md](file:///.agents/skills/phaser-loading-assets/SKILL.md) |
| **Audio, Música y Sonido** | `phaser-audio-and-sound` | [SKILL.md](file:///.agents/skills/phaser-audio-and-sound/SKILL.md) |
| **Física Arcade (Colisiones, gravedad)** | `phaser-physics-arcade` | [SKILL.md](file:///.agents/skills/phaser-physics-arcade/SKILL.md) |
| **Física Matter.js (Polígonos y cuerpos complejos)** | `phaser-physics-matter` | [SKILL.md](file:///.agents/skills/phaser-physics-matter/SKILL.md) |
| **Cámaras y Viewports (Seguimiento, shake, zoom)** | `phaser-cameras` | [SKILL.md](file:///.agents/skills/phaser-cameras/SKILL.md) |
| **Partículas y Efectos Visuales** | `phaser-particles` | [SKILL.md](file:///.agents/skills/phaser-particles/SKILL.md) |
| **Tweens y Cadenas de Animación** | `phaser-tweens` | [SKILL.md](file:///.agents/skills/phaser-tweens/SKILL.md) |
| **Escenas y Ciclo de Vida (SceneManager)** | `phaser-scenes` | [SKILL.md](file:///.agents/skills/phaser-scenes/SKILL.md) |
| **Gráficos y Formas Vectoriales** | `phaser-graphics-and-shapes` | [SKILL.md](file:///.agents/skills/phaser-graphics-and-shapes/SKILL.md) |
| **Escalado y Responsive (ScaleManager)** | `phaser-scale-and-responsive` | [SKILL.md](file:///.agents/skills/phaser-scale-and-responsive/SKILL.md) |
| **Tilemaps y Capas** | `phaser-tilemaps` | [SKILL.md](file:///.agents/skills/phaser-tilemaps/SKILL.md) |
| **Eventos y Comunicación (EventEmitter)** | `phaser-events-system` | [SKILL.md](file:///.agents/skills/phaser-events-system/SKILL.md) |
| **Temporizadores y Relojes (Clock)** | `phaser-time-and-timers` | [SKILL.md](file:///.agents/skills/phaser-time-and-timers/SKILL.md) |
| **Render Textures y DynamicTexture** | `phaser-render-textures` | [SKILL.md](file:///.agents/skills/phaser-render-textures/SKILL.md) |
| **Filtros, Shaders y Post-FX** | `phaser-filters-and-postfx` | [SKILL.md](file:///.agents/skills/phaser-filters-and-postfx/SKILL.md) |
| **Curvas, Rutas y Splines** | `phaser-curves-and-paths` | [SKILL.md](file:///.agents/skills/phaser-curves-and-paths/SKILL.md) |
| **Componentes de Game Objects (Mixins)** | `phaser-game-object-components` | [SKILL.md](file:///.agents/skills/phaser-game-object-components/SKILL.md) |
| **Grupos y Contenedores (Pooling)** | `phaser-groups-and-containers` | [SKILL.md](file:///.agents/skills/phaser-groups-and-containers/SKILL.md) |
| **DataManager y Estado** | `phaser-data-manager` | [SKILL.md](file:///.agents/skills/phaser-data-manager/SKILL.md) |
| **Configuración Global del Juego (GameConfig)** | `phaser-game-setup-and-config` | [SKILL.md](file:///.agents/skills/phaser-game-setup-and-config/SKILL.md) |
| **Novedades de Phaser 4** | `phaser-v4-new-features` | [SKILL.md](file:///.agents/skills/phaser-v4-new-features/SKILL.md) |
| **Migración v3 a v4** | `phaser-v3-to-v4-migration` | [SKILL.md](file:///.agents/skills/phaser-v3-to-v4-migration/SKILL.md) |

---

## 🛠️ Buenas Prácticas del Proyecto
1. **Tipado Estricto**: Todo código nuevo debe pasar `bun x tsc --noEmit` con 0 errores.
2. **Pruebas Automatizadas**: Mantener actualizados y pasando los tests con `bun test`.
3. **Manejo de Assets**:
   - Elementos de entorno: únicamente desde `public/assets/environment/enviroment_elements/`.
   - Elementos de suelo: `public/assets/environment/ground_elements/`.
   - Audios y música: precargados mediante `this.load.audio()` e integrados con `BaseSoundManager`.
