import type { ReactNode } from 'react';
import { usePersonalText } from '../../i18n/usePersonalText';

// Os quatro estados do espaço cultural com a mesma geometria (filete à esquerda, mesmo corpo de
// texto): carregando, vazio, erro e vencido (`StaleNotice`). Só o filete e o papel mudam, e a cor
// é reforço: o texto sempre diz o que está acontecendo.

export function Loading() {
  const p = usePersonalText();

  return (
    <p className="pe-state pe-state--loading" role="status">
      {p.state.loading}
    </p>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="pe-state pe-state--empty">{children}</p>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const p = usePersonalText();
  const text = p.state;

  return (
    <p className="pe-state pe-state--error" role="alert">
      {text.error}{' '}
      <button type="button" className="btn-o" onClick={onRetry}>
        {text.retry}
      </button>
    </p>
  );
}
