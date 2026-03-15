// ============================================================================
// constants.js — Shared constants for all faith-based games
// ============================================================================

/**
 * Faith-themed color palette.
 * All values are hex numbers (e.g. 0xFFD700) for direct use in Phaser tint
 * operations. Use COLORS_CSS for CSS/hex-string versions.
 */
export const COLORS = {
  /** Bright gold — glory, divinity */
  GOLD: 0xFFD700,
  /** Warm gold — highlights, accents */
  GOLD_LIGHT: 0xFFEC8B,
  /** Royal blue — royalty, heaven */
  ROYAL_BLUE: 0x4169E1,
  /** Soft sky blue — peace, serenity */
  SKY_BLUE: 0x87CEEB,
  /** Pure white — purity, holiness */
  WHITE: 0xFFFFFF,
  /** Soft purple — wisdom, royalty */
  PURPLE: 0x9370DB,
  /** Deep purple — mystery, majesty */
  PURPLE_DARK: 0x6A0DAD,
  /** Warm red — love, sacrifice */
  RED: 0xDC143C,
  /** Soft rose — compassion */
  ROSE: 0xFF6B6B,
  /** Forest green — growth, life */
  GREEN: 0x228B22,
  /** Light green — renewal, spring */
  GREEN_LIGHT: 0x90EE90,
  /** Rich brown — earth, humility */
  BROWN: 0x8B4513,
  /** Parchment/cream — scripture background */
  PARCHMENT: 0xFFF8DC,
  /** Dark charcoal — text, shadows */
  DARK: 0x2C2C2C,
  /** Medium gray — secondary text */
  GRAY: 0x808080,
  /** Light gray — borders, disabled states */
  GRAY_LIGHT: 0xD3D3D3,
};

/**
 * CSS-friendly hex string versions of the color palette.
 */
export const COLORS_CSS = {
  GOLD: '#FFD700',
  GOLD_LIGHT: '#FFEC8B',
  ROYAL_BLUE: '#4169E1',
  SKY_BLUE: '#87CEEB',
  WHITE: '#FFFFFF',
  PURPLE: '#9370DB',
  PURPLE_DARK: '#6A0DAD',
  RED: '#DC143C',
  ROSE: '#FF6B6B',
  GREEN: '#228B22',
  GREEN_LIGHT: '#90EE90',
  BROWN: '#8B4513',
  PARCHMENT: '#FFF8DC',
  DARK: '#2C2C2C',
  GRAY: '#808080',
  GRAY_LIGHT: '#D3D3D3',
};

/**
 * Predefined font style objects for Phaser Text game objects.
 * Pass these directly to `scene.add.text(x, y, str, FONT_STYLES.HEADING)`.
 */
export const FONT_STYLES = {
  /** Large heading text — titles, scene names */
  HEADING: {
    fontFamily: 'Georgia, serif',
    fontSize: '36px',
    color: COLORS_CSS.GOLD,
    fontStyle: 'bold',
    stroke: COLORS_CSS.DARK,
    strokeThickness: 2,
  },

  /** Standard body text — descriptions, instructions */
  BODY: {
    fontFamily: 'Georgia, serif',
    fontSize: '18px',
    color: COLORS_CSS.WHITE,
    wordWrap: { width: 500 },
  },

  /** Scripture display text — italicized, warm tone */
  SCRIPTURE: {
    fontFamily: 'Georgia, serif',
    fontSize: '20px',
    fontStyle: 'italic',
    color: COLORS_CSS.PARCHMENT,
    wordWrap: { width: 460 },
    lineSpacing: 6,
  },

  /** Scripture reference label */
  SCRIPTURE_REF: {
    fontFamily: 'Georgia, serif',
    fontSize: '16px',
    fontStyle: 'bold',
    color: COLORS_CSS.GOLD,
  },

  /** Button label text */
  BUTTON: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '22px',
    color: COLORS_CSS.WHITE,
    fontStyle: 'bold',
  },

  /** Small/secondary text — tooltips, footnotes */
  SMALL: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    color: COLORS_CSS.GRAY_LIGHT,
  },
};

/**
 * Unique game identifiers used by SaveManager and other systems.
 */
export const GAME_IDS = {
  ARMOR_OF_GOD: 'armor-of-god',
  PARABLES: 'parables',
};

/**
 * Scripture category tags.
 */
export const CATEGORIES = {
  FAITH: 'faith',
  ARMOR: 'armor',
  LOVE: 'love',
  FORGIVENESS: 'forgiveness',
  COURAGE: 'courage',
  WISDOM: 'wisdom',
  PARABLE: 'parable',
};
