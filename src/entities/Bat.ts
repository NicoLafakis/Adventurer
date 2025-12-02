import Phaser from 'phaser';
import { CONFIG } from '../config';
import { GameState } from '../systems/GameState';
import { Player } from './Player';

/**
 * Bat
 * Flying enemy that swoops at the player
 * 
 * Behavior:
 * - Hangs from ceiling until disturbed
 * - Flies in erratic pattern
 * - Swoops down at player
 */

enum BatState {
  SLEEPING,
  FLYING,
  SWOOPING,
  HURT,
  DEAD
}

export class Bat extends Phaser.Physics.Arcade.Sprite {
  // Stats
  health: number;
  damage: number;
  
  // State
  state: BatState = BatState.SLEEPING;
  
  // Movement
  private homePosition: Phaser.Math.Vector2;
  private swoopTarget: Phaser.Math.Vector2 | null = null;
  private flyTime: number = 0;
  
  // Timers
  private swoopCooldown: number = 0;
  private hurtTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bat');
    
    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Initialize stats
    this.health = CONFIG.BAT.HEALTH;
    this.damage = CONFIG.BAT.DAMAGE;
    
    // Store home position
    this.homePosition = new Phaser.Math.Vector2(x, y);
    
    // Setup physics body - no gravity for flying enemy
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 12);
    body.setOffset(4, 4);
    body.setAllowGravity(false);
    body.setCollideWorldBounds(true);
    
    this.setDepth(5);
    
    // Start flipped (hanging)
    this.setFlipY(true);
  }

  update(time: number, delta: number, player: Player): void {
    if (this.state === BatState.DEAD) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.flyTime += delta;
    
    // Update timers
    if (this.swoopCooldown > 0) this.swoopCooldown -= delta;
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      if (this.hurtTimer <= 0) {
        this.state = BatState.FLYING;
      }
      return;
    }
    
    // Calculate distance to player
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );
    
    // State machine
    switch (this.state) {
      case BatState.SLEEPING:
        body.setVelocity(0, 0);
        
        // Wake up when player approaches
        if (distanceToPlayer < CONFIG.BAT.WAKE_UP_RANGE) {
          this.wakeUp();
        }
        break;
        
      case BatState.FLYING:
        this.fly(body, player, distanceToPlayer);
        break;
        
      case BatState.SWOOPING:
        this.swoop(body);
        break;
    }
    
    // Update sprite based on movement
    if (this.state !== BatState.SLEEPING) {
      this.setFlipY(false);
      this.setFlipX(body.velocity.x < 0);
    }
  }

  private wakeUp(): void {
    this.state = BatState.FLYING;
    this.setFlipY(false);
    
    // Initial startle - fly up briefly
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-50);
  }

  private fly(body: Phaser.Physics.Arcade.Body, player: Player, distance: number): void {
    // Erratic flying pattern
    const erraticX = Math.sin(this.flyTime * 0.005) * 30;
    const erraticY = Math.cos(this.flyTime * 0.004) * 20;
    
    // Target position - generally above and towards player
    let targetX = player.x + erraticX;
    let targetY = player.y - 60 + erraticY;
    
    // If too far from home, drift back
    const distanceFromHome = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.homePosition.x, this.homePosition.y
    );
    
    if (distanceFromHome > 200) {
      targetX = this.homePosition.x;
      targetY = this.homePosition.y;
    }
    
    // Move towards target
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    const velocityX = Math.cos(angle) * CONFIG.BAT.FLY_SPEED;
    const velocityY = Math.sin(angle) * CONFIG.BAT.FLY_SPEED;
    
    // Smooth velocity change
    body.setVelocity(
      Phaser.Math.Linear(body.velocity.x, velocityX, 0.1),
      Phaser.Math.Linear(body.velocity.y, velocityY, 0.1)
    );
    
    // Start swoop attack if close enough and cooldown ready
    if (distance < CONFIG.BAT.DETECTION_RANGE && this.swoopCooldown <= 0) {
      this.startSwoop(player);
    }
  }

  private startSwoop(player: Player): void {
    this.state = BatState.SWOOPING;
    this.swoopTarget = new Phaser.Math.Vector2(player.x, player.y);
    this.swoopCooldown = 2000; // 2 second cooldown
  }

  private swoop(body: Phaser.Physics.Arcade.Body): void {
    if (!this.swoopTarget) {
      this.state = BatState.FLYING;
      return;
    }
    
    // Dive towards target
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.swoopTarget.x, this.swoopTarget.y
    );
    
    body.setVelocity(
      Math.cos(angle) * CONFIG.BAT.SWOOP_SPEED,
      Math.sin(angle) * CONFIG.BAT.SWOOP_SPEED
    );
    
    // Check if swoop is complete
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.swoopTarget.x, this.swoopTarget.y
    );
    
    if (distanceToTarget < 20) {
      this.endSwoop(body);
    }
  }

  private endSwoop(body: Phaser.Physics.Arcade.Body): void {
    this.state = BatState.FLYING;
    this.swoopTarget = null;
    
    // Pull up after swoop
    body.setVelocityY(-CONFIG.BAT.SWOOP_SPEED * 0.5);
  }

  takeDamage(amount: number): void {
    if (this.state === BatState.DEAD) return;
    
    this.health -= amount;
    
    // Knockback
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(
      body.velocity.x * -0.5,
      -80
    );
    
    // Hurt state
    this.state = BatState.HURT;
    this.hurtTimer = 150;
    this.swoopTarget = null;
    
    // Flash red
    this.setTint(0xff4444);
    this.scene.time.delayedCall(100, () => {
      if (this.state !== BatState.DEAD) this.clearTint();
    });
    
    // Check for death
    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.state = BatState.DEAD;
    
    // Drop coins
    const coinCount = Phaser.Math.Between(
      CONFIG.BAT.COIN_DROP_MIN,
      CONFIG.BAT.COIN_DROP_MAX
    );
    GameState.addCoins(coinCount);
    GameState.recordKill();
    
    // Death animation - flutter down
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setVelocity(
      Phaser.Math.Between(-50, 50),
      -50
    );
    
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: Phaser.Math.Between(-180, 180),
      duration: 800,
      onComplete: () => this.destroy()
    });
  }
}
