// Sequência de boot: poucas linhas, só na primeira visita à home (ou sob
// demanda com `boot`). Qualquer tecla ou clique pula; a digitação nunca fica
// esperando (a linha de comando segue ativa). Com `prefers-reduced-motion` as
// linhas aparecem de uma vez, sem temporizador. Cada linha vem dos dados do site.
import { useEffect, useState } from 'react';
import type { Lang } from '../../types';
import { directories } from '../../data/routes';
import { skillTimeline } from '../../data/skillTimeline';
import { isCrawler } from '../../utils/env';

export const BOOT_KEY = 'portfolio-booted';
export const BOOT_TICK_MS = 220;
export const BOOT_DONE_MS = 600;

// Até 5 linhas de status; a dica de "pular" é a sexta enquanto anima.
export function bootLines(lang: Lang): string[] {
  const technologies = skillTimeline.reduce((total, group) => total + group.items.length, 0);

  return lang === 'pt'
    ? [
        'carregando mariab.dev',
        'idioma: português',
        `${directories.length} páginas`,
        `${technologies} tecnologias na linha do tempo`,
        'terminal pronto',
      ]
    : [
        'loading mariab.dev',
        'language: English',
        `${directories.length} pages`,
        `${technologies} technologies on the timeline`,
        'terminal ready',
      ];
}

// Só na primeira visita; sem armazenamento disponível ou para robôs, nunca
// (senão repetiria a cada visita).
export function shouldBoot(): boolean {
  if (isCrawler()) return false;
  try {
    return localStorage.getItem(BOOT_KEY) !== '1';
  } catch {
    return false;
  }
}

export function markBooted() {
  try {
    localStorage.setItem(BOOT_KEY, '1');
  } catch {
    // Sem armazenamento: `shouldBoot` já devolve falso.
  }
}

interface BootProps {
  lang: Lang;
  // Mostra tudo de uma vez, sem temporizador (movimento reduzido ou replay).
  instant: boolean;
  // Chamado ao terminar ou ao pular; sem ele (comando `boot`) a saída só fica na tela.
  onDone?: () => void;
}

export default function BootSequence({ lang, instant, onDone }: BootProps) {
  const lines = bootLines(lang);
  const [shown, setShown] = useState(instant ? lines.length : 0);
  const finished = shown >= lines.length;

  // Revela uma linha por vez.
  useEffect(() => {
    if (instant || finished) return;

    const timer = setTimeout(() => setShown((n) => n + 1), BOOT_TICK_MS);

    return () => clearTimeout(timer);
  }, [instant, finished, shown]);

  // Depois da última linha, uma pausa curta e a sequência sai da tela.
  useEffect(() => {
    if (instant || !finished || !onDone) return;

    const timer = setTimeout(onDone, BOOT_DONE_MS);

    return () => clearTimeout(timer);
  }, [instant, finished, onDone]);

  // Qualquer tecla ou clique pula. A tecla não é interceptada: continua indo ao campo.
  useEffect(() => {
    if (finished && !onDone) return;

    const skip = () => {
      setShown(lines.length);
      onDone?.();
    };

    document.addEventListener('keydown', skip);
    document.addEventListener('pointerdown', skip);

    return () => {
      document.removeEventListener('keydown', skip);
      document.removeEventListener('pointerdown', skip);
    };
  }, [finished, onDone, lines.length]);

  return (
    <div className="t-boot" aria-hidden="true">
      {lines.slice(0, shown).map((line) => (
        <p key={line}>
          <span className="t-ok">[ ok ]</span> {line}
        </p>
      ))}
      {onDone && !finished && (
        <p className="t-dim">
          {lang === 'pt' ? 'pressione qualquer tecla para pular' : 'press any key to skip'}
        </p>
      )}
    </div>
  );
}
