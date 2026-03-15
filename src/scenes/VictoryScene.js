// ============================================================================
// VictoryScene.js — Displayed after completing all 5 waves
// ============================================================================

import Phaser from 'phaser';
import {
  createButton,
  createPanel,
  COLORS,
  COLORS_CSS,
  FONT_STYLES,
} from '../../shared/index.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.armorClass = data.armorClass || {};
    this.churchHP = data.churchHP || 0;
    this.churchMaxHP = data.churchMaxHP || 200;
  }

  create() {
    const { width, height } = this.cameras.main;
    const cx = width / 2;

    // --- Celebratory particle burst ---
    this._createCelebration(width, height);

    // --- Victory panel ---
    createPanel(this, cx - 250, 80, 500, 580, COLORS.DARK, 0.9);

    // --- Title ---
    this.add.text(cx, 120, 'Victory in Christ!', {
      fontFamily: 'Georgia, serif',
      fontSize: '42px',
      fontStyle: 'bold',
      color: COLORS_CSS.GOLD,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // --- Decorative line ---
    const line = this.add.graphics();
    line.lineStyle(2, COLORS.GOLD, 0.5);
    line.lineBetween(cx - 150, 155, cx + 150, 155);

    // --- Score ---
    this.add.text(cx, 185, `Final Score: ${this.finalScore}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: COLORS_CSS.WHITE,
    }).setOrigin(0.5);

    // --- Stats ---
    const statsY = 230;
    this.add.text(cx, statsY, `Class: ${this.armorClass.name || 'Unknown'}`, {
      ...FONT_STYLES.BODY,
      fontSize: '18px',
      color: this.armorClass.colorCSS || COLORS_CSS.WHITE,
    }).setOrigin(0.5);

    const churchPct = Math.round((this.churchHP / this.churchMaxHP) * 100);
    this.add.text(cx, statsY + 30, `Church Integrity: ${churchPct}%`, {
      ...FONT_STYLES.BODY,
      fontSize: '18px',
    }).setOrigin(0.5);

    // Rating based on church HP
    let rating = 'Bronze Guardian';
    if (churchPct >= 90) rating = 'Gold Guardian';
    else if (churchPct >= 70) rating = 'Silver Guardian';

    this.add.text(cx, statsY + 60, `Rating: ${rating}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: COLORS_CSS.GOLD,
    }).setOrigin(0.5);

    // --- Scripture ---
    const scriptureY = statsY + 120;
    const line2 = this.add.graphics();
    line2.lineStyle(1, COLORS.GOLD, 0.3);
    line2.lineBetween(cx - 180, scriptureY - 10, cx + 180, scriptureY - 10);

    this.add.text(cx, scriptureY, '"But thanks be to God! He gives us the\nvictory through our Lord Jesus Christ."', {
      ...FONT_STYLES.SCRIPTURE,
      fontSize: '18px',
      wordWrap: { width: 400 },
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5, 0);

    this.add.text(cx, scriptureY + 70, '— 1 Corinthians 15:57', {
      ...FONT_STYLES.SCRIPTURE_REF,
    }).setOrigin(0.5);

    // --- Buttons ---
    createButton(this, cx, 540, 'Play Again', () => {
      this.scene.start('CharacterSelectScene');
    }, { fontSize: '24px' });

    createButton(this, cx, 590, 'Main Menu', () => {
      this.scene.start('MenuScene');
    }, { fontSize: '20px' });
  }

  // ---------------------------------------------------------------------------
  // Celebratory particle effects
  // ---------------------------------------------------------------------------
  _createCelebration(width, height) {
    // Spawn golden dots that float upward
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(1.5, 4);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.7);

      const dot = this.add.circle(x, y, size, 0xffd700, alpha);
      dot.setDepth(-1);

      this.tweens.add({
        targets: dot,
        y: -20,
        alpha: 0,
        duration: Phaser.Math.Between(2000, 5000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        onRepeat: () => {
          dot.x = Phaser.Math.Between(0, width);
          dot.y = height + 10;
          dot.alpha = alpha;
        },
      });
    }
  }
}
