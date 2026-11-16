import { problemLine, problemsFromZod } from './errors';
import { TagSchema, TagSetSchema, tagIdProblem } from './tag';

const FILE = 'src/content/tags.content.ts';
const label = { pt: 'Rótulo', en: 'Label' };

function lines(value: unknown) {
  const result = TagSetSchema.safeParse(value);

  if (result.success) return [];

  return problemsFromZod(FILE, result.error).map((p) =>
    problemLine({ ...p, field: p.field === '(arquivo)' ? 'tags' : `tags${p.field}` }),
  );
}

describe('Tag: identificador', () => {
  it.each(['react', 'react-19', '19', 'a-b-c', 'a1-b2'])('%s é válido', (id) => {
    expect(tagIdProblem(id)).toBeNull();
    expect(TagSchema.safeParse({ id, label }).success).toBe(true);
  });

  it.each([
    ['Meu Tema 19', 'identificador "Meu Tema 19" fora do formato (minúsculas, números e hífen)'],
    ['-react', 'identificador "-react" não pode começar com hífen'],
    ['react-', 'identificador "react-" não pode terminar com hífen'],
    ['react--19', 'identificador "react--19" não pode ter dois hífens seguidos'],
    ['React', 'identificador "React" fora do formato (minúsculas, números e hífen)'],
    ['réact', 'identificador "réact" fora do formato (minúsculas, números e hífen)'],
    ['react_19', 'identificador "react_19" fora do formato (minúsculas, números e hífen)'],
    ['', 'identificador vazio'],
    ['-', 'identificador "-" não pode começar com hífen'],
  ])('%j → %s', (id, motivo) => {
    expect(tagIdProblem(id)).toBe(motivo);
    expect(TagSchema.safeParse({ id, label }).success).toBe(false);
  });

  it('ausente e não texto', () => {
    expect(tagIdProblem(undefined)).toBe('identificador ausente');
    expect(tagIdProblem(19)).toBe('esperado texto, recebido número');
  });
});

describe('Tag: rótulo e forma', () => {
  it('rótulo sem EN falha em label.en com o motivo do §5.1', () => {
    const result = TagSchema.safeParse({ id: 'react', label: { pt: 'x' } });

    expect(result.error?.issues).toMatchObject([
      { path: ['label', 'en'], message: 'texto ausente' },
    ]);
  });

  it('rótulo ausente', () => {
    const result = TagSchema.safeParse({ id: 'react' });

    expect(result.error?.issues).toMatchObject([{ path: ['label'], message: 'texto ausente' }]);
  });

  it('campo extra é recusado', () => {
    expect(TagSchema.safeParse({ id: 'react', label, cor: 'azul' }).success).toBe(false);
  });
});

describe('TagSet', () => {
  it('lista vazia é válida', () => {
    expect(TagSetSchema.safeParse([]).success).toBe(true);
  });

  it('conjunto válido', () => {
    expect(
      TagSetSchema.safeParse([
        { id: 'react', label },
        { id: 'node', label },
      ]).success,
    ).toBe(true);
  });

  it('react duas vezes: identificador repetido, no item da repetição', () => {
    expect(
      lines([
        { id: 'react', label },
        { id: 'react', label },
      ]),
    ).toEqual([
      `conteúdo inválido: ${FILE} › tags[1].id — identificador repetido "react" (já usado em [0])`,
    ]);
  });

  it('três iguais acusam a 2ª e a 3ª, as duas apontando para a 1ª', () => {
    const out = lines([
      { id: 'a', label },
      { id: 'a', label },
      { id: 'a', label },
    ]);

    expect(out).toHaveLength(2);
    expect(out[1]).toContain('tags[2].id');
    expect(out[1]).toContain('(já usado em [0])');
  });

  it('uma etiqueta com formato errado não esconde uma repetida', () => {
    const out = lines([
      { id: 'react', label },
      { id: 'Meu Tema', label },
      { id: 'react', label },
    ]);

    expect(out).toHaveLength(2);
    expect(out[0]).toContain('tags[1].id — identificador "Meu Tema" fora do formato');
    expect(out[1]).toContain('tags[2].id — identificador repetido "react"');
  });

  it('EC-09: a unicidade é por conjunto, não entre conjuntos', () => {
    const one = [{ id: 'react', label }];

    expect(TagSetSchema.safeParse(one).success).toBe(true);
    expect(TagSetSchema.safeParse(one).success).toBe(true);
  });

  it('não lista', () => {
    expect(lines('react')).toEqual([
      `conteúdo inválido: ${FILE} › tags — esperado lista de etiquetas, recebido texto`,
    ]);
  });

  it('item que não é objeto falha sem quebrar', () => {
    expect(TagSetSchema.safeParse([null, 'x']).success).toBe(false);
  });
});
