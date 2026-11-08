// Caixa com borda, fundo e raio padrão. É a base de todos os cartões do site
// (experiências, formação, números de destaque…); `as` troca a tag.
export default function Card({ as: Tag = 'div', className = '', ...rest }) {
  return <Tag className={`card ${className}`.trim()} {...rest} />;
}
