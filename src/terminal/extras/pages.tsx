// Comandos `agora` (now) e `setup` (uses): a visão em terminal das páginas
// /agora e /setup. O par "ver no terminal / abrir página própria" é adicionado
// pelo interpretador, porque os dois comandos têm `route`.
import type { Localized } from '../../types';
import { NowBody, UsesBody } from '../../components/InfoBodies';
import type { Command } from '../commands';

const L = (pt: string, en: string): Localized => ({ pt, en });

export const agora: Command = {
  names: ['agora', 'now'],
  route: 'agora',
  desc: L('no que estou focada agora', 'what I am focused on now'),
  run: () => ({ output: (lang) => <NowBody lang={lang} /> }),
};

export const setup: Command = {
  names: ['setup', 'uses'],
  route: 'setup',
  desc: L('ferramentas do dia a dia', 'everyday tools'),
  run: () => ({ output: (lang) => <UsesBody lang={lang} /> }),
};
