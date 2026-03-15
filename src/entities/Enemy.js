// ============================================================================
// Enemy.js — Enemy base class for all darkness enemy types
// ============================================================================

import Phaser from 'phaser';

/**
 * Enemy types and their configurations.
 */
export const ENEMY_TYPES = {
  doubt: {
    name: 'Doubt',
    texture: 'enemy_doubt',
    health: 40,
    speed: 50,
    damage: 8,
    points: 100,
    color: 0x555555,
    attackRate: 1500,
  },
  fear: {
    name: 'Fear',
    texture: 'enemy_fear',
    health: 20,
    speed: 100,
    damage: 5,
    points: 75,
    color: 0x6a0dad,
    attackRate: 1000,
  },
  deception: {
    name: 'Deception',
    texture: 'enemy_deception',
    health: 35,
    speed: 60,
    damage: 10,
    points: 150,
    color: 0xcc2222,
    attackRate: 1200,
    invisible: true,
    revealRange: 120,
  },
  division: {
    name: 'Division',
    texture: 'enemy_division',
    health: 30,
    speed: 55,
    damage: 6,
    points: 120,
    color: 0xff8800,
    attackRate: 1400,
    splits: true,
  },
};

/**
 * Enemy — a darkness entity that attacks the church or players.
 */
export class Enemy extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} type — key from ENEMY_TYPES
   * @param {Object} [overrides] — stat overrides (for split enemies)
   */
  constructor(scene, x, y, type, overrides = {}) {
    super(scene, x, y);
    scene.add.existing(this);

    const config = ENEMY_TYPES[type];
    if (!config) {
      throw new Error(`Unknown enemy type: ${type}`);
    }

    this.enemyType = type;
    this.typeName = config.name;
    this.alive = true;

    // --- Stats ---
    this.maxHealth = overrides.health || config.health;
    this.health = this.maxHealth;
    this.speed = overrides.speed || config.speed;
    this.damage = overrides.damage || config.damage;
    this.points = overrides.points || config.points;
    this.attackRate = config.attackRate;
    this.attackTimer = 0;
    this.canSplit = config.splits || false;
    this.isHidden = config.invisible || false;
    this.isSplitChild = overrides.isSplitChild || false;

    // --- Visual ---
    this.sprite = scene.add.image(0, 0, config.texture).setScale(1.2);
    this.add(this.sprite);

    // Deception: semi-transparent until revealed
    if (this.isHidden) {
      this.sprite.setAlpha(0.15);
    }

    // Health bar above enemy
    this.hpBarBg = scene.add.graphics();
    this.hpBarBg.fillStyle(0x333333, 0.8);
    this.hpBarBg.fillRect(-12, -20, 24, 4);
    this.add(this.hpBarBg);

    this.hpBarFill = scene.add.graphics();
    this._updateHPBar();
    this.add(this.hpBarFill);

    // --- Physics ---
    scene.physics.world.enable(this);
    this.body.setSize(24, 24);
    this.body.setOffset(-12, -12);

    // --- Target ---
    this.target = null; // Will be set to church or player
    this.aggroRange = 100; // Range at which enemy targets the player instead
    this.isAggroed = false;
  }

  // ---------------------------------------------------------------------------
  // Update — called each frame
  // ---------------------------------------------------------------------------
  update(delta, church, player) {
    if (!this.alive || !this.active) return;

    this.attackTimer -= delta;

    // Determine target: aggro on player if close, else head for church
    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (distToPlayer < this.aggroRange) {
      this.target = player;
      this.isAggroed = true;
    } else if (!this.isAggroed || distToPlayer > this.aggroRange * 2) {
      this.target = church;
      this.isAggroed = false;
    }

    // Move toward target
    if (this.target) {
      const tx = this.target.x;
      const ty = this.target.y;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, tx, ty);
      this.body.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
    }

    // Deception: reveal when close to player
    if (this.isHidden && !this._revealed) {
      if (distToPlayer < (ENEMY_TYPES.deception.revealRange)) {
        this.reveal();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Take damage
  // ---------------------------------------------------------------------------
  takeDamage(amount) {
    if (!this.alive) return;

    this.health -= amount;
    this._updateHPBar();

    // Damage flash
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 60,
      yoyo: true,
      onComplete: () => {
        if (this.isHidden && !this._revealed) {
          this.sprite.setAlpha(0.15);
        }
      },
    });

    if (this.health <= 0) {
      this.health = 0;
      this.onDestroy();
    }
  }

  // ---------------------------------------------------------------------------
  // Attempt attack on target (returns true if attack happened)
  // ---------------------------------------------------------------------------
  tryAttack(target, range = 30) {
    if (!this.alive || this.attackTimer > 0) return false;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    if (dist <= range) {
      this.attackTimer = this.attackRate;
      return true; // CombatSystem handles the actual damage
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Reveal (for Deception enemies)
  // ---------------------------------------------------------------------------
  reveal() {
    this._revealed = true;
    this.isHidden = false;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 1,
      duration: 300,
    });
  }

  // ---------------------------------------------------------------------------
  // Called when health reaches 0
  // ---------------------------------------------------------------------------
  onDestroy() {
    this.alive = false;
    this.body.setVelocity(0, 0);

    // Death animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 300,
      onComplete: () => {
        this.destroy();
      },
    });

    // Emit event for scoring and wave tracking
    this.scene.events.emit('enemyKilled', this);
  }

  // ---------------------------------------------------------------------------
  // Update the HP bar visual
  // ---------------------------------------------------------------------------
  _updateHPBar() {
    this.hpBarFill.clear();
    const pct = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
    if (pct > 0) {
      const color = pct > 0.5 ? 0x00cc00 : pct > 0.25 ? 0xcccc00 : 0xcc0000;
      this.hpBarFill.fillStyle(color, 1);
      this.hpBarFill.fillRect(-12, -20, 24 * pct, 4);
    }
  }
}
