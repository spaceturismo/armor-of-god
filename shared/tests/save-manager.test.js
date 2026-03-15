import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../src/save-manager.js';

// Mock localStorage for Node.js environment
const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  key: (i) => Object.keys(store)[i] ?? null,
  get length() { return Object.keys(store).length; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

describe('SaveManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('_key()', () => {
    it('should build correct localStorage key', () => {
      expect(SaveManager._key('armor-of-god', 'slot1'))
        .toBe('faithgames_armor-of-god_slot1');
    });

    it('should handle different game ids and slot names', () => {
      expect(SaveManager._key('parables', 'autosave'))
        .toBe('faithgames_parables_autosave');
    });
  });

  describe('save() and load()', () => {
    it('should save and load data correctly', () => {
      SaveManager.save('testgame', 'slot1', { level: 3, score: 1200 });
      const loaded = SaveManager.load('testgame', 'slot1');
      expect(loaded).toBeDefined();
      expect(loaded.level).toBe(3);
      expect(loaded.score).toBe(1200);
    });

    it('should add savedAt timestamp', () => {
      SaveManager.save('testgame', 'slot1', { level: 1 });
      const loaded = SaveManager.load('testgame', 'slot1');
      expect(loaded.savedAt).toBeDefined();
      expect(typeof loaded.savedAt).toBe('string');
      // Should be a valid ISO date string
      expect(new Date(loaded.savedAt).toISOString()).toBe(loaded.savedAt);
    });

    it('should return null for non-existent save', () => {
      expect(SaveManager.load('testgame', 'missing')).toBeNull();
    });

    it('should overwrite existing save', () => {
      SaveManager.save('testgame', 'slot1', { score: 100 });
      SaveManager.save('testgame', 'slot1', { score: 999 });
      const loaded = SaveManager.load('testgame', 'slot1');
      expect(loaded.score).toBe(999);
    });
  });

  describe('delete()', () => {
    it('should remove a saved slot', () => {
      SaveManager.save('testgame', 'slot1', { data: true });
      expect(SaveManager.hasSave('testgame', 'slot1')).toBe(true);
      SaveManager.delete('testgame', 'slot1');
      expect(SaveManager.hasSave('testgame', 'slot1')).toBe(false);
      expect(SaveManager.load('testgame', 'slot1')).toBeNull();
    });

    it('should not throw when deleting non-existent slot', () => {
      expect(() => SaveManager.delete('testgame', 'nope')).not.toThrow();
    });
  });

  describe('hasSave()', () => {
    it('should return true when save exists', () => {
      SaveManager.save('testgame', 'slot1', { x: 1 });
      expect(SaveManager.hasSave('testgame', 'slot1')).toBe(true);
    });

    it('should return false when save does not exist', () => {
      expect(SaveManager.hasSave('testgame', 'slot1')).toBe(false);
    });
  });

  describe('listSaves()', () => {
    it('should return empty array when no saves exist', () => {
      expect(SaveManager.listSaves('testgame')).toEqual([]);
    });

    it('should list all slot names for a game', () => {
      SaveManager.save('mygame', 'auto', { a: 1 });
      SaveManager.save('mygame', 'slot1', { b: 2 });
      SaveManager.save('mygame', 'slot2', { c: 3 });
      const slots = SaveManager.listSaves('mygame');
      expect(slots).toHaveLength(3);
      expect(slots).toContain('auto');
      expect(slots).toContain('slot1');
      expect(slots).toContain('slot2');
    });

    it('should not include saves from other games', () => {
      SaveManager.save('game-a', 'slot1', { x: 1 });
      SaveManager.save('game-b', 'slot1', { y: 2 });
      const slotsA = SaveManager.listSaves('game-a');
      expect(slotsA).toHaveLength(1);
      expect(slotsA).toContain('slot1');
    });
  });
});
