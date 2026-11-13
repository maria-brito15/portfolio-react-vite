// Modo Explorar (amigo): dicas progressivas e próximos passos para cada segredo de
// `trails.ts`. Os segredos, os gatilhos e o estado "achado" continuam sendo os da trilha;
// aqui só há texto de interface: uma dica vaga, como fazer e para onde ir depois.
// `explore.test.ts` confere que todo segredo tem entrada e todo destino existe.
import type { Localized } from '../types';

const L = (pt: string, en: string): Localized => ({ pt, en });

export interface ExploreHint {
  // Dica vaga (nível 1).
  hint: Localized;
  // Como fazer (nível 2): o texto e, quando for um comando, ele para rodar com um clique.
  how: Localized;
  command?: string;
  // Sugestão depois de achar: id de rota de `routes.ts`.
  next: { route: string; label: Localized };
}

const GAMES = { route: 'jogos', label: L('Ver os jogos', 'See the games') };
const TERMINAL = { route: 'terminal', label: L('Voltar ao terminal', 'Back to the terminal') };
const ABOUT = { route: 'sobre', label: L('Conhecer a Duda', 'Get to know Duda') };
const PROJECTS = { route: 'projetos', label: L('Ver os projetos', 'See the projects') };

export const exploreHints: Record<string, ExploreHint> = {
  fortune: {
    hint: L('Um comando que sorteia uma frase.', 'A command that picks a phrase at random.'),
    how: L('Rode `fortune` no terminal.', 'Run `fortune` in the terminal.'),
    command: 'fortune',
    next: ABOUT,
  },
  cowsay: {
    hint: L('Um animal fala pelo terminal.', 'An animal speaks through the terminal.'),
    how: L('Rode `cowsay` com uma frase.', 'Run `cowsay` with a phrase.'),
    command: 'cowsay oi',
    next: GAMES,
  },
  matrix: {
    hint: L('Um filme de ficção científica virou comando.', 'A sci-fi movie became a command.'),
    how: L('Rode `matrix` no terminal.', 'Run `matrix` in the terminal.'),
    command: 'matrix',
    next: PROJECTS,
  },
  boot: {
    hint: L('Como o terminal acordou, de novo.', 'How the terminal woke up, once more.'),
    how: L('Rode `boot` no terminal.', 'Run `boot` in the terminal.'),
    command: 'boot',
    next: ABOUT,
  },
  rm: {
    hint: L(
      'Um comando perigoso de Unix, mas aqui é inofensivo.',
      'A dangerous Unix command, but harmless here.',
    ),
    how: L('Rode `rm` com qualquer nome.', 'Run `rm` with any name.'),
    command: 'rm arquivo',
    next: TERMINAL,
  },
  minas: {
    hint: L('Um clássico de lógica com bandeiras.', 'A logic classic with flags.'),
    how: L(
      'Rode `minas` no terminal ou abra os jogos.',
      'Run `minas` in the terminal or open the games.',
    ),
    command: 'minas',
    next: GAMES,
  },
  tema: {
    hint: L('O site pode mudar de aparência.', 'The site can change its look.'),
    how: L('Troque o tema do site.', 'Switch the site theme.'),
    next: TERMINAL,
  },
  idioma: {
    hint: L('O site fala mais de uma língua.', 'The site speaks more than one language.'),
    how: L('Troque o idioma do site.', 'Switch the site language.'),
    next: PROJECTS,
  },
};
