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
    // Create player animations
    this.createPlayerAnimations();

    // Go to main menu
    this.scene.start('MainMenuScene');
  }

  private createPlayerAnimations(): void {
    // Idle animation (single frame)
    this.anims.create({
      key: 'player_idle',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1,
      repeat: -1
    });

    // Walk animation (frames 1-4 cycle)
    this.anims.create({
      key: 'player_walk',
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 4 }),
      frameRate: 10,
      repeat: -1
    });

    // Jump animation (single frame)
    this.anims.create({
      key: 'player_jump',
      frames: [{ key: 'player', frame: 5 }],
      frameRate: 1,
      repeat: 0
    });

    // Fall animation (using jump frame for now)
    this.anims.create({
      key: 'player_fall',
      frames: [{ key: 'player', frame: 5 }],
      frameRate: 1,
      repeat: 0
    });
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
    // Create a spritesheet with multiple frames for animation
    // Frame layout: 6 frames x 32px = 192px wide, 32px tall
    // Frames: 0=idle, 1-4=walk cycle, 5=jump
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const frameWidth = 32;

    // Helper function to draw player at specific frame offset with leg positions
    const drawPlayerFrame = (offsetX: number, leftLegY: number, rightLegY: number, bodyBob: number = 0, capeWave: number = 0) => {
      // Body
      graphics.fillStyle(0x2a1a3a);
      graphics.fillRect(offsetX + 10, 12 + bodyBob, 12, 14);

      // Head
      graphics.fillStyle(0xd4a574);
      graphics.fillCircle(offsetX + 16, 8 + bodyBob, 6);

      // Hat (wide-brimmed adventurer hat)
      graphics.fillStyle(0x1a0a20);
      graphics.fillRect(offsetX + 7, 2 + bodyBob, 18, 3);
      graphics.fillRect(offsetX + 11, 0 + bodyBob, 10, 3);

      // Cape with wave animation
      graphics.fillStyle(0x8b2942);
      graphics.fillTriangle(
        offsetX + 10, 14 + bodyBob,
        offsetX + 4 + capeWave, 28 + bodyBob,
        offsetX + 16, 26 + bodyBob
      );
      graphics.fillTriangle(
        offsetX + 22, 14 + bodyBob,
        offsetX + 28 - capeWave, 28 + bodyBob,
        offsetX + 16, 26 + bodyBob
      );

      // Left leg
      graphics.fillStyle(0x1a0a20);
      graphics.fillRect(offsetX + 11, 24 + leftLegY, 4, 8 - leftLegY);

      // Right leg
      graphics.fillRect(offsetX + 17, 24 + rightLegY, 4, 8 - rightLegY);

      // Boots (feet)
      graphics.fillStyle(0x3a2a20);
      graphics.fillRect(offsetX + 10, 30 + Math.max(leftLegY, 0), 5, 2);
      graphics.fillRect(offsetX + 16, 30 + Math.max(rightLegY, 0), 6, 2);
    };

    // Frame 0: Idle stance
    drawPlayerFrame(0, 0, 0, 0, 0);

    // Frame 1: Walk - left leg forward
    drawPlayerFrame(frameWidth, -3, 2, -1, 1);

    // Frame 2: Walk - passing (both legs center)
    drawPlayerFrame(frameWidth * 2, 0, 0, 0, 0);

    // Frame 3: Walk - right leg forward
    drawPlayerFrame(frameWidth * 3, 2, -3, -1, -1);

    // Frame 4: Walk - passing (back to center)
    drawPlayerFrame(frameWidth * 4, 0, 0, 0, 0);

    // Frame 5: Jump (legs tucked)
    const jumpOffset = frameWidth * 5;
    // Body
    graphics.fillStyle(0x2a1a3a);
    graphics.fillRect(jumpOffset + 10, 14, 12, 12);
    // Head
    graphics.fillStyle(0xd4a574);
    graphics.fillCircle(jumpOffset + 16, 9, 6);
    // Hat
    graphics.fillStyle(0x1a0a20);
    graphics.fillRect(jumpOffset + 7, 3, 18, 3);
    graphics.fillRect(jumpOffset + 11, 1, 10, 3);
    // Cape (flowing up during jump)
    graphics.fillStyle(0x8b2942);
    graphics.fillTriangle(jumpOffset + 10, 16, jumpOffset + 2, 26, jumpOffset + 16, 24);
    graphics.fillTriangle(jumpOffset + 22, 16, jumpOffset + 30, 26, jumpOffset + 16, 24);
    // Tucked legs
    graphics.fillStyle(0x1a0a20);
    graphics.fillRect(jumpOffset + 10, 24, 5, 5);
    graphics.fillRect(jumpOffset + 17, 24, 5, 5);
    // Boots
    graphics.fillStyle(0x3a2a20);
    graphics.fillRect(jumpOffset + 9, 28, 6, 2);
    graphics.fillRect(jumpOffset + 17, 28, 6, 2);

    graphics.generateTexture('player', frameWidth * 6, 32);
    graphics.destroy();

    // Add frame data to the generated texture for animation
    const texture = this.textures.get('player');
    for (let i = 0; i < 6; i++) {
      texture.add(i, 0, i * frameWidth, 0, frameWidth, 32);
    }
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
