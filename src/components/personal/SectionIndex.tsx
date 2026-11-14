import type { ReactNode } from 'react';
import type { Tone } from '../../data/tones';
import { Link } from '../../router';

export interface SectionIndexItem {
  to: string;
  title: string;
  hint?: string;
  // Cor da seção (`data-tone`): só o número, o destaque e o filete mudam.
  tone?: Tone;
  // Destaque da seção ("Lendo agora: …"); some quando não há o que destacar.
  highlight?: { label: string; text: string };
  // Mais destaques da seção (outro livro, pôsteres…). Fica dentro do link: o cartão todo leva à página.
  extra?: ReactNode;
}

// Índice numerado ("01", "02"…) das seções do espaço, no padrão do índice de `DocPage`.
export default function SectionIndex({
  label,
  items,
}: {
  label: string;
  items: SectionIndexItem[];
}) {
  return (
    <nav aria-label={label}>
      <ol className="pe-index">
        {items.map((item, i) => (
          <li key={item.to} data-tone={item.tone}>
            <Link to={item.to}>
              <span className="pe-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="pe-index-title">{item.title}</span>
              {item.hint && <span className="pe-index-hint">{item.hint}</span>}
              {item.highlight && (
                <span className="pe-index-highlight">
                  <span className="pe-kicker">{item.highlight.label}</span> {item.highlight.text}
                </span>
              )}
              {item.extra}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
