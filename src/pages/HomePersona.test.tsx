import { screen, within } from '@testing-library/react';
import { renderApp } from '../test/helpers';
import { PERSONA_KEY } from '../hooks/usePersona';
import { PERSONA_IDS, type PersonaId } from '../data/personas';

const h2s = () =>
  [...document.querySelectorAll('.dash-section > h2, .dash-section > .dash-head h2')].map(
    (h) => h.textContent,
  );
const hrefs = (root: HTMLElement) =>
  within(root)
    .getAllByRole('link')
    .map((a) => a.getAttribute('href'));
const withPersona = (id?: PersonaId, lang?: 'en') => {
  if (id) localStorage.setItem(PERSONA_KEY, id);
  if (lang) localStorage.setItem('portfolio-lang', lang);

  return renderApp('/');
};

describe('home adaptativa', () => {
  it('sem persona: a composição de sempre, sem introdução de persona', () => {
    withPersona();

    expect(h2s()).toEqual(['Acesso rápido', 'O que você procura?', 'Projetos em destaque', 'Interativo']);
    expect(document.querySelector('.dash-lens')).toBeNull();
    expect(screen.getByRole('link', { name: 'Ver projetos' })).toHaveClass('dash-btn--primary');
  });

  const first: Record<PersonaId, string> = {
    rh: 'Resumo profissional',
    tech: 'Projetos técnicos',
    professor: 'Trajetória acadêmica',
    cliente: 'O que posso oferecer',
    amigo: 'Para explorar',
  };

  it.each(PERSONA_IDS)('%s: abre pelo bloco da persona e mostra a introdução', (id) => {
    withPersona(id);

    expect(h2s()[0]).toBe(first[id]);
    expect(document.querySelector('.dash-lens')).not.toBeEmpty();
    expect(document.querySelector('.dash')).toHaveAttribute('data-persona', id);
    expect(document.querySelectorAll('.dash-hero .dash-btn--primary')).toHaveLength(1);
  });

  it.each(PERSONA_IDS)('%s: todos os atalhos continuam acessíveis', (id) => {
    const plain = withPersona();
    const all = hrefs(
      screen.getByRole('heading', { level: 2, name: 'Acesso rápido' }).closest('section')!,
    );

    plain.unmount();
    withPersona(id);

    const quick = hrefs(
      screen.getByRole('heading', { level: 2, name: 'Todas as páginas' }).closest('section')!,
    );

    expect([...quick].sort()).toEqual([...all].sort());
  });

  it('ação principal de cada persona leva ao destino certo', () => {
    const expected: Record<PersonaId, [string, string]> = {
      rh: ['Ver o currículo', '/curriculo'],
      tech: ['Ver os projetos', '/projetos'],
      professor: ['Ver o acadêmico', '/academico'],
      cliente: ['Pedir orçamento', '/servicos#contato'],
      amigo: ['Conhecer a Duda', '/sobre'],
    };

    for (const id of PERSONA_IDS) {
      const view = withPersona(id);

      expect(screen.getByRole('link', { name: expected[id][0] })).toHaveAttribute(
        'href',
        expected[id][1],
      );
      view.unmount();
    }
  });

  it('cliente: serviços, cases e FAQ levam à página de serviços', () => {
    withPersona('cliente');

    const section = screen
      .getByRole('heading', { level: 2, name: 'O que posso oferecer' })
      .closest('section')!;

    expect(hrefs(section)).toEqual(expect.arrayContaining(['/servicos#cases', '/servicos#faq']));
  });

  it('em inglês, títulos e chamados trocam de idioma', () => {
    withPersona('tech', 'en');

    expect(h2s()[0]).toBe('Technical projects');
    expect(
      within(document.querySelector<HTMLElement>('.dash-hero')!).getByRole('link', {
        name: 'Read the case study',
      }),
    ).toBeInTheDocument();
  });
});
