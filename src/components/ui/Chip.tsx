// Etiqueta pequena e arredondada. `tone="live"` é o verde de "em andamento".
import type { ElementType, HTMLAttributes } from 'react';
import type { Tone } from '../../data/tones';

interface ChipProps extends HTMLAttributes<HTMLElement> {
  tone?: 'default' | 'live';
  // Cor de categoria (data/tones.ts); sem ela o chip usa o acento primário.
  accent?: Tone;
  as?: ElementType;
}

export default function Chip({
  tone = 'default',
  accent,
  as: Tag = 'span',
  className = '',
  ...rest
}: ChipProps) {
  return <Tag className={`chip chip--${tone} ${className}`.trim()} data-tone={accent} {...rest} />;
}
