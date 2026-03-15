// ============================================================================
// BattleScene.js — Main gameplay scene: top-down city defense
// ============================================================================

import Phaser from 'phaser';
import {
  createHealthBar,
  createButton,
  ScriptureDB,
  COLORS,
  COLORS_CSS,
  FONT_STYLES,
} from '../../shared/index.js';
import { Player } from '../entities/Player.js';
import { WaveManager } from '../systems/WaveManager.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { TouchControls } from '../systems/TouchControls.js';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    this.armorClass = data.armorClass;
  }

  create() {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // --- Build the city map ---
    this._createCityMap(width, height, cx, cy);

    // --- Church (the thing to protect) ---
    this.church = this.add.container(cx, cy);
    const churchSprite = this.add.image(0, 0, 'building_church').setScale(1.5);
    this.church.add(churchSprite);
    this.physics.world.enable(this.church);
    this.church.body.setSize(64, 64);
    this.church.body.setOffset(-32, -32);
    this.church.body.setImmovable(true);

    this.churchMaxHP = 200;
    this.churchHP = this.churchMaxHP;

    // --- Player ---
    this.player = new Player(this, cx, cy + 80, this.armorClass);

    // --- Groups ---
    this.enemyGroup = this.physics.add.group();
    this.playerProjectiles = this.physics.add.group();

    // --- Systems ---
    this.waveManager = new WaveManager(this);
    this.combatSystem = new CombatSystem(this);

    // --- Input ---
    this.cursors = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    // --- Touch Controls ---
    this.touchControls = new TouchControls(this);
    this.hasTouchInput = this.sys.game.device.input.touch;

    // Mouse click to attack (only for non-touch or when not hitting touch UI)
    this.input.on('pointerdown', (pointer) => {
      // On touch devices, the TouchControls handles its own pointer events;
      // only trigger mouse-click attack on desktop (non-touch) devices
      if (!this.hasTouchInput) {
        this.combatSystem.handlePlayerAttack(this.player, this.waveManager.getActiveEnemies());
      }
    });

    // Space to use ability
    this.input.keyboard.on('keydown-SPACE', () => {
      this.player.useAbility();
    });

    // --- HUD ---
    this._createHUD(width, height);

    // --- Event listeners ---
    this.events.on('waveStart', (waveNum) => {
      this._showWaveBanner(waveNum);
    });

    this.events.on('waveComplete', (waveNum) => {
      this._onWaveComplete(waveNum);
    });

    this.events.on('allWavesComplete', () => {
      this._onVictory();
    });

    this.events.on('churchDamage', (dmg) => {
      this.churchHP = Math.max(0, this.churchHP - dmg);
      this.churchHPBar.setPercent(this.churchHP / this.churchMaxHP);
      this._flashChurch();
      if (this.churchHP <= 0) {
        this._onDefeat();
      }
    });

    this.events.on('churchHeal', (amount) => {
      this.churchHP = Math.min(this.churchMaxHP, this.churchHP + amount);
      this.churchHPBar.setPercent(this.churchHP / this.churchMaxHP);
    });

    this.events.on('playerDeath', () => {
      this._onDefeat();
    });

    this.events.on('enemyKilled', (enemy) => {
      this.player.score += enemy.points;
      this._updateHUD();
    });

    // --- Game state ---
    this.gameOver = false;
    this.betweenWaves = true;
    this.currentWaveNum = 0;

    // --- Start first wave after brief delay ---
    this._showWaveIntro(1);
  }

  // ---------------------------------------------------------------------------
  // Main update loop
  // ---------------------------------------------------------------------------
  update(time, delta) {
    if (this.gameOver) return;

    // Touch controls: apply touch movement if active, otherwise use keyboard
    if (this.hasTouchInput && this.touchControls) {
      const touch = this.touchControls.getMovement();
      if (touch.vx !== 0 || touch.vy !== 0) {
        // Apply touch movement directly to player velocity
        const spd = this.player.speed;
        this.player.body.setVelocity(touch.vx * spd, touch.vy * spd);
        // Track facing direction
        if (touch.vx !== 0 || touch.vy !== 0) {
          this.player.lastDirection = { x: Math.sign(touch.vx), y: Math.sign(touch.vy) };
        }
        // Still need to update cooldowns — call move with no keys pressed
        // We pass a dummy cursors object with all keys up
        const dummyCursors = {
          w: { isDown: false }, a: { isDown: false },
          s: { isDown: false }, d: { isDown: false },
          space: { isDown: false },
        };
        this.player.move(dummyCursors, delta);
        // Re-apply touch velocity (move() would have set 0,0 from dummy cursors)
        this.player.body.setVelocity(touch.vx * spd, touch.vy * spd);
      } else {
        // No touch movement — fall through to keyboard
        this.player.move(this.cursors, delta);
      }

      // Touch attack button
      if (this.touchControls.isAttackPressed()) {
        this.combatSystem.handlePlayerAttack(this.player, this.waveManager.getActiveEnemies());
      }

      // Touch ability button
      if (this.touchControls.isAbilityPressed()) {
        this.player.useAbility();
      }

      // Update ability cooldown visual on touch button
      this.touchControls.updateCooldown(this.player.getCooldownPercent());
    } else {
      // Desktop: keyboard only
      this.player.move(this.cursors, delta);
    }

    // Enemy updates
    const activeEnemies = this.waveManager.getActiveEnemies();
    activeEnemies.forEach((enemy) => {
      enemy.update(delta, this.church, this.player);

      // Enemy attacks on player
      this.combatSystem.handleEnemyAttack(enemy, this.player, false);

      // Enemy attacks on church
      this.combatSystem.handleEnemyAttack(enemy, this.church, true);
    });

    // Ability effects
    this.combatSystem.handleAbility(this.player, activeEnemies, this.church);

    // Projectile collisions
    this.combatSystem.handleProjectileCollisions(this.playerProjectiles, activeEnemies);

    // Wave manager
    this.waveManager.update();

    // Update HUD
    this._updateHUD();
  }

  // ---------------------------------------------------------------------------
  // Create the city map background
  // ---------------------------------------------------------------------------
  _createCityMap(width, height, cx, cy) {
    // Ground (slightly lighter than background)
    const ground = this.add.graphics();
    ground.fillStyle(0x1a1a3e, 1);
    ground.fillRect(0, 0, width, height);

    // Paths (lighter ground leading to church)
    const paths = this.add.graphics();
    paths.fillStyle(0x252550, 1);
    // Horizontal path
    paths.fillRect(0, cy - 15, width, 30);
    // Vertical path
    paths.fillRect(cx - 15, 0, 30, height);

    // Buildings around the edges
    const buildingPositions = [
      { x: 120, y: 120 }, { x: 300, y: 100 }, { x: 700, y: 110 }, { x: 880, y: 130 },
      { x: 100, y: 350 }, { x: 900, y: 370 },
      { x: 130, y: 600 }, { x: 320, y: 640 }, { x: 720, y: 620 }, { x: 870, y: 650 },
    ];

    buildingPositions.forEach((pos) => {
      this.add.image(pos.x, pos.y, 'building_house')
        .setScale(Phaser.Math.FloatBetween(1, 1.5))
        .setAlpha(0.6);
    });

    // Decorative wall segments
    for (let i = 0; i < 5; i++) {
      this.add.image(50 + i * 60, 50, 'building_wall').setAlpha(0.4);
      this.add.image(50 + i * 60, height - 50, 'building_wall').setAlpha(0.4);
    }
    for (let i = 0; i < 5; i++) {
      this.add.image(width - 50 - i * 60, 50, 'building_wall').setAlpha(0.4);
      this.add.image(width - 50 - i * 60, height - 50, 'building_wall').setAlpha(0.4);
    }
  }

  // ---------------------------------------------------------------------------
  // Create the HUD (health bars, score, wave info, cooldown)
  // ---------------------------------------------------------------------------
  _createHUD(width, height) {
    const hudDepth = 100;

    // --- Church health bar (top center) ---
    const churchPanel = this.add.graphics().setDepth(hudDepth);
    churchPanel.fillStyle(0x000000, 0.5);
    churchPanel.fillRoundedRect(width / 2 - 120, 6, 240, 34, 8);

    this.add.text(width / 2, 12, 'Church', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: COLORS_CSS.GOLD,
    }).setOrigin(0.5, 0).setDepth(hudDepth);

    this.churchHPBar = createHealthBar(this, width / 2 - 100, 26, 200, 10, COLORS.GREEN);
    this.churchHPBar.bg.setDepth(hudDepth);
    this.churchHPBar.fill.setDepth(hudDepth);

    // --- Player health bar (bottom left) ---
    const playerPanel = this.add.graphics().setDepth(hudDepth);
    playerPanel.fillStyle(0x000000, 0.5);
    playerPanel.fillRoundedRect(10, height - 60, 220, 50, 8);

    this.add.text(20, height - 55, this.armorClass.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: this.armorClass.colorCSS,
    }).setDepth(hudDepth);

    this.playerHPBar = createHealthBar(this, 20, height - 36, 160, 10, COLORS.GREEN);
    this.playerHPBar.bg.setDepth(hudDepth);
    this.playerHPBar.fill.setDepth(hudDepth);

    this.playerHPText = this.add.text(190, height - 39, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: COLORS_CSS.WHITE,
    }).setDepth(hudDepth);

    // --- Ability cooldown indicator (bottom left, under health) ---
    this.cooldownText = this.add.text(20, height - 20, 'ABILITY: READY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: COLORS_CSS.GREEN_LIGHT,
    }).setDepth(hudDepth);

    // --- Score (top right) ---
    const scorePanel = this.add.graphics().setDepth(hudDepth);
    scorePanel.fillStyle(0x000000, 0.5);
    scorePanel.fillRoundedRect(width - 160, 6, 150, 30, 8);

    this.scoreText = this.add.text(width - 85, 14, 'Score: 0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: COLORS_CSS.GOLD,
    }).setOrigin(0.5, 0).setDepth(hudDepth);

    // --- Wave info (top left) ---
    const wavePanel = this.add.graphics().setDepth(hudDepth);
    wavePanel.fillStyle(0x000000, 0.5);
    wavePanel.fillRoundedRect(10, 6, 200, 30, 8);

    this.waveText = this.add.text(110, 14, 'Wave 1 / 5', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: COLORS_CSS.WHITE,
    }).setOrigin(0.5, 0).setDepth(hudDepth);

    // --- Enemies remaining ---
    this.enemiesText = this.add.text(110, 44, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: COLORS_CSS.GRAY_LIGHT,
    }).setOrigin(0.5, 0).setDepth(hudDepth);
  }

  // ---------------------------------------------------------------------------
  // Update HUD values
  // ---------------------------------------------------------------------------
  _updateHUD() {
    // Player health
    const pPct = this.player.health / this.player.maxHealth;
    this.playerHPBar.setPercent(pPct);
    this.playerHPText.setText(`${Math.ceil(this.player.health)}/${this.player.maxHealth}`);

    // Cooldown
    const cdPct = this.player.getCooldownPercent();
    if (cdPct <= 0) {
      this.cooldownText.setText('ABILITY: READY [SPACE]');
      this.cooldownText.setColor(COLORS_CSS.GREEN_LIGHT);
    } else {
      const secs = (this.player.abilityCooldownTimer / 1000).toFixed(1);
      this.cooldownText.setText(`ABILITY: ${secs}s`);
      this.cooldownText.setColor(COLORS_CSS.GRAY);
    }

    // Score
    this.scoreText.setText(`Score: ${this.player.score}`);

    // Wave info
    this.waveText.setText(`Wave ${this.currentWaveNum} / ${this.waveManager.totalWaves}`);
    const remaining = this.waveManager.enemiesRemaining;
    this.enemiesText.setText(remaining > 0 ? `Enemies: ${remaining}` : '');
  }

  // ---------------------------------------------------------------------------
  // Show wave intro with scripture
  // ---------------------------------------------------------------------------
  _showWaveIntro(waveNum) {
    this.currentWaveNum = waveNum;
    this.betweenWaves = true;

    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // Overlay
    const overlay = this.add.graphics().setDepth(200);
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, width, height);

    // Wave title
    const title = this.add.text(cx, cy - 80, `Wave ${waveNum}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: COLORS_CSS.GOLD,
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(201);

    // Scripture between waves
    const verse = ScriptureDB.getByCategory('armor')[waveNum - 1] || ScriptureDB.getRandom();
    const verseText = this.add.text(cx, cy, `"${verse.text}"`, {
      ...FONT_STYLES.SCRIPTURE,
      fontSize: '17px',
      wordWrap: { width: 600 },
      align: 'center',
    }).setOrigin(0.5).setDepth(201);

    const refText = this.add.text(cx, cy + 60, `— ${verse.reference}`, {
      ...FONT_STYLES.SCRIPTURE_REF,
    }).setOrigin(0.5).setDepth(201);

    const hint = this.add.text(cx, cy + 110, 'Prepare yourself...', {
      ...FONT_STYLES.SMALL,
      color: COLORS_CSS.GRAY_LIGHT,
    }).setOrigin(0.5).setDepth(201);

    // Auto-start wave after 3 seconds
    this.time.delayedCall(3000, () => {
      overlay.destroy();
      title.destroy();
      verseText.destroy();
      refText.destroy();
      hint.destroy();
      this.betweenWaves = false;
      this.waveManager.startWave(waveNum);
    });
  }

  // ---------------------------------------------------------------------------
  // Show wave banner when wave starts
  // ---------------------------------------------------------------------------
  _showWaveBanner(waveNum) {
    const { width } = this.cameras.main;
    const banner = this.add.text(width / 2, 80, `— WAVE ${waveNum} —`, {
      fontFamily: 'Georgia, serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: COLORS_CSS.GOLD,
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(150).setAlpha(0);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1200,
      onComplete: () => banner.destroy(),
    });
  }

  // ---------------------------------------------------------------------------
  // Wave complete — brief intermission
  // ---------------------------------------------------------------------------
  _onWaveComplete(waveNum) {
    if (waveNum >= this.waveManager.totalWaves) return; // Victory handles this

    // Brief break then start next wave
    this.time.delayedCall(2000, () => {
      this._showWaveIntro(waveNum + 1);
    });
  }

  // ---------------------------------------------------------------------------
  // Victory
  // ---------------------------------------------------------------------------
  _onVictory() {
    if (this.gameOver) return;
    this.gameOver = true;

    this.time.delayedCall(1000, () => {
      this.scene.start('VictoryScene', {
        score: this.player.score,
        armorClass: this.armorClass,
        churchHP: this.churchHP,
        churchMaxHP: this.churchMaxHP,
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Defeat
  // ---------------------------------------------------------------------------
  _onDefeat() {
    if (this.gameOver) return;
    this.gameOver = true;

    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // Freeze enemies
    this.waveManager.getActiveEnemies().forEach((e) => {
      if (e.body) e.body.setVelocity(0, 0);
    });
    this.player.body.setVelocity(0, 0);

    // Defeat overlay
    const overlay = this.add.graphics().setDepth(200);
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    this.add.text(cx, cy - 60, 'Defeated', {
      fontFamily: 'Georgia, serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: COLORS_CSS.RED,
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(201);

    this.add.text(cx, cy, `Score: ${this.player.score}`, {
      ...FONT_STYLES.BODY,
      fontSize: '24px',
    }).setOrigin(0.5).setDepth(201);

    this.add.text(cx, cy + 40, '"Be strong in the Lord, and in the power of his might."', {
      ...FONT_STYLES.SCRIPTURE,
      fontSize: '16px',
      wordWrap: { width: 500 },
      align: 'center',
    }).setOrigin(0.5).setDepth(201);

    createButton(this, cx, cy + 110, 'Try Again', () => {
      this.scene.restart({ armorClass: this.armorClass });
    }).setDepth(201);

    createButton(this, cx, cy + 160, 'Main Menu', () => {
      this.scene.start('MenuScene');
    }).setDepth(201);
  }

  // ---------------------------------------------------------------------------
  // Flash church when damaged
  // ---------------------------------------------------------------------------
  _flashChurch() {
    if (!this.church || !this.church.active) return;
    const children = this.church.getAll();
    if (children.length > 0) {
      this.tweens.add({
        targets: children[0],
        tint: 0xff0000,
        duration: 100,
        yoyo: true,
        onComplete: () => { children[0].clearTint(); },
      });
    }
  }
}
