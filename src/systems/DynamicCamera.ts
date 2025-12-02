import Phaser from 'phaser';
import { CONFIG } from '../config';
import { Player } from '../entities/Player';

/**
 * DynamicCamera
 * THE signature camera system for Adventurer
 * 
 * Features:
 * - Context-aware zoom (wide for vistas, tight for corridors)
 * - Smooth zoom transitions
 * - Look-ahead based on player movement
 * - Screen shake for impacts
 * - Cinematic framing
 * 
 * Philosophy:
 * - Zoom OUT for vistas, boss arenas, moments of awe
 * - Zoom IN for tight corridors, intense combat, intimate moments
 * - Always smooth, never jarring
 * - Feel like a cinematographer is operating it
 */
export class DynamicCamera {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private target: Player;
  
  // Zoom state
  currentZoom: number;
  private targetZoom: number;
  
  // Look-ahead
  private lookAheadOffset: Phaser.Math.Vector2;
  private lastTargetPosition: Phaser.Math.Vector2;
  
  // Shake
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeTimer: number = 0;

  constructor(scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera, target: Player) {
    this.scene = scene;
    this.camera = camera;
    this.target = target;
    
    // Initialize zoom
    this.currentZoom = CONFIG.CAMERA.DEFAULT_ZOOM;
    this.targetZoom = CONFIG.CAMERA.DEFAULT_ZOOM;
    this.camera.setZoom(this.currentZoom);
    
    // Initialize look-ahead
    this.lookAheadOffset = new Phaser.Math.Vector2(0, 0);
    this.lastTargetPosition = new Phaser.Math.Vector2(target.x, target.y);
  }

  update(delta: number): void {
    this.updateZoom(delta);
    this.updateLookAhead(delta);
    this.updateShake(delta);
  }

  /**
   * Smoothly transition to target zoom level
   */
  private updateZoom(_delta: number): void {
    if (Math.abs(this.currentZoom - this.targetZoom) < 0.001) {
      this.currentZoom = this.targetZoom;
      return;
    }
    
    // Smooth lerp towards target zoom
    this.currentZoom = Phaser.Math.Linear(
      this.currentZoom,
      this.targetZoom,
      CONFIG.CAMERA.ZOOM_SPEED
    );
    
    this.camera.setZoom(this.currentZoom);
  }

  /**
   * Look ahead in the direction of player movement
   */
  private updateLookAhead(_delta: number): void {
    // Calculate player velocity
    const velocityX = this.target.x - this.lastTargetPosition.x;
    const velocityY = this.target.y - this.lastTargetPosition.y;
    
    this.lastTargetPosition.set(this.target.x, this.target.y);
    
    // Calculate target look-ahead offset
    let targetLookAheadX = 0;
    let targetLookAheadY = 0;
    
    // Only look ahead if moving significantly
    if (Math.abs(velocityX) > 0.5) {
      targetLookAheadX = Math.sign(velocityX) * CONFIG.CAMERA.LOOK_AHEAD_DISTANCE;
    }
    
    // Slight vertical look-ahead when jumping/falling
    if (Math.abs(velocityY) > 2) {
      targetLookAheadY = Math.sign(velocityY) * CONFIG.CAMERA.LOOK_AHEAD_DISTANCE * 0.3;
    }
    
    // Smooth the look-ahead movement
    this.lookAheadOffset.x = Phaser.Math.Linear(
      this.lookAheadOffset.x,
      targetLookAheadX,
      CONFIG.CAMERA.LOOK_AHEAD_SPEED
    );
    
    this.lookAheadOffset.y = Phaser.Math.Linear(
      this.lookAheadOffset.y,
      targetLookAheadY,
      CONFIG.CAMERA.LOOK_AHEAD_SPEED
    );
    
    // Apply look-ahead by adjusting follow offset
    this.camera.setFollowOffset(
      -this.lookAheadOffset.x,
      -this.lookAheadOffset.y
    );
  }

