// Opções da paleta de comandos (Ctrl+K), montadas das fontes únicas do site:
// `routes.ts` (páginas), `sections.ts` (projetos), `skillTimeline` (habilidades),
// `games/mines` (jogos) e o inventário de comandos. Nada é repetido à mão.
// Escolher uma opção ou roda o MESMO comando que o terminal rodaria (`run`) ou
// vai direto a um destino (`to`): nenhum interpretador novo (JA-07).
import type { Lang } from '../types';
import { directories, fold, routeById, routes } from '../data/routes';
import { sectionsOf } from '../data/sections';
import { skillTimeline } from '../data/skillTimeline';
import { LEVELS, LEVEL_NAMES, type Level } from '../terminal/games/mines';
import { commandInventory } from '../terminal/commands';

export type PaletteKind = 'page' | 'project' | 'game' | 'skill' | 'command';

// Ordem dos grupos na lista.
export const PALETTE_KINDS: PaletteKind[] = ['page', 'project', 'game', 'skill', 'command'];

export interface PaletteItem {
  id: string;
  kind: PaletteKind;
  label: string;
  hint: string;
  // Linha executada na sessão do terminal ao escolher a opção…
  run?: string;
  // …ou o endereço aonde ir direto.
  to?: string;
  // Texto pesquisável (PT e EN juntos, sem acento e sem caixa).
  search: string;
}

export function paletteItems(lang: Lang): PaletteItem[] {
  const pages: PaletteItem[] = directories.map((d) => {
    const label = lang === 'pt' ? d.name : d.alias;

    return {
      id: `page:${d.id}`,
      kind: 'page',
      label,
      hint: d.desc[lang],
      run: `cd ${label}`,
      search: fold([d.name, d.alias, d.desc.pt, d.desc.en].join(' ')),
    };
  });

  // Páginas sem nome de diretório (o terminal) abrem direto.
  const terminal = routeById('terminal');

  if (terminal)
    pages.push({
      id: `page:${terminal.id}`,
      kind: 'page',
      label: terminal.label[lang],
      hint: terminal.desc?.[lang] ?? '',
      to: terminal.path,
      search: fold(
        [terminal.label.pt, terminal.label.en, terminal.desc?.pt, terminal.desc?.en].join(' '),
      ),
    });

  const projectsPage = routeById('projetos');
  const projectsName = projectsPage ? (lang === 'pt' ? projectsPage.name : projectsPage.alias) : '';
  const projects: PaletteItem[] = sectionsOf('projetos').map((s) => ({
    id: `project:${s.id}`,
    kind: 'project',
    label: s.label[lang],
    hint: s.desc?.[lang] ?? '',
    run: `cd ${projectsName}/${s.id}`,
    search: fold([s.label.pt, s.id, s.desc?.pt, s.desc?.en].join(' ')),
  }));

  // Estudos de caso são rotas ocultas (filhas de "projetos").
  for (const r of routes.filter((route) => route.parent === 'projetos'))
    projects.push({
      id: `case:${r.id}`,
      kind: 'project',
      label: `${r.label[lang]}: ${r.segment?.[lang] ?? r.id}`,
      hint: routeById('projetos')?.label[lang] ?? '',
      to: r.path,
      search: fold([r.label.pt, r.label.en, r.id].join(' ')),
    });

  const games: PaletteItem[] = (Object.keys(LEVELS) as Level[]).map((level) => {
    const { rows, cols, mines } = LEVELS[level];
    const name = `${lang === 'pt' ? 'campo minado' : 'minesweeper'} · ${LEVEL_NAMES[level][lang]}`;

    return {
      id: `game:${level}`,
      kind: 'game',
      label: name,
      hint: `${cols}×${rows} · ${mines}`,
      to: routeById('jogos')?.path ?? '/jogos',
      search: fold(
        [
          'minas minesweeper campo minado game jogo',
          LEVEL_NAMES[level].pt,
          LEVEL_NAMES[level].en,
        ].join(' '),
      ),
    };
  });

  const skills: PaletteItem[] = skillTimeline.flatMap((group) =>
    group.items.map((item) => ({
      id: `skill:${group.id}:${item.name}`,
      kind: 'skill' as const,
      label: item.name,
      hint: group.title[lang],
      to: routeById('habilidades')?.path ?? '/habilidades',
      search: fold([item.name, group.title.pt, group.title.en].join(' ')),
    })),
  );

  const commands: PaletteItem[] = commandInventory()
    // Fora da paleta: ocultos e os que exigem argumento (`cd <página>`).
    .filter((c) => !c.hidden && !c.usage?.pt.startsWith('<'))
    .map((c) => {
      const label = lang === 'pt' ? c.names[0] : c.names[1];

      return {
        id: `command:${c.id}`,
        kind: 'command' as const,
        label,
        hint: c.desc?.[lang] ?? '',
        run: label,
        search: fold([...c.names, c.desc?.pt, c.desc?.en].join(' ')),
      };
    });

  return [...pages, ...projects, ...games, ...skills, ...commands];
}

// Menor é melhor: 0 nome igual · 1 começa com o termo · 2 começa uma palavra ·
// 3 contém no nome · 4 só casa na descrição ou no nome em outro idioma.
function rank(item: PaletteItem, terms: string[]) {
  const label = fold(item.label);

  return Math.max(
    ...terms.map((term) => {
      if (label === term) return 0;
      if (label.startsWith(term)) return 1;
      if (label.split(/[\s·/-]+/).some((word) => word.startsWith(term))) return 2;

      return label.includes(term) ? 3 : 4;
    }),
  );
}

// Todos os termos digitados precisam aparecer (em qualquer ordem). Sem busca,
// a lista é curta (habilidades só aparecem quando se digita); com busca, os
// grupos seguem a ordem de PALETTE_KINDS e, dentro deles, o melhor casamento vem primeiro.
export function filterItems(items: PaletteItem[], query: string): PaletteItem[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);

  if (!terms.length) return items.filter((item) => item.kind !== 'skill');

  return items
    .filter((item) => terms.every((term) => item.search.includes(term)))
    .map((item, order) => ({ item, order, score: rank(item, terms) }))
    .sort(
      (a, b) =>
        PALETTE_KINDS.indexOf(a.item.kind) - PALETTE_KINDS.indexOf(b.item.kind) ||
        a.score - b.score ||
        a.order - b.order,
    )
    .map(({ item }) => item);
}
