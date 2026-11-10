import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

// Acordeão de perguntas frequentes: um item aberto por vez, como no original.
// Setas para cima/baixo, Home e End movem o foco entre as perguntas.
export default function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = items.length - 1;
    const target = (
      {
        ArrowDown: i === last ? 0 : i + 1,
        ArrowUp: i === 0 ? last : i - 1,
        Home: 0,
        End: last,
      } as Record<string, number>
    )[event.key];

    if (target === undefined) return;
    event.preventDefault();
    buttons.current[target]?.focus();
  }

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const open = openIndex === i;
        const qId = `${baseId}-q${i}`;
        const aId = `${baseId}-a${i}`;

        return (
          <div className="faq-item" key={qId}>
            <h4 className="faq-heading">
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                id={qId}
                type="button"
                className="faq-q"
                aria-expanded={open}
                aria-controls={aId}
                onClick={() => setOpenIndex(open ? null : i)}
                onKeyDown={(event) => onKeyDown(event, i)}
              >
                <span>{item.q}</span>
                <svg
                  className="faq-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </h4>
            <div
              id={aId}
              role="region"
              aria-labelledby={qId}
              className={`faq-a${open ? ' open' : ''}`}
              inert={!open}
            >
              <div className="faq-a-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
