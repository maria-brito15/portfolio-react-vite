// Música: curadoria manual da Duda (sem fonte automática, decisão D4). É este arquivo que ela
// edita; nenhum componente precisa mudar. Só entra aqui o que ela fornecer; nada é inventado.
// Cada lista pode ficar vazia: a página só mostra a seção que tiver item, e só mostra o campo
// preenchido (nível, ano de início e notas são opcionais).
// `updated`: data da última edição, "AAAA-MM-DD", exibida no rodapé da página.
import type { Album, FavoriteArtist, FavoriteSong, Instrument, PracticeItem } from './types';

export interface MusicData {
  updated: string | null;
  instruments: Instrument[];
  practice: PracticeItem[];
  artists: FavoriteArtist[];
  songs: FavoriteSong[];
  albums: Album[];
}

export const music: MusicData = {
  updated: null,

  // Instrumentos que a Duda toca (informado por ela). TODO: nível, `since` e `note` de cada um,
  // se ela quiser mostrar.
  instruments: [
    { id: 'guitar', name: { pt: 'Guitarra', en: 'Electric guitar' } },
    { id: 'acoustic-guitar', name: { pt: 'Violão', en: 'Acoustic guitar' } },
    { id: 'singing', name: { pt: 'Canto', en: 'Singing' } },
    { id: 'bass', name: { pt: 'Baixo', en: 'Bass' } },
    { id: 'drums', name: { pt: 'Bateria', en: 'Drums' } },
    { id: 'ukulele', name: { pt: 'Ukulele', en: 'Ukulele' } },
  ],

  // TODO (Duda): o que está aprendendo agora. Ex.: { id, title, instrumentId, artist?, note? }.
  practice: [],

  // TODO (Duda): artistas favoritos. Ex.: { id, name, note? }.
  artists: [],

  // TODO (Duda): músicas favoritas; `onRepeat: true` nas que estão em repetição agora.
  songs: [],

  // TODO (Duda): discos; `inRotation: true` nos que está ouvindo agora. `provenance` abaixo:
  // { source: 'manual', fetchedAt: '<AAAA-MM-DD>' }.
  albums: [],
};

// A página só sai do rascunho (routes.ts) quando a curadoria tem algo para mostrar.
export const musicHasContent = (data: MusicData = music) =>
  data.instruments.length +
    data.practice.length +
    data.artists.length +
    data.songs.length +
    data.albums.length >
  0;
