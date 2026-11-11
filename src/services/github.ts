// Estatísticas públicas do GitHub, lidas ao vivo no navegador. Repositórios,
// estrelas e linguagens vêm da API REST oficial (sem token); o total de
// contribuições não existe na REST, então vem de um serviço público que lê o
// gráfico do perfil. Se ele falhar, só essa métrica fica `null`: nunca se
// escreve um número à mão.

export const GITHUB_USER = 'maria-brito15';

const API = 'https://api.github.com';
const CONTRIBUTIONS_API = 'https://github-contributions-api.jogruber.de/v4';
const CACHE_KEY = `github-stats:${GITHUB_USER}`;
const CACHE_TTL_MS = 60 * 60 * 1000;
const TOP_LANGUAGES = 5;

export interface GithubLanguage {
  name: string;
  repos: number;
}

export interface GithubStats {
  repos: number;
  stars: number;
  followers: number;
  since: number;
  contributions: number | null;
  languages: GithubLanguage[];
  lastPush: string | null;
}

interface ApiUser {
  public_repos: number;
  followers: number;
  created_at: string;
}

interface ApiRepo {
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  language: string | null;
  pushed_at: string | null;
}

// Linguagem principal de cada repositório próprio (forks não contam).
export function summarize(
  user: ApiUser,
  repos: ApiRepo[],
  contributions: number | null,
): GithubStats {
  const own = repos.filter((r) => !r.fork);
  const counts = new Map<string, number>();

  for (const r of own) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);

  const languages = [...counts]
    .map(([name, n]) => ({ name, repos: n }))
    .sort((a, b) => b.repos - a.repos || a.name.localeCompare(b.name))
    .slice(0, TOP_LANGUAGES);
  const pushes = own.map((r) => r.pushed_at).filter((d): d is string => Boolean(d));

  return {
    repos: user.public_repos,
    stars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
    followers: user.followers,
    since: new Date(user.created_at).getFullYear(),
    contributions,
    languages,
    lastPush: pushes.length ? pushes.reduce((a, b) => (a > b ? a : b)) : null,
  };
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return (await res.json()) as T;
}

async function fetchContributions(signal?: AbortSignal): Promise<number | null> {
  try {
    const data = await getJson<{ total?: Record<string, number> }>(
      `${CONTRIBUTIONS_API}/${GITHUB_USER}?y=last`,
      signal,
    );
    const total = data.total?.lastYear;

    return typeof total === 'number' ? total : null;
  } catch {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    return null;
  }
}

function readCache(): GithubStats | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);

    if (!raw) return null;

    const { at, data } = JSON.parse(raw) as { at: number; data: GithubStats };

    return Date.now() - at < CACHE_TTL_MS ? data : null;
  } catch {
    return null;
  }
}

function writeCache(data: GithubStats) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Sem armazenamento (navegação privada): só perde o cache.
  }
}

export async function fetchGithubStats(signal?: AbortSignal): Promise<GithubStats> {
  const cached = readCache();

  if (cached) return cached;

  const [user, repos, contributions] = await Promise.all([
    getJson<ApiUser>(`${API}/users/${GITHUB_USER}`, signal),
    getJson<ApiRepo[]>(`${API}/users/${GITHUB_USER}/repos?per_page=100&type=owner`, signal),
    fetchContributions(signal),
  ]);
  const data = summarize(user, repos, contributions);

  writeCache(data);

  return data;
}
