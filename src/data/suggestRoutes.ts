// Sugestões da 404 (FR-039, TD-022): até 3 rotas do menu parecidas com o endereço digitado, por
// distância de edição sobre o último segmento. Função pura. Sem semelhança (ou sem endereço), as 3
// primeiras do menu, na ordem de `order`.
import type { Lang } from '../types';
import { fold, routes, type Route } from './routes';
import { levenshtein } from '../utils/suggest';

const LIMIT = 3;

const menuRoutes = () =>
  routes.filter((route) => route.menu).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const lastSegment = (path: string) => {
  let decoded = path;

  try {
    decoded = decodeURIComponent(path);
  } catch {
    // endereço malformado (ex.: "%"): usa o texto como veio
  }

  return fold(decoded.split('/').filter(Boolean).pop() ?? '');
};

// Os nomes pelos quais uma rota é chamada: o rótulo no idioma, e o último trecho do endereço nos
// dois idiomas (assim "/projects" acha Projetos mesmo numa página em português).
function namesOf(route: Route, lang: Lang): string[] {
  return [route.label[lang], lastSegment(route.path), lastSegment(route.enPath)].map(fold);
}

export function suggestRoutes(path: string, lang: Lang): Route[] {
  const menu = menuRoutes();
  const query = lastSegment(path);

  if (!query) return menu.slice(0, LIMIT);

  const limitDistance = Math.max(2, Math.ceil(query.length / 3));
  const near = menu
    .map((route, order) => {
      const names = namesOf(route, lang).filter(Boolean);
      const prefix = names.some(
        (name) => query.length >= 3 && (name.startsWith(query) || query.startsWith(name)),
      );
      const distance = prefix ? 0 : Math.min(...names.map((name) => levenshtein(query, name)));

      return { route, order, distance };
    })
    .filter((candidate) => candidate.distance <= limitDistance)
    .sort((a, b) => a.distance - b.distance || a.order - b.order)
    .slice(0, LIMIT)
    .map((candidate) => candidate.route);

  return near.length ? near : menu.slice(0, LIMIT);
}
