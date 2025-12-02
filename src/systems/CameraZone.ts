import Phaser from 'phaser';

/**
 * CameraZone
 * Defines areas where the camera behaves differently
 * 
 * Usage:
 * - Wide vistas: Low zoom (0.6-0.8) to show off the environment
 * - Tight corridors: High zoom (1.3-1.6) for claustrophobic tension
 * - Boss arenas: Medium zoom (0.8-1.0) to see the whole fight
 * - Story beats: Custom zoom to frame the scene
 */
export class CameraZone {
  private scene: Phaser.Scene;
  private bounds: Phaser.Geom.Rectangle;
  
  // Zone properties
  zoom: number;
  name: string;
  
  // Optional properties
  priority: number;
  oneShot: boolean;
  private hasTriggered: boolean = false;

  constructor(
    scene: Phaser.Scene,
    bounds: Phaser.Geom.Rectangle,
    zoom: number,
    name: string = 'unnamed',
    options: {
      priority?: number;
      oneShot?: boolean;
    } = {}
  ) {
    this.scene = scene;
    this.bounds = bounds;
    this.zoom = zoom;
    this.name = name;
    
    this.priority = options.priority ?? 0;
    this.oneShot = options.oneShot ?? false;
  }

  /**
   * Check if a point is within this zone
   */
  contains(x: number, y: number): boolean {
    if (this.oneShot && this.hasTriggered) {
      return false;
    }
    
    const result = this.bounds.contains(x, y);
    
    if (result && this.oneShot) {
      this.hasTriggered = true;
    }
    
    return result;
  }

  /**
   * Get the zone bounds (for debug visualization)
   */
  getBounds(): Phaser.Geom.Rectangle {
    return this.bounds;
  }

  /**
   * Reset one-shot zone (if you want to reuse it)
   */
  reset(): void {
    this.hasTriggered = false;
  }

  /**
   * Debug visualization - draw the zone bounds
   */
  debugDraw(graphics: Phaser.GameObjects.Graphics, color: number = 0x00ff00): void {
    graphics.lineStyle(1, color, 0.5);
    graphics.strokeRect(
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    );
    
    // Draw zone name
    const text = this.scene.add.text(
      this.bounds.x + 4,
      this.bounds.y + 4,
      `${this.name}\nzoom: ${this.zoom}`,
      {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#00ff00'
      }
    );
    text.setAlpha(0.5);
  }
}

/**
 * CameraZoneManager
 * Manages multiple camera zones and determines which one is active
 */
export class CameraZoneManager {
  private zones: CameraZone[] = [];
  private currentZone: CameraZone | null = null;

  addZone(zone: CameraZone): void {
    this.zones.push(zone);
    // Sort by priority (higher priority first)
    this.zones.sort((a, b) => b.priority - a.priority);
  }

  removeZone(zone: CameraZone): void {
    const index = this.zones.indexOf(zone);
    if (index !== -1) {
      this.zones.splice(index, 1);
    }
  }

  /**
   * Get the active zone for a given position
   * Returns the highest priority zone that contains the point
   */
  getActiveZone(x: number, y: number): CameraZone | null {
    for (const zone of this.zones) {
      if (zone.contains(x, y)) {
        return zone;
      }
    }
    return null;
  }

  /**
   * Update and return the current zone (tracks zone changes)
   */
  update(x: number, y: number): {
    zone: CameraZone | null;
    changed: boolean;
  } {
    const newZone = this.getActiveZone(x, y);
    const changed = newZone !== this.currentZone;
    this.currentZone = newZone;
    
    return { zone: newZone, changed };
  }

  /**
   * Get all zones (for debug visualization)
   */
  getAllZones(): CameraZone[] {
    return this.zones;
  }

  /**
   * Clear all zones
   */
  clear(): void {
    this.zones = [];
    this.currentZone = null;
  }
}
