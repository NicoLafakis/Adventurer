import Phaser from 'phaser';
import { CONFIG, COLORS } from '../config';

/**
 * MainMenuScene
 * Title screen with game logo, start button, and settings access
 */
export class MainMenuScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Container;
  private settingsButton!: Phaser.GameObjects.Container;
  private selectedIndex: number = 0;
  private menuItems: Phaser.GameObjects.Container[] = [];
  private selectKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const centerX = CONFIG.GAME_WIDTH / 2;
    const centerY = CONFIG.GAME_HEIGHT / 2;

    // Create atmospheric background
    this.createBackground();

    // Create title
    this.createTitle(centerX);

    // Create menu buttons
    this.createMenuButtons(centerX, centerY);

    // Setup input
    this.setupInput();

    // Initial selection highlight
    this.updateSelection();

    // Fade in effect
    this.cameras.main.fadeIn(500, 10, 5, 16);
  }

  private createBackground(): void {
    // Use the preloaded background
    const bg = this.add.tileSprite(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'bg_far');
    bg.setOrigin(0, 0);

    // Add a dark overlay for better text readability
    this.add.rectangle(
      CONFIG.GAME_WIDTH / 2,
      CONFIG.GAME_HEIGHT / 2,
      CONFIG.GAME_WIDTH,
      CONFIG.GAME_HEIGHT,
      0x000000,
      0.4
    );

    // Add subtle vignette effect
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.6);
    vignette.fillRect(0, 0, CONFIG.GAME_WIDTH, 60);
    vignette.fillRect(0, CONFIG.GAME_HEIGHT - 60, CONFIG.GAME_WIDTH, 60);

    // Animate background
    this.tweens.add({
      targets: bg,
      tilePositionX: 50,
      duration: 20000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  private createTitle(centerX: number): void {
    // Main title
    this.titleText = this.add.text(centerX, 80, 'ADVENTURER', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#f4e4c1',
      stroke: '#1a0a20',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, 120, 'Journey to Castle Dracula', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#8b2942'
    }).setOrigin(0.5);

    // Title glow animation
    this.tweens.add({
      targets: this.titleText,
      alpha: { from: 1, to: 0.8 },
      duration: 2000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  private createMenuButtons(centerX: number, centerY: number): void {
    const buttonY = centerY + 40;
    const buttonSpacing = 50;

    // Start Game button
    this.startButton = this.createButton(centerX, buttonY, 'START GAME', () => {
      this.startGame();
    });
    this.menuItems.push(this.startButton);

    // Settings button
    this.settingsButton = this.createButton(centerX, buttonY + buttonSpacing, 'SETTINGS', () => {
      this.openSettings();
    });
    this.menuItems.push(this.settingsButton);

    // Version/credits at bottom
    this.add.text(centerX, CONFIG.GAME_HEIGHT - 20, 'v0.1.0 - A Castlevania-inspired Adventure', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#4a4a5a'
    }).setOrigin(0.5);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.rectangle(0, 0, 180, 36, 0x1a0a20, 0.8);
    bg.setStrokeStyle(2, COLORS.TWILIGHT);

    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#f4e4c1'
    }).setOrigin(0.5);

    container.add([bg, buttonText]);
    container.setSize(180, 36);

    // Make interactive
    container.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.selectedIndex = this.menuItems.indexOf(container);
        this.updateSelection();
      })
      .on('pointerdown', () => {
        this.selectButton(callback);
      });

    // Store callback for keyboard selection
    container.setData('callback', callback);
    container.setData('bg', bg);
    container.setData('text', buttonText);

    return container;
  }

  private setupInput(): void {
    this.selectKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Also allow SPACE and Z for selection
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const zKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // Navigation
    this.input.keyboard!.on('keydown-UP', () => this.navigateMenu(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.navigateMenu(1));
    this.input.keyboard!.on('keydown-W', () => this.navigateMenu(-1));
    this.input.keyboard!.on('keydown-S', () => this.navigateMenu(1));

    // Selection
    this.selectKey.on('down', () => this.selectCurrentButton());
    spaceKey.on('down', () => this.selectCurrentButton());
    zKey.on('down', () => this.selectCurrentButton());
  }

  private navigateMenu(direction: number): void {
    this.selectedIndex = Phaser.Math.Wrap(
      this.selectedIndex + direction,
      0,
      this.menuItems.length
    );
    this.updateSelection();

    // Play navigation sound (if available)
    if (this.sound.get('sfx_coin')) {
      this.sound.play('sfx_coin', { volume: 0.3 });
    }
  }

  private updateSelection(): void {
    this.menuItems.forEach((item, index) => {
      const bg = item.getData('bg') as Phaser.GameObjects.Rectangle;
      const text = item.getData('text') as Phaser.GameObjects.Text;

      if (index === this.selectedIndex) {
        // Selected state
        bg.setFillStyle(COLORS.TWILIGHT, 0.9);
        bg.setStrokeStyle(2, COLORS.MOON);
        text.setColor('#ffffff');

        // Selection animation
        this.tweens.add({
          targets: item,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100,
          ease: 'Power2'
        });
      } else {
        // Unselected state
        bg.setFillStyle(0x1a0a20, 0.8);
        bg.setStrokeStyle(2, COLORS.TWILIGHT);
        text.setColor('#f4e4c1');

        this.tweens.add({
          targets: item,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
          ease: 'Power2'
        });
      }
    });
  }

  private selectCurrentButton(): void {
    const selectedItem = this.menuItems[this.selectedIndex];
    const callback = selectedItem.getData('callback') as () => void;
    this.selectButton(callback);
  }

  private selectButton(callback: () => void): void {
    // Play selection sound
    if (this.sound.get('sfx_attack')) {
      this.sound.play('sfx_attack', { volume: 0.5 });
    }

    // Flash effect
    this.cameras.main.flash(100, 255, 255, 255, false);

    // Execute callback after brief delay
    this.time.delayedCall(150, callback);
  }

  private startGame(): void {
    // Fade out and start game
    this.cameras.main.fadeOut(500, 10, 5, 16);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
      this.scene.start('UIScene');
    });
  }

  private openSettings(): void {
    // Launch settings scene as overlay
    this.scene.launch('SettingsScene');
    this.scene.pause();
  }
}
