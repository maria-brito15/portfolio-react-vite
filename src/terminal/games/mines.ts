// Lógica pura do campo minado (JG-02, JG-03): sem React e sem relógio. Todo
// movimento devolve um tabuleiro NOVO (o anterior não é alterado) e o sorteio
// das minas recebe o gerador de números, para os testes usarem uma semente fixa.

export type Level = 'easy' | 'medium' | 'hard';
export type Status = 'ready' | 'playing' | 'won' | 'lost';

export interface LevelConfig {
  rows: number;
  cols: number;
  mines: number;
}

// Níveis clássicos: 9×9 com 10 minas, 16×16 com 40, 30×16 com 99.
export const LEVELS: Record<Level, LevelConfig> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

export interface Cell {
  mine: boolean;
  open: boolean;
  flag: boolean;
  // Minas nas casas vizinhas (0 a 8); só vale depois do primeiro clique.
  near: number;
}

export interface Board extends LevelConfig {
  level: Level;
  cells: Cell[];
  status: Status;
  flags: number;
  // Casa que explodiu (derrota), para destacá-la.
  exploded: number | null;
}

export type Random = () => number;

export function createBoard(level: Level): Board {
  const { rows, cols, mines } = LEVELS[level];

  return {
    level,
    rows,
    cols,
    mines,
    cells: Array.from({ length: rows * cols }, () => ({
      mine: false,
      open: false,
      flag: false,
      near: 0,
    })),
    status: 'ready',
    flags: 0,
    exploded: null,
  };
}

// Índices das casas vizinhas (até 8) de uma casa.
export function neighbors({ rows, cols }: Pick<Board, 'rows' | 'cols'>, index: number): number[] {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const result: number[] = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr;
      const c = col + dc;

      if ((dr || dc) && r >= 0 && r < rows && c >= 0 && c < cols) result.push(r * cols + c);
    }
  }

  return result;
}

export const minesLeft = (board: Board) => board.mines - board.flags;

// Sorteia as minas só no primeiro clique, fora da casa clicada e das vizinhas.
function placeMines(board: Board, cells: Cell[], safe: number, random: Random) {
  const blocked = new Set([safe, ...neighbors(board, safe)]);
  const candidates = cells.map((_, i) => i).filter((i) => !blocked.has(i));

  // Embaralhamento parcial (Fisher-Yates): só as primeiras `mines` posições importam.
  for (let i = 0; i < board.mines; i++) {
    const j = i + Math.floor(random() * (candidates.length - i));

    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    cells[candidates[i]].mine = true;
  }
  cells.forEach((cell, i) => {
    cell.near = neighbors(board, i).filter((n) => cells[n].mine).length;
  });
}

export function openCell(board: Board, index: number, random: Random = Math.random): Board {
  const target = board.cells[index];

  if (board.status === 'won' || board.status === 'lost') return board;
  if (!target || target.open || target.flag) return board;

  const cells = board.cells.map((c) => ({ ...c }));
  let status: Status = board.status;

  if (status === 'ready') {
    placeMines(board, cells, index, random);
    status = 'playing';
  }

  if (cells[index].mine) {
    // Derrota: mostra as outras minas (as marcadas com bandeira continuam marcadas).
    cells.forEach((c) => {
      if (c.mine && !c.flag) c.open = true;
    });

    return { ...board, cells, status: 'lost', exploded: index };
  }

  // Abre em cascata a partir das casas sem minas vizinhas.
  const stack = [index];

  while (stack.length) {
    const i = stack.pop() as number;
    const cell = cells[i];

    if (cell.open || cell.flag) continue;
    cell.open = true;
    if (cell.near === 0) stack.push(...neighbors(board, i));
  }

  const opened = cells.filter((c) => c.open).length;

  if (opened === cells.length - board.mines) {
    // Vitória: as minas que sobraram ganham bandeira.
    cells.forEach((c) => {
      if (c.mine) c.flag = true;
    });

    return { ...board, cells, status: 'won', flags: board.mines };
  }

  return { ...board, cells, status };
}

export function toggleFlag(board: Board, index: number): Board {
  const target = board.cells[index];

  if (board.status === 'won' || board.status === 'lost') return board;
  if (!target || target.open) return board;

  const cells = board.cells.map((c, i) => (i === index ? { ...c, flag: !c.flag } : c));

  return { ...board, cells, flags: board.flags + (target.flag ? -1 : 1) };
}

// Gerador determinístico para testes (mulberry32).
export function seeded(seed: number): Random {
  let a = seed;

  return () => {
    a = (a + 0x6d2b79f5) | 0;

    let t = Math.imul(a ^ (a >>> 15), 1 | a);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
