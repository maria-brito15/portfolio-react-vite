import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { REVIEW_LIMIT } from '../../data/personal/review';
import { booksSource } from './hardcover';
import { mockBooks } from './hardcover/mock';
import { filmsSource } from './letterboxd';
import { mockFilms } from './letterboxd/mock';
import { mockAlbums, mockVisits } from './manual/mock';
import { parseMode, personalMode } from './mode';
import { MOCK_STALE_UPDATED_AT, lazySource, mockSource, unavailableSource } from './source';
import { filmMetaSource } from './tmdb';
import { mockFilmMeta } from './tmdb/mock';

describe('modo da fonte (CL-14)', () => {
  it('só "live" liga o modo real; qualquer outro valor, ou nenhum, é mock', () => {
    expect(parseMode('live')).toBe('live');

    for (const raw of [undefined, '', 'mock', 'Live', 'true', 1, null])
      expect(parseMode(raw), String(raw)).toBe('mock');
  });

  it('nos testes (sem a variável) o modo é mock', () => {
    expect(personalMode).toBe('mock');
  });
});

describe('mockSource (CL-09, CL-11)', () => {
  const items = [1, 2, 3];

  it('ok: devolve os itens, atualizados e não vencidos, marcados como mock', async () => {
    const feed = await mockSource(items).load();

    expect(feed).toMatchObject({ items, stale: false, source: 'mock' });
  });

  it('empty: lista vazia', async () => {
    expect((await mockSource(items, 'empty').load()).items).toEqual([]);
  });

  it('stale: mesmos itens, vencidos, com data antiga', async () => {
    const feed = await mockSource(items, 'stale').load();

    expect(feed).toMatchObject({ items, stale: true, updatedAt: MOCK_STALE_UPDATED_AT });
  });

  it('error: a leitura rejeita', async () => {
    await expect(mockSource(items, 'error').load()).rejects.toThrow(/falha simulada/);
  });

  it('respeita o cancelamento', async () => {
    const controller = new AbortController();

    controller.abort();
    await expect(mockSource(items).load(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});

describe('lazySource e unavailableSource (CL-08)', () => {
  it('só carrega o módulo na primeira leitura e o reaproveita', async () => {
    const loader = vi.fn(async () => mockSource([1]));
    const source = lazySource(loader);

    expect(loader).not.toHaveBeenCalled();
    await source.load();
    await source.load();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('falha no carregamento não fica guardada: a próxima leitura tenta de novo', async () => {
    const loader = vi
      .fn<() => Promise<ReturnType<typeof mockSource<number>>>>()
      .mockRejectedValueOnce(new Error('chunk'))
      .mockResolvedValue(mockSource([1]));
    const source = lazySource(loader);

    await expect(source.load()).rejects.toThrow('chunk');
    expect((await source.load()).items).toEqual([1]);
  });

  it('no modo live sem integração, falha de forma explícita (nunca cai no mock)', async () => {
    await expect(unavailableSource('Hardcover').load()).rejects.toThrow(/Hardcover/);
  });
});

describe('os index.ts das fontes (CL-08)', () => {
  it('em modo mock entregam os dados fictícios por trás da mesma interface', async () => {
    expect((await booksSource.load()).items).toEqual(mockBooks);
    expect((await filmsSource.load()).items).toEqual(mockFilms);
    expect((await filmMetaSource.load()).items).toEqual(mockFilmMeta);
  });
});

describe('mocks fictícios e realistas (CL-09, CL-10)', () => {
  const all = [...mockBooks, ...mockFilms, ...mockAlbums, ...mockVisits];

  it('todo item é marcado como mock, com id "mock:" único', () => {
    for (const item of all) {
      expect(item.provenance.source).toBe('mock');
      expect(item.id).toMatch(/^mock:/);
    }

    expect(new Set(all.map((i) => i.id)).size).toBe(all.length);
  });

  it('títulos claramente fictícios: nenhuma obra real atribuída à Duda', () => {
    for (const { title } of all) expect(title, title).toMatch(/exemplo/i);
  });

  it('livros: sem capa, sem páginas, sem data, sem nota, título longo e todos os estados', () => {
    expect(mockBooks.some((b) => !b.coverUrl)).toBe(true);
    expect(mockBooks.some((b) => b.pages === undefined)).toBe(true);
    expect(mockBooks.some((b) => b.status === 'read' && !b.finishedAt)).toBe(true);
    expect(mockBooks.some((b) => b.status === 'read' && b.rating === undefined)).toBe(false);
    expect(mockBooks.some((b) => b.rating === undefined)).toBe(true);
    expect(mockBooks.some((b) => b.title.length > 100)).toBe(true);
    expect(mockBooks.some((b) => b.authors.length > 1)).toBe(true);
    expect(new Set(mockBooks.map((b) => b.status))).toEqual(
      new Set(['reading', 'read', 'want', 'paused', 'dnf']),
    );
  });

  it('filmes: sem nota, sem data, série, revisto, mesmo dia, sem ano e sem tmdbId', () => {
    expect(mockFilms.some((f) => f.rating === undefined)).toBe(true);
    expect(mockFilms.some((f) => f.watchedDate === undefined)).toBe(true);
    expect(mockFilms.some((f) => f.kind === 'tv')).toBe(true);
    expect(mockFilms.some((f) => f.rewatch)).toBe(true);
    expect(mockFilms.some((f) => f.liked)).toBe(true);
    expect(mockFilms.some((f) => f.year === undefined && f.tmdbId === undefined)).toBe(true);

    const days = mockFilms.map((f) => f.watchedDate).filter(Boolean);

    expect(new Set(days).size).toBeLessThan(days.length);
    expect(mockFilms.some((f) => f.title.length > 80)).toBe(true);
  });

  it('filmes: resenha longa (acima do limite), curta e suprimida com publish: false', () => {
    expect(mockFilms.some((f) => (f.review?.length ?? 0) > REVIEW_LIMIT)).toBe(true);
    expect(mockFilms.some((f) => f.review && f.review.length <= REVIEW_LIMIT)).toBe(true);
    expect(mockFilms.some((f) => f.review && f.publish === false)).toBe(true);
  });

  it('metadados: sem sinopse, sem duração e sem diretor; há filme sem metadado', () => {
    expect(mockFilmMeta.some((m) => !m.overview)).toBe(true);
    expect(mockFilmMeta.some((m) => m.runtimeMin === undefined)).toBe(true);
    expect(mockFilmMeta.some((m) => m.directors.length === 0)).toBe(true);

    const withMeta = new Set(mockFilmMeta.map((m) => m.tmdbId));

    expect(mockFilms.some((f) => f.tmdbId !== undefined && !withMeta.has(f.tmdbId))).toBe(true);
    for (const id of withMeta)
      expect(
        mockFilms.some((f) => f.tmdbId === id),
        String(id),
      ).toBe(true);
  });

  it('nenhum mock faz pedido de rede: sem URL de imagem nem de pôster', () => {
    expect(mockBooks.every((b) => b.coverUrl === undefined)).toBe(true);
    expect(mockFilms.every((f) => f.posterUrl === undefined)).toBe(true);
  });
});

// CL-08: páginas, componentes e hooks só conhecem o `index.ts` de cada fonte.
describe('isolamento do mock (CL-08, CL-15)', () => {
  const SRC = join(__dirname, '..', '..');

  function files(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);

      return statSync(path).isDirectory() ? files(path) : [path];
    });
  }

  it('só o próprio index.ts de cada fonte (e os testes) importa um mock.ts', () => {
    const importers = files(SRC)
      .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.test\.tsx?$/.test(f))
      .filter((f) =>
        /from\s+['"][^'"]*\/mock['"]|import\(\s*['"][^'"]*\/mock['"]/.test(readFileSync(f, 'utf8')),
      )
      .map((f) => relative(SRC, f).split(sep).join('/'));

    expect(importers.sort()).toEqual([
      'services/integrations/hardcover/index.ts',
      'services/integrations/letterboxd/index.ts',
      'services/integrations/manual/index.ts',
      'services/integrations/tmdb/index.ts',
    ]);
  });
});
