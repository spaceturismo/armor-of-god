import { describe, it, expect, vi } from 'vitest';

// Phaser accesses `window` at module load, so mock it before import
globalThis.window = globalThis;
globalThis.document = {
  createElement: () => ({
    getContext: () => null,
    style: {},
  }),
  readyState: 'complete',
  addEventListener: vi.fn(),
};

// Mock the full phaser module to avoid browser API dependencies
vi.mock('phaser', () => ({
  default: {
    GameObjects: {
      Container: class Container {
        constructor() {}
        add() {}
      },
    },
    Math: {
      Between: (min, max) => min,
      Distance: {
        Between: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
      },
      Angle: {
        Between: () => 0,
      },
      Clamp: (v, min, max) => Math.min(Math.max(v, min), max),
    },
  },
}));

const { ENEMY_TYPES } = await import('../src/entities/Enemy.js');

describe('ENEMY_TYPES', () => {
  it('should have exactly 4 enemy types', () => {
    expect(Object.keys(ENEMY_TYPES)).toHaveLength(4);
  });

  it('should have doubt, fear, deception, and division', () => {
    expect(ENEMY_TYPES).toHaveProperty('doubt');
    expect(ENEMY_TYPES).toHaveProperty('fear');
    expect(ENEMY_TYPES).toHaveProperty('deception');
    expect(ENEMY_TYPES).toHaveProperty('division');
  });

  describe('enemy type configurations', () => {
    const requiredFields = ['name', 'texture', 'health', 'speed', 'damage', 'points', 'color', 'attackRate'];

    Object.entries(ENEMY_TYPES).forEach(([key, config]) => {
      describe(`${key}`, () => {
        requiredFields.forEach((field) => {
          it(`should have ${field}`, () => {
            expect(config).toHaveProperty(field);
          });
        });

        it('should have positive health', () => {
          expect(config.health).toBeGreaterThan(0);
        });

        it('should have positive speed', () => {
          expect(config.speed).toBeGreaterThan(0);
        });

        it('should have positive damage', () => {
          expect(config.damage).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Doubt enemy', () => {
    it('should be slow with moderate health', () => {
      expect(ENEMY_TYPES.doubt.speed).toBe(50);
      expect(ENEMY_TYPES.doubt.health).toBe(40);
      expect(ENEMY_TYPES.doubt.name).toBe('Doubt');
    });
  });

  describe('Fear enemy', () => {
    it('should be fast with low health', () => {
      expect(ENEMY_TYPES.fear.speed).toBe(100);
      expect(ENEMY_TYPES.fear.health).toBe(20);
      expect(ENEMY_TYPES.fear.name).toBe('Fear');
    });

    it('should be faster than Doubt', () => {
      expect(ENEMY_TYPES.fear.speed).toBeGreaterThan(ENEMY_TYPES.doubt.speed);
    });
  });

  describe('Deception enemy', () => {
    it('should have invisible flag and reveal range', () => {
      expect(ENEMY_TYPES.deception.invisible).toBe(true);
      expect(ENEMY_TYPES.deception.revealRange).toBe(120);
    });
  });

  describe('Division enemy', () => {
    it('should have splits flag', () => {
      expect(ENEMY_TYPES.division.splits).toBe(true);
    });
  });
});
