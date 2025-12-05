import Phaser from 'phaser';
import { CONFIG, COLORS } from '../config';
import { SettingsManager } from '../systems/SettingsManager';

/**
 * SettingsScene
 * Settings menu for volume and keybindings configuration
 */
export class SettingsScene extends Phaser.Scene {
  private selectedIndex: number = 0;
  private menuItems: SettingsMenuItem[] = [];
  private isRebinding: boolean = false;
  private rebindAction: string | null = null;
  private rebindText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    const centerX = CONFIG.GAME_WIDTH / 2;

    // Semi-transparent background overlay
    this.add.rectangle(
      CONFIG.GAME_WIDTH / 2,
      CONFIG.GAME_HEIGHT / 2,
      CONFIG.GAME_WIDTH,
      CONFIG.GAME_HEIGHT,
      0x0a0510,
      0.95
    );

    // Title
    this.add.text(centerX, 40, 'SETTINGS', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#f4e4c1',
      stroke: '#1a0a20',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Create settings sections
    this.createAudioSettings(centerX, 80);
    this.createKeybindingSettings(centerX, 180);
    this.createBackButton(centerX, CONFIG.GAME_HEIGHT - 50);

    // Setup input
    this.setupInput();

    // Initial selection
    this.updateSelection();
  }

  private createAudioSettings(centerX: number, startY: number): void {
    // Section title
    this.add.text(centerX, startY, '- AUDIO -', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: COLORS.TWILIGHT.toString(16).padStart(6, '0').replace(/^/, '#')
    }).setOrigin(0.5);

    // Music Volume slider
    const musicSlider = this.createSlider(
      centerX,
      startY + 30,
      'Music Volume',
      SettingsManager.getMusicVolume(),
      (value) => SettingsManager.setMusicVolume(value)
    );
    this.menuItems.push(musicSlider);

