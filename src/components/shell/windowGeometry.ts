// Geometria do arrasto da janela (JA-01, JA-02): funções puras, sem DOM.
export interface Pos {
  x: number;
  y: number;
}

// Retângulo da janela SEM o deslocamento atual (posição de origem na página).
export interface Origin {
  left: number;
  top: number;
  width: number;
}

// Altura mínima da barra de título que precisa ficar à vista.
export const BAR_VISIBLE = 40;
export const KEY_STEP = 16;

// Mantém a janela dentro do viewport: nunca sai pela esquerda, direita ou
// topo, e a barra de título nunca desce para fora da tela.
export function clampPosition(
  pos: Pos,
  origin: Origin,
  viewport: { width: number; height: number },
): Pos {
  const minX = -origin.left;
  const maxX = viewport.width - origin.width - origin.left;
  const minY = -origin.top;
  const maxY = viewport.height - BAR_VISIBLE - origin.top;
  // Janela mais larga que a tela: o intervalo inverte; fica entre os dois limites.
  const [loX, hiX] = minX <= maxX ? [minX, maxX] : [maxX, minX];
  const [loY, hiY] = minY <= maxY ? [minY, maxY] : [maxY, minY];

  return {
    x: Math.round(Math.min(Math.max(pos.x, loX), hiX)),
    y: Math.round(Math.min(Math.max(pos.y, loY), hiY)),
  };
}

const ARROWS: Record<string, Pos> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

// Deslocamento de uma tecla de seta (em px), ou null se a tecla não move.
export function keyDelta(key: string, step = KEY_STEP): Pos | null {
  const dir = ARROWS[key];

  return dir ? { x: dir.x * step, y: dir.y * step } : null;
}
