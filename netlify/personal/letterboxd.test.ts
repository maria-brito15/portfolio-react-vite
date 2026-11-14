import xml from './fixtures/letterboxd-rss.xml?raw';
import { LetterboxdError, decodeEntities, fetchLetterboxdFeed, letterboxdFeedUrl, parseLetterboxdFeed } from './letterboxd';

// Feed REAL do perfil, salvo em 14/11/2026 (50 itens).
const entries = parseLetterboxdFeed(xml, '2026-11-14T12:00:00.000Z');
const byTitle = (title: string) => entries.find((e) => e.title === title)!;

describe('feed RSS real do Letterboxd', () => {
  it('lê os 50 itens', () => expect(entries).toHaveLength(50));

  it('ordena por watchedDate (mais recente primeiro) e deixa as sem data no fim', () => {
    const dated = entries.filter((e) => e.watchedDate);
    const dates = dated.map((e) => e.watchedDate!);

    expect(dates).toEqual([...dates].sort().reverse());
    expect(entries.slice(dated.length).every((e) => !e.watchedDate)).toBe(true);
    expect(entries.length - dated.length).toBe(3);
  });

  it('entrada simples: data, nota, id do TMDB e link da entrada', () => {
    expect(byTitle('Wildwood')).toMatchObject({
      id: 'lb:watch-1576380049',
      kind: 'movie',
      year: 2026,
      watchedDate: '2026-11-07',
      rating: 3.5,
      rewatch: false,
      liked: false,
      tmdbId: 791523,
      reviewUrl: 'https://letterboxd.com/dudapbrt/film/wildwood-2026/',
      review: undefined,
    });
  });

  it('sem nota: rating ausente (não zero); sem data: watchedDate ausente', () => {
    const noRating = entries.filter((e) => e.rating === undefined);
    const noDate = entries.filter((e) => e.watchedDate === undefined);

    expect(noRating).toHaveLength(5);
    expect(noDate).toHaveLength(3);
    expect(byTitle('Fear Street: 1978').watchedDate).toBeUndefined();
  });

  it('revisto e curtido vêm dos campos do feed', () => {
    expect(byTitle('Pretty Woman')).toMatchObject({ rewatch: true, liked: true, rating: 5 });
    expect(byTitle('Call Me by Your Name')).toMatchObject({ rewatch: true, liked: false });
  });

  it('série usa tmdb:tvId e kind "tv"', () => {
    expect(byTitle('Adolescence')).toMatchObject({ kind: 'tv', tmdbId: 249042 });
    expect(entries.filter((e) => e.kind === 'tv')).toHaveLength(1);
  });

  it('resenha: só nas entradas de resenha, sem a linha "Watched on", sem HTML, com entidades decodificadas', () => {
    const reviewed = entries.filter((e) => e.review);

    expect(reviewed).toHaveLength(13);
    expect(entries.some((e) => e.review?.includes('Watched on'))).toBe(false);
    expect(entries.some((e) => /<\/?(p|em|img|br)\b/.test(e.review ?? ''))).toBe(false);
    expect(byTitle("Ferris Bueller's Day Off").review).toContain('"I said it before');
    expect(byTitle('The Devil\'s Mouth').review).toBe(
      'eu não sei quem é mais burro sem noção: as pessoas ou o tubarão\n\nabsolutamente nada nem nenhuma decisão faz sentido, ninguém tem bom senso',
    );
  });

  it('spoiler: marcado só quando o feed avisa, e o aviso não entra no texto', () => {
    expect(byTitle('Prisoners').spoiler).toBe(true);
    expect(byTitle('Prisoners').review).not.toMatch(/may contain spoilers/);
    expect(byTitle('Wildwood').spoiler).toBeUndefined();
  });

  it('não inventa: sem pôster do Letterboxd, sem "assistido no cinema"', () => {
    for (const e of entries) {
      expect(e.posterUrl).toBeUndefined();
      expect(JSON.stringify({ ...e, review: undefined })).not.toMatch(/cinema|theat|ltrbxd/i);
      expect(e.provenance.source).toBe('letterboxd');
      expect(e.provenance.fetchedAt).toBe('2026-11-14T12:00:00.000Z');
    }
  });

  it('ids únicos', () => expect(new Set(entries.map((e) => e.id)).size).toBe(50));
});

describe('detalhes do parser', () => {
  it('decodifica entidades numéricas e nomeadas sem decodificar duas vezes', () => {
    expect(decodeEntities('It&#039;s &quot;x&quot; &amp;amp; &#x2013;')).toBe('It\'s "x" &amp; –');
  });

  it('recusa o que não é RSS', () => {
    expect(() => parseLetterboxdFeed('<html></html>')).toThrow(LetterboxdError);
  });

  it('descarta item sem título ou com link de fora do Letterboxd', () => {
    const bad = `<rss><item><link>https://evil.test/x</link><guid>letterboxd-watch-1</guid><letterboxd:filmTitle>X</letterboxd:filmTitle></item></rss>`;

    expect(parseLetterboxdFeed(bad)).toEqual([]);
  });
});

describe('fetchLetterboxdFeed', () => {
  it('usa a URL oficial do RSS do perfil', async () => {
    const fetchFn = vi.fn(async () => new Response(xml));

    await fetchLetterboxdFeed({ username: 'dudapbrt', fetchFn });

    expect(String((fetchFn.mock.calls as unknown[][])[0][0])).toBe(letterboxdFeedUrl('dudapbrt'));
    expect(letterboxdFeedUrl('dudapbrt')).toBe('https://letterboxd.com/dudapbrt/rss/');
  });

  it('HTTP de erro e rede fora viram LetterboxdError("unavailable")', async () => {
    await expect(
      fetchLetterboxdFeed({ username: 'x', fetchFn: async () => new Response('', { status: 503 }) }),
    ).rejects.toMatchObject({ kind: 'unavailable' });
    await expect(
      fetchLetterboxdFeed({ username: 'x', fetchFn: async () => Promise.reject(new Error('down')) }),
    ).rejects.toMatchObject({ kind: 'unavailable' });
  });
});
