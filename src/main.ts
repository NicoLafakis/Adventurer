import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

/**
 * ADVENTURER
 * A Castlevania-inspired side-scrolling adventure
 * Based on Bram Stoker's Dracula
 * 
 * Built with Phaser 3 + TypeScript + Vite
 */

// Game dimensions - 16:9 aspect ratio, scaled up 3x for crisp pixels
const GAME_WIDTH = 384;
const GAME_HEIGHT = 216;
const SCALE = 3;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a0510',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    zoom: SCALE
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 900 },
      debug: false // Set to true to see hitboxes
    }
  },
  scene: [BootScene, PreloadScene, GameScene, UIScene],
  input: {
    keyboard: true,
    gamepad: true
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true
  }
};

// Create the game instance
const game = new Phaser.Game(config);

// Export for debugging
(window as any).game = game;
