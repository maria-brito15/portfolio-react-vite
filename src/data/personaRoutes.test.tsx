import { screen } from '@testing-library/react';
import { renderApp } from '../test/helpers';
import { PERSONA_KEY } from '../hooks/usePersona';
import { personas } from './personas';
import { directories, findPageByPath, routes } from './routes';
import { SITE_URL, headTags, jsonLdFor, metaFor } from './seo';

const personaRoutes = routes.filter((r) => r.persona);
const find = (tags: ReturnType<typeof headTags>['tags'], key: string) =>
  tags.find((t) => Object.values(t.attrs).includes(key));

describe('rotas de persona (PR-07, PR-08, PR-09)', () => {
  it('há uma rota /r/<id> por persona, geradas de personas.ts e fora do ls', () => {
    expect(personaRoutes.map((r) => r.path)).toEqual(personas.map((p) => `/r/${p.id}`));
    for (const r of personaRoutes) {
      expect(r.hidden, r.path).toBe(true);
      expect(directories.some((d) => d.id === r.id)).toBe(false);
      expect(findPageByPath(r.path)?.persona).toBe(r.persona);
    }
  });

  it('persona desconhecida cai no 404', () => {
    expect(findPageByPath('/r/xyz')).toBeUndefined();
    expect(findPageByPath('/r')).toBeUndefined();
  });

  it('usa a meta, o canonical e o grafo da home, mas fica fora do índice', () => {
    for (const r of personaRoutes) {
      const { tags } = headTags(r.id, 'pt');

      expect(metaFor(r.id, 'pt')).toEqual(metaFor('home', 'pt'));
      expect(find(tags, 'canonical')?.attrs.href, r.id).toBe(`${SITE_URL}/`);
      expect(find(tags, 'og:url')?.attrs.content, r.id).toBe(`${SITE_URL}/`);
      expect(find(tags, 'robots')?.attrs.content, r.id).toContain('noindex');
      expect(JSON.stringify(jsonLdFor(r.id, 'pt'))).toBe(JSON.stringify(jsonLdFor('home', 'pt')));
    }
  });

  it('abre a home com a persona do link já aplicada e salva', async () => {
    renderApp('/r/tech');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Duda Brito');
    expect(window.location.pathname).toBe('/r/tech');
    await vi.waitFor(() => expect(localStorage.getItem(PERSONA_KEY)).toBe('tech'));
  });

  it('o 404 continua valendo para /r/<desconhecida>', () => {
    renderApp('/r/xyz');

    expect(localStorage.getItem(PERSONA_KEY)).toBeNull();
    expect(screen.queryByRole('heading', { name: /Acesso rápido/ })).toBeNull();
  });
});
