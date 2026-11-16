// Comandos de personalidade, registrados em `commands.tsx` (T-X1). Cada um mora
// no próprio arquivo para o interpretador não virar um arquivo só.
import type { Command } from '../commands';
import { neofetch } from './neofetch';
import { boot, cow, fortune, matrix, rm } from './fun';
import { gitlog } from './gitlog';
import { agora, setup } from './pages';
import { pessoal } from './personal';
import { stats } from './stats';
import { visitante } from './persona';
import { trilha } from './trilha';

export { HIRE, hireResult } from './fun';
export { personaAnswer } from './persona';

export const extraCommands: Command[] = [
  agora,
  pessoal,
  visitante,
  trilha,
  setup,
  neofetch,
  gitlog,
  stats,
  fortune,
  cow,
  matrix,
  boot,
  rm,
];
