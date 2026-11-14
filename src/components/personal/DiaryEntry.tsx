import type { FilmDiaryEntry } from '../../data/personal/types';
import { formatDay } from '../../data/personal/review';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';
import Chip from '../ui/Chip';
import FilmPoster from './FilmPoster';
import RatingStars from './RatingStars';
import ReviewBlock from './ReviewBlock';
import SourceBadge from './SourceBadge';

// Uma entrada do diário: título, ano, nota, dia e marcas (série, revisto, curtido). A resenha só
// aparece ao expandir (D8) e some se a Duda marcou `publish: false`. O pôster só entra quando há
// imagem: ao lado do título, um placeholder com o mesmo texto seria repetição.
export default function DiaryEntry({ entry }: { entry: FilmDiaryEntry }) {
  const { lang } = useLanguage();
  const p = usePersonalText();
  const text = p.films;
  const day = entry.watchedDate ? formatDay(entry.watchedDate, lang) : '';
  const review = entry.publish === false ? undefined : entry.review;
  const meta = entry.meta;
  const credits = [
    meta?.directors.length ? `${text.directedBy}: ${meta.directors.join(', ')}` : '',
    meta?.genres[lang].join(', ') ?? '',
    meta?.runtimeMin ? text.minutes(meta.runtimeMin) : '',
  ].filter(Boolean);
  const overview = meta?.overview?.[lang];

  return (
    <li className="pe-row">
      {entry.posterUrl && (
        <div className="pe-row-poster">
          <FilmPoster entry={entry} />
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
        {credits.length > 0 && <p className="pe-row-credits">{credits.join(' · ')}</p>}
        {overview && (
          <details className="pe-row-review">
            <summary>{text.synopsis}</summary>
            <p>{overview}</p>
          </details>
        )}
        {review && (
          <details className="pe-row-review">
            <summary>
              {text.openReview}
              {entry.spoiler && ` (${text.spoiler})`}
            </summary>
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
