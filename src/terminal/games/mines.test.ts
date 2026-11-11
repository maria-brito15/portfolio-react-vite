import { BEST_KEY, readBest, saveBest } from './bestTimes';
import {
  LEVELS,
  createBoard,
  minesLeft,
  neighbors,
  openCell,
  seeded,
  toggleFlag,
  type Board,
  type Level,
} from './mines';

const mineCount = (b: Board) => b.cells.filter((c) => c.mine).length;
const levels = Object.keys(LEVELS) as Level[];

// Tabuleiro 3×3 montado à mão: mina só no canto (0,0).
function handmade(mines: number[]): Board {
  const base = createBoard('easy');
  const rows = 3;
  const cols = 3;
  const cells = Array.from({ length: rows * cols }, (_, i) => ({
    mine: mines.includes(i),
    open: false,
    flag: false,
    near: 0,
  }));
  const board = { ...base, rows, cols, mines: mines.length, cells, status: 'playing' as const };

  cells.forEach((cell, i) => {
    cell.near = neighbors(board, i).filter((n) => cells[n].mine).length;
  });

  return board;
}

describe('níveis (JG-04)', () => {
  it('9×9 com 10, 16×16 com 40 e 30×16 com 99 minas', () => {
    expect(LEVELS.easy).toEqual({ rows: 9, cols: 9, mines: 10 });
    expect(LEVELS.medium).toEqual({ rows: 16, cols: 16, mines: 40 });
    expect(LEVELS.hard).toEqual({ rows: 16, cols: 30, mines: 99 });
  });

  it('o tabuleiro novo está fechado, sem minas e pronto', () => {
    for (const level of levels) {
      const b = createBoard(level);

      expect(b.cells).toHaveLength(b.rows * b.cols);
      expect(mineCount(b)).toBe(0);
      expect(b.status).toBe('ready');
      expect(minesLeft(b)).toBe(b.mines);
    }
  });
});

describe('vizinhas', () => {
  it('canto tem 3, borda 5 e meio 8', () => {
    const b = createBoard('easy');

    expect(neighbors(b, 0)).toHaveLength(3);
    expect(neighbors(b, 80)).toHaveLength(3);
    expect(neighbors(b, 4)).toHaveLength(5);
    expect(neighbors(b, 40)).toHaveLength(8);
  });

  it('não atravessa a borda lateral', () => {
    const b = createBoard('easy');

    // casa 8 é a última da linha 0; a casa 9 (primeira da linha 1) não é vizinha dela
    expect(neighbors(b, 8)).not.toContain(9);
    expect(neighbors(b, 9)).not.toContain(8);
  });
});

describe('primeiro clique nunca é mina (JG-03)', () => {
  it.each(levels)(
    'nível %s: o primeiro clique e as vizinhas ficam livres, com várias sementes',
    (level) => {
      const { rows, cols, mines } = LEVELS[level];

      for (const seed of [1, 2, 3, 42, 99, 12345]) {
        // canto, meio e uma casa qualquer
        for (const first of [0, Math.floor((rows * cols) / 2), rows * cols - 1]) {
          const board = openCell(createBoard(level), first, seeded(seed));

          expect(board.status, `semente ${seed}, casa ${first}`).not.toBe('lost');
          expect(board.cells[first].mine).toBe(false);
          for (const n of neighbors(board, first)) expect(board.cells[n].mine).toBe(false);
          expect(mineCount(board)).toBe(mines);
        }
      }
    },
  );

  it('o mesmo sorteio com a mesma semente dá o mesmo tabuleiro', () => {
    const a = openCell(createBoard('medium'), 100, seeded(7));
    const b = openCell(createBoard('medium'), 100, seeded(7));
    const c = openCell(createBoard('medium'), 100, seeded(8));

    expect(a.cells.map((x) => x.mine)).toEqual(b.cells.map((x) => x.mine));
    expect(a.cells.map((x) => x.mine)).not.toEqual(c.cells.map((x) => x.mine));
  });

  it('as minas só existem depois do primeiro clique', () => {
    const b = createBoard('easy');

    expect(mineCount(b)).toBe(0);
    expect(mineCount(openCell(b, 40, seeded(1)))).toBe(10);
  });

  it('o número de cada casa bate com as minas vizinhas', () => {
    const b = openCell(createBoard('hard'), 200, seeded(5));

    b.cells.forEach((cell, i) => {
      expect(cell.near).toBe(neighbors(b, i).filter((n) => b.cells[n].mine).length);
    });
  });
});

