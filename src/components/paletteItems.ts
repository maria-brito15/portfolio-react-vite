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
import { projects as projectData } from '../data/projects';
import type { PersonaId } from '../data/personas';
import { boostOf, techKeywords, topicKeywords } from '../data/searchRanking';

export type PaletteKind = 'page' | 'section' | 'project' | 'game' | 'skill' | 'command';

// Ordem dos grupos na lista.
export const PALETTE_KINDS: PaletteKind[] = [
  'page',
  'project',
  'section',
  'game',
  'skill',
  'command',
];

// Tipos que só aparecem quando se digita (a lista sem busca fica curta).
const TYPED_ONLY: PaletteKind[] = ['skill', 'section'];

export interface PaletteItem {
  id: string;
  kind: PaletteKind;
  // Tema para a ordenação por persona (`searchRanking.ts`): id de página ou tipo genérico.
  topic: string;
  label: string;
  hint: string;
  // Linha executada na sessão do terminal ao escolher a opção…
  run?: string;
  // …ou o endereço aonde ir direto.
  to?: string;
  // Texto pesquisável (PT e EN juntos, sem acento e sem caixa).
  search: string;
}

// Palavras-chave de um tema, em PT e EN juntos (a busca ignora o idioma da interface).
const keywords = (topic: string) => {
  const k = topicKeywords[topic];

  return k ? `${k.pt} ${k.en}` : '';
};

