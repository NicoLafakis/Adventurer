import Phaser from 'phaser';
import { CONFIG } from '../config';

/**
 * AudioManager
 * Handles all game audio - procedurally generated sounds and music
 */
export class AudioManager {
  private scene: Phaser.Scene;
  private musicPlaying: boolean = false;
  private audioContext: AudioContext | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Get audio context from Phaser's sound manager
    if (scene.sound instanceof Phaser.Sound.WebAudioSoundManager) {
      this.audioContext = scene.sound.context;
    }
  }

  /**
   * Generate all game sounds as Phaser audio sprites
   */
  static generateSounds(scene: Phaser.Scene): void {
    const audioContext = (scene.sound as Phaser.Sound.WebAudioSoundManager)?.context;
    if (!audioContext) return;

    // Generate attack sound
    AudioManager.createSound(scene, 'sfx_attack', (ctx, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      return gain;
    }, 0.15);

    // Generate hit sound
    AudioManager.createSound(scene, 'sfx_hit', (ctx, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      return gain;
    }, 0.2);

    // Generate coin sound
    AudioManager.createSound(scene, 'sfx_coin', (ctx, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1000, ctx.currentTime + duration * 0.3);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + duration * 0.6);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      return gain;
    }, 0.25);

    // Generate jump sound
    AudioManager.createSound(scene, 'sfx_jump', (ctx, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      return gain;
    }, 0.15);

    // Generate hurt sound
    AudioManager.createSound(scene, 'sfx_hurt', (ctx, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      return gain;
    }, 0.3);

    // Generate enemy death sound
    AudioManager.createSound(scene, 'sfx_enemy_death', (ctx, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      return gain;
    }, 0.4);

    // Generate throw sound
    AudioManager.createSound(scene, 'sfx_throw', (ctx, duration) => {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      noise.connect(filter);
      filter.connect(gain);
      return gain;
    }, 0.1);
  }

  private static createSound(
    scene: Phaser.Scene,
    key: string,
    generator: (ctx: OfflineAudioContext, duration: number) => AudioNode,
    duration: number
  ): void {
    const soundManager = scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (!soundManager?.context) return;

    const ctx = soundManager.context;
    const sampleRate = ctx.sampleRate;
    const length = Math.ceil(sampleRate * duration);

    // Render the sound to a buffer using offline context
    const offlineCtx = new OfflineAudioContext(1, length, sampleRate);
    const node = generator(offlineCtx, duration);
    node.connect(offlineCtx.destination);

    offlineCtx.startRendering().then(renderedBuffer => {
      // Convert to ArrayBuffer for Phaser
      const wavBuffer = AudioManager.audioBufferToWav(renderedBuffer);

      // Decode and add to Phaser's cache
      soundManager.decodeAudio(key, wavBuffer);
    }).catch(() => {
      // Fallback: create silent sound
    });
  }

  // Convert AudioBuffer to WAV ArrayBuffer
  private static audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = 1;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const samples = buffer.getChannelData(0);
    const dataLength = samples.length * bytesPerSample;
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // WAV header
    AudioManager.writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferLength - 8, true);
    AudioManager.writeString(view, 8, 'WAVE');
    AudioManager.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    AudioManager.writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  }

  private static writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  /**
   * Start background music
   */
  startMusic(): void {
    if (this.musicPlaying || !this.audioContext) return;
    this.musicPlaying = true;

    // Create a dark ambient loop
    this.playAmbientMusic();
  }

  private playAmbientMusic(): void {
    if (!this.audioContext || !this.musicPlaying) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Create a dark, atmospheric drone
    const createDrone = (freq: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Slow LFO for movement
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.1;
      lfoGain.gain.value = freq * 0.02;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);

      filter.type = 'lowpass';
      filter.frequency.value = 400;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(CONFIG.AUDIO.MUSIC_VOLUME * 0.15, now + 2);
      gain.gain.setValueAtTime(CONFIG.AUDIO.MUSIC_VOLUME * 0.15, now + duration - 2);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    };

    // Play layered drones
    const loopDuration = 16;
    createDrone(55, loopDuration);    // A1
    createDrone(82.5, loopDuration);  // E2
    createDrone(110, loopDuration);   // A2

    // Schedule next loop
    setTimeout(() => {
      if (this.musicPlaying) {
        this.playAmbientMusic();
      }
    }, (loopDuration - 2) * 1000);
  }

  stopMusic(): void {
    this.musicPlaying = false;
  }

  // Convenience methods for playing sounds
  playAttack(): void {
    this.scene.sound.play('sfx_attack', { volume: CONFIG.AUDIO.SFX_VOLUME });
  }

  playHit(): void {
    this.scene.sound.play('sfx_hit', { volume: CONFIG.AUDIO.SFX_VOLUME });
  }

  playCoin(): void {
    this.scene.sound.play('sfx_coin', { volume: CONFIG.AUDIO.SFX_VOLUME });
  }

  playJump(): void {
    this.scene.sound.play('sfx_jump', { volume: CONFIG.AUDIO.SFX_VOLUME });
  }

  playHurt(): void {
    this.scene.sound.play('sfx_hurt', { volume: CONFIG.AUDIO.SFX_VOLUME });
  }

  playEnemyDeath(): void {
    this.scene.sound.play('sfx_enemy_death', { volume: CONFIG.AUDIO.SFX_VOLUME });
  }

  playThrow(): void {
    this.scene.sound.play('sfx_throw', { volume: CONFIG.AUDIO.SFX_VOLUME });
  }
}
