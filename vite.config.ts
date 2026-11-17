import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { seoPlugin } from './scripts/seoPlugin';
import { buildInfo } from './scripts/buildInfo';
import { personalGuardPlugin } from './scripts/personalGuard';
import { contentGuardPlugin } from './scripts/contentGuard';
import { secretGuardPlugin } from './scripts/secretGuard';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    seoPlugin(),
    personalGuardPlugin(),
    contentGuardPlugin(),
    secretGuardPlugin(),
  ],
  // Dados reais do build para o comando `stats` (src/data/build.ts).
  define: { __BUILD__: JSON.stringify(buildInfo(command)) },
  build: {
    // JS e CSS com hash vão para /static (cache imutável); /assets guarda só as
    // imagens fixas (foto, imagem de compartilhamento), que não levam hash.
    assetsDir: 'static',
  },
  test: {
    globals: true,
    css: false,
    // Cada arquivo roda numa VM dentro de um worker: bem mais rápido que `forks` com a suíte de
    // jsdom (medição E5: 91 a 112 s, 0 falhas). Plano B se algo quebrar: `forks` com `isolate`.
    pool: 'vmThreads',
    // As páginas renderizam o site inteiro (jsdom); em máquinas lentas 5 s não bastam.
    testTimeout: 20000,
    exclude: ['node_modules', 'dist', 'e2e'],
    // Dois projetos (TD-008): `unit` roda em Node, sem jsdom nem o `setup.ts` de DOM; `dom` roda
    // as páginas e componentes (`.test.tsx`) em jsdom, com o `setup.ts`. Um `.test.ts` que precise
    // de DOM declara `// @vitest-environment jsdom` na primeira linha (hoje nenhum precisa).
    projects: [
      {
        extends: true,
        test: { name: 'unit', environment: 'node', include: ['**/*.test.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['**/*.test.tsx'],
          setupFiles: './src/test/setup.js',
        },
      },
    ],
  },
}));
