// vite.config.js — Vite configuration for Armor of God
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 10000,
    open: true,
  },
});
