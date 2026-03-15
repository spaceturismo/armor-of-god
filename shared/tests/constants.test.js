import { describe, it, expect } from 'vitest';
import { COLORS, COLORS_CSS, FONT_STYLES, GAME_IDS, CATEGORIES } from '../src/constants.js';

describe('Constants', () => {
  describe('COLORS', () => {
    it('should export a COLORS object with hex number values', () => {
      expect(typeof COLORS).toBe('object');
      expect(typeof COLORS.GOLD).toBe('number');
      expect(COLORS.GOLD).toBe(0xFFD700);
    });

    it('should have all expected color keys', () => {
      const expectedKeys = [
        'GOLD', 'GOLD_LIGHT', 'ROYAL_BLUE', 'SKY_BLUE', 'WHITE',
        'PURPLE', 'PURPLE_DARK', 'RED', 'ROSE', 'GREEN', 'GREEN_LIGHT',
        'BROWN', 'PARCHMENT', 'DARK', 'GRAY', 'GRAY_LIGHT',
      ];
      expectedKeys.forEach((key) => {
        expect(COLORS).toHaveProperty(key);
        expect(typeof COLORS[key]).toBe('number');
      });
    });

    it('should have color values in valid hex range', () => {
      Object.values(COLORS).forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(0xFFFFFF);
      });
    });
  });

  describe('COLORS_CSS', () => {
    it('should export CSS hex strings matching COLORS keys', () => {
      expect(typeof COLORS_CSS).toBe('object');
      expect(COLORS_CSS.GOLD).toBe('#FFD700');
      expect(COLORS_CSS.WHITE).toBe('#FFFFFF');
    });

    it('should have the same keys as COLORS', () => {
      const colorKeys = Object.keys(COLORS);
      const cssKeys = Object.keys(COLORS_CSS);
      expect(cssKeys).toEqual(colorKeys);
    });

    it('should have valid CSS hex color strings', () => {
      Object.values(COLORS_CSS).forEach((val) => {
        expect(val).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('FONT_STYLES', () => {
    it('should have all expected style presets', () => {
      expect(FONT_STYLES).toHaveProperty('HEADING');
      expect(FONT_STYLES).toHaveProperty('BODY');
      expect(FONT_STYLES).toHaveProperty('SCRIPTURE');
      expect(FONT_STYLES).toHaveProperty('SCRIPTURE_REF');
      expect(FONT_STYLES).toHaveProperty('BUTTON');
      expect(FONT_STYLES).toHaveProperty('SMALL');
    });

    it('should have fontFamily and fontSize on each style', () => {
      Object.values(FONT_STYLES).forEach((style) => {
        expect(style).toHaveProperty('fontFamily');
        expect(style).toHaveProperty('fontSize');
        expect(typeof style.fontFamily).toBe('string');
        expect(typeof style.fontSize).toBe('string');
      });
    });

    it('HEADING should use Georgia and gold color', () => {
      expect(FONT_STYLES.HEADING.fontFamily).toContain('Georgia');
      expect(FONT_STYLES.HEADING.color).toBe(COLORS_CSS.GOLD);
      expect(FONT_STYLES.HEADING.fontStyle).toBe('bold');
    });
  });

  describe('GAME_IDS', () => {
    it('should have correct game identifiers', () => {
      expect(GAME_IDS.ARMOR_OF_GOD).toBe('armor-of-god');
      expect(GAME_IDS.PARABLES).toBe('parables');
    });
  });

  describe('CATEGORIES', () => {
    it('should have all expected categories', () => {
      expect(CATEGORIES.FAITH).toBe('faith');
      expect(CATEGORIES.ARMOR).toBe('armor');
      expect(CATEGORIES.LOVE).toBe('love');
      expect(CATEGORIES.FORGIVENESS).toBe('forgiveness');
      expect(CATEGORIES.COURAGE).toBe('courage');
      expect(CATEGORIES.WISDOM).toBe('wisdom');
      expect(CATEGORIES.PARABLE).toBe('parable');
    });
  });
});
