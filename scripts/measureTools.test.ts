// T5.3: a lógica pura dos scripts de medição (mediana, metas, pior interação). A medição em si
// (Lighthouse e INP no Chrome) é o `npm run prova`.
import { INP_GOAL_MS, worstInteraction } from './inpRun.mjs';
import { GOALS, judge, median, pick } from './lighthouseRun.mjs';

const run = (over: Partial<Parameters<typeof judge>[0][0]> = {}) => ({
  lcp: 1800,
  cls: 0.02,
  accessibility: 1,
  bestPractices: 1,
  ...over,
});

describe('lighthouseRun', () => {
  it('as metas são as da spec', () => {
    expect(GOALS).toEqual({ lcp: 2500, cls: 0.1, accessibility: 0.95, bestPractices: 0.95 });
  });

  it('mediana de 3 é o do meio; de 4, a média dos do meio', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it('passa com a mediana dentro das metas, mesmo com uma execução ruim', () => {
    const { problems } = judge([run(), run({ lcp: 9000 }), run()]);

    expect(problems).toEqual([]);
  });

  it('falha em LCP, CLS, acessibilidade e boas práticas acima/abaixo da meta', () => {
    const bad = [run({ lcp: 3000, cls: 0.2, accessibility: 0.9, bestPractices: 0.9 })];
    const { problems } = judge([bad[0], bad[0], bad[0]]);

    expect(problems).toHaveLength(4);
    expect(problems.join(' ')).toMatch(/LCP.*CLS.*acessibilidade.*boas práticas/);
  });

  it('no limite exato passa (LCP 2500, CLS 0,1, notas 0,95)', () => {
    const edge = run({ lcp: 2500, cls: 0.1, accessibility: 0.95, bestPractices: 0.95 });

    expect(judge([edge, edge, edge]).problems).toEqual([]);
  });

  it('pick lê as 4 medidas do relatório', () => {
    const lhr = {
      audits: {
        'largest-contentful-paint': { numericValue: 1234 },
        'cumulative-layout-shift': { numericValue: 0.01 },
      },
      categories: { accessibility: { score: 0.98 }, 'best-practices': { score: 1 } },
    };

    expect(pick(lhr)).toEqual({ lcp: 1234, cls: 0.01, accessibility: 0.98, bestPractices: 1 });
  });
});

describe('inpRun', () => {
  it('a meta é 200 ms e o INP de laboratório é a pior interação', () => {
    expect(INP_GOAL_MS).toBe(200);
    expect(worstInteraction([40, 120, 64])).toBe(120);
    expect(worstInteraction([])).toBe(0);
  });
});
