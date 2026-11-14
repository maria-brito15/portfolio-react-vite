// Cliente servidor do Hardcover (docs/specs/personal/hardcover.md). Um `fetch` tipado e pequeno,
// sem SDK: duas consultas GraphQL bastam, o endpoint e o formato do Bearer são estáveis e o
// projeto não adiciona dependência sem necessidade. Tudo o que vem de fora (token, `fetch`, relógio,
// espera) entra por `deps`, então os testes rodam sem rede. O token nunca aparece em mensagem de
// erro, em resposta nem em log.
//
// Limites documentados pelo Hardcover (fonte: documentação oficial, página User Books, e guias
// da comunidade [A]): endpoint `https://api.hardcover.app/v1/graphql`, ~60 requisições por minuto,
// timeout de 30 s e profundidade máxima de consulta 3. Por isso o cliente faz duas consultas
// rasas (`me`, depois `user_books`) e não uma só aninhada.
import type { Book, Rating } from '../../src/data/personal/types';

export const HARDCOVER_ENDPOINT = 'https://api.hardcover.app/v1/graphql';
export const HARDCOVER_SITE = 'https://hardcover.app';

export type HardcoverErrorKind =
  'auth' | 'rate' | 'timeout' | 'network' | 'http' | 'graphql' | 'shape';

export class HardcoverError extends Error {
  readonly kind: HardcoverErrorKind;
  readonly status?: number;

  // Campos explícitos (sem "parameter properties"): o script de sondagem importa este arquivo direto
  // no Node, que só remove tipos e não transforma essa sintaxe.
  constructor(kind: HardcoverErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'HardcoverError';
    this.kind = kind;
    this.status = status;
  }
}

// ---------------------------------------------------------------- consultas

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

const ME_QUERY = 'query Me { me { id username } }';

// Nível 1: tudo o que a página usa. Nível 2: o mínimo que sempre existe. Se o Hardcover recusar um
// campo do nível 1 (esquema mudou ou o nome estava errado), o cliente cai no nível 2 em vez de
// derrubar a página: leva-se menos informação, nunca informação inventada.
const FULL_FIELDS = `
  id
  status_id
  rating
  review_raw
  date_added
  first_started_reading_date
  last_read_date
  book { id slug title pages cached_image cached_contributors }
  user_book_reads(order_by: { id: desc }, limit: 1) {
    started_at
    finished_at
    progress_pages
    progress
  }`;

const MINIMAL_FIELDS = `
  id
  status_id
  rating
  book { id slug title pages }`;

const booksQuery = (fields: string) =>
  `query UserBooks($userId: Int!, $limit: Int!, $offset: Int!) {
  user_books(where: { user_id: { _eq: $userId } }, order_by: { id: asc }, limit: $limit, offset: $offset) {${fields}
  }
}`;

export const BOOKS_QUERIES = [booksQuery(FULL_FIELDS), booksQuery(MINIMAL_FIELDS)] as const;

// ---------------------------------------------------------------- tipos da resposta

export interface RawRead {
  started_at?: string | null;
  finished_at?: string | null;
  progress_pages?: number | null;
  progress?: number | null;
}

export interface RawUserBook {
  id: number;
  status_id: number;
  rating?: number | null;
  review_raw?: string | null;
  first_started_reading_date?: string | null;
  last_read_date?: string | null;
  book?: {
    id: number;
    slug?: string | null;
    title?: string | null;
    pages?: number | null;
    cached_image?: unknown;
    cached_contributors?: unknown;
  } | null;
  user_book_reads?: RawRead[] | null;
}

// ---------------------------------------------------------------- normalização

// 1 quero ler · 2 lendo · 3 lido · 4 pausado · 5 abandonado · 6 ignorado (fora).
const STATUS: Record<number, Book['status'] | undefined> = {
  1: 'want',
  2: 'reading',
  3: 'read',
  4: 'paused',
  5: 'dnf',
};

// Prioridade ao deduplicar o mesmo livro: o estado mais "ativo" vence.
const PRIORITY: Record<Book['status'], number> = {
  reading: 5,
  read: 4,
  paused: 3,
  dnf: 2,
  want: 1,
};

const MAX_REVIEW = 5000;

