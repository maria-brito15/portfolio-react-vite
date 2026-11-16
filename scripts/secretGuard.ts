// Trava do build contra segredo no navegador (FR-016, design §7 e TD-011). Três checagens:
// (a) variável `VITE_*` com nome de segredo; (b) o VALOR de uma variável secreta do ambiente
// dentro do bundle; (c) os padrões de credencial no bundle. A mensagem nunca traz o valor.
import { loadEnv, type Plugin } from 'vite';
import {
  PUBLIC_BY_DESIGN,
  SECRET_NAME,
  formatEnvFinding,
  formatFinding,
  publicEnvFindings,
  scanText,
} from './secretScan';

export const MIN_SECRET_VALUE_LENGTH = 8;

export interface BundleFile {
  fileName: string;
  text: string;
}

/** Variáveis do ambiente cujo nome sugere segredo e cujo valor é longo o bastante para ser achado. */
export function secretValues(env: Record<string, string | undefined>): [string, string][] {
  return Object.entries(env).flatMap(([name, value]): [string, string][] =>
    value !== undefined &&
    value.length >= MIN_SECRET_VALUE_LENGTH &&
    SECRET_NAME.test(name) &&
    !PUBLIC_BY_DESIGN.includes(name)
      ? [[name, value]]
      : [],
  );
}

/** Todos os problemas, já em texto (§6.4): nomes de variável, valores no bundle e padrões. */
export function guardProblems({
  publicEnvNames,
  files,
  env,
}: {
  publicEnvNames: Iterable<string>;
  files: readonly BundleFile[];
  env: Record<string, string | undefined>;
}): string[] {
  const problems = publicEnvFindings(publicEnvNames).map(formatEnvFinding);
  const secrets = secretValues(env);

  for (const { fileName, text } of files) {
    for (const [name, value] of secrets) {
      if (text.includes(value)) {
        problems.push(
          `segredo: ${fileName} — valor da variável secreta ${name} apareceu no bundle.`,
        );
      }
    }
    problems.push(...scanText(text, fileName).map(formatFinding));
  }

  return problems;
}

export function assertNoSecrets(input: Parameters<typeof guardProblems>[0]): void {
  const problems = guardProblems(input);

  if (problems.length > 0) throw new Error(['secretGuard:', ...problems].join('\n'));
}

export function secretGuardPlugin(): Plugin {
  let names: string[] = [];
  let env: Record<string, string | undefined> = {};
  let outDir = 'dist';

  return {
    name: 'portfolio-secret-guard',
    // Só no build: o dev server e o Vitest não geram bundle.
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
      // `config.env` traz as VITE_* que vão ao navegador. O ambiente completo (arquivos `.env`
      // e variáveis do sistema) entra só para conferir os VALORES secretos.
      names = Object.keys(config.env).filter((name) => name.startsWith('VITE_'));
      env = { ...loadEnv(config.mode, config.envDir || config.root, ''), ...process.env };
      assertNoSecrets({ publicEnvNames: names, files: [], env });
    },
    generateBundle(_options, bundle) {
      const files: BundleFile[] = Object.values(bundle).flatMap((item) => {
        const content = item.type === 'chunk' ? item.code : item.source;
        const text = typeof content === 'string' ? content : Buffer.from(content).toString('utf8');

        return [{ fileName: `${outDir}/${item.fileName}`, text }];
      });

      assertNoSecrets({ publicEnvNames: [], files, env });
    },
  };
}
