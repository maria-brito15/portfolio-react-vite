import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../hooks/useTheme';
import { findTheme } from '../../data/themes';
import { now } from '../../data/now';
import { cover } from '../../data/notebook/cover';
import { prefersReducedMotion } from '../../utils/env';
import PresencePulse from './PresencePulse';

// Capa em tela cheia (CD-10): linha do volume e da edição, nome em serifa, tagline em itálico,
// foco atual com o pulso e "índice ↓". Sem foto configurada, cor sólida rotulada; a tagline provisória
// termina em "TODO: tagline" e também é rotulada. É o único `h1` da home.
export default function Cover() {
  const { lang, t } = useLanguage();
  const [theme] = useTheme();
  const edition = findTheme(theme)?.names[lang] ?? theme;
  const tagline = cover.tagline[lang];
  const focus = now.items[0]?.text[lang];

  function goToIndex(event: React.MouseEvent) {
    event.preventDefault();

    const target = document.getElementById('sommaire');

    target?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    target?.focus({ preventScroll: true });
  }

  return (
    <section
      className={`nb-cover${cover.photo ? ' has-photo' : ' no-photo'}`}
      aria-labelledby="nb-cover-title"
    >
      {cover.photo && (
        <div
          className="nb-cover-photo"
          aria-hidden="true"
          style={{ backgroundImage: `url(${cover.photo})` }}
        />
      )}
      <p className="nb-cover-line">{t.nb.volumeLine(edition)}</p>
      <div className="nb-cover-body">
        <h1 className="nb-cover-name" id="nb-cover-title">
          {t.nb.coverName}
        </h1>
        <p className="nb-cover-tagline">{tagline}</p>
        {focus && (
          <p className="nb-cover-focus">
            <PresencePulse />
            <span className="nb-cover-focus-label">{t.nb.nowFocus}:</span> {focus}
          </p>
        )}
      </div>
      <div className="nb-cover-foot">
        {!cover.photo && <p className="nb-placeholder">{t.nb.coverPhotoPlaceholder}</p>}
        <a href="#sommaire" className="nb-cover-down" onClick={goToIndex}>
          {t.nb.coverIndex} ↓
        </a>
      </div>
    </section>
  );
}
