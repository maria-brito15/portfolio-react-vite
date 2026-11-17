import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider } from '../../router';
import { personalEn, personalPt } from '../../i18n/personal';
import { mockProvenance } from '../../services/integrations/source';
import PlaceholderBadge from './PlaceholderBadge';
import SourceBadge from './SourceBadge';

const wrapper = ({ children }: { children: ReactNode }) => (
  <RouterProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </RouterProvider>
);

afterEach(() => window.history.replaceState(null, '', '/'));

describe('textos do selo (CL-13, CL-26)', () => {
  it('PT e EN completos, com os rótulos do PRD', () => {
    expect(personalPt.placeholder.badge).toBe('DADOS FICTÍCIOS');
    expect(personalEn.placeholder.badge).toBe('PLACEHOLDER DATA');

    for (const lang of ['pt', 'en'] as const)
      for (const text of Object.values((lang === 'pt' ? personalPt : personalEn).placeholder))
        expect(text.trim(), `${lang}`).not.toBe('');
  });
});

describe('PlaceholderBadge (CL-13)', () => {
  it('feed mock: mostra o selo e o aviso em PT, como nota acessível', () => {
    render(<PlaceholderBadge source="mock" />, { wrapper });

    expect(screen.getByRole('note')).toHaveTextContent('DADOS FICTÍCIOS');
    expect(screen.getByRole('note')).toHaveTextContent(/Nada aqui foi lido/);
  });

  it('feed mock em inglês', () => {
    window.history.replaceState(null, '', '/en');
    render(<PlaceholderBadge source="mock" />, { wrapper });

    expect(screen.getByRole('note')).toHaveTextContent('PLACEHOLDER DATA');
  });

  it.each(['hardcover', 'letterboxd', 'tmdb', 'manual', 'snapshot', undefined] as const)(
    'fonte real (%s): não mostra nada',
    (source) => {
      const { container } = render(<PlaceholderBadge source={source} />, { wrapper });

      expect(container).toBeEmptyDOMElement();
    },
  );
});

describe('SourceBadge (CL-13)', () => {
  it('item mock: marca "fictício", com o aviso na dica', () => {
    render(<SourceBadge provenance={mockProvenance()} />, { wrapper });

    expect(screen.getByText('fictício')).toHaveAttribute('title', personalPt.placeholder.hint);
  });

  it('item real: sem marca', () => {
    const { container } = render(
      <SourceBadge provenance={{ source: 'letterboxd', fetchedAt: '2026-11-13T12:00:00.000Z' }} />,
      { wrapper },
    );

    expect(container).toBeEmptyDOMElement();
  });
});
