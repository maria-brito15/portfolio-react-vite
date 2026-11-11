// Comandos de personalidade, registrados em `commands.tsx` (T-X1). Cada um mora
// no próprio arquivo para o interpretador não virar um arquivo só.
import type { Command } from '../commands';
import { neofetch } from './neofetch';
import { boot, cow, fortune, matrix, rm } from './fun';
import { gitlog } from './gitlog';
import { jogos, minas, sair } from './games';
import { agora, setup } from './pages';
import { stats } from './stats';

export { HIRE, hireResult } from './fun';

export const extraCommands: Command[] = [
  agora,
  setup,
  neofetch,
  gitlog,
  stats,
  fortune,
  jogos,
  minas,
  sair,
  cow,
  matrix,
  boot,
  rm,
];
