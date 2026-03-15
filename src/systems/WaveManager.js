// ============================================================================
// WaveManager.js — Manages enemy wave spawning and progression
// ============================================================================

import { Enemy, ENEMY_TYPES } from '../entities/Enemy.js';

/**
 * Wave definitions — 5 waves of increasing difficulty.
 * Each wave specifies groups of enemies to spawn with delays.
 */
const WAVE_DEFINITIONS = [
  // Wave 1: Introduction — just Doubt enemies
  {
    groups: [
      { type: 'doubt', count: 5, delay: 1200 },
    ],
  },
  // Wave 2: Add Fear enemies
  {
    groups: [
      { type: 'doubt', count: 4, delay: 1000 },
      { type: 'fear', count: 4, delay: 800 },
    ],
  },
  // Wave 3: Introduce Deception
  {
    groups: [
      { type: 'doubt', count: 5, delay: 900 },
      { type: 'fear', count: 4, delay: 700 },
      { type: 'deception', count: 3, delay: 1100 },
    ],
  },
  // Wave 4: Full enemy roster + Division
  {
    groups: [
      { type: 'doubt', count: 6, delay: 800 },
      { type: 'fear', count: 5, delay: 600 },
      { type: 'deception', count: 3, delay: 900 },
      { type: 'division', count: 3, delay: 1000 },
    ],
  },
  // Wave 5: Final onslaught — everything at once, faster spawns
  {
    groups: [
      { type: 'doubt', count: 8, delay: 600 },
      { type: 'fear', count: 7, delay: 500 },
      { type: 'deception', count: 4, delay: 700 },
      { type: 'division', count: 5, delay: 800 },
    ],
  },
];

/**
 * WaveManager — controls enemy spawning across 5 waves.
 */
export class WaveManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.currentWave = 0;
    this.totalWaves = WAVE_DEFINITIONS.length;
    this.enemies = []; // active enemy references
    this.isSpawning = false;
    this.waveComplete = false;
    this.allWavesComplete = false;
    this.enemiesRemaining = 0;
    this.totalEnemiesInWave = 0;
    this.spawnTimers = [];

    // Listen for enemy death events
    this.scene.events.on('enemyKilled', (enemy) => {
      this._onEnemyKilled(enemy);
    });
  }

  // ---------------------------------------------------------------------------
  // Start a wave (1-indexed for display, 0-indexed internally)
  // ---------------------------------------------------------------------------
  startWave(waveNumber) {
    this.currentWave = waveNumber;
    const waveDef = WAVE_DEFINITIONS[waveNumber - 1];

    if (!waveDef) {
      this.allWavesComplete = true;
      this.scene.events.emit('allWavesComplete');
      return;
    }

    this.isSpawning = true;
    this.waveComplete = false;
    this.enemiesRemaining = 0;
    this.totalEnemiesInWave = 0;

    // Calculate total enemies for this wave
    for (const group of waveDef.groups) {
      this.totalEnemiesInWave += group.count;
    }
    this.enemiesRemaining = this.totalEnemiesInWave;

    // Emit wave start event
    this.scene.events.emit('waveStart', waveNumber);

    // Schedule spawns for each group
    for (const group of waveDef.groups) {
      for (let i = 0; i < group.count; i++) {
        const timer = this.scene.time.delayedCall(
          group.delay * (i + 1) + Math.random() * 300,
          () => {
            this._spawnEnemy(group.type);
          }
        );
        this.spawnTimers.push(timer);
      }
    }

    // Mark spawning complete after all timers
    const maxDelay = waveDef.groups.reduce((max, g) => {
      return Math.max(max, g.delay * (g.count + 1));
    }, 0);

    this.scene.time.delayedCall(maxDelay + 500, () => {
      this.isSpawning = false;
    });
  }

  // ---------------------------------------------------------------------------
  // Update — check wave completion
  // ---------------------------------------------------------------------------
  update() {
    if (this.waveComplete || this.allWavesComplete) return;

    // Clean up destroyed enemies from tracking array
    this.enemies = this.enemies.filter((e) => e.active && e.alive);

    // Wave is complete when all enemies are killed and spawning is done
    if (!this.isSpawning && this.enemies.length === 0 && this.enemiesRemaining <= 0) {
      this.waveComplete = true;
      this.scene.events.emit('waveComplete', this.currentWave);

      // Check if all waves are done
      if (this.currentWave >= this.totalWaves) {
        this.allWavesComplete = true;
        this.scene.time.delayedCall(1500, () => {
          this.scene.events.emit('allWavesComplete');
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Spawn a single enemy at a random edge of the screen
  // ---------------------------------------------------------------------------
  _spawnEnemy(type) {
    const { width, height } = this.scene.cameras.main;
    const margin = 30;

    // Random edge: 0=top, 1=right, 2=bottom, 3=left
    const edge = Phaser.Math.Between(0, 3);
    let x, y;

    switch (edge) {
      case 0: // top
        x = Phaser.Math.Between(margin, width - margin);
        y = -margin;
        break;
      case 1: // right
        x = width + margin;
        y = Phaser.Math.Between(margin, height - margin);
        break;
      case 2: // bottom
        x = Phaser.Math.Between(margin, width - margin);
        y = height + margin;
        break;
      case 3: // left
        x = -margin;
        y = Phaser.Math.Between(margin, height - margin);
        break;
    }

    const enemy = new Enemy(this.scene, x, y, type);
    this.enemies.push(enemy);

    // Add to the scene's enemy group for collision detection
    if (this.scene.enemyGroup) {
      this.scene.enemyGroup.add(enemy);
    }
  }

  // ---------------------------------------------------------------------------
  // Spawn split children (for Division enemies)
  // ---------------------------------------------------------------------------
  spawnSplitEnemies(parentEnemy) {
    const offset = 15;
    const overrides = {
      health: Math.round(parentEnemy.maxHealth * 0.5),
      speed: parentEnemy.speed * 1.2,
      damage: Math.round(parentEnemy.damage * 0.6),
      points: Math.round(parentEnemy.points * 0.3),
      isSplitChild: true,
    };

    for (let i = 0; i < 2; i++) {
      const ox = (i === 0 ? -offset : offset);
      const enemy = new Enemy(
        this.scene,
        parentEnemy.x + ox,
        parentEnemy.y,
        'division',
        overrides
      );
      enemy.canSplit = false; // Don't split recursively
      this.enemies.push(enemy);
      this.enemiesRemaining += 1;

      if (this.scene.enemyGroup) {
        this.scene.enemyGroup.add(enemy);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Handle enemy killed event
  // ---------------------------------------------------------------------------
  _onEnemyKilled(enemy) {
    this.enemiesRemaining = Math.max(0, this.enemiesRemaining - 1);

    // Division enemies split into two on death
    if (enemy.canSplit && !enemy.isSplitChild) {
      this.spawnSplitEnemies(enemy);
    }
  }

  // ---------------------------------------------------------------------------
  // Get all currently active enemies
  // ---------------------------------------------------------------------------
  getActiveEnemies() {
    return this.enemies.filter((e) => e.active && e.alive);
  }

  // ---------------------------------------------------------------------------
  // Clean up
  // ---------------------------------------------------------------------------
  destroy() {
    for (const timer of this.spawnTimers) {
      timer.remove(false);
    }
    this.spawnTimers = [];
    this.enemies = [];
  }
}
