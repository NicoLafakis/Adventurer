import Phaser from 'phaser';
import { CONFIG, CAMERA_ZONES, WORLD_SCALE } from '../config';
import { Player } from '../entities/Player';
import { Wolf } from '../entities/Wolf';
import { Bat } from '../entities/Bat';
import { Projectile } from '../entities/Projectile';
import { DynamicCamera } from '../systems/DynamicCamera';
import { CameraZone } from '../systems/CameraZone';
import { GameState } from '../systems/GameState';
import { AudioManager } from '../systems/AudioManager';

/**
 * GameScene
 * Main gameplay scene - Borgo Pass (Level 1)
 */
export class GameScene extends Phaser.Scene {
  // Entities
  player!: Player;
  enemies!: Phaser.GameObjects.Group;
  coins!: Phaser.GameObjects.Group;
  projectiles!: Phaser.Physics.Arcade.Group;
  
  // Tilemap layers
  groundLayer!: Phaser.GameObjects.Group;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  
  // Camera system
  dynamicCamera!: DynamicCamera;
  cameraZones: CameraZone[] = [];

  // Audio
  audioManager!: AudioManager;
  
  // Background layers (parallax)
  bgFar!: Phaser.GameObjects.TileSprite;
  bgCastle!: Phaser.GameObjects.Image;
  bgMid!: Phaser.GameObjects.TileSprite;
  
  // Input
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  keys!: {
    jump: Phaser.Input.Keyboard.Key[];
    attack: Phaser.Input.Keyboard.Key[];
    left: Phaser.Input.Keyboard.Key[];
    right: Phaser.Input.Keyboard.Key[];
    subWeapon: Phaser.Input.Keyboard.Key[];
  };
  private mouseAttackPressed: boolean = false;
  
