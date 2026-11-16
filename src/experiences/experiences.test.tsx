import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { PERSONA_KEY } from '../hooks/usePersona';
import { TRAIL_KEY, resetTrailMemory } from '../trails/storage';
import type { PersonaId } from '../data/personas';

beforeEach(() => resetTrailMemory());

const open = (id: PersonaId, lang?: 'en') => {
  localStorage.setItem(PERSONA_KEY, id);
  if (lang) localStorage.setItem('portfolio-lang', lang);

  return renderApp('/');
};

describe('tech: explorador de arquitetura', () => {
  it('escolher um componente mostra responsabilidade, ligações e o trecho do estudo de caso', async () => {
    const user = userEvent.setup();

    open('tech');
    await screen.findByRole('heading', { level: 2, name: 'Explorador de arquitetura' });

    const node = screen.getByRole('button', { name: /Organizador/ });

    expect(node).toHaveAttribute('aria-pressed', 'false');
    await user.click(node);
    expect(node).toHaveAttribute('aria-pressed', 'true');

    const detail = document.getElementById('arch-detail')!;

    expect(detail).toHaveTextContent('lote limitado');
    expect(within(detail).getByRole('link', { name: /Ler esta parte/ })).toHaveAttribute(
      'href',
      '/estudos-de-caso/whatsapp-dispatcher#workers',
    );
    // As ligações são botões que levam a outro componente.
    await user.click(within(detail).getByRole('button', { name: 'Fila de processamento' }));
    expect(screen.getAllByRole('button', { name: /Fila de processamento/ })[0]).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('tem alternativa em texto, aviso de repositório e a integração não concluída', async () => {
    const user = userEvent.setup();

    open('tech');
    await screen.findByRole('heading', { level: 2, name: 'Explorador de arquitetura' });
    expect(screen.getByText('Descrição em texto do diagrama')).toBeInTheDocument();
    expect(screen.getByText(/não registra um repositório público/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /API do WhatsApp/ }));
    expect(document.getElementById('arch-detail')).toHaveTextContent('Integração não concluída');
  });

  it('em inglês', async () => {
    open('tech', 'en');
    await screen.findByRole('heading', { level: 2, name: 'Architecture explorer' });
    expect(screen.getByRole('button', { name: /Scheduler/ })).toBeInTheDocument();
  });
});

describe('rh: visão profissional', () => {
  it('troca entre competências, experiência e destaques; competências abrem por categoria', async () => {
    const user = userEvent.setup();

    open('rh');
    await screen.findByRole('heading', { level: 2, name: 'Visão profissional' });
    expect(document.querySelectorAll('#overview-panel details').length).toBeGreaterThan(3);

    await user.click(screen.getByRole('button', { name: 'Experiência' }));
    expect(document.querySelector('#overview-panel ol')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Destaques' }));
    expect(
      screen.getByRole('heading', { level: 3, name: 'Projetos finalistas' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver o currículo completo' })).toHaveAttribute(
      'href',
      '/curriculo',
    );
  });
});

describe('professor: linha do tempo acadêmica', () => {
  it('filtra por categoria e mantém as disciplinas com as notas', async () => {
    const user = userEvent.setup();

    open('professor');
    await screen.findByRole('heading', { level: 2, name: 'Linha do tempo acadêmica' });

    const section = document.getElementById('timeline-title')!.closest('section')!;

    expect(section).toHaveTextContent('Cálculo I · 60');

    await user.click(within(section).getByRole('button', { name: 'Projetos' }));
    expect(section).not.toHaveTextContent('Cálculo I');
    expect(section).toHaveTextContent('EcoShop');
    expect(within(section).getAllByRole('link', { name: 'Ver nos projetos' })[0]).toHaveAttribute(
      'href',
      '/projetos',
    );
  });
});

describe('cliente: jornada de solução', () => {
  it('escolher uma necessidade revela serviço, exemplo, dúvidas e o contato', async () => {
    const user = userEvent.setup();

    open('cliente');
    await screen.findByRole('heading', { level: 2, name: 'Como posso ajudar você?' });
    expect(document.getElementById('journey-result')).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', { name: /vender produtos online/ }));

    const result = document.getElementById('journey-result')!;

    expect(result).toHaveTextContent('E-commerce Completo');
    expect(result).toHaveTextContent('BECAS | Study Room');
    expect(result.querySelectorAll('details').length).toBeGreaterThan(0);
    expect(
      within(result.closest('section')!).getByRole('link', { name: 'Pedir orçamento' }),
    ).toHaveAttribute('href', '/servicos#contato');
  });

  it('necessidade sem exemplo publicado diz isso em vez de inventar', async () => {
    const user = userEvent.setup();

    open('cliente');
    await screen.findByRole('heading', { level: 2, name: 'Como posso ajudar você?' });
    await user.click(screen.getByRole('button', { name: /corrigir ou melhorar/ }));
    expect(document.getElementById('journey-result')).toHaveTextContent(
      'Ainda não há um exemplo publicado',
    );
  });
});

describe('amigo: modo explorar', () => {
  it('dicas em dois níveis, segredo achado e recomeço', async () => {
    const user = userEvent.setup();

    localStorage.setItem(TRAIL_KEY, JSON.stringify({ trails: {}, secrets: ['fortune'] }));
    open('amigo');
    await screen.findByRole('heading', { level: 2, name: 'Modo explorar' });

    expect(screen.getByText(/1 de 7 segredos achados/)).toBeInTheDocument();
    expect(screen.getByText(/Você achou “fortune”/)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Dica' })[0]);
    expect(screen.getAllByRole('button', { name: 'Mostrar como' })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Mostrar como' }));
    expect(screen.queryAllByRole('button', { name: 'Mostrar como' })).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Recomeçar a exploração' }));
    expect(screen.getByText(/0 de 7 segredos achados/)).toBeInTheDocument();
    expect(screen.queryByText(/Você achou “/)).toBeNull();
  });
});
