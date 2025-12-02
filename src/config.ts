/**
 * Game Configuration Constants
 * Central place for all game tuning values
 */

// World scale factor - 2x internal resolution
export const WORLD_SCALE = 2;

export const CONFIG = {
  // Display (internal resolution - 2x for crisp zooming)
  GAME_WIDTH: 768,
  GAME_HEIGHT: 432,
  
  // Physics (scaled 2x for internal resolution)
  GRAVITY: 1800,

  // Player (speeds scaled 2x for internal resolution)
  PLAYER: {
    MOVE_SPEED: 240,
    JUMP_FORCE: -680,
    JUMP_CUT_MULTIPLIER: 0.5,
    MAX_FALL_SPEED: 800,
    COYOTE_TIME: 100, // ms
    JUMP_BUFFER_TIME: 100, // ms
    MAX_HEALTH: 100,
    ATTACK_DAMAGE: 25,
    INVINCIBILITY_TIME: 1000, // ms
    KNOCKBACK_FORCE: 400,
    PROJECTILE_SPEED: 500,
    PROJECTILE_DAMAGE: 20,
    PROJECTILE_COOLDOWN: 400 // ms
  },
  
  // Camera (zoom values halved for 2x internal resolution)
  CAMERA: {
    DEFAULT_ZOOM: 0.5,      // Was 1.0, halved for 2x resolution
    MIN_ZOOM: 0.3,          // Was 0.6, halved
    MAX_ZOOM: 0.8,          // Was 1.6, halved
    ZOOM_SPEED: 0.02,
    LERP_X: 0.1,
    LERP_Y: 0.1,
    LOOK_AHEAD_DISTANCE: 80,  // 2x for internal resolution
    LOOK_AHEAD_SPEED: 0.05,
    DEADZONE_WIDTH: 100,      // 2x for internal resolution
    DEADZONE_HEIGHT: 60,      // 2x for internal resolution
    SHAKE_DURATION: 100,
    SHAKE_INTENSITY: 0.01
  },
  
  // Enemies (speeds/distances scaled 2x for internal resolution)
  WOLF: {
    HEALTH: 40,
    DAMAGE: 15,
    MOVE_SPEED: 140,
    CHARGE_SPEED: 260,
    DETECTION_RANGE: 360,
    ATTACK_RANGE: 80,
    PATROL_DISTANCE: 200,
    LEAP_FORCE_X: 400,
    LEAP_FORCE_Y: -300,
    COIN_DROP_MIN: 3,
    COIN_DROP_MAX: 5
  },

  BAT: {
    HEALTH: 15,
    DAMAGE: 10,
    FLY_SPEED: 160,
    SWOOP_SPEED: 300,
    DETECTION_RANGE: 300,
    WAKE_UP_RANGE: 240,
    HOVER_AMPLITUDE: 40,
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

// Camera zone presets for Level 1 (halved for 2x internal resolution)
export const CAMERA_ZONES = {
  VISTA: { zoom: 0.35, name: 'Vista - Wide scenic shot' },     // Was 0.7
  DEFAULT: { zoom: 0.5, name: 'Default gameplay' },            // Was 1.0
  COMBAT: { zoom: 0.45, name: 'Combat arena' },                // Was 0.9
  TIGHT: { zoom: 0.7, name: 'Tight corridor' },                // Was 1.4
  BOSS: { zoom: 0.4, name: 'Boss arena' },                     // Was 0.8
  SHOP: { zoom: 0.55, name: 'Shop - Intimate' }                // Was 1.1
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
