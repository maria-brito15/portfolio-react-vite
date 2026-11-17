// Visão em terminal do espaço cultural (comando `pessoal`, ver `personal.tsx`). Fica em arquivo
// próprio, carregado sob demanda: o comando entra no JS inicial, mas esta visão, que traz o hook,
// as fontes de dados e os formatadores, só é baixada quando alguém roda `pessoal`.
import type { ReactNode } from 'react';
import type { Lang } from '../../types';
import { personalEn, personalPt } from '../../i18n/personal';
import { routeById, routeSegment, routes, type Route } from '../../data/routes';
import {
  formatDay,
  formatRating,
  groupByMonth,
  groupByYear,
  groupByYearOf,
} from '../../data/personal/review';
import type { PersonalState } from '../../hooks/usePersonal';
import {
  usePersonalAlbums,
  usePersonalBooks,
  usePersonalFilms,
  usePersonalTheater,
} from '../../hooks/usePersonal';
import PlaceholderBadge from '../../components/personal/PlaceholderBadge';
import { ActionLine } from '../outputs';
import { RunCommand } from '../pageIndex';

// Textos do terminal no idioma atual (ficam neste chunk lazy, fora do JS inicial).
const termText = (lang: Lang) => (lang === 'pt' ? personalPt : personalEn).term;

// Quantas linhas cada seção mostra no terminal; o resto fica na página própria.
const MAX_LINES = 8;

const HUB = 'pessoal';
const sections = () => routes.filter((r) => r.parent === HUB);

function Index({ lang, error }: { lang: Lang; error?: string }) {
  const text = termText(lang);
  const name = lang === 'pt' ? 'pessoal' : 'personal';

  return (
    <div>
      {error && <p className="t-err">{error}</p>}
      <p className="t-dim">{error ? '' : text.pick}</p>
      <ul className="t-index-list">
        {sections().map((route, i) => (
          <li key={route.id}>
            <RunCommand command={`${name} ${routeSegment(route, lang)}`}>
              <span className="t-ok">[{i + 1}]</span>
              <span className="t-accent">{routeSegment(route, lang)}</span>
              <span className="t-dim">{route.desc?.[lang]}</span>
            </RunCommand>
          </li>
        ))}
      </ul>
      <ActionLine routeId={HUB} />
    </div>
  );
}

// Carregando e erro (com o comando para tentar de novo); pronto entrega o feed.
function Lines<T>({
  state,
  routeId,
  lang,
  lines,
}: {
  state: PersonalState<T>;
  routeId: string;
  lang: Lang;
  lines: (items: T[]) => ReactNode[];
}) {
  const text = termText(lang);
  const route = routeById(routeId) as Route;

  if (state.status === 'loading') return <p className="t-dim">{text.loading}</p>;

  if (state.status === 'error')
    return (
      <p className="t-err">
        {text.error}{' '}
        <RunCommand
          command={`${lang === 'pt' ? 'pessoal' : 'personal'} ${routeSegment(route, lang)}`}
        >
          {routeSegment(route, lang)}
        </RunCommand>
      </p>
    );

  const { feed } = state;
  const rows = lines(feed.items);

  return (
    <div>
      <PlaceholderBadge source={feed.source} />
      {rows.length === 0 ? (
        <p className="t-dim">{text.empty}</p>
      ) : (
        <ul>
          {rows.slice(0, MAX_LINES).map((row, i) => (
            <li key={i}>{row}</li>
          ))}
        </ul>
      )}
      <p className="t-dim">
        {text.showing(Math.min(rows.length, MAX_LINES), rows.length)} · {text.openPage}
      </p>
    </div>
  );
}

const dim = (text: string) => <span className="t-dim">{text}</span>;

function Books({ lang }: { lang: Lang }) {
  const { state } = usePersonalBooks();

  return (
    <Lines
      state={state}
      routeId="pessoal-livros"
      lang={lang}
      lines={(items) => {
        const read = groupByYear(items.filter((b) => b.status === 'read')).flatMap((g) => g.items);
        const ordered = [
          ...items.filter((b) => b.status === 'reading'),
          ...read,
          ...items.filter((b) => b.status !== 'reading' && b.status !== 'read'),
        ];

        return ordered.map((b) => (
          <>
            {b.title} {dim(`— ${b.authors.join(', ')}`)}
            {b.rating !== undefined && ` ${formatRating(b.rating, lang).stars}`}
          </>
        ));
      }}
    />
  );
}

function Films({ lang }: { lang: Lang }) {
  const { state } = usePersonalFilms();

  return (
    <Lines
      state={state}
      routeId="pessoal-filmes"
      lang={lang}
      lines={(items) =>
        groupByMonth(items)
          .flatMap((g) => g.items)
          .map((f) => {
            const day = f.watchedDate ? formatDay(f.watchedDate, lang) : '';

            return (
              <>
                {f.rating === undefined ? '—' : formatRating(f.rating, lang).stars} {f.title}
                {f.year !== undefined && ` (${f.year})`} {day && dim(`· ${day}`)}
              </>
            );
          })
      }
    />
  );
}

function Music({ lang }: { lang: Lang }) {
  const { state } = usePersonalAlbums();

  return (
    <Lines
      state={state}
      routeId="pessoal-musica"
      lang={lang}
      lines={(items) =>
        [...items.filter((a) => a.inRotation), ...items.filter((a) => !a.inRotation)].map((a) => (
          <>
            {a.title} {dim(`— ${a.artist}${a.year === undefined ? '' : ` (${a.year})`}`)}
          </>
        ))
      }
    />
  );
}

function Theater({ lang }: { lang: Lang }) {
  const { state } = usePersonalTheater();

  return (
    <Lines
      state={state}
      routeId="pessoal-teatro"
      lang={lang}
      lines={(items) =>
        groupByYearOf(items, (v) => v.date)
          .flatMap((g) => g.items)
          .map((v) => {
            const where = [v.company, v.venue, v.city].filter(Boolean).join(' · ');
            const day = v.date ? formatDay(v.date, lang) : '';

            return (
              <>
                {v.title} {dim([where, day].filter(Boolean).join(' · '))}
              </>
            );
          })
      }
    />
  );
}

const VIEWS: Record<string, (props: { lang: Lang }) => ReactNode> = {
  'pessoal-livros': Books,
  'pessoal-filmes': Films,
  'pessoal-musica': Music,
  'pessoal-teatro': Theater,
};

function SectionView({ route, lang }: { route: Route; lang: Lang }) {
  const View = VIEWS[route.id];

  return (
    <div>
      <p className="t-accent">{routeSegment(route, lang)}</p>
      <View lang={lang} />
      <ActionLine routeId={route.id} />
    </div>
  );
}

// `routeId`: a seção pedida; sem ele, o índice. `unknown`: o que a pessoa digitou e não existe
// (o índice reaparece com o erro, para reensinar).
export default function PersonalView({
  lang,
  routeId,
  unknown,
}: {
  lang: Lang;
  routeId?: string;
  unknown?: string;
}) {
  const route = routeId ? routeById(routeId) : undefined;

  if (route) return <SectionView route={route} lang={lang} />;

  return <Index lang={lang} error={unknown ? termText(lang).unknown(unknown) : undefined} />;
}
