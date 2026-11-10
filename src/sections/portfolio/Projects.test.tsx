import { screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../../test/helpers';

const FORBIDDEN =
  /atual|current|a confirmar|to be confirmed|em andamento|concluído|a divulgar|to be published|indispon|not available/i;

function timeline() {
  renderApp('/projetos');

  return screen.getByRole('list', { name: /Linha do tempo|Project timeline/ });
}

describe('timeline de projetos', () => {
  it('mostra Planoriza e EcoShop primeiro, seguidos do Portfólio e dos três de 2026 sem mês', () => {
    const items = [...timeline().querySelectorAll(':scope > .timeline-item')];
    const names = items.map(
      (li) => li.querySelector<HTMLElement>('h3, .minor-item-name')!.textContent,
    );

    expect(names.slice(0, 3)).toEqual(['Planoriza', 'EcoShop', 'Portfólio']);
    expect(names).toHaveLength(6);
  });

  it('exibe MM/AAAA, AAAA ou o rótulo confirmado (Portfólio: mês por extenso) e sinaliza a ordem indeterminada de 2026', async () => {
    const user = userEvent.setup();
    const tl = timeline();
    const dates = () => [...tl.querySelectorAll('.timeline-date time')].map((t) => t.textContent);

    expect(dates()).toEqual(['01/2025', '02/2025', 'out/2026', '2026', '2026', '2026']);

    const notes = tl.querySelectorAll('.date-note');

    expect(notes).toHaveLength(3);
    expect(notes[0]).toHaveTextContent('ordem entre os projetos de 2026 indeterminada');

    // o rótulo do Portfólio é por idioma ("out/2026" / "oct/2026"); a data em
    // si ({ year: 2026, month: 10 }) não muda, só a exibição.
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(dates()[2]).toBe('oct/2026');
  });

  it('EcoShop mostra v1 · 02/2025 e v2 · 01/2026', () => {
    const tl = within(timeline());

    expect(tl.getByText('v1 · 02/2025')).toBeInTheDocument();
    expect(tl.getByText('v2 · 01/2026')).toBeInTheDocument();
  });

  it('não exibe indicadores de status nem promessas, em PT e EN', async () => {
    const user = userEvent.setup();
    const tl = timeline();
    const dateTexts = () =>
      [...tl.querySelectorAll('.timeline-date, .evo-tag')].map((e) => e.textContent).join(' ');

    expect(dateTexts()).not.toMatch(FORBIDDEN);
    expect(tl.textContent).not.toMatch(/Repositório (privado|a divulgar)/);
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(dateTexts()).not.toMatch(FORBIDDEN);
    expect(tl.textContent).not.toMatch(/Private repository|Repository to be published/);
    expect(tl.querySelector<HTMLElement>('.date-note')!).toHaveTextContent(
      'order among 2026 projects undetermined',
    );
  });

  it('links do GitHub só onde o repositório existe, com rel seguro', () => {
    const tl = timeline();
    const links = within(tl).getAllByRole('link', { name: /GitHub/ });

    expect(links.map((a) => a.getAttribute('href')).sort()).toEqual([
      'https://github.com/maria-brito15/ecoshop-nextjs',
      'https://github.com/maria-brito15/file-name-standardizer',
      'https://github.com/maria-brito15/portfolio-react-vite',
      'https://github.com/maria-brito15/shorturl-express',
    ]);
    for (const a of links) expect(a).toHaveAttribute('rel', 'noopener noreferrer');

    const planoriza = within(tl)
      .getByRole('heading', { name: 'Planoriza' })
      .closest<HTMLElement>('.proj-card')!;

    expect(within(planoriza).queryByRole('link')).not.toBeInTheDocument();
  });

  it('WhatsApp Dispatcher é apresentado como estudo de caso de desafio técnico de estágio', async () => {
    const user = userEvent.setup();
    const tl = within(timeline());

    expect(tl.getByText(/Desafio Técnico de Estágio/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(tl.getByText(/Internship Technical Challenge/)).toBeInTheDocument();
  });

  it('galeria: projeto com imagens abre o lightbox; sem imagens não renderiza nada', async () => {
    const user = userEvent.setup();
    const tl = timeline();
    const thumbs = within(tl).getAllByRole('button', { name: /Ampliar imagem: EcoShop/ });

    expect(thumbs).toHaveLength(3);
    await user.click(thumbs[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(tl.querySelectorAll('.img-wrap')).toHaveLength(3);
    expect(tl.querySelectorAll('.media-pending')).toHaveLength(0);
  });

  it('imagem ausente é descartada sem deixar miniatura quebrada', () => {
    const tl = timeline();

    fireEvent.error(tl.querySelectorAll('.img-wrap img')[0]);
    expect(tl.querySelectorAll('.img-wrap')).toHaveLength(2);
    for (const img of tl.querySelectorAll('.img-wrap img')) fireEvent.error(img);
    expect(tl.querySelectorAll('.case-img-grid')).toHaveLength(0);
  });
});

describe('experiência WebTech na página', () => {
  it('mostra o período e a descrição atualizados', () => {
    renderApp('/experiencias');

    const section = document.getElementById('experiencias')!;

    expect(section).toHaveTextContent('2º semestre de 2026 – em andamento');
    expect(section).toHaveTextContent(/workshop e de um laboratório de Spec-Driven Development/);
  });
});
