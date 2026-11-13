import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { PERSONA_KEY } from '../hooks/usePersona';
import type { PersonaId } from '../data/personas';

const ctrlK = (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Control>}k{/Control}');
const palette = () => screen.findByRole('dialog', { name: /Paleta de comandos|Command palette/ });

beforeEach(() => sessionStorage.clear());

describe('paleta com persona', () => {
  it('avisa para qual perfil ordenou, destaca o termo e mantém o teclado', async () => {
    const user = userEvent.setup();

    localStorage.setItem(PERSONA_KEY, 'tech');
    renderApp('/');
    await ctrlK(user);

    const dialog = await palette();
    const box = within(dialog).getByRole('combobox');

    await user.type(box, 'backend');
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      /Ordenado para o perfil .+; nada é escondido/,
    );
    // projetos com tecnologia de backend aparecem; nada foi escondido
    expect(within(dialog).getAllByRole('option').length).toBeGreaterThan(0);
    expect(within(dialog).getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}');
    expect(within(dialog).getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');

    await user.clear(box);
    await user.type(box, 'curriculo');
    expect(dialog.querySelector('.palette-item mark')?.textContent).toMatch(/^curr[ií]culo$/i);
  });

  it('sem persona não há aviso de ordenação', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await ctrlK(user);

    const dialog = await palette();

    await user.type(within(dialog).getByRole('combobox'), 'projetos');
    expect(within(dialog).getByRole('status')).not.toHaveTextContent(/Ordenado para/);
  });

  it('escolher uma seção leva direto à âncora', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await ctrlK(user);

    const dialog = await palette();

    await user.type(within(dialog).getByRole('combobox'), 'disciplinas');
    await user.click(
      within(dialog).getByRole('option', { name: /Acadêmico: Disciplinas e notas/ }),
    );
    expect(window.location.pathname + window.location.hash).toBe('/academico#disciplinas');
  });
});

describe('"O que você procura?"', () => {
  const open = (persona?: PersonaId) => {
    if (persona) localStorage.setItem(PERSONA_KEY, persona);

    return renderApp('/');
  };
  const links = () =>
    within(
      screen.getByRole('heading', { level: 2, name: 'O que você procura?' }).closest('section')!,
    )
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));

  it('funciona sem persona, com cinco destinos que existem', () => {
    open();
    expect(links()).toEqual([
      '/curriculo#competencias',
      '/projetos',
      '/academico#trajetoria',
      '/servicos#servicos',
      '/sobre',
    ]);
  });

  it('com persona, só reordena e usa o destino mais específico', () => {
    open('tech');
    expect(links()[0]).toBe('/estudos-de-caso/whatsapp-dispatcher');
    expect(links()).toHaveLength(5);
  });

  it('o botão de busca abre a paleta', async () => {
    const user = userEvent.setup();

    open('cliente');
    await user.click(screen.getByRole('button', { name: /Buscar no site/ }));
    await palette();
  });
});

describe('sugestões sem repetir', () => {
  it('depois de visitar a página sugerida, ela não volta a ser sugerida', async () => {
    localStorage.setItem(PERSONA_KEY, 'rh');
    sessionStorage.setItem('portfolio-visited', JSON.stringify(['experiencias', 'contato']));
    renderApp('/curriculo');

    const nav = screen.getByRole('navigation', { name: /Para seguir|Keep exploring/ });
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));

    expect(hrefs.length).toBeLessThanOrEqual(2);
    expect(hrefs).not.toContain('/experiencias');
    expect(hrefs).not.toContain('/contato');
  });
});
