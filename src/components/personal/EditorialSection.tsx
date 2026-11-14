import { useId, type ReactNode } from 'react';

// Seção editorial: título em caixa alta com filete, ligado à seção por `aria-labelledby`. É o
// bloco que as páginas repetiam à mão (mês, ano, "lendo agora", "em rotação"…).
export default function EditorialSection({
  title,
  children,
  as: Tag = 'section',
}: {
  title: string;
  children: ReactNode;
  as?: 'section' | 'aside';
}) {
  const id = useId();

  return (
    <Tag className="pe-month" aria-labelledby={id}>
      <h2 id={id} className="pe-month-title">
        {title}
      </h2>
      {children}
    </Tag>
  );
}
