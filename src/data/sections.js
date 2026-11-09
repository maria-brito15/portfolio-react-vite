// Seções internas de cada página, ligadas a routes.js. Fonte única de:
// `ls <página>`, `<página> <seção>`, `cd <página>/<seção>`, autocompletar e das
// âncoras (`anchor` = id do elemento na página própria).
//
// Páginas com conteúdo fixo (currículo, acadêmico, serviços) têm a lista
// escrita aqui; projetos e experiências são derivados dos dados (um item por
// projeto, um por grupo de experiências), então nada fica de fora.
import { projects } from './projects';
import { experienceGroups } from './experiences';
import { academics } from './academics';
import { resume } from './resume';
import { experienceStats, finalistProjects } from '../utils/resume';
import { formatProjectDate } from '../utils/projectDate';
import { findDirectory, fold, routeById } from './routes';

const L = (pt, en) => ({ pt, en });
const S = (id, alias, anchor, label, desc) => ({ id, name: id, alias, anchor, label, desc });

// Descrições do índice calculadas dos dados (nada escrito à mão que possa envelhecer).
const exp = experienceStats(experienceGroups);
const finalists = finalistProjects(projects).length;
const firstProjects = projects
  .slice(0, 3)
  .map((p) => p.name)
  .join(', ');
const years = `${Math.min(...academics.programs.map((p) => p.start))}–${Math.max(...academics.programs.map((p) => p.end))}`;

const CURRICULO = [
  S(
    'resumo',
    'summary',
    'resumo',
    L('Sobre mim', 'About me'),
    L('resumo profissional', 'professional summary'),
  ),
  S(
    'competencias',
    'skills',
    'competencias',
    L('Competências técnicas', 'Technical skills'),
    L('stack com tempo de uso', 'stack with time in use'),
  ),
  S(
    'experiencias',
    'experience',
    'experiencias-cv',
    L('Experiências', 'Experience'),
    L(
      resume.pt.experienceSummary(exp.count, exp.firstYear),
      resume.en.experienceSummary(exp.count, exp.firstYear),
    ),
  ),
  S(
    'projetos',
    'projects',
    'projetos-cv',
    L('Projetos em destaque', 'Selected projects'),
    L(`${firstProjects}…`, `${firstProjects}…`),
  ),
  S(
    'formacao',
    'education',
    'formacao',
    L('Formação e idiomas', 'Education and languages'),
    L(`PUC Minas · ${years}`, `PUC Minas · ${years}`),
  ),
  S(
    'reconhecimentos',
    'awards',
    'reconhecimentos',
    L('Reconhecimentos', 'Awards'),
    L(`${finalists}× finalista`, `${finalists}× finalist`),
  ),
];

const ACADEMICO = [
  S(
    'linha-do-tempo',
    'timeline',
    'trajetoria',
    L('Linha do tempo', 'Timeline'),
    L('do início até a previsão de conclusão', 'from the start to expected graduation'),
  ),
  S(
    'formacao',
    'degrees',
    'formacao-academica',
    L('Formação', 'Degrees'),
    L('cursos e instituição', 'degrees and institution'),
  ),
  S(
    'atividades',
    'activities',
    'por-ano',
    L('Atividades por ano', 'Activities by year'),
    L('do mais recente ao mais antigo', 'most recent first'),
  ),
  S(
    'disciplinas',
    'courses',
    'disciplinas',
    L('Disciplinas e notas', 'Courses and grades'),
    L('semestre a semestre', 'semester by semester'),
  ),
];

const SERVICOS = [
  S(
    'servicos',
    'offers',
    'servicos',
    L('Serviços', 'Services'),
    L('o que posso oferecer', 'what I can offer'),
  ),
  S(
    'cases',
    'cases',
    'cases',
    L('Cases em destaque', 'Selected cases'),
    L('projetos entregues', 'delivered projects'),
  ),
  S('faq', 'faq', 'faq', L('Perguntas frequentes', 'FAQ'), L('dúvidas comuns', 'common questions')),
  S(
    'contato',
    'contact',
    'contato',
    L('Contato', 'Contact'),
    L('como pedir um orçamento', 'how to ask for a quote'),
  ),
];