describe('abrir, cascata, bandeira', () => {
  it('abrir casa vazia abre em cascata até a borda dos números', () => {
    const b = openCell(handmade([0]), 8); // canto oposto da mina

    // tudo menos a mina abre: o campo 3×3 com uma mina no canto tem cascata total
    expect(b.cells.filter((c) => c.open)).toHaveLength(8);
    expect(b.cells[0].open).toBe(false);
    expect(b.status).toBe('won');
  });

  it('abrir um número abre só aquela casa', () => {
    const b = openCell(handmade([0, 8]), 1);

    expect(b.cells.filter((c) => c.open)).toHaveLength(1);
    expect(b.cells[1].near).toBe(1);
    expect(b.status).toBe('playing');
  });

  it('não altera o tabuleiro anterior (imutável)', () => {
    const before = handmade([0]);
    const snapshot = JSON.stringify(before);

    openCell(before, 8);
    toggleFlag(before, 4);
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('a cascata não abre casas com bandeira', () => {
    let b = handmade([0]);

    b = toggleFlag(b, 4);
    b = openCell(b, 8);
    expect(b.cells[4].open).toBe(false);
    expect(b.cells[4].flag).toBe(true);
  });

  it('bandeira marca e desmarca, ajusta o contador e não vale em casa aberta', () => {
    let b = handmade([0, 8]);

    b = toggleFlag(b, 0);
    expect(b.flags).toBe(1);
    expect(minesLeft(b)).toBe(1);
    b = toggleFlag(b, 0);
    expect(b.flags).toBe(0);
    b = openCell(b, 1);
    expect(toggleFlag(b, 1)).toBe(b);
  });

  it('casa com bandeira não abre; casa aberta não abre de novo', () => {
    let b = handmade([0, 8]);

    b = toggleFlag(b, 1);
    expect(openCell(b, 1)).toBe(b);
    b = openCell(toggleFlag(b, 1), 1);
    expect(openCell(b, 1)).toBe(b);
  });

  it('casa fora do tabuleiro é ignorada', () => {
    const b = handmade([0]);

    expect(openCell(b, 99)).toBe(b);
    expect(toggleFlag(b, -1)).toBe(b);
  });

  it('bandeira antes do primeiro clique vale e não atrapalha o sorteio', () => {
    let b = createBoard('easy');

    b = toggleFlag(b, 0);
    expect(b.status).toBe('ready');
    b = openCell(b, 40, seeded(3));
    expect(b.status).toBe('playing');
    expect(b.cells[0].flag).toBe(true);
  });
});

describe('vitória e derrota', () => {
  it('pisar numa mina perde, mostra as outras minas e marca onde explodiu', () => {
    let b = handmade([0, 8]);

    b = toggleFlag(b, 8); // palpite certo continua marcado
    b = openCell(b, 0);
    expect(b.status).toBe('lost');
    expect(b.exploded).toBe(0);
    expect(b.cells[0].open).toBe(true);
    expect(b.cells[8].open).toBe(false);
    expect(b.cells[8].flag).toBe(true);
  });

  it('depois de perder ou ganhar nada mais se mexe', () => {
    const lost = openCell(handmade([0, 8]), 0);

    expect(openCell(lost, 1)).toBe(lost);
    expect(toggleFlag(lost, 1)).toBe(lost);

    const won = openCell(handmade([0]), 8);

    expect(won.status).toBe('won');
    expect(openCell(won, 0)).toBe(won);
    expect(toggleFlag(won, 0)).toBe(won);
  });

  it('abrir todas as casas sem mina vence e bandeira as minas que sobram', () => {
    let b = handmade([0, 8]);

    for (const i of [1, 2, 3, 4, 5, 6, 7]) b = openCell(b, i);
    expect(b.status).toBe('won');
    expect(b.flags).toBe(b.mines);
    expect(b.cells[0].flag).toBe(true);
    expect(b.cells[8].flag).toBe(true);
  });

  it('uma partida completa jogada por força bruta termina em vitória ou derrota, nunca trava', () => {
    let b = createBoard('easy');
    const random = seeded(11);

    for (let i = 0; b.status !== 'won' && b.status !== 'lost' && i < 200; i++)
      b = openCell(b, i % 81, random);
    expect(['won', 'lost']).toContain(b.status);
  });
});

describe('melhor tempo (JG-08)', () => {
  beforeEach(() => localStorage.clear());

  it('guarda o primeiro tempo, só troca por um melhor e separa por nível', () => {
    expect(saveBest('easy', 90)).toBe(true);
    expect(saveBest('easy', 120)).toBe(false);
    expect(saveBest('easy', 90)).toBe(false);
    expect(saveBest('easy', 60)).toBe(true);
    expect(saveBest('hard', 300)).toBe(true);
    expect(readBest()).toEqual({ easy: 60, hard: 300 });
  });

  it('ignora lixo no armazenamento', () => {
    localStorage.setItem(BEST_KEY, '{"easy":"rápido","medium":-5,"x":1,"hard":12}');
    expect(readBest()).toEqual({ hard: 12 });
    localStorage.setItem(BEST_KEY, 'não é json');
    expect(readBest()).toEqual({});
  });

  it('se o armazenamento falhar, não quebra o jogo', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    try {
      expect(readBest()).toEqual({});
      expect(saveBest('easy', 10)).toBe(false);
    } finally {
      get.mockRestore();
      set.mockRestore();
    }
  });
});
