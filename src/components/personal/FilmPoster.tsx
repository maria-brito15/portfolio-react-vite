import type { FilmDiaryEntry } from '../../data/personal/types';
import CoverFigure from './CoverFigure';

// Pôster de um filme do diário (proporção 2:3): imagem com título e ano no `alt`, ou o placeholder
// tipográfico se a imagem faltar ou quebrar. Visual apenas.
export default function FilmPoster({
  entry,
  width = 60,
  height = 90,
}: {
  entry: Pick<FilmDiaryEntry, 'title' | 'year' | 'posterUrl'>;
  width?: number;
  height?: number;
}) {
  const alt = entry.year === undefined ? entry.title : `${entry.title} (${entry.year})`;

  return (
    <CoverFigure
      src={entry.posterUrl}
      alt={alt}
      title={entry.title}
      year={entry.year}
      width={width}
      height={height}
    />
  );
}
