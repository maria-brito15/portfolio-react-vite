// Caderno — Vol. XI (docs/specs/caderno-vol-xi): com a flag ligada, o shell novo e seus componentes.
// O caminho com a flag desligada é o da suíte existente (nenhum destes testes o altera).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/helpers';
import { routes } from '../../data/routes';
import { SOMMAIRE, chapterFor, sortByLens } from '../../data/notebook/chapters';
import { epigraphs, pickEpigraph } from '../../data/notebook/epigraphs';
import { featuredProjectIds } from '../../data/notebook/featured';
import { openerKey, toRoman, volume } from '../../data/notebook/volume';
import { projects } from '../../data/projects';
import { personas } from '../../data/personas';
import { ui } from '../../i18n/ui';
import { indexRoutes } from './IndexOverlay';
import { cuttingRoom } from './useCuttingRoom';
import { openerSeen, resetOpenerSession } from './useOpener';

vi.mock('../../config', () => ({ CADERNO_V2: true }));

const css = readFileSync(join(process.cwd(), 'src/styles/notebook.css'), 'utf8');

function reduceMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion: reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }));
}

beforeEach(() => {
  resetOpenerSession();
  cuttingRoom.close();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('estrutura e acessibilidade (CD-70, CD-71)', () => {
  it('renderiza o skip-link para #main-content como primeiro elemento focável e um só <main>', () => {
    const { container } = renderApp('/');
    const skip = container.querySelector<HTMLAnchorElement>('a.nb-skip');

    expect(skip).toHaveAttribute('href', '#main-content');
    expect(skip).toHaveTextContent('Pular para o conteúdo');
    expect(container.querySelectorAll('main')).toHaveLength(1);
    expect(container.querySelector('main')).toHaveAttribute('id', 'main-content');
    // Nenhuma superfície antiga: sem Sidebar, Taskbar nem barra de comandos (CD-14).
    expect(container.querySelector('.sidebar, .taskbar, .cmdbar, .workspace')).toBeNull();
  });

  it('a região viva anuncia a página da rota', async () => {
    renderApp('/curriculo');

    const live = await screen.findByText(/Página aberta:/);

    expect(live).toHaveAttribute('role', 'status');
    expect(live).toHaveAttribute('aria-live', 'polite');
  });

  it('a home tem um só h1 (o nome na capa)', () => {
    const { container } = renderApp('/');

    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Maria Eduarda de Paula Brito');
  });

  it('a capa tem a linha da edição (sem "Vol.", revisão R1), a tagline provisória rotulada e "índice ↓"', () => {
    renderApp('/');

    expect(screen.getByText(/PORTFÓLIO · 2026 · EDIÇÃO ESCURO/)).toBeInTheDocument();
    expect(screen.getByText(/TODO: tagline/)).toBeInTheDocument();
    expect(screen.getByText('foto da capa: pendente')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /índice ↓/ })).toHaveAttribute('href', '#sommaire');
  });
});

describe('um h1 por página no caderno (CD-70)', () => {
  const paths = [
    '/sobre',
    '/habilidades',
    '/projetos',
    '/experiencias',
    '/contato',
    '/curriculo',
    '/academico',
    '/servicos',
    '/terminal',
    '/github',
    '/agora',
    '/setup',
    '/pessoal',
    '/pessoal/filmes',
    '/estudos-de-caso/whatsapp-dispatcher',
    '/nao-existe',
  ];

  it.each(paths)('%s', async (path) => {
    const { container } = renderApp(path);

    await waitFor(() => expect(container.querySelectorAll('h1').length).toBeGreaterThan(0));
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelectorAll('main')).toHaveLength(1);
  }, 60000);
});

