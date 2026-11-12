import { useLanguage } from '../i18n/LanguageContext';
import { isCrawler } from '../utils/env';
import { useTrail } from './TrailProvider';
import TrailProgress from './TrailProgress';

// Cartão da trilha na home (docs/specs/trilhas/): o convite para começar, continuar ou
// refazer a trilha da persona escolhida. Nunca inicia sozinho (TR-07), some com "Agora
// não" e volta com o comando `trilha` (TR-08). Sem persona, ou para robôs, não aparece.
export default function TrailCard() {
  const { lang, t } = useLanguage();
  const { trail, steps, progress, doneCount, found, start, restart, dismiss } = useTrail();
  const text = t.trail;

  if (!trail || progress.dismissed || isCrawler()) return null;

  const started = doneCount > 0 || progress.step > 0;

  return (
    <section className="trail-card" aria-labelledby="trail-card-title">
      <div className="trail-card-head">
        <h2 id="trail-card-title">{trail.title[lang]}</h2>
        <span className="t-dim">{text.steps(steps.length)}</span>
        {progress.finished && <span className="trail-seal">{text.completed}</span>}
      </div>

      <p className="trail-intro">{trail.intro[lang]}</p>
      <TrailProgress trail={trail} done={doneCount} total={steps.length} found={found} />

      <div className="trail-actions">
        {progress.finished ? (
          <button type="button" className="dash-btn dash-btn--primary" onClick={restart}>
            {text.restart}
          </button>
        ) : (
          <button type="button" className="dash-btn dash-btn--primary" onClick={start}>
            {started ? text.resume(doneCount, steps.length) : text.start}
          </button>
        )}
        <button type="button" className="persona-link" onClick={dismiss}>
          {text.notNow}
        </button>
      </div>
    </section>
  );
}
