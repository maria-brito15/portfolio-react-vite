import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { formatSyncDate } from '../../data/personal/review';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { ui } from '../../i18n/ui';
import { RouterProvider } from '../../router';
import AttributionFooter from './AttributionFooter';
import CoverFigure from './CoverFigure';
import EditorialHeader from './EditorialHeader';
import RatingStars from './RatingStars';
import SectionIndex from './SectionIndex';
import StaleNotice from './StaleNotice';

const wrapper = ({ children }: { children: ReactNode }) => (
  <RouterProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </RouterProvider>
);

afterEach(() => localStorage.removeItem('portfolio-lang'));

describe('EditorialHeader (CL-19)', () => {
  it('kicker, título (h1) e linha de apoio', () => {
    render(<EditorialHeader kicker="Livros" title="Estante" deck="Uma linha." tone="amber" />, {
      wrapper,
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Estante' })).toBeInTheDocument();
    expect(screen.getByText('Livros')).toHaveClass('pe-kicker');
    expect(screen.getByText('Uma linha.')).toBeInTheDocument();
  });

  it('a linha de apoio é opcional', () => {
    const { container } = render(<EditorialHeader kicker="K" title="T" />, { wrapper });

    expect(container.querySelector('.pe-deck')).toBeNull();
  });
});

describe('SectionIndex (CL-19, CL-20)', () => {
  it('lista numerada 01, 02… com links para cada seção', () => {
    render(
      <SectionIndex
        label="Seções"
        items={[
          { to: '/pessoal/livros', title: 'Livros', hint: 'o que leio' },
          { to: '/pessoal/filmes', title: 'Filmes' },
        ]}
      />,
      { wrapper },
    );

    expect(screen.getByRole('navigation', { name: 'Seções' })).toBeInTheDocument();

    const links = screen.getAllByRole('link');

    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/pessoal/livros',
      '/pessoal/filmes',
    ]);
    expect(links[0]).toHaveTextContent('01');
    expect(links[1]).toHaveTextContent('02');
    expect(screen.getByText('o que leio')).toBeInTheDocument();
  });
});

