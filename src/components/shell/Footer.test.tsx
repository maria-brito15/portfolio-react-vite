// T3.1 (V-14): rodapé de créditos com as 4 seções, "sem cookies" e um único link; elenco = versão
// maior instalada; cada nome do elenco existe em dependencies/devDependencies.
import { readFileSync } from 'node:fs';
import { render, screen, within } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider } from '../../router';
import { credits } from '../../content/credits.content';
import { CreditsSchema } from '../../content/schema/credits';
import { castVersions } from '../../../scripts/castVersions';
import Footer from './Footer';

const open = (path: string) => {
  window.history.replaceState(null, '', path);

  return render(
    <RouterProvider>
      <LanguageProvider>
        <Footer />
      </LanguageProvider>
    </RouterProvider>,
  );
};

afterEach(() => window.history.replaceState(null, '', '/'));

describe('Footer de créditos (FR-036, FR-037)', () => {
  it('mostra título, directed by e as 4 seções, em português', () => {
    const { container } = open('/');
    const footer = within(screen.getByRole('contentinfo'));

    expect(footer.getByText('UM PORTFÓLIO DE ENGENHARIA')).toBeInTheDocument();
    expect(footer.getByText('DIRECTED BY Duda')).toBeInTheDocument();
    expect(container.querySelectorAll('dt')).toHaveLength(4);
    expect([...container.querySelectorAll('dt')].map((dt) => dt.textContent)).toEqual([
      'Roteiro e código',
      'Elenco',
      'Filmado em',
      'Fim',
    ]);
    expect(footer.getByText('Belo Horizonte, MG')).toBeInTheDocument();
    expect(footer.getByText('sem cookies')).toBeInTheDocument();
  });

  it('em inglês traz os rótulos e "no cookies"', () => {
    const { container } = open('/en');

    expect(screen.getByText('AN ENGINEERING PORTFOLIO')).toBeInTheDocument();
    expect([...container.querySelectorAll('dt')].map((dt) => dt.textContent)).toEqual([
      'Written and coded by',
      'Cast',
      'Shot in',
      'The end',
    ]);
    expect(screen.getByText('no cookies')).toBeInTheDocument();
  });

  it('tem um único link, para a home de cada idioma', () => {
    open('/sobre');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/');
  });

  it('o link do rodapé em inglês leva a /en', () => {
    open('/en/about');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/en');
  });
});

describe('Elenco (FR-037)', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const declared = { ...pkg.dependencies, ...pkg.devDependencies };

  it('cada nome do elenco existe em dependencies ou devDependencies', () => {
    for (const { package: name } of credits.cast) {
      expect(declared, name).toHaveProperty([name]);
    }
  });

  it('a versão mostrada é a maior INSTALADA, não a faixa do package.json', () => {
    const { container } = open('/');
    const installed = castVersions(credits.cast.map((member) => member.package));
    const dd = container.querySelectorAll('dd')[1].textContent;
    const expected = credits.cast
      .map(({ package: name, name: label }) => `${label} ${installed[name]}`)
      .join(' · ');

    expect(Object.values(installed).every((major) => Number.isInteger(major))).toBe(true);
    expect(dd).toBe(expected);
  });

  it('o schema recusa elenco vazio e chave extra', () => {
    expect(CreditsSchema.safeParse({ ...credits, cast: [] }).success).toBe(false);
    expect(CreditsSchema.safeParse({ ...credits, extra: 1 }).success).toBe(false);
    expect(CreditsSchema.safeParse(credits).success).toBe(true);
  });

  it('pacote ausente vira null (sem versão inventada)', () => {
    expect(castVersions(['pacote-que-nao-existe-xyz'])).toEqual({
      'pacote-que-nao-existe-xyz': null,
    });
  });
});
