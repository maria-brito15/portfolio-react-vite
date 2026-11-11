import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { seoPlugin } from './scripts/seoPlugin';

export default defineConfig({
  plugins: [react(), seoPlugin()],
  build: {
    // JS e CSS com hash vão para /static (cache imutável); /assets guarda só as
    // imagens fixas (foto, imagem de compartilhamento), que não levam hash.
    assetsDir: 'static',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    // As páginas renderizam o site inteiro (jsdom); em máquinas lentas 5 s não bastam.
    testTimeout: 20000,
  },
});
