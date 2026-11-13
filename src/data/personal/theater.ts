// Teatro: curadoria manual da Duda (não existe fonte pública, decisão D4). Só entra aqui o que
// ela fornecer; nada é inventado. Enquanto `visits` estiver vazio, a página `/pessoal/teatro`
// fica em construção: fora do sitemap, do índice e do hub (`draft` em routes.ts).
// `updated`: data da última edição, "AAAA-MM-DD", exibida no rodapé da página.
import type { TheaterVisit } from './types';

export const theater: { updated: string | null; visits: TheaterVisit[] } = {
  updated: null,
  visits: [],
};
