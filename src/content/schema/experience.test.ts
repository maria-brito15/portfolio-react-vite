import { experienceGroups as oldGroups } from '../../data/experiences';
import { parsePeriodStart } from '../../utils/projectDate';
import { formatPath } from './errors';
import { ExperienceGroupsSchema } from './index';

const loc = (pt: string, en = pt) => ({ pt, en });

// Item de EXEMPLO para teste (não é conteúdo real).
const item = (over: Record<string, unknown> = {}) => ({
  id: 'exemplo',
  period: { start: { year: 2025 }, label: loc('2025–2026') },
  org: loc('Org'),
  role: loc('Papel'),
  description: loc('Descrição'),
  ...over,
});
const group = (items: unknown[], id = 'g1') => ({ id, title: loc('Grupo'), items });

function problems(value: unknown): string[] {
  const result = ExperienceGroupsSchema.safeParse(value);

  return result.success
    ? []
    : result.error.issues.map((i) => `${formatPath(i.path)}: ${i.message}`);
}

describe('ExperienceGroupsSchema', () => {
  it('os 7 períodos reais passam com o início que parsePeriodStart extrai', () => {
    const converted = oldGroups.map((g) => ({
      id: g.id,
      title: g.title,
      items: g.items.map((it) => ({
        id: it.id,
        period: { start: parsePeriodStart(it.period.pt), label: it.period },
        org: typeof it.org === 'string' ? loc(it.org) : it.org,
        role: it.role,
        description: it.description,
      })),
    }));

    expect(converted.flatMap((g) => g.items)).toHaveLength(7);
    expect(problems(converted)).toEqual([]);
  });

  it('mês inventado: rótulo 03/2025 sem start.month falha', () => {
    const bad = group([item({ period: { start: { year: 2025 }, label: loc('03/2025') } })]);

    expect(problems([bad])).toContainEqual(
      expect.stringContaining('[0].items[0].period.label.pt: o rótulo mostra mês'),
    );
  });

  it('mês no início que o rótulo não mostra falha', () => {
    const bad = group([
      item({ period: { start: { year: 2025, month: 3 }, label: loc('2025–2026') } }),
    ]);

    expect(problems([bad])).toContain(
      '[0].items[0].period.label.pt: o rótulo do período não mostra o mês (03/2025)',
    );
  });

  it('ano divergente falha', () => {
    const bad = group([item({ period: { start: { year: 2024 }, label: loc('2025–2026') } })]);

    expect(problems([bad])).toContain(
      '[0].items[0].period.label.pt: o rótulo do período não contém o ano de início (2024)',
    );
  });

  it('id repetido entre grupos falha nomeando o item', () => {
    expect(problems([group([item()], 'a'), group([item()], 'b')])).toContain(
      '[1].items[0].id: identificador repetido "exemplo" (já usado no grupo "a")',
    );
  });

  it('grupo vazio falha', () => {
    expect(problems([group([])]).join('\n')).toContain('[0].items');
  });

  it('id de grupo repetido falha', () => {
    expect(problems([group([item({ id: 'a' })]), group([item({ id: 'b' })])])).toContain(
      '[1].id: identificador de grupo repetido "g1"',
    );
  });

  it('highlight ausente é válido e `tag` é opcional', () => {
    expect(
      problems([group([item({ highlight: true, tag: loc('Equipe') }), item({ id: 'b' })])]),
    ).toEqual([]);
  });

  it('campo desconhecido é recusado', () => {
    expect(problems([group([item({ end: { year: 2026 } })])]).join('\n')).toContain('end');
  });
});