// Grupos de experiências: id do grupo nos dados → [nome PT, nome EN].
const EXPERIENCE_GROUPS = {
  academic: ['academicas', 'academic'],
  learning: ['cursos', 'courses'],
  awards: ['reconhecimentos', 'awards'],
};

export function sectionsOf(routeId) {
  switch (routeId) {
    case 'curriculo':
      return CURRICULO;
    case 'academico':
      return ACADEMICO;
    case 'servicos':
      return SERVICOS;
    case 'projetos':
      return projects.map((p) => ({
        id: p.id,
        name: p.id,
        alias: p.id,
        anchor: `projeto-${p.id}`,
        label: L(p.name, p.name),
        desc: L(
          `${formatProjectDate(p.date)} · ${p.pt.badge ?? p.tech.slice(0, 3).join(', ')}`,
          `${formatProjectDate(p.date)} · ${p.en.badge ?? p.tech.slice(0, 3).join(', ')}`,
        ),
      }));
    case 'experiencias':
      return experienceGroups.map((g) => {
        const [name, alias] = EXPERIENCE_GROUPS[g.id] ?? [g.id, g.id];
        return {
          id: g.id,
          name,
          alias,
          anchor: `exp-${g.id}`,
          label: g.title,
          desc: L(`${g.items.length} itens`, `${g.items.length} items`),
        };
      });
    default:
      return [];
  }
}

export function findSection(routeId, arg) {
  const key = fold(arg);
  if (!key) return undefined;
  // Número do índice: `curriculo 2` abre a segunda seção.
  if (/^\d+$/.test(key)) return sectionsOf(routeId)[Number(key) - 1];
  return sectionsOf(routeId).find((s) => [s.name, s.alias, s.id].some((n) => fold(n) === key));
}

// Posição de uma seção no índice e as vizinhas (anterior/próxima).
export function neighbors(routeId, sectionId) {
  const list = sectionsOf(routeId);
  const i = list.findIndex((s) => s.id === sectionId);
  return { number: i + 1, total: list.length, prev: list[i - 1], next: list[i + 1] };
}

// Quebra argumentos de `cd`/`ls`/`open`: aceita `curriculo competencias`,
// `curriculo/competencias`, `~/curriculo/`, `./curriculo` e espaços extras.
export function splitTarget(args) {
  return args
    .join(' ')
    .split(/[\s/]+/)
    .map((part) => part.trim())
    .filter((part) => part && part !== '.' && part !== '~');
}

// Resolve um alvo para { route, section } ou um erro descritivo.
//  - [] ou ['..']                 → { home: true }
//  - ['curriculo']                → { route }
//  - ['curriculo','competencias'] → { route, section }
export function resolveTarget(args) {
  const parts = splitTarget(args);
  if (!parts.length || parts[0] === '..') return { home: true };
  const route = findDirectory(parts[0]);
  if (!route) return { error: 'page', arg: parts[0] };
  if (parts.length === 1) return { route };
  if (parts[1] === '..') return { route: undefined, home: true };
  const section = findSection(route.id, parts[1]);
  if (!section) return { error: 'section', route, arg: parts[1] };
  if (parts.length > 2) return { error: 'extra', route, section, arg: parts.slice(2).join('/') };
  return { route, section };
}

// Caminho da página própria (com a âncora da seção, quando houver).
export const targetPath = (route, section) =>
  section?.anchor ? `${route.path}#${section.anchor}` : route.path;

// Comando que mostra a seção no terminal: `curriculo competencias`.
export const sectionCommand = (route, section) =>
  section ? `${route.command} ${section.name}` : route.command;

export { routeById };
