import { describe, it, expect } from 'vitest';
import { ScriptureDB } from '../src/scripture.js';

describe('ScriptureDB', () => {
  describe('scriptures data', () => {
    it('should have 16 scriptures in the database', () => {
      expect(ScriptureDB.scriptures).toHaveLength(16);
    });

    it('should have unique ids for all scriptures', () => {
      const ids = ScriptureDB.scriptures.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have required fields on every scripture', () => {
      ScriptureDB.scriptures.forEach((s) => {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('reference');
        expect(s).toHaveProperty('text');
        expect(s).toHaveProperty('category');
        expect(typeof s.id).toBe('number');
        expect(typeof s.reference).toBe('string');
        expect(typeof s.text).toBe('string');
        expect(typeof s.category).toBe('string');
        expect(s.text.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getByCategory()', () => {
    it('should return armor scriptures', () => {
      const results = ScriptureDB.getByCategory('armor');
      expect(results.length).toBeGreaterThanOrEqual(6);
      results.forEach((s) => expect(s.category).toBe('armor'));
    });

    it('should return parable scriptures', () => {
      const results = ScriptureDB.getByCategory('parable');
      expect(results.length).toBeGreaterThanOrEqual(4);
      results.forEach((s) => expect(s.category).toBe('parable'));
    });

    it('should be case-insensitive', () => {
      const upper = ScriptureDB.getByCategory('ARMOR');
      const lower = ScriptureDB.getByCategory('armor');
      expect(upper).toEqual(lower);
    });

    it('should return empty array for unknown category', () => {
      expect(ScriptureDB.getByCategory('nonexistent')).toEqual([]);
    });
  });

  describe('getById()', () => {
    it('should return the correct scripture by id', () => {
      const result = ScriptureDB.getById(1);
      expect(result).toBeDefined();
      expect(result.reference).toBe('Ephesians 6:10');
    });

    it('should return John 3:16 by id 14', () => {
      const result = ScriptureDB.getById(14);
      expect(result).toBeDefined();
      expect(result.reference).toBe('John 3:16');
      expect(result.category).toBe('love');
    });

    it('should return undefined for non-existent id', () => {
      expect(ScriptureDB.getById(999)).toBeUndefined();
    });
  });

  describe('getRandom()', () => {
    it('should return a valid scripture', () => {
      const result = ScriptureDB.getRandom();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('reference');
      expect(result).toHaveProperty('text');
    });

    it('should return scriptures from the database', () => {
      // Call multiple times to verify randomness doesn't break
      for (let i = 0; i < 20; i++) {
        const result = ScriptureDB.getRandom();
        expect(ScriptureDB.scriptures).toContain(result);
      }
    });
  });

  describe('getByReference()', () => {
    it('should find scripture by exact reference', () => {
      const result = ScriptureDB.getByReference('John 3:16');
      expect(result).toBeDefined();
      expect(result.id).toBe(14);
    });

    it('should find scripture by partial reference', () => {
      const result = ScriptureDB.getByReference('Philippians');
      expect(result).toBeDefined();
      expect(result.reference).toBe('Philippians 4:13');
    });

    it('should be case-insensitive', () => {
      const result = ScriptureDB.getByReference('john 3:16');
      expect(result).toBeDefined();
      expect(result.reference).toBe('John 3:16');
    });

    it('should return undefined for non-matching reference', () => {
      expect(ScriptureDB.getByReference('Revelation 22:21')).toBeUndefined();
    });

    it('should find Ephesians 6:14 (armor verse)', () => {
      const result = ScriptureDB.getByReference('Ephesians 6:14');
      expect(result).toBeDefined();
      expect(result.category).toBe('armor');
    });
  });
});
