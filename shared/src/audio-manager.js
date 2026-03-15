// ============================================================================
// audio-manager.js — Audio manager for Phaser 3 scenes
// ============================================================================

import { SaveManager } from './save-manager.js';

/**
 * Manages background music and sound effects for a Phaser scene.
 *
 * Features:
 * - Background music playback with crossfade between tracks
 * - Sound effect playback
 * - Separate volume controls for music and SFX
 * - Mute / unmute toggle
 * - Persists volume preferences via SaveManager
 *
 * Usage:
 * ```js
 * import { AudioManager } from '@faith-games/shared';
 *
 * class MyScene extends Phaser.Scene {
 *   create() {
 *     this.audio = new AudioManager(this);
 *     this.audio.playBgm('main-theme', { loop: true });
 *   }
 * }
 * ```
 */
export class AudioManager {
  /** Key used for persisting audio preferences */
  static PREFS_GAME_ID = '_audio';
  static PREFS_SLOT = 'prefs';

  /**
   * @param {Phaser.Scene} scene - The Phaser scene this manager is attached to
   */
  constructor(scene) {
    /** @type {Phaser.Scene} */
    this.scene = scene;

    /** @type {Phaser.Sound.BaseSound|null} Currently playing background music */
    this.currentBgm = null;

    /** @type {string|null} Key of the current BGM track */
    this.currentBgmKey = null;

    /** @type {number} Music volume (0 to 1) */
    this.musicVolume = 0.5;

    /** @type {number} SFX volume (0 to 1) */
    this.sfxVolume = 0.7;

    /** @type {boolean} Whether all audio is muted */
    this.isMuted = false;

    // Load saved preferences if they exist
    this._loadPrefs();
  }

  // ---------------------------------------------------------------------------
  // Background music
  // ---------------------------------------------------------------------------

  /**
   * Play background music. If a different track is already playing it will
   * be crossfaded out before the new track starts.
   *
   * @param {string} key    - Phaser audio key (must already be loaded)
   * @param {Object} [config]         - Phaser sound config overrides
   * @param {boolean} [config.loop=true]    - Loop the track
   * @param {number}  [config.fadeDuration=800] - Crossfade duration in ms
   */
  playBgm(key, config = {}) {
    const { loop = true, fadeDuration = 800, ...rest } = config;

    // Don't restart the same track
    if (this.currentBgmKey === key && this.currentBgm && this.currentBgm.isPlaying) {
      return;
    }

    // Fade out current track (if any)
    if (this.currentBgm && this.currentBgm.isPlaying) {
      this.scene.tweens.add({
        targets: this.currentBgm,
        volume: 0,
        duration: fadeDuration,
        onComplete: () => {
          this.currentBgm.stop();
        },
      });
    }

    // Start new track
    const volume = this.isMuted ? 0 : this.musicVolume;
    this.currentBgm = this.scene.sound.add(key, { loop, volume: 0, ...rest });
    this.currentBgmKey = key;
    this.currentBgm.play();

    // Fade in
    this.scene.tweens.add({
      targets: this.currentBgm,
      volume,
      duration: fadeDuration,
    });
  }

  /**
   * Stop the current background music with an optional fade out.
   * @param {number} [fadeDuration=500] - Fade out duration in ms
   */
  stopBgm(fadeDuration = 500) {
    if (!this.currentBgm || !this.currentBgm.isPlaying) return;

    this.scene.tweens.add({
      targets: this.currentBgm,
      volume: 0,
      duration: fadeDuration,
      onComplete: () => {
        this.currentBgm.stop();
        this.currentBgm = null;
        this.currentBgmKey = null;
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Sound effects
  // ---------------------------------------------------------------------------

  /**
   * Play a one-shot sound effect.
   *
   * @param {string} key    - Phaser audio key
   * @param {Object} [config] - Phaser sound config overrides
   * @returns {Phaser.Sound.BaseSound} The sound instance
   */
  playSfx(key, config = {}) {
    const volume = this.isMuted ? 0 : this.sfxVolume;
    return this.scene.sound.play(key, { volume, ...config });
  }

  // ---------------------------------------------------------------------------
  // Volume controls
  // ---------------------------------------------------------------------------

  /**
   * Set background music volume (0 to 1).
   * @param {number} vol - Volume level
   */
  setMusicVolume(vol) {
    this.musicVolume = Phaser.Math.Clamp(vol, 0, 1);

    if (this.currentBgm && !this.isMuted) {
      this.currentBgm.setVolume(this.musicVolume);
    }

    this._savePrefs();
  }

  /**
   * Set sound effects volume (0 to 1).
   * @param {number} vol - Volume level
   */
  setSfxVolume(vol) {
    this.sfxVolume = Phaser.Math.Clamp(vol, 0, 1);
    this._savePrefs();
  }

  // ---------------------------------------------------------------------------
  // Mute controls
  // ---------------------------------------------------------------------------

  /** Mute all audio. */
  mute() {
    this.isMuted = true;

    if (this.currentBgm) {
      this.currentBgm.setVolume(0);
    }

    this._savePrefs();
  }

  /** Unmute all audio, restoring previous volumes. */
  unmute() {
    this.isMuted = false;

    if (this.currentBgm) {
      this.currentBgm.setVolume(this.musicVolume);
    }

    this._savePrefs();
  }

  /**
   * Toggle mute state.
   * @returns {boolean} The new muted state
   */
  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.isMuted;
  }

  // ---------------------------------------------------------------------------
  // Persistence (private)
  // ---------------------------------------------------------------------------

  /** Save volume preferences to localStorage via SaveManager. @private */
  _savePrefs() {
    SaveManager.save(AudioManager.PREFS_GAME_ID, AudioManager.PREFS_SLOT, {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isMuted: this.isMuted,
    });
  }

  /** Load volume preferences from localStorage. @private */
  _loadPrefs() {
    const prefs = SaveManager.load(AudioManager.PREFS_GAME_ID, AudioManager.PREFS_SLOT);
    if (!prefs) return;

    if (typeof prefs.musicVolume === 'number') this.musicVolume = prefs.musicVolume;
    if (typeof prefs.sfxVolume === 'number') this.sfxVolume = prefs.sfxVolume;
    if (typeof prefs.isMuted === 'boolean') this.isMuted = prefs.isMuted;
  }
}
