// Versão MAIOR instalada de cada pacote do elenco (FR-037, TD-020), lida de
// `node_modules/<nome>/package.json` no build e injetada como `__CAST__`. Pacote ausente vira
// `null`: o rodapé mostra só o nome, nunca uma versão inventada.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type CastVersions = Record<string, number | null>;

export function installedMajor(pkg: string, cwd = process.cwd()): number | null {
  try {
    const { version } = JSON.parse(
      readFileSync(join(cwd, 'node_modules', pkg, 'package.json'), 'utf8'),
    );
    const major = typeof version === 'string' ? Number.parseInt(version, 10) : Number.NaN;

    return Number.isInteger(major) ? major : null;
  } catch {
    return null;
  }
}

export function castVersions(packages: readonly string[], cwd = process.cwd()): CastVersions {
  return Object.fromEntries(packages.map((pkg) => [pkg, installedMajor(pkg, cwd)]));
}
