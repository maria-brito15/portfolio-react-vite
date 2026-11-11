// `git log` / `evolucao`: a linha do tempo de habilidades (`skillTimeline`) do
// ano mais recente ao mais antigo. Tecnologia sem ano informado (`since: null`)
// fica de fora da linha do tempo e é só contada: nada de data inventada.
import type { Lang, Localized } from '../../types';
import { skillTimeline, type SkillGroup } from '../../data/skillTimeline';
import { fold } from '../../data/routes';
import type { Command } from '../commands';
import { Cmd } from '../outputs';

const L = (pt: string, en: string): Localized => ({ pt, en });

export interface LogEntry {
  name: string;
  source?: string;
}
export interface SkillLog {
  years: { year: number; items: LogEntry[] }[];
  undated: string[];
}

export function skillLog(groups: SkillGroup[], lang: Lang): SkillLog {
  const byYear = new Map<number, LogEntry[]>();
  const undated: string[] = [];

  for (const { name, since, source } of groups.flatMap((g) => g.items)) {
    if (!since) {
      undated.push(name);
      continue;
    }

    const src = source && typeof source === 'object' ? source[lang] : source;

    byYear.set(since, [...(byYear.get(since) ?? []), { name, source: src }]);
  }

  return {
    years: [...byYear.entries()]
      .sort(([a], [b]) => b - a)
      .map(([year, items]) => ({ year, items })),
    undated,
  };
}

export const gitlog: Command = {
  names: ['evolucao', 'git'],
  aliases: ['log'],
  desc: L(
    'evolução das habilidades por ano (também: git log)',
    'skills evolution by year (git log)',
  ),
  run: (args) => {
    // `git log` (ou só `evolucao`); outro subcomando do git ensina o certo.
    if (args.length && fold(args[0]) !== 'log') {
      return {
        output: (lang) => (
          <p className="t-err">
            {`git: '${args[0]}' `}
            {lang === 'pt' ? 'não é um comando daqui. Tente ' : 'is not a command here. Try '}
            <Cmd>git log</Cmd>
          </p>
        ),
      };
    }

    return {
      output: (lang) => {
        const { years, undated } = skillLog(skillTimeline, lang);

        return (
          <div>
            <dl className="t-kv t-gitlog">
              {years.map(({ year, items }) => (
                <div key={year}>
                  <dt>{year}</dt>
                  <dd>
                    {items.map((item, i) => (
                      <span key={item.name}>
                        {i > 0 && <span className="t-dim"> · </span>}
                        {item.name}
                        {item.source && <span className="t-dim"> ({item.source})</span>}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
            {undated.length > 0 && (
              <p className="t-dim">
                {lang === 'pt'
                  ? `${undated.length} sem ano informado (fora da linha do tempo): `
                  : `${undated.length} without a start year (off the timeline): `}
                {undated.join(', ')}
              </p>
            )}
          </div>
        );
      },
    };
  },
};
