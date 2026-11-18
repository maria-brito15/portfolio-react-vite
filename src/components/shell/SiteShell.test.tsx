// T3.3 (V-04, V-15): a casca nova, montada uma vez pelo App. Skip link primeiro focável; 1 header,
// 1 nav principal, 1 main e 1 footer; rota `bare` só com a faixa e o `main`; só uma rota `bare`;
// a faixa de idioma vem logo depois do skip link (FR-016).
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { routes } from '../../data/routes';
import { renderApp } from '../../test/helpers';

const SHELL_ROUTES = [
  '/',
  '/jogos',
  '/github',
  '/curriculo',
  '/academico',
  '/servicos',
  '/sobre',
  '/habilidades',
  '/projetos',
  '/experiencias',
  '/contato',
  '/estudos-de-caso/whatsapp-dispatcher',
  '/pessoal',
  '/en',
  '/en/projects',
  '/pagina-que-nao-existe',
];

const follows = (a: Element, b: Element) =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe('casca única (FR-008, FR-016)', () => {
  it.each(SHELL_ROUTES)(
    '%s tem 1 header, 1 nav principal, 1 main e 1 footer, nessa ordem',
    (route) => {
      renderApp(route);
      expect(document.querySelectorAll('.hdr')).toHaveLength(1);
      expect(screen.getAllByRole('main')).toHaveLength(1);
      expect(document.querySelectorAll('footer.credits')).toHaveLength(1);
      expect(
        within(document.querySelector<HTMLElement>('.hdr')!).getAllByRole('navigation'),
      ).toHaveLength(1);
      expect(document.querySelectorAll('main#conteudo')).toHaveLength(1);

      const order = [
        document.querySelector('.deco-stripe')!,
        document.querySelector('.skip-link')!,
        document.querySelector<HTMLElement>('.hdr')!,
        screen.getByRole('main'),
        document.querySelector('footer.credits')!,
      ];

      for (let i = 1; i < order.length; i++) expect(follows(order[i - 1], order[i])).toBe(true);
    },
  );

  it('o skip link é o primeiro item focável e leva ao main', async () => {
    const user = userEvent.setup();

    renderApp('/sobre');
    await user.tab();

    const skip = screen.getByRole('link', { name: 'Ir para o conteúdo' });

    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute('href', '#conteudo');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('em inglês o skip link e o rodapé vêm no idioma da página', () => {
    renderApp('/en/about');
    expect(screen.getByRole('link', { name: 'Skip to content' })).toBeInTheDocument();
    expect(screen.getByText('no cookies')).toBeInTheDocument();
  });

  it('a casca é a mesma ao trocar de página: o header não é remontado', async () => {
    const user = userEvent.setup();

    renderApp('/sobre');

    const header = document.querySelector<HTMLElement>('.hdr')!;

    await user.click(within(header).getByRole('link', { name: 'Projetos' }));
    expect(window.location.pathname).toBe('/projetos');
    expect(document.querySelector<HTMLElement>('.hdr')!).toBe(header);
  });
});

describe('faixa de idioma na ordem do foco (FR-016)', () => {
  it('com o navegador em inglês, vem logo depois do skip link e antes do header', () => {
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['en-US', 'en']);
    renderApp('/sobre');

    const skip = document.querySelector('.skip-link')!;
    const offer = screen.getByRole('region', { name: 'Oferta de idioma' });
    const header = document.querySelector<HTMLElement>('.hdr')!;

    expect(follows(skip, offer)).toBe(true);
    expect(follows(offer, header)).toBe(true);
    expect(skip.nextElementSibling).toBe(offer);
    vi.restoreAllMocks();
  });
});

describe('rota sem casca (FR-041, TD-024)', () => {
  it('só uma rota é `bare`: o terminal', () => {
    expect(routes.filter((route) => route.bare).map((route) => route.id)).toEqual(['terminal']);
  });

  it.each(['/terminal', '/en/terminal'])('%s tem só a faixa e o main', (route) => {
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['en-US', 'en']);
    renderApp(route);
    expect(document.querySelectorAll('.deco-stripe')).toHaveLength(1);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(document.querySelector('.hdr')).toBeNull();
    expect(document.querySelector('footer.credits')).toBeNull();
    expect(document.querySelector('nav')).toBeNull();
    expect(document.querySelector('.skip-link')).toBeNull();
    expect(screen.queryByRole('region', { name: /idioma|language/i })).not.toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
