import Phaser from 'phaser';

/**
 * BootScene
 * First scene - sets up any initial configuration before loading assets
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Set up any global game settings here
    
    // Proceed to preload
    this.scene.start('PreloadScene');
  }
}
