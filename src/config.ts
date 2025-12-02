/**
 * Game Configuration Constants
 * Central place for all game tuning values
 */

export const CONFIG = {
  // Display
  GAME_WIDTH: 384,
  GAME_HEIGHT: 216,
  
  // Physics
  GRAVITY: 900,
  
  // Player
  PLAYER: {
    MOVE_SPEED: 120,
    JUMP_FORCE: -340,
    JUMP_CUT_MULTIPLIER: 0.5,
    MAX_FALL_SPEED: 400,
    COYOTE_TIME: 100, // ms
    JUMP_BUFFER_TIME: 100, // ms
    MAX_HEALTH: 100,
    ATTACK_DAMAGE: 25,
    INVINCIBILITY_TIME: 1000, // ms
    KNOCKBACK_FORCE: 200,
    PROJECTILE_SPEED: 250,
    PROJECTILE_DAMAGE: 20,
    PROJECTILE_COOLDOWN: 400 // ms
  },
  
  // Camera
  CAMERA: {
    DEFAULT_ZOOM: 1,
    MIN_ZOOM: 0.6,
    MAX_ZOOM: 1.6,
    ZOOM_SPEED: 0.02,
    LERP_X: 0.1,
    LERP_Y: 0.1,
    LOOK_AHEAD_DISTANCE: 40,
    LOOK_AHEAD_SPEED: 0.05,
    DEADZONE_WIDTH: 50,
    DEADZONE_HEIGHT: 30,
    SHAKE_DURATION: 100,
    SHAKE_INTENSITY: 0.01
  },
  
  // Enemies
  WOLF: {
    HEALTH: 40,
    DAMAGE: 15,
    MOVE_SPEED: 70,
    CHARGE_SPEED: 130,
    DETECTION_RANGE: 180,
    ATTACK_RANGE: 40,
    PATROL_DISTANCE: 100,
    LEAP_FORCE_X: 200,
    LEAP_FORCE_Y: -150,
    COIN_DROP_MIN: 3,
    COIN_DROP_MAX: 5
  },
  
  BAT: {
    HEALTH: 15,
    DAMAGE: 10,
    FLY_SPEED: 80,
    SWOOP_SPEED: 150,
    DETECTION_RANGE: 150,
    WAKE_UP_RANGE: 120,
    HOVER_AMPLITUDE: 20,
    COIN_DROP_MIN: 1,
    COIN_DROP_MAX: 3
  },
  
  // Shop
  SHOP: {
    HEALTH_POTION: { price: 50, heal: 30 },
    SILVER_KNIFE: { price: 75 },
    HOLY_WATER: { price: 100 },
    HEALTH_UPGRADE: { price: 200, bonus: 20 },
    ATTACK_BOOST: { price: 150, bonus: 5 }
  },
  
  // Audio
  AUDIO: {
    MUSIC_VOLUME: 0.6,
    SFX_VOLUME: 0.8
  }
} as const;

// Camera zone presets for Level 1
export const CAMERA_ZONES = {
  VISTA: { zoom: 0.7, name: 'Vista - Wide scenic shot' },
  DEFAULT: { zoom: 1.0, name: 'Default gameplay' },
  COMBAT: { zoom: 0.9, name: 'Combat arena' },
  TIGHT: { zoom: 1.4, name: 'Tight corridor' },
  BOSS: { zoom: 0.8, name: 'Boss arena' },
  SHOP: { zoom: 1.1, name: 'Shop - Intimate' }
} as const;

// Color palette
export const COLORS = {
  SUNSET_SKY: 0x4a1a4a,
  TWILIGHT: 0x8b2942,
  DUSK: 0xd4731e,
  NIGHT: 0x0a0510,
  MOON: 0xf4e4c1,
  HEALTH_BAR: 0xc41e3a,
  HEALTH_BG: 0x1a0a20,
  COIN: 0xffd700,
  TEXT: 0xffffff,
  TEXT_SHADOW: 0x000000
} as const;

// Input keys
export const KEYS = {
  LEFT: ['A', 'LEFT'],
  RIGHT: ['D', 'RIGHT'],
  JUMP: ['SPACE', 'W', 'UP'],
  ATTACK: ['J', 'Z'],
  SUB_WEAPON: ['K', 'X'],
  INTERACT: ['E'],
  PAUSE: ['ESC', 'P']
} as const;
