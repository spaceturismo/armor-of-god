// ============================================================================
// ui-components.js — Reusable Phaser UI factory functions
// ============================================================================

import { COLORS, COLORS_CSS, FONT_STYLES } from './constants.js';

// =============================================================================
// createButton
// =============================================================================

/**
 * Create a text-based button with hover and click effects.
 *
 * The button is a Phaser Text object made interactive. It scales up slightly
 * on hover and shows a brief press animation on click.
 *
 * @param {Phaser.Scene} scene   - The scene to add the button to
 * @param {number}       x       - X position (center)
 * @param {number}       y       - Y position (center)
 * @param {string}       text    - Button label
 * @param {Function}     onClick - Callback fired on click / tap
 * @param {Object}       [style] - Phaser text style overrides (merged with FONT_STYLES.BUTTON)
 * @returns {Phaser.GameObjects.Text} The button text object
 */
export function createButton(scene, x, y, text, onClick, style = {}) {
  const mergedStyle = { ...FONT_STYLES.BUTTON, ...style };
  const btn = scene.add.text(x, y, text, mergedStyle).setOrigin(0.5);

  btn.setInteractive({ useHandCursor: true });

  // Hover — scale up slightly
  btn.on('pointerover', () => {
    scene.tweens.add({
      targets: btn,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 100,
      ease: 'Power1',
    });
    btn.setColor(COLORS_CSS.GOLD);
  });

  // Hover out — restore
  btn.on('pointerout', () => {
    scene.tweens.add({
      targets: btn,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Power1',
    });
    btn.setColor(mergedStyle.color || COLORS_CSS.WHITE);
  });

  // Click — brief press animation, then fire callback
  btn.on('pointerdown', () => {
    scene.tweens.add({
      targets: btn,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 60,
      yoyo: true,
      ease: 'Power1',
      onComplete: () => {
        if (onClick) onClick();
      },
    });
  });

  return btn;
}

// =============================================================================
// createPanel
// =============================================================================

/**
 * Create a rounded rectangle panel (filled Graphics object).
 *
 * @param {Phaser.Scene} scene   - The scene to add the panel to
 * @param {number}       x       - X position (top-left)
 * @param {number}       y       - Y position (top-left)
 * @param {number}       width   - Panel width in pixels
 * @param {number}       height  - Panel height in pixels
 * @param {number}       [bgColor=COLORS.DARK] - Fill color (hex number)
 * @param {number}       [alpha=0.85]           - Fill alpha
 * @returns {Phaser.GameObjects.Graphics} The panel graphics object
 */
export function createPanel(scene, x, y, width, height, bgColor = COLORS.DARK, alpha = 0.85) {
  const gfx = scene.add.graphics();
  gfx.fillStyle(bgColor, alpha);
  gfx.fillRoundedRect(x, y, width, height, 16);
  return gfx;
}

// =============================================================================
// createScriptureDisplay
// =============================================================================

/**
 * Display a scripture with its reference, nicely formatted on a parchment-style
 * panel.
 *
 * @param {Phaser.Scene} scene     - The scene to add the display to
 * @param {number}       x         - X position (center)
 * @param {number}       y         - Y position (top)
 * @param {number}       width     - Max width of the display
 * @param {Object}       scripture - Scripture object with { reference, text }
 * @returns {{ container: Phaser.GameObjects.Container, panel: Phaser.GameObjects.Graphics, refText: Phaser.GameObjects.Text, bodyText: Phaser.GameObjects.Text }}
 */
export function createScriptureDisplay(scene, x, y, width, scripture) {
  const padding = 20;
  const innerWidth = width - padding * 2;

  // Scripture body text (measure height first)
  const bodyStyle = {
    ...FONT_STYLES.SCRIPTURE,
    wordWrap: { width: innerWidth },
  };
  const bodyText = scene.add.text(0, 0, `"${scripture.text}"`, bodyStyle).setOrigin(0.5, 0);

  // Reference label
  const refText = scene.add
    .text(0, -bodyText.height / 2 - 28, scripture.reference, FONT_STYLES.SCRIPTURE_REF)
    .setOrigin(0.5, 0);

  // Calculate panel dimensions
  const totalTextHeight = refText.height + 8 + bodyText.height;
  const panelHeight = totalTextHeight + padding * 2;
  const panelX = -width / 2;
  const panelY = -panelHeight / 2;

  // Background panel
  const panel = scene.add.graphics();
  panel.fillStyle(COLORS.DARK, 0.8);
  panel.fillRoundedRect(panelX, panelY, width, panelHeight, 12);
  panel.lineStyle(2, COLORS.GOLD, 0.6);
  panel.strokeRoundedRect(panelX, panelY, width, panelHeight, 12);

  // Position text within panel
  refText.setY(panelY + padding);
  bodyText.setY(refText.y + refText.height + 8);

  // Wrap in a container for easy positioning
  const container = scene.add.container(x, y, [panel, refText, bodyText]);

  return { container, panel, refText, bodyText };
}

