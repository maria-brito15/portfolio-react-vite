// Campo minado no terminal (JG-01, JG-05 a JG-09). Carregado sob demanda.
//
// - Mouse: clique abre, clique direito marca. Toque: botão "bandeira" liga o
//   modo de marcar (toque longo também marca). Teclado: setas movem, Enter ou
//   Espaço abrem, F marca, R reinicia, Esc sai.
// - Cada casa é um botão com `aria-label` ("linha 3, coluna 4, fechada…") e o
//   número aparece sempre como dígito, nunca só pela cor.
// - A partida vive neste componente: trocar de idioma redesenha sem perdê-la.
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Lang } from '../../types';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { readBest, saveBest } from './bestTimes';
import {
  LEVEL_NAMES,
  createBoard,
  minesLeft,
  openCell,
  toggleFlag,
  type Board,
  type Cell,
  type Level,
} from './mines';

const LONG_PRESS_MS = 450;

export const levelName = (level: Level, lang: Lang) => LEVEL_NAMES[level][lang];

function labelOf(board: Board, index: number, lang: Lang): string {
  const cell: Cell = board.cells[index];
  const row = Math.floor(index / board.cols) + 1;
  const col = (index % board.cols) + 1;
  const place = lang === 'pt' ? `linha ${row}, coluna ${col}` : `row ${row}, column ${col}`;
  let state: string;

  if (cell.flag) state = lang === 'pt' ? 'bandeira' : 'flag';
  else if (!cell.open) state = lang === 'pt' ? 'fechada' : 'closed';
  else if (cell.mine) state = lang === 'pt' ? 'mina' : 'mine';
  else if (cell.near === 0) state = lang === 'pt' ? 'vazia' : 'empty';
  else if (lang === 'pt')
    state = `${cell.near} ${cell.near === 1 ? 'mina vizinha' : 'minas vizinhas'}`;
  else state = `${cell.near} neighboring ${cell.near === 1 ? 'mine' : 'mines'}`;

  return `${place}, ${state}`;
}

// O que aparece dentro da casa: sempre texto, nunca só cor.
function face(cell: Cell): string {
  if (cell.flag) return '⚑';
  if (!cell.open) return '';
  if (cell.mine) return '✱';

  return cell.near ? String(cell.near) : '';
}

