// T3.6 (V-14): a 404 sugere até 3 rotas do menu parecidas com o endereço, mantém o link da home e
// o HTML estático traz as 3 primeiras do menu (as sugestões só entram depois da hidratação).
import { renderToString } from 'react-dom/server';
import { screen, waitFor, within } from '@testing-library/react';
import { renderApp } from '../test/helpers';
import { LanguageProvider } from '../i18n/LanguageContext';
import { RouterProvider } from '../router';
import { routes } from '../data/routes';
import NotFound from './NotFound';

// O `useDocumentMeta` carrega o módulo de SEO sob demanda: espera-se o título para o teste não
// terminar antes do import (senão o executor do Vite já fechou).
const settled = () => waitFor(() => expect(document.title).not.toBe(''));
const suggest = () => screen.getByText(/Você quis dizer|Did you mean/).parentElement!;
const menu = routes.filter((route) => route.menu).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

describe('404 (FR-027, FR-039)', () => {
  it('sugere a rota parecida com o endereço digitado, com link no idioma da página', async () => {
    renderApp('/projeto');
    await settled();

    const links = within(suggest()).getAllByRole('link');

    expect(links.length).toBeLessThanOrEqual(3);
    expect(links[0]).toHaveAttribute('href', '/projetos');
    expect(links[0]).toHaveTextContent('Projetos');
  });

  it('em inglês as sugestões e a home usam /en', async () => {
    renderApp('/en/contct');
    await settled();

    const links = within(suggest()).getAllByRole('link');

    expect(links[0]).toHaveAttribute('href', '/en/contact');
    expect(screen.getByRole('link', { name: /Back to the portfolio/ })).toHaveAttribute(
      'href',
      '/en',
    );
  });

  it('sem semelhança mostra as 3 primeiras do menu; mantém o link da home; sem a dica da barra', async () => {
    renderApp('/zzzzzzzz');
    await settled();

    const hrefs = within(suggest())
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));

    expect(hrefs).toEqual(menu.slice(0, 3).map((route) => route.path));
    expect(screen.getByRole('link', { name: /Voltar ao portfólio/ })).toHaveAttribute('href', '/');
    expect(screen.queryByText(/barra de comandos/)).not.toBeInTheDocument();
  });

  it('o HTML estático (sem hidratar) traz as 3 primeiras do menu, mesmo com um endereço parecido', () => {
    const html = renderToString(
      <RouterProvider initial="/projeto">
        <LanguageProvider>
          <NotFound />
        </LanguageProvider>
      </RouterProvider>,
    );
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

    for (const route of menu.slice(0, 3)) expect(hrefs).toContain(route.path);
    expect(html).not.toMatch(/cd \/curriculos/);
  });
});
