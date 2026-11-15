// Capa (CD-10): foto de fundo e tagline. A Duda fornece os dois depois; até lá, a capa
// mostra uma cor sólida rotulada e a tagline provisória (termina em "TODO: tagline").
import type { Localized } from '../../types';

export interface CoverConfig {
  // Caminho em /public (ex.: '/assets/capa.jpg'). Sem foto, a capa usa a cor sólida.
  photo?: string;
  tagline: Localized;
}

export const cover: CoverConfig = {
  photo: undefined,
  tagline: {
    pt: 'Uma frase em primeira pessoa sobre o que faço e por quê. TODO: tagline',
    en: 'One first-person sentence about what I do and why. TODO: tagline',
  },
};
