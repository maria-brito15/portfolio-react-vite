import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { routeById } from '../../data/routes';
import { GROUP_TONE, ROUTE_GLYPH } from '../../data/tones';
import SectionTitle from '../ui/SectionTitle';

// Atalhos para os destinos principais. Cada um é uma rota real de routes.ts
// (rótulo e descrição vêm de lá); rascunhos ficam de fora.
const QUICK = [
  'projetos',
  'github',
  'habilidades',
  'curriculo',
  'academico',
  'jogos',
  'terminal',
  'contato',
];

export default function QuickAccess() {
  const { lang, t } = useLanguage();
  const items = QUICK.map((id) => routeById(id)).filter((r) => r && !r.draft);

  return (
    <section className="dash-section" aria-labelledby="quick-title">
      <SectionTitle as="h2" id="quick-title" size="md">
        {t.ws.home.quick}
      </SectionTitle>
      <ul className="quick-grid">
        {items.map(
          (r) =>
            r && (
              <li key={r.id}>
                <Link
                  to={r.path}
                  className="quick-tile"
                  data-tone={r.group ? GROUP_TONE[r.group] : undefined}
                >
                  <span className="quick-icon" aria-hidden="true">
                    {ROUTE_GLYPH[r.id]}
                  </span>
                  <strong>{r.label[lang]}</strong>
                  <span className="t-dim">{r.desc?.[lang]}</span>
                </Link>
              </li>
            ),
        )}
      </ul>
    </section>
  );
}