  /**
   * Apply screen shake effect
   */
  private updateShake(delta: number): void {
    if (this.shakeTimer <= 0) return;
    
    this.shakeTimer -= delta;
    
    // Calculate shake offset using perlin-like movement
    const progress = 1 - (this.shakeTimer / this.shakeDuration);
    const decay = 1 - progress; // Decay over time
    
    const shakeX = (Math.random() - 0.5) * 2 * this.shakeIntensity * decay * 10;
    const shakeY = (Math.random() - 0.5) * 2 * this.shakeIntensity * decay * 8;
    
    // Apply shake as camera scroll offset (doesn't affect actual position)
    this.camera.setScroll(
      this.camera.scrollX + shakeX,
      this.camera.scrollY + shakeY
    );
    
    if (this.shakeTimer <= 0) {
      this.shakeIntensity = 0;
    }
  }

  // PUBLIC API ============================================================

  /**
   * Set the target zoom level (will transition smoothly)
   */
  setTargetZoom(zoom: number): void {
    this.targetZoom = Phaser.Math.Clamp(
      zoom,
      CONFIG.CAMERA.MIN_ZOOM,
      CONFIG.CAMERA.MAX_ZOOM
    );
  }

  /**
   * Instantly set zoom (no transition)
   */
  setZoomImmediate(zoom: number): void {
    this.targetZoom = Phaser.Math.Clamp(
      zoom,
      CONFIG.CAMERA.MIN_ZOOM,
      CONFIG.CAMERA.MAX_ZOOM
    );
    this.currentZoom = this.targetZoom;
    this.camera.setZoom(this.currentZoom);
  }

  /**
   * Add screen shake
   * @param intensity 0-1, how intense the shake is
   * @param duration Duration in ms (optional, defaults based on intensity)
   */
  shake(intensity: number = 0.5, duration?: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = duration ?? intensity * 200 + 100;
    this.shakeTimer = this.shakeDuration;
  }

  /**
   * Light shake - for small hits, coin collection
   */
  shakeSmall(): void {
    this.shake(0.2, 80);
  }

  /**
   * Medium shake - for taking damage, landing heavy attacks
   */
  shakeMedium(): void {
    this.shake(0.5, 150);
  }

  /**
   * Heavy shake - for boss attacks, explosions, death
   */
  shakeHeavy(): void {
    this.shake(0.8, 300);
  }

  /**
   * Cinematic zoom - smooth transition to a specific zoom for dramatic effect
   */
  cinematicZoom(zoom: number, duration: number = 1000): Promise<void> {
    return new Promise(resolve => {
      const endZoom = Phaser.Math.Clamp(zoom, CONFIG.CAMERA.MIN_ZOOM, CONFIG.CAMERA.MAX_ZOOM);
      
      this.scene.tweens.add({
        targets: this,
        currentZoom: endZoom,
        duration: duration,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          this.camera.setZoom(this.currentZoom);
        },
        onComplete: () => {
          this.targetZoom = endZoom;
          resolve();
        }
      });
    });
  }

  /**
   * Pan to a specific point, hold, then return
   */
  async cinematicPanTo(x: number, y: number, holdTime: number = 1000): Promise<void> {
    const originalFollow = this.target;
    const originalLerp = { x: this.camera.lerp.x, y: this.camera.lerp.y };
    
    // Stop following player
    this.camera.stopFollow();
    
    // Pan to point
    await new Promise<void>(resolve => {
      this.scene.tweens.add({
        targets: this.camera,
        scrollX: x - CONFIG.GAME_WIDTH / 2,
        scrollY: y - CONFIG.GAME_HEIGHT / 2,
        duration: 500,
        ease: 'Sine.easeInOut',
        onComplete: () => resolve()
      });
    });
    
    // Hold
    await new Promise<void>(resolve => {
      this.scene.time.delayedCall(holdTime, () => resolve());
    });
    
    // Pan back and resume following
    this.camera.startFollow(originalFollow, true, originalLerp.x, originalLerp.y);
  }

  /**
   * Get current zoom level
   */
  getZoom(): number {
    return this.currentZoom;
  }

  /**
   * Get target zoom level
   */
  getTargetZoom(): number {
    return this.targetZoom;
  }
}
