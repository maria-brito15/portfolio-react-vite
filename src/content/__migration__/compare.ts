// Arcabouço descartável da equivalência antigo × novo (003, FR-008). Apagar a pasta inteira no fechamento (T6.2).

/** Um fato: caminho canônico e o texto que ele tem (`projects/ecoshop/versions/1/points/3/en`). */
export type Fact = readonly [path: string, text: string];

export type DifferenceKind = 'faltando' | 'a mais' | 'mudou' | 'fora de ordem';

export interface Difference {
  kind: DifferenceKind;
  path: string;
  /** Valor no lado antigo (ausente em `a mais`). */
  old?: string;
  /** Valor no lado novo (ausente em `faltando`). */
  new?: string;
}

function indexFacts(side: string, facts: readonly Fact[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const [path, text] of facts) {
    if (map.has(path)) throw new Error(`caminho repetido no lado ${side}: ${path}`);

    map.set(path, text);
  }

  return map;
}

/**
 * Compara as duas listas de fatos. `faltando` = o antigo tem e o novo não; `a mais` = o novo tem e o
 * antigo não (um valor inventado); `mudou` = os dois têm e o texto difere. Com o mesmo conjunto de
 * fatos e a ordem diferente, o primeiro fato fora do lugar sai como `fora de ordem`.
 */
export function compareFacts(oldFacts: readonly Fact[], newFacts: readonly Fact[]): Difference[] {
  const before = indexFacts('antigo', oldFacts);
  const after = indexFacts('novo', newFacts);
  const differences: Difference[] = [];

  for (const [path, text] of before) {
    const next = after.get(path);

    if (next === undefined) differences.push({ kind: 'faltando', path, old: text });
    else if (next !== text) differences.push({ kind: 'mudou', path, old: text, new: next });
  }

  for (const [path, text] of after) {
    if (!before.has(path)) differences.push({ kind: 'a mais', path, new: text });
  }

  if (differences.length === 0) {
    const index = oldFacts.findIndex(([path], i) => newFacts[i]?.[0] !== path);

    if (index !== -1) {
      differences.push({
        kind: 'fora de ordem',
        path: oldFacts[index]![0],
        old: `posição ${index}`,
        new: `posição de ${newFacts[index]![0]}`,
      });
    }
  }

  return differences;
}

function detail(d: Difference): string {
  if (d.kind === 'mudou') return ` antigo=${JSON.stringify(d.old)} novo=${JSON.stringify(d.new)}`;
  if (d.kind === 'faltando') return ` antigo=${JSON.stringify(d.old)}`;
  if (d.kind === 'a mais') return ` novo=${JSON.stringify(d.new)}`;

  return ` (${d.old} → ${d.new})`;
}

/** Uma linha por diferença, para a mensagem de falha do teste. */
export function formatDifferences(differences: readonly Difference[]): string {
  return differences.map((d) => `${d.kind}: ${d.path}${detail(d)}`).join('\n');
}
