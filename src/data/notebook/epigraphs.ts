// Epígrafes do caderno (CD-81). SEMENTES: citações curtas de obras reais, com a fonte; a curadoria
// e as traduções são da Duda confirmar ou trocar (lista de pendências em docs/design/caderno-vol-xi.md).
// `personaBias`: lentes para as quais a epígrafe é preferida; nunca esconde as outras.
import type { PersonaId } from '../personas';

export interface Epigraph {
  pt: string;
  en: string;
  source: string;
  personaBias?: PersonaId[];
}

export const epigraphs: Epigraph[] = [
  {
    pt: 'Um clássico é um livro que nunca terminou de dizer aquilo que tinha para dizer.',
    en: 'A classic is a book that has never finished saying what it has to say.',
    source: 'Italo Calvino, Por que ler os clássicos',
    personaBias: ['professor', 'amigo'],
  },
  {
    pt: 'O real não está na saída nem na chegada: ele se dispõe para a gente é no meio da travessia.',
    en: 'The real is not at the departure nor at the arrival: it shows itself to us in the middle of the crossing.',
    source: 'João Guimarães Rosa, Grande Sertão: Veredas',
    personaBias: ['rh', 'cliente'],
  },
  {
    pt: 'Tudo vale a pena se a alma não é pequena.',
    en: 'Everything is worth it if the soul is not small.',
    source: 'Fernando Pessoa, Mensagem',
    personaBias: ['amigo'],
  },
  {
    pt: 'A fotografia é a verdade, e o cinema é a verdade vinte e quatro vezes por segundo.',
    en: 'Photography is truth, and cinema is truth twenty-four times a second.',
    source: 'Jean-Luc Godard, O pequeno soldado',
    personaBias: ['tech'],
  },
  {
    pt: 'No meio do caminho tinha uma pedra.',
    en: 'In the middle of the road there was a stone.',
    source: 'Carlos Drummond de Andrade, No meio do caminho',
    personaBias: ['tech', 'professor'],
  },
];

// Estável durante o dia (o deslocamento varia por capítulo); a lente prefere as epígrafes marcadas
// para ela. Nunca esconde as outras.
export function pickEpigraph(persona: PersonaId | undefined, offset = 0, day = new Date()): Epigraph {
  const seed = day.getFullYear() * 400 + day.getMonth() * 31 + day.getDate();
  const biased = persona ? epigraphs.filter((e) => e.personaBias?.includes(persona)) : [];
  const pool = biased.length ? biased : epigraphs;

  return pool[(seed + offset) % pool.length];
}
