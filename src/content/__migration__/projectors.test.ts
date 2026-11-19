import { createElement, type ReactNode } from 'react';
import { compareFacts, formatDifferences, type Fact } from './compare';
import { countProblem, pairedProblem, unmappedKeys } from './coverage';
import { richToText } from './legacy';

// Fixtures de EXEMPLO (não é o conteúdo real).
const base: Fact[] = [
  ['projects/a/name/pt', 'Alfa'],
  ['projects/a/name/en', 'Alpha'],
  ['projects/b/name/pt', 'Beta'],
];

describe('compareFacts', () => {
  it('listas iguais não têm diferença', () => {
    expect(compareFacts(base, [...base])).toEqual([]);
  });

  it('um fato alterado vira `mudou`, com o caminho e os dois valores', () => {
    const next: Fact[] = [base[0]!, ['projects/a/name/en', 'Alfa EN'], base[2]!];

    expect(compareFacts(base, next)).toEqual([
      { kind: 'mudou', path: 'projects/a/name/en', old: 'Alpha', new: 'Alfa EN' },
    ]);
  });

  it('um fato a mais (valor inventado) vira `a mais`', () => {
    expect(compareFacts(base, [...base, ['projects/c/name/pt', 'Gama']])).toEqual([
      { kind: 'a mais', path: 'projects/c/name/pt', new: 'Gama' },
    ]);
  });

  it('um fato a menos vira `faltando`', () => {
    expect(compareFacts(base, base.slice(0, 2))).toEqual([
      { kind: 'faltando', path: 'projects/b/name/pt', old: 'Beta' },
    ]);
  });

  it('mesmo conjunto em outra ordem vira `fora de ordem`', () => {
    const swapped: Fact[] = [base[2]!, base[0]!, base[1]!];
    const result = compareFacts(base, swapped);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ kind: 'fora de ordem', path: 'projects/a/name/pt' });
  });

  it('caminho repetido num dos lados é erro, não diferença silenciosa', () => {
    expect(() => compareFacts([...base, base[0]!], base)).toThrow(
      /caminho repetido no lado antigo/,
    );
  });

  it('formatDifferences escreve uma linha por diferença', () => {
    const text = formatDifferences(compareFacts(base, base.slice(0, 2)));

    expect(text).toBe('faltando: projects/b/name/pt antigo="Beta"');
  });
});

describe('trava de cobertura', () => {
  it('contagem igual passa; diferente falha dizendo os dois números', () => {
    expect(countProblem('projetos', 6, 6)).toBeNull();
    expect(countProblem('projetos', 6, 5)).toBe('projetos: o antigo tem 6 e o novo tem 5');
  });

  it('chave nova no objeto antigo falha; mapeada e excluída passam', () => {
    const old = { id: 'x', name: 'y', variant: 'card', novaChave: 1 };

    expect(unmappedKeys('projeto x', old, ['id', 'name'], ['variant'])).toEqual([
      'projeto x: chave "novaChave" do módulo antigo não está mapeada nem excluída',
    ]);
    expect(unmappedKeys('projeto x', { id: 'x', variant: 'card' }, ['id'], ['variant'])).toEqual(
      [],
    );
  });

  it('lista PT com 3 e EN com 2 falha antes da comparação', () => {
    expect(pairedProblem('pontos', ['a', 'b', 'c'], ['a', 'b'])).toBe(
      'pontos: PT tem 3 itens e EN tem 2 (o formato novo pareia os dois)',
    );
    expect(pairedProblem('pontos', ['a'], ['b'])).toBeNull();
  });
});

describe('richToText', () => {
  const strong = (text: string) => createElement('strong', { key: text }, text);
  const fragment = (...children: ReactNode[]): ReactNode => children;

  it('<strong> vira **negrito** e os trechos se juntam na ordem', () => {
    expect(richToText(fragment('Um ', strong('texto'), ' forte'))).toBe('Um **texto** forte');
  });

  it('apóstrofo e & saem decodificados (caso "what I\'d do")', () => {
    expect(richToText(fragment("what I'd do ", strong('A & B')))).toBe("what I'd do **A & B**");
  });

  it('texto puro volta como está, sem entidades', () => {
    expect(richToText("what I'd do & more")).toBe("what I'd do & more");
  });

  it('marcação que não é <strong> falha (só **negrito** migra)', () => {
    expect(() => richToText(createElement('em', null, 'x'))).toThrow(/<em>/);
    expect(() => richToText(fragment('a', createElement('br', { key: 'br' })))).toThrow(/<br/);
    expect(() => richToText(createElement('span', null, 'x'))).toThrow(/<span>/);
  });
});
