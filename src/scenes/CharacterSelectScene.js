// ============================================================================
// CharacterSelectScene.js — Character/class selection screen
// ============================================================================

import Phaser from 'phaser';
import {
  createButton,
  createPanel,
  ScriptureDB,
  COLORS,
  COLORS_CSS,
  FONT_STYLES,
} from '../../shared/index.js';

// ---------------------------------------------------------------------------
// Armor class definitions
// ---------------------------------------------------------------------------
const ARMOR_CLASSES = [
  {
    id: 'truth',
    name: 'Belt of Truth',
    role: 'Support',
    color: 0xffffff,
    colorCSS: '#FFFFFF',
    textureKey: 'player_truth',
    description: 'Reveals hidden enemies and empowers nearby allies.',
    ability: 'Reveal — Exposes all hidden enemies for 8 seconds.',
    passive: 'Nearby allies deal 20% more damage.',
    verse: 'Ephesians 6:14',
    stats: { health: 80, speed: 110, attack: 12, defense: 8, cooldown: 10 },
  },
  {
    id: 'righteousness',
    name: 'Breastplate of Righteousness',
    role: 'Tank',
    color: 0xaaaaaa,
    colorCSS: '#AAAAAA',
    textureKey: 'player_righteousness',
    description: 'An unyielding defender who absorbs tremendous damage.',
    ability: 'Stand Firm — Creates a damage-absorbing shield (50 HP).',
    passive: 'Takes 30% reduced damage from all sources.',
    verse: 'Ephesians 6:14',
    stats: { health: 150, speed: 80, attack: 10, defense: 18, cooldown: 12 },
  },
  {
    id: 'peace',
    name: 'Shoes of Peace',
    role: 'Speed / Healer',
    color: 0x228b22,
    colorCSS: '#228B22',
    textureKey: 'player_peace',
    description: 'Swift healer who mends allies while dashing through battle.',
    ability: 'Gospel Sprint — Dash forward, healing allies passed through.',
    passive: 'Movement speed increased by 25%.',
    verse: 'Ephesians 6:15',
    stats: { health: 90, speed: 150, attack: 8, defense: 6, cooldown: 8 },
  },
  {
    id: 'faith',
    name: 'Shield of Faith',
    role: 'Defender',
    color: 0xffd700,
    colorCSS: '#FFD700',
    textureKey: 'player_faith',
    description: 'Projects barriers that block enemy projectiles and attacks.',
    ability: 'Faith Barrier — Blocks all projectiles in a wide area for 5s.',
    passive: 'Deflects 15% of incoming attacks automatically.',
    verse: 'Ephesians 6:16',
    stats: { health: 120, speed: 90, attack: 10, defense: 15, cooldown: 14 },
  },
  {
    id: 'salvation',
    name: 'Helmet of Salvation',
    role: 'Commander',
    color: 0x4169e1,
    colorCSS: '#4169E1',
    textureKey: 'player_salvation',
    description: 'Inspires allies with rallying cries and steady regeneration.',
    ability: 'Rally Cry — All allies gain 30% attack boost for 6 seconds.',
    passive: 'Slowly regenerates health over time (2 HP/s).',
    verse: 'Ephesians 6:17',
    stats: { health: 110, speed: 100, attack: 12, defense: 10, cooldown: 15 },
  },
  {
    id: 'spirit',
    name: 'Sword of the Spirit',
    role: 'DPS',
    color: 0xdc143c,
    colorCSS: '#DC143C',
    textureKey: 'player_spirit',
    description: 'Devastating attacker wielding the Word of God as a weapon.',
    ability: 'Word of Power — Fires a powerful ranged scripture blast.',
    passive: 'Attacks deal 25% bonus damage.',
    verse: 'Ephesians 6:17',
    stats: { health: 85, speed: 100, attack: 22, defense: 5, cooldown: 6 },
  },
];

