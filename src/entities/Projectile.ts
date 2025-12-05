import Phaser from 'phaser';
import { CONFIG } from '../config';

/**
 * Projectile
 * Thrown weapon (knife) that damages enemies
 */
export class Projectile extends Phaser.Physics.Arcade.Sprite {
  damage: number;
  private speed: number;
  private direction: number;
  private lifespan: number = 2000; // ms before auto-destroy
  private age: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, facingRight: boolean) {
    super(scene, x, y, 'knife');

    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Initialize
    this.damage = CONFIG.PLAYER.PROJECTILE_DAMAGE;
    this.speed = CONFIG.PLAYER.PROJECTILE_SPEED;
    this.direction = facingRight ? 1 : -1;

    // Setup physics body (unscaled - sprite scale is applied by GameScene)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(14, 6);
    body.setOffset(1, 1);
    body.setAllowGravity(false);
    body.setVelocityX(this.speed * this.direction);

    // Visual setup
    this.setDepth(8);
    this.setFlipX(!facingRight);

    // Slight rotation animation
    scene.tweens.add({
      targets: this,
      angle: facingRight ? 360 : -360,
      duration: 400,
      repeat: -1
    });
  }

  update(_time: number, delta: number): void {
    this.age += delta;

    // Destroy if too old or off screen
    if (this.age > this.lifespan) {
      this.destroy();
      return;
    }

    // Check if off screen
    const cam = this.scene.cameras.main;
    if (this.x < cam.scrollX - 50 || this.x > cam.scrollX + cam.width + 50) {
      this.destroy();
    }
  }

  onHitEnemy(): void {
    // Small flash effect then destroy
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      this.destroy();
    });
  }
}