describe('CoverFigure (CL-18)', () => {
  it('com imagem: width, height, lazy e alt', () => {
    render(<CoverFigure src="/c.jpg" alt="Capa de Exemplo" title="Exemplo" />, { wrapper });

    const img = screen.getByRole('img', { name: 'Capa de Exemplo' });

    expect(img).toHaveAttribute('src', '/c.jpg');
    expect(img).toHaveAttribute('width', '200');
    expect(img).toHaveAttribute('height', '300');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('sem imagem: placeholder tipográfico com título e ano, e o mesmo nome acessível', () => {
    render(<CoverFigure alt="Exemplo (2024)" title="Exemplo" year={2024} />, { wrapper });

    const ph = screen.getByRole('img', { name: 'Exemplo (2024)' });

    expect(ph).toHaveTextContent('Exemplo');
    expect(ph).toHaveTextContent('2024');
    expect(ph.querySelector('img')).toBeNull();
  });

  it('sem ano, o placeholder só mostra o título', () => {
    const { container } = render(<CoverFigure alt="x" title="Só título" />, { wrapper });

    expect(container.querySelector('.pe-cover-ph-year')).toBeNull();
  });

  it('imagem quebrada cai no placeholder em vez do ícone de imagem quebrada', () => {
    const { container } = render(<CoverFigure src="/quebrada.jpg" alt="Capa" title="Título" />, {
      wrapper,
    });

    fireEvent.error(container.querySelector('img')!);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.pe-cover-ph')).toHaveTextContent('Título');
  });

  it('trocar a URL depois de uma falha tenta a nova imagem', () => {
    const { container, rerender } = render(<CoverFigure src="/a.jpg" alt="Capa" title="T" />, {
      wrapper,
    });

    fireEvent.error(container.querySelector('img')!);
    rerender(<CoverFigure src="/b.jpg" alt="Capa" title="T" />);

    expect(container.querySelector('img')).toHaveAttribute('src', '/b.jpg');
  });

  it('legenda opcional', () => {
    render(<CoverFigure alt="x" title="T" caption="Legenda" />, { wrapper });

    expect(screen.getByText('Legenda').tagName).toBe('FIGCAPTION');
  });
});

describe('RatingStars (CL-22, CL-37)', () => {
  it('estrelas em texto, com o equivalente acessível em PT', () => {
    render(<RatingStars rating={3.5} />, { wrapper });

    expect(screen.getByRole('img', { name: '3,5 de 5' })).toHaveTextContent('★★★½');
  });

  it('em inglês', () => {
    localStorage.setItem('portfolio-lang', 'en');
    render(<RatingStars rating={4} />, { wrapper });

    expect(screen.getByRole('img', { name: '4 out of 5' })).toHaveTextContent('★★★★');
  });

  it('sem nota: travessão e "sem nota", sem quebrar', () => {
    render(<RatingStars />, { wrapper });

    expect(screen.getByRole('img', { name: 'sem nota' })).toHaveTextContent('—');
  });
});

describe('formatSyncDate', () => {
  const iso = '2026-11-13T12:00:00.000Z';

  it('formata no idioma, no fuso pedido', () => {
    expect(formatSyncDate(iso, 'pt', 'UTC')).toMatch(/13.*nov.*2026.*12:00/);
    expect(formatSyncDate(iso, 'en', 'UTC')).toMatch(/Nov 13, 2026.*12:00/);
  });

  it('data inválida vira texto vazio', () => {
    expect(formatSyncDate('ontem', 'pt')).toBe('');
    expect(formatSyncDate('', 'en')).toBe('');
  });
});

describe('StaleNotice (CL-11)', () => {
  it('vencido: avisa e diz de quando é o dado, como status', () => {
    render(<StaleNotice stale updatedAt="2026-11-12T06:00:00.000Z" />, { wrapper });

    expect(screen.getByRole('status')).toHaveTextContent(/Não foi possível atualizar agora/);
    expect(screen.getByRole('status')).toHaveTextContent(/2026/);
  });

  it('em dia: não mostra nada', () => {
    const { container } = render(<StaleNotice stale={false} updatedAt="2026-11-12T06:00:00Z" />, {
      wrapper,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('data ilegível não mostra "Invalid Date"', () => {
    render(<StaleNotice stale updatedAt="???" />, { wrapper });

    expect(screen.getByRole('status')).not.toHaveTextContent(/invalid/i);
  });
});

describe('AttributionFooter (CL-12)', () => {
  it('mostra a fonte e a última sincronização', () => {
    render(
      <AttributionFooter feed={{ source: 'hardcover', updatedAt: '2026-11-13T12:00:00Z' }} />,
      {
        wrapper,
      },
    );

    expect(screen.getByRole('contentinfo')).toHaveTextContent(/Última sincronização/);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('via Hardcover');
  });

  it('data ilegível: omite a frase da sincronização, mantém a fonte', () => {
    render(<AttributionFooter feed={{ source: 'letterboxd', updatedAt: 'x' }} />, { wrapper });

    expect(screen.getByRole('contentinfo')).not.toHaveTextContent(/Última sincronização/);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('via Letterboxd');
  });

  it('dado fictício e cópia salva ganham nome próprio', () => {
    const { rerender } = render(
      <AttributionFooter feed={{ source: 'mock', updatedAt: '2026-11-13T12:00:00Z' }} />,
      { wrapper },
    );

    expect(screen.getByRole('contentinfo')).toHaveTextContent('via dados fictícios');

    rerender(
      <AttributionFooter feed={{ source: 'snapshot', updatedAt: '2026-11-13T12:00:00Z' }} />,
    );
    expect(screen.getByRole('contentinfo')).toHaveTextContent('via cópia salva');
  });

  it('atribuição do TMDB só quando a página usa o TMDB', () => {
    const { rerender } = render(<AttributionFooter tmdb />, { wrapper });

    expect(screen.getByRole('contentinfo')).toHaveTextContent(/not endorsed or certified by TMDB/);

    rerender(<AttributionFooter feed={{ source: 'manual', updatedAt: '2026-11-13T12:00:00Z' }} />);
    expect(screen.getByRole('contentinfo')).not.toHaveTextContent(/TMDB/);
  });

  it('sem feed e sem TMDB: nada', () => {
    const { container } = render(<AttributionFooter />, { wrapper });

    expect(container).toBeEmptyDOMElement();
  });
});

describe('textos PT e EN completos (CL-26)', () => {
  it('as chaves do espaço cultural existem nos dois idiomas, com as mesmas fontes', () => {
    expect(Object.keys(ui.en.personal.footer.sources).sort()).toEqual(
      Object.keys(ui.pt.personal.footer.sources).sort(),
    );
    expect(ui.pt.personal.stale.notice('x')).toContain('x');
    expect(ui.en.personal.stale.notice('x')).toContain('x');
    expect(ui.pt.personal.rating.none).not.toBe(ui.en.personal.rating.none);
  });
});

// CL-16: a folha do espaço cultural respeita o estilo único.
describe('personal.css (CL-16, CL-17)', () => {
  const css = readFileSync(join(process.cwd(), 'src/styles/personal.css'), 'utf8');

  it('nenhuma cor fora dos tokens, nenhum degradê, nenhum itálico', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/rgba?\(/);
    expect(css).not.toMatch(/gradient\(/i);
    expect(css).not.toMatch(/font-style\s*:\s*italic/i);
  });

  it('não declara família de fonte própria (herda o mono)', () => {
    expect(css).not.toMatch(/font-family/);
  });

  it('títulos usam peso 700 e a grade assimétrica vira coluna única no celular', () => {
    expect(css).toMatch(/\.pe-title\s*\{[^}]*font-weight:\s*700/);
    expect(css).toMatch(
      /@media \(max-width: 720px\)[\s\S]*\.pe-split[\s\S]*grid-template-columns: 1fr/,
    );
  });
});