export { ARMOR_CLASSES };

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectScene' });
    this.selectedIndex = -1;
  }

  create() {
    const { width, height } = this.cameras.main;
    const cx = width / 2;

    this.selectedIndex = -1;

    // --- Title ---
    this.add.text(cx, 30, 'Choose Your Armor', {
      ...FONT_STYLES.HEADING,
      fontSize: '34px',
    }).setOrigin(0.5);

    this.add.text(cx, 65, 'Each piece of the Armor of God grants unique abilities', {
      ...FONT_STYLES.SMALL,
      color: COLORS_CSS.GRAY_LIGHT,
    }).setOrigin(0.5);

    // --- Class cards (3 columns, 2 rows) ---
    this.cards = [];
    this.cardBorders = [];

    const cardW = 290;
    const cardH = 230;
    const startX = 52;
    const startY = 95;
    const gapX = 18;
    const gapY = 14;

    ARMOR_CLASSES.forEach((cls, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);

      // Card background
      const panel = createPanel(this, x, y, cardW, cardH, COLORS.DARK, 0.9);

      // Border highlight (hidden until selected)
      const border = this.add.graphics();
      border.lineStyle(3, cls.color, 1);
      border.strokeRoundedRect(x, y, cardW, cardH, 16);
      border.setAlpha(0);
      this.cardBorders.push(border);

      // Class icon (sprite preview)
      const icon = this.add.image(x + 30, y + 40, cls.textureKey).setScale(1.8);

      // Class name
      this.add.text(x + 55, y + 16, cls.name, {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: cls.colorCSS,
      });

      // Role tag
      this.add.text(x + 55, y + 38, cls.role, {
        ...FONT_STYLES.SMALL,
        color: COLORS_CSS.GOLD,
        fontSize: '13px',
      });

      // Description
      this.add.text(x + 12, y + 60, cls.description, {
        ...FONT_STYLES.SMALL,
        wordWrap: { width: cardW - 24 },
        fontSize: '13px',
        color: COLORS_CSS.WHITE,
      });

      // Ability
      this.add.text(x + 12, y + 100, cls.ability, {
        ...FONT_STYLES.SMALL,
        wordWrap: { width: cardW - 24 },
        fontSize: '12px',
        color: COLORS_CSS.GREEN_LIGHT,
      });

      // Passive
      this.add.text(x + 12, y + 130, `Passive: ${cls.passive}`, {
        ...FONT_STYLES.SMALL,
        wordWrap: { width: cardW - 24 },
        fontSize: '12px',
        color: COLORS_CSS.SKY_BLUE,
      });

      // Stats bar
      const statY = y + 160;
      this._drawStatBar(x + 12, statY, 'HP', cls.stats.health, 150, cardW - 24);
      this._drawStatBar(x + 12, statY + 16, 'SPD', cls.stats.speed, 150, cardW - 24);
      this._drawStatBar(x + 12, statY + 32, 'ATK', cls.stats.attack, 25, cardW - 24);
      this._drawStatBar(x + 12, statY + 48, 'DEF', cls.stats.defense, 20, cardW - 24);

      // Make the card clickable
      const hitZone = this.add.zone(x + cardW / 2, y + cardH / 2, cardW, cardH)
        .setInteractive({ useHandCursor: true });

      hitZone.on('pointerdown', () => {
        this._selectClass(i);
      });

      this.cards.push({ panel, hitZone, border });
    });

    // --- Scripture display area ---
    this.verseText = this.add.text(cx, height - 95, '', {
      ...FONT_STYLES.SCRIPTURE,
      fontSize: '15px',
      wordWrap: { width: 700 },
      align: 'center',
    }).setOrigin(0.5);

    this.verseRef = this.add.text(cx, height - 60, '', {
      ...FONT_STYLES.SCRIPTURE_REF,
      fontSize: '14px',
    }).setOrigin(0.5);

    // --- Confirm button (hidden until selection) ---
    this.confirmBtn = createButton(this, cx, height - 28, 'Enter Battle', () => {
      if (this.selectedIndex >= 0) {
        this.scene.start('BattleScene', {
          armorClass: ARMOR_CLASSES[this.selectedIndex],
        });
      }
    }, { fontSize: '24px' });
    this.confirmBtn.setAlpha(0);

    // --- Back button ---
    createButton(this, 60, height - 28, 'Back', () => {
      this.scene.start('MenuScene');
    }, { fontSize: '16px' });
  }

  // ---------------------------------------------------------------------------
  // Select a class card
  // ---------------------------------------------------------------------------
  _selectClass(index) {
    this.selectedIndex = index;
    const cls = ARMOR_CLASSES[index];

    // Update borders — show only selected
    this.cardBorders.forEach((b, i) => {
      b.setAlpha(i === index ? 1 : 0);
    });

    // Show scripture verse
    const verse = ScriptureDB.getByReference(cls.verse);
    if (verse) {
      this.verseText.setText(`"${verse.text}"`);
      this.verseRef.setText(`— ${verse.reference}`);
    }

    // Show confirm button
    this.tweens.add({
      targets: this.confirmBtn,
      alpha: 1,
      duration: 200,
    });
  }

  // ---------------------------------------------------------------------------
  // Draw a small stat bar
  // ---------------------------------------------------------------------------
  _drawStatBar(x, y, label, value, maxValue, totalWidth) {
    const labelWidth = 32;
    const barWidth = totalWidth - labelWidth - 40;
    const pct = Phaser.Math.Clamp(value / maxValue, 0, 1);

    this.add.text(x, y, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: COLORS_CSS.GRAY_LIGHT,
    });

    const bg = this.add.graphics();
    bg.fillStyle(0x333333, 1);
    bg.fillRoundedRect(x + labelWidth, y + 2, barWidth, 8, 3);

    const fill = this.add.graphics();
    fill.fillStyle(COLORS.GOLD, 1);
    fill.fillRoundedRect(x + labelWidth, y + 2, barWidth * pct, 8, 3);

    this.add.text(x + labelWidth + barWidth + 4, y, `${value}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: COLORS_CSS.WHITE,
    });
  }
}
