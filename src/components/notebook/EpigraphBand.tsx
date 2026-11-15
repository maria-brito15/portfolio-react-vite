import { useLanguage } from '../../i18n/LanguageContext';
import { usePersona } from '../../hooks/usePersona';
import { pickEpigraph } from '../../data/notebook/epigraphs';

// Faixa fina de epígrafe logo abaixo da capa (CD-16). A lente prefere algumas, nunca esconde conteúdo.
export default function EpigraphBand() {
  const { lang, t } = useLanguage();
  const { persona } = usePersona();
  const epigraph = pickEpigraph(persona?.id);

  return (
    <figure className="nb-band" aria-label={t.nb.epigraph}>
      <blockquote>{epigraph[lang]}</blockquote>
      <figcaption>{epigraph.source}</figcaption>
    </figure>
  );
}
