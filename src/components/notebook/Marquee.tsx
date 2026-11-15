import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { now } from '../../data/now';
import { useCulture } from './useCulture';

// Faixa cultural sob a barra (CD-31, CD-32): lendo, último filme e cenário atual, a partir dos
// feeds e de `now.ts`. Item sem dado é omitido; sem nenhum, a faixa não existe. Pausa por botão
// (sempre visível), hover e foco. Some com `prefers-reduced-motion` (CSS).
export default function Marquee() {
  const { lang, t } = useLanguage();
  const { book, film, bookSample, filmSample } = useCulture();
  const [paused, setPaused] = useState(false);
  const m = t.nb.marquee;
  const focus = now.items[0]?.text[lang];
  const sample = ` (${m.sample})`;

  const items: string[] = [];

  if (book) items.push(`📖 ${m.reading} ${book.title}${bookSample ? sample : ''}`);
  if (film) items.push(`🎬 ${m.film} ${film.title}${filmSample ? sample : ''}`);
  if (focus) items.push(`✍︎ ${m.focus}: ${focus}`);

  if (!items.length) return null;

  const line = items.join('  ·  ');

  return (
    <div className={`nb-marquee${paused ? ' is-paused' : ''}`} role="group" aria-label={m.label}>
      <div className="nb-marquee-view">
        <div className="nb-marquee-track">
          <span className="nb-marquee-text">{line}</span>
          <span className="nb-marquee-text" aria-hidden="true">
            {line}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="nb-marquee-btn"
        aria-pressed={paused}
        aria-label={paused ? m.resumeLabel : m.pauseLabel}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? m.resume : m.pause}
      </button>
    </div>
  );
}
