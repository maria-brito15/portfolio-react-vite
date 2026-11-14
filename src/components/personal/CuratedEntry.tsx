import type { ReactNode } from 'react';

// Linha editorial das curadorias manuais (música e teatro): número, kicker opcional, título,
// linha de detalhes e nota. Só renderiza o que veio preenchido.
export default function CuratedEntry({
  index,
  kicker,
  title,
  meta,
  note,
  noteLabel,
  children,
}: {
  index: number;
  kicker?: string;
  title: string;
  meta?: string;
  note?: string;
  noteLabel?: string;
  children?: ReactNode;
}) {
  return (
    <li>
      <span className="pe-num" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div>
        {kicker && <p className="pe-kicker">{kicker}</p>}
        <p className="pe-entry-title">{title}</p>
        {meta && <p className="pe-entry-meta">{meta}</p>}
        {note && (
          <p className="pe-entry-note">
            {noteLabel && <span className="pe-kicker">{noteLabel}</span>} {note}
          </p>
        )}
        {children}
      </div>
    </li>
  );
}
