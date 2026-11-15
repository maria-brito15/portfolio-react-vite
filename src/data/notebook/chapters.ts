// Capítulos do caderno (CD-83): o sommaire de seis linhas e o número de capítulo de cada rota.
// Rotas e seções continuam só em `routes.ts`; aqui só se liga um id de rota a um número e a um nome.
import { personas, type PersonaId } from '../personas';

export type SommaireKey = 'work' | 'writing' | 'cinema' | 'library' | 'stage' | 'letters';

export interface SommaireEntry {
  n: number;
  key: SommaireKey;
  // Rota de destino. WRITING ainda não tem página nem conteúdo: `null` (placeholder "em breve").
  routeId: string | null;
}

export const SOMMAIRE: SommaireEntry[] = [
  { n: 1, key: 'work', routeId: 'projetos' },
  { n: 2, key: 'writing', routeId: null },
  { n: 3, key: 'cinema', routeId: 'pessoal-filmes' },
  { n: 4, key: 'library', routeId: 'pessoal-livros' },
  { n: 5, key: 'stage', routeId: 'pessoal-musica' },
  { n: 6, key: 'letters', routeId: 'contato' },
];

// Rotas que pertencem a um capítulo do sommaire (inclui as subpáginas).
const OWN: Record<string, SommaireKey> = {
  projetos: 'work',
  'whatsapp-dispatcher': 'work',
  'pessoal-filmes': 'cinema',
  'pessoal-livros': 'library',
  'pessoal-musica': 'stage',
  'pessoal-teatro': 'stage',
  contato: 'letters',
};

// As demais rotas continuam a numeração depois do sommaire (07, 08…), nesta ordem.
const AFTER = [
  'sobre',
  'habilidades',
  'experiencias',
  'curriculo',
  'academico',
  'servicos',
  'pessoal',
  'jogos',
  'github',
  'agora',
  'setup',
  'terminal',
];

export interface Chapter {
  number: string;
  // Chave do sommaire (nome editorial) ou `null` (usa o rótulo da rota).
  key: SommaireKey | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function chapterFor(routeId: string | undefined): Chapter | undefined {
  if (!routeId || routeId === 'home') return undefined;

  const key = OWN[routeId];

  if (key) return { number: pad(SOMMAIRE.find((e) => e.key === key)?.n ?? 0), key };

  const index = AFTER.indexOf(routeId);

  return index >= 0 ? { number: pad(SOMMAIRE.length + 1 + index), key: null } : undefined;
}

// Reordena o sommaire pela lente: sobe a linha cuja rota a persona põe mais acima. Só reordena.
export function sortByLens(entries: SommaireEntry[], persona: PersonaId | undefined) {
  const order = personas.find((p) => p.id === persona)?.order ?? [];
  const rank = (e: SommaireEntry) => {
    const i = e.routeId ? order.indexOf(e.routeId) : -1;

    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };

  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => rank(a.entry) - rank(b.entry) || a.index - b.index)
    .map(({ entry }) => entry);
}
