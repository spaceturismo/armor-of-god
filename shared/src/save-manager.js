// ============================================================================
// save-manager.js — LocalStorage-based save system for faith-based games
// ============================================================================

/**
 * Manages game save data using the browser's localStorage.
 *
 * Each save is stored under a key with the pattern:
 *   `faithgames_{gameId}_{slotName}`
 *
 * Usage:
 * ```js
 * import { SaveManager } from '@faith-games/shared';
 *
 * // Save some progress
 * SaveManager.save('armor-of-god', 'slot1', { level: 3, score: 1200 });
 *
 * // Load it back
 * const data = SaveManager.load('armor-of-god', 'slot1');
 * console.log(data.level); // 3
 * ```
 */
export class SaveManager {
  /**
   * Build the localStorage key for a given game and slot.
   * @param {string} gameId   - Unique game identifier (e.g. "armor-of-god")
   * @param {string} slotName - Save slot name (e.g. "slot1", "autosave")
   * @returns {string} The full localStorage key
   * @private
   */
  static _key(gameId, slotName) {
    return `faithgames_${gameId}_${slotName}`;
  }

  /**
   * Save data to a named slot.
   * A `savedAt` ISO timestamp is automatically added to the data.
   *
   * @param {string} gameId   - Game identifier
   * @param {string} slotName - Slot name
   * @param {Object} data     - Arbitrary JSON-serializable data to store
   */
  static save(gameId, slotName, data) {
    const payload = {
      ...data,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(this._key(gameId, slotName), JSON.stringify(payload));
    } catch (err) {
      console.error(`[SaveManager] Failed to save ${gameId}/${slotName}:`, err);
    }
  }

  /**
   * Load data from a named slot.
   *
   * @param {string} gameId   - Game identifier
   * @param {string} slotName - Slot name
   * @returns {Object|null} The parsed save data, or null if not found
   */
  static load(gameId, slotName) {
    try {
      const raw = localStorage.getItem(this._key(gameId, slotName));
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error(`[SaveManager] Failed to load ${gameId}/${slotName}:`, err);
      return null;
    }
  }

  /**
   * Delete a saved slot.
   *
   * @param {string} gameId   - Game identifier
   * @param {string} slotName - Slot name
   */
  static delete(gameId, slotName) {
    try {
      localStorage.removeItem(this._key(gameId, slotName));
    } catch (err) {
      console.error(`[SaveManager] Failed to delete ${gameId}/${slotName}:`, err);
    }
  }

  /**
   * List all save slot names for a given game.
   * Scans localStorage keys that start with the game's prefix.
   *
   * @param {string} gameId - Game identifier
   * @returns {string[]} Array of slot names (not full keys)
   */
  static listSaves(gameId) {
    const prefix = `faithgames_${gameId}_`;
    const slots = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          // Extract just the slot name portion after the prefix
          slots.push(key.slice(prefix.length));
        }
      }
    } catch (err) {
      console.error(`[SaveManager] Failed to list saves for ${gameId}:`, err);
    }

    return slots;
  }

  /**
   * Check whether a save exists for a given game and slot.
   *
   * @param {string} gameId   - Game identifier
   * @param {string} slotName - Slot name
   * @returns {boolean} True if the save exists
   */
  static hasSave(gameId, slotName) {
    try {
      return localStorage.getItem(this._key(gameId, slotName)) !== null;
    } catch (err) {
      return false;
    }
  }
}
