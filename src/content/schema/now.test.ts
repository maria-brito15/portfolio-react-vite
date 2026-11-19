import { formatPath } from './errors';
import { NowSchema, UsesSchema } from './index';

const loc = (pt: string, en = pt) => ({ pt, en });

// Dados de EXEMPLO para teste (não são conteúdo real).
const item = { label: loc('Foco', 'Focus'), text: loc('Algo', 'Something') };

function problems(schema: typeof NowSchema | typeof UsesSchema, value: unknown): string[] {
  const result = schema.safeParse(value);

  return result.success
    ? []
    : result.error.issues.map((i) => `${formatPath(i.path)}: ${i.message}`);
}

describe('NowSchema', () => {
  it('itens com data válida passam', () => {
    expect(problems(NowSchema, { updated: '2026-11-11', items: [item] })).toEqual([]);
  });

  it('2026-02-30 falha', () => {
    expect(problems(NowSchema, { updated: '2026-02-30', items: [item] })).toContain(
      'updated: dia inexistente em 2026-02 (recebido 30)',
    );
  });

  it('itens sem `updated` falham dizendo que a data é obrigatória', () => {
    expect(problems(NowSchema, { items: [item] })).toContain(
      'updated: a data de atualização é obrigatória quando há itens (AAAA-MM-DD)',
    );
  });

  it('{ items: [] } sem `updated` é válido', () => {
    expect(problems(NowSchema, { items: [] })).toEqual([]);
  });

  it('item sem EN falha', () => {
    const bad = { updated: '2026-11-11', items: [{ label: loc('x'), text: { pt: 'só PT' } }] };

    expect(problems(NowSchema, bad)).toContain('items[0].text.en: texto ausente');
  });
});

describe('UsesSchema', () => {
  it('{ groups: [] } é válido (rascunho)', () => {
    expect(problems(UsesSchema, { groups: [] })).toEqual([]);
  });

  it('grupo com itens e nota opcional é válido', () => {
    const value = {
      groups: [
        {
          title: loc('Editor'),
          items: [{ name: 'Ferramenta' }, { name: 'Outra', note: loc('nota') }],
        },
      ],
    };

    expect(problems(UsesSchema, value)).toEqual([]);
  });

  it('data inválida em `uses` falha', () => {
    expect(problems(UsesSchema, { updated: '2026-13-01', groups: [] }).join('\n')).toContain(
      'updated: mês fora de 1 a 12',
    );
  });
});
