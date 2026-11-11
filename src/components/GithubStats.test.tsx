import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '../i18n/LanguageContext';
import GithubStats from './GithubStats';
import { summarize } from '../services/github';

const user = { public_repos: 12, followers: 3, created_at: '2023-05-01T00:00:00Z' };
const repo = (
  language: string | null,
  stars = 0,
  fork = false,
  pushed = '2026-01-01T00:00:00Z',
) => ({
  fork,
  archived: false,
  stargazers_count: stars,
  language,
  pushed_at: pushed,
});

const json = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });

function mockApi(contrib: unknown = { total: { lastYear: 420 } }) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (url.includes('/repos'))
        return json([
          repo('TypeScript', 2),
          repo('TypeScript', 1),
          repo('Java', 0),
          repo('Go', 9, true),
        ]);
      if (url.includes('api.github.com')) return json(user);

      return contrib ? json(contrib) : Promise.reject(new Error('down'));
    }),
  );
}

const ui = (compact = false) =>
  render(
    <LanguageProvider>
      <GithubStats compact={compact} />
    </LanguageProvider>,
  );

describe('summarize', () => {
  it('ignora forks, soma estrelas próprias e ordena linguagens', () => {
    const s = summarize(
      user,
      [repo('Java'), repo('TypeScript', 2), repo('TypeScript', 1), repo('Go', 9, true)],
      null,
    );

    expect(s.stars).toBe(3);
    expect(s.languages).toEqual([
      { name: 'TypeScript', repos: 2 },
      { name: 'Java', repos: 1 },
    ]);
    expect(s.repos).toBe(12);
    expect(s.since).toBe(2023);
    expect(s.contributions).toBeNull();
  });
});

describe('GithubStats', () => {
  it('carrega e mostra os números reais da API', async () => {
    mockApi();
    ui();
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(await screen.findByText('420')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('só a métrica de contribuições fica indisponível se o serviço dela cair', async () => {
    mockApi(null);
    ui();
    expect(await screen.findByText('indisponível')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('mostra erro e permite tentar de novo', async () => {
    const u = userEvent.setup();

    ui();
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível');
    mockApi();
    await u.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('420')).toBeInTheDocument();
  });

  it('versão compacta (terminal) usa os mesmos dados', async () => {
    mockApi();
    ui(true);
    expect(await screen.findByText('420')).toBeInTheDocument();
    expect(screen.getByText(/TypeScript \(2\)/)).toBeInTheDocument();
  });
});
