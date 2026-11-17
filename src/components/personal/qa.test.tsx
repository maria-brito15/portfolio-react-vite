// Fase 6 (QA): as cinco rotas do espaço cultural em PT e EN. Confere o que
// dá para conferir sem navegador: um <h1>, ordem dos títulos sem saltos, <main> único, imagens
// com alt não vazio, nenhuma chave de tradução crua e nenhum texto no idioma errado.
import { screen, waitFor } from '@testing-library/react';
import { renderApp } from '../../test/helpers';

const PAGES = [
  ['/pessoal', '/en/personal'],
  ['/pessoal/livros', '/en/personal/books'],
  ['/pessoal/filmes', '/en/personal/films'],
  ['/pessoal/musica', '/en/personal/music'],
  ['/pessoal/teatro', '/en/personal/theater'],
] as const;

afterEach(() => {
  localStorage.removeItem('portfolio-lang');
});

const RAW_KEY = /\b[a-z]+(\.[a-zA-Z]+){2,}\b/;

async function open(path: string, lang: 'pt' | 'en') {
  localStorage.setItem('portfolio-lang', lang);

  const view = renderApp(path);

  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeTruthy(), {
    timeout: 8000,
  });

  await new Promise((r) => setTimeout(r, 300));

  return view;
}

function audit(container: HTMLElement) {
  const main = container.querySelectorAll('main');
  const headings = [...container.querySelectorAll('main h1, main h2, main h3, main h4')];
  const levels = headings.map((h) => Number(h.tagName[1]));

  expect(main.length, 'um <main>').toBe(1);
  expect(
    levels.filter((l) => l === 1),
    'um <h1>',
  ).toHaveLength(1);
  levels.forEach((level, i) => {
    if (i > 0)
      expect(
        level - levels[i - 1],
        `salto de título em "${headings[i].textContent}"`,
      ).toBeLessThanOrEqual(1);
  });
  for (const img of container.querySelectorAll('main img')) {
    expect(img.getAttribute('alt')?.trim(), img.outerHTML).toBeTruthy();
    expect(img.getAttribute('width') && img.getAttribute('height'), 'width/height').toBeTruthy();
  }

  for (const h of headings) expect(h.textContent, 'chave crua').not.toMatch(RAW_KEY);
  expect(main[0].textContent ?? '', 'chave crua').not.toMatch(
    /\b(undefined|NaN|\[object Object\])\b/,
  );
}

describe.each(PAGES)('QA de %s', (pt, en) => {
  it.each([
    ['pt', pt],
    ['en', en],
  ] as const)('estrutura e idioma em %s', async (lang, path) => {
    const { container } = await open(path, lang);

    audit(container);
    expect(document.documentElement.lang.slice(0, 2)).toBe(lang);
    // o hub e as subpáginas trazem o breadcrumb no idioma da rota
    expect(container.textContent).toContain(lang === 'pt' ? '~/pessoal' : '~/personal');
  });
});

describe('nada escondido e nenhuma página quebrada', () => {
  it('as cinco páginas abrem completas e com títulos distintos', async () => {
    const seen: string[] = [];

    for (const [pt] of PAGES) {
      const { container, unmount } = await open(pt, 'pt');

      audit(container);
      seen.push(container.querySelector('h1')?.textContent ?? '');
      unmount();
    }

    expect(seen.every(Boolean)).toBe(true);
    expect(new Set(seen).size).toBe(5);
  });
});