  // Level bounds (2x for internal resolution)
  levelWidth = 4000;
  levelHeight = 800;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Initialize game state
    GameState.reset();
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.levelWidth, this.levelHeight);
    
    // Create backgrounds (parallax)
    this.createBackgrounds();
    
    // Create level geometry
    this.createLevel();
    
    // Create player
    this.createPlayer();
    
    // Create enemies
    this.createEnemies();
    
    // Create coins
    this.createCoins();

    // Create projectiles group (physics group for collision detection)
    this.projectiles = this.physics.add.group({
      runChildUpdate: false // We'll manually update projectiles
    });

    // Setup camera
    this.setupCamera();
    
    // Setup input
    this.setupInput();
    
    // Setup collisions
    this.setupCollisions();
    
    // Create camera zones
    this.createCameraZones();
    
    // Listen for projectile spawn events
    this.events.on('player-throw-projectile', this.spawnProjectile, this);

    // Setup audio
    this.setupAudio();

    // Emit ready event for UI
    this.events.emit('scene-ready');
  }

  private setupAudio(): void {
    this.audioManager = new AudioManager(this);

    // Start background music after a short delay (needs user interaction first)
    this.time.delayedCall(500, () => {
      this.audioManager.startMusic();
    });

    // Listen for game events to play sounds
    this.events.on('player-damaged', () => {
      this.audioManager.playHurt();
    });

    this.events.on('coin-collected', () => {
      this.audioManager.playCoin();
    });

    this.events.on('player-jump', () => {
      this.audioManager.playJump();
    });

    this.events.on('player-attack', () => {
      this.audioManager.playAttack();
    });
  }

  update(time: number, delta: number): void {
    // Update player
    if (this.player) {
      this.player.update(time, delta, this.keys, this.mouseAttackPressed);
      // Reset mouse attack after processing
      if (this.mouseAttackPressed) {
        this.mouseAttackPressed = false;
      }
    }
    
    // Update enemies
    this.enemies.getChildren().forEach((enemy: Phaser.GameObjects.GameObject) => {
      if ((enemy as any).update) {
        (enemy as any).update(time, delta, this.player);
      }
    });

    // Update projectiles
    this.projectiles.getChildren().forEach((proj: Phaser.GameObjects.GameObject) => {
      if ((proj as Projectile).update) {
        (proj as Projectile).update(time, delta);
      }
    });
    
    // Update dynamic camera
    if (this.dynamicCamera) {
      this.dynamicCamera.update(delta);
    }
    
    // Update parallax backgrounds
    this.updateParallax();
    
    // Check camera zones
    this.checkCameraZones();
  }

  private createBackgrounds(): void {
    // Calculate max visible size at minimum zoom
    // At 0.3 zoom, visible area is roughly 768/0.3 x 432/0.3 = 2560x1440
    const maxWidth = Math.ceil(CONFIG.GAME_WIDTH / CONFIG.CAMERA.MIN_ZOOM);
    const maxHeight = Math.ceil(CONFIG.GAME_HEIGHT / CONFIG.CAMERA.MIN_ZOOM);

    // Far background (sky + mountains) - slowest parallax
    this.bgFar = this.add.tileSprite(0, 0, maxWidth, maxHeight, 'bg_far');
    this.bgFar.setOrigin(0, 0);
    this.bgFar.setScrollFactor(0);
    this.bgFar.setDepth(-100);

    // Castle silhouette - position relative to camera center
    this.bgCastle = this.add.image(0, 0, 'bg_castle');
    this.bgCastle.setScrollFactor(0);
    this.bgCastle.setDepth(-90);
    this.bgCastle.setAlpha(0.8);
    this.bgCastle.setScale(1.5); // Scale up for visibility at zoom out

    // Mid trees - medium parallax
    this.bgMid = this.add.tileSprite(0, 0, maxWidth, maxHeight, 'bg_mid');
    this.bgMid.setOrigin(0, 0);
    this.bgMid.setScrollFactor(0);
    this.bgMid.setDepth(-50);
    this.bgMid.setAlpha(0.7);
  }

  private updateParallax(): void {
    const cam = this.cameras.main;
    const camX = cam.scrollX;
    const camY = cam.scrollY;
    const zoom = cam.zoom;

    // Calculate visible area based on current zoom
    const visibleWidth = CONFIG.GAME_WIDTH / zoom;
    const visibleHeight = CONFIG.GAME_HEIGHT / zoom;

    // Position backgrounds to always cover the camera view
    this.bgFar.setPosition(camX, camY);
    this.bgFar.setSize(visibleWidth, visibleHeight);

    this.bgMid.setPosition(camX, camY);
    this.bgMid.setSize(visibleWidth, visibleHeight);

    // Move backgrounds at different rates for parallax effect
    this.bgFar.tilePositionX = camX * 0.05;
    this.bgMid.tilePositionX = camX * 0.15;

    // Position castle with parallax relative to camera center
    const castleParallaxX = camX * 0.08;
    this.bgCastle.setPosition(
      camX + visibleWidth * 0.7 - castleParallaxX,
      camY + visibleHeight * 0.25
    );
  }

  private createLevel(): void {
    this.platforms = this.physics.add.staticGroup();
    const S = WORLD_SCALE; // Shorthand for scale factor

    // Ground - main floor
    this.createGround(0, 350 * S, 2000 * S, 50 * S);

    // Section 1: Mountain Road (intro)
    // Starting platform
    this.createPlatform(150 * S, 300 * S, 100 * S);
    this.createPlatform(280 * S, 260 * S, 80 * S);
    this.createPlatform(380 * S, 220 * S, 60 * S);

    // Section 2: Pine Forest
    // Elevated path
    this.createGround(500 * S, 280 * S, 300 * S, 20 * S);
    this.createPlatform(600 * S, 230 * S, 80 * S);
    this.createPlatform(720 * S, 200 * S, 60 * S);

    // Forest clearing
    this.createGround(850 * S, 320 * S, 200 * S, 30 * S);

    // Section 3: Bridge & Ravine
    this.createPlatform(1100 * S, 280 * S, 120 * S); // Bridge left
    this.createPlatform(1280 * S, 280 * S, 120 * S); // Bridge right
    // Gap in the middle for drama!

    // Ravine bottom
    this.createGround(1150 * S, 380 * S, 180 * S, 20 * S);

    // Climb back up
    this.createPlatform(1350 * S, 340 * S, 60 * S);
    this.createPlatform(1420 * S, 290 * S, 60 * S);
    this.createPlatform(1490 * S, 240 * S, 60 * S);

    // Section 4: Boss Arena
    this.createGround(1550 * S, 320 * S, 350 * S, 30 * S);

    // Shop area
    this.createGround(1950 * S, 320 * S, 150 * S, 30 * S);
  }

  private createGround(x: number, y: number, width: number, height: number): void {
    const tileSize = 16 * WORLD_SCALE;
    const tilesX = Math.ceil(width / tileSize);
    const tilesY = Math.ceil(height / tileSize);

    for (let tx = 0; tx < tilesX; tx++) {
      for (let ty = 0; ty < tilesY; ty++) {
        const tile = this.platforms.create(
          x + tx * tileSize + tileSize / 2,
          y + ty * tileSize + tileSize / 2,
          'ground'
        ) as Phaser.Physics.Arcade.Sprite;
        tile.setScale(WORLD_SCALE);
        tile.setImmovable(true);
        tile.refreshBody();
      }
    }
  }

  private createPlatform(x: number, y: number, width: number): void {
    const tileSize = 16 * WORLD_SCALE;
    const tilesX = Math.ceil(width / tileSize);

    for (let tx = 0; tx < tilesX; tx++) {
      const tile = this.platforms.create(
        x + tx * tileSize + tileSize / 2,
        y + 4 * WORLD_SCALE,
        'platform'
      ) as Phaser.Physics.Arcade.Sprite;
      tile.setScale(WORLD_SCALE);
      tile.setImmovable(true);
      tile.refreshBody();
    }
  }

  private createPlayer(): void {
    const S = WORLD_SCALE;
    this.player = new Player(this, 100 * S, 300 * S);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);
    this.player.setScale(S);

    // Setup player physics body (use unscaled values - Phaser applies sprite scale automatically)
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    // Body covers most of the 32x32 sprite, leaving some margin
    body.setSize(14, 26);
    // Offset to center horizontally and align feet with bottom of sprite
    body.setOffset(9, 6);
  }

  private createEnemies(): void {
    this.enemies = this.add.group();
    const S = WORLD_SCALE;

    // Section 2: First wolf encounter
    const wolf1 = new Wolf(this, 700 * S, 250 * S);
    wolf1.setScale(S);
    this.enemies.add(wolf1);

    // Forest clearing wolves
    const wolf2 = new Wolf(this, 900 * S, 290 * S);
    wolf2.setScale(S);
    this.enemies.add(wolf2);

    const wolf3 = new Wolf(this, 980 * S, 290 * S);
    wolf3.setScale(S);
    this.enemies.add(wolf3);

    // Bats in the forest
    const bat1 = new Bat(this, 650 * S, 180 * S);
    bat1.setScale(S);
    this.enemies.add(bat1);

    const bat2 = new Bat(this, 750 * S, 160 * S);
    bat2.setScale(S);
    this.enemies.add(bat2);

    // Ravine bats
    const bat3 = new Bat(this, 1200 * S, 340 * S);
    bat3.setScale(S);
    this.enemies.add(bat3);

    const bat4 = new Bat(this, 1250 * S, 350 * S);
    bat4.setScale(S);
    this.enemies.add(bat4);

    // Boss arena wolves (before mini-boss)
    const wolf4 = new Wolf(this, 1650 * S, 290 * S);
    wolf4.setScale(S);
    this.enemies.add(wolf4);

    const wolf5 = new Wolf(this, 1750 * S, 290 * S);
    wolf5.setScale(S);
    this.enemies.add(wolf5);
  }

  private createCoins(): void {
    this.coins = this.add.group();
    const S = WORLD_SCALE;

    // Scatter coins throughout the level (positions will be scaled)
    const coinPositions = [
      // Section 1
      { x: 150, y: 280 }, { x: 180, y: 280 }, { x: 210, y: 280 },
      { x: 300, y: 240 }, { x: 330, y: 240 },
      { x: 400, y: 200 },

      // Section 2
      { x: 550, y: 260 }, { x: 580, y: 260 }, { x: 610, y: 260 },
      { x: 640, y: 210 }, { x: 740, y: 180 },

      // Clearing bonus
      { x: 900, y: 300 }, { x: 930, y: 300 }, { x: 960, y: 300 },

      // Ravine secret
      { x: 1180, y: 360 }, { x: 1210, y: 360 }, { x: 1240, y: 360 },
      { x: 1270, y: 360 }, { x: 1300, y: 360 },

      // Climb reward
      { x: 1360, y: 320 }, { x: 1430, y: 270 }, { x: 1500, y: 220 },

      // Boss arena
      { x: 1600, y: 300 }, { x: 1700, y: 300 }, { x: 1800, y: 300 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.physics.add.sprite(pos.x * S, pos.y * S, 'coin');
      coin.setScale(S);
      coin.setData('type', 'coin');
      coin.body?.setAllowGravity(false);
      (coin.body as Phaser.Physics.Arcade.Body).setImmovable(true);

      // Floating animation
      this.tweens.add({
        targets: coin,
        y: pos.y * S - 5 * S,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.coins.add(coin);
    });
  }

  private setupCamera(): void {
    // Set camera bounds
    this.cameras.main.setBounds(0, 0, this.levelWidth, this.levelHeight);
    
    // Follow player
    this.cameras.main.startFollow(this.player, true);
    
    // Set deadzone (area where player can move without camera moving)
    this.cameras.main.setDeadzone(
      CONFIG.CAMERA.DEADZONE_WIDTH,
      CONFIG.CAMERA.DEADZONE_HEIGHT
    );
    
    // Set follow lerp for smooth movement
    this.cameras.main.setLerp(CONFIG.CAMERA.LERP_X, CONFIG.CAMERA.LERP_Y);
    
    // Initialize dynamic camera system
    this.dynamicCamera = new DynamicCamera(this, this.cameras.main, this.player);
  }

  private setupInput(): void {
    // Cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Custom key bindings
    this.keys = {
      left: [
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
      ],
      right: [
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
      ],
      jump: [
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
      ],
      attack: [
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J),
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
      ],
      subWeapon: [
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K),
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X)
      ]
    };

    // Mouse click for attack
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.mouseAttackPressed = true;
      }
    });
    this.input.on('pointerup', () => {
      this.mouseAttackPressed = false;
    });
  }

  private setupCollisions(): void {
    // Player vs platforms
    this.physics.add.collider(this.player, this.platforms);
    
    // Enemies vs platforms
    this.physics.add.collider(this.enemies, this.platforms);
    
    // Player vs enemies
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handlePlayerEnemyCollision,
      undefined,
      this
    );
    
    // Player vs coins
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.handleCoinCollection,
      undefined,
      this
    );

    // Projectiles vs enemies
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.handleProjectileEnemyCollision,
      undefined,
      this
    );
  }

  private spawnProjectile(x: number, y: number, facingRight: boolean): void {
    const projectile = new Projectile(this, x, y, facingRight);
    projectile.setScale(WORLD_SCALE);
    this.projectiles.add(projectile);
    this.audioManager?.playThrow();
  }

  private handleProjectileEnemyCollision: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (projObj, enemyObj) => {
    const projectile = projObj as unknown as Projectile;
    const enemy = enemyObj as unknown as Wolf | Bat;

    // Damage enemy
    enemy.takeDamage(projectile.damage);

    // Small screen shake
    this.dynamicCamera.shake(0.2);
    this.audioManager?.playHit();

    // Check if enemy died
    if ((enemy as any).health <= 0) {
      this.audioManager?.playEnemyDeath();
    }

    // Destroy projectile
    projectile.onHitEnemy();
  }

  private handlePlayerEnemyCollision: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (playerObj, enemyObj) => {
    const player = playerObj as unknown as Player;
    const enemy = enemyObj as unknown as Wolf | Bat;

    if (player.isAttacking && !player.isInvincible) {
      // Player is attacking - damage enemy
      enemy.takeDamage(CONFIG.PLAYER.ATTACK_DAMAGE);
      this.dynamicCamera.shake(0.3);
      this.audioManager?.playHit();
      // Check if enemy died
      if ((enemy as any).health <= 0) {
        this.audioManager?.playEnemyDeath();
      }
    } else if (!player.isInvincible) {
      // Enemy hits player
      player.takeDamage((enemy as any).damage || 15);
      this.dynamicCamera.shake(0.5);
    }
  }

  private handleCoinCollection: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObj, coinObj) => {
    const coin = coinObj as unknown as Phaser.Physics.Arcade.Sprite;
    
    // Collect coin
    GameState.addCoins(1);
    
    // Play collect animation
    this.tweens.add({
      targets: coin,
      y: coin.y - 20,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => coin.destroy()
    });
    
    // Emit event for UI
    this.events.emit('coin-collected', GameState.coins);
  }

  private createCameraZones(): void {
    const S = WORLD_SCALE;

    // Vista zone at start
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(0, 0, 200 * S, 400 * S),
      CAMERA_ZONES.VISTA.zoom,
      'vista_start'
    ));

    // Default gameplay
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(200 * S, 0, 450 * S, 400 * S),
      CAMERA_ZONES.DEFAULT.zoom,
      'gameplay_1'
    ));

    // Tight forest section
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(650 * S, 0, 200 * S, 400 * S),
      CAMERA_ZONES.TIGHT.zoom,
      'forest_tight'
    ));

    // Combat clearing
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(850 * S, 0, 200 * S, 400 * S),
      CAMERA_ZONES.COMBAT.zoom,
      'clearing_combat'
    ));

    // Bridge approach (dramatic)
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(1050 * S, 0, 150 * S, 400 * S),
      CAMERA_ZONES.VISTA.zoom,
      'bridge_approach'
    ));

    // Ravine (tight)
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(1150 * S, 320 * S, 200 * S, 80 * S),
      CAMERA_ZONES.TIGHT.zoom,
      'ravine'
    ));

    // Boss arena
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(1550 * S, 0, 350 * S, 400 * S),
      CAMERA_ZONES.BOSS.zoom,
      'boss_arena'
    ));

    // Shop (intimate)
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(1900 * S, 0, 200 * S, 400 * S),
      CAMERA_ZONES.SHOP.zoom,
      'shop'
    ));
  }

  private checkCameraZones(): void {
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    for (const zone of this.cameraZones) {
      if (zone.contains(playerX, playerY)) {
        this.dynamicCamera.setTargetZoom(zone.zoom);
        return;
      }
    }
    
    // Default zoom if not in any zone
    this.dynamicCamera.setTargetZoom(CONFIG.CAMERA.DEFAULT_ZOOM);
  }

  // Public method for UI to access
  getPlayer(): Player {
    return this.player;
  }
}
