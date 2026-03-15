// ============================================================================
// index.js — Public API for @faith-games/shared
//
// Re-exports everything from the individual modules so consumers can do:
//   import { ScriptureDB, SaveManager, createButton } from '@faith-games/shared';
// ============================================================================

export { ScriptureDB } from './src/scripture.js';
export { SaveManager } from './src/save-manager.js';
export { AudioManager } from './src/audio-manager.js';
export {
  createButton,
  createPanel,
  createScriptureDisplay,
  createHealthBar,
  createDialog,
} from './src/ui-components.js';
export {
  COLORS,
  COLORS_CSS,
  FONT_STYLES,
  GAME_IDS,
  CATEGORIES,
} from './src/constants.js';
