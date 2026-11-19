import { z } from 'zod';
import { formatPath } from './errors';
import { withNoPlaceholders } from './index';

const Schema = withNoPlaceholders(
  z.object({
    nome: z.string(),
    itens: z.array(z.object({ pontos: z.array(z.object({ pt: z.string(), en: z.string() })) })),
  }),
);

function paths(value: unknown): string[] {
  const result = Schema.safeParse(value);

  return result.success ? [] : result.error.issues.map((i) => formatPath(i.path));
}

const base = (pt: string) => ({ nome: 'ok', itens: [{ pontos: [{ pt, en: 'fine' }] }] });

describe('withNoPlaceholders', () => {
  it('texto normal passa', () => {
    expect(Schema.safeParse(base('Texto comum, sem marcador.')).success).toBe(true);
  });

  it.each([
    ['[x]'],
    ['veja [sua foto aqui]'],
    ['Lorem ipsum dolor sit amet'],
    ['LOREM IPSUM'],
    ['TODO: escrever'],
    ['isso é TBD'],
    ['fixme depois'],
  ])('%j falha com o caminho do campo', (text) => {
    expect(paths(base(text))).toEqual(['itens[0].pontos[0].pt']);
  });

  it('o caminho vem do campo exato, em lista e objeto aninhados', () => {
    const value = {
      nome: '[nome]',
      itens: [{ pontos: [{ pt: 'ok', en: 'ok' }] }, { pontos: [{ pt: 'ok', en: 'TODO' }] }],
    };

    expect(paths(value)).toEqual(['nome', 'itens[1].pontos[0].en']);
  });

  it('colchete vazio `[]` e palavras que só contêm TODO não são marcador', () => {
    expect(Schema.safeParse(base('lista vazia []')).success).toBe(true);
    expect(Schema.safeParse(base('todos os projetos; mastodon')).success).toBe(true);
  });

  it('não altera o dado validado', () => {
    const value = base('igual');
    const result = Schema.safeParse(value);

    expect(result.success && result.data).toEqual(value);
  });

  it('um dado que já falha no schema base continua falhando', () => {
    expect(Schema.safeParse({ nome: 1, itens: [] }).success).toBe(false);
  });
});
