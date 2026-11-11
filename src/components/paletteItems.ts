// Opções da paleta de comandos (Ctrl+K), montadas das duas fontes únicas:
// `routes.ts` (páginas) e o inventário de comandos. Nada é repetido à mão e
// escolher uma opção roda o MESMO comando que o terminal rodaria (JA-07).
import type { Lang } from '../types';
import { directories, fold } from '../data/routes';
import { commandInventory } from '../terminal/commands';

export interface PaletteItem {
  id: string;
  kind: 'page' | 'command';
  label: string;
  hint: string;
  // Linha executada na sessão do terminal ao escolher a opção.
  run: string;
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

  const commands: PaletteItem[] = commandInventory()
    // Fora da paleta: ocultos e os que exigem argumento (`cd <página>`).
    .filter((c) => !c.hidden && !c.usage?.pt.startsWith('<'))
    .map((c) => {
      const label = lang === 'pt' ? c.names[0] : c.names[1];

      return {
        id: `command:${c.id}`,
        kind: 'command',
        label,
        hint: c.desc?.[lang] ?? '',
        run: label,
        search: fold([...c.names, c.desc?.pt, c.desc?.en].join(' ')),
      };
    });

  return [...pages, ...commands];
}

// Todos os termos digitados precisam aparecer (em qualquer ordem).
export function filterItems(items: PaletteItem[], query: string): PaletteItem[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);

  return items.filter((item) => terms.every((term) => item.search.includes(term)));
}
