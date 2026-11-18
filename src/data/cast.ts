// Versões maiores instaladas do elenco, injetadas pelo Vite (`define` em vite.config.ts). Fora do
// Vite a tabela fica vazia e o rodapé mostra só os nomes.
import type { CastVersions } from '../../scripts/castVersions';

declare const __CAST__: CastVersions | undefined;

export const castVersions: CastVersions =
  typeof __CAST__ !== 'undefined' && __CAST__ ? __CAST__ : {};
