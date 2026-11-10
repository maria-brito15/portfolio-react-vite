import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    // As páginas renderizam o site inteiro (jsdom); em máquinas lentas 5 s não bastam.
    testTimeout: 20000,
  },
});
