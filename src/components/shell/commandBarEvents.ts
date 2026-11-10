// O botão `>_` do Header e a barra de comandos conversam por este evento:
// quem quer abrir os comandos dispara, a CommandBar foca (e, em tela estreita,
// abre em tela cheia).
export const FOCUS_COMMANDS = 'portfolio:focus-commands';

export const focusCommands = () => window.dispatchEvent(new Event(FOCUS_COMMANDS));
