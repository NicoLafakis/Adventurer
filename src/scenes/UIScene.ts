import Phaser from 'phaser';
import { CONFIG, COLORS } from '../config';
import { GameState } from '../systems/GameState';

/**
 * UIScene
 * HUD overlay - health bar, coins, etc.
 * Runs parallel to GameScene
 */
export class UIScene extends Phaser.Scene {
  // UI Elements
  healthBarBg!: Phaser.GameObjects.Rectangle;
  healthBarFill!: Phaser.GameObjects.Rectangle;
  healthText!: Phaser.GameObjects.Text;
  
  coinIcon!: Phaser.GameObjects.Image;
  coinText!: Phaser.GameObjects.Text;
  
  // Reference to game scene
  gameScene!: Phaser.Scene;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    // Get reference to game scene
    this.gameScene = this.scene.get('GameScene');
    
    // Create health bar
    this.createHealthBar();
    
    // Create coin counter
    this.createCoinCounter();
    
    // Create zone indicator (debug)
    this.createZoneIndicator();
    
    // Listen for events from game scene
    this.gameScene.events.on('coin-collected', this.updateCoins, this);
    this.gameScene.events.on('player-damaged', this.updateHealth, this);
    this.gameScene.events.on('player-healed', this.updateHealth, this);
    
    // Clean up listeners when scene shuts down
    this.events.on('shutdown', () => {
      this.gameScene.events.off('coin-collected', this.updateCoins, this);
      this.gameScene.events.off('player-damaged', this.updateHealth, this);
      this.gameScene.events.off('player-healed', this.updateHealth, this);
    });
  }

  update(): void {
    // Update health bar based on player state
    const player = (this.gameScene as any).getPlayer?.();
    if (player) {
      this.updateHealthBar(player.health, player.maxHealth);
    }
    
    // Update coin display
    this.coinText.setText(`${GameState.coins}`);
  }

  private createHealthBar(): void {
    const x = 10;
    const y = 10;
    const width = 80;
    const height = 12;
    
    // Background
    this.healthBarBg = this.add.rectangle(x, y, width, height, COLORS.HEALTH_BG);
    this.healthBarBg.setOrigin(0, 0);
    this.healthBarBg.setStrokeStyle(1, 0x3a1a30);
    
    // Fill
    this.healthBarFill = this.add.rectangle(x + 2, y + 2, width - 4, height - 4, COLORS.HEALTH_BAR);
    this.healthBarFill.setOrigin(0, 0);
    
    // Label
    this.healthText = this.add.text(x + width + 5, y, 'HP', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff'
    });
  }

  private createCoinCounter(): void {
    const x = 10;
    const y = 28;
    
    // Coin icon
    this.coinIcon = this.add.image(x + 6, y + 6, 'coin');
    this.coinIcon.setScale(1);
    
    // Coin count
    this.coinText = this.add.text(x + 18, y, '0', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffd700'
    });
  }

  private createZoneIndicator(): void {
    // Small text showing current camera zone (for debug/polish)
    const zoneText = this.add.text(CONFIG.GAME_WIDTH - 10, 10, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#666666'
    });
    zoneText.setOrigin(1, 0);
    
    // Update zone text periodically
    this.time.addEvent({
      delay: 500,
      callback: () => {
        const dynamicCamera = (this.gameScene as any).dynamicCamera;
        if (dynamicCamera) {
          const zoom = dynamicCamera.currentZoom.toFixed(2);
          zoneText.setText(`Zoom: ${zoom}`);
        }
      },
      loop: true
    });
  }

  private updateHealthBar(current: number, max: number): void {
    const ratio = Math.max(0, current / max);
    const maxWidth = 76; // health bar fill max width
    
    // Animate health bar change
    this.tweens.add({
      targets: this.healthBarFill,
      width: maxWidth * ratio,
      duration: 200,
      ease: 'Power2'
    });
    
    // Flash red when damaged
    if (ratio < this.healthBarFill.width / maxWidth) {
      this.healthBarFill.setFillStyle(0xff4444);
      this.time.delayedCall(100, () => {
        this.healthBarFill.setFillStyle(COLORS.HEALTH_BAR);
      });
    }
  }

  private updateCoins(_amount: number): void {
    // Pop animation for coin text
    this.tweens.add({
      targets: this.coinText,
      scale: 1.3,
      duration: 100,
      yoyo: true
    });
  }

  private updateHealth(): void {
    // Health update is handled in the main update loop
  }
}
