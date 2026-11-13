import { screen, waitFor, within } from '@testing-library/react';
import { renderApp } from '../test/helpers';
import { PERSONA_KEY } from '../hooks/usePersona';
import { PERSONA_IDS, type PersonaId } from '../data/personas';
import { projects } from '../data/projects';
import { perspectiveFor } from '../data/projectPerspectives';

const setup = (path: string, persona?: PersonaId, lang?: 'en') => {
  if (persona) localStorage.setItem(PERSONA_KEY, persona);
  if (lang) localStorage.setItem('portfolio-lang', lang);

  return renderApp(path);
};
const card = (id: string) => document.getElementById(`projeto-${id}`)!;

describe('cartões de projeto contextuais', () => {
  it('sem persona: nenhum bloco de perspectiva e a descrição de sempre', () => {
    setup('/projetos');

    expect(document.querySelectorAll('.proj-lens')).toHaveLength(0);
    expect(card('ecoshop')).toHaveTextContent('E-commerce sustentável');
  });

  it.each(PERSONA_IDS)(
    '%s: o EcoShop mostra a perspectiva e mantém a descrição e os links',
    async (id) => {
      setup('/projetos', id);

      // As perspectivas são carregadas sob demanda (usePerspectives).
      await waitFor(() => expect(card('ecoshop').querySelector('.proj-lens')).not.toBeNull());

      const lens = card('ecoshop').querySelector('.proj-lens')!;

      expect(lens).toHaveTextContent(perspectiveFor('ecoshop', id)!.summary.pt);
      expect(card('ecoshop')).toHaveTextContent('E-commerce sustentável');
      expect(within(card('ecoshop')).getByRole('link', { name: /GitHub/ })).toHaveAttribute(
        'href',
        projects.find((p) => p.id === 'ecoshop')!.repo!,
      );
    },
  );

  it('a mesma página muda de perspectiva quando a persona muda', () => {
    const a = setup('/projetos', 'tech');
    const tech = card('planoriza').querySelector('.proj-lens')!.textContent;

    a.unmount();
    setup('/projetos', 'amigo');

    expect(card('planoriza').querySelector('.proj-lens')!.textContent).not.toBe(tech);
  });

  it('projeto sem perspectiva continua na lista, com a apresentação padrão', () => {
    setup('/projetos', 'tech');

    expect(card('shorturl')).toBeInTheDocument();
    expect(card('shorturl').querySelector('.proj-lens')).toBeNull();
    expect(card('shorturl')).toHaveTextContent('API REST pra encurtar URLs');
    expect(document.querySelectorAll('.timeline-item')).toHaveLength(projects.length);
  });

  it('o estudo de caso continua acessível pelo cartão', () => {
    setup('/projetos', 'cliente');

    expect(
      within(card('whatsapp-dispatcher')).getByRole('link', { name: /Estudo de Caso/i }),
    ).toHaveAttribute('href', '/estudos-de-caso/whatsapp-dispatcher');
  });

  it('em inglês, rótulo e texto trocam de idioma', () => {
    setup('/projetos', 'professor', 'en');

    const lens = card('ecoshop').querySelector('.proj-lens')!;

    expect(lens).toHaveAccessibleName('Academic context');
    expect(lens).toHaveTextContent('It started as a university project');
  });

  it('na home, o cartão em destaque usa a perspectiva e destaca o link da persona', () => {
    setup('/', 'tech');

    const featured = [...document.querySelectorAll('.featured-project')].find((el) =>
      el.textContent?.includes('WhatsApp Dispatcher'),
    ) as HTMLElement;

    expect(featured.querySelector('.proj-lens')).toHaveTextContent(
      'Disparador de mensagens em camadas',
    );
    expect(within(featured).getByRole('link', { name: 'Ler estudo de caso' })).toHaveAttribute(
      'data-primary',
      'true',
    );
  });

  it('na home sem persona, a descrição padrão aparece e não há perspectiva', () => {
    setup('/');

    expect(document.querySelectorAll('.proj-lens')).toHaveLength(0);
    expect(screen.getAllByText(/Estudo de caso de um/).length).toBeGreaterThan(0);
  });
});
