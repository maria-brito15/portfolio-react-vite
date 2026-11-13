import { Link } from '../../router';

export interface SectionIndexItem {
  to: string;
  title: string;
  hint?: string;
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
          <li key={item.to}>
            <Link to={item.to}>
              <span className="pe-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="pe-index-title">{item.title}</span>
              {item.hint && <span className="pe-index-hint">{item.hint}</span>}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
