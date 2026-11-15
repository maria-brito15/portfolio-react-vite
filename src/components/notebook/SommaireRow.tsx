import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { routeById } from '../../data/routes';
import type { SommaireEntry } from '../../data/notebook/chapters';

export interface Thumb {
  src: string;
  alt?: string;
}

// Um tile de seção da home (revisão R1; era a linha do sommaire, CD-11): imagem da seção (pôster,
// capa ou captura) ou, sem ela, o cartaz tipográfico; nome em serifa e descrição em mono. O tile
// inteiro navega. Sem rota (WRITING), é só o placeholder "em breve", sem link. Sem número de capítulo.
export default function SommaireRow({ entry, thumb }: { entry: SommaireEntry; thumb?: Thumb }) {
  const { t } = useLanguage();
  const row = t.nb.rows[entry.key];
  const route = entry.routeId ? routeById(entry.routeId) : undefined;
  const content = (
    <>
      <span className={`nb-tile-art${thumb ? '' : ' is-typographic'}`} aria-hidden="true">
        {thumb ? <img src={thumb.src} alt="" loading="lazy" /> : <span className="nb-tile-glyph">{row.name}</span>}
      </span>
      <span className="nb-tile-body">
        <span className="nb-tile-name">{row.name}</span>
        <span className="nb-tile-desc">{row.desc}</span>
      </span>
    </>
  );

  return route ? (
    <Link to={route.path} className="nb-tile" data-row={entry.key}>
      {content}
    </Link>
  ) : (
    <div className="nb-tile is-soon" data-row={entry.key}>
      {content}
      <span className="nb-soon">{t.nb.indexSoon}</span>
    </div>
  );
}
