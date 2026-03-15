// ============================================================================
// TouchControls.js — Virtual joystick and action buttons for mobile/touch
//
// Improved for clarity: larger buttons, emoji icons, pulsing hints on first
// load, and a brief tutorial overlay explaining the controls.
// ============================================================================

import Phaser from 'phaser';

const JOYSTICK_BASE_RADIUS = 70;
const JOYSTICK_THUMB_RADIUS = 28;
const BUTTON_RADIUS = 46;
const TOUCH_DEPTH = 1000; // Render above everything

export class TouchControls {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.isTouchDevice = scene.sys.game.device.input.touch;

    // Movement state
    this._vx = 0;
    this._vy = 0;

    // Button states (true only for the frame they were tapped)
    this._attackPressed = false;
    this._abilityPressed = false;

    // Joystick tracking
    this._joystickActive = false;
    this._joystickPointerId = null;
    this._baseX = 0;
    this._baseY = 0;

    // Button tracking
    this._attackPointerId = null;
    this._abilityPointerId = null;

    if (!this.isTouchDevice) return;

    const { width, height } = scene.cameras.main;

    // --- Virtual Joystick (floating style, appears on touch) ---
    this.joystickBase = scene.add.graphics().setDepth(TOUCH_DEPTH).setAlpha(0);
    this.joystickThumb = scene.add.graphics().setDepth(TOUCH_DEPTH + 1).setAlpha(0);

    this._drawJoystickBase();
    this._drawJoystickThumb(0, 0);

