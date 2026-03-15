import { describe, it, expect } from 'vitest';
import { ARMOR_CLASSES } from '../src/scenes/CharacterSelectScene.js';

// Mock Phaser since CharacterSelectScene imports it
import { vi } from 'vitest';
vi.mock('phaser', () => ({
  default: {
    Scene: class Scene {
      constructor() {}
    },
    Math: {
      Clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    },
  },
}));

// Mock shared imports
vi.mock('@faith-games/shared', () => ({
  createButton: vi.fn(),
  createPanel: vi.fn(),
  createScriptureDisplay: vi.fn(),
  ScriptureDB: { getByReference: vi.fn() },
  COLORS: { GOLD: 0xFFD700, DARK: 0x2C2C2C, GRAY: 0x808080 },
  COLORS_CSS: { GOLD: '#FFD700', WHITE: '#FFFFFF', GRAY_LIGHT: '#D3D3D3' },
  FONT_STYLES: {
    HEADING: { fontFamily: 'Georgia', fontSize: '36px', color: '#FFD700' },
    BODY: { fontFamily: 'Georgia', fontSize: '18px', color: '#FFFFFF' },
    SMALL: { fontFamily: 'Arial', fontSize: '14px', color: '#D3D3D3' },
    BUTTON: { fontFamily: 'Arial', fontSize: '22px', color: '#FFFFFF' },
  },
}));

describe('ARMOR_CLASSES', () => {
  it('should have exactly 6 armor classes', () => {
    expect(ARMOR_CLASSES).toHaveLength(6);
  });

  it('should have all 6 armor piece ids', () => {
    const ids = ARMOR_CLASSES.map((c) => c.id);
    expect(ids).toContain('truth');
    expect(ids).toContain('righteousness');
    expect(ids).toContain('peace');
    expect(ids).toContain('faith');
    expect(ids).toContain('salvation');
    expect(ids).toContain('spirit');
  });

  it('should have required fields on each class', () => {
    ARMOR_CLASSES.forEach((cls) => {
      expect(cls).toHaveProperty('id');
      expect(cls).toHaveProperty('name');
      expect(cls).toHaveProperty('role');
      expect(cls).toHaveProperty('color');
      expect(cls).toHaveProperty('textureKey');
      expect(cls).toHaveProperty('description');
      expect(cls).toHaveProperty('ability');
      expect(cls).toHaveProperty('passive');
      expect(cls).toHaveProperty('verse');
      expect(cls).toHaveProperty('stats');
    });
  });

  it('should have stats with all required stat fields', () => {
    ARMOR_CLASSES.forEach((cls) => {
      expect(cls.stats).toHaveProperty('health');
      expect(cls.stats).toHaveProperty('speed');
      expect(cls.stats).toHaveProperty('attack');
      expect(cls.stats).toHaveProperty('defense');
      expect(cls.stats).toHaveProperty('cooldown');
      // All stats should be positive
      expect(cls.stats.health).toBeGreaterThan(0);
      expect(cls.stats.speed).toBeGreaterThan(0);
      expect(cls.stats.attack).toBeGreaterThan(0);
      expect(cls.stats.defense).toBeGreaterThan(0);
      expect(cls.stats.cooldown).toBeGreaterThan(0);
    });
  });

  it('should reference Ephesians 6 verses', () => {
    ARMOR_CLASSES.forEach((cls) => {
      expect(cls.verse).toMatch(/^Ephesians 6:/);
    });
  });

  describe('class roles', () => {
    it('Belt of Truth should be Support', () => {
      const truth = ARMOR_CLASSES.find((c) => c.id === 'truth');
      expect(truth.role).toBe('Support');
    });

    it('Breastplate of Righteousness should be Tank', () => {
      const right = ARMOR_CLASSES.find((c) => c.id === 'righteousness');
      expect(right.role).toBe('Tank');
    });

    it('Sword of the Spirit should be DPS', () => {
      const spirit = ARMOR_CLASSES.find((c) => c.id === 'spirit');
      expect(spirit.role).toBe('DPS');
    });
  });

  describe('stat balance', () => {
    it('Tank (Righteousness) should have the most health', () => {
      const tank = ARMOR_CLASSES.find((c) => c.id === 'righteousness');
      ARMOR_CLASSES.forEach((cls) => {
        expect(tank.stats.health).toBeGreaterThanOrEqual(cls.stats.health);
      });
    });

    it('Speed class (Peace) should have the most speed', () => {
      const peace = ARMOR_CLASSES.find((c) => c.id === 'peace');
      ARMOR_CLASSES.forEach((cls) => {
        expect(peace.stats.speed).toBeGreaterThanOrEqual(cls.stats.speed);
      });
    });

    it('DPS class (Spirit) should have the most attack', () => {
      const spirit = ARMOR_CLASSES.find((c) => c.id === 'spirit');
      ARMOR_CLASSES.forEach((cls) => {
        expect(spirit.stats.attack).toBeGreaterThanOrEqual(cls.stats.attack);
      });
    });

    it('Tank (Righteousness) should have the most defense', () => {
      const tank = ARMOR_CLASSES.find((c) => c.id === 'righteousness');
      ARMOR_CLASSES.forEach((cls) => {
        expect(tank.stats.defense).toBeGreaterThanOrEqual(cls.stats.defense);
      });
    });
  });
});
