// Dados do build injetados pelo Vite (`define` em vite.config.ts). Fora do
// Vite (ou se a injeção falhar) tudo vira `null`: o `stats` mostra
// "indisponível" em vez de inventar um número.
export interface BuildInfo {
  commits: number | null;
  version: string | null;
  builtAt: string | null;
}

declare const __BUILD__: BuildInfo | undefined;

export const buildInfo: BuildInfo =
  typeof __BUILD__ !== 'undefined' && __BUILD__
    ? __BUILD__
    : { commits: null, version: null, builtAt: null };