    // --- Joystick hint (static ghost showing where to touch) ---
    this.joystickHint = scene.add.graphics().setDepth(TOUCH_DEPTH - 1);
    this.joystickHint.fillStyle(0xffffff, 0.08);
    this.joystickHint.fillCircle(100, height - 120, JOYSTICK_BASE_RADIUS);
    this.joystickHint.lineStyle(2, 0xffffff, 0.15);
    this.joystickHint.strokeCircle(100, height - 120, JOYSTICK_BASE_RADIUS);
    this.joystickHintLabel = scene.add.text(100, height - 120, 'MOVE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(TOUCH_DEPTH - 1).setAlpha(0.25);

    // --- Attack Button (bottom-right) — large red sword icon ---
    const atkX = width - 90;
    const atkY = height - 90;
    this.attackBtn = this._createButton(atkX, atkY, BUTTON_RADIUS, '\u2694\uFE0F', 0xff4444, 'ATTACK');

    // --- Ability Button (above attack button) — blue star icon ---
    const ablX = width - 90;
    const ablY = height - 200;
    this.abilityBtn = this._createButton(ablX, ablY, BUTTON_RADIUS, '\u2728', 0x4488ff, 'SKILL');
    this.abilityCooldownOverlay = scene.add.graphics().setDepth(TOUCH_DEPTH + 1);
    this._abilityCooldownPct = 0;

    // --- Input handling (multi-touch via scene-level pointer events) ---
    scene.input.on('pointerdown', this._onPointerDown, this);
    scene.input.on('pointermove', this._onPointerMove, this);
    scene.input.on('pointerup', this._onPointerUp, this);

    this.visible = true;

    // --- Show tutorial overlay on first load ---
    this._showTutorial(width, height);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Returns normalized movement vector { vx, vy } */
  getMovement() {
    return { vx: this._vx, vy: this._vy };
  }

  /** Returns true if attack was tapped this frame, then resets */
  isAttackPressed() {
    const val = this._attackPressed;
    this._attackPressed = false;
    return val;
  }

  /** Returns true if ability was tapped this frame, then resets */
  isAbilityPressed() {
    const val = this._abilityPressed;
    this._abilityPressed = false;
    return val;
  }

  /** Update cooldown visual on ability button (0 = ready, 1 = full cooldown) */
  updateCooldown(pct) {
    if (!this.isTouchDevice) return;
    this._abilityCooldownPct = pct;
    this._drawCooldownOverlay();
  }

  show() {
    if (!this.isTouchDevice) return;
    this.visible = true;
    this.attackBtn.bg.setVisible(true);
    this.attackBtn.icon.setVisible(true);
    this.attackBtn.label.setVisible(true);
    this.abilityBtn.bg.setVisible(true);
    this.abilityBtn.icon.setVisible(true);
    this.abilityBtn.label.setVisible(true);
    this.abilityCooldownOverlay.setVisible(true);
    if (this.joystickHint) this.joystickHint.setVisible(true);
    if (this.joystickHintLabel) this.joystickHintLabel.setVisible(true);
  }

  hide() {
    if (!this.isTouchDevice) return;
    this.visible = false;
    this.joystickBase.setAlpha(0);
    this.joystickThumb.setAlpha(0);
    this.attackBtn.bg.setVisible(false);
    this.attackBtn.icon.setVisible(false);
    this.attackBtn.label.setVisible(false);
    this.abilityBtn.bg.setVisible(false);
    this.abilityBtn.icon.setVisible(false);
    this.abilityBtn.label.setVisible(false);
    this.abilityCooldownOverlay.setVisible(false);
    if (this.joystickHint) this.joystickHint.setVisible(false);
    if (this.joystickHintLabel) this.joystickHintLabel.setVisible(false);
    this._vx = 0;
    this._vy = 0;
  }

  destroy() {
    if (!this.isTouchDevice) return;
    this.scene.input.off('pointerdown', this._onPointerDown, this);
    this.scene.input.off('pointermove', this._onPointerMove, this);
    this.scene.input.off('pointerup', this._onPointerUp, this);

    this.joystickBase.destroy();
    this.joystickThumb.destroy();
    this.attackBtn.bg.destroy();
    this.attackBtn.icon.destroy();
    this.attackBtn.label.destroy();
    this.abilityBtn.bg.destroy();
    this.abilityBtn.icon.destroy();
    this.abilityBtn.label.destroy();
    this.abilityCooldownOverlay.destroy();
    if (this.joystickHint) this.joystickHint.destroy();
    if (this.joystickHintLabel) this.joystickHintLabel.destroy();
  }

  // ---------------------------------------------------------------------------
  // Internal: drawing helpers
  // ---------------------------------------------------------------------------

  _drawJoystickBase() {
    this.joystickBase.clear();
    this.joystickBase.fillStyle(0xffffff, 0.2);
    this.joystickBase.fillCircle(0, 0, JOYSTICK_BASE_RADIUS);
    this.joystickBase.lineStyle(3, 0xffffff, 0.4);
    this.joystickBase.strokeCircle(0, 0, JOYSTICK_BASE_RADIUS);
  }

  _drawJoystickThumb(offsetX, offsetY) {
    this.joystickThumb.clear();
    this.joystickThumb.fillStyle(0xffffff, 0.5);
    this.joystickThumb.fillCircle(offsetX, offsetY, JOYSTICK_THUMB_RADIUS);
    this.joystickThumb.lineStyle(2, 0xffffff, 0.7);
    this.joystickThumb.strokeCircle(offsetX, offsetY, JOYSTICK_THUMB_RADIUS);
  }

  _createButton(x, y, radius, iconText, color, labelText) {
    // Outer glow ring
    const bg = this.scene.add.graphics().setDepth(TOUCH_DEPTH);
    bg.fillStyle(color, 0.35);
    bg.fillCircle(x, y, radius);
    bg.lineStyle(3, color, 0.7);
    bg.strokeCircle(x, y, radius);
    // Inner highlight
    bg.fillStyle(0xffffff, 0.08);
    bg.fillCircle(x, y - 4, radius * 0.7);

    // Large icon in center
    const icon = this.scene.add.text(x, y - 4, iconText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
    }).setOrigin(0.5).setDepth(TOUCH_DEPTH + 2);

    // Small label below icon
    const label = this.scene.add.text(x, y + 22, labelText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(TOUCH_DEPTH + 2).setAlpha(0.85);

    return { bg, icon, label, x, y, radius };
  }

  _drawCooldownOverlay() {
    const overlay = this.abilityCooldownOverlay;
    overlay.clear();
    if (this._abilityCooldownPct > 0) {
      const { x, y, radius } = this.abilityBtn;
      overlay.fillStyle(0x000000, 0.55);
      overlay.fillCircle(x, y, radius);
      // Show cooldown percentage text
      this.abilityBtn.icon.setAlpha(0.3);
      this.abilityBtn.label.setText('WAIT');
      this.abilityBtn.label.setAlpha(0.5);
    } else {
      this.abilityBtn.icon.setAlpha(1);
      this.abilityBtn.label.setText('SKILL');
      this.abilityBtn.label.setAlpha(0.85);
    }
  }

  // ---------------------------------------------------------------------------
  // Tutorial overlay — shown once on first battle
  // ---------------------------------------------------------------------------

  _showTutorial(width, height) {
    // Darken the screen
    const overlay = this.scene.add.graphics().setDepth(TOUCH_DEPTH + 10);
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    // Title
    const title = this.scene.add.text(width / 2, height * 0.15, 'TOUCH CONTROLS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(TOUCH_DEPTH + 11);

    // Control descriptions
    const instructions = [
      { icon: '\uD83D\uDD34', text: 'Touch & drag LEFT side to MOVE' },
      { icon: '\u2694\uFE0F', text: 'Tap ATTACK button to hit nearby enemies' },
      { icon: '\u2728', text: 'Tap SKILL button for your special ability' },
      { icon: '\uD83D\uDEE1\uFE0F', text: 'Defend the church in the center!' },
    ];

    const startY = height * 0.3;
    const lineHeight = 50;

    instructions.forEach((inst, i) => {
      this.scene.add.text(width / 2 - 160, startY + i * lineHeight, inst.icon, {
        fontSize: '24px',
      }).setOrigin(0.5).setDepth(TOUCH_DEPTH + 11);

      this.scene.add.text(width / 2 - 120, startY + i * lineHeight, inst.text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(0, 0.5).setDepth(TOUCH_DEPTH + 11);
    });

    // Tap to start
    const tapText = this.scene.add.text(width / 2, height * 0.78, 'TAP ANYWHERE TO START', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(TOUCH_DEPTH + 11);

    // Pulse the tap text
    this.scene.tweens.add({
      targets: tapText,
      alpha: { from: 1, to: 0.4 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Collect all tutorial elements for cleanup
    const tutorialElements = [overlay, title, tapText];
    instructions.forEach((_, i) => {
      // The text objects were added to scene but not stored — find them by position
    });

    // Dismiss on tap — use a one-time zone over everything
    const dismissZone = this.scene.add.zone(width / 2, height / 2, width, height)
      .setInteractive()
      .setDepth(TOUCH_DEPTH + 12);

    dismissZone.once('pointerdown', () => {
      // Fade out and remove all tutorial elements
      overlay.destroy();
      title.destroy();
      tapText.destroy();
      dismissZone.destroy();
      // Clean up instruction texts (they're children of the scene)
      this.scene.children.list
        .filter(c => c.depth === TOUCH_DEPTH + 11)
        .forEach(c => c.destroy());

      // Fade out joystick hint after a few seconds
      this.scene.time.delayedCall(5000, () => {
        if (this.joystickHint && this.joystickHint.active) {
          this.scene.tweens.add({
            targets: [this.joystickHint, this.joystickHintLabel],
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              if (this.joystickHint) this.joystickHint.destroy();
              if (this.joystickHintLabel) this.joystickHintLabel.destroy();
              this.joystickHint = null;
              this.joystickHintLabel = null;
            },
          });
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Internal: pointer event handlers
  // ---------------------------------------------------------------------------

  _onPointerDown(pointer) {
    if (!this.visible) return;

    const { width } = this.scene.cameras.main;
    const px = pointer.x;
    const py = pointer.y;

    // Check if tapping attack button
    if (this._isInsideButton(px, py, this.attackBtn)) {
      this._attackPressed = true;
      this._attackPointerId = pointer.id;
      // Visual feedback — flash brighter
      this.attackBtn.bg.clear();
      this.attackBtn.bg.fillStyle(0xff4444, 0.6);
      this.attackBtn.bg.fillCircle(this.attackBtn.x, this.attackBtn.y, BUTTON_RADIUS);
      this.attackBtn.bg.lineStyle(3, 0xffffff, 0.9);
      this.attackBtn.bg.strokeCircle(this.attackBtn.x, this.attackBtn.y, BUTTON_RADIUS);
      this.attackBtn.icon.setScale(1.2);
      this.scene.time.delayedCall(120, () => {
        if (this.attackBtn && this.attackBtn.bg && this.attackBtn.bg.active) {
          this.attackBtn.bg.clear();
          this.attackBtn.bg.fillStyle(0xff4444, 0.35);
          this.attackBtn.bg.fillCircle(this.attackBtn.x, this.attackBtn.y, BUTTON_RADIUS);
          this.attackBtn.bg.lineStyle(3, 0xff4444, 0.7);
          this.attackBtn.bg.strokeCircle(this.attackBtn.x, this.attackBtn.y, BUTTON_RADIUS);
          this.attackBtn.bg.fillStyle(0xffffff, 0.08);
          this.attackBtn.bg.fillCircle(this.attackBtn.x, this.attackBtn.y - 4, BUTTON_RADIUS * 0.7);
          this.attackBtn.icon.setScale(1);
        }
      });
      return;
    }

    // Check if tapping ability button
    if (this._isInsideButton(px, py, this.abilityBtn)) {
      this._abilityPressed = true;
      this._abilityPointerId = pointer.id;
      this.abilityBtn.bg.clear();
      this.abilityBtn.bg.fillStyle(0x4488ff, 0.6);
      this.abilityBtn.bg.fillCircle(this.abilityBtn.x, this.abilityBtn.y, BUTTON_RADIUS);
      this.abilityBtn.bg.lineStyle(3, 0xffffff, 0.9);
      this.abilityBtn.bg.strokeCircle(this.abilityBtn.x, this.abilityBtn.y, BUTTON_RADIUS);
      this.abilityBtn.icon.setScale(1.2);
      this.scene.time.delayedCall(120, () => {
        if (this.abilityBtn && this.abilityBtn.bg && this.abilityBtn.bg.active) {
          this.abilityBtn.bg.clear();
          this.abilityBtn.bg.fillStyle(0x4488ff, 0.35);
          this.abilityBtn.bg.fillCircle(this.abilityBtn.x, this.abilityBtn.y, BUTTON_RADIUS);
          this.abilityBtn.bg.lineStyle(3, 0x4488ff, 0.7);
          this.abilityBtn.bg.strokeCircle(this.abilityBtn.x, this.abilityBtn.y, BUTTON_RADIUS);
          this.abilityBtn.bg.fillStyle(0xffffff, 0.08);
          this.abilityBtn.bg.fillCircle(this.abilityBtn.x, this.abilityBtn.y - 4, BUTTON_RADIUS * 0.7);
          this.abilityBtn.icon.setScale(1);
        }
      });
      return;
    }

    // Left portion of screen — activate joystick
    if (px < width * 0.6 && !this._joystickActive) {
      this._joystickActive = true;
      this._joystickPointerId = pointer.id;
      this._baseX = px;
      this._baseY = py;

      this.joystickBase.setPosition(px, py);
      this.joystickThumb.setPosition(px, py);
      this.joystickBase.setAlpha(1);
      this.joystickThumb.setAlpha(1);
      this._drawJoystickThumb(0, 0);

      // Hide the static hint once player uses joystick
      if (this.joystickHint) {
        this.joystickHint.setAlpha(0);
        this.joystickHintLabel.setAlpha(0);
      }
    }
  }

  _onPointerMove(pointer) {
    if (!this.visible) return;

    // Update joystick if this is the joystick pointer
    if (this._joystickActive && pointer.id === this._joystickPointerId) {
      const dx = pointer.x - this._baseX;
      const dy = pointer.y - this._baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = JOYSTICK_BASE_RADIUS;

      let clampedDx = dx;
      let clampedDy = dy;

      if (dist > maxDist) {
        clampedDx = (dx / dist) * maxDist;
        clampedDy = (dy / dist) * maxDist;
      }

      // Normalize to -1..1
      this._vx = clampedDx / maxDist;
      this._vy = clampedDy / maxDist;

      // Apply dead zone
      if (Math.abs(this._vx) < 0.15) this._vx = 0;
      if (Math.abs(this._vy) < 0.15) this._vy = 0;

      // Update thumb visual position
      this._drawJoystickThumb(clampedDx, clampedDy);
    }
  }

  _onPointerUp(pointer) {
    if (!this.visible) return;

    // Release joystick
    if (this._joystickActive && pointer.id === this._joystickPointerId) {
      this._joystickActive = false;
      this._joystickPointerId = null;
      this._vx = 0;
      this._vy = 0;
      this.joystickBase.setAlpha(0);
      this.joystickThumb.setAlpha(0);
    }

    // Release attack button
    if (pointer.id === this._attackPointerId) {
      this._attackPointerId = null;
    }

    // Release ability button
    if (pointer.id === this._abilityPointerId) {
      this._abilityPointerId = null;
    }
  }

  _isInsideButton(px, py, btn) {
    const dx = px - btn.x;
    const dy = py - btn.y;
    return (dx * dx + dy * dy) <= (btn.radius + 12) * (btn.radius + 12);
  }
}
