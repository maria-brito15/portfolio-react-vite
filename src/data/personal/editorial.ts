// Numeração editorial das páginas do espaço cultural: o hub é 001 e as seções seguem a ordem das
// rotas filhas em `routes.ts` (002 a 005). Nenhum número é escrito à mão: mudar a ordem das rotas
// muda a numeração.
import { routes } from '../routes';

const HUB = 'pessoal';

export function editorialNumber(routeId: string) {
  const ids = [HUB, ...routes.filter((r) => r.parent === HUB).map((r) => r.id)];
  const index = ids.indexOf(routeId);

  return index < 0 ? undefined : String(index + 1).padStart(3, '0');
}
