// Título de seção único do site: rótulo pequeno opcional ("Sobre mim"), o
// título e, nas páginas de documento, o número da seção (`index`).
// `size="md"` é a versão compacta usada dentro das janelas de Currículo e Acadêmico.
export default function SectionTitle({
  id,
  label,
  index,
  size = 'lg',
  center = false,
  as: Tag = 'h2',
  children,
}) {
  return (
    <>
      {label && <div className={`lbl${center ? ' lbl--center' : ''}`}>{label}</div>}
      <Tag className={`stitle stitle--${size}${center ? ' stitle--center' : ''}`} id={id}>
        {index != null && (
          <span className="doc-num" aria-hidden="true">
            {String(index).padStart(2, '0')}
          </span>
        )}
        {children}
      </Tag>
    </>
  );
}
