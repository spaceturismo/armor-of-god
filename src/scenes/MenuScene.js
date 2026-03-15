// ============================================================================
// MenuScene.js — Main menu with title, subtitle, buttons, and particles
// ============================================================================

import Phaser from 'phaser';
import {
  createButton,
  createScriptureDisplay,
  ScriptureDB,
  COLORS,
  COLORS_CSS,
  FONT_STYLES,
} from '../../shared/index.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const cx = width / 2;

    // --- Animated background particles (subtle floating lights) ---
    this._createParticles(width, height);

    // --- Title ---
    this.add.text(cx, 100, 'ARMOR OF GOD', {
      fontFamily: 'Georgia, serif',
      fontSize: '64px',
      fontStyle: 'bold',
      color: COLORS_CSS.GOLD,
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5);

    // --- Subtitle ---
    this.add.text(cx, 170, 'Put on the whole armour of God — Ephesians 6:11', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      fontStyle: 'italic',
      color: COLORS_CSS.PARCHMENT,
    }).setOrigin(0.5);

    // --- Decorative line ---
    const line = this.add.graphics();
    line.lineStyle(2, COLORS.GOLD, 0.5);
    line.lineBetween(cx - 200, 200, cx + 200, 200);

    // --- Buttons ---
    createButton(this, cx, 320, 'Begin Battle', () => {
      this.scene.start('CharacterSelectScene');
    }, { fontSize: '28px' });

    createButton(this, cx, 390, 'Scripture Library', () => {
      this._showScriptureLibrary(cx, height);
    }, { fontSize: '22px' });

    createButton(this, cx, 450, 'How to Play', () => {
      this._showHowToPlay(cx, height);
    }, { fontSize: '22px' });

    // --- Bottom verse ---
    const verse = ScriptureDB.getByReference('Ephesians 6:10');
    if (verse) {
      this.add.text(cx, height - 50, `"${verse.text}"`, {
        ...FONT_STYLES.SMALL,
        fontStyle: 'italic',
        color: COLORS_CSS.GRAY,
        wordWrap: { width: 700 },
        align: 'center',
      }).setOrigin(0.5);

      this.add.text(cx, height - 25, `— ${verse.reference}`, {
        ...FONT_STYLES.SMALL,
        color: COLORS_CSS.GOLD,
      }).setOrigin(0.5);
    }
  }

  // ---------------------------------------------------------------------------
  // Floating light particles
  // ---------------------------------------------------------------------------
  _createParticles(width, height) {
    // Create ~30 subtle floating light dots
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.4);

      const dot = this.add.circle(x, y, size, 0xffd700, alpha);
      dot.setDepth(-1);

      // Gentle floating animation
      this.tweens.add({
        targets: dot,
        y: y - Phaser.Math.Between(20, 60),
        alpha: { from: alpha, to: alpha * 0.3 },
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000),
      });

      this.tweens.add({
        targets: dot,
        x: x + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Scripture Library overlay
  // ---------------------------------------------------------------------------
  _showScriptureLibrary(cx, height) {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, 1024, 768);
    overlay.setDepth(10);

    const armorVerses = ScriptureDB.getByCategory('armor');
    const container = this.add.container(0, 0).setDepth(11);

    this.add.text(cx, 40, 'Scripture Library', {
      ...FONT_STYLES.HEADING,
      fontSize: '32px',
    }).setOrigin(0.5).setDepth(11);

    armorVerses.forEach((v, i) => {
      const yPos = 90 + i * 85;
      const ref = this.add.text(cx, yPos, v.reference, {
        ...FONT_STYLES.SCRIPTURE_REF,
        fontSize: '16px',
      }).setOrigin(0.5).setDepth(11);

      const body = this.add.text(cx, yPos + 22, `"${v.text}"`, {
        ...FONT_STYLES.SCRIPTURE,
        fontSize: '15px',
        wordWrap: { width: 700 },
        align: 'center',
      }).setOrigin(0.5, 0).setDepth(11);

      container.add([ref, body]);
    });

    const closeBtn = createButton(this, cx, height - 60, 'Close', () => {
      overlay.destroy();
      container.destroy();
      closeBtn.destroy();
    });
    closeBtn.setDepth(11);
  }

  // ---------------------------------------------------------------------------
  // How to Play overlay
  // ---------------------------------------------------------------------------
  _showHowToPlay(cx, height) {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, 1024, 768);
    overlay.setDepth(10);

    const instructions = [
      'HOW TO PLAY',
      '',
      'You are a guardian called to defend the city from spiritual darkness.',
      '',
      'CONTROLS:',
      '  WASD — Move your character',
      '  SPACE — Use special ability',
      '  Mouse click — Attack nearest enemy',
      '',
      'OBJECTIVE:',
      '  Protect the Church at the center of the city.',
      '  Defeat all 5 waves of enemies to achieve victory.',
      '',
      'TIPS:',
      '  - Each armor class has unique strengths',
      '  - Use your ability wisely — it has a cooldown',
      '  - Stay near the church to intercept enemies',
      '  - Between waves, reposition for the next assault',
    ];

    const textObj = this.add.text(cx, 60, instructions.join('\n'), {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: COLORS_CSS.WHITE,
      lineSpacing: 6,
      align: 'center',
    }).setOrigin(0.5, 0).setDepth(11);

    const closeBtn = createButton(this, cx, height - 60, 'Close', () => {
      overlay.destroy();
      textObj.destroy();
      closeBtn.destroy();
    });
    closeBtn.setDepth(11);
  }
}
