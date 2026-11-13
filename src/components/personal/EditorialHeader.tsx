import type { ReactNode } from 'react';
import type { Tone } from '../../data/tones';

// Cabeça de página editorial: kicker em caixa alta, título em peso 700 e uma linha de apoio.
// O `<h1>` é o título; o kicker fica fora dele para não poluir a leitura de tela.
export default function EditorialHeader({
  kicker,
  title,
  deck,
  tone,
}: {
  kicker: string;
  title: string;
  deck?: ReactNode;
  tone?: Tone;
}) {
  return (
    <header className="pe-head" data-tone={tone}>
      <p className="pe-kicker">{kicker}</p>
      <h1 className="pe-title">{title}</h1>
      {deck && <p className="pe-deck">{deck}</p>}
    </header>
  );
}