    // SFX Volume slider
    const sfxSlider = this.createSlider(
      centerX,
      startY + 60,
      'SFX Volume',
      SettingsManager.getSFXVolume(),
      (value) => SettingsManager.setSFXVolume(value)
    );
    this.menuItems.push(sfxSlider);
  }

  private createKeybindingSettings(centerX: number, startY: number): void {
    // Section title
    this.add.text(centerX, startY, '- CONTROLS -', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#8b2942'
    }).setOrigin(0.5);

    const bindings = SettingsManager.getKeybindings();
    let yOffset = startY + 25;

    // Create keybinding items for each action
    const actions: { key: keyof typeof bindings; label: string }[] = [
      { key: 'left', label: 'Move Left' },
      { key: 'right', label: 'Move Right' },
      { key: 'jump', label: 'Jump' },
      { key: 'attack', label: 'Attack' },
      { key: 'subWeapon', label: 'Sub-Weapon' }
    ];

    actions.forEach((action) => {
      const keybindItem = this.createKeybindItem(
        centerX,
        yOffset,
        action.label,
        action.key,
        bindings[action.key]
      );
      this.menuItems.push(keybindItem);
      yOffset += 25;
    });
  }

  private createSlider(
    x: number,
    y: number,
    label: string,
    initialValue: number,
    onChange: (value: number) => void
  ): SettingsMenuItem {
    const container = this.add.container(x, y);

    // Label
    const labelText = this.add.text(-140, 0, label, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#f4e4c1'
    }).setOrigin(0, 0.5);

    // Slider background
    const sliderBg = this.add.rectangle(50, 0, 120, 8, 0x1a0a20);
    sliderBg.setStrokeStyle(1, 0x4a4a5a);

    // Slider fill
    const sliderFill = this.add.rectangle(
      50 - 60 + (initialValue * 120) / 2,
      0,
      initialValue * 120,
      6,
      COLORS.TWILIGHT
    );
    sliderFill.setOrigin(0, 0.5);
    sliderFill.x = 50 - 60;

    // Value text
    const valueText = this.add.text(130, 0, `${Math.round(initialValue * 100)}%`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#f4e4c1'
    }).setOrigin(0, 0.5);

    // Selection indicator
    const indicator = this.add.text(-160, 0, '>', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: COLORS.MOON.toString(16).padStart(6, '0').replace(/^/, '#')
    }).setOrigin(0.5).setVisible(false);

    container.add([labelText, sliderBg, sliderFill, valueText, indicator]);

    let currentValue = initialValue;

    return {
      container,
      type: 'slider',
      indicator,
      getValue: () => currentValue,
      setValue: (value: number) => {
        currentValue = Phaser.Math.Clamp(value, 0, 1);
        sliderFill.width = currentValue * 120;
        valueText.setText(`${Math.round(currentValue * 100)}%`);
        onChange(currentValue);
      },
      adjust: (delta: number) => {
        const newValue = Phaser.Math.Clamp(currentValue + delta * 0.1, 0, 1);
        currentValue = newValue;
        sliderFill.width = currentValue * 120;
        valueText.setText(`${Math.round(currentValue * 100)}%`);
        onChange(currentValue);

        // Play sound for feedback
        if (this.sound.get('sfx_coin')) {
          this.sound.play('sfx_coin', { volume: currentValue * 0.5 });
        }
      }
    };
  }

  private createKeybindItem(
    x: number,
    y: number,
    label: string,
    actionKey: string,
    currentKeys: string[]
  ): SettingsMenuItem {
    const container = this.add.container(x, y);

    // Label
    const labelText = this.add.text(-140, 0, label, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#f4e4c1'
    }).setOrigin(0, 0.5);

    // Current binding display
    const bindingBg = this.add.rectangle(60, 0, 100, 20, 0x1a0a20);
    bindingBg.setStrokeStyle(1, 0x4a4a5a);

    const bindingText = this.add.text(60, 0, currentKeys.join(', '), {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Selection indicator
    const indicator = this.add.text(-160, 0, '>', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#f4e4c1'
    }).setOrigin(0.5).setVisible(false);

    container.add([labelText, bindingBg, bindingText, indicator]);

    return {
      container,
      type: 'keybind',
      indicator,
      actionKey,
      bindingText,
      bindingBg,
      updateBinding: (keys: string[]) => {
        bindingText.setText(keys.join(', '));
      }
    };
  }

  private createBackButton(centerX: number, y: number): void {
    const container = this.add.container(centerX, y);

    const bg = this.add.rectangle(0, 0, 120, 30, 0x1a0a20, 0.8);
    bg.setStrokeStyle(2, COLORS.TWILIGHT);

    const text = this.add.text(0, 0, 'BACK', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#f4e4c1'
    }).setOrigin(0.5);

    const indicator = this.add.text(-80, 0, '>', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#f4e4c1'
    }).setOrigin(0.5).setVisible(false);

    container.add([bg, text, indicator]);
    container.setSize(120, 30);
    container.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.selectedIndex = this.menuItems.length;
        this.updateSelection();
      })
      .on('pointerdown', () => {
        this.goBack();
      });

    this.menuItems.push({
      container,
      type: 'button',
      indicator,
      action: () => this.goBack()
    });
  }

  private setupInput(): void {
    // Navigation
    this.input.keyboard!.on('keydown-UP', () => {
      if (!this.isRebinding) this.navigateMenu(-1);
    });
    this.input.keyboard!.on('keydown-DOWN', () => {
      if (!this.isRebinding) this.navigateMenu(1);
    });
    this.input.keyboard!.on('keydown-W', () => {
      if (!this.isRebinding) this.navigateMenu(-1);
    });
    this.input.keyboard!.on('keydown-S', () => {
      if (!this.isRebinding) this.navigateMenu(1);
    });

    // Adjust sliders
    this.input.keyboard!.on('keydown-LEFT', () => {
      if (!this.isRebinding) this.adjustSelected(-1);
    });
    this.input.keyboard!.on('keydown-RIGHT', () => {
      if (!this.isRebinding) this.adjustSelected(1);
    });
    this.input.keyboard!.on('keydown-A', () => {
      if (!this.isRebinding) this.adjustSelected(-1);
    });
    this.input.keyboard!.on('keydown-D', () => {
      if (!this.isRebinding) this.adjustSelected(1);
    });

    // Select/Confirm
    this.input.keyboard!.on('keydown-ENTER', () => {
      if (!this.isRebinding) this.selectCurrent();
    });
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (!this.isRebinding) this.selectCurrent();
    });
    this.input.keyboard!.on('keydown-Z', () => {
      if (!this.isRebinding) this.selectCurrent();
    });

    // Back/Cancel
    this.input.keyboard!.on('keydown-ESC', () => {
      if (this.isRebinding) {
        this.cancelRebind();
      } else {
        this.goBack();
      }
    });
    this.input.keyboard!.on('keydown-X', () => {
      if (this.isRebinding) {
        this.cancelRebind();
      } else {
        this.goBack();
      }
    });

    // Listen for any key during rebinding
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (this.isRebinding && this.rebindAction) {
        // Ignore modifier keys and escape
        if (['Shift', 'Control', 'Alt', 'Meta', 'Escape'].includes(event.key)) {
          return;
        }

        this.completeRebind(event.code);
      }
    });
  }

  private navigateMenu(direction: number): void {
    this.selectedIndex = Phaser.Math.Wrap(
      this.selectedIndex + direction,
      0,
      this.menuItems.length
    );
    this.updateSelection();
  }

  private updateSelection(): void {
    this.menuItems.forEach((item, index) => {
      if (item.indicator) {
        item.indicator.setVisible(index === this.selectedIndex);
      }
    });
  }

  private adjustSelected(delta: number): void {
    const item = this.menuItems[this.selectedIndex];
    if (item.type === 'slider' && item.adjust) {
      item.adjust(delta);
    }
  }

  private selectCurrent(): void {
    const item = this.menuItems[this.selectedIndex];

    if (item.type === 'button' && item.action) {
      item.action();
    } else if (item.type === 'keybind') {
      this.startRebind(item);
    }
  }

  private startRebind(item: SettingsMenuItem): void {
    if (!item.actionKey || !item.bindingText || !item.bindingBg) return;

    this.isRebinding = true;
    this.rebindAction = item.actionKey;
    this.rebindText = item.bindingText;

    // Visual feedback
    item.bindingText.setText('Press key...');
    item.bindingText.setColor('#ffff00');
    item.bindingBg.setStrokeStyle(2, 0xffff00);
  }

  private completeRebind(keyCode: string): void {
    if (!this.rebindAction || !this.rebindText) return;

    // Convert key code to display name
    const keyName = this.keyCodeToName(keyCode);

    // Update keybinding
    SettingsManager.setKeybinding(this.rebindAction, [keyName]);

    // Update display
    const item = this.menuItems[this.selectedIndex];
    if (item.bindingText && item.bindingBg) {
      item.bindingText.setText(keyName);
      item.bindingText.setColor('#aaaaaa');
      item.bindingBg.setStrokeStyle(1, 0x4a4a5a);
    }

    // Play confirmation sound
    if (this.sound.get('sfx_coin')) {
      this.sound.play('sfx_coin', { volume: 0.5 });
    }

    this.isRebinding = false;
    this.rebindAction = null;
    this.rebindText = null;
  }

  private cancelRebind(): void {
    if (!this.rebindAction) return;

    // Restore original display
    const item = this.menuItems[this.selectedIndex];
    const bindings = SettingsManager.getKeybindings();
    const originalKeys = bindings[this.rebindAction as keyof typeof bindings];

    if (item.bindingText && item.bindingBg) {
      item.bindingText.setText(originalKeys.join(', '));
      item.bindingText.setColor('#aaaaaa');
      item.bindingBg.setStrokeStyle(1, 0x4a4a5a);
    }

    this.isRebinding = false;
    this.rebindAction = null;
    this.rebindText = null;
  }

  private keyCodeToName(keyCode: string): string {
    // Convert key codes like "KeyA" to "A", "ArrowUp" to "UP"
    if (keyCode.startsWith('Key')) {
      return keyCode.substring(3);
    }
    if (keyCode.startsWith('Arrow')) {
      return keyCode.substring(5).toUpperCase();
    }
    if (keyCode.startsWith('Digit')) {
      return keyCode.substring(5);
    }
    // Handle special keys
    const specialKeys: Record<string, string> = {
      'Space': 'SPACE',
      'Enter': 'ENTER',
      'ShiftLeft': 'SHIFT',
      'ShiftRight': 'SHIFT',
      'ControlLeft': 'CTRL',
      'ControlRight': 'CTRL',
      'AltLeft': 'ALT',
      'AltRight': 'ALT'
    };
    return specialKeys[keyCode] || keyCode.toUpperCase();
  }

  private goBack(): void {
    // Save settings
    SettingsManager.save();

    // Play sound
    if (this.sound.get('sfx_attack')) {
      this.sound.play('sfx_attack', { volume: 0.3 });
    }

    // Resume main menu and stop this scene
    this.scene.resume('MainMenuScene');
    this.scene.stop();
  }
}

interface SettingsMenuItem {
  container: Phaser.GameObjects.Container;
  type: 'slider' | 'keybind' | 'button';
  indicator: Phaser.GameObjects.Text;
  getValue?: () => number;
  setValue?: (value: number) => void;
  adjust?: (delta: number) => void;
  action?: () => void;
  actionKey?: string;
  bindingText?: Phaser.GameObjects.Text;
  bindingBg?: Phaser.GameObjects.Rectangle;
  updateBinding?: (keys: string[]) => void;
}
