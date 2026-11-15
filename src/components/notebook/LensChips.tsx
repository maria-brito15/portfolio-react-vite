import { useLanguage } from '../../i18n/LanguageContext';
import { usePersona } from '../../hooks/usePersona';
import { personas } from '../../data/personas';

// Lente de leitura (CD-15): as cinco personas como chips. Clicar escolhe a lente (reordena o sommaire
// e troca a epígrafe); clicar no chip ativo a limpa. Nunca abre modal e nunca esconde conteúdo.
export default function LensChips() {
  const { t } = useLanguage();
  const { persona, choose, clear } = usePersona();

  return (
    <div className="nb-lens">
      <p className="nb-lens-intro" id="nb-lens-intro">
        {t.nb.lensIntro}
      </p>
      <div role="group" aria-label={t.nb.lensLabel} aria-describedby="nb-lens-intro" className="nb-lens-chips">
        {personas.map((p) => {
          const active = persona?.id === p.id;

          return (
            <button
              key={p.id}
              type="button"
              className={`nb-chip${active ? ' is-active' : ''}`}
              aria-pressed={active}
              onClick={() => (active ? clear() : choose(p.id))}
            >
              <span aria-hidden="true">{t.nb.lensEmoji[p.id]}</span> {t.nb.lens[p.id]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
