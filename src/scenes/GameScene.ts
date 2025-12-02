import Phaser from 'phaser';
import { CONFIG, CAMERA_ZONES } from '../config';
import { Player } from '../entities/Player';
import { Wolf } from '../entities/Wolf';
import { Bat } from '../entities/Bat';
import { DynamicCamera } from '../systems/DynamicCamera';
import { CameraZone } from '../systems/CameraZone';
import { GameState } from '../systems/GameState';

/**
 * GameScene
 * Main gameplay scene - Borgo Pass (Level 1)
 */
export class GameScene extends Phaser.Scene {
  // Entities
  player!: Player;
  enemies!: Phaser.GameObjects.Group;
  coins!: Phaser.GameObjects.Group;
  
  // Tilemap layers
  groundLayer!: Phaser.GameObjects.Group;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  
  // Camera system
  dynamicCamera!: DynamicCamera;
  cameraZones: CameraZone[] = [];
  
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
  };
  
  // Level bounds
  levelWidth = 2000;
  levelHeight = 400;

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
    
    // Setup camera
    this.setupCamera();
    
    // Setup input
    this.setupInput();
    
    // Setup collisions
    this.setupCollisions();
    
    // Create camera zones
    this.createCameraZones();
    
    // Emit ready event for UI
    this.events.emit('scene-ready');
  }

  update(time: number, delta: number): void {
    // Update player
    if (this.player) {
      this.player.update(time, delta, this.keys);
    }
    
    // Update enemies
    this.enemies.getChildren().forEach((enemy: Phaser.GameObjects.GameObject) => {
      if ((enemy as any).update) {
        (enemy as any).update(time, delta, this.player);
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
    // Far background (sky + mountains) - slowest parallax
    this.bgFar = this.add.tileSprite(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'bg_far');
    this.bgFar.setOrigin(0, 0);
    this.bgFar.setScrollFactor(0);
    this.bgFar.setDepth(-100);
    
    // Castle silhouette
    this.bgCastle = this.add.image(CONFIG.GAME_WIDTH * 0.8, CONFIG.GAME_HEIGHT * 0.3, 'bg_castle');
    this.bgCastle.setScrollFactor(0.1);
    this.bgCastle.setDepth(-90);
    this.bgCastle.setAlpha(0.8);
    
    // Mid trees - medium parallax
    this.bgMid = this.add.tileSprite(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, 'bg_mid');
    this.bgMid.setOrigin(0, 0);
    this.bgMid.setScrollFactor(0);
    this.bgMid.setDepth(-50);
    this.bgMid.setAlpha(0.7);
  }

  private updateParallax(): void {
    const camX = this.cameras.main.scrollX;
    
    // Move backgrounds at different rates for parallax effect
    this.bgFar.tilePositionX = camX * 0.1;
    this.bgMid.tilePositionX = camX * 0.3;
  }

  private createLevel(): void {
    this.platforms = this.physics.add.staticGroup();
    
    // Ground - main floor
    this.createGround(0, 350, 2000, 50);
    
    // Section 1: Mountain Road (intro)
    // Starting platform
    this.createPlatform(150, 300, 100);
    this.createPlatform(280, 260, 80);
    this.createPlatform(380, 220, 60);
    
    // Section 2: Pine Forest
    // Elevated path
    this.createGround(500, 280, 300, 20);
    this.createPlatform(600, 230, 80);
    this.createPlatform(720, 200, 60);
    
    // Forest clearing
    this.createGround(850, 320, 200, 30);
    
    // Section 3: Bridge & Ravine
    this.createPlatform(1100, 280, 120); // Bridge left
    this.createPlatform(1280, 280, 120); // Bridge right
    // Gap in the middle for drama!
    
    // Ravine bottom
    this.createGround(1150, 380, 180, 20);
    
    // Climb back up
    this.createPlatform(1350, 340, 60);
    this.createPlatform(1420, 290, 60);
    this.createPlatform(1490, 240, 60);
    
    // Section 4: Boss Arena
    this.createGround(1550, 320, 350, 30);
    
    // Shop area
    this.createGround(1950, 320, 150, 30);
  }

  private createGround(x: number, y: number, width: number, height: number): void {
    const tilesX = Math.ceil(width / 16);
    const tilesY = Math.ceil(height / 16);
    
    for (let tx = 0; tx < tilesX; tx++) {
      for (let ty = 0; ty < tilesY; ty++) {
        const tile = this.platforms.create(
          x + tx * 16 + 8,
          y + ty * 16 + 8,
          'ground'
        ) as Phaser.Physics.Arcade.Sprite;
        tile.setImmovable(true);
        tile.refreshBody();
      }
    }
  }

  private createPlatform(x: number, y: number, width: number): void {
    const tilesX = Math.ceil(width / 16);
    
    for (let tx = 0; tx < tilesX; tx++) {
      const tile = this.platforms.create(
        x + tx * 16 + 8,
        y + 4,
        'platform'
      ) as Phaser.Physics.Arcade.Sprite;
      tile.setImmovable(true);
      tile.refreshBody();
    }
  }

  private createPlayer(): void {
    this.player = new Player(this, 100, 300);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);
    
    // Setup player physics body
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(16, 28);
    body.setOffset(8, 4);
  }

  private createEnemies(): void {
    this.enemies = this.add.group();
    
    // Section 2: First wolf encounter
    const wolf1 = new Wolf(this, 700, 250);
    this.enemies.add(wolf1);
    
    // Forest clearing wolves
    const wolf2 = new Wolf(this, 900, 290);
    this.enemies.add(wolf2);
    
    const wolf3 = new Wolf(this, 980, 290);
    this.enemies.add(wolf3);
    
    // Bats in the forest
    const bat1 = new Bat(this, 650, 180);
    this.enemies.add(bat1);
    
    const bat2 = new Bat(this, 750, 160);
    this.enemies.add(bat2);
    
    // Ravine bats
    const bat3 = new Bat(this, 1200, 340);
    this.enemies.add(bat3);
    
    const bat4 = new Bat(this, 1250, 350);
    this.enemies.add(bat4);
    
    // Boss arena wolves (before mini-boss)
    const wolf4 = new Wolf(this, 1650, 290);
    this.enemies.add(wolf4);
    
    const wolf5 = new Wolf(this, 1750, 290);
    this.enemies.add(wolf5);
  }

  private createCoins(): void {
    this.coins = this.add.group();
    
    // Scatter coins throughout the level
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
      const coin = this.physics.add.sprite(pos.x, pos.y, 'coin');
      coin.setData('type', 'coin');
      coin.body?.setAllowGravity(false);
      (coin.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      
      // Floating animation
      this.tweens.add({
        targets: coin,
        y: pos.y - 5,
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
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J),
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
      ]
    };
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
  }

  private handlePlayerEnemyCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const player = playerObj as Player;
    const enemy = enemyObj as Wolf | Bat;
    
    if (player.isAttacking && !player.isInvincible) {
      // Player is attacking - damage enemy
      enemy.takeDamage(CONFIG.PLAYER.ATTACK_DAMAGE);
      this.dynamicCamera.shake(0.3);
    } else if (!player.isInvincible) {
      // Enemy hits player
      player.takeDamage((enemy as any).damage || 15);
      this.dynamicCamera.shake(0.5);
    }
  }

  private handleCoinCollection(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    coinObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const coin = coinObj as Phaser.Physics.Arcade.Sprite;
    
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
    // Vista zone at start
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(0, 0, 200, 400),
      CAMERA_ZONES.VISTA.zoom,
      'vista_start'
    ));
    
    // Default gameplay
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(200, 0, 450, 400),
      CAMERA_ZONES.DEFAULT.zoom,
      'gameplay_1'
    ));
    
    // Tight forest section
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(650, 0, 200, 400),
      CAMERA_ZONES.TIGHT.zoom,
      'forest_tight'
    ));
    
    // Combat clearing
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(850, 0, 200, 400),
      CAMERA_ZONES.COMBAT.zoom,
      'clearing_combat'
    ));
    
    // Bridge approach (dramatic)
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(1050, 0, 150, 400),
      CAMERA_ZONES.VISTA.zoom,
      'bridge_approach'
    ));
    
    // Ravine (tight)
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(1150, 320, 200, 80),
      CAMERA_ZONES.TIGHT.zoom,
      'ravine'
    ));
    
    // Boss arena
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(1550, 0, 350, 400),
      CAMERA_ZONES.BOSS.zoom,
      'boss_arena'
    ));
    
    // Shop (intimate)
    this.cameraZones.push(new CameraZone(
      this,
      new Phaser.Geom.Rectangle(1900, 0, 200, 400),
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
