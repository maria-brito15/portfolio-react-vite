// Volume corrente do caderno (CD-80). Um volume por ano: ao trocar `number`, a abertura
// toca de novo uma vez para todos (a chave do localStorage leva o número).
import type { Localized } from '../../types';

export interface Volume {
  number: number;
  year: number;
  label: Localized;
}

export const volume: Volume = {
  number: 11,
  year: 2026,
  label: { pt: 'Caderno — Vol. XI / 2026', en: 'Notebook — Vol. XI / 2026' },
};

const ROMAN: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

// Numeral romano de 1 a 3999 (o volume e o ano do rodapé: XI e MMXXVI).
export function toRoman(n: number) {
  let rest = Math.max(0, Math.min(3999, Math.floor(n)));
  let out = '';

  for (const [value, symbol] of ROMAN) {
    while (rest >= value) {
      out += symbol;
      rest -= value;
    }
  }

  return out;
}

export const OPENER_KEY_PREFIX = 'notebook-opener-seen-vol-';
export const openerKey = (v: Volume = volume) => `${OPENER_KEY_PREFIX}${v.number}`;