// `onExit`: quem hospeda o tabuleiro fora do terminal (Game Center) decide o que
// fazer ao sair; no terminal, sair só devolve o foco ao prompt.
export default function Minesweeper({
  lang,
  level,
  onExit,
}: {
  lang: Lang;
  level: Level;
  onExit?: () => void;
}) {
  const [board, setBoard] = useState<Board>(() => createBoard(level));
  const [seconds, setSeconds] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [exited, setExited] = useState(false);
  const [record, setRecord] = useState(false);
  const [best, setBest] = useState(() => readBest()[level]);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const press = useRef<{ timer?: ReturnType<typeof setTimeout>; fired: boolean }>({ fired: false });
  const narrow = useMediaQuery('(max-width: 720px)');

  const pt = lang === 'pt';
  const { status } = board;

  // O cronômetro só corre depois do primeiro clique e para ao fim da partida.
  useEffect(() => {
    if (status !== 'playing') return;

    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Quem digitou `minas` quer jogar: o foco vai para o tabuleiro.
  useEffect(() => {
    cellRefs.current[0]?.focus();

    const state = press.current;

    return () => clearTimeout(state.timer);
  }, []);

  function apply(next: Board) {
    if (next === board) return;
    setBoard(next);
    if (next.status === 'won' && board.status !== 'won') {
      const improved = saveBest(level, seconds);

      setRecord(improved);
      if (improved) setBest(seconds);
    }
  }

  function restart() {
    setBoard(createBoard(level));
    setSeconds(0);
    setRecord(false);
    setFlagMode(false);
    setCursor(0);
    cellRefs.current[0]?.focus();
  }

  function exit() {
    if (onExit) {
      onExit();

      return;
    }
    setExited(true);
    // Volta ao prompt: o foco vai para a linha de comando.
    // Na home é a linha do terminal; nas outras páginas, a barra de comandos.
    (
      document.querySelector<HTMLInputElement>('.cmd-input--terminal .term-input') ??
      document.querySelector<HTMLInputElement>('.term-input')
    )?.focus();
  }

  const focusCell = (index: number) => {
    setCursor(index);
    cellRefs.current[index]?.focus();
  };

  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const index = Number(target.dataset.index);

    if (event.key === 'Escape') {
      event.preventDefault();
      exit();

      return;
    }
    if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      restart();

      return;
    }
    if (Number.isNaN(index)) return;
    if (event.key.toLowerCase() === 'f' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      apply(toggleFlag(board, index));

      return;
    }

    const { rows, cols } = board;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const move: Record<string, number> = {
      ArrowLeft: col > 0 ? index - 1 : index,
      ArrowRight: col < cols - 1 ? index + 1 : index,
      ArrowUp: row > 0 ? index - cols : index,
      ArrowDown: row < rows - 1 ? index + cols : index,
    };

    if (event.key in move) {
      event.preventDefault();
      focusCell(move[event.key]);
    }
  }

  // Enter e Espaço ativam o botão (clique); toque longo marca a casa.
  function onClickCell(index: number) {
    if (press.current.fired) {
      press.current.fired = false;

      return;
    }
    apply(flagMode ? toggleFlag(board, index) : openCell(board, index));
  }

  function onPointerDown(index: number, pointerType: string) {
    if (pointerType !== 'touch') return;
    press.current.fired = false;
    press.current.timer = setTimeout(() => {
      press.current.fired = true;
      apply(toggleFlag(board, index));
    }, LONG_PRESS_MS);
  }

  const cancelPress = () => clearTimeout(press.current.timer);

  if (exited) {
    return (
      <p className="t-dim">
        {pt
          ? `partida encerrada. Digite jogos para ver os jogos.`
          : `game over. Type games to see the games.`}
      </p>
    );
  }

  let statusText: string;

  if (status === 'ready')
    statusText = pt ? 'clique em uma casa para começar' : 'click a square to start';
  else if (status === 'playing') statusText = pt ? 'jogando' : 'playing';
  else if (status === 'won') {
    statusText = pt ? `você ganhou em ${seconds}s!` : `you won in ${seconds}s!`;
    if (record) statusText += pt ? ' Novo recorde!' : ' New record!';
  } else
    statusText = pt
      ? 'bum! você pisou numa mina. Aperte R para tentar de novo.'
      : 'boom! you hit a mine. Press R to try again.';

  return (
    <div className="ms" role="group" aria-label={pt ? 'Campo minado' : 'Minesweeper'}>
      <p className="ms-bar">
        <span className="t-accent">
          {pt ? 'campo minado' : 'minesweeper'} · {levelName(level, lang)}
        </span>
        <span>
          <span aria-hidden="true">⚑ </span>
          <span className="sr-only">{pt ? 'minas restantes: ' : 'mines left: '}</span>
          {minesLeft(board)}
        </span>
        <span>
          <span aria-hidden="true">⏱ </span>
          <span className="sr-only">{pt ? 'tempo: ' : 'time: '}</span>
          {seconds}s
        </span>
        {best !== undefined && (
          <span className="t-dim">
            {pt ? 'melhor' : 'best'}: {best}s
          </span>
        )}
      </p>
      <p className="ms-tools">
        <button
          type="button"
          className="t-run"
          aria-pressed={flagMode}
          onClick={() => setFlagMode((on) => !on)}
        >
          ⚑ {pt ? 'modo bandeira' : 'flag mode'}:{' '}
          {flagMode ? (pt ? 'ligado' : 'on') : pt ? 'desligado' : 'off'}
        </button>
        <button type="button" className="t-run" onClick={restart}>
          ↻ {pt ? 'reiniciar' : 'restart'}
        </button>
        <button type="button" className="t-run" onClick={exit}>
          ✕ {pt ? 'sair' : 'exit'}
        </button>
      </p>
      <div className="ms-scroll">
        <div
          className="ms-grid"
          style={{ gridTemplateColumns: `repeat(${board.cols}, var(--ms-cell))` }}
          role="group"
          aria-label={pt ? 'Tabuleiro' : 'Board'}
          onKeyDown={onGridKeyDown}
        >
          {board.cells.map((cell, i) => (
            <button
              key={i}
              type="button"
              ref={(el) => {
                cellRefs.current[i] = el;
              }}
              data-index={i}
              tabIndex={i === cursor ? 0 : -1}
              aria-label={labelOf(board, i, lang)}
              className={[
                'ms-cell',
                cell.open && 'is-open',
                cell.open && cell.mine && 'is-mine',
                cell.flag && 'is-flag',
                cell.open && cell.near > 0 && `ms-n${cell.near}`,
                board.exploded === i && 'is-exploded',
              ]
                .filter(Boolean)
                .join(' ')}
              onFocus={() => setCursor(i)}
              onClick={() => onClickCell(i)}
              onContextMenu={(event) => {
                event.preventDefault();
                apply(toggleFlag(board, i));
              }}
              onPointerDown={(event) => onPointerDown(i, event.pointerType)}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              onPointerCancel={cancelPress}
            >
              {face(cell)}
            </button>
          ))}
        </div>
      </div>
      <p className="ms-status" role="status" aria-live="polite">
        {statusText}
      </p>
      {level === 'hard' && narrow && (
        <p className="t-dim">
          {pt
            ? 'o tabuleiro difícil é largo: deslize para os lados.'
            : 'the hard board is wide: swipe sideways.'}
        </p>
      )}
      <p className="t-dim">
        {pt
          ? 'setas movem · Enter/Espaço abrem · F marca · R reinicia · Esc sai'
          : 'arrows move · Enter/Space open · F flags · R restarts · Esc exits'}
      </p>
    </div>
  );
}
