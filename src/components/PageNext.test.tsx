import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { PERSONA_KEY } from '../hooks/usePersona';
import { TRAIL_KEY, resetTrailMemory } from '../trails/storage';
import type { PersonaId } from '../data/personas';

const setup = (path: string, persona?: PersonaId, lang?: 'en') => {
  if (persona) localStorage.setItem(PERSONA_KEY, persona);
  if (lang) localStorage.setItem('portfolio-lang', lang);

  return renderApp(path);
};
const nav = () => screen.queryByRole('navigation', { name: /Para seguir|Keep exploring/ });
const save = (persona: string, progress: object) =>
  localStorage.setItem(
    TRAIL_KEY,
    JSON.stringify({
      trails: {
        [persona]: { step: 0, done: [], finished: false, dismissed: false, ...progress },
      },
      secrets: [],
    }),
  );
const stored = () => JSON.parse(localStorage.getItem(TRAIL_KEY) ?? 'null');

beforeEach(() => resetTrailMemory());

describe('próximos passos ao fim das páginas', () => {
  it('sem persona: nada, em nenhuma página', () => {
    setup('/curriculo');

    expect(nav()).toBeNull();
  });

  it.each([
    ['rh', '/curriculo', 'Ver as experiências', '/experiencias', 'Entrar em contato'],
    [
      'tech',
      '/projetos',
      'Ler o estudo de caso',
      '/estudos-de-caso/whatsapp-dispatcher',
      'Ver o GitHub',
    ],
    ['professor', '/academico', 'Ver os projetos', '/projetos', 'Atividades e extensão'],
    ['cliente', '/servicos', 'Ver os cases', '/servicos#cases', 'Pedir orçamento'],
    ['amigo', '/sobre', 'Ver os projetos', '/projetos', 'Jogar'],
  ] as const)(
    '%s em %s: uma principal e uma secundária',
    (persona, path, primary, href, secondary) => {
      setup(path, persona);

      const box = nav()!;

      expect(within(box).getByRole('link', { name: primary })).toHaveAttribute('href', href);
      expect(within(box).getByRole('link', { name: primary })).toHaveClass('dash-btn--primary');
      expect(within(box).getByRole('link', { name: secondary })).not.toHaveClass(
        'dash-btn--primary',
      );
    },
  );

  it('muda com a persona na mesma página', () => {
    const a = setup('/projetos', 'tech');
    const tech = nav()!.textContent;

    a.unmount();
    setup('/projetos', 'amigo');

    expect(nav()!.textContent).not.toBe(tech);
  });

  it('em inglês', () => {
    setup('/curriculo', 'rh', 'en');

    expect(within(nav()!).getByRole('link', { name: 'See the experience' })).toBeInTheDocument();
  });

  it('página sem regra para a persona: nada aparece (e a página funciona)', () => {
    setup('/agora', 'tech');

    expect(nav()).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('o terminal e a home não ganham a faixa', () => {
    const a = setup('/terminal', 'amigo');

    expect(nav()).toBeNull();
    a.unmount();
    setup('/', 'amigo');
    expect(nav()).toBeNull();
  });
});

describe('trilha nas páginas (sem abrir sozinha)', () => {
  it('numa página da trilha, sem ter começado: oferece, não abre', () => {
    setup('/servicos', 'cliente');

    expect(within(nav()!).getByRole('button', { name: 'Fazer esta trilha' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem(TRAIL_KEY)).toBeNull();
  });

  it('numa página que não é parada da trilha e sem progresso: só a recomendação', () => {
    setup('/sobre', 'cliente');

    expect(within(nav()!).queryByRole('button')).toBeNull();
  });

  it('com progresso: mostra o andamento e a próxima parada, em qualquer página', () => {
    save('cliente', { step: 1, done: ['servicos'] });
    setup('/sobre', 'cliente');

    const box = nav()!;

    expect(within(box).getByRole('button', { name: 'Continuar (1 de 4)' })).toBeInTheDocument();
    expect(box).toHaveTextContent('próxima parada: Serviços');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('continuar abre o tour só no clique, sem apagar o progresso', async () => {
    save('cliente', { step: 1, done: ['servicos'] });
    setup('/sobre', 'cliente');
    await userEvent.click(within(nav()!).getByRole('button', { name: /Continuar/ }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(stored().trails.cliente.done).toContain('servicos');
  });

  it('"Agora não" esconde a trilha da faixa, mas a recomendação fica', () => {
    save('cliente', { step: 1, done: ['servicos'], dismissed: true });
    setup('/servicos', 'cliente');

    expect(within(nav()!).queryByRole('button')).toBeNull();
    expect(within(nav()!).getByRole('link', { name: 'Ver os cases' })).toBeInTheDocument();
  });

  it('"Agora não" na faixa dispensa a trilha e guarda a escolha, sem apagar o progresso', async () => {
    save('cliente', { step: 1, done: ['servicos'] });
    setup('/servicos', 'cliente');
    await userEvent.click(within(nav()!).getByRole('button', { name: 'Agora não' }));

    expect(within(nav()!).queryByRole('button')).toBeNull();
    expect(stored().trails.cliente).toMatchObject({ dismissed: true, done: ['servicos'] });
  });

  it('trilha concluída: selo, sem botão de continuar', () => {
    save('cliente', { step: 3, done: ['servicos', 'cases', 'faq', 'orcamento'], finished: true });
    setup('/servicos', 'cliente');

    expect(nav()).toHaveTextContent('Trilha concluída');
    expect(within(nav()!).queryByRole('button')).toBeNull();
  });

  it('trocar de persona preserva o progresso da outra e não mostra o dela', () => {
    save('cliente', { step: 1, done: ['servicos'] });

    const a = setup('/servicos', 'cliente');

    expect(nav()).toHaveTextContent('Continuar (1 de 4)');
    a.unmount();
    resetTrailMemory();
    setup('/projetos', 'tech');

    expect(nav()).not.toHaveTextContent('Continuar');
    expect(stored().trails.cliente.done).toEqual(['servicos']);
  });

  it('trocar de persona na home não mexe no progresso salvo', async () => {
    save('cliente', { step: 1, done: ['servicos'] });
    setup('/', 'cliente');
    await userEvent.click(screen.getByRole('button', { name: 'trocar' }));
    await userEvent.click(screen.getByRole('button', { name: /técnico/ }));

    expect(stored().trails.cliente).toMatchObject({ step: 1, done: ['servicos'] });
  });
});
