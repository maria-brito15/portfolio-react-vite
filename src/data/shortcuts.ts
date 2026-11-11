// Tabela única de atalhos de teclado (JA-08, JA-09). A lista `?`, o comando
// `atalhos` e a dica da `ajuda` leem daqui; quem trata a tecla de fato está em
// GlobalOverlays (Ctrl+K, ?), CommandBar (/) e useTerminal (Tab, ↑ ↓, Ctrl+L, Ctrl+C).
import type { Lang, Localized } from '../types';

const L = (pt: string, en: string): Localized => ({ pt, en });

export interface Shortcut {
  keys: string;
  desc: Localized;
}

export const shortcuts: Shortcut[] = [
  { keys: 'Ctrl+K', desc: L('abre a paleta de comandos', 'opens the command palette') },
  { keys: '/', desc: L('foca a barra de comandos', 'focuses the command bar') },
  { keys: '?', desc: L('mostra esta lista de atalhos', 'shows this shortcut list') },
  {
    keys: 'Tab',
    desc: L('completa comandos, páginas e seções', 'completes commands, pages and sections'),
  },
  { keys: '↑ ↓', desc: L('navegam no histórico', 'browse the history') },
  { keys: 'Ctrl+L', desc: L('limpa a tela', 'clears the screen') },
  { keys: 'Ctrl+C', desc: L('interrompe a linha atual', 'interrupts the current line') },
  {
    keys: 'Esc',
    desc: L('fecha painéis e cancela um carregamento', 'closes panels and cancels a load'),
  },
];

// "Ctrl+K abre a paleta de comandos"
export const shortcutLine = (s: Shortcut, lang: Lang) => `${s.keys} ${s.desc[lang]}`;
