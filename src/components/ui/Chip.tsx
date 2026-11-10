// Etiqueta pequena e arredondada. `tone="live"` é o verde de "em andamento".
import type { ElementType, HTMLAttributes } from 'react';

interface ChipProps extends HTMLAttributes<HTMLElement> {
  tone?: 'default' | 'live';
  as?: ElementType;
}

export default function Chip({
  tone = 'default',
  as: Tag = 'span',
  className = '',
  ...rest
}: ChipProps) {
  return <Tag className={`chip chip--${tone} ${className}`.trim()} {...rest} />;
}
