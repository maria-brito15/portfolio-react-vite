import { useLanguage } from '../../i18n/LanguageContext';
import { usePersona } from '../../hooks/usePersona';
import { routeById } from '../../data/routes';
import { chapterFor } from '../../data/notebook/chapters';
import { pickEpigraph } from '../../data/notebook/epigraphs';

// Cabeçalho de seção (CD-17; revisão R1 tira o "CAPÍTULO nn"), no lugar da Window: filete quente
// (o marcador de CD-33), nome da seção em mono, kicker e a epígrafe. O título do capítulo é o `h1` da própria página (todas as páginas
// já trazem o seu, estilizado em serifa por `.nb-page h1`), então aqui não há outro `h1`.
export default function ChapterHeader({ routeId }: { routeId: string }) {
  const { lang, t } = useLanguage();
  const { persona } = usePersona();
  const chapter = chapterFor(routeId);
  const route = routeById(routeId);

  if (!chapter) return null;

  const name = chapter.key ? t.nb.rows[chapter.key].name : (route?.label[lang] ?? '').toUpperCase();
  const kicker = route?.desc?.[lang];
  const epigraph = pickEpigraph(persona?.id, Number(chapter.number));

  return (
    <header className="nb-chapter" data-chapter={chapter.number}>
      <p className="nb-chapter-line">
        <span className="nb-chapter-n" aria-hidden="true" />
        <span className="nb-chapter-name">{name}</span>
      </p>
      {kicker && <p className="nb-kicker">{kicker}</p>}
      <figure className="nb-epigraph">
        <blockquote>{epigraph[lang]}</blockquote>
        <figcaption>{epigraph.source}</figcaption>
      </figure>
    </header>
  );
}
