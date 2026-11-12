// Catálogo de comandos por categoria, para a página do terminal e para o Game
// Center. Não é um segundo registro de comandos: as categorias só agrupam o
// inventário de `commands.tsx` (nomes, descrições e uso vêm de lá). Um teste
// garante que todo comando visível tem categoria.
import { commandInventory } from './commands';

export type CommandCategory = 'navigation' | 'pages' | 'info' | 'personalize' | 'fun';

export const CATEGORIES: CommandCategory[] = ['navigation', 'pages', 'info', 'personalize', 'fun'];

// Chave: nome em português do comando (o `id` do inventário).
const CATEGORY_OF: Record<string, CommandCategory> = {
  ajuda: 'navigation',
  ls: 'navigation',
  cd: 'navigation',
  proximo: 'navigation',
  anterior: 'navigation',
  inicio: 'navigation',
  limpar: 'navigation',
  historico: 'navigation',
  atalhos: 'navigation',
  visitante: 'personalize',
  pergunte: 'info',
  trilha: 'personalize',
  sobre: 'pages',
  projetos: 'pages',
  habilidades: 'pages',
  experiencias: 'pages',
  curriculo: 'pages',
  academico: 'pages',
  servicos: 'pages',
  contato: 'pages',
  agora: 'pages',
  setup: 'pages',
  stats: 'info',
  evolucao: 'info',
  neofetch: 'info',
  tema: 'personalize',
  idioma: 'personalize',
  fortune: 'fun',
  jogos: 'fun',
  minas: 'fun',
};

export interface CatalogEntry {
  id: string;
  category: CommandCategory;
  names: string[];
  desc: { pt: string; en: string } | null;
  usage: { pt: string; en: string } | null;
  // Precisa de um argumento (`cd <página>`): não dá para executar com um clique.
  needsArg: boolean;
}

export const categoryOf = (id: string) => CATEGORY_OF[id];

// Comandos visíveis (os ocultos continuam ocultos), na ordem do inventário.
export function commandCatalog(): CatalogEntry[] {
  return commandInventory()
    .filter((c) => !c.hidden && CATEGORY_OF[c.id])
    .map((c) => ({
      id: c.id,
      category: CATEGORY_OF[c.id],
      names: c.names,
      desc: c.desc,
      usage: c.usage,
      needsArg: Boolean(c.usage?.pt.startsWith('<')),
    }));
}

export const commandsIn = (category: CommandCategory) =>
  commandCatalog().filter((c) => c.category === category);
