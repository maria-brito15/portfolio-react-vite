// Melhor tempo por dificuldade (JG-08). Só no navegador de quem joga
// (`localStorage`); não há placar online. Se o armazenamento falhar (modo
// privado, bloqueio), o jogo segue normalmente, só sem recorde.
import type { Level } from './mines';

export const BEST_KEY = 'portfolio-minas-best';

type Best = Partial<Record<Level, number>>;

export function readBest(): Best {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(BEST_KEY) ?? 'null');

    if (!saved || typeof saved !== 'object') return {};

    return Object.fromEntries(
      Object.entries(saved).filter(
        ([level, value]) =>
          ['easy', 'medium', 'hard'].includes(level) &&
          typeof value === 'number' &&
          Number.isFinite(value) &&
          value >= 0,
      ),
    );
  } catch {
    return {};
  }
}

// Grava se for o melhor tempo (ou o primeiro). Devolve se foi um novo recorde.
export function saveBest(level: Level, seconds: number): boolean {
  const best = readBest();

  if (best[level] !== undefined && best[level] <= seconds) return false;

  try {
    localStorage.setItem(BEST_KEY, JSON.stringify({ ...best, [level]: seconds }));

    return true;
  } catch {
    return false;
  }
}
