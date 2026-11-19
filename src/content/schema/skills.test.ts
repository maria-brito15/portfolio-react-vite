import { formatPath } from './errors';
import { SkillGroupsSchema } from './index';

const loc = (pt: string, en = pt) => ({ pt, en });

// Dados de EXEMPLO para teste (não são conteúdo real).
const group = (items: unknown[], id = 'languages') => ({
  id,
  title: loc('Linguagens', 'Languages'),
  items,
});

function problems(value: unknown): string[] {
  const result = SkillGroupsSchema.safeParse(value);

  return result.success
    ? []
    : result.error.issues.map((i) => `${formatPath(i.path)}: ${i.message}`);
}

describe('SkillGroupsSchema', () => {
  it('competência com ano e fonte é válida', () => {
    expect(problems([group([{ name: 'Java', since: 2025, source: loc('Projeto X') }])])).toEqual(
      [],
    );
  });

  it('competência sem fonte e sem ano é válida (nunca ano estimado)', () => {
    expect(problems([group([{ name: 'Docker' }])])).toEqual([]);
  });

  it('since sem source falha, e o inverso falha', () => {
    expect(problems([group([{ name: 'Java', since: 2025 }])])).toContain(
      '[0].items[0].source: ano de início sem fonte (informe o projeto ou curso, ou omita os dois)',
    );
    expect(problems([group([{ name: 'Java', source: loc('X') }])])).toContain(
      '[0].items[0].since: fonte sem ano de início (informe o ano, ou omita os dois)',
    );
  });

  it('since 99999 e since "2020" falham', () => {
    expect(problems([group([{ name: 'A', since: 99999, source: loc('x') }])]).join('\n')).toContain(
      'items[0].since',
    );
    expect(
      problems([group([{ name: 'A', since: '2020', source: loc('x') }])]).join('\n'),
    ).toContain('items[0].since');
  });

  it('since fracionado falha', () => {
    expect(problems([group([{ name: 'A', since: 2020.5, source: loc('x') }])])).toContain(
      '[0].items[0].since: ano não é inteiro',
    );
  });

  it('nome repetido no grupo falha; o mesmo nome em outro grupo é válido', () => {
    expect(problems([group([{ name: 'Java' }, { name: 'Java' }])])).toContain(
      '[0].items[1].name: competência repetida no grupo "Java"',
    );
    expect(problems([group([{ name: 'Java' }], 'a'), group([{ name: 'Java' }], 'b')])).toEqual([]);
  });

  it('grupo vazio e id de grupo repetido falham', () => {
    expect(problems([group([])]).join('\n')).toContain('[0].items');
    expect(problems([group([{ name: 'A' }]), group([{ name: 'B' }])])).toContain(
      '[1].id: identificador de grupo repetido "languages"',
    );
  });

  it('título sem EN falha nomeando o idioma', () => {
    const bad = [{ id: 'g', title: { pt: 'x' }, items: [{ name: 'A' }] }];

    expect(problems(bad)).toContain('[0].title.en: texto ausente');
  });
});
