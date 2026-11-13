// Textos de interface do espaço cultural (/pessoal). Ficam num arquivo próprio, como `ws.ts`,
// para o `ui.ts` não crescer sem fim; `ui.ts` os inclui em `ui.pt.personal` e `ui.en.personal`.
// Títulos de obras, autores e sinopses vêm das fontes e não passam por aqui (CL-26).
export const personalPt = {
  placeholder: {
    badge: 'DADOS FICTÍCIOS',
    hint: 'Conteúdo de exemplo para validar o layout. Nada aqui foi lido, assistido ou ouvido pela Duda.',
    item: 'fictício',
  },
  rating: { none: 'sem nota' },
  stale: {
    notice: (date: string) => `Não foi possível atualizar agora. Mostrando os dados de ${date}.`,
  },
  footer: {
    synced: 'Última sincronização',
    via: 'via',
    sources: {
      hardcover: 'Hardcover',
      letterboxd: 'Letterboxd',
      tmdb: 'TMDB',
      manual: 'curadoria da Duda',
      mock: 'dados fictícios',
      snapshot: 'cópia salva',
    },
    // Aviso de atribuição pedido pelo TMDB (texto em inglês, como nos termos [A]).
    tmdb: 'This product uses the TMDB API but is not endorsed or certified by TMDB.',
  },
};

export const personalEn = {
  placeholder: {
    badge: 'PLACEHOLDER DATA',
    hint: 'Example content to validate the layout. Nothing here was read, watched or listened to by Duda.',
    item: 'placeholder',
  },
  rating: { none: 'no rating' },
  stale: {
    notice: (date: string) => `Could not refresh right now. Showing the data from ${date}.`,
  },
  footer: {
    synced: 'Last synced',
    via: 'via',
    sources: {
      hardcover: 'Hardcover',
      letterboxd: 'Letterboxd',
      tmdb: 'TMDB',
      manual: "Duda's curation",
      mock: 'placeholder data',
      snapshot: 'saved copy',
    },
    tmdb: 'This product uses the TMDB API but is not endorsed or certified by TMDB.',
  },
};
