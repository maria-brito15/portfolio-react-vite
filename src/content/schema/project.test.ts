import { formatPath } from './errors';
import { ProjectsSchema, tagIdFromLabel } from './index';

const loc = (pt: string, en = pt) => ({ pt, en });

// Projeto de EXEMPLO para teste (não é conteúdo real).
const project = (over: Record<string, unknown> = {}) => ({
  id: 'exemplo',
  name: loc('Exemplo'),
  start: { year: 2025, month: 3 },
  stack: [{ id: 'react', label: loc('React') }],
  images: [],
  description: loc('Descrição **forte** do exemplo', 'Example **strong** description'),
  ...over,
});

function problems(value: unknown): string[] {
  const result = ProjectsSchema.safeParse(value);

  return result.success
    ? []
    : result.error.issues.map((i) => `${formatPath(i.path)}: ${i.message}`);
}

describe('ProjectsSchema', () => {
  it('projeto completo passa', () => {
    const full = project({
      dateLabel: loc('mar/2025'),
      repo: 'https://github.com/exemplo/exemplo',
      caseStudy: '/estudos-de-caso/exemplo',
      badge: loc('Selo'),
      images: [{ path: '/cases/ecoshop/1.jpeg', alt: loc('Tela'), width: 1280, height: 631 }],
      versions: [
        {
          label: 'v1',
          date: { year: 2025, month: 5 },
          stack: loc('Java'),
          description: loc('Primeira'),
          points: [loc('Ponto um')],
        },
      ],
    });

    expect(problems([full])).toEqual([]);
  });

  it('sem mês passa; sem repo passa; lista vazia passa', () => {
    expect(problems([project({ start: { year: 2025 } })])).toEqual([]);
    expect(problems([project()])).toEqual([]);
    expect(problems([])).toEqual([]);
  });

  it('sem EN na descrição: campo nomeado com índice', () => {
    const list = [
      project({ id: 'a' }),
      project({ id: 'b' }),
      project({ description: { pt: 'x' } }),
    ];

    expect(problems(list)).toContain('[2].description.en: texto ausente');
  });

  it('etiqueta repetida falha', () => {
    const dup = project({
      stack: [
        { id: 'react', label: loc('React') },
        { id: 'react', label: loc('React') },
      ],
    });

    expect(problems([dup]).join('\n')).toContain('stack');
  });

  it('repo http falha com "precisa de https"', () => {
    expect(problems([project({ repo: 'http://github.com/x/y' })])).toContainEqual(
      expect.stringContaining('repo: '),
    );
  });

  it('versão anterior ao início falha; versão do mesmo ano sem mês não falha', () => {
    const before = project({
      versions: [
        {
          label: 'v1',
          date: { year: 2024 },
          stack: loc('x'),
          description: loc('x'),
          points: [loc('x')],
        },
      ],
    });
    const sameYear = project({
      versions: [
        {
          label: 'v1',
          date: { year: 2025 },
          stack: loc('x'),
          description: loc('x'),
          points: [loc('x')],
        },
      ],
    });

    expect(problems([before])).toContain(
      '[0].versions[0].date: a versão é anterior ao início do projeto',
    );
    expect(problems([sameYear])).toEqual([]);
  });

  it('rótulo de versão repetido falha; versão sem pontos falha', () => {
    const v = (label: string, points: unknown[]) => ({
      label,
      date: { year: 2026 },
      stack: loc('x'),
      description: loc('x'),
      points,
    });

    expect(problems([project({ versions: [v('v1', [loc('a')]), v('v1', [loc('b')])] })])).toContain(
      '[0].versions[1].label: rótulo de versão repetido "v1"',
    );
    expect(problems([project({ versions: [v('v1', [])] })]).join('\n')).toContain(
      'versions[0].points',
    );
  });

  it('dateLabel de outro ano falha', () => {
    expect(problems([project({ dateLabel: loc('mar/2024') })])).toContain(
      '[0].dateLabel.pt: o rótulo de data não contém o ano de início (2025)',
    );
  });

  it('`rating`, `variant` e `icon` são recusados como campos desconhecidos', () => {
    for (const field of ['rating', 'variant', 'icon']) {
      expect(problems([project({ [field]: 4 })]).join('\n')).toContain(field);
    }
  });

  it('id repetido falha', () => {
    expect(problems([project(), project()])).toContain(
      '[1].id: identificador repetido "exemplo" (já usado em [0])',
    );
  });

  it('imagem com alt só em PT falha', () => {
    const img = { path: '/cases/ecoshop/1.jpeg', alt: { pt: 'Tela' }, width: 10, height: 10 };

    expect(problems([project({ images: [img] })])).toContain('[0].images[0].alt.en: texto ausente');
  });

  it('texto de exemplo ([x]) é recusado com o caminho', () => {
    expect(problems([project({ name: loc('[nome]') })])).toContain(
      '[0].name.pt: marcador [entre colchetes] (texto de exemplo ou pendência)',
    );
  });
});

describe('tagIdFromLabel', () => {
  it.each([
    ['Next.js 15', 'next-js-15'],
    ['CI/CD', 'ci-cd'],
    ['JavaScript ES6+', 'javascript-es6'],
    ['Acessibilidade', 'acessibilidade'],
    ['Ação', 'acao'],
  ])('%s -> %s', (label, id) => {
    expect(tagIdFromLabel(label)).toBe(id);
  });
});
