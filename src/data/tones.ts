// Tons de categoria: o único lugar que decide QUAL cor cada coisa usa. Os valores
// das cores ficam em tokens.css (`--c-*`, por tema); aqui só há nomes. Um componente
// recebe o tom por `data-tone` e o CSS (ui.css) faz o resto. Nada aqui é conteúdo:
// só apresentação.
import type { NavGroup } from './routes';

export type Tone = 'violet' | 'mint' | 'amber' | 'coral' | 'cyan' | 'pink';

// Cada grupo da barra lateral tem uma cor; os atalhos do painel herdam a do seu grupo.
export const GROUP_TONE: Record<NavGroup, Tone> = {
  home: 'mint',
  portfolio: 'violet',
  interactive: 'pink',
  development: 'cyan',
  personal: 'amber',
};

// Ícone dos atalhos do painel: duas letras ASCII em mono (sem emoji nem imagem).
export const ROUTE_GLYPH: Record<string, string> = {
  projetos: '{}',
  github: '<>',
  habilidades: '[]',
  curriculo: 'cv',
  academico: '##',
  jogos: ':)',
  terminal: '>_',
  contato: '@',
};

// Identidade de cada projeto (timeline e painel). Projeto novo sem entrada fica no violeta.
export const PROJECT_TONE: Record<string, Tone> = {
  planoriza: 'amber',
  ecoshop: 'mint',
  portfolio: 'violet',
  'whatsapp-dispatcher': 'cyan',
  shorturl: 'pink',
  'file-name-standardizer': 'coral',
};

// Tecnologia por tipo: linguagem · framework/ferramenta · dados · infra e método.
// O que não casa fica neutro (cor só quando há um tipo claro).
const TECH_KINDS: [RegExp, Tone][] = [
  [/^(html|css|javascript|typescript|java|python|sql)/i, 'amber'],
  [/^(react|next|vite|vitest|express|spark|prisma|bullmq)/i, 'violet'],
  [/^(postgres|redis|mongo)/i, 'cyan'],
  [/^(docker|ci\/cd|spec-driven)/i, 'mint'],
];

export const techTone = (name: string): Tone | undefined =>
  TECH_KINDS.find(([re]) => re.test(name))?.[1];

// Séries de gráfico (linguagens do GitHub): ordem fixa, volta ao início se passar de seis.
export const SERIES: Tone[] = ['violet', 'cyan', 'mint', 'amber', 'pink', 'coral'];
export const seriesTone = (index: number): Tone => SERIES[index % SERIES.length];
