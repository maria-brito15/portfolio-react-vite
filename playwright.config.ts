// Testes de ponta a ponta: sobem o Vite e abrem o site no Chrome já instalado
// (sem baixar navegadores). `npm run e2e`; capturas de tela em e2e/shots/.
import { defineConfig } from '@playwright/test';

const PORT = 5199;

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.e2e.ts',
  outputDir: 'test-results',
  timeout: 60_000,
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: `http://localhost:${PORT}`, channel: 'chrome' },
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