export function paletteItems(lang: Lang): PaletteItem[] {
  const pages: PaletteItem[] = directories.map((d) => {
    const label = lang === 'pt' ? d.name : d.alias;

    return {
      id: `page:${d.id}`,
      kind: 'page',
      topic: d.id,
      label,
      hint: d.desc[lang],
      run: `cd ${label}`,
      search: fold([d.name, d.alias, d.desc.pt, d.desc.en, keywords(d.id)].join(' ')),
    };
  });

  // Páginas sem nome de diretório (o terminal) abrem direto.
  const terminal = routeById('terminal');

  if (terminal)
    pages.push({
      id: `page:${terminal.id}`,
      kind: 'page',
      topic: 'terminal',
      label: terminal.label[lang],
      hint: terminal.desc?.[lang] ?? '',
      to: terminal.path,
      search: fold(
        [
          terminal.label.pt,
          terminal.label.en,
          terminal.desc?.pt,
          terminal.desc?.en,
          keywords('terminal'),
        ].join(' '),
      ),
    });

  const projectsPage = routeById('projetos');
  const projectsName = projectsPage ? (lang === 'pt' ? projectsPage.name : projectsPage.alias) : '';
  const projects: PaletteItem[] = sectionsOf('projetos').map((s) => ({
    id: `project:${s.id}`,
    kind: 'project',
    topic: 'project',
    label: s.label[lang],
    hint: s.desc?.[lang] ?? '',
    run: `cd ${projectsName}/${s.id}`,
    search: fold(
      [
        s.label.pt,
        s.id,
        s.desc?.pt,
        s.desc?.en,
        keywords('project'),
        techKeywords(projectData.find((p) => p.id === s.id)?.tech ?? []),
      ].join(' '),
    ),
  }));

  // Estudos de caso são rotas ocultas (filhas de "projetos").
  for (const r of routes.filter((route) => route.parent === 'projetos'))
    projects.push({
      id: `case:${r.id}`,
      kind: 'project',
      topic: 'case',
      label: `${r.label[lang]}: ${r.segment?.[lang] ?? r.id}`,
      hint: routeById('projetos')?.label[lang] ?? '',
      to: r.path,
      search: fold(
        [
          r.label.pt,
          r.label.en,
          r.id,
          keywords('case'),
          techKeywords(projectData.find((p) => p.id === r.id)?.tech ?? []),
        ].join(' '),
      ),
    });

  const games: PaletteItem[] = (Object.keys(LEVELS) as Level[]).map((level) => {
    const { rows, cols, mines } = LEVELS[level];
    const name = `${lang === 'pt' ? 'campo minado' : 'minesweeper'} · ${LEVEL_NAMES[level][lang]}`;

    return {
      id: `game:${level}`,
      kind: 'game',
      topic: 'game',
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
      topic: 'skill',
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
      // Comando com um só nome (neofetch) vale nos dois idiomas.
      const label = lang === 'pt' ? c.names[0] : (c.names[1] ?? c.names[0]);

      return {
        id: `command:${c.id}`,
        kind: 'command' as const,
        topic: 'command',
        label,
        hint: c.desc?.[lang] ?? '',
        run: label,
        search: fold([...c.names, c.desc?.pt, c.desc?.en].join(' ')),
      };
    });

  // Seções das páginas de conteúdo (competências, disciplinas, FAQ…): levam direto à âncora.
  // Projetos já têm itens próprios.
  const sections: PaletteItem[] = ['curriculo', 'academico', 'servicos', 'experiencias'].flatMap(
    (routeId) => {
      const route = routeById(routeId);

      if (!route) return [];

      return sectionsOf(routeId).map((s) => ({
        id: `section:${routeId}:${s.id}`,
        kind: 'section' as const,
        topic: routeId,
        label: `${route.label[lang]}: ${s.label[lang]}`,
        hint: s.desc?.[lang] ?? '',
        to: `${route.path}#${s.anchor}`,
        search: fold(
          [
            s.label.pt,
            s.label.en,
            s.desc?.pt,
            s.desc?.en,
            route.label.pt,
            route.label.en,
            keywords(routeId),
          ].join(' '),
        ),
      }));
    },
  );

  return [...pages, ...sections, ...projects, ...games, ...skills, ...commands];
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

// Todos os termos digitados precisam aparecer (em qualquer ordem). Sem busca, a lista é curta
// (habilidades e seções só aparecem quando se digita). Os grupos seguem a ordem de PALETTE_KINDS e,
// dentro deles, o melhor casamento vem primeiro. Com persona, o favorecimento dela
// (`boostOf`) desconta da nota: os grupos passam a seguir o melhor item de cada um e os itens
// favorecidos sobem, mas o conjunto de resultados é exatamente o mesmo.
export function filterItems(
  items: PaletteItem[],
  query: string,
  persona?: PersonaId,
): PaletteItem[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  const pool = terms.length
    ? items.filter((item) => terms.every((term) => item.search.includes(term)))
    : items.filter((item) => !TYPED_ONLY.includes(item.kind));
  const scored = pool.map((item, order) => ({
    item,
    order,
    score: (terms.length ? rank(item, terms) : 0) - boostOf(persona, item.topic, item.id),
  }));
  const best = new Map<PaletteKind, number>();

  for (const { item, score } of scored)
    best.set(item.kind, Math.min(best.get(item.kind) ?? Infinity, score));

  const groupKey = (kind: PaletteKind) => (persona ? (best.get(kind) ?? 0) : 0);

  return scored
    .sort(
      (a, b) =>
        groupKey(a.item.kind) - groupKey(b.item.kind) ||
        PALETTE_KINDS.indexOf(a.item.kind) - PALETTE_KINDS.indexOf(b.item.kind) ||
        a.score - b.score ||
        a.order - b.order,
    )
    .map(({ item }) => item);
}

// Trechos do texto que casam com algum termo (sem acento nem caixa), para destacar na lista.
export function matchRanges(text: string, query: string): [number, number][] {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  // Tirar o acento de cada caractere não muda o tamanho, então os índices coincidem.
  const folded = [...text].map((ch) => fold(ch) || ch).join('');
  const ranges: [number, number][] = [];

  if (folded.length !== text.length) return ranges;

  for (const term of terms) {
    const at = folded.indexOf(term);

    if (at >= 0) ranges.push([at, at + term.length]);
  }

  return ranges.sort((a, b) => a[0] - b[0]);
}
