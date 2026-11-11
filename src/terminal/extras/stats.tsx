// `stats`: dados reais do próprio site, injetados no build (commits, versão e
// hora do build). Sem dado, diz "indisponível"; nunca um número escrito à mão.
import type { Lang, Localized } from '../../types';
import { buildInfo, type BuildInfo } from '../../data/build';
import type { Command } from '../commands';

const L = (pt: string, en: string): Localized => ({ pt, en });

export function statsRows(info: BuildInfo, lang: Lang): [string, string][] {
  const missing = lang === 'pt' ? 'indisponível' : 'unavailable';
  const label = (pt: string, en: string) => (lang === 'pt' ? pt : en);
  // Sem hora de build é o servidor de desenvolvimento (`npm run dev`).
  const builtAt = info.builtAt
    ? new Date(info.builtAt).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')
    : label('dev (sem build)', 'dev (no build)');

  return [
    [label('commits', 'commits'), info.commits === null ? missing : String(info.commits)],
    [label('versão', 'version'), info.version ?? missing],
    [label('build', 'build'), builtAt],
  ];
}

export const stats: Command = {
  names: ['stats', 'stats'],
  desc: L(
    'dados reais do site: commits, versão e build',
    'real site data: commits, version, build',
  ),
  run: () => ({
    output: (lang) => (
      <div>
        <dl className="t-kv">
          {statsRows(buildInfo, lang).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="t-dim">
          {lang === 'pt'
            ? 'lidos do repositório no momento do build.'
            : 'read from the repository at build time.'}
        </p>
      </div>
    ),
  }),
};
