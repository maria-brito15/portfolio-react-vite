// Um número do espaço cultural (CL-19): rótulo em caixa alta e valor grande em peso 700. Visual
// apenas: quem chama calcula o valor (ver `data/personal/stats.ts`). Sem valor, "—". Use dentro
// de `<StatRow>`, que é a lista de definição que agrupa os números.
import type { ReactNode } from 'react';

export function StatRow({ children }: { children: ReactNode }) {
  return <dl className="pe-stats">{children}</dl>;
}

export default function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value?: string | number;
  hint?: string;
}) {
  return (
    <div className="pe-stat">
      <dt className="pe-stat-label">{label}</dt>
      <dd className="pe-stat-value">{value ?? '—'}</dd>
      {hint && <dd className="pe-stat-hint">{hint}</dd>}
    </div>
  );
}