// =============================================================================
// createHealthBar
// =============================================================================

/**
 * Create a health / progress bar.
 *
 * Returns an object with a `setPercent(pct)` method to update the bar fill.
 *
 * @param {Phaser.Scene} scene  - The scene to add the bar to
 * @param {number}       x      - X position (left edge)
 * @param {number}       y      - Y position (top edge)
 * @param {number}       width  - Total bar width
 * @param {number}       height - Bar height
 * @param {number}       [color=COLORS.GREEN] - Fill color (hex number)
 * @returns {{ bg: Phaser.GameObjects.Graphics, fill: Phaser.GameObjects.Graphics, setPercent: (pct: number) => void }}
 */
export function createHealthBar(scene, x, y, width, height, color = COLORS.GREEN) {
  // Background (dark track)
  const bg = scene.add.graphics();
  bg.fillStyle(COLORS.DARK, 0.6);
  bg.fillRoundedRect(x, y, width, height, height / 2);
  bg.lineStyle(1, COLORS.GRAY_LIGHT, 0.4);
  bg.strokeRoundedRect(x, y, width, height, height / 2);

  // Foreground fill
  const fill = scene.add.graphics();

  /**
   * Update the bar to show a percentage.
   * @param {number} pct - Value from 0 to 1
   */
  function setPercent(pct) {
    const clamped = Phaser.Math.Clamp(pct, 0, 1);
    fill.clear();
    if (clamped > 0) {
      fill.fillStyle(color, 1);
      fill.fillRoundedRect(x, y, width * clamped, height, height / 2);
    }
  }

  // Start at 100%
  setPercent(1);

  return { bg, fill, setPercent };
}

// =============================================================================
// createDialog
// =============================================================================

/**
 * Create a typewriter-style dialog box.
 *
 * Displays a speaker name and reveals the body text one character at a time.
 * Calls `onComplete` when the full text has been revealed.
 *
 * @param {Phaser.Scene} scene       - The scene to add the dialog to
 * @param {number}       x           - X position (center)
 * @param {number}       y           - Y position (center of the box)
 * @param {number}       width       - Dialog box width
 * @param {string}       speakerName - Name shown above the dialog text
 * @param {string}       text        - The message to reveal character by character
 * @param {Function}     [onComplete] - Called when all text has been revealed
 * @param {number}       [charDelay=30] - Milliseconds between each character
 * @returns {{ container: Phaser.GameObjects.Container, skip: () => void }}
 */
export function createDialog(scene, x, y, width, speakerName, text, onComplete, charDelay = 30) {
  const padding = 20;
  const innerWidth = width - padding * 2;
  const boxHeight = 140;

  // Panel background
  const panel = scene.add.graphics();
  panel.fillStyle(COLORS.DARK, 0.9);
  panel.fillRoundedRect(-width / 2, -boxHeight / 2, width, boxHeight, 12);
  panel.lineStyle(2, COLORS.GOLD, 0.5);
  panel.strokeRoundedRect(-width / 2, -boxHeight / 2, width, boxHeight, 12);

  // Speaker name
  const nameText = scene.add
    .text(-width / 2 + padding, -boxHeight / 2 + 12, speakerName, {
      ...FONT_STYLES.BUTTON,
      fontSize: '18px',
      color: COLORS_CSS.GOLD,
    })
    .setOrigin(0, 0);

  // Body text (starts empty — filled by typewriter effect)
  const bodyText = scene.add
    .text(-width / 2 + padding, -boxHeight / 2 + 40, '', {
      ...FONT_STYLES.BODY,
      fontSize: '16px',
      wordWrap: { width: innerWidth },
    })
    .setOrigin(0, 0);

  // Wrap in container
  const container = scene.add.container(x, y, [panel, nameText, bodyText]);

  // -- Typewriter effect ------------------------------------------------------
  let charIndex = 0;
  let finished = false;

  const timer = scene.time.addEvent({
    delay: charDelay,
    repeat: text.length - 1,
    callback: () => {
      charIndex++;
      bodyText.setText(text.slice(0, charIndex));

      if (charIndex >= text.length && !finished) {
        finished = true;
        if (onComplete) onComplete();
      }
    },
  });

  /**
   * Skip the typewriter animation and reveal all text immediately.
   */
  function skip() {
    if (finished) return;
    finished = true;
    timer.remove(false);
    bodyText.setText(text);
    if (onComplete) onComplete();
  }

  // Allow clicking the dialog to skip
  panel.setInteractive(
    new Phaser.Geom.Rectangle(-width / 2, -boxHeight / 2, width, boxHeight),
    Phaser.Geom.Rectangle.Contains
  );
  // Note: the interactive zone is on the graphics object inside the container,
  // so pointer events work relative to the container's local space.
  container.setInteractive(
    new Phaser.Geom.Rectangle(-width / 2, -boxHeight / 2, width, boxHeight),
    Phaser.Geom.Rectangle.Contains
  );
  container.on('pointerdown', skip);

  return { container, skip };
}
