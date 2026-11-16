import { problemLine, problemsFromZod } from './errors';
import { ContentDateSchema } from './date';

const FILE = 'src/content/exemplo.content.ts';

function lines(value: unknown) {
  const result = ContentDateSchema.safeParse(value);

  if (result.success) return [];

  return problemsFromZod(FILE, result.error).map((p) =>
    problemLine({ ...p, field: p.field === '(arquivo)' ? 'data' : `data.${p.field}` }),
  );
}

const at = (field: string, reason: string) =>
  `conteúdo inválido: ${FILE} › data.${field} — ${reason}`;

describe('ContentDate', () => {
  it.each([
    { year: 2025 },
    { year: 2025, month: 3 },
    { year: 1000, month: 1 },
    { year: 9999, month: 12 },
  ])('aceita %j', (value) => {
    expect(ContentDateSchema.safeParse(value).success).toBe(true);
  });

  it('mês 13 e mês 0 falham com "mês fora de 1 a 12"', () => {
    expect(lines({ year: 2025, month: 13 })).toEqual([
      at('month', 'mês fora de 1 a 12 (recebido 13)'),
    ]);
    expect(lines({ year: 2025, month: 0 })).toEqual([
      at('month', 'mês fora de 1 a 12 (recebido 0)'),
    ]);
  });

  it('ano "2025" (texto) falha com "ano não é inteiro"', () => {
    expect(lines({ year: '2025' })).toEqual([at('year', 'ano não é inteiro')]);
  });

  it.each([2025.5, null, NaN, Infinity])('ano %j não é inteiro', (year) => {
    expect(lines({ year })).toEqual([at('year', 'ano não é inteiro')]);
  });

  it('ano ausente', () => {
    expect(lines({ month: 3 })).toEqual([at('year', 'ano ausente')]);
  });

  it.each([25, 999, 99999])('ano %d falha com "ano sem 4 dígitos"', (year) => {
    expect(lines({ year })).toEqual([at('year', `ano sem 4 dígitos (recebido ${year})`)]);
  });

  it('mês decimal ou texto não é inteiro', () => {
    expect(lines({ year: 2025, month: 3.5 })).toEqual([at('month', 'mês não é inteiro')]);
    expect(lines({ year: 2025, month: '3' })).toEqual([at('month', 'mês não é inteiro')]);
  });

  it('mês null é recusado (omitir o campo é o jeito de dizer "não confirmado")', () => {
    expect(lines({ year: 2025, month: null })).toEqual([
      at('month', 'mês nulo não é aceito (omita o campo quando não confirmado)'),
    ]);
  });

  it('ano e mês errados saem juntos', () => {
    expect(lines({ year: 25, month: 13 })).toHaveLength(2);
  });

  it('campo com erro de digitação é recusado, em vez de perder o mês em silêncio', () => {
    expect(lines({ year: 2025, mes: 3 })).toEqual([at('mes', 'campo não suportado "mes"')]);
  });

  it('a raiz que não é objeto falha', () => {
    expect(lines('2025')).toEqual([
      `conteúdo inválido: ${FILE} › data — esperado objeto com year e month opcional, recebido texto`,
    ]);
  });

  it('o parse não inventa mês: sem month continua sem month', () => {
    const parsed = ContentDateSchema.parse({ year: 2025 });

    expect('month' in parsed).toBe(false);
  });
});
