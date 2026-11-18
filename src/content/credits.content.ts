// Créditos do rodapé (FR-036, FR-037, TD-020). Valores do mockup, confirmados pela Duda em
// 2026-11-17: "Roteiro e código: Duda" e "Filmado em: Belo Horizonte, MG". O elenco é só a lista
// DECLARADA de pacotes; a versão maior vem da versão instalada, lida no build (scripts/castVersions.ts).
import type { Credits } from './schema/credits';

export const credits: Credits = {
  writer: 'Duda',
  shotIn: { pt: 'Belo Horizonte, MG', en: 'Belo Horizonte, MG' },
  cast: [
    { package: 'react', name: 'React' },
    { package: 'vite', name: 'Vite' },
    { package: 'typescript', name: 'TypeScript' },
  ],
};