// `AAAA-MM-DD` de uma data ou data-hora ISO; qualquer outra coisa vira ausente.
export const toDay = (value: unknown) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : undefined;

// Meia em meia estrela, de 0,5 a 5. Nota ausente ou zero é "sem nota", não nota zero.
export function toRating(value: unknown): Rating | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return undefined;

  const half = Math.round(Math.min(value, 5) * 2) / 2;

  return (half < 0.5 ? 0.5 : half) as Rating;
}

// Só `https:`: nada de `javascript:` ou `data:` vindo de fora virando `src` ou `href`.
const httpsUrl = (value: unknown) =>
  typeof value === 'string' && value.startsWith('https://') ? value : undefined;

const positiveInt = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.round(value) : undefined;

// `cached_image` pode ser um objeto `{ url }` ou o próprio texto.
function coverOf(book: NonNullable<RawUserBook['book']>) {
  const image = book.cached_image;

  if (typeof image === 'string') return httpsUrl(image);
  if (typeof image === 'object' && image !== null)
    return httpsUrl((image as { url?: unknown }).url);

  return undefined;
}

// `cached_contributors`: lista de `{ author: { name } }`, de `{ name }` ou de textos. O que não tem
// nome não entra; nomes repetidos entram uma vez.
function authorsOf(book: NonNullable<RawUserBook['book']>) {
  const raw = book.cached_contributors;
  const names = Array.isArray(raw)
    ? raw.map((c: unknown) => {
        if (typeof c === 'string') return c;
        if (typeof c !== 'object' || c === null) return undefined;

        const item = c as { name?: unknown; author?: { name?: unknown } };

        return item.author?.name ?? item.name;
      })
    : [];

  return [...new Set(names.filter((n): n is string => typeof n === 'string' && n.trim() !== ''))];
}

export function normalizeUserBooks(rows: RawUserBook[], fetchedAt: string): Book[] {
  const byBook = new Map<number, Book>();

  for (const row of rows) {
    const status = STATUS[row.status_id];
    const raw = row.book;

    if (!status || !raw || typeof raw.id !== 'number' || !raw.title?.trim()) continue;

    const read = row.user_book_reads?.[0];
    const pages = positiveInt(raw.pages);
    const progressPages = positiveInt(read?.progress_pages);
    const percent =
      typeof read?.progress === 'number' && read.progress >= 0
        ? Math.min(100, Math.round(read.progress))
        : progressPages && pages
          ? Math.min(100, Math.round((progressPages / pages) * 100))
          : undefined;
    const review = row.review_raw?.trim().slice(0, MAX_REVIEW);
    const slug = raw.slug?.trim();

    const book: Book = {
      id: `hc:${raw.id}`,
      title: raw.title.trim(),
      authors: authorsOf(raw),
      coverUrl: coverOf(raw),
      pages,
      status,
      rating: toRating(row.rating),
      startedAt: toDay(read?.started_at) ?? toDay(row.first_started_reading_date),
      finishedAt:
        status === 'read' ? (toDay(read?.finished_at) ?? toDay(row.last_read_date)) : undefined,
      review: review || undefined,
      provenance: {
        source: 'hardcover',
        url: slug ? `${HARDCOVER_SITE}/books/${encodeURIComponent(slug)}` : undefined,
        fetchedAt,
      },
    };

    if (status === 'reading' && (progressPages || percent !== undefined))
      book.progress = { pages: progressPages, percent };

    const previous = byBook.get(raw.id);

    if (!previous || PRIORITY[status] > PRIORITY[previous.status]) byBook.set(raw.id, book);
  }

  return [...byBook.values()];
}

// ---------------------------------------------------------------- requisição

export interface HardcoverDeps {
  token: string;
  fetchFn?: typeof fetch;
  // Por requisição. O Hardcover aceita até 30 s; a função da Netlify tem menos.
  timeoutMs?: number;
  retries?: number;
  // Orçamento total da leitura (todas as páginas). Estourou: erro, nunca resultado parcial.
  budgetMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

const DEFAULTS = { timeoutMs: 6000, retries: 2, budgetMs: 20_000 };
const MAX_WAIT_MS = 8000;

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// `Retry-After` em segundos (ou data HTTP); limitado para não segurar a função por minutos.
function retryDelay(header: string | null, attempt: number) {
  const seconds = header ? Number(header) : NaN;

  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, MAX_WAIT_MS);

