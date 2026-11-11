// Frases do `fortune`. Em construção: a lista começa vazia de propósito, porque
// as frases (próprias ou de fontes citadas) são da Duda; o comando mostra "sem
// frases ainda" enquanto isso. Cada item é um texto nos dois idiomas, com a
// fonte opcional (`by`) quando a frase não for dela.
import type { Localized } from '../types';

export interface Fortune {
  text: Localized;
  by?: string;
}

export const fortunes: Fortune[] = [];
