import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersona } from '../../hooks/usePersona';
import { intentsFor } from '../../data/intents';
import { routeById } from '../../data/routes';
import Card from '../ui/Card';
import SectionTitle from '../ui/SectionTitle';
import { openPalette } from '../shell/commandBarEvents';
import type { BlockProps } from './blockProps';

// "O que você procura?": cinco atalhos por intenção (`intents.ts`) e um botão para a busca.
// Não pergunta a persona de novo: se ela já foi escolhida, só muda a ordem. Funciona sem ela.
const TEXT = {
  pt: {
    title: 'O que você procura?',
    lead: 'Escolha um caminho ou use a busca.',
    search: 'Buscar no site',
    shortcut: 'Ctrl+K',
  },
  en: {
    title: 'What are you looking for?',
    lead: 'Pick a path or use the search.',
    search: 'Search the site',
    shortcut: 'Ctrl+K',
  },
};

export default function IntentShortcuts({ heading, lead }: BlockProps) {
  const { lang } = useLanguage();
  const { persona } = usePersona();
  const text = TEXT[lang];

  return (
    <section className="dash-section" aria-labelledby="intents-title">
      <SectionTitle as="h2" id="intents-title" size="md">
        {heading ?? text.title}
      </SectionTitle>
      <p className="t-dim">{lead ?? text.lead}</p>
      <ul className="fact-grid intent-grid">
        {intentsFor(persona?.id).map(({ intent, to }) => {
          const route = routeById(to.route);

          if (!route || route.draft) return null;

          return (
            <li key={intent.id}>
              <Card as="article">
                <h3>
                  <Link to={to.anchor ? `${route.path}#${to.anchor}` : route.path}>
                    {intent.label[lang]}
                  </Link>
                </h3>
                <p className="t-dim">{intent.hint[lang]}</p>
              </Card>
            </li>
          );
        })}
      </ul>
      <p>
        <button type="button" className="dash-btn" onClick={openPalette}>
          {text.search} <span className="t-dim">· {text.shortcut}</span>
        </button>
      </p>
    </section>
  );
}
