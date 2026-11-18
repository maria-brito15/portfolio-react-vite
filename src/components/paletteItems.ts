// Opções da paleta de comandos (Ctrl+K), montadas das fontes únicas do site:
// `routes.ts` (páginas), `sections.ts` (projetos), `skillTimeline` (habilidades),
// Nada é repetido à mão.
// Escolher uma opção vai a um destino de página (`to`, no idioma da interface). Os itens que rodavam
// comandos do terminal (`run`) saem até a spec 009 (T3.4).
import type { Lang } from '../types';
import { directories, fold, pathInLang, routeById, routeSegment, routes } from '../data/routes';
import { sectionsOf } from '../data/sections';
import { skillTimeline } from '../data/skillTimeline';
import { projects as projectData } from '../data/projects';
import { techKeywords, topicKeywords } from '../data/searchRanking';

export type PaletteKind = 'page' | 'section' | 'project' | 'skill';

// Ordem dos grupos na lista.
export const PALETTE_KINDS: PaletteKind[] = ['page', 'project', 'section', 'skill'];

// Tipos que só aparecem quando se digita (a lista sem busca fica curta).
const TYPED_ONLY: PaletteKind[] = ['skill', 'section'];

export interface PaletteItem {
  id: string;
  kind: PaletteKind;
  // Tema (`searchRanking.ts`): id de página ou tipo genérico.
  topic: string;
  label: string;
  hint: string;
  // Endereço aonde ir (já no idioma da interface).
  to: string;
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
      to: pathInLang(d.path, lang),
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
      to: pathInLang(terminal.path, lang),
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

  // Seções do espaço cultural: rotas filhas de "pessoal", achadas pelo nome e pelas palavras-chave.
  for (const r of routes.filter((route) => route.parent === 'pessoal'))
    pages.push({
      id: `page:${r.id}`,
      kind: 'page',
      topic: 'pessoal',
      label: `${routeById('pessoal')?.label[lang] ?? ''}: ${r.label[lang]}`,
      hint: r.desc?.[lang] ?? '',
      to: pathInLang(r.path, lang),
      search: fold(
        [
          r.label.pt,
          r.label.en,
          r.desc?.pt,
          r.desc?.en,
          r.segment?.pt,
          r.segment?.en,
          keywords(r.id),
        ].join(' '),
      ),
    });

  const projectsPage = routeById('projetos');
  const projects: PaletteItem[] = sectionsOf('projetos').map((s) => ({
    id: `project:${s.id}`,
    kind: 'project',
    topic: 'project',
    label: s.label[lang],
    hint: s.desc?.[lang] ?? '',
    to: `${pathInLang(projectsPage?.path ?? '/projetos', lang)}#${s.anchor}`,
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
      label: `${r.label[lang]}: ${routeSegment(r, lang)}`,
      hint: routeById('projetos')?.label[lang] ?? '',
      to: pathInLang(r.path, lang),
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

  const skills: PaletteItem[] = skillTimeline.flatMap((group) =>
    group.items.map((item) => ({
      id: `skill:${group.id}:${item.name}`,
      kind: 'skill' as const,
      topic: 'skill',
      label: item.name,
      hint: group.title[lang],
      to: pathInLang(routeById('habilidades')?.path ?? '/habilidades', lang),
      search: fold([item.name, group.title.pt, group.title.en].join(' ')),
    })),
  );

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
        to: `${pathInLang(route.path, lang)}#${s.anchor}`,
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

  return [...pages, ...sections, ...projects, ...skills];
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
// dentro deles, o melhor casamento vem primeiro.
export function filterItems(items: PaletteItem[], query: string): PaletteItem[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  const pool = terms.length
    ? items.filter((item) => terms.every((term) => item.search.includes(term)))
    : items.filter((item) => !TYPED_ONLY.includes(item.kind));
  const scored = pool.map((item, order) => ({
    item,
    order,
    score: terms.length ? rank(item, terms) : 0,
  }));

  return scored
    .sort(
      (a, b) =>
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
