import { CONFIG } from '../config';

/**
 * GameState
 * Global game state manager (singleton pattern via static class)
 * Handles coins, kills, unlocks, save/load
 */
export class GameState {
  // Player resources
  static coins: number = 0;
  static maxHealth: number = CONFIG.PLAYER.MAX_HEALTH;
  
  // Progression
  static unlockedItems: string[] = [];
  static inventory: string[] = [];
  static equippedSubWeapon: string = '';
  
  // Statistics
  static enemiesKilled: number = 0;
  static deaths: number = 0;
  static totalCoinsCollected: number = 0;
  static playTime: number = 0;
  
  // Level state
  static currentLevel: string = 'borgo_pass';
  static checkpointPosition: { x: number; y: number } | null = null;

  /**
   * Reset all state to initial values
   */
  static reset(): void {
    this.coins = 0;
    this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;
    this.unlockedItems = [];
    this.inventory = [];
    this.equippedSubWeapon = '';
    this.enemiesKilled = 0;
    this.deaths = 0;
    this.totalCoinsCollected = 0;
    this.playTime = 0;
    this.checkpointPosition = null;
  }

  // COINS ============================================================

  static addCoins(amount: number): void {
    this.coins += amount;
    this.totalCoinsCollected += amount;
  }

  static spendCoins(amount: number): boolean {
    if (this.coins >= amount) {
      this.coins -= amount;
      return true;
    }
    return false;
  }

  static canAfford(amount: number): boolean {
    return this.coins >= amount;
  }

  // SHOP ============================================================

  static purchaseItem(itemId: string, price: number): boolean {
    if (!this.canAfford(price)) {
      return false;
    }

    this.spendCoins(price);
    
    // Apply purchase based on item type
    switch (itemId) {
      case 'health_potion':
        this.inventory.push(itemId);
        break;
      case 'silver_knife':
      case 'holy_water':
      case 'crucifix':
        if (!this.unlockedItems.includes(itemId)) {
          this.unlockedItems.push(itemId);
        }
        this.equippedSubWeapon = itemId;
        break;
      case 'health_upgrade':
        this.maxHealth += CONFIG.SHOP.HEALTH_UPGRADE.bonus;
        this.unlockedItems.push(`${itemId}_${Date.now()}`); // Unique for stackable
        break;
      case 'attack_boost':
        // Would need to communicate with player
        this.unlockedItems.push(`${itemId}_${Date.now()}`);
        break;
    }

    return true;
  }

  static useItem(itemId: string): boolean {
    const index = this.inventory.indexOf(itemId);
    if (index === -1) {
      return false;
    }
    
    this.inventory.splice(index, 1);
    return true;
  }

  static hasItem(itemId: string): boolean {
    return this.inventory.includes(itemId) || this.unlockedItems.includes(itemId);
  }

  static getItemCount(itemId: string): number {
    return this.inventory.filter(item => item === itemId).length;
  }

  // STATISTICS ============================================================

  static recordKill(): void {
    this.enemiesKilled++;
  }

  static recordDeath(): void {
    this.deaths++;
  }

  static updatePlayTime(delta: number): void {
    this.playTime += delta;
  }

  // CHECKPOINTS ============================================================

  static setCheckpoint(x: number, y: number): void {
    this.checkpointPosition = { x, y };
  }

  static getCheckpoint(): { x: number; y: number } | null {
    return this.checkpointPosition;
  }

  // SAVE/LOAD ============================================================

  static save(): void {
    const saveData = {
      coins: this.coins,
      maxHealth: this.maxHealth,
      unlockedItems: this.unlockedItems,
      inventory: this.inventory,
      equippedSubWeapon: this.equippedSubWeapon,
      enemiesKilled: this.enemiesKilled,
      deaths: this.deaths,
      totalCoinsCollected: this.totalCoinsCollected,
      playTime: this.playTime,
      currentLevel: this.currentLevel,
      checkpointPosition: this.checkpointPosition
    };

    try {
      localStorage.setItem('adventurer_save', JSON.stringify(saveData));
    } catch (e) {
      console.warn('Failed to save game:', e);
    }
  }

  static load(): boolean {
    try {
      const saveDataString = localStorage.getItem('adventurer_save');
      if (!saveDataString) {
        return false;
      }

      const saveData = JSON.parse(saveDataString);
      
      this.coins = saveData.coins ?? 0;
      this.maxHealth = saveData.maxHealth ?? CONFIG.PLAYER.MAX_HEALTH;
      this.unlockedItems = saveData.unlockedItems ?? [];
      this.inventory = saveData.inventory ?? [];
      this.equippedSubWeapon = saveData.equippedSubWeapon ?? '';
      this.enemiesKilled = saveData.enemiesKilled ?? 0;
      this.deaths = saveData.deaths ?? 0;
      this.totalCoinsCollected = saveData.totalCoinsCollected ?? 0;
      this.playTime = saveData.playTime ?? 0;
      this.currentLevel = saveData.currentLevel ?? 'borgo_pass';
      this.checkpointPosition = saveData.checkpointPosition ?? null;

      return true;
    } catch (e) {
      console.warn('Failed to load game:', e);
      return false;
    }
  }

  static deleteSave(): void {
    try {
      localStorage.removeItem('adventurer_save');
    } catch (e) {
      console.warn('Failed to delete save:', e);
    }
  }

  static hasSave(): boolean {
    try {
      return localStorage.getItem('adventurer_save') !== null;
    } catch (e) {
      return false;
    }
  }

  // DEBUG ============================================================

  static getDebugInfo(): string {
    return [
      `Coins: ${this.coins}`,
      `Max HP: ${this.maxHealth}`,
      `Kills: ${this.enemiesKilled}`,
      `Deaths: ${this.deaths}`,
      `Play Time: ${Math.floor(this.playTime / 1000)}s`,
      `Items: ${this.inventory.length}`,
      `Unlocks: ${this.unlockedItems.length}`
    ].join('\n');
  }
}
