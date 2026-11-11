// "Você quis dizer…?" do 404: páginas parecidas com o endereço digitado, por
// distância de edição sobre os nomes de `routes.ts` (PT e EN). Função pura.
import { directories, fold, type Directory } from '../data/routes';

// Número mínimo de inserções, remoções e trocas para transformar `a` em `b`.
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const row = [i];

    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }

  return prev[b.length];
}

// Último trecho do caminho, sem acento e sem caixa: "/Projetos/" → "projetos".
function lastSegment(path: string): string {
  let decoded = path;

  try {
    decoded = decodeURIComponent(path);
  } catch {
    // caminho malformado (ex.: "%"): usa o texto como veio
  }

  return fold(decoded.split('/').filter(Boolean).pop() ?? '');
}

// Até `limit` páginas parecidas, da mais próxima à mais distante. Sem nada
// razoavelmente parecido devolve lista vazia (o 404 mostra só o `ls`).
export function suggestPages(path: string, limit = 3): Directory[] {
  const query = lastSegment(path);

  if (!query) return [];

  const limitDistance = Math.max(2, Math.ceil(query.length / 3));

  return directories
    .map((page, order) => {
      const names = [page.name, page.alias].map(fold);
      const near = names.some(
        (n) => query.length >= 3 && (n.startsWith(query) || query.startsWith(n)),
      );
      const distance = near ? 0 : Math.min(...names.map((n) => levenshtein(query, n)));

      return { page, order, distance };
    })
    .filter((c) => c.distance <= limitDistance)
    .sort((x, y) => x.distance - y.distance || x.order - y.order)
    .slice(0, limit)
    .map((c) => c.page);
}
