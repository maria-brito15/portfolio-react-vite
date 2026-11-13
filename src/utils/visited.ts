// Páginas que o visitante já abriu nesta sessão do navegador (`sessionStorage`): só para as
// sugestões de "próximo passo" não repetirem o que ele já viu. Nada sai do navegador e nada
// persiste depois de fechar a aba. Sem armazenamento, a lista fica vazia e nada quebra.
const KEY = 'portfolio-visited';

export function readVisited(): Set<string> {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? '[]');

    return new Set(Array.isArray(value) ? value.filter((v) => typeof v === 'string') : []);
  } catch {
    return new Set();
  }
}

export function markVisited(routeId: string) {
  try {
    const visited = readVisited();

    if (visited.has(routeId)) return;

    visited.add(routeId);
    sessionStorage.setItem(KEY, JSON.stringify([...visited]));
  } catch {
    // Sem armazenamento: as sugestões só deixam de lembrar o que já foi visto.
  }
}
