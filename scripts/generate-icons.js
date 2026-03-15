// ============================================================================
// generate-icons.js — Generate PNG icons from the SVG source
// ============================================================================
//
// This script converts public/icons/icon.svg into PNG icons at 192x192 and
// 512x512 for the PWA manifest.
//
// Usage (requires a sharp or canvas-compatible environment):
//   node scripts/generate-icons.js
//
// If you do not have sharp/canvas installed, you can use any SVG-to-PNG
// converter (e.g., Inkscape, ImageMagick, or an online tool) to create:
//   - public/icons/icon-192.png  (192x192)
//   - public/icons/icon-512.png  (512x512)
//
// Alternatively, modern browsers and PWA installers support SVG icons
// directly via the manifest, which is already configured.

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, '..', 'public', 'icons');

async function generateIcons() {
  try {
    // Try using sharp if available
    const sharp = (await import('sharp')).default;
    const svgPath = resolve(iconsDir, 'icon.svg');
    const svgBuffer = readFileSync(svgPath);

    for (const size of [192, 512]) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(resolve(iconsDir, `icon-${size}.png`));
      console.log(`Generated icon-${size}.png`);
    }

    console.log('Icon generation complete.');
  } catch (err) {
    console.log('Could not auto-generate PNG icons (sharp not available).');
    console.log('The SVG icon at public/icons/icon.svg is used directly by modern browsers.');
    console.log('To generate PNGs, install sharp: npm install sharp --save-dev');
    console.log('Then re-run: node scripts/generate-icons.js');
  }
}

generateIcons();
