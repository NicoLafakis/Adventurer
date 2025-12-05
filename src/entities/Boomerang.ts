import Phaser from 'phaser';
import { CONFIG, WORLD_SCALE } from '../config';
import { Player } from './Player';

/**
 * Boomerang
 * Thrown weapon that travels outward and returns to the player
 *
 * Behavior:
 * - Travels up to 4x player width before returning
 * - Returns early if it hits an enemy or surface
 * - Future: "pierce" power-up allows passing through enemies
 */

enum BoomerangPhase {
  OUTGOING,
  RETURNING
}

export class Boomerang extends Phaser.Physics.Arcade.Sprite {
  damage: number;
  private speed: number;
  private direction: number;
  private phase: BoomerangPhase = BoomerangPhase.OUTGOING;
  private startX: number;
  private maxRange: number;
  private player: Player;
  private canPierce: boolean = false; // Future power-up
  private rotationTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, facingRight: boolean, player: Player) {
    super(scene, x, y, 'boomerang');

    // Add to scene and physics
    scene.add.existing(this as Phaser.GameObjects.GameObject);
    scene.physics.add.existing(this as Phaser.GameObjects.GameObject);

    // Store reference to player for return behavior
    this.player = player;

    // Initialize
    this.damage = CONFIG.PLAYER.PROJECTILE_DAMAGE;
    this.speed = CONFIG.PLAYER.PROJECTILE_SPEED;
    this.direction = facingRight ? 1 : -1;
    this.startX = x;

    // Max range is 4x the player width (32px sprite * WORLD_SCALE * 4)
    this.maxRange = 32 * WORLD_SCALE * 4;

    // Setup physics body (unscaled - sprite scale is applied by GameScene)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 12);
    body.setOffset(2, 2);
    body.setAllowGravity(false);
    body.setVelocityX(this.speed * this.direction);

    // Visual setup
    this.setDepth(8);

    // Spinning animation
    this.rotationTween = scene.tweens.add({
      targets: this,
      angle: this.direction > 0 ? 360 : -360,
      duration: 200,
      repeat: -1
    });
  }

  update(_time: number, _delta: number): void {
    if (!this.active) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.phase === BoomerangPhase.OUTGOING) {
      // Check if reached max range
      const distanceTraveled = Math.abs(this.x - this.startX);
      if (distanceTraveled >= this.maxRange) {
        this.startReturn();
      }
    } else if (this.phase === BoomerangPhase.RETURNING) {
      // Move towards player
      const angleToPlayer = Phaser.Math.Angle.Between(
        this.x, this.y,
        this.player.x, this.player.y
      );

      // Increase speed slightly when returning for satisfying catch
      const returnSpeed = this.speed * 1.2;
      body.setVelocity(
        Math.cos(angleToPlayer) * returnSpeed,
        Math.sin(angleToPlayer) * returnSpeed
      );

      // Check if caught by player (close enough)
      const distanceToPlayer = Phaser.Math.Distance.Between(
        this.x, this.y,
        this.player.x, this.player.y
      );

      if (distanceToPlayer < 20 * WORLD_SCALE) {
        this.onCaught();
      }
    }
  }

  /**
   * Called when boomerang hits a wall/platform
   */
  onHitWall(): void {
    if (this.phase === BoomerangPhase.OUTGOING) {
      this.startReturn();
    }
  }

  /**
   * Called when boomerang hits an enemy
   */
  onHitEnemy(): void {
    // Flash effect
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.active) this.clearTint();
    });

    // If we can pierce, just continue (future power-up)
    if (this.canPierce) {
      return;
    }

    // Otherwise, start returning
    if (this.phase === BoomerangPhase.OUTGOING) {
      this.startReturn();
    }
  }

  /**
   * Start the return journey to the player
   */
  private startReturn(): void {
    this.phase = BoomerangPhase.RETURNING;

    // Reverse spin direction for visual feedback
    if (this.rotationTween) {
      this.rotationTween.stop();
    }
    this.rotationTween = this.scene.tweens.add({
      targets: this,
      angle: this.direction > 0 ? -360 : 360,
      duration: 150, // Faster spin when returning
      repeat: -1
    });
  }

  /**
   * Called when player catches the returning boomerang
   */
  private onCaught(): void {
    // Small particle/flash effect could go here
    this.destroy();
  }

  /**
   * Enable pierce mode (for power-up)
   */
  enablePierce(): void {
    this.canPierce = true;
    // Visual indicator - slight color tint
    this.setTint(0x88ffff);
  }

  /**
   * Check if boomerang is returning
   */
  isReturning(): boolean {
    return this.phase === BoomerangPhase.RETURNING;
  }

  destroy(fromScene?: boolean): void {
    if (this.rotationTween) {
      this.rotationTween.stop();
      this.rotationTween = null;
    }
    super.destroy(fromScene);
  }
}
