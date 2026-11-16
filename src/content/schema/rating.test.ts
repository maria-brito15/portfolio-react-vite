import { z } from 'zod';
import { RatingSchema, ratingProblem } from './rating';

const Item = z.object({ rating: RatingSchema });

describe('Rating: valores válidos', () => {
  it.each([0.5, 1, 1.5, 2, 3.5, 4.5, 5])('%s é válida', (nota) => {
    expect(ratingProblem(nota)).toBeNull();
    expect(RatingSchema.safeParse(nota).success).toBe(true);
  });

  it('ausente é válida e continua ausente: sem nota, nunca 0', () => {
    const parsed = Item.parse({});

    expect(parsed.rating).toBeUndefined();
    expect('rating' in parsed && parsed.rating === 0).toBe(false);
    expect(RatingSchema.safeParse(undefined).success).toBe(true);
  });
});

describe('Rating: recusadas, com a mensagem do design', () => {
  it.each([
    [0, 'nota 0 inválida: sem nota é campo ausente'],
    [0.25, 'nota 0,25 fora do intervalo (valores válidos: 0,5 a 5)'],
    [4.3, 'nota 4,3 fora do passo de 0,5 (valores válidos: 0,5 a 5)'],
    [5.5, 'nota 5,5 fora do intervalo (valores válidos: 0,5 a 5)'],
    [-1, 'nota -1 fora do intervalo (valores válidos: 0,5 a 5)'],
    [5.25, 'nota 5,25 fora do intervalo (valores válidos: 0,5 a 5)'],
    [4.75, 'nota 4,75 fora do passo de 0,5 (valores válidos: 0,5 a 5)'],
    ['4,5', 'esperado número, recebido texto'],
    ['4.5', 'esperado número, recebido texto'],
    [null, 'esperado número, recebido nulo'],
    [NaN, 'nota NaN não é um número finito'],
    [Infinity, 'nota Infinity não é um número finito'],
  ])('%j → %s', (nota, motivo) => {
    expect(ratingProblem(nota)).toBe(motivo);
    expect(RatingSchema.safeParse(nota).success).toBe(false);
  });

  it('a mensagem do schema é o motivo, sem prefixo do zod', () => {
    const result = Item.safeParse({ rating: 4.3 });

    expect(result.error?.issues[0]).toMatchObject({
      path: ['rating'],
      message: 'nota 4,3 fora do passo de 0,5 (valores válidos: 0,5 a 5)',
    });
  });
});
