import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

/**
 * ADVENTURER
 * A Castlevania-inspired side-scrolling adventure
 * Based on Bram Stoker's Dracula
 * 
 * Built with Phaser 3 + TypeScript + Vite
 */

// Game dimensions - 16:9 aspect ratio
// Render at 2x internal resolution for crisp zooming, display at 3x
const GAME_WIDTH = 768;   // 2x internal resolution
const GAME_HEIGHT = 432;  // 2x internal resolution
const DISPLAY_SCALE = 1.5; // Results in same display size as before (768 * 1.5 = 1152)

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
    zoom: DISPLAY_SCALE
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1800 },  // 2x for internal resolution
      debug: false // Set to true to see hitboxes
    }
  },
  scene: [BootScene, PreloadScene, MainMenuScene, SettingsScene, GameScene, UIScene],
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
