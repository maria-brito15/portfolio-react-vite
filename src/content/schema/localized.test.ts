import { z } from 'zod';
import { formatPath, formatProblems, problemLine, problemsFromZod } from './errors';
import { LocalizedTextSchema } from './index';

const [ZWSP, ZWNJ, ZWJ, BOM] = [0x200b, 0x200c, 0x200d, 0xfeff].map((c) => String.fromCharCode(c));
const FILE = 'src/content/exemplo.content.ts';

// O campo `titulo` entra como prefixo, como o validador faz com o caminho real do arquivo.
function lines(value: unknown) {
  const result = LocalizedTextSchema.safeParse(value);

  if (result.success) return [];

  return problemsFromZod(FILE, result.error).map((p) =>
    problemLine({ ...p, field: p.field === '(arquivo)' ? 'titulo' : `titulo.${p.field}` }),
  );
}

describe('LocalizedText', () => {
  it('aceita {pt, en} com texto', () => {
    expect(LocalizedTextSchema.safeParse({ pt: 'Olá', en: 'Hello' }).success).toBe(true);
  });

  it('{pt} sem en: texto ausente, com arquivo, campo e motivo', () => {
    expect(lines({ pt: 'Olá' })).toEqual([
      `conteúdo inválido: ${FILE} › titulo.en — texto ausente`,
    ]);
  });

  it('{pt: "  ", en} falha em pt com texto vazio', () => {
    expect(lines({ pt: '  ', en: 'Hello' })).toEqual([
      `conteúdo inválido: ${FILE} › titulo.pt — texto vazio (só espaços)`,
    ]);
  });

  it.each([`${ZWSP}`, `${ZWNJ}`, `${ZWJ}`, `${BOM}`, ` ${ZWSP}${BOM} `])(
    'EC-01: só espaço invisível (%j) é texto vazio',
    (blank) => {
      expect(lines({ pt: blank, en: 'x' })[0]).toContain('titulo.pt — texto vazio (só espaços)');
    },
  );

  it('texto com letra e espaço invisível ao redor é aceito', () => {
    expect(LocalizedTextSchema.safeParse({ pt: `${ZWSP}Olá`, en: `Hi${BOM}` }).success).toBe(true);
  });

  it('EC-02: chave extra é recusada, mesmo com pt e en corretos', () => {
    expect(lines({ pt: 'a', en: 'b', de: 'c' })).toEqual([
      `conteúdo inválido: ${FILE} › titulo.de — idioma não suportado "de" (aceitos: pt, en)`,
    ]);
  });

  it('EC-02: {pt, em} acusa a chave errada e o en ausente', () => {
    expect(lines({ pt: 'a', em: 'b' })).toEqual([
      `conteúdo inválido: ${FILE} › titulo.em — idioma não suportado "em" (aceitos: pt, en)`,
      `conteúdo inválido: ${FILE} › titulo.en — texto ausente`,
    ]);
  });

  it.each([
    [{ pt: 1, en: 'x' }, 'titulo.pt — esperado texto, recebido número'],
    [{ pt: 'x', en: null }, 'titulo.en — esperado texto, recebido nulo'],
    [{ pt: ['x'], en: 'x' }, 'titulo.pt — esperado texto, recebido lista'],
    [{ pt: {}, en: 'x' }, 'titulo.pt — esperado texto, recebido objeto'],
  ])('não texto: %j', (value, expected) => {
    expect(lines(value)[0]).toContain(expected);
  });

  it.each([
    ['Olá', 'texto'],
    [null, 'nulo'],
    [['a'], 'lista'],
    [7, 'número'],
  ])('a raiz que não é objeto (%j) falha com o tipo recebido', (value, tipo) => {
    expect(lines(value)).toEqual([
      `conteúdo inválido: ${FILE} › titulo — esperado objeto com pt e en, recebido ${tipo}`,
    ]);
  });
});

describe('conversor de erros em PT', () => {
  it('a linha inteira confere com o §6.2', () => {
    const result = LocalizedTextSchema.safeParse({ pt: 'a' });
    const [problem] = problemsFromZod(FILE, result.error!);

    expect(problemLine({ ...problem, field: 'itens[2].titulo.en' })).toBe(
      'conteúdo inválido: src/content/exemplo.content.ts › itens[2].titulo.en — texto ausente',
    );
  });

  it('caminho: índice vira [n], campos viram ponto, vazio vira (arquivo)', () => {
    expect(formatPath(['lista', 2, 'capa', 'alt', 'en'])).toBe('lista[2].capa.alt.en');
    expect(formatPath([0, 'a'])).toBe('[0].a');
    expect(formatPath([])).toBe('(arquivo)');
  });

  it('fecho: N problema(s) em M arquivo(s)', () => {
    const p = (file: string) => ({ file, field: 'x', reason: 'r' });

    expect(formatProblems([p('a.ts'), p('a.ts'), p('b.ts')]).at(-1)).toBe(
      '3 problema(s) em 2 arquivo(s)',
    );
    expect(formatProblems([])).toEqual([]);
  });

  it('mostra até 50 problemas e depois "… mais K"', () => {
    const many = Array.from({ length: 53 }, (_, i) => ({
      file: 'a.ts',
      field: `f${i}`,
      reason: 'r',
    }));
    const out = formatProblems(many);

    expect(out).toHaveLength(52);
    expect(out[50]).toBe('… mais 3');
    expect(out[51]).toBe('53 problema(s) em 1 arquivo(s)');
  });

  it('chave desconhecida vinda do zod vira um problema por chave', () => {
    const result = z.strictObject({ a: z.string() }).safeParse({ a: 'x', b: 1, c: 2 });

    expect(problemsFromZod('f.ts', result.error!).map((p) => p.field)).toEqual(['b', 'c']);
  });
});
