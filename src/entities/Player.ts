import Phaser from 'phaser';
import { CONFIG } from '../config';

/**
 * Player (Adventurer)
 * The main character - a traveler journeying to Castle Dracula
 * 
 * Features:
 * - Responsive movement with acceleration
 * - Variable jump height (hold for higher)
 * - Coyote time (jump after leaving platform)
 * - Jump buffering (press jump before landing)
 * - Attack with invincibility frames
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  // Stats
  health: number;
  maxHealth: number;
  damage: number;
  
  // State
  isAttacking: boolean = false;
  isInvincible: boolean = false;
  facingRight: boolean = true;
  isDead: boolean = false;
  
  // Timers (in ms)
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private invincibilityTimer: number = 0;
  private attackTimer: number = 0;
  private projectileCooldown: number = 0;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    // Initialize stats
    this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;
    this.health = this.maxHealth;
    this.damage = CONFIG.PLAYER.ATTACK_DAMAGE;
    
    // Set display properties
    this.setDepth(10);
  }

  update(_time: number, delta: number, keys: {
    left: Phaser.Input.Keyboard.Key[];
    right: Phaser.Input.Keyboard.Key[];
    jump: Phaser.Input.Keyboard.Key[];
    attack: Phaser.Input.Keyboard.Key[];
    subWeapon: Phaser.Input.Keyboard.Key[];
  }): void {
    if (this.isDead) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;

    // Update timers
    this.updateTimers(delta, onGround);

    // Handle input
    this.handleMovement(keys, delta);
    this.handleJump(keys, onGround);
    this.handleAttack(keys);
    this.handleSubWeapon(keys);
    
    // Update invincibility visual
    this.updateInvincibility(delta);
    
    // Clamp fall speed
    if (body.velocity.y > CONFIG.PLAYER.MAX_FALL_SPEED) {
      body.setVelocityY(CONFIG.PLAYER.MAX_FALL_SPEED);
    }
    
    // Update sprite flip
    this.setFlipX(!this.facingRight);
  }

  private updateTimers(delta: number, onGround: boolean): void {
    // Coyote time - reset when on ground, count down when in air
    if (onGround) {
      this.coyoteTimer = CONFIG.PLAYER.COYOTE_TIME;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= delta;
    }
    
    // Jump buffer countdown
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
    }
    
    // Attack timer
    if (this.attackTimer > 0) {
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }
    
    // Invincibility timer
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= delta;
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
        this.setAlpha(1);
      }
    }

    // Projectile cooldown
    if (this.projectileCooldown > 0) {
      this.projectileCooldown -= delta;
    }
  }

  private handleMovement(keys: {
    left: Phaser.Input.Keyboard.Key[];
    right: Phaser.Input.Keyboard.Key[];
  }, _delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    const leftPressed = keys.left.some(key => key.isDown);
    const rightPressed = keys.right.some(key => key.isDown);
    
    let targetVelocityX = 0;
    
    if (leftPressed && !rightPressed) {
      targetVelocityX = -CONFIG.PLAYER.MOVE_SPEED;
      this.facingRight = false;
    } else if (rightPressed && !leftPressed) {
      targetVelocityX = CONFIG.PLAYER.MOVE_SPEED;
      this.facingRight = true;
    }
    
    // Smooth acceleration/deceleration
    const currentVelocityX = body.velocity.x;
    const diff = targetVelocityX - currentVelocityX;
    const acceleration = Math.min(Math.abs(diff), 15); // Acceleration per frame
    
    if (diff > 0) {
      body.setVelocityX(currentVelocityX + acceleration);
    } else if (diff < 0) {
      body.setVelocityX(currentVelocityX - acceleration);
    }
  }

  private handleJump(keys: { jump: Phaser.Input.Keyboard.Key[] }, _onGround: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Check for jump press
    const jumpJustPressed = keys.jump.some(key => Phaser.Input.Keyboard.JustDown(key));
    const jumpPressed = keys.jump.some(key => key.isDown);
    
    // Buffer jump input
    if (jumpJustPressed) {
      this.jumpBufferTimer = CONFIG.PLAYER.JUMP_BUFFER_TIME;
    }
    
    // Execute jump if we have buffer and coyote time
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      body.setVelocityY(CONFIG.PLAYER.JUMP_FORCE);
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
    }
    
    // Variable jump height - cut jump short on release
    if (!jumpPressed && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * CONFIG.PLAYER.JUMP_CUT_MULTIPLIER);
    }
  }

  private handleAttack(keys: { attack: Phaser.Input.Keyboard.Key[] }): void {
    const attackJustPressed = keys.attack.some(key => Phaser.Input.Keyboard.JustDown(key));
    
    if (attackJustPressed && !this.isAttacking) {
      this.isAttacking = true;
      this.attackTimer = 300; // Attack duration in ms
      
      // Brief forward momentum during attack
      const body = this.body as Phaser.Physics.Arcade.Body;
      const attackBoost = this.facingRight ? 50 : -50;
      body.setVelocityX(body.velocity.x + attackBoost);
      
      // Visual feedback - flash white
      this.setTint(0xffffff);
      this.scene.time.delayedCall(50, () => this.clearTint());
    }
  }

  private handleSubWeapon(keys: { subWeapon: Phaser.Input.Keyboard.Key[] }): void {
    const subWeaponJustPressed = keys.subWeapon.some(key => Phaser.Input.Keyboard.JustDown(key));

    if (subWeaponJustPressed && this.projectileCooldown <= 0) {
      this.projectileCooldown = CONFIG.PLAYER.PROJECTILE_COOLDOWN;

      // Emit event for GameScene to spawn the projectile
      this.scene.events.emit('player-throw-projectile', this.x, this.y, this.facingRight);

      // Visual feedback
      this.setTint(0xccccff);
      this.scene.time.delayedCall(50, () => this.clearTint());
    }
  }

  private updateInvincibility(_delta: number): void {
    if (this.isInvincible) {
      // Flashing effect
      const flashRate = 100; // ms
      const shouldShow = Math.floor(this.invincibilityTimer / flashRate) % 2 === 0;
      this.setAlpha(shouldShow ? 1 : 0.3);
    }
  }

  takeDamage(amount: number, knockbackDirection?: number): void {
    if (this.isInvincible || this.isDead) return;
    
    this.health -= amount;
    this.isInvincible = true;
    this.invincibilityTimer = CONFIG.PLAYER.INVINCIBILITY_TIME;
    
    // Knockback
    const body = this.body as Phaser.Physics.Arcade.Body;
    const knockbackX = knockbackDirection ?? (this.facingRight ? -1 : 1);
    body.setVelocity(
      knockbackX * CONFIG.PLAYER.KNOCKBACK_FORCE,
      -CONFIG.PLAYER.KNOCKBACK_FORCE * 0.5
    );
    
    // Emit event for UI
    this.scene.events.emit('player-damaged', this.health, this.maxHealth);
    
    // Flash red
    this.setTint(0xff4444);
    this.scene.time.delayedCall(100, () => this.clearTint());
    
    // Check for death
    if (this.health <= 0) {
      this.die();
    }
  }

  heal(amount: number): void {
    this.health = Math.min(this.health + amount, this.maxHealth);
    this.scene.events.emit('player-healed', this.health, this.maxHealth);
    
    // Green flash
    this.setTint(0x44ff44);
    this.scene.time.delayedCall(200, () => this.clearTint());
  }

  private die(): void {
    this.isDead = true;
    this.isInvincible = true;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, -200);
    
    // Death animation - fade out and spin
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: 360,
      y: this.y + 50,
      duration: 1000,
      onComplete: () => {
        this.scene.events.emit('player-died');
      }
    });
  }

  // Get attack hitbox for collision detection
  getAttackBounds(): Phaser.Geom.Rectangle | null {
    if (!this.isAttacking) return null;
    
    const offsetX = this.facingRight ? 16 : -32;
    return new Phaser.Geom.Rectangle(
      this.x + offsetX,
      this.y - 8,
      24,
      24
    );
  }
}
