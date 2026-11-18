// Testes de ponta a ponta no Chrome já instalado (sem baixar navegadores). `npm run e2e`; capturas
// de tela em e2e/shots/. Dois projetos (spec 002, T5.2):
//  - `site`: os e2e das páginas, sobre o servidor de desenvolvimento do Vite;
//  - `shell`: os e2e da casca, sobre o `dist-prova` servido como a Netlify serve (scripts/serveDist.mjs).
//    Precisa de `npm run build:prova` antes; sem a pasta, o projeto `shell` não sobe o servidor.
import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const PORT = 5199;
const PROVA_PORT = 5197;
const hasProva = existsSync('dist-prova');

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  timeout: 60_000,
  fullyParallel: true,
  reporter: 'list',
  use: { channel: 'chrome' },
  projects: [
    {
      name: 'site',
      testMatch: 'site.e2e.ts',
      use: { baseURL: `http://localhost:${PORT}` },
    },
    {
      name: 'shell',
      testMatch: 'shell.e2e.ts',
      use: { baseURL: `http://localhost:${PROVA_PORT}` },
    },
  ],
  webServer: [
    {
      command: `npx vite --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: true,
      timeout: 60_000,
    },
    ...(hasProva
      ? [
          {
            command: `node scripts/serveDist.mjs dist-prova ${PROVA_PORT}`,
            url: `http://localhost:${PROVA_PORT}/_prova`,
            reuseExistingServer: true,
            timeout: 30_000,
          },
        ]
      : []),
  ],
});
