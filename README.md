# ADVENTURER
### A Castlevania-inspired side-scrolling adventure based on Bram Stoker's Dracula

Built with **Phaser 3 + TypeScript + Vite** — Deploy to Vercel in seconds.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open http://localhost:3000 to play.

---

## Deploy to Vercel

```bash
# Option 1: Vercel CLI
npm i -g vercel
vercel

# Option 2: Connect GitHub repo to Vercel
# Just push and it auto-deploys
```

Build settings (auto-detected):
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## Controls

| Action | Keys |
|--------|------|
| Move Left | A / ← |
| Move Right | D / → |
| Jump | Space / W / ↑ |
| Attack | J / Z |

---

## Features

### 🎥 Dynamic Camera System
The signature feature. The camera behaves like a cinematographer:

- **Zoom OUT** for scenic vistas, boss arenas, moments of awe
- **Zoom IN** for tight corridors, intense combat, intimate moments
- **Look-ahead** - camera leads in movement direction
- **Screen shake** - impact feedback for combat
- **Smooth transitions** - never jarring

### ⚔️ Combat
- Responsive movement with coyote time and jump buffering
- Variable jump height (tap vs hold)
- Attack with brief invincibility
- Knockback on hit

### 👹 Enemies
- **Wolves** - Patrol, chase, leap attack
- **Bats** - Sleep until disturbed, swoop attacks

### 💰 Progression
- Collect coins from enemies
- Shop system (planned)
- Save/load to localStorage

---

## Project Structure

```
adventurer-phaser/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.ts              # Entry point, Phaser config
    ├── config.ts            # Game constants & tuning
    ├── scenes/
    │   ├── BootScene.ts     # Initial setup
    │   ├── PreloadScene.ts  # Asset loading
    │   ├── GameScene.ts     # Main gameplay
    │   └── UIScene.ts       # HUD overlay
    ├── entities/
    │   ├── Player.ts        # Adventurer character
    │   ├── Wolf.ts          # Wolf enemy
    │   └── Bat.ts           # Bat enemy
    ├── systems/
    │   ├── DynamicCamera.ts # THE camera system
    │   ├── CameraZone.ts    # Trigger zones for camera
    │   └── GameState.ts     # Global state management
    └── assets/              # Sprites, audio (placeholder generated)
```

---

## Camera Zones

The level is divided into camera zones that trigger different zoom levels:

| Zone | Zoom | Purpose |
|------|------|---------|
| Vista Start | 0.7 | Opening wide shot |
| Default | 1.0 | Standard gameplay |
| Tight Forest | 1.4 | Claustrophobic tension |
| Combat Clearing | 0.9 | Room to fight |
| Bridge Approach | 0.7 | Dramatic reveal |
| Ravine | 1.4 | Enclosed danger |
| Boss Arena | 0.8 | See the whole fight |
| Shop | 1.1 | Intimate, safe |

---

## Level 1: Borgo Pass

Based on Jonathan Harker's journey in Bram Stoker's Dracula.

**Sections:**
1. **Mountain Road** - Tutorial area, basic platforming
2. **Pine Forest** - First combat, wolves and bats
3. **Bridge & Ravine** - Setpiece moment, vertical section
4. **Boss Arena** - Mini-boss fight
5. **Shop** - Spend coins, prepare for next level

---

## Customization

### Tuning Values
All gameplay values are in `src/config.ts`:

```typescript
// Player
MOVE_SPEED: 120,
JUMP_FORCE: -300,
COYOTE_TIME: 100,  // ms

// Camera
DEFAULT_ZOOM: 1,
ZOOM_SPEED: 0.02,
LOOK_AHEAD_DISTANCE: 40,
```

### Adding Camera Zones
In `GameScene.ts`:

```typescript
this.cameraZones.push(new CameraZone(
  this,
  new Phaser.Geom.Rectangle(x, y, width, height),
  zoomLevel,
  'zone_name'
));
```

### Adding Enemies
```typescript
const wolf = new Wolf(this, x, y);
this.enemies.add(wolf);
```

---

## Placeholder Graphics

The game generates placeholder sprites programmatically in `PreloadScene.ts`. 
Replace with real art by:

1. Add images to `public/assets/`
2. Load in `PreloadScene.preload()`:
   ```typescript
   this.load.image('player', 'assets/player.png');
   ```
3. Remove the `generatePlaceholderSprites()` calls

---

## Credits

**Design & Development:** Built with Claude AI assistance

**Inspiration:**
- Bram Stoker's *Dracula* (Public Domain)
- Konami's Castlevania series
- Team Cherry's Hollow Knight

**Engine:** Phaser 3 (MIT License)

---

*"Listen to them—the children of the night. What music they make!"*
