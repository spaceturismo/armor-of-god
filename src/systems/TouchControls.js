// ============================================================================
// TouchControls.js — Virtual joystick and action buttons for mobile/touch
// ============================================================================

import Phaser from 'phaser';

const JOYSTICK_BASE_RADIUS = 60;
const JOYSTICK_THUMB_RADIUS = 24;
const BUTTON_RADIUS = 36;
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

    // --- Virtual Joystick (created on touch, floating style) ---
    this.joystickBase = scene.add.graphics().setDepth(TOUCH_DEPTH).setAlpha(0);
    this.joystickThumb = scene.add.graphics().setDepth(TOUCH_DEPTH + 1).setAlpha(0);

    this._drawJoystickBase();
    this._drawJoystickThumb(0, 0);

    // --- Attack Button (bottom-right) ---
    const atkX = width - 80;
    const atkY = height - 80;
    this.attackBtn = this._createButton(atkX, atkY, BUTTON_RADIUS, 'ATK', 0xff4444);

    // --- Ability Button (above attack button) ---
    const ablX = width - 80;
    const ablY = height - 170;
    this.abilityBtn = this._createButton(ablX, ablY, BUTTON_RADIUS, 'SKILL', 0x4488ff);
    this.abilityCooldownOverlay = scene.add.graphics().setDepth(TOUCH_DEPTH + 1);
    this._abilityCooldownPct = 0;

    // --- Input handling ---
    // We use the scene-level pointer events to handle multi-touch
    scene.input.on('pointerdown', this._onPointerDown, this);
    scene.input.on('pointermove', this._onPointerMove, this);
    scene.input.on('pointerup', this._onPointerUp, this);

    this.visible = true;
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
    this.attackBtn.label.setVisible(true);
    this.abilityBtn.bg.setVisible(true);
    this.abilityBtn.label.setVisible(true);
    this.abilityCooldownOverlay.setVisible(true);
  }

  hide() {
    if (!this.isTouchDevice) return;
    this.visible = false;
    this.joystickBase.setAlpha(0);
    this.joystickThumb.setAlpha(0);
    this.attackBtn.bg.setVisible(false);
    this.attackBtn.label.setVisible(false);
    this.abilityBtn.bg.setVisible(false);
    this.abilityBtn.label.setVisible(false);
    this.abilityCooldownOverlay.setVisible(false);
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
    this.attackBtn.label.destroy();
    this.abilityBtn.bg.destroy();
    this.abilityBtn.label.destroy();
    this.abilityCooldownOverlay.destroy();
  }

  // ---------------------------------------------------------------------------
  // Internal: drawing helpers
  // ---------------------------------------------------------------------------

  _drawJoystickBase() {
    this.joystickBase.clear();
    this.joystickBase.fillStyle(0xffffff, 0.15);
    this.joystickBase.fillCircle(0, 0, JOYSTICK_BASE_RADIUS);
    this.joystickBase.lineStyle(2, 0xffffff, 0.3);
    this.joystickBase.strokeCircle(0, 0, JOYSTICK_BASE_RADIUS);
  }

  _drawJoystickThumb(offsetX, offsetY) {
    this.joystickThumb.clear();
    this.joystickThumb.fillStyle(0xffffff, 0.4);
    this.joystickThumb.fillCircle(offsetX, offsetY, JOYSTICK_THUMB_RADIUS);
  }

  _createButton(x, y, radius, labelText, color) {
    const bg = this.scene.add.graphics().setDepth(TOUCH_DEPTH);
    bg.fillStyle(color, 0.25);
    bg.fillCircle(x, y, radius);
    bg.lineStyle(2, color, 0.5);
    bg.strokeCircle(x, y, radius);

    const label = this.scene.add.text(x, y, labelText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(TOUCH_DEPTH + 1).setAlpha(0.7);

    return { bg, label, x, y, radius };
  }

  _drawCooldownOverlay() {
    const overlay = this.abilityCooldownOverlay;
    overlay.clear();
    if (this._abilityCooldownPct > 0) {
      const { x, y, radius } = this.abilityBtn;
      overlay.fillStyle(0x000000, 0.5);
      overlay.fillCircle(x, y, radius);
      // Show remaining cooldown as a partial clear
      this.abilityBtn.label.setAlpha(0.3);
    } else {
      this.abilityBtn.label.setAlpha(0.7);
    }
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
      // Brief visual feedback
      this.attackBtn.bg.setAlpha(0.6);
      this.scene.time.delayedCall(100, () => {
        if (this.attackBtn && this.attackBtn.bg && this.attackBtn.bg.active) {
          this.attackBtn.bg.setAlpha(1);
        }
      });
      return;
    }

    // Check if tapping ability button
    if (this._isInsideButton(px, py, this.abilityBtn)) {
      this._abilityPressed = true;
      this._abilityPointerId = pointer.id;
      this.abilityBtn.bg.setAlpha(0.6);
      this.scene.time.delayedCall(100, () => {
        if (this.abilityBtn && this.abilityBtn.bg && this.abilityBtn.bg.active) {
          this.abilityBtn.bg.setAlpha(1);
        }
      });
      return;
    }

    // Left half of screen — activate joystick
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

      // Apply dead zone (ignore very small movements)
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
    return (dx * dx + dy * dy) <= (btn.radius + 10) * (btn.radius + 10);
  }
}
