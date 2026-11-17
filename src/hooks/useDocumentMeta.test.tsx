import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { RouterProvider } from '../router';
import { useDocumentMeta } from './useDocumentMeta';
import { metaFor, absoluteUrl } from '../data/seo';

function Probe({ id }: { id: string }) {
  const { toggleLang } = useLanguage();

  useDocumentMeta(id);

  return <button onClick={toggleLang}>trocar</button>;
}

const content = (selector: string) =>
  document.head.querySelector(selector)?.getAttribute('content');

describe('useDocumentMeta', () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML = '';
  });

  it('atualiza título, descrição, canonical, Open Graph e JSON-LD da rota', async () => {
    window.history.replaceState(null, '', '/projetos');
    render(
      <RouterProvider>
        <LanguageProvider>
          <Probe id="projetos" />
        </LanguageProvider>
      </RouterProvider>,
    );

    // O módulo de SEO é carregado sob demanda: espera o primeiro título.
    await waitFor(() => expect(document.title).toBe(metaFor('projetos', 'pt').title));
    expect(content('meta[name="description"]')).toBe(metaFor('projetos', 'pt').description);
    expect(content('meta[property="og:url"]')).toBe(absoluteUrl('/projetos'));
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      absoluteUrl('/projetos'),
    );
    expect(JSON.parse(document.getElementById('ld-json')!.textContent!)['@graph']).toBeDefined();
  });

  it('acompanha o idioma (pelo endereço), atualiza lang e hreflang e não duplica tags', async () => {
    window.history.replaceState(null, '', '/sobre');
    render(
      <RouterProvider>
        <LanguageProvider>
          <Probe id="sobre" />
        </LanguageProvider>
      </RouterProvider>,
    );
    await act(async () => userEvent.click(screen.getByText('trocar')));

    await waitFor(() => expect(document.title).toBe(metaFor('sobre', 'en').title));
    expect(content('meta[property="og:locale"]')).toBe('en_US');
    expect(window.location.pathname).toBe('/en/about');
    expect(document.documentElement.lang).toBe('en');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      absoluteUrl('/en/about'),
    );
    expect(
      document.head.querySelector('link[rel="alternate"][hreflang="pt-BR"]')?.getAttribute('href'),
    ).toBe(absoluteUrl('/sobre'));
    expect(document.head.querySelectorAll('link[rel="alternate"]')).toHaveLength(3);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('#ld-json')).toHaveLength(1);
  });

  it('no 404: noindex, sem canonical e sem JSON-LD herdados da página anterior', async () => {
    const { rerender } = render(
      <RouterProvider>
        <LanguageProvider>
          <Probe id="contato" />
        </LanguageProvider>
      </RouterProvider>,
    );

    rerender(
      <RouterProvider>
        <LanguageProvider>
          <Probe id="notFound" />
        </LanguageProvider>
      </RouterProvider>,
    );

    await waitFor(() => expect(content('meta[name="robots"]')).toContain('noindex'));
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.getElementById('ld-json')).toBeNull();
  });
});
