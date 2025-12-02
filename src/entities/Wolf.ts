import Phaser from 'phaser';
import { CONFIG } from '../config';
import { GameState } from '../systems/GameState';
import { Player } from './Player';

/**
 * Wolf
 * The wolves that prowl the Borgo Pass
 * "The howling of wolves..." - Dracula, Chapter 1
 * 
 * Behavior:
 * - Patrols back and forth until player detected
 * - Charges at player when in range
 * - Leaps for attack
 */

enum WolfState {
  PATROL,
  CHASE,
  ATTACK,
  HURT,
  DEAD
}

export class Wolf extends Phaser.Physics.Arcade.Sprite {
  // Stats
  health: number;
  damage: number;
  
  // State
  state: WolfState = WolfState.PATROL;
  facingRight: boolean = true;
  
  // Patrol
  private patrolOrigin: number;
  private patrolDirection: number = 1;
  
  // Timers
  private attackCooldown: number = 0;
  private hurtTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'wolf');
    
    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Initialize stats
    this.health = CONFIG.WOLF.HEALTH;
    this.damage = CONFIG.WOLF.DAMAGE;
    
    // Store patrol origin
    this.patrolOrigin = x;
    
    // Setup physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 18);
    body.setOffset(4, 6);
    body.setCollideWorldBounds(true);
    
    this.setDepth(5);
  }

  update(_time: number, delta: number, player: Player): void {
    if (this.state === WolfState.DEAD) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Update timers
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      if (this.hurtTimer <= 0) {
        this.state = WolfState.PATROL;
      }
      return; // Skip AI while hurt
    }
    
    // Calculate distance to player
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );
    
    const directionToPlayer = player.x > this.x ? 1 : -1;
    
    // State machine
    switch (this.state) {
      case WolfState.PATROL:
        this.patrol(body);
        
        // Detect player
        if (distanceToPlayer < CONFIG.WOLF.DETECTION_RANGE) {
          this.state = WolfState.CHASE;
        }
        break;
        
      case WolfState.CHASE:
        this.chase(body, directionToPlayer);
        
        // Attack when close
        if (distanceToPlayer < CONFIG.WOLF.ATTACK_RANGE && this.attackCooldown <= 0) {
          this.attack(body, directionToPlayer);
        }
        
        // Lose interest if too far
        if (distanceToPlayer > CONFIG.WOLF.DETECTION_RANGE * 1.5) {
          this.state = WolfState.PATROL;
        }
        break;
        
      case WolfState.ATTACK:
        // Attack state ends when landing
        if (body.blocked.down && body.velocity.y >= 0) {
          this.state = WolfState.CHASE;
          this.attackCooldown = 1000; // Cooldown in ms
        }
        break;
    }
    
    // Update sprite flip
    this.setFlipX(!this.facingRight);
  }

  private patrol(body: Phaser.Physics.Arcade.Body): void {
    // Move in patrol direction
    body.setVelocityX(this.patrolDirection * CONFIG.WOLF.MOVE_SPEED * 0.5);
    this.facingRight = this.patrolDirection > 0;
    
    // Check patrol bounds
    const distanceFromOrigin = this.x - this.patrolOrigin;
    if (Math.abs(distanceFromOrigin) > CONFIG.WOLF.PATROL_DISTANCE) {
      this.patrolDirection *= -1;
    }
    
    // Turn at walls
    if (body.blocked.left || body.blocked.right) {
      this.patrolDirection *= -1;
    }
  }

  private chase(body: Phaser.Physics.Arcade.Body, direction: number): void {
    body.setVelocityX(direction * CONFIG.WOLF.CHARGE_SPEED);
    this.facingRight = direction > 0;
  }

  private attack(body: Phaser.Physics.Arcade.Body, direction: number): void {
    this.state = WolfState.ATTACK;
    
    // Leap towards player
    body.setVelocity(
      direction * CONFIG.WOLF.LEAP_FORCE_X,
      CONFIG.WOLF.LEAP_FORCE_Y
    );
    
    this.facingRight = direction > 0;
  }

  takeDamage(amount: number): void {
    if (this.state === WolfState.DEAD) return;
    
    this.health -= amount;
    
    // Knockback
    const body = this.body as Phaser.Physics.Arcade.Body;
    const knockbackDir = this.facingRight ? -1 : 1;
    body.setVelocity(knockbackDir * 100, -80);
    
    // Hurt state
    this.state = WolfState.HURT;
    this.hurtTimer = 200;
    
    // Flash red
    this.setTint(0xff4444);
    this.scene.time.delayedCall(100, () => {
      if (this.state !== WolfState.DEAD) this.clearTint();
    });
    
    // Check for death
    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.state = WolfState.DEAD;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, -100);
    body.setAllowGravity(false);
    
    // Drop coins
    const coinCount = Phaser.Math.Between(
      CONFIG.WOLF.COIN_DROP_MIN,
      CONFIG.WOLF.COIN_DROP_MAX
    );
    GameState.addCoins(coinCount);
    GameState.recordKill();
    
    // Death animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: this.facingRight ? 90 : -90,
      y: this.y + 20,
      duration: 500,
      onComplete: () => this.destroy()
    });
  }
}
