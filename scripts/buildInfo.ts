// Dados reais do build, injetados pelo Vite como `__BUILD__` (CE-02): número de
// commits, versão do package.json e hora do build. Nada é escrito à mão; quando
// o git não está disponível (ex.: download do código em .zip), o campo vira
// `null` e o comando `stats` diz "indisponível".
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface BuildInfo {
  commits: number | null;
  version: string | null;
  // Só existe em `vite build`; no servidor de desenvolvimento é `null`.
  builtAt: string | null;
}

export function commitCount(cwd = process.cwd()): number | null {
  try {
    const out = execSync('git rev-list --count HEAD', {
      cwd,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    const count = Number(out);

    return Number.isInteger(count) && count > 0 ? count : null;
  } catch {
    return null;
  }
}

export function packageVersion(cwd = process.cwd()): string | null {
  try {
    const { version } = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));

    return typeof version === 'string' ? version : null;
  } catch {
    return null;
  }
}

export function buildInfo(command: 'build' | 'serve', cwd = process.cwd()): BuildInfo {
  return {
    commits: commitCount(cwd),
    version: packageVersion(cwd),
    builtAt: command === 'build' ? new Date().toISOString() : null,
  };
}
