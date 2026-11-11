// `matrix`: chuva de caracteres em canvas, no máximo 6 s. Qualquer tecla, clique
// ou Esc encerra. Com `prefers-reduced-motion` não anima (mostra só a linha
// final). Cores vindas dos tokens (--bg e --accent) do tema ativo. Carregado
// sob demanda (React.lazy) para não pesar o pacote principal.
import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../../types';
import { prefersReducedMotion } from '../../utils/env';
import { matrixEnd } from './ascii';

export const MATRIX_MS = 6000;
const TICK_MS = 60;
const CELL = 14;
const GLYPHS = '01<>/{}[]=+*#$%&';

const token = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

export default function MatrixRain({ lang }: { lang: Lang }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(prefersReducedMotion);

  useEffect(() => {
    if (done) return;

    const el = canvas.current;
    const ctx = el?.getContext('2d');
    const stop = () => setDone(true);
    let timer: ReturnType<typeof setInterval> | undefined;

    if (el && ctx) {
      el.width = el.clientWidth || 600;
      el.height = el.clientHeight || 160;

      const bg = token('--bg', '#000000');
      const fg = token('--accent', '#00ff66');
      const drops = Array.from({ length: Math.floor(el.width / CELL) }, () =>
        Math.floor((Math.random() * el.height) / CELL),
      );

      ctx.font = `${CELL}px monospace`;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, el.width, el.height);

      timer = setInterval(() => {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, el.width, el.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = fg;
        drops.forEach((y, i) => {
          ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * CELL, y * CELL);
          drops[i] = y * CELL > el.height && Math.random() > 0.95 ? 0 : y + 1;
        });
      }, TICK_MS);
    }

    const limit = setTimeout(stop, MATRIX_MS);

    document.addEventListener('keydown', stop);
    document.addEventListener('pointerdown', stop);

    return () => {
      clearInterval(timer);
      clearTimeout(limit);
      document.removeEventListener('keydown', stop);
      document.removeEventListener('pointerdown', stop);
    };
  }, [done]);

  if (done) return <p className="t-dim">{matrixEnd(lang)}</p>;

  return (
    <div className="t-matrix">
      <canvas ref={canvas} aria-hidden="true" />
      <p className="t-dim">
        {lang === 'pt' ? 'qualquer tecla ou clique para sair' : 'press any key or click to exit'}
      </p>
    </div>
  );
}
