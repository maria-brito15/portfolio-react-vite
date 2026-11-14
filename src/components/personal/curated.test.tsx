import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { MusicData } from '../../data/personal/music';
import { music } from '../../data/personal/music';
import type { TheaterData } from '../../data/personal/theater';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { RouterProvider } from '../../router';
import MusicProfile from './MusicProfile';
import TheaterProfile from './TheaterProfile';

const wrapper = ({ children }: { children: ReactNode }) => (
  <RouterProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </RouterProvider>
);

const emptyMusic: MusicData = {
  updated: null,
  instruments: [],
  practice: [],
  artists: [],
  songs: [],
  albums: [],
};
const emptyTheater: TheaterData = {
  updated: null,
  visits: [],
  experiences: [],
  favorites: [],
  observations: [],
  references: [],
};

afterEach(() => localStorage.removeItem('portfolio-lang'));

describe('MusicProfile', () => {
  it('os seis instrumentos informados, sem nível nem ano inventados', () => {
    render(<MusicProfile />, { wrapper });

    expect(screen.getByRole('heading', { name: 'Instrumentos que toco' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Guitarra',
      'Violão',
      'Canto',
      'Baixo',
      'Bateria',
      'Ukulele',
    ]);
    // seções sem item não aparecem
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
  });

  it('em inglês, nomes no idioma', () => {
    localStorage.setItem('portfolio-lang', 'en');
    render(<MusicProfile data={music} />, { wrapper });

    expect(screen.getByText('Acoustic guitar')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Instruments I play' })).toBeInTheDocument();
  });

  it('campos preenchidos aparecem; kickers ON REPEAT e APRENDENDO AGORA', () => {
    render(
      <MusicProfile
        data={{
          ...emptyMusic,
          instruments: [
            {
              id: 'bass',
              name: { pt: 'Baixo', en: 'Bass' },
              since: 2020,
              level: { pt: 'iniciante', en: 'beginner' },
            },
          ],
          practice: [{ id: 'p', title: 'Música X', instrumentId: 'bass' }],
          songs: [
            { id: 's1', title: 'Faixa A', artist: 'Artista A', onRepeat: true },
            { id: 's2', title: 'Faixa B', artist: 'Artista B' },
          ],
        }}
      />,
      { wrapper },
    );

    expect(screen.getByText('iniciante · desde 2020')).toBeInTheDocument();
    expect(screen.getByText('APRENDENDO AGORA')).toBeInTheDocument();
    expect(screen.getAllByText('EM ROTAÇÃO')).toHaveLength(1);
    expect(screen.getByText('Música X')).toBeInTheDocument();
  });

  it('sem nada, não renderiza seção', () => {
    render(<MusicProfile data={emptyMusic} />, { wrapper });

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});

describe('TheaterProfile', () => {
  it('curadoria vazia: nenhuma seção', () => {
    render(<TheaterProfile />, { wrapper });

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('seções preenchidas; referência com link externo seguro, só se houver url', () => {
    render(
      <TheaterProfile
        data={{
          ...emptyTheater,
          experiences: [{ id: 'e', title: { pt: 'Vivência', en: 'Experience' }, period: '2019' }],
          observations: [{ id: 'o', text: { pt: 'Observação', en: 'Observation' } }],
          references: [
            { id: 'r1', title: { pt: 'Com link', en: 'With link' }, url: 'https://example.org/' },
            { id: 'r2', title: { pt: 'Sem link', en: 'No link' } },
          ],
        }}
      />,
      { wrapper },
    );

    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Vivências',
      'Observações',
      'Referências visuais',
    ]);

    const link = screen.getByRole('link', { name: 'abrir referência →' });

    expect(link).toHaveAttribute('href', 'https://example.org/');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