describe('páginas do caderno (CD-17, CD-23, CD-24, CD-27, CD-29)', () => {
  it('páginas comuns trazem o cabeçalho de seção, sem Window e sem "CAPÍTULO nn" (revisão R1)', async () => {
    const { container } = renderApp('/curriculo');

    await waitFor(() => expect(container.querySelector('.nb-chapter-name')).toHaveTextContent('CURRÍCULO'));
    expect(container.querySelector('.win')).toBeNull();
    expect(container.querySelector('.nb-chapter')).not.toHaveTextContent(/CAPÍTULO/);
  });

  it('a página de filmes tem o cabeçalho CINEMA', async () => {
    const { container } = renderApp('/pessoal/filmes');

    await waitFor(() => expect(container.querySelector('.nb-chapter-name')).toHaveTextContent('CINEMA'));
  });

  it('o Sobre é uma carta: "Prezado leitor," como h1 e o currículo no fim', () => {
    renderApp('/sobre');

    expect(screen.getByRole('heading', { level: 1, name: 'Prezado leitor,' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Roteiro técnico (PDF) ↓' })).toHaveAttribute(
      'href',
      '/curriculo',
    );
  });

  it('o Contato é o "PS" e mantém o formulário', () => {
    renderApp('/contato');

    expect(screen.getByRole('heading', { level: 1, name: 'PS — escreva-me' })).toBeInTheDocument();
    expect(document.querySelector('form')).not.toBeNull();
  });

  it('o 404 é "Reel não encontrado" e preserva sugestões e o botão de voltar', () => {
    renderApp('/curricul');

    expect(screen.getByRole('heading', { level: 1, name: 'Reel não encontrado' })).toBeInTheDocument();
    expect(screen.getByText('Este frame não existe no caderno.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ui.pt.notFound.back })).toBeInTheDocument();
    expect(screen.getByText(ui.pt.notFound.didYouMean)).toBeInTheDocument();
  });

  it('o estudo de caso mantém a Window e ganha o cartão de abertura e a próxima produção', () => {
    const { container } = renderApp('/estudos-de-caso/whatsapp-dispatcher');
    const project = projects.find((p) => p.id === 'whatsapp-dispatcher');

    expect(container.querySelector('.win')).not.toBeNull();
    expect(screen.getByText(`A PRODUCTION OF ${project?.date.year}`)).toBeInTheDocument();
    expect(screen.getByText('Directed and engineered by Maria Eduarda')).toBeInTheDocument();
    expect(screen.getByText(`with ${project?.tech.join(' · ')}`)).toBeInTheDocument();
    expect(screen.getByText('próxima produção', { selector: 'p' })).toBeInTheDocument();
  });

  it('o terminal ganha o cabeçalho "Sala de montagem" e mantém a Window', () => {
    const { container } = renderApp('/terminal');

    expect(screen.getByText('onde o caderno é composto')).toBeInTheDocument();
    expect(container.querySelector('.win--terminal')).not.toBeNull();
  });
});

describe('lentes (CD-15, CD-74)', () => {
  it('é um grupo com rótulo e cada chip é um botão com aria-pressed', () => {
    renderApp('/');

    const group = screen.getByRole('group', { name: 'Lente de leitura' });
    const chips = within(group).getAllByRole('button');

    expect(chips).toHaveLength(personas.length);
    for (const chip of chips) expect(chip).toHaveAttribute('aria-pressed', 'false');
  });

  it('escolher marca só o chip ativo, reordena o sommaire sem esconder nada, e clicar de novo limpa', async () => {
    const user = userEvent.setup();

    renderApp('/');

    const group = screen.getByRole('group', { name: 'Lente de leitura' });
    const tech = within(group).getByRole('button', { name: /Dev/ });
    const rows = () => [...document.querySelectorAll('[data-row]')].map((el) => el.getAttribute('data-row'));
    const before = rows();

    await user.click(tech);
    expect(tech).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getAllByRole('button').filter((b) => b.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
    expect(rows().slice().sort()).toEqual(before.slice().sort());
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(tech);
    expect(tech).toHaveAttribute('aria-pressed', 'false');
    expect(rows()).toEqual(before);
  });

  it('sortByLens só reordena: mesmas linhas, sem perder nenhuma, para cada persona', () => {
    for (const p of personas) {
      const sorted = sortByLens(SOMMAIRE, p.id);

      expect(sorted).toHaveLength(SOMMAIRE.length);
      expect(new Set(sorted.map((e) => e.key))).toEqual(new Set(SOMMAIRE.map((e) => e.key)));
    }
    expect(sortByLens(SOMMAIRE, undefined)).toEqual(SOMMAIRE);
  });
});

describe('sommaire (CD-11)', () => {
  it('tem seis tiles; WRITING é placeholder "em breve", sem link', () => {
    renderApp('/');

    const rows = [...document.querySelectorAll('[data-row]')];

    expect(rows).toHaveLength(6);

    const writing = document.querySelector('[data-row="writing"]');

    expect(writing?.tagName).not.toBe('A');
    expect(writing).toHaveTextContent('em breve');
    expect(document.querySelector('[data-row="cinema"]')).toHaveAttribute('href', '/pessoal/filmes');
    expect(document.querySelector('[data-row="library"]')).toHaveAttribute('href', '/pessoal/livros');
    expect(document.querySelector('[data-row="letters"]')).toHaveAttribute('href', '/contato');
  });
});

describe('Índice (CD-13)', () => {
  it('abre um diálogo com o sommaire e TODAS as demais rotas listadas', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.click(screen.getByRole('button', { name: 'ÍNDICE' }));

    const dialog = screen.getByRole('dialog', { name: 'Índice do caderno' });

    expect(within(dialog).getByText('LETTERS')).toBeInTheDocument();
    for (const route of indexRoutes()) {
      expect(within(dialog).getByRole('link', { name: route.label.pt }), route.id).toBeInTheDocument();
    }

    // Nenhuma rota listada fica órfã: as de grupo do `routes.ts` estão no sommaire ou no Índice.
    const sommaireIds = new Set(SOMMAIRE.map((e) => e.routeId));
    const listed = routes.filter((r) => !r.hidden && !r.persona && r.id !== 'home' && (!r.draft || r.showInNav));

    for (const route of listed) {
      expect(sommaireIds.has(route.id) || indexRoutes().some((r) => r.id === route.id), route.id).toBe(true);
    }

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('edição (CD-43)', () => {
  it('é um botão + listbox acessível que troca o tema', async () => {
    const user = userEvent.setup();

    renderApp('/');

    const button = screen.getByRole('button', { name: /Edição \(tema\): escuro/ });

    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    expect(document.querySelector('select')).toBeNull();

    await user.click(button);

    const list = screen.getByRole('listbox', { name: 'Edição (tema)' });

    expect(within(list).getAllByRole('option')).toHaveLength(5);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('marquee (CD-31, CD-32, CD-35)', () => {
  it('mostra o cenário atual de now.ts e tem um botão de pausa sempre visível', async () => {
    const user = userEvent.setup();

    renderApp('/');

    const band = screen.getByRole('group', { name: 'Agora no caderno' });

    expect(within(band).getAllByText(/cenário atual:/).length).toBeGreaterThan(0);

    const pause = within(band).getByRole('button', { name: 'Pausar a faixa em movimento' });

    expect(pause).toHaveAttribute('aria-pressed', 'false');
    await user.click(pause);
    expect(
      within(band).getByRole('button', { name: 'Retomar a faixa em movimento' }),
    ).toHaveAttribute('aria-pressed', 'true');
    // O texto duplicado do loop é escondido dos leitores de tela.
    expect(band.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('o CSS esconde o marquee e para o marcador de capítulo, o pulso e a abertura com movimento reduzido', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.nb-marquee\s*\{\s*display: none/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.nb-pulse\s*\{\s*animation: none/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.nb-opener\s*\{\s*animation: none/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.nb-titlecard\s*\{\s*animation: none/);
  });
});

describe('marcador de capítulo (CD-33, CD-35)', () => {
  it('só anima dentro de @supports (animation-timeline: view()) e de prefers-reduced-motion: no-preference', () => {
    const at = css.indexOf('animation-timeline: view();');
    const block = css.slice(css.lastIndexOf('@supports', at), at);

    expect(at).toBeGreaterThan(0);
    expect(block).toContain('@supports (animation-timeline: view())');
    expect(block).toContain('prefers-reduced-motion: no-preference');

    // Fora desse bloco, o número do capítulo não tem animação.
    const base = css.slice(css.indexOf('.nb-chapter-n {'), css.indexOf('.nb-chapter-name {'));

    expect(base).not.toMatch(/animation:/);
    // O brief fixa 400 ms de pausa no pico: 60% do ciclo e escala 1,2.
    expect(css).toMatch(/@keyframes nb-chapter-mark[\s\S]*60%[\s\S]*scale\(1\.2\)/);
  });
});

describe('abertura por volume (CD-44, CD-45)', () => {
  it('toca na primeira visita, grava a chave do volume e não volta', () => {
    const first = renderApp('/');

    expect(screen.getByTestId('opening-card')).toHaveTextContent('MARIA EDUARDA DE PAULA BRITO');
    expect(screen.getByTestId('opening-card')).toHaveTextContent('PORTFÓLIO · MMXXVI');
    expect(localStorage.getItem('notebook-opener-seen-vol-11')).toBe('1');
    first.unmount();

    renderApp('/');
    expect(screen.queryByTestId('opening-card')).toBeNull();
  });

  it('"pular" fecha o cartão', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Pular a abertura' }));
    expect(screen.queryByTestId('opening-card')).toBeNull();
  });

  it('com movimento reduzido o cartão é estático', () => {
    reduceMotion(true);
    renderApp('/');

    expect(screen.getByTestId('opening-card')).toHaveClass('is-static');
  });

  it('some sozinho depois de 2,5 s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      renderApp('/');
      expect(screen.getByTestId('opening-card')).toBeInTheDocument();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2600);
      });
      expect(screen.queryByTestId('opening-card')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('não monta para robôs de busca', () => {
    vi.stubGlobal('navigator', { ...navigator, userAgent: 'Googlebot/2.1' });
    renderApp('/');

    expect(screen.queryByTestId('opening-card')).toBeNull();
  });

  it('sem localStorage a marca vale na sessão; trocar o número do volume a reativa', () => {
    const key11 = openerKey();
    const key12 = openerKey({ ...volume, number: 12 });

    expect(key11).toBe('notebook-opener-seen-vol-11');
    expect(key12).toBe('notebook-opener-seen-vol-12');
    expect(openerSeen(key11)).toBe(false);

    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    try {
      const first = renderApp('/');

      expect(screen.getByTestId('opening-card')).toBeInTheDocument();
      first.unmount();
      expect(openerSeen(key11)).toBe(true);
      expect(openerSeen(key12)).toBe(false);
    } finally {
      get.mockRestore();
      set.mockRestore();
    }
  });
});

describe('créditos e sala de montagem (CD-41, CD-50, CD-51, CD-52)', () => {
  it('o rodapé traz os créditos, a atribuição da TMDB e o link da sala de montagem', () => {
    renderApp('/');

    const footer = screen.getByRole('contentinfo', { name: 'Créditos' });

    expect(footer).toHaveTextContent('Fraunces · JetBrains Mono');
    expect(footer).toHaveTextContent('React · Vite · Netlify');
    expect(footer).toHaveTextContent('Hardcover');
    expect(footer).toHaveTextContent('Letterboxd');
    expect(footer).toHaveTextContent('TMDB');
    expect(footer).toHaveTextContent('UMA PRODUÇÃO SOLO · MMXXVI');
    expect(footer).not.toHaveTextContent('VOL.');
    expect(footer).toHaveTextContent('Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.');
    expect(within(footer).getByRole('button', { name: /sala de montagem/i })).toBeInTheDocument();
  });

  it('o botão abre o terminal em overlay sem mudar a URL; Esc fecha', async () => {
    const user = userEvent.setup();

    renderApp('/sobre');
    await user.click(screen.getByRole('button', { name: /Abrir a sala de montagem/ }));

    const dialog = await screen.findByRole('dialog', { name: 'Sala de montagem' });

    expect(await within(dialog).findByText('onde o caderno é composto')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/sobre');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(window.location.pathname).toBe('/sobre');
  });

  it('Ctrl+` abre e fecha (bônus), sem mudar a URL', async () => {
    const user = userEvent.setup();

    renderApp('/sobre');
    await user.keyboard('{Control>}`{/Control}');
    await screen.findByRole('dialog', { name: 'Sala de montagem' });
    expect(window.location.pathname).toBe('/sobre');
    await user.keyboard('{Control>}`{/Control}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

describe('próxima produção (CD-22)', () => {
  it('com um só estudo de caso, aponta para a lista de projetos', () => {
    renderApp('/estudos-de-caso/whatsapp-dispatcher');

    expect(screen.getByRole('link', { name: /todos os projetos/ })).toHaveAttribute('href', '/projetos');
  });
});

describe('dados do caderno (CD-80 a CD-85)', () => {
  it('volume: número romano e rótulos nos dois idiomas', () => {
    expect(volume.number).toBe(11);
    expect(toRoman(11)).toBe('XI');
    expect(toRoman(2026)).toBe('MMXXVI');
    expect(volume.label.pt).toBe('Caderno — Vol. XI / 2026');
    expect(volume.label.en).toBe('Notebook — Vol. XI / 2026');
  });

  it('epígrafes: cinco, bilíngues, com fonte; a lente prefere as suas e nunca devolve vazio', () => {
    expect(epigraphs).toHaveLength(5);
    for (const e of epigraphs) {
      expect(e.pt.length).toBeGreaterThan(5);
      expect(e.en.length).toBeGreaterThan(5);
      expect(e.source.length).toBeGreaterThan(3);
      for (const id of e.personaBias ?? []) expect(personas.some((p) => p.id === id)).toBe(true);
    }

    for (const p of personas) {
      expect(pickEpigraph(p.id)).toBeDefined();
    }
    expect(pickEpigraph(undefined)).toBeDefined();
  });

  it('destaques: três projetos que existem, sem repetir', () => {
    expect(featuredProjectIds).toHaveLength(3);
    expect(new Set(featuredProjectIds).size).toBe(3);
    for (const id of featuredProjectIds) expect(projects.some((p) => p.id === id), id).toBe(true);
  });

  it('capítulos: o sommaire só aponta para rotas que existem; CINEMA = 03, LIBRARY = 04', () => {
    for (const entry of SOMMAIRE) {
      if (entry.routeId) expect(routes.some((r) => r.id === entry.routeId), entry.key).toBe(true);
    }
    expect(chapterFor('pessoal-filmes')).toEqual({ number: '03', key: 'cinema' });
    expect(chapterFor('pessoal-livros')).toEqual({ number: '04', key: 'library' });
    expect(chapterFor('home')).toBeUndefined();
  });

  it('paridade PT/EN de t.nb: mesmas chaves nos dois idiomas, nenhum texto vazio', () => {
    const shape = (value: unknown): unknown =>
      typeof value === 'function'
        ? 'fn'
        : value && typeof value === 'object'
          ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]))
          : typeof value;

    expect(shape(ui.en.nb)).toEqual(shape(ui.pt.nb));

    const empty = (value: unknown): boolean =>
      typeof value === 'string'
        ? value.trim() === ''
        : value && typeof value === 'object'
          ? Object.values(value).some(empty)
          : false;

    expect(empty(ui.pt.nb)).toBe(false);
    expect(empty(ui.en.nb)).toBe(false);
  });
});

describe('idioma em inglês', () => {
  it('a home e o 404 trocam o vocabulário', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await user.click(screen.getByRole('button', { name: /EN|PT/ }));

    expect(await screen.findByText(/PORTFOLIO · 2026 · EDITION/)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Reading lens' })).toBeInTheDocument();
  });
});
