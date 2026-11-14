// Quais fontes do espaço cultural já têm integração real (modo `live`). Uma página cuja fonte ainda
// não foi integrada continua em rascunho no modo `live` (routes.ts): fora do sitemap e do hub, em
// vez de abrir só para mostrar um erro. Muda para `true` quando a integração entra (Fases do plano
// em docs/specs/personal/README.md, seção 9).
export const integrated = {
  books: true, // Hardcover: netlify/functions/personal-books.mts
  films: true, // Letterboxd (RSS + CSV) + TMDB: netlify/functions/personal-films.mts
} as const;
