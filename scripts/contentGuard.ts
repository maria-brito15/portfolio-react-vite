// Trava do build: conteúdo inválido derruba `vite build` (FR-012, design TD-003). O teste do
// `verify` dá a mensagem boa; este plugin é o ponto que o deploy da Netlify atravessa
// (ela roda `npm run build`, não o Vitest).
import { join } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import { registry as realRegistry, type RegistryEntry } from '../src/content/registry';
import { reportLines, validateAll, type ValidateOptions } from './contentValidator';

/** Lança um erro com as linhas do §6.2 (as mesmas do validador) se houver qualquer problema. */
export function assertContentValid(
  registry: readonly RegistryEntry[],
  options: ValidateOptions,
): void {
  const problems = validateAll(registry, options);

  if (problems.length > 0) throw new Error(['contentGuard:', ...reportLines(problems)].join('\n'));
}

export function contentGuardPlugin(registry: readonly RegistryEntry[] = realRegistry): Plugin {
  let config: Pick<ResolvedConfig, 'root'>;

  return {
    name: 'portfolio-content-guard',
    // Só no build: no dev server e no Vitest a validação é do teste.
    apply: 'build',
    configResolved(resolved) {
      config = resolved;
    },
    buildStart() {
      assertContentValid(registry, {
        publicDir: join(config.root, 'public'),
        contentDir: join(config.root, 'src', 'content'),
        rootDir: config.root,
      });
    },
  };
}
