// Etiqueta pequena e arredondada. `tone="live"` é o verde de "em andamento".
export default function Chip({ tone = 'default', as: Tag = 'span', className = '', ...rest }) {
  return <Tag className={`chip chip--${tone} ${className}`.trim()} {...rest} />;
}
