import type { ReactNode } from 'react';
import type { Tone } from '../../data/tones';

// Cabeça de página editorial: número, kicker em caixa alta, título em peso 700 e uma linha de
// apoio (lede). O `<h1>` é o título; número e kicker ficam fora dele para não poluir a leitura
// de tela, e o número é decorativo.
export default function EditorialHeader({
  number,
  kicker,
  title,
  deck,
  tone,
}: {
  number?: string;
  kicker: string;
  title: string;
  deck?: ReactNode;
  tone?: Tone;
}) {
  return (
    <header className="pe-head" data-tone={tone}>
      {number && (
        <span className="pe-number" aria-hidden="true">
          {number}
        </span>
      )}
      <p className="pe-kicker">{kicker}</p>
      <h1 className="pe-title">{title}</h1>
      {deck && <p className="pe-deck">{deck}</p>}
    </header>
  );
}
