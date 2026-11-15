import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { routeById } from '../../data/routes';
import { useCulture } from './useCulture';
import ActivityFeed from './ActivityFeed';

const HOME_LIMIT = 4;

// "Atividade recente" na home (revisão R1, CD-93): os últimos eventos com data dos feeds de livros e
// filmes, com link para o feed completo em /pessoal. Sem nenhum evento, a seção não existe (nada de
// lista vazia na capa); com dado do mock, o rótulo "dados de exemplo".
export default function RecentActivity() {
  const { lang, t } = useLanguage();
  const { activity, bookSample, filmSample } = useCulture();
  const personal = routeById('pessoal');

  if (!activity.length) return null;

  return (
    <section className="nb-recent" aria-labelledby="nb-recent-title">
      <div className="nb-recent-head">
        <h2 className="nb-section-title" id="nb-recent-title">
          {t.nb.activity.recent}
        </h2>
        {(bookSample || filmSample) && <p className="nb-placeholder">{t.nb.activity.sample}</p>}
      </div>
      <ActivityFeed items={activity.slice(0, HOME_LIMIT)} expandable={false} />
      {personal && (
        <Link to={personal.path} className="nb-library-all">
          {t.nb.activity.all} — {personal.label[lang]} →
        </Link>
      )}
    </section>
  );
}
