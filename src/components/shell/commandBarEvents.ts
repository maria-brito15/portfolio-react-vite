// O botão `>_` do Header, a paleta de comandos e a barra de comandos conversam
// por estes eventos:
// - FOCUS_COMMANDS: quem quer abrir os comandos dispara, a CommandBar foca (e,
//   em tela estreita, abre em tela cheia);
// - SHOW_OUTPUT: depois de rodar um comando de fora da barra (a paleta), pede
//   à CommandBar que mostre a saída (painel fora da home, terminal na home).
export const FOCUS_COMMANDS = 'portfolio:focus-commands';
export const SHOW_OUTPUT = 'portfolio:show-output';

export const focusCommands = () => window.dispatchEvent(new Event(FOCUS_COMMANDS));
export const showCommandOutput = () => window.dispatchEvent(new Event(SHOW_OUTPUT));
