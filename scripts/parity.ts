// Paridade PT/EN (FR-014, design TD-004 e §6.3): compara os caminhos das folhas de duas árvores e
// diz o que falta de cada lado, o que está vazio e o que tem tipo diferente. EN igual ao PT NÃO é
// erro (nomes próprios; EC-13): só a falta da tradução é.

export interface ParityProblem {
  /** Caminho da chave: `nav.projects`, `lista[2].titulo`. */
  path: string;
  reason: string;
}

type Kind = 'texto' | 'função' | 'número' | 'booleano' | 'lista' | 'objeto' | 'elemento' | 'nulo';

const isElement = (value: unknown) =>
  typeof value === 'object' && value !== null && '$$typeof' in (value as object);

function kindOf(value: unknown): Kind {
  if (value === null) return 'nulo';
  if (Array.isArray(value)) return 'lista';
  if (typeof value === 'function') return 'função';
  if (typeof value === 'string') return 'texto';
  if (typeof value === 'number') return 'número';
  if (typeof value === 'boolean') return 'booleano';
  // Elemento do React (JSX): é uma folha; não se entra nas propriedades internas dele.
  if (isElement(value)) return 'elemento';

  return 'objeto';
}

const isBranch = (kind: Kind) => kind === 'objeto' || kind === 'lista';
const join = (base: string, key: string) => (base ? `${base}.${key}` : key);

/**
 * Compara `a` e `b` (por exemplo as árvores `pt` e `en`). Folhas por caminho; arrays comparam o
 * tamanho e depois cada posição. Devolve os problemas na ordem em que aparecem.
 */
export function diffKeys(a: unknown, b: unknown, names: [string, string] = ['pt', 'en']) {
  const [nameA, nameB] = names;
  const problems: ParityProblem[] = [];

  const missing = (path: string, present: unknown, presentName: string, otherName: string) => {
    problems.push({
      path,
      reason: isBranch(kindOf(present))
        ? `existe só em "${presentName}"`
        : `falta a tradução em "${otherName}"`,
    });
  };

  const walk = (x: unknown, y: unknown, path: string) => {
    const kx = kindOf(x);
    const ky = kindOf(y);

    if (kx !== ky) {
      problems.push({
        path,
        reason: `tipo diferente (${kx} em "${nameA}", ${ky} em "${nameB}")`,
      });

      return;
    }

    if (kx === 'texto') {
      if ((x as string).trim() === '') problems.push({ path, reason: `texto vazio em "${nameA}"` });
      if ((y as string).trim() === '') problems.push({ path, reason: `texto vazio em "${nameB}"` });

      return;
    }

    if (kx === 'lista') {
      const lx = x as unknown[];
      const ly = y as unknown[];

      if (lx.length !== ly.length) {
        problems.push({
          path,
          reason: `tamanho diferente (${lx.length} em "${nameA}", ${ly.length} em "${nameB}")`,
        });
      }
      for (let i = 0; i < Math.min(lx.length, ly.length); i++) walk(lx[i], ly[i], `${path}[${i}]`);

      return;
    }

    if (kx === 'objeto') {
      const ox = x as Record<string, unknown>;
      const oy = y as Record<string, unknown>;
      const keys = [...new Set([...Object.keys(ox), ...Object.keys(oy)])];

      for (const key of keys) {
        const child = join(path, key);
        const inX = key in ox && ox[key] !== undefined;
        const inY = key in oy && oy[key] !== undefined;

        if (inX && inY) walk(ox[key], oy[key], child);
        else if (inX) missing(child, ox[key], nameA, nameB);
        else missing(child, oy[key], nameB, nameA);
      }
    }
  };

  walk(a, b, '');

  return problems;
}

/** A linha final de um problema: `paridade: <arquivo> › <chave> — <motivo>`. */
export function parityLine(file: string, { path, reason }: ParityProblem) {
  return `paridade: ${file} › ${path || '(raiz)'} — ${reason}`;
}
