// Números do GitHub (src/services/github.ts) com carregando, erro e "tentar de
// novo". `compact` é a versão do terminal (comando `stats`); `summary` é o
// resumo do painel inicial (números, linguagens e link para a página do
// GitHub); sem nenhum dos dois, é o painel completo (Sobre e /github). Mesmos
// dados e mesmos estados nos três.
import { useLanguage } from '../i18n/LanguageContext';
import { useGithubStats } from '../hooks/useGithubStats';
import { Link } from '../router';
import { GITHUB_USER, type GithubStats as Data } from '../services/github';
import { profile } from '../data/profile';
import { routeById } from '../data/routes';
import Card from './ui/Card';
import SectionTitle from './ui/SectionTitle';

type Text = ReturnType<typeof useLanguage>['t']['github'];

function metrics(data: Data, g: Text, locale: string): [string, string][] {
  const n = (v: number | null) => (v === null ? g.unavailable : v.toLocaleString(locale));

  return [
    [n(data.repos), g.repos],
    [n(data.stars), g.stars],
    [n(data.contributions), g.contributions],
    [n(data.followers), g.followers],
  ];
}

function Languages({ data, g }: { data: Data; g: Text }) {
  const total = data.languages.reduce((sum, l) => sum + l.repos, 0);

  if (!total) return null;

  return (
    <div className="gh-langs">
      <div className="lbl">{g.languages}</div>
      <ul className="gh-lang-list">
        {data.languages.map((l) => (
          <li key={l.name}>
            <span className="gh-lang-name">{l.name}</span>
            <span className="gh-bar" aria-hidden="true">
              <span style={{ width: `${Math.round((l.repos / total) * 100)}%` }} />
            </span>
            <span className="gh-lang-n">
              {Math.round((l.repos / total) * 100)}% · {g.repoCount(l.repos)}
            </span>
          </li>
        ))}
      </ul>
      <p className="gh-meta">{g.languagesNote}</p>
    </div>
  );
}

function Body({ compact, summary }: { compact: boolean; summary: boolean }) {
  const { lang, t } = useLanguage();
  const g = t.github;
  const { state, retry } = useGithubStats();
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';

  if (state.status === 'loading')
    return (
      <p className="gh-status" role="status">
        {g.loading}
      </p>
    );

  if (state.status === 'error')
    return (
      <p className="gh-status" role="alert">
        {g.error}{' '}
        <button type="button" className="gh-retry" onClick={retry}>
          {g.retry}
        </button>
      </p>
    );

  const { data } = state;
  const lastPush = data.lastPush
    ? new Date(data.lastPush).toLocaleDateString(locale, { month: 'short', year: 'numeric' })
    : g.unavailable;

  if (compact)
    return (
      <dl className="t-kv">
        {metrics(data, g, locale).map(([value, label]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <div>
          <dt>{g.languages}</dt>
          <dd>
            {data.languages.length
              ? data.languages.map((l) => `${l.name} (${l.repos})`).join(' · ')
              : g.unavailable}
          </dd>
        </div>
        <div>
          <dt>{g.lastPush}</dt>
          <dd>{lastPush}</dd>
        </div>
      </dl>
    );

  if (summary)
    return (
      <>
        <ul className="gh-metrics">
          {metrics(data, g, locale).map(([value, label]) => (
            <li key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </li>
          ))}
        </ul>
        <p className="gh-meta">
          {data.languages.length > 0 && `${data.languages.map((l) => l.name).join(' · ')} — `}
          {g.lastPush} {lastPush}
        </p>
      </>
    );

  return (
    <>
      <ul className="gh-metrics">
        {metrics(data, g, locale).map(([value, label]) => (
          <li key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <Languages data={data} g={g} />
      <p className="gh-meta">
        {g.since} {data.since} · {g.lastPush} {lastPush}
      </p>
    </>
  );
}

export default function GithubStats({
  compact = false,
  summary = false,
}: {
  compact?: boolean;
  summary?: boolean;
}) {
  const { t } = useLanguage();
  const g = t.github;

  if (compact)
    return (
      <div>
        <Body compact summary={false} />
        <p className="t-dim">
          {g.source} · @{GITHUB_USER}
        </p>
      </div>
    );

  if (summary)
    return (
      <section className="gh-section gh-summary" aria-labelledby="github-title">
        <SectionTitle as="h2" id="github-title" label={g.label} size="md">
          {g.title}
        </SectionTitle>
        <Card className="gh-card">
          <Body compact={false} summary />
        </Card>
        <p className="gh-source">
          <Link to={routeById('github')?.path ?? '/github'}>{t.ws.home.githubMore}</Link>
        </p>
      </section>
    );

  return (
    <section className="gh-section" aria-labelledby="github-title">
      <SectionTitle as="h2" id="github-title" label={g.label} size="md">
        {g.title}
      </SectionTitle>
      <Card className="gh-card" aria-busy={false}>
        <Body compact={false} summary={false} />
      </Card>
      <p className="gh-source">
        {g.source} ·{' '}
        <a href={profile.github} target="_blank" rel="noopener noreferrer">
          {g.profile}
        </a>
      </p>
    </section>
  );
}
