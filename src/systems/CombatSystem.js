// ============================================================================
// CombatSystem.js — Handles all combat interactions
// ============================================================================

import Phaser from 'phaser';

/**
 * CombatSystem — manages damage, abilities, and combat effects.
 */
export class CombatSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  // ---------------------------------------------------------------------------
  // Handle player melee attack on enemies
  // ---------------------------------------------------------------------------
  handlePlayerAttack(player, enemies) {
    if (!player || player.health <= 0) return;

    const target = player.attack(enemies);
    if (target) {
      player.score += 10; // Bonus for landing a hit
    }
  }

  // ---------------------------------------------------------------------------
  // Handle class-specific ability effects
  // ---------------------------------------------------------------------------
  handleAbility(player, enemies, church) {
    if (!player || !player.abilityActive) return;

    switch (player.className) {
      case 'truth':
        this._abilityTruth(player, enemies);
        break;
      case 'righteousness':
        // Passive shield absorb handled in Player.takeDamage
        this._abilityRighteousness(player);
        break;
      case 'peace':
        this._abilityPeace(player, church);
        break;
      case 'faith':
        this._abilityFaith(player, enemies);
        break;
      case 'salvation':
        this._abilitySalvation(player);
        break;
      case 'spirit':
        // Projectile spawned in Player.useAbility -> _fireWordOfPower
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Handle enemy attack on player or church
  // ---------------------------------------------------------------------------
  handleEnemyAttack(enemy, target, isChurch = false) {
    if (!enemy.alive) return;

    const range = isChurch ? 40 : 30;
    if (enemy.tryAttack(target, range)) {
      const dmg = enemy.damage;

      if (isChurch) {
        // Damage the church directly
        this.scene.events.emit('churchDamage', dmg);
      } else {
        // Damage the player
        target.takeDamage(dmg);
      }

      return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Process collisions between player projectiles and enemies
  // ---------------------------------------------------------------------------
  handleProjectileCollisions(projectiles, enemies) {
    if (!projectiles || !projectiles.getChildren) return;

    projectiles.getChildren().forEach((proj) => {
      if (!proj.active) return;

      enemies.forEach((enemy) => {
        if (!enemy.active || !enemy.alive) return;

        const dist = Phaser.Math.Distance.Between(proj.x, proj.y, enemy.x, enemy.y);
        if (dist < 20) {
          enemy.takeDamage(proj.damage || 30);
          proj.destroy();
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Belt of Truth — Reveal all hidden enemies
  // ---------------------------------------------------------------------------
  _abilityTruth(player, enemies) {
    enemies.forEach((enemy) => {
      if (enemy.isHidden && enemy.alive) {
        enemy.reveal();
      }
    });

    // Buff: nearby allies deal more damage (visual indicator)
    if (!player._truthBuffShown) {
      player._truthBuffShown = true;
      this._showAbilityEffect(player, 0xffffff, 'Truth Revealed!');

      // Reset after ability expires
      this.scene.time.delayedCall(8000, () => {
        player._truthBuffShown = false;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Breastplate of Righteousness — Stand Firm shield visual
  // ---------------------------------------------------------------------------
  _abilityRighteousness(player) {
    if (!player._shieldVisual) {
      const gfx = this.scene.add.graphics();
      gfx.lineStyle(3, 0xaaaaaa, 0.6);
      gfx.strokeCircle(0, 0, 30);
      gfx.fillStyle(0xaaaaaa, 0.15);
      gfx.fillCircle(0, 0, 30);
      player._shieldVisual = gfx;
      player.add(gfx);

      this._showAbilityEffect(player, 0xaaaaaa, 'Stand Firm!');

      this.scene.time.delayedCall(6000, () => {
        if (gfx && gfx.active) gfx.destroy();
        player._shieldVisual = null;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Shoes of Peace — Gospel Sprint heals the church if passed near it
  // ---------------------------------------------------------------------------
  _abilityPeace(player, church) {
    if (!church) return;

    const dist = Phaser.Math.Distance.Between(player.x, player.y, church.x, church.y);
    if (dist < 80) {
      this.scene.events.emit('churchHeal', 10);
      this._showAbilityEffect(player, 0x228b22, 'Peace Heals!');
    }
  }

  // ---------------------------------------------------------------------------
  // Shield of Faith — Faith Barrier blocks projectiles in area
  // ---------------------------------------------------------------------------
  _abilityFaith(player, enemies) {
    if (!player._barrierVisual) {
      const gfx = this.scene.add.graphics();
      gfx.lineStyle(3, 0xffd700, 0.7);
      gfx.strokeCircle(0, 0, 60);
      gfx.fillStyle(0xffd700, 0.08);
      gfx.fillCircle(0, 0, 60);
      player._barrierVisual = gfx;
      player.add(gfx);

      this._showAbilityEffect(player, 0xffd700, 'Faith Barrier!');

      // Push back enemies inside the barrier
      enemies.forEach((enemy) => {
        if (!enemy.alive) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
        if (dist < 60) {
          const angle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
          enemy.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
        }
      });

      this.scene.time.delayedCall(5000, () => {
        if (gfx && gfx.active) gfx.destroy();
        player._barrierVisual = null;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Helmet of Salvation — Rally Cry (buff attack power)
  // ---------------------------------------------------------------------------
  _abilitySalvation(player) {
    if (!player._rallyCried) {
      player._rallyCried = true;
      const originalAttack = player.attackPower;
      player.attackPower = Math.round(originalAttack * 1.3);

      this._showAbilityEffect(player, 0x4169e1, 'Rally Cry!');

      this.scene.time.delayedCall(6000, () => {
        player.attackPower = originalAttack;
        player._rallyCried = false;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Show a visual ability effect around the player
  // ---------------------------------------------------------------------------
  _showAbilityEffect(player, color, text) {
    // Expanding ring effect
    const ring = this.scene.add.graphics();
    ring.lineStyle(2, color, 1);
    ring.strokeCircle(player.x, player.y, 10);

    this.scene.tweens.add({
      targets: ring,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 600,
      onComplete: () => ring.destroy(),
    });

    // Text label
    const label = this.scene.add.text(player.x, player.y - 40, text, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: label,
      y: label.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => label.destroy(),
    });
  }

  // ---------------------------------------------------------------------------
  // Calculate damage with defense factored in
  // ---------------------------------------------------------------------------
  static calculateDamage(baseDamage, defense) {
    const reduction = defense * 0.3;
    return Math.max(1, Math.round(baseDamage - reduction));
  }

  // ---------------------------------------------------------------------------
  // Check if two objects are within a given distance
  // ---------------------------------------------------------------------------
  static isInRange(a, b, range) {
    return Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) <= range;
  }
}
