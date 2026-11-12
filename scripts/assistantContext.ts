// Contexto do assistente de IA (IA-08). Lê os MESMOS dados que o site mostra
// (`src/data/*`) e os converte em texto por seção, nos dois idiomas. Nada sobre a
// Duda é escrito aqui: o que não está nos dados não chega ao modelo, e o que entra
// nos dados passa a valer sozinho. O build grava o resultado em
// `netlify/functions/ask/context.json`, que a função empacota (arquivo ignorado
// pelo git).
//
// Cada seção tem um `id` e o caminho da página de onde veio; é o `id` que o modelo
// devolve como fonte, e é a função que transforma o `id` em link (IA-05).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Plugin } from 'vite';
import type { Lang, Localized } from '../src/types';
import { academics } from '../src/data/academics';
import { experienceGroups } from '../src/data/experiences';
import { now } from '../src/data/now';
import { portfolio } from '../src/data/portfolio';
import { profile } from '../src/data/profile';
import { projects } from '../src/data/projects';
import { resume } from '../src/data/resume';
import { routeById } from '../src/data/routes';
import { services } from '../src/data/services';
import { skillTimeline } from '../src/data/skillTimeline';

export interface ContextSection {
  id: string;
  path: string;
  label: Localized;
  text: Localized;
}

export interface AssistantContext {
  sections: ContextSection[];
}

// Teto por idioma. O site cabe com folga na janela do modelo; se um dia passar,
// o build falha com aviso em vez de cortar o contexto em silêncio.
export const MAX_CHARS_PER_LANG = 120_000;

// Rótulos de interface que não são conteúdo (botões, dicas de impressão).
const SKIP_KEYS = new Set(['print', 'printHint', 'showMore', 'showLess', 'skillsSummary']);

const LANGS: Lang[] = ['pt', 'en'];

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
};

// JSX → texto puro: tags saem, <br> vira espaço, entidades voltam ao caractere.
export function toText(node: ReactNode): string {
  return renderToStaticMarkup(node as never)
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:amp|lt|gt|quot|nbsp|#x27|#39);/g, (e) => ENTITIES[e])
    .replace(/\s+/g, ' ')
    .trim();
}

const isLocalized = (v: unknown): v is Localized =>
  typeof v === 'object' &&
  v !== null &&
  !Array.isArray(v) &&
  !isValidElement(v) &&
  'pt' in v &&
  'en' in v &&
  Object.keys(v).length === 2;

// Qualquer valor dos dados → linhas de texto. Funções (formatadores de interface),
// vazios e booleanos ficam de fora.
export function lines(value: unknown, lang: Lang): string[] {
  if (value === null || value === undefined || typeof value === 'boolean') return [];
  if (typeof value === 'function') return [];
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
  if (typeof value === 'number') return [String(value)];
  if (isValidElement(value)) {
    const text = toText(value);

    return text ? [text] : [];
  }
  if (isLocalized(value)) return lines(value[lang], lang);

  if (Array.isArray(value)) {
    // Par ["Rótulo", "texto"] (ex.: competências do currículo) vira "Rótulo: texto".
    // Só quando o primeiro é curto: dois parágrafos seguidos não são um par.
    if (
      value.length === 2 &&
      value.every((v) => typeof v === 'string') &&
      (value[0] as string).length <= 40
    )
      return [`${value[0]}: ${value[1]}`];

    // Lista de objetos: um marcador "- " por item, para os itens não se misturarem.
    return value.flatMap((item) => {
      const sub = lines(item, lang);

      return typeof item === 'object' &&
        item !== null &&
        !isValidElement(item) &&
        !isLocalized(item)
        ? sub.map((l, i) => (i === 0 ? `- ${l}` : `  ${l}`))
        : sub;
    });
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, v]) => {
      if (SKIP_KEYS.has(key)) return [];

      const sub = lines(v, lang);

      if (!sub.length) return [];

      return sub.length === 1 ? [`${key}: ${sub[0]}`] : [`${key}:`, ...sub.map((l) => `  ${l}`)];
    });
  }

  return [];
}

const both = (build: (lang: Lang) => unknown): Localized => ({
  pt: lines(build('pt'), 'pt').join('\n'),
  en: lines(build('en'), 'en').join('\n'),
});

// Caminho e rótulo vêm de `routes.ts` (nada repetido aqui).
function page(routeId: string, build: (lang: Lang) => unknown): ContextSection {
  const route = routeById(routeId);

  if (!route) throw new Error(`assistantContext: rota "${routeId}" não existe em routes.ts`);

  return { id: routeId, path: route.path, label: route.label, text: both(build) };
}

export function buildContext(): AssistantContext {
  const sections: ContextSection[] = [
    page('home', (l) => portfolio[l].hero),
    page('sobre', (l) => portfolio[l].about),
    page('habilidades', (l) => ({ skills: portfolio[l].skills, timeline: skillTimeline })),
    page('experiencias', (l) => ({ intro: portfolio[l].experience, groups: experienceGroups })),
    page('curriculo', (l) => resume[l]),
    // `years` só guarda ids de atividades (os textos estão em Experiências e Projetos).
    page('academico', () => ({
      programs: academics.programs,
      timeline: academics.timeline,
      semesters: academics.semesters,
    })),
    page('servicos', (l) => services[l]),
    page('contato', (l) => ({ intro: portfolio[l].contact, ...profile })),
    ...(now.items.length ? [page('agora', () => now)] : []),
    // Um projeto por seção: o link vai direto ao estudo de caso quando existe.
    ...projects.map((p): ContextSection => ({
      id: `projeto-${p.id}`,
      path: p.caseStudy ?? (routeById('projetos')?.path as string),
      label: { pt: p.name, en: p.name },
      text: both((l) => ({
        nome: p.name,
        // Ano, e o mês só quando foi confirmado (ver `data/projects.tsx`).
        inicio: p.date.month
          ? `${p.date.year}-${String(p.date.month).padStart(2, '0')}`
          : String(p.date.year),
        tecnologias: p.tech,
        repositorio: p.repo,
        ...p[l],
      })),
    })),
  ];

  return { sections };
}

export function contextSize(context: AssistantContext, lang: Lang) {
  return context.sections.reduce((total, s) => total + s.text[lang].length, 0);
}

// Falha o build se o contexto passar do teto.
export function assertContextFits(context: AssistantContext) {
  for (const lang of LANGS) {
    const size = contextSize(context, lang);

    if (size > MAX_CHARS_PER_LANG)
      throw new Error(
        `assistantContext: contexto em ${lang} tem ${size} caracteres (teto ${MAX_CHARS_PER_LANG}). Reduza os dados ou revise o plano (docs/specs/assistente-ia/design.md).`,
      );
  }
}

export const CONTEXT_FILE = 'netlify/functions/ask/context.json';

export function assistantContextPlugin(): Plugin {
  let root = process.cwd();

  return {
    name: 'portfolio-assistant-context',
    configResolved(config) {
      root = config.root;
    },
    // No build e no `vite` (dev): a função sempre encontra o arquivo.
    buildStart() {
      const context = buildContext();

      assertContextFits(context);

      const file = join(root, CONTEXT_FILE);

      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, `${JSON.stringify(context, null, 2)}\n`);
    },
  };
}
