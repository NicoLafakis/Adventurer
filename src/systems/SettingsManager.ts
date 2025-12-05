import { CONFIG, KEYS } from '../config';

/**
 * SettingsManager
 * Handles game settings including audio volumes and keybindings
 * Persists to localStorage
 */

interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  keybindings: {
    left: string[];
    right: string[];
    jump: string[];
    attack: string[];
    subWeapon: string[];
  };
}

const STORAGE_KEY = 'adventurer_settings';

// Default settings
const defaultSettings: GameSettings = {
  musicVolume: CONFIG.AUDIO.MUSIC_VOLUME,
  sfxVolume: CONFIG.AUDIO.SFX_VOLUME,
  keybindings: {
    left: [...KEYS.LEFT],
    right: [...KEYS.RIGHT],
    jump: [...KEYS.JUMP],
    attack: [...KEYS.ATTACK],
    subWeapon: [...KEYS.SUB_WEAPON]
  }
};

// Current settings (loaded from storage or defaults)
let currentSettings: GameSettings = { ...defaultSettings };

export class SettingsManager {
  /**
   * Initialize settings - load from storage or use defaults
   */
  static init(): void {
    this.load();
  }

  /**
   * Load settings from localStorage
   */
  static load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        currentSettings = {
          ...defaultSettings,
          ...parsed,
          keybindings: {
            ...defaultSettings.keybindings,
            ...(parsed.keybindings || {})
          }
        };
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
      currentSettings = { ...defaultSettings };
    }
  }

  /**
   * Save current settings to localStorage
   */
  static save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  /**
   * Reset all settings to defaults
   */
  static reset(): void {
    currentSettings = { ...defaultSettings };
    this.save();
  }

  // Audio Volume Methods
  static getMusicVolume(): number {
    return currentSettings.musicVolume;
  }

  static setMusicVolume(volume: number): void {
    currentSettings.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  static getSFXVolume(): number {
    return currentSettings.sfxVolume;
  }

  static setSFXVolume(volume: number): void {
    currentSettings.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  // Keybinding Methods
  static getKeybindings(): GameSettings['keybindings'] {
    return { ...currentSettings.keybindings };
  }

  static getKeybinding(action: keyof GameSettings['keybindings']): string[] {
    return [...(currentSettings.keybindings[action] || [])];
  }

  static setKeybinding(action: string, keys: string[]): void {
    if (action in currentSettings.keybindings) {
      currentSettings.keybindings[action as keyof GameSettings['keybindings']] = [...keys];
    }
  }

  static addKeybinding(action: string, key: string): void {
    if (action in currentSettings.keybindings) {
      const bindings = currentSettings.keybindings[action as keyof GameSettings['keybindings']];
      if (!bindings.includes(key)) {
        bindings.push(key);
      }
    }
  }

  static removeKeybinding(action: string, key: string): void {
    if (action in currentSettings.keybindings) {
      const bindings = currentSettings.keybindings[action as keyof GameSettings['keybindings']];
      const index = bindings.indexOf(key);
      if (index > -1) {
        bindings.splice(index, 1);
      }
    }
  }

  /**
   * Get all current settings
   */
  static getAll(): GameSettings {
    return { ...currentSettings };
  }
}

// Need to import Phaser for Math.Clamp
import Phaser from 'phaser';

// Initialize settings on module load
SettingsManager.init();
