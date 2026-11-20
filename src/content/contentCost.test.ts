// Custo da validação do conteúdo real (003, T5.3, NFR-001, TD-013): import frio do registro mais
// `validateAll`. Passou de 5 s, a verificação falha; acima de 1 s só avisa (para a evidência).
import { join } from 'node:path';
import { validateAll } from '../../scripts/contentValidator';

export const COST_LIMIT_MS = 5000;
export const COST_WARN_MS = 1000;

/** Falha quando o tempo passa do limite. O limite é injetável só para o teste provar que a falha acontece. */
export function assertWithinBudget(elapsedMs: number, limitMs: number = COST_LIMIT_MS): void {
  if (elapsedMs > limitMs) {
    throw new Error(
      `a validação do conteúdo levou ${Math.round(elapsedMs)} ms (limite ${limitMs} ms, NFR-001)`,
    );
  }
}

async function measure(): Promise<{ elapsedMs: number; problems: number; entries: number }> {
  const start = performance.now();
  const { registry } = await import('./registry');
  const problems = validateAll(registry, { publicDir: join(process.cwd(), 'public') });

  return {
    elapsedMs: performance.now() - start,
    problems: problems.length,
    entries: registry.length,
  };
}

describe('custo da validação do conteúdo real', () => {
  it('import frio do registro + validateAll fica dentro do limite de 5 s', async () => {
    const { elapsedMs, problems, entries } = await measure();

    // Aparece no relatório do teste para entrar na evidência.
    console.info(`custo da validação: ${Math.round(elapsedMs)} ms (${entries} arquivos)`);

    if (elapsedMs > COST_WARN_MS) {
      console.warn(`aviso: a validação passou de ${COST_WARN_MS} ms (${Math.round(elapsedMs)} ms)`);
    }

    expect(problems).toBe(0);
    expect(entries).toBe(9);
    expect(() => assertWithinBudget(elapsedMs)).not.toThrow();
  });

  it('o limite real é 5000 ms', () => {
    expect(COST_LIMIT_MS).toBe(5000);
    expect(() => assertWithinBudget(4999)).not.toThrow();
    expect(() => assertWithinBudget(5001)).toThrow(/limite 5000 ms/);
  });

  it('com um limite artificial baixo a falha acontece (prova que o teste pega)', async () => {
    const { elapsedMs } = await measure();

    expect(() => assertWithinBudget(elapsedMs, 0)).toThrow(/NFR-001/);
  });
});
