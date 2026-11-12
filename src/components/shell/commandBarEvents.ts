// O botão `>_` do Header, a paleta de comandos e a barra de comandos conversam
// por estes eventos:
// - OPEN_PALETTE: o botão do Header pede à GlobalOverlays que abra a paleta
//   (o mesmo que Ctrl+K);
// - SHOW_OUTPUT: depois de rodar um comando de fora da barra (a paleta), pede
//   à CommandBar que mostre a saída (painel fora da home, terminal na home).
export const OPEN_PALETTE = 'portfolio:open-palette';
export const SHOW_OUTPUT = 'portfolio:show-output';
// - OPEN_SHORTCUTS: a barra lateral pede a lista de atalhos (o mesmo que `?`).
export const OPEN_SHORTCUTS = 'portfolio:open-shortcuts';

export const openPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE));
export const openShortcuts = () => window.dispatchEvent(new Event(OPEN_SHORTCUTS));
export const showCommandOutput = () => window.dispatchEvent(new Event(SHOW_OUTPUT));
