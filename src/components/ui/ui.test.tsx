import { render, screen, within } from '@testing-library/react';
import Card from './Card';
import Chip from './Chip';
import DataTable, { type Column } from './DataTable';
import SectionTitle from './SectionTitle';

describe('componentes compartilhados', () => {
  it('SectionTitle: rótulo, título e número da seção', () => {
    render(
      <SectionTitle id="x-title" label="Sobre" index={3} size="md">
        Formação
      </SectionTitle>,
    );

    const heading = screen.getByRole('heading', { level: 2, name: /Formação/ });

    expect(heading).toHaveAttribute('id', 'x-title');
    expect(heading).toHaveClass('stitle', 'stitle--md');
    expect(within(heading).getByText('03')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Sobre')).toHaveClass('lbl');
  });

  it('Card e Chip trocam a tag e aceitam classes extras', () => {
    render(
      <ul>
        <Card as="li" className="extra">
          <Chip as="span" tone="live">
            em andamento
          </Chip>
        </Card>
      </ul>,
    );
    expect(screen.getByRole('listitem')).toHaveClass('card', 'extra');
    expect(screen.getByText('em andamento')).toHaveClass('chip', 'chip--live');
  });

  it('DataTable: cabeçalho, linhas, estado vazio e rodapé', () => {
    const columns: Column<{ name: string; n: number }>[] = [
      { key: 'name', label: 'Nome' },
      { key: 'n', label: 'Qtd', size: 's', render: (row) => `${row.n}×` },
    ];
    const { rerender } = render(
      <DataTable
        columns={columns}
        rows={[{ name: 'A', n: 2 }]}
        rowKey={(row) => row.name}
        footer="Total: 2"
        stack
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'Qtd' })).toHaveClass('col-s');
    expect(screen.getByRole('cell', { name: '2×' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Total: 2' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveClass('data-table--stack');

    rerender(
      <DataTable columns={columns} rows={[]} rowKey={(row) => row.name} empty="Nada ainda." />,
    );
    expect(screen.getByRole('cell', { name: 'Nada ainda.' })).toHaveAttribute('colspan', '2');
    expect(screen.queryByText('Total: 2')).toBeNull();
  });
});
