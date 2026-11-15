import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { NAV_GROUPS, navRoutes, routeById, type Route } from '../../data/routes';
import { SOMMAIRE } from '../../data/notebook/chapters';
import Overlay from '../Overlay';

// Índice em tela cheia (CD-13): as seções (sem número de capítulo desde a revisão R1) e, abaixo, TODAS as demais rotas listadas em `routes.ts`,
// para nenhuma página ficar órfã. Rascunhos continuam ocultos (`isListed`).
export function indexRoutes(): Route[] {
  const inSommaire = new Set(SOMMAIRE.map((e) => e.routeId));
  const seen = new Set<string>();

  return NAV_GROUPS.flatMap((group) => navRoutes(group)).filter((r) => {
    if (r.id === 'home' || inSommaire.has(r.id) || seen.has(r.id)) return false;
    seen.add(r.id);

    return true;
  });
}

export default function IndexOverlay({ onClose }: { onClose: () => void }) {
  const { lang, t } = useLanguage();
  const others = indexRoutes();

  return (
    <Overlay label={t.nb.indexTitle} onClose={onClose}>
      <div className="nb-index">
        <header className="nb-index-head">
          <p className="nb-kicker">{t.nb.indexTitle}</p>
          <button type="button" className="nb-btn" onClick={onClose} aria-label={t.nb.indexClose}>
            ✕
          </button>
        </header>
        <ol className="nb-index-list" aria-label={t.nb.sommaireLabel}>
          {SOMMAIRE.map((entry) => {
            const route = entry.routeId ? routeById(entry.routeId) : undefined;
            const row = t.nb.rows[entry.key];
            // A linha navega sempre que a rota existe (rascunho abre com o aviso "em construção");
            // sem rota (WRITING) é só o placeholder "em breve".
            const target = route;
            const body = (
              <>
                <span className="nb-index-name">{row.name}</span>
                <span className="nb-index-desc">{row.desc}</span>
              </>
            );

            return (
              <li key={entry.key}>
                {target ? (
                  <Link to={target.path} className="nb-index-row" onClick={onClose}>
                    {body}
                  </Link>
                ) : (
                  <span className="nb-index-row is-soon">
                    {body}
                    <span className="nb-soon">{t.nb.indexSoon}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        {others.length > 0 && (
          <nav aria-label={t.nb.indexOther}>
            <p className="nb-kicker">{t.nb.indexOther}</p>
            <ul className="nb-index-others">
              {others.map((r) => (
                <li key={r.id}>
                  <Link to={r.path} onClick={onClose}>
                    {r.label[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </Overlay>
  );
}
