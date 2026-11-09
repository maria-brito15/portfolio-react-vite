// Tabela de dados única: cabeçalho, linhas, estado vazio e rodapé opcionais.
// `columns`: [{ key, label, size?: 's' | 'm' | 'l', className?, render?(row) }].
// Com `stack`, em telas estreitas cada linha vira um cartão.
export default function DataTable({
  columns,
  rows,
  rowKey,
  empty,
  footer,
  stack = false,
  className = '',
}) {
  const span = columns.length;

  return (
    <div className="data-table-wrap">
      <table
        className={['data-table', stack && 'data-table--stack', className]
          .filter(Boolean)
          .join(' ')}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th scope="col" key={col.key} className={col.size ? `col-${col.size}` : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && empty && (
            <tr className="data-table-empty">
              <td colSpan={span}>{empty}</td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td key={col.key} className={col.className}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot>
            <tr>
              <td colSpan={span}>{footer}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
