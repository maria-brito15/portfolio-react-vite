// Música: curadoria manual da Duda (sem fonte automática, decisão D4). Só entra aqui o que ela
// fornecer; nada é inventado. Enquanto `albums` estiver vazio, a página `/pessoal/musica` fica
// em construção: fora do sitemap, do índice e do hub (`draft` em routes.ts).
// `updated`: data da última edição, "AAAA-MM-DD", exibida no rodapé da página.
import type { Album } from './types';

export const music: { updated: string | null; albums: Album[] } = {
  updated: null,
  albums: [],
};
