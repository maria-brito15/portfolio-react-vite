import { useLanguage } from '../i18n/LanguageContext';
import { usePersona } from '../hooks/usePersona';
import { homeFor } from '../data/personaHome';
import { usePerspectives } from '../hooks/usePerspectives';

// A perspectiva do projeto para a persona ativa (`projectPerspectives.ts`): um resumo e até
// três destaques, num bloco com a cor da persona, separado dos fatos gerais do cartão (que
// continuam todos ali). Sem persona, ou sem perspectiva para ela, não renderiza nada.
export default function ProjectLens({ projectId }: { projectId: string }) {
  const { lang } = useLanguage();
  const { persona } = usePersona();
  const perspectives = usePerspectives(Boolean(persona));
  const lens = perspectives?.perspectiveFor(projectId, persona?.id);

  if (!persona || !perspectives || !lens) return null;

  const { PERSPECTIVE_LABEL } = perspectives;

  return (
    <aside
      className="proj-lens"
      data-tone={homeFor(persona.id).tone}
      aria-label={PERSPECTIVE_LABEL[persona.id][lang]}
    >
      <p className="proj-lens-label" aria-hidden="true">
        {PERSPECTIVE_LABEL[persona.id][lang]}
      </p>
      <p className="proj-lens-summary">{lens.summary[lang]}</p>
      <ul className="proj-lens-points">
        {lens.highlights.map((h) => (
          <li key={h.pt}>{h[lang]}</li>
        ))}
      </ul>
    </aside>
  );
}
