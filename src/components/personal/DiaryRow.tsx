import type { FilmDiaryEntry } from '../../data/personal/types';
import { formatDay } from '../../data/personal/review';
import { useLanguage } from '../../i18n/LanguageContext';
import Chip from '../ui/Chip';
import CoverFigure from './CoverFigure';
import RatingStars from './RatingStars';
import ReviewBlock from './ReviewBlock';
import SourceBadge from './SourceBadge';

// Uma linha do diário: título, ano, nota, dia e marcas (série, revisto, curtido). A resenha só
// aparece ao expandir (D8) e some se a Duda marcou `publish: false`. O pôster só entra quando há
// imagem: ao lado do título, um placeholder com o mesmo texto seria repetição.
export default function DiaryRow({ entry }: { entry: FilmDiaryEntry }) {
  const { lang, t } = useLanguage();
  const text = t.personal.films;
  const day = entry.watchedDate ? formatDay(entry.watchedDate, lang) : '';
  const review = entry.publish === false ? undefined : entry.review;
  const alt = entry.year === undefined ? entry.title : `${entry.title} (${entry.year})`;

  return (
    <li className="pe-row">
      {entry.posterUrl && (
        <div className="pe-row-poster">
          <CoverFigure
            src={entry.posterUrl}
            alt={alt}
            title={entry.title}
            year={entry.year}
            width={60}
            height={90}
          />
        </div>
      )}
      <div className="pe-row-body">
        <p className="pe-row-title">
          {entry.title}
          {entry.year !== undefined && <span className="pe-row-year"> ({entry.year})</span>}
        </p>
        <p className="pe-row-meta">
          <RatingStars rating={entry.rating} />
          {day && <span>{day}</span>}
          {entry.kind === 'tv' && <Chip accent="cyan">{text.series}</Chip>}
          {entry.rewatch && <Chip accent="violet">{text.rewatch}</Chip>}
          {entry.liked && <Chip accent="pink">♥ {text.liked}</Chip>}
          <SourceBadge provenance={entry.provenance} />
        </p>
        {review && (
          <details className="pe-row-review">
            <summary>{text.openReview}</summary>
            <ReviewBlock review={review} url={entry.reviewUrl} />
          </details>
        )}
        <a className="pe-row-link" href={entry.reviewUrl} target="_blank" rel="noopener noreferrer">
          {text.entryLink}
        </a>
      </div>
    </li>
  );
}