  return Math.min(500 * 2 ** attempt, MAX_WAIT_MS);
}

async function graphql<T>(query: string, variables: object, deps: HardcoverDeps): Promise<T> {
  const fetchFn = deps.fetchFn ?? fetch;
  const sleep = deps.sleep ?? defaultSleep;
  const timeoutMs = deps.timeoutMs ?? DEFAULTS.timeoutMs;
  const retries = deps.retries ?? DEFAULTS.retries;
  const authorization = deps.token.startsWith('Bearer ') ? deps.token : `Bearer ${deps.token}`;
  let last: HardcoverError | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetchFn(HARDCOVER_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      if (res.status === 401 || res.status === 403)
        throw new HardcoverError(
          'auth',
          'Hardcover recusou o token (expirado ou inválido).',
          res.status,
        );

      if (res.status === 429) {
        last = new HardcoverError('rate', 'Limite de requisições do Hardcover.', 429);
        if (attempt < retries) await sleep(retryDelay(res.headers.get('retry-after'), attempt));
        continue;
      }

      if (res.status >= 500) {
        last = new HardcoverError('http', `Hardcover respondeu ${res.status}.`, res.status);
        if (attempt < retries) await sleep(retryDelay(null, attempt));
        continue;
      }

      if (!res.ok)
        throw new HardcoverError('http', `Hardcover respondeu ${res.status}.`, res.status);

      const body = (await res.json()) as { data?: T; errors?: { message?: string }[] };

      if (body.errors?.length)
        throw new HardcoverError('graphql', body.errors[0]?.message ?? 'Erro de GraphQL.');
      if (!body.data) throw new HardcoverError('shape', 'Resposta sem "data".');

      return body.data;
    } catch (error) {
      // Erros já classificados (token recusado, erro de GraphQL, resposta sem dados) não se repetem.
      if (error instanceof HardcoverError) throw error;

      // `fetch` rejeitou: tempo esgotado (abort) ou falha de rede. Tenta de novo.
      // Só o `name`: o erro de abort pode vir de outro contexto do Node (sem `instanceof Error`).
      const aborted = (error as { name?: unknown } | null)?.name === 'AbortError';

      last = new HardcoverError(
        aborted ? 'timeout' : 'network',
        aborted ? 'Hardcover não respondeu a tempo.' : 'Falha de rede ao falar com o Hardcover.',
      );
      if (attempt < retries) await sleep(retryDelay(null, attempt));
    } finally {
      clearTimeout(timer);
    }
  }

  throw last ?? new HardcoverError('network', 'Falha ao falar com o Hardcover.');
}

// ---------------------------------------------------------------- leitura completa

export async function fetchHardcoverBooks(deps: HardcoverDeps): Promise<Book[]> {
  const now = deps.now ?? Date.now;
  const started = now();
  const budget = deps.budgetMs ?? DEFAULTS.budgetMs;
  const overBudget = () => now() - started > budget;

  const me = await graphql<{ me?: { id?: number } | { id?: number }[] }>(ME_QUERY, {}, deps);
  const userId = Array.isArray(me.me) ? me.me[0]?.id : me.me?.id;

  if (typeof userId !== 'number') throw new HardcoverError('shape', 'Resposta de "me" sem id.');

  const rows: RawUserBook[] = [];
  let level = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    if (overBudget())
      throw new HardcoverError('timeout', 'Leitura do Hardcover passou do orçamento.');

    const variables = { userId, limit: PAGE_SIZE, offset: page * PAGE_SIZE };
    let data: { user_books?: RawUserBook[] };

    try {
      data = await graphql(BOOKS_QUERIES[level], variables, deps);
    } catch (error) {
      // Campo recusado pelo esquema: tenta o nível mínimo uma vez (e o mantém nas páginas seguintes).
      if (error instanceof HardcoverError && error.kind === 'graphql' && level === 0) {
        level = 1;
        page--;
        continue;
      }
      throw error;
    }

    const batch = data.user_books ?? [];

    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }

  return normalizeUserBooks(rows, new Date(now()).toISOString());
}
