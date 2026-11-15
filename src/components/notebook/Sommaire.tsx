import { useLanguage } from '../../i18n/LanguageContext';
import { usePersona } from '../../hooks/usePersona';
import { projects } from '../../data/projects';
import { SOMMAIRE, sortByLens, type SommaireKey } from '../../data/notebook/chapters';
import { featuredProjectIds } from '../../data/notebook/featured';
import { useCulture } from './useCulture';
import SommaireRow, { type Thumb } from './SommaireRow';

// Miniatura da linha WORK: a primeira captura de um projeto em destaque, na ordem de `featured.ts`.
function workThumb(): Thumb | undefined {
  for (const id of featuredProjectIds) {
    const image = projects.find((p) => p.id === id)?.gallery[0];

    if (image) return { src: image };
  }

  return undefined;
}

// Seções da home em tiles (revisão R1; era o sommaire em seis linhas, CD-11). CINEMA mostra o pôster
// do filme mais recente, LIBRARY a capa do livro em leitura, WORK a captura do projeto em destaque;
// as demais, o cartaz tipográfico. A lente só reordena os tiles (nunca esconde).
export default function Sommaire() {
  const { t } = useLanguage();
  const { persona } = usePersona();
  const { book, film } = useCulture();
  const thumbs: Partial<Record<SommaireKey, Thumb | undefined>> = {
    work: workThumb(),
    cinema: film ? { src: film.posterUrl ?? film.meta?.posterUrl ?? '' } : undefined,
    library: book?.coverUrl ? { src: book.coverUrl } : undefined,
  };

  return (
    <section className="nb-sommaire" aria-labelledby="sommaire-title">
      <h2 className="nb-section-title" id="sommaire-title" tabIndex={-1}>
        {t.nb.sommaireTitle}
      </h2>
      <div id="sommaire" tabIndex={-1} className="nb-sommaire-anchor" />
      <ol className="nb-tiles" aria-label={t.nb.sommaireLabel}>
        {sortByLens(SOMMAIRE, persona?.id).map((entry) => {
          const thumb = thumbs[entry.key];

          return (
            <li key={entry.key}>
              <SommaireRow entry={entry} thumb={thumb?.src ? thumb : undefined} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
