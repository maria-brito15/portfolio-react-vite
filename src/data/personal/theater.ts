// Teatro: curadoria manual da Duda (não existe fonte pública, decisão D4). É este arquivo que
// ela edita; nenhum componente precisa mudar. Só entra aqui o que ela fornecer; nada é
// inventado, e nada presume que ela atue ou seja profissional de teatro. Cada lista pode ficar
// vazia: a página só mostra a seção que tiver item.
// `updated`: data da última edição, "AAAA-MM-DD", exibida no rodapé da página.
import type {
  FavoriteProduction,
  TheaterExperience,
  TheaterObservation,
  TheaterVisit,
  VisualReference,
} from './types';

export interface TheaterData {
  updated: string | null;
  visits: TheaterVisit[];
  experiences: TheaterExperience[];
  favorites: FavoriteProduction[];
  observations: TheaterObservation[];
  references: VisualReference[];
}

export const theater: TheaterData = {
  updated: null,

  // TODO (Duda): peças que viu. Ex.: { id, title, company?, venue?, city?, date?, note?,
  // provenance: { source: 'manual', fetchedAt: '<AAAA-MM-DD>' } }.
  visits: [],

  // TODO (Duda): vivências com teatro (como ela descrever). Ex.: { id, title: {pt,en}, period?, note? }.
  experiences: [],

  // TODO (Duda): produções favoritas. Ex.: { id, title, company?, year?, note? }.
  favorites: [],

  // TODO (Duda): observações pessoais. Ex.: { id, text: {pt,en} }.
  observations: [],

  // TODO (Duda): referências visuais (cenografia, figurino, cartaz). Ex.: { id, title: {pt,en},
  // creator?, url?, note? }.
  references: [],
};

// A página só sai do rascunho (routes.ts) quando a curadoria tem algo para mostrar.
export const theaterHasContent = (data: TheaterData = theater) =>
  data.visits.length +
    data.experiences.length +
    data.favorites.length +
    data.observations.length +
    data.references.length >
  0;
