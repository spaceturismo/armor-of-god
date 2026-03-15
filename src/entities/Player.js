// ============================================================================
// Player.js — Player character entity
// ============================================================================

import Phaser from 'phaser';

/**
 * Player represents the guardian controlled by the human player.
 * Extends Phaser.GameObjects.Container so it can hold a sprite + overlays.
 */
export class Player extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} armorClass — class definition from ARMOR_CLASSES
   */
  constructor(scene, x, y, armorClass) {
    super(scene, x, y);
    scene.add.existing(this);

    // --- Store class info ---
    this.className = armorClass.id;
    this.classData = armorClass;
    this.abilityName = armorClass.ability;

    // --- Stats ---
    this.maxHealth = armorClass.stats.health;
    this.health = this.maxHealth;
    this.speed = armorClass.stats.speed;
    this.attackPower = armorClass.stats.attack;
    this.defense = armorClass.stats.defense;
    this.abilityCooldownMax = armorClass.stats.cooldown * 1000; // ms
    this.abilityCooldownTimer = 0; // ms remaining
    this.abilityActive = false;
    this.abilityDuration = 0;

    // --- Score tracking ---
    this.score = 0;

    // --- Visual: colored rectangle body + head ---
    this.sprite = scene.add.image(0, 0, armorClass.textureKey).setScale(1.4);
    this.add(this.sprite);

    // Class color glow ring
    this.glow = scene.add.graphics();
    this.glow.lineStyle(2, armorClass.color, 0.5);
    this.glow.strokeCircle(0, 2, 22);
    this.add(this.glow);

    // --- Physics body ---
    scene.physics.world.enable(this);
    this.body.setSize(28, 36);
    this.body.setOffset(-14, -18);
    this.body.setCollideWorldBounds(true);

    // --- Attack state ---
    this.attackCooldown = 0;
    this.attackRate = 400; // ms between attacks
    this.attackRange = 60;
    this.lastDirection = { x: 0, y: 1 }; // facing direction

    // --- Passive buffs based on class ---
    this._applyPassives();

    // --- Invulnerability flash ---
    this.invulnerable = false;
    this.invulnTimer = 0;
  }

  // ---------------------------------------------------------------------------
  // Movement via WASD keys
  // ---------------------------------------------------------------------------
  move(cursors, delta) {
    const spd = this.speed;
    let vx = 0;
    let vy = 0;

    if (cursors.w.isDown) vy = -spd;
    if (cursors.s.isDown) vy = spd;
    if (cursors.a.isDown) vx = -spd;
    if (cursors.d.isDown) vx = spd;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const factor = 0.7071; // 1/sqrt(2)
      vx *= factor;
      vy *= factor;
    }

    this.body.setVelocity(vx, vy);

    // Track facing direction
    if (vx !== 0 || vy !== 0) {
      this.lastDirection = { x: Math.sign(vx), y: Math.sign(vy) };
    }

    // Update cooldowns
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.abilityCooldownTimer > 0) this.abilityCooldownTimer -= delta;
    if (this.abilityDuration > 0) {
      this.abilityDuration -= delta;
      if (this.abilityDuration <= 0) {
        this.abilityActive = false;
      }
    }

    // Passive: Salvation regeneration (2 HP/s)
    if (this.className === 'salvation' && this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + (2 * delta / 1000));
    }

    // Invulnerability timer
    if (this.invulnTimer > 0) {
      this.invulnTimer -= delta;
      if (this.invulnTimer <= 0) {
        this.invulnerable = false;
        this.sprite.setAlpha(1);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Attack nearest enemy in range
  // ---------------------------------------------------------------------------
  attack(enemies) {
    if (this.attackCooldown > 0) return null;

    let closest = null;
    let closestDist = this.attackRange;

    enemies.forEach((enemy) => {
      if (!enemy.active || !enemy.alive) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist < closestDist) {
        closestDist = dist;
        closest = enemy;
      }
    });

    if (closest) {
      let dmg = this.attackPower;

      // Passive: Sword of the Spirit — 25% bonus damage
      if (this.className === 'spirit') {
        dmg = Math.round(dmg * 1.25);
      }

      closest.takeDamage(dmg);
      this.attackCooldown = this.attackRate;

      // Visual feedback — brief flash
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1.6,
        scaleY: 1.6,
        duration: 80,
        yoyo: true,
      });

      return closest;
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Use class-specific ability
  // ---------------------------------------------------------------------------
  useAbility() {
    if (this.abilityCooldownTimer > 0) return false;

    this.abilityCooldownTimer = this.abilityCooldownMax;
    this.abilityActive = true;

    // Ability effects are handled by CombatSystem — set duration here
    switch (this.className) {
      case 'truth':
        this.abilityDuration = 8000; // Reveal lasts 8s
        break;
      case 'righteousness':
        this.abilityDuration = 6000; // Shield absorb 50 HP
        this.shieldHP = 50;
        break;
      case 'peace':
        this.abilityDuration = 800; // Dash duration
        this._dashForward();
        break;
      case 'faith':
        this.abilityDuration = 5000; // Barrier lasts 5s
        break;
      case 'salvation':
        this.abilityDuration = 6000; // Rally cry 6s
        break;
      case 'spirit':
        this.abilityDuration = 100; // Instant ranged attack
        this._fireWordOfPower();
        break;
    }

    // Visual: glow pulse
    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 1, to: 0.3 },
      duration: 300,
      yoyo: true,
      repeat: 2,
    });

    return true;
  }

  // ---------------------------------------------------------------------------
  // Take damage (with defense calculation)
  // ---------------------------------------------------------------------------
  takeDamage(amount) {
    if (this.invulnerable) return;

    let dmg = amount;

    // Defense reduction
    dmg = Math.max(1, dmg - this.defense * 0.3);

    // Passive: Breastplate of Righteousness — 30% reduced damage
    if (this.className === 'righteousness') {
      dmg = Math.round(dmg * 0.7);
    }

    // Passive: Shield of Faith — 15% deflect chance
    if (this.className === 'faith' && Math.random() < 0.15) {
      // Deflected!
      this._showFloatingText('Deflected!', '#FFD700');
      return;
    }

    // Active: Righteousness shield absorb
    if (this.className === 'righteousness' && this.abilityActive && this.shieldHP > 0) {
      const absorbed = Math.min(dmg, this.shieldHP);
      this.shieldHP -= absorbed;
      dmg -= absorbed;
      if (dmg <= 0) {
        this._showFloatingText('Shielded!', '#AAAAAA');
        return;
      }
    }

    this.health -= dmg;

    // Brief invulnerability
    this.invulnerable = true;
    this.invulnTimer = 300;
    this.sprite.setAlpha(0.5);

    // Damage flash
    this.scene.tweens.add({
      targets: this.sprite,
      tint: 0xff0000,
      duration: 100,
      yoyo: true,
      onComplete: () => { this.sprite.clearTint(); },
    });

    if (this.health <= 0) {
      this.health = 0;
      this.scene.events.emit('playerDeath');
    }
  }

  // ---------------------------------------------------------------------------
  // Heal
  // ---------------------------------------------------------------------------
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this._showFloatingText(`+${amount}`, '#90EE90');
  }

  // ---------------------------------------------------------------------------
  // Helper: floating text feedback
  // ---------------------------------------------------------------------------
  _showFloatingText(text, color) {
    const ft = this.scene.add.text(this.x, this.y - 30, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: ft,
      y: ft.y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => ft.destroy(),
    });
  }

  // ---------------------------------------------------------------------------
  // Peace ability: dash forward
  // ---------------------------------------------------------------------------
  _dashForward() {
    const dashSpeed = 500;
    const dx = this.lastDirection.x || 0;
    const dy = this.lastDirection.y || 1;
    this.body.setVelocity(dx * dashSpeed, dy * dashSpeed);

    // Brief invulnerability during dash
    this.invulnerable = true;
    this.invulnTimer = 800;
  }

  // ---------------------------------------------------------------------------
  // Spirit ability: fire a projectile
  // ---------------------------------------------------------------------------
  _fireWordOfPower() {
    const scene = this.scene;
    const projSpeed = 400;

    const proj = scene.physics.add.image(this.x, this.y, 'projectile_sword');
    proj.setScale(1.5);
    proj.damage = this.attackPower * 3;

    const dx = this.lastDirection.x || 0;
    const dy = this.lastDirection.y || 1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    proj.setVelocity((dx / len) * projSpeed, (dy / len) * projSpeed);

    // Store reference for collision checking
    if (!scene.playerProjectiles) {
      scene.playerProjectiles = scene.physics.add.group();
    }
    scene.playerProjectiles.add(proj);

    // Auto-destroy after 2 seconds
    scene.time.delayedCall(2000, () => {
      if (proj.active) proj.destroy();
    });
  }

  // ---------------------------------------------------------------------------
  // Apply passive stat modifications
  // ---------------------------------------------------------------------------
  _applyPassives() {
    // Peace: 25% movement boost
    if (this.className === 'peace') {
      this.speed = Math.round(this.speed * 1.25);
    }
  }

  // ---------------------------------------------------------------------------
  // Get ability cooldown as a 0-1 fraction (0 = ready, 1 = full cooldown)
  // ---------------------------------------------------------------------------
  getCooldownPercent() {
    if (this.abilityCooldownMax <= 0) return 0;
    return Phaser.Math.Clamp(this.abilityCooldownTimer / this.abilityCooldownMax, 0, 1);
  }
}
