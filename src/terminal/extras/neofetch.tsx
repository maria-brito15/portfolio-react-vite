// `neofetch`: monograma ASCII ao lado de campos do "sistema" da Duda. Todo
// campo vem dos dados do site (nome, cargo, local, idioma, tema e a linha do
// tempo de habilidades); nenhum valor é escrito à mão aqui.
import type { Lang, Localized } from '../../types';
import { portfolio } from '../../data/portfolio';
import { formatSince, skillTimeline } from '../../data/skillTimeline';
import { themes } from '../../data/themes';
import type { Command } from '../commands';
import { initialsOf, monogram } from './ascii';

const L = (pt: string, en: string): Localized => ({ pt, en });

// Tecnologias com ano de início e o ano mais antigo entre elas.
export function stackFacts() {
  const dated = skillTimeline.flatMap((g) => g.items).filter((i) => i.since);

  return {
    count: dated.length,
    since: dated.length ? Math.min(...dated.map((i) => i.since as number)) : null,
  };
}

export function neofetchRows(lang: Lang, theme: string, today = new Date()) {
  const about = portfolio[lang].about;
  const { count, since } = stackFacts();
  const label = (pt: string, en: string) => (lang === 'pt' ? pt : en);

  return [
    [label('nome', 'name'), about.name],
    [label('cargo', 'role'), about.role],
    [label('local', 'location'), about.location],
    [label('idiomas', 'languages'), about.languages],
    [label('interface', 'interface'), lang === 'pt' ? 'português' : 'English'],
    [label('tema', 'theme'), themes.find((t) => t.id === theme)?.names[lang] ?? theme],
    [
      label('stack', 'stack'),
      label(`${count} tecnologias com data`, `${count} technologies with a start date`),
    ],
    [label('desde', 'since'), since ? `${since} (${formatSince(since, lang, today)})` : '—'],
  ] as const;
}

export const neofetch: Command = {
  names: ['neofetch', 'neofetch'],
  desc: L('o "sistema" da Duda, em ASCII', "Duda's “system”, in ASCII"),
  run: (_args, ctx) => ({
    output: (lang) => {
      const art = monogram(initialsOf(portfolio[lang].hero.terminal.name));

      return (
        <div className="t-neofetch">
          <pre className="t-ascii t-accent" aria-hidden="true">
            {art.join('\n')}
          </pre>
          <div className="t-neofetch-info">
            <p className="t-accent">visitante@mariab.dev</p>
            <p className="t-dim">{'-'.repeat(20)}</p>
            <dl className="t-kv">
              {neofetchRows(lang, ctx.theme).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      );
    },
  }),
};
