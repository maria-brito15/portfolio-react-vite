// Caixa com borda, fundo e raio padrão. É a base de todos os cartões do site
// (experiências, formação, números de destaque…); `as` troca a tag.
import type { ElementType, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

export default function Card({ as: Tag = 'div', className = '', ...rest }: CardProps) {
  return <Tag className={`card ${className}`.trim()} {...rest} />;
}
