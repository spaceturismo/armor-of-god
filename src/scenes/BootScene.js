// ============================================================================
// BootScene.js — Preload scene: generates all textures programmatically
// ============================================================================

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // --- Loading bar ---
    const { width, height } = this.cameras.main;
    const barW = 400;
    const barH = 30;
    const barX = (width - barW) / 2;
    const barY = height / 2;

    const bgBar = this.add.graphics();
    bgBar.fillStyle(0x222244, 1);
    bgBar.fillRoundedRect(barX, barY, barW, barH, 8);

    const fillBar = this.add.graphics();

    const loadingText = this.add.text(width / 2, barY - 30, 'Forging the Armor...', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#FFD700',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      fillBar.clear();
      fillBar.fillStyle(0xffd700, 1);
      fillBar.fillRoundedRect(barX + 2, barY + 2, (barW - 4) * value, barH - 4, 6);
    });

    this.load.on('complete', () => {
      bgBar.destroy();
      fillBar.destroy();
      loadingText.destroy();
    });

    // We don't load external files — just kick the progress event once
    // by loading a tiny inline data URI so the loading bar shows up briefly
    this.load.image('__boot_dummy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==');
  }

  create() {
    // =========================================================================
    // Generate all textures programmatically — no external assets needed
    // =========================================================================

    this._createPlayerTextures();
    this._createEnemyTextures();
    this._createProjectileTextures();
    this._createBuildingTextures();
    this._createUITextures();
    this._createParticleTexture();

    // Short delay so the loading screen is visible
    this.time.delayedCall(400, () => {
      this.scene.start('MenuScene');
    });
  }

  // ---------------------------------------------------------------------------
  // Player textures — one per armor class
  // ---------------------------------------------------------------------------
  _createPlayerTextures() {
    const classes = [
      { key: 'player_truth',         bodyColor: 0xffffff, headColor: 0xeeeeee },
      { key: 'player_righteousness', bodyColor: 0xaaaaaa, headColor: 0xcccccc },
      { key: 'player_peace',         bodyColor: 0x228b22, headColor: 0x33cc33 },
      { key: 'player_faith',         bodyColor: 0xffd700, headColor: 0xffec8b },
      { key: 'player_salvation',     bodyColor: 0x4169e1, headColor: 0x6495ed },
      { key: 'player_spirit',        bodyColor: 0xdc143c, headColor: 0xff4444 },
    ];

    for (const cls of classes) {
      const gfx = this.make.graphics({ add: false });

      // Body (20x24 rectangle)
      gfx.fillStyle(cls.bodyColor, 1);
      gfx.fillRect(6, 12, 20, 24);

      // Head (12x12 circle-ish rectangle)
      gfx.fillStyle(cls.headColor, 1);
      gfx.fillRect(10, 0, 12, 12);

      // Outline
      gfx.lineStyle(1, 0x000000, 0.5);
      gfx.strokeRect(6, 12, 20, 24);
      gfx.strokeRect(10, 0, 12, 12);

      gfx.generateTexture(cls.key, 32, 36);
      gfx.destroy();
    }
  }

  // ---------------------------------------------------------------------------
  // Enemy textures — one per enemy type
  // ---------------------------------------------------------------------------
  _createEnemyTextures() {
    // Doubt — dark gray circle
    {
      const gfx = this.make.graphics({ add: false });
      gfx.fillStyle(0x555555, 1);
      gfx.fillCircle(12, 12, 12);
      gfx.lineStyle(1, 0x333333, 1);
      gfx.strokeCircle(12, 12, 12);
      // Dark "eye" marks
      gfx.fillStyle(0x222222, 1);
      gfx.fillCircle(8, 10, 2);
      gfx.fillCircle(16, 10, 2);
      gfx.generateTexture('enemy_doubt', 24, 24);
      gfx.destroy();
    }

    // Fear — dark purple triangle
    {
      const gfx = this.make.graphics({ add: false });
      gfx.fillStyle(0x6a0dad, 1);
      gfx.fillTriangle(12, 0, 0, 24, 24, 24);
      gfx.lineStyle(1, 0x440077, 1);
      gfx.strokeTriangle(12, 0, 0, 24, 24, 24);
      gfx.generateTexture('enemy_fear', 24, 24);
      gfx.destroy();
    }

    // Deception — red diamond (semi-transparent created at runtime)
    {
      const gfx = this.make.graphics({ add: false });
      gfx.fillStyle(0xcc2222, 1);
      gfx.fillTriangle(12, 0, 0, 12, 12, 24);
      gfx.fillTriangle(12, 0, 24, 12, 12, 24);
      gfx.lineStyle(1, 0x880000, 1);
      gfx.strokeTriangle(12, 0, 0, 12, 12, 24);
      gfx.strokeTriangle(12, 0, 24, 12, 12, 24);
      gfx.generateTexture('enemy_deception', 24, 24);
      gfx.destroy();
    }

    // Division — orange square
    {
      const gfx = this.make.graphics({ add: false });
      gfx.fillStyle(0xff8800, 1);
      gfx.fillRect(0, 0, 22, 22);
      gfx.lineStyle(2, 0xcc6600, 1);
      gfx.strokeRect(0, 0, 22, 22);
      // Crack line in the middle
      gfx.lineStyle(1, 0x664400, 0.8);
      gfx.lineBetween(11, 0, 11, 22);
      gfx.generateTexture('enemy_division', 22, 22);
      gfx.destroy();
    }
  }

  // ---------------------------------------------------------------------------
  // Projectile textures
  // ---------------------------------------------------------------------------
  _createProjectileTextures() {
    // Player projectile — small bright orb
    {
      const gfx = this.make.graphics({ add: false });
      gfx.fillStyle(0xffd700, 1);
      gfx.fillCircle(4, 4, 4);
      gfx.fillStyle(0xffffff, 0.7);
      gfx.fillCircle(3, 3, 2);
      gfx.generateTexture('projectile_player', 8, 8);
      gfx.destroy();
    }

    // Sword ability projectile — larger, crimson
    {
      const gfx = this.make.graphics({ add: false });
      gfx.fillStyle(0xdc143c, 1);
      gfx.fillCircle(8, 8, 8);
      gfx.fillStyle(0xff6666, 0.6);
      gfx.fillCircle(6, 6, 4);
      gfx.generateTexture('projectile_sword', 16, 16);
      gfx.destroy();
    }

    // Shield ability — golden barrier circle
    {
      const gfx = this.make.graphics({ add: false });
      gfx.lineStyle(3, 0xffd700, 0.8);
      gfx.strokeCircle(32, 32, 30);
      gfx.lineStyle(1, 0xffec8b, 0.4);
      gfx.strokeCircle(32, 32, 26);
      gfx.generateTexture('ability_shield', 64, 64);
      gfx.destroy();
    }
  }

  // ---------------------------------------------------------------------------
  // Building textures for the city/map
  // ---------------------------------------------------------------------------
  _createBuildingTextures() {
    // Church — the main building to protect
    {
      const gfx = this.make.graphics({ add: false });
      // Base
      gfx.fillStyle(0xd4a574, 1);
      gfx.fillRect(8, 20, 48, 40);
      // Roof
      gfx.fillStyle(0x8b4513, 1);
      gfx.fillTriangle(32, 0, 0, 24, 64, 24);
      // Door
      gfx.fillStyle(0x654321, 1);
      gfx.fillRect(24, 38, 16, 22);
      // Cross on top
      gfx.fillStyle(0xffd700, 1);
      gfx.fillRect(30, -8, 4, 14);
      gfx.fillRect(26, -4, 12, 4);
      gfx.generateTexture('building_church', 64, 64);
      gfx.destroy();
    }

    // Generic house
    {
      const gfx = this.make.graphics({ add: false });
      gfx.fillStyle(0xb8956a, 1);
      gfx.fillRect(4, 14, 32, 22);
      gfx.fillStyle(0x7a5c3a, 1);
      gfx.fillTriangle(20, 2, 0, 16, 40, 16);
      gfx.fillStyle(0x554433, 1);
      gfx.fillRect(14, 24, 10, 12);
      gfx.generateTexture('building_house', 40, 36);
      gfx.destroy();
    }

    // Wall segment
    {
      const gfx = this.make.graphics({ add: false });
      gfx.fillStyle(0x888888, 1);
      gfx.fillRect(0, 0, 40, 12);
      gfx.fillStyle(0x999999, 1);
      gfx.fillRect(0, 0, 8, 16);
      gfx.fillRect(32, 0, 8, 16);
      gfx.generateTexture('building_wall', 40, 16);
      gfx.destroy();
    }
  }

  // ---------------------------------------------------------------------------
  // UI textures
  // ---------------------------------------------------------------------------
  _createUITextures() {
    // Cooldown overlay (semi-transparent dark circle)
    {
      const gfx = this.make.graphics({ add: false });
      gfx.fillStyle(0x000000, 0.6);
      gfx.fillCircle(16, 16, 16);
      gfx.generateTexture('ui_cooldown', 32, 32);
      gfx.destroy();
    }

    // Selection highlight
    {
      const gfx = this.make.graphics({ add: false });
      gfx.lineStyle(2, 0xffd700, 1);
      gfx.strokeRect(0, 0, 40, 40);
      gfx.generateTexture('ui_selection', 40, 40);
      gfx.destroy();
    }
  }

  // ---------------------------------------------------------------------------
  // Particle texture
  // ---------------------------------------------------------------------------
  _createParticleTexture() {
    const gfx = this.make.graphics({ add: false });
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(3, 3, 3);
    gfx.generateTexture('particle', 6, 6);
    gfx.destroy();
  }
}
