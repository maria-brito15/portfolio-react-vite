// Estado de publicação de cada rota (TD-025 (b), DQ-017): se é rascunho (sem conteúdo ou com dado
// fictício: abre, mas fica fora do sitemap e do índice dos buscadores) e se aparece na navegação
// mesmo sendo rascunho (`showInNav`: só o hub do espaço pessoal, enquanto usa dados fictícios).
//
// Este módulo existe para que `routes.ts` NÃO importe `now`, `uses`, `data/personal/*` nem
// `services/integrations/mode`: a tabela de rotas é lida na primeira pintura do cliente, e o
// estado de rascunho só importa para o plugin de build (Node), para o `HubIndex` (chunk de
// /pessoal) e para quem monta o `<head>` (seoHead.ts). O comportamento é o de antes, só mudou de
// lugar.
import { personalMode } from '../services/integrations/mode';
import { integrated } from './personal/integrations';
import { musicHasContent } from './personal/music';
import { theaterHasContent } from './personal/theater';
import { now } from './now';
import { uses } from './uses';
import { routes, type NavGroup, type Route } from './routes';

export interface RouteStatus {
  // Página em construção (sem conteúdo): existe e abre, mas não entra no sitemap nem no índice
  // dos buscadores.
  draft: boolean;
  // Aparece na barra lateral e nos atalhos da home mesmo sendo rascunho. Só o espaço cultural
  // enquanto usa dados fictícios: o rascunho continua tirando a página do sitemap e do índice dos
  // buscadores, e a trava de build (scripts/personalGuard.ts) impede que isso chegue à produção.
  showInNav: boolean;
}

// Páginas de curadoria manual ainda sem nenhum item (ver data/personal/music.ts e theater.ts).
const hasNoContent: Record<string, boolean> = {
  musica: !musicHasContent(),
  teatro: !theaterHasContent(),
  // Fontes ainda sem integração real (data/personal/integrations.ts).
  livros: !integrated.books,
  filmes: !integrated.films,
};

const mock = personalMode === 'mock';

// Só as rotas que podem ser rascunho; as demais valem `{ draft: false, showInNav: false }`.
const overrides: Record<string, Partial<RouteStatus>> = {
  // Em construção (sem conteúdo em data/now.ts e data/uses.ts): fora do sitemap e do índice.
  agora: { draft: now.items.length === 0 },
  setup: { draft: uses.groups.length === 0 },
  // Espaço cultural: enquanto a fonte estiver em mock (dados fictícios), as cinco rotas abrem mas
  // ficam fora do sitemap, da barra lateral e do índice (CL-02). Só o hub entra na barra.
  pessoal: { draft: mock, showInNav: mock },
  // Em construção no modo `live` enquanto não há conteúdo: curadoria manual vazia (música e
  // teatro) ou fonte sem integração.
  'pessoal-livros': { draft: mock || hasNoContent.livros === true },
  'pessoal-filmes': { draft: mock || hasNoContent.filmes === true },
  'pessoal-musica': { draft: mock || hasNoContent.musica === true },
  'pessoal-teatro': { draft: mock || hasNoContent.teatro === true },
};

// Um objeto por rota, o mesmo a cada chamada: os testes da 008 trocam o valor para simular o site
// "no ar" e restauram depois.
const status: Record<string, RouteStatus> = Object.fromEntries(
  routes.map((r) => [r.id, { draft: false, showInNav: false, ...overrides[r.id] }]),
);

const UNKNOWN: Readonly<RouteStatus> = { draft: false, showInNav: false };

// Estado da rota; id desconhecido (o 404, por exemplo) não é rascunho.
export const routeStatus = (id: string): RouteStatus => status[id] ?? UNKNOWN;

export const isDraft = (id: string) => routeStatus(id).draft;

// Rota que a navegação pode mostrar: sem rascunho, ou rascunho marcado com `showInNav`.
export const isListed = (r: Route) => !isDraft(r.id) || routeStatus(r.id).showInNav;

// Rotas da barra lateral de um grupo, sem rascunhos.
export const navRoutes = (group: NavGroup) =>
  routes.filter((r) => r.group === group && !r.hidden && isListed(r));
