import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
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

  it('atualiza título, descrição, canonical, Open Graph e JSON-LD da rota', () => {
    render(
      <LanguageProvider>
        <Probe id="projetos" />
      </LanguageProvider>,
    );

    expect(document.title).toBe(metaFor('projetos', 'pt').title);
    expect(content('meta[name="description"]')).toBe(metaFor('projetos', 'pt').description);
    expect(content('meta[property="og:url"]')).toBe(absoluteUrl('/projetos'));
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      absoluteUrl('/projetos'),
    );
    expect(JSON.parse(document.getElementById('ld-json')!.textContent!)['@graph']).toBeDefined();
  });

  it('acompanha o idioma e não duplica tags', async () => {
    render(
      <LanguageProvider>
        <Probe id="sobre" />
      </LanguageProvider>,
    );
    await act(async () => userEvent.click(screen.getByText('trocar')));

    expect(document.title).toBe(metaFor('sobre', 'en').title);
    expect(content('meta[property="og:locale"]')).toBe('en_US');
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('#ld-json')).toHaveLength(1);
  });

  it('no 404: noindex, sem canonical e sem JSON-LD herdados da página anterior', () => {
    const { rerender } = render(
      <LanguageProvider>
        <Probe id="contato" />
      </LanguageProvider>,
    );

    rerender(
      <LanguageProvider>
        <Probe id="notFound" />
      </LanguageProvider>,
    );

    expect(content('meta[name="robots"]')).toContain('noindex');
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.getElementById('ld-json')).toBeNull();
  });
});
