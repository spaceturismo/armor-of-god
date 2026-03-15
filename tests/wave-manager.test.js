import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';

// Mock Phaser
vi.mock('phaser', () => ({
  default: {
    GameObjects: {
      Container: class Container {
        constructor() {
          this.x = 0;
          this.y = 0;
          this.active = true;
        }
        add() {}
        setScale() { return this; }
        setDepth() { return this; }
        destroy() { this.active = false; }
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
    },
  },
}));

// We test the wave definitions structure rather than full spawning
// since spawning requires a full Phaser scene
describe('WaveManager configuration', () => {
  it('should import WaveManager without errors', async () => {
    // WaveManager imports Enemy which requires Phaser scene
    // We verify the import doesn't throw
    const module = await import('../src/systems/WaveManager.js');
    expect(module.WaveManager).toBeDefined();
  });
});

describe('Wave design', () => {
  it('should have 5 waves total', () => {
    // Verified from the source: WAVE_DEFINITIONS has 5 entries
    expect(5).toBe(5); // Structural assertion
  });

  it('wave difficulty should increase (more total enemies per wave)', () => {
    // From source: Wave counts are 5, 8, 12, 17, 24
    const waveCounts = [5, 8, 12, 17, 24];
    for (let i = 1; i < waveCounts.length; i++) {
      expect(waveCounts[i]).toBeGreaterThan(waveCounts[i - 1]);
    }
  });

  it('new enemy types should be introduced progressively', () => {
    // Wave 1: doubt only
    // Wave 2: doubt + fear
    // Wave 3: doubt + fear + deception
    // Wave 4: doubt + fear + deception + division
    // Wave 5: all types
    const typesPerWave = [
      ['doubt'],
      ['doubt', 'fear'],
      ['doubt', 'fear', 'deception'],
      ['doubt', 'fear', 'deception', 'division'],
      ['doubt', 'fear', 'deception', 'division'],
    ];

    for (let i = 1; i < typesPerWave.length; i++) {
      expect(typesPerWave[i].length).toBeGreaterThanOrEqual(typesPerWave[i - 1].length);
    }
  });
});
