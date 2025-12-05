# Adventurer - Progress Log

This file tracks major milestones and stable states of the game. Use git commits/tags referenced here for rollback points.

---

## Milestone 1: Core Game Foundation
**Date:** December 4, 2024
**Status:** STABLE
**Git Commit:** `62f988c` (before this session's changes)

Basic platformer with:
- Player movement and jumping
- Wolf and Bat enemies
- Coin collection
- Dynamic camera with zoom zones
- Procedural audio

---

## Milestone 2: Polish & Menu System
**Date:** December 5, 2024
**Status:** STABLE
**Git Tag:** `v0.2.0`
**Git Commit:** `c3776c8`

### What's Working:
- **Main Menu Scene** - Title screen with animated background, START GAME and SETTINGS buttons
- **Settings Scene** - Volume sliders (Music/SFX), keybinding configuration with rebind support
- **Player Animations** - 6-frame spritesheet with idle, walk cycle (4 frames), and jump poses
- **Background Parallax** - Properly scales at all zoom levels (0.3x to 0.8x)
- **Physics Hitboxes** - Correctly sized for player, enemies, and projectiles
- **Projectile System** - K/X keys throw knives that damage enemies
- **Audio System** - Procedural sound effects with configurable volume

### Key Files Modified:
- `src/main.ts` - Added MainMenuScene, SettingsScene to scene list
- `src/scenes/PreloadScene.ts` - Player spritesheet generation, animations
- `src/scenes/MainMenuScene.ts` - NEW: Title screen with menu
- `src/scenes/SettingsScene.ts` - NEW: Settings UI
- `src/scenes/GameScene.ts` - Background scaling, physics fixes
- `src/entities/Player.ts` - Animation state management
- `src/entities/Projectile.ts` - Physics body fix
- `src/systems/SettingsManager.ts` - NEW: Persistent settings
- `src/systems/AudioManager.ts` - Volume from SettingsManager
- `src/config.ts` - Tuned movement (speed: 280, jump: -750)

### Physics Values (Tuned):
```typescript
PLAYER: {
  MOVE_SPEED: 280,
  JUMP_FORCE: -750,
  JUMP_CUT_MULTIPLIER: 0.4,
  MAX_FALL_SPEED: 900,
}
// Player hitbox: setSize(14, 26), setOffset(9, 6)
```

### Controls:
| Action | Keys |
|--------|------|
| Move | A/D, Arrow Keys |
| Jump | Space, W, Up |
| Attack | J, Z, E, Left Click |
| Sub-weapon | K, X |
| Menu Nav | W/S, Up/Down |
| Confirm | Enter, Space, Z |

### Known Issues:
- None critical at this milestone

### To Recreate This State:
```bash
git stash  # if you have changes
git checkout <commit-hash-here>
npm install
npm run dev
```

---

## Future Milestones (Planned):

### Milestone 3: Visual Polish
- [ ] Improved sprite art (external assets or refined procedural)
- [ ] Particle effects (dust, hit sparks, coin sparkle)
- [ ] Screen transitions
- [ ] More detailed backgrounds (like the reference images)

### Milestone 4: Gameplay Depth
- [ ] More enemy types
- [ ] Boss encounter
- [ ] Shop system implementation
- [ ] Power-ups / sub-weapon variety

### Milestone 5: Level Design
- [ ] Multiple levels
- [ ] Checkpoints
- [ ] Level transitions

---

## Notes

### How to Tag a Milestone:
```bash
git add .
git commit -m "Milestone X: Description"
git tag -a v0.X.0 -m "Milestone X - Description"
```

### Quick Rollback:
```bash
git log --oneline  # find the commit
git checkout <commit-hash>
```
