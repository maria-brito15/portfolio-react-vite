// Comandos dos jogos: `minas` (campo minado), `jogos` (a lista) e `sair`.
// O tabuleiro é carregado sob demanda e no replay do histórico nunca reabre
// uma partida: mostra só que ela terminou.
import { Suspense, lazy } from 'react';
import type { Lang, Localized } from '../../types';
import { fold } from '../../data/routes';
import type { Level } from '../games/mines';
import type { Command } from '../commands';
import { Cmd } from '../outputs';
import { RunCommand } from '../pageIndex';

const L = (pt: string, en: string): Localized => ({ pt, en });

// Uma chave por execução do comando: rodar `minas` de novo começa outra partida,
// mas redesenhar a mesma saída (troca de idioma) mantém a partida em andamento.
let games = 0;

const Minesweeper = lazy(() => import('../games/Minesweeper'));

// Nomes aceitos (sem acento) para cada nível, em PT e EN.
const LEVEL_WORDS: Record<Level, string[]> = {
  easy: ['facil', 'easy'],
  medium: ['medio', 'medium'],
  hard: ['dificil', 'hard'],
};

const levelFrom = (word: string): Level | undefined =>
  (Object.keys(LEVEL_WORDS) as Level[]).find((level) => LEVEL_WORDS[level].includes(fold(word)));

const gameOver = (lang: Lang) =>
  lang === 'pt'
    ? 'partida encerrada. Digite jogos para ver os jogos.'
    : 'game over. Type games to see the games.';

export const minas: Command = {
  names: ['minas', 'minesweeper'],
  aliases: ['campominado'],
  usage: L('[facil|medio|dificil]', '[easy|medium|hard]'),
  desc: L('campo minado (9×9, 16×16 ou 30×16)', 'minesweeper (9×9, 16×16 or 30×16)'),
  run: (args, ctx) => {
    const level = args.length ? levelFrom(args[0]) : 'easy';

    if (!level || args.length > 1) {
      return {
        output: (lang) => (
          <div>
            <p className="t-err">
              {`${lang === 'pt' ? 'minas' : 'minesweeper'}: ${args.join(' ')}: ${
                lang === 'pt' ? 'nível desconhecido' : 'unknown level'
              }`}
            </p>
            <GameList lang={lang} />
          </div>
        ),
      };
    }

    const game = ++games;

    return {
      output: (lang) =>
        ctx.replay ? (
          <p className="t-dim">{gameOver(lang)}</p>
        ) : (
          <Suspense fallback={<p className="t-dim">…</p>}>
            <Minesweeper key={game} lang={lang} level={level} />
          </Suspense>
        ),
    };
  },
};

function GameList({ lang }: { lang: Lang }) {
  const pt = lang === 'pt';
  const rows: [string, string][] = [
    [pt ? 'minas' : 'minesweeper', pt ? 'fácil · 9×9 · 10 minas' : 'easy · 9×9 · 10 mines'],
    [
      pt ? 'minas medio' : 'minesweeper medium',
      pt ? 'médio · 16×16 · 40 minas' : 'medium · 16×16 · 40 mines',
    ],
    [
      pt ? 'minas dificil' : 'minesweeper hard',
      pt ? 'difícil · 30×16 · 99 minas' : 'hard · 30×16 · 99 mines',
    ],
  ];

  return (
    <ul className="t-index-list">
      {rows.map(([command, desc]) => (
        <li key={command}>
          <RunCommand command={command}>
            <span className="t-accent">{command}</span>
            <span className="t-dim">{desc}</span>
          </RunCommand>
        </li>
      ))}
    </ul>
  );
}

export const jogos: Command = {
  names: ['jogos', 'games'],
  desc: L('lista os jogos do terminal', 'list the terminal games'),
  run: () => ({
    output: (lang) => (
      <div>
        <p className="t-dim">
          {lang === 'pt'
            ? 'jogos disponíveis (clique ou digite o comando):'
            : 'available games (click or type the command):'}
        </p>
        <GameList lang={lang} />
        <p className="t-dim">
          {lang === 'pt' ? 'Dentro do jogo, ' : 'Inside the game, '}
          <Cmd>Esc</Cmd> {lang === 'pt' ? 'ou' : 'or'} <Cmd>{lang === 'pt' ? 'sair' : 'exit'}</Cmd>{' '}
          {lang === 'pt' ? 'voltam ao prompt.' : 'go back to the prompt.'}
        </p>
      </div>
    ),
  }),
};

// `sair`: como cada comando substitui a tela, rodar `sair` fecha o tabuleiro.
export const sair: Command = {
  names: ['sair', 'exit'],
  hidden: true,
  run: () => ({
    output: (lang) => (
      <p className="t-dim">{lang === 'pt' ? 'de volta ao prompt.' : 'back at the prompt.'}</p>
    ),
  }),
};
