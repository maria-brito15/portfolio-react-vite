import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { isListed, routeById, routes } from '../../data/routes';
import { GROUP_TONE } from '../../data/tones';
import SectionTitle from '../ui/SectionTitle';
import type { BlockProps } from './blockProps';

// Atalho da home para o espaço cultural (/pessoal): o hub e as seções que já têm conteúdo.
// Só aparece quando a página pode ser listada (`isListed`): no ar, ou em rascunho com dados
// fictícios (prévia); sem conteúdo nenhum, a home não o anuncia. O texto vem do bloco de `homeLayout.ts` e de `routes.ts`.
export default function PersonalSpace({ heading, lead }: BlockProps) {
  const { lang } = useLanguage();
  const hub = routeById('pessoal');

  if (!hub || !isListed(hub)) return null;

  // Com `showInNav` (dados fictícios) o hub mostra todas as seções; senão, só as com conteúdo.
  const tiles = [hub, ...routes.filter((r) => r.parent === hub.id && (!r.draft || hub.showInNav))];

  return (
    <section className="dash-section" aria-labelledby="personal-title">
      <SectionTitle as="h2" id="personal-title" size="md">
        {heading ?? hub.label[lang]}
      </SectionTitle>
      {(lead ?? hub.desc?.[lang]) && <p className="t-dim">{lead ?? hub.desc?.[lang]}</p>}
      <ul className="quick-grid">
        {tiles.map((r) => (
          <li key={r.id}>
            <Link to={r.path} className="quick-tile" data-tone={GROUP_TONE.personal}>
              <strong>{r.label[lang]}</strong>
              <span className="t-dim">{r.desc?.[lang]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
