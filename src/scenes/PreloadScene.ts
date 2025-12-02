import Phaser from 'phaser';
import { COLORS } from '../config';
import { AudioManager } from '../systems/AudioManager';

/**
 * PreloadScene
 * Loads all game assets and shows a loading bar
 * For now, generates placeholder graphics programmatically
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Show loading progress
    this.createLoadingBar();
    
    // Generate placeholder sprites
    this.generatePlaceholderSprites();

    // Generate procedural sounds
    AudioManager.generateSounds(this);
  }

  create(): void {
    // Start the game
    this.scene.start('GameScene');
    this.scene.start('UIScene');
  }

  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 20, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Progress bar background
    const progressBg = this.add.rectangle(width / 2, height / 2 + 10, 200, 16, 0x1a0a20);
    
    // Progress bar fill
    const progressBar = this.add.rectangle(width / 2 - 98, height / 2 + 10, 0, 12, COLORS.HEALTH_BAR);
    progressBar.setOrigin(0, 0.5);

    // Update progress bar
    this.load.on('progress', (value: number) => {
      progressBar.width = 196 * value;
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      progressBg.destroy();
      progressBar.destroy();
    });
  }

  private generatePlaceholderSprites(): void {
    // Player sprite (32x32)
    this.generatePlayerSprite();
    
    // Wolf sprite (32x24)
    this.generateWolfSprite();
    
    // Bat sprite (24x16)
    this.generateBatSprite();
    
    // Coin sprite (12x12)
    this.generateCoinSprite();

    // Knife sprite (16x8)
    this.generateKnifeSprite();
    
    // Ground tile (16x16)
    this.generateGroundTile();
    
    // Platform tile (16x16)
    this.generatePlatformTile();
    
    // Background layers
    this.generateBackgroundLayers();
  }

  private generatePlayerSprite(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Create a simple adventurer silhouette
    // Body
    graphics.fillStyle(0x2a1a3a);
    graphics.fillRect(10, 12, 12, 16);
    
    // Head
    graphics.fillStyle(0xd4a574);
    graphics.fillCircle(16, 8, 6);
    
    // Hat
    graphics.fillStyle(0x1a0a20);
    graphics.fillRect(8, 2, 16, 4);
    graphics.fillRect(12, 0, 8, 4);
    
    // Cape
    graphics.fillStyle(0x8b2942);
    graphics.fillTriangle(10, 14, 6, 30, 16, 28);
    graphics.fillTriangle(22, 14, 26, 30, 16, 28);
    
    // Legs
    graphics.fillStyle(0x1a0a20);
    graphics.fillRect(11, 26, 4, 6);
    graphics.fillRect(17, 26, 4, 6);
    
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  private generateWolfSprite(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Wolf body
    graphics.fillStyle(0x3a3a4a);
    graphics.fillEllipse(16, 14, 24, 12);
    
    // Head
    graphics.fillStyle(0x4a4a5a);
    graphics.fillEllipse(28, 10, 10, 8);
    
    // Snout
    graphics.fillStyle(0x3a3a4a);
    graphics.fillTriangle(30, 10, 32, 6, 32, 14);
    
    // Ears
    graphics.fillStyle(0x4a4a5a);
    graphics.fillTriangle(24, 4, 26, 0, 28, 4);
    graphics.fillTriangle(28, 4, 30, 0, 32, 4);
    
    // Eye
    graphics.fillStyle(0xff4444);
    graphics.fillCircle(28, 8, 2);
    
    // Legs
    graphics.fillStyle(0x3a3a4a);
    graphics.fillRect(8, 18, 3, 6);
    graphics.fillRect(14, 18, 3, 6);
    graphics.fillRect(20, 18, 3, 6);
    graphics.fillRect(26, 18, 3, 6);
    
    // Tail
    graphics.lineStyle(3, 0x4a4a5a);
    graphics.beginPath();
    graphics.moveTo(4, 12);
    graphics.lineTo(0, 8);
    graphics.strokePath();
    
    graphics.generateTexture('wolf', 32, 24);
    graphics.destroy();
  }

  private generateBatSprite(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Body
    graphics.fillStyle(0x2a2a3a);
    graphics.fillEllipse(12, 10, 8, 10);
    
    // Wings
    graphics.fillStyle(0x1a1a2a);
    graphics.fillTriangle(4, 6, 0, 2, 8, 10);
    graphics.fillTriangle(4, 14, 0, 18, 8, 10);
    graphics.fillTriangle(20, 6, 24, 2, 16, 10);
    graphics.fillTriangle(20, 14, 24, 18, 16, 10);
    
    // Eyes
    graphics.fillStyle(0xff6666);
    graphics.fillCircle(10, 6, 2);
    graphics.fillCircle(14, 6, 2);
    
    // Ears
    graphics.fillStyle(0x2a2a3a);
    graphics.fillTriangle(8, 2, 10, 0, 10, 4);
    graphics.fillTriangle(16, 2, 14, 0, 14, 4);
    
    graphics.generateTexture('bat', 24, 20);
    graphics.destroy();
  }

  private generateCoinSprite(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Coin
    graphics.fillStyle(COLORS.COIN);
    graphics.fillCircle(6, 6, 5);
    
    // Shine
    graphics.fillStyle(0xffff88);
    graphics.fillCircle(4, 4, 2);
    
    // Inner detail
    graphics.lineStyle(1, 0xcc9900);
    graphics.strokeCircle(6, 6, 3);
    
    graphics.generateTexture('coin', 12, 12);
    graphics.destroy();
  }

  private generateKnifeSprite(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Silver blade
    graphics.fillStyle(0xc0c0c0);
    graphics.fillTriangle(14, 4, 6, 2, 6, 6);

    // Blade edge highlight
    graphics.fillStyle(0xe0e0e0);
    graphics.fillTriangle(14, 4, 8, 3, 8, 5);

    // Handle
    graphics.fillStyle(0x5a4030);
    graphics.fillRect(2, 2, 5, 4);

    // Guard
    graphics.fillStyle(0x8b7355);
    graphics.fillRect(6, 1, 2, 6);

    graphics.generateTexture('knife', 16, 8);
    graphics.destroy();
  }

  private generateGroundTile(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Ground tile with rocky texture
    graphics.fillStyle(0x4a4a5a);
    graphics.fillRect(0, 0, 16, 16);
    
    // Top grass/dirt
    graphics.fillStyle(0x3a5a3a);
    graphics.fillRect(0, 0, 16, 4);
    
    // Rock details
    graphics.fillStyle(0x3a3a4a);
    graphics.fillRect(2, 6, 4, 3);
    graphics.fillRect(10, 8, 4, 4);
    graphics.fillRect(4, 12, 6, 3);
    
    graphics.generateTexture('ground', 16, 16);
    graphics.destroy();
  }

  private generatePlatformTile(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Wooden platform
    graphics.fillStyle(0x5a4030);
    graphics.fillRect(0, 0, 16, 8);
    
    // Wood grain
    graphics.lineStyle(1, 0x4a3020);
    graphics.beginPath();
    graphics.moveTo(0, 2);
    graphics.lineTo(16, 2);
    graphics.moveTo(0, 5);
    graphics.lineTo(16, 5);
    graphics.strokePath();
    
    // Highlight
    graphics.lineStyle(1, 0x6a5040);
    graphics.beginPath();
    graphics.moveTo(0, 1);
    graphics.lineTo(16, 1);
    graphics.strokePath();
    
    graphics.generateTexture('platform', 16, 8);
    graphics.destroy();
  }

  private generateBackgroundLayers(): void {
    const width = 768;  // 2x internal resolution
    const height = 432; // 2x internal resolution
    
    // Far mountains (parallax layer 1)
    const farMountains = this.make.graphics({ x: 0, y: 0 });
    
    // Gradient sky
    for (let y = 0; y < height; y++) {
      const ratio = y / height;
      const r = Math.floor(0x4a + (0x0a - 0x4a) * ratio);
      const g = Math.floor(0x1a + (0x05 - 0x1a) * ratio);
      const b = Math.floor(0x4a + (0x10 - 0x4a) * ratio);
      farMountains.fillStyle((r << 16) | (g << 8) | b);
      farMountains.fillRect(0, y, width, 1);
    }
    
    // Moon
    farMountains.fillStyle(COLORS.MOON);
    farMountains.fillCircle(60, 40, 15);
    
    // Mountain silhouettes
    farMountains.fillStyle(0x1a0a20);
    farMountains.fillTriangle(0, height, 100, 80, 200, height);
    farMountains.fillTriangle(150, height, 280, 60, 384, height);
    farMountains.fillTriangle(300, height, 400, 90, 500, height);
    
    farMountains.generateTexture('bg_far', width, height);
    farMountains.destroy();
    
    // Mid layer - trees
    const midTrees = this.make.graphics({ x: 0, y: 0 });
    midTrees.fillStyle(0x0d0510);
    
    // Tree silhouettes
    for (let x = 0; x < width; x += 40) {
      const treeHeight = 60 + Math.random() * 40;
      const treeWidth = 20 + Math.random() * 15;
      midTrees.fillTriangle(
        x + treeWidth / 2, height - treeHeight,
        x, height,
        x + treeWidth, height
      );
    }
    
    midTrees.generateTexture('bg_mid', width, height);
    midTrees.destroy();
    
    // Castle silhouette (far background)
    const castle = this.make.graphics({ x: 0, y: 0 });
    castle.fillStyle(0x0d0510);
    
    // Main towers
    castle.fillRect(300, 50, 12, 60);
    castle.fillRect(320, 40, 18, 70);
    castle.fillRect(345, 55, 10, 55);
    
    // Spires
    castle.fillTriangle(300, 50, 306, 30, 312, 50);
    castle.fillTriangle(320, 40, 329, 15, 338, 40);
    castle.fillTriangle(345, 55, 350, 40, 355, 55);
    
    // Base
    castle.fillRect(290, 100, 80, 20);
    
    castle.generateTexture('bg_castle', width, height);
    castle.destroy();
  }
}
