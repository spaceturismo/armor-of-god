// ============================================================================
// main.js — Phaser 3 game entry point for Armor of God
// ============================================================================

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { registerServiceWorker } from './pwa.js';

/** @type {Phaser.Types.Core.GameConfig} */
const config = {
  type: Phaser.CANVAS,
  width: 1024,
  height: 768,
  backgroundColor: '#0a0a2e',
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  dom: {
    createContainer: true,
  },
  scene: [BootScene, MenuScene, CharacterSelectScene, BattleScene, VictoryScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 768,
  },
  input: {
    activePointers: 3, // Support multi-touch for joystick + buttons
  },
};

// Create the Phaser game instance
const game = new Phaser.Game(config);

// Register PWA service worker
registerServiceWorker();
