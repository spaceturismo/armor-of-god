import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';

// Mock Phaser
vi.mock('phaser', () => ({
  default: {
    Math: {
      Distance: {
        Between: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
      },
      Angle: {
        Between: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
      },
    },
  },
}));

import { CombatSystem } from '../src/systems/CombatSystem.js';

describe('CombatSystem', () => {
  describe('calculateDamage()', () => {
    it('should reduce damage based on defense', () => {
      // base 10 damage, defense 10 => 10 - (10*0.3) = 7
      expect(CombatSystem.calculateDamage(10, 10)).toBe(7);
    });

    it('should return minimum of 1 damage', () => {
      // base 1, defense 100 => max(1, 1 - 30) = 1
      expect(CombatSystem.calculateDamage(1, 100)).toBe(1);
    });

    it('should handle zero defense', () => {
      expect(CombatSystem.calculateDamage(15, 0)).toBe(15);
    });

    it('should round the result', () => {
      // base 10, defense 3 => 10 - 0.9 = 9.1 => 9
      expect(CombatSystem.calculateDamage(10, 3)).toBe(9);
    });
  });

  describe('isInRange()', () => {
    it('should return true when objects are within range', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 }; // distance = 5
      expect(CombatSystem.isInRange(a, b, 5)).toBe(true);
      expect(CombatSystem.isInRange(a, b, 10)).toBe(true);
    });

    it('should return false when objects are out of range', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 30, y: 40 }; // distance = 50
      expect(CombatSystem.isInRange(a, b, 10)).toBe(false);
    });

    it('should return true when objects are at exact range', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 }; // distance = 5
      expect(CombatSystem.isInRange(a, b, 5)).toBe(true);
    });

    it('should handle same position', () => {
      const a = { x: 10, y: 20 };
      const b = { x: 10, y: 20 };
      expect(CombatSystem.isInRange(a, b, 0)).toBe(true);
    });
  });

  describe('handlePlayerAttack()', () => {
    it('should not throw when player is null', () => {
      const scene = { events: { emit: vi.fn() } };
      const combat = new CombatSystem(scene);
      expect(() => combat.handlePlayerAttack(null, [])).not.toThrow();
    });

    it('should not throw when player health is 0', () => {
      const scene = { events: { emit: vi.fn() } };
      const combat = new CombatSystem(scene);
      const player = { health: 0, attack: vi.fn() };
      expect(() => combat.handlePlayerAttack(player, [])).not.toThrow();
    });
  });

  describe('handleEnemyAttack()', () => {
    it('should not attack if enemy is dead', () => {
      const scene = { events: { emit: vi.fn() } };
      const combat = new CombatSystem(scene);
      const enemy = { alive: false, tryAttack: vi.fn() };
      const target = { takeDamage: vi.fn() };

      const result = combat.handleEnemyAttack(enemy, target);
      expect(result).toBeUndefined();
      expect(enemy.tryAttack).not.toHaveBeenCalled();
    });

    it('should emit churchDamage for church targets', () => {
      const emitFn = vi.fn();
      const scene = { events: { emit: emitFn } };
      const combat = new CombatSystem(scene);
      const enemy = { alive: true, damage: 8, tryAttack: vi.fn(() => true) };
      const church = { x: 100, y: 100 };

      combat.handleEnemyAttack(enemy, church, true);
      expect(emitFn).toHaveBeenCalledWith('churchDamage', 8);
    });

    it('should call takeDamage on player target', () => {
      const scene = { events: { emit: vi.fn() } };
      const combat = new CombatSystem(scene);
      const enemy = { alive: true, damage: 5, tryAttack: vi.fn(() => true) };
      const player = { takeDamage: vi.fn() };

      combat.handleEnemyAttack(enemy, player, false);
      expect(player.takeDamage).toHaveBeenCalledWith(5);
    });
  });
});
