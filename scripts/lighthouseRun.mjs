// Lighthouse (perfil celular) sobre a `/_prova` do `dist-prova` (spec 002, T5.3, TD-019): 3 execuções,
// mediana. Metas: LCP ≤ 2,5 s, CLS ≤ 0,1 (também com a faixa de idioma visível: navegador em inglês
// numa página em português), acessibilidade e boas práticas ≥ 95. Usa o Chrome instalado via
// `chrome-launcher` (CHROME_PATH para apontar outro); se não achar o Chrome, avisa e sai com 2.
// Uso: `node scripts/lighthouseRun.mjs` (depois de `npm run build:prova`).
import { pathToFileURL } from 'node:url';

export const GOALS = { lcp: 2500, cls: 0.1, accessibility: 0.95, bestPractices: 0.95 };
const RUNS = 3;
const PORT = 5196;

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Extrai as 4 medidas de um relatório (`lhr`) do Lighthouse. */
export function pick(lhr) {
  return {
    lcp: lhr.audits['largest-contentful-paint'].numericValue,
    cls: lhr.audits['cumulative-layout-shift'].numericValue,
    accessibility: lhr.categories.accessibility.score,
    bestPractices: lhr.categories['best-practices'].score,
  };
}

/** Compara a mediana das execuções com as metas; devolve os problemas (lista vazia = passou). */
export function judge(runs, goals = GOALS) {
  const m = {
    lcp: median(runs.map((r) => r.lcp)),
    cls: median(runs.map((r) => r.cls)),
    accessibility: median(runs.map((r) => r.accessibility)),
    bestPractices: median(runs.map((r) => r.bestPractices)),
  };
  const problems = [];

  if (m.lcp > goals.lcp) problems.push(`LCP ${Math.round(m.lcp)} ms > ${goals.lcp} ms`);
  if (m.cls > goals.cls) problems.push(`CLS ${m.cls.toFixed(3)} > ${goals.cls}`);
  if (m.accessibility < goals.accessibility)
    problems.push(`acessibilidade ${m.accessibility} < ${goals.accessibility}`);
  if (m.bestPractices < goals.bestPractices)
    problems.push(`boas práticas ${m.bestPractices} < ${goals.bestPractices}`);

  return { median: m, problems };
}

async function measure(url, { lang }) {
  const [{ default: lighthouse }, chromeLauncher] = await Promise.all([
    import('lighthouse'),
    import('chrome-launcher'),
  ]);
  const flags = ['--headless=new', '--no-sandbox', ...(lang ? [`--lang=${lang}`] : [])];
  let chrome;

  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: flags,
      chromePath: process.env.CHROME_PATH || undefined,
    });
  } catch (error) {
    console.error(`lighthouseRun: não achei o Chrome (${error.message}). Defina CHROME_PATH.`);
    process.exit(2);
  }

  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['accessibility', 'best-practices', 'performance'],
      locale: lang === 'en-US' ? 'en' : 'pt-BR',
    });

    return { lhr: result.lhr, version: result.lhr.lighthouseVersion };
  } finally {
    await chrome.kill();
  }
}

const isMain = Boolean(process.argv[1]) && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMain) {
  const { serve } = await import('./serveDist.mjs');
  const server = serve('dist-prova', PORT);
  const cases = [
    { name: 'pt (sem faixa)', url: `http://localhost:${PORT}/_prova`, lang: 'pt-BR' },
    { name: 'en', url: `http://localhost:${PORT}/en/_prova`, lang: 'en-US' },
    // navegador em inglês numa página em português: a faixa de idioma aparece
    { name: 'pt com a faixa visível', url: `http://localhost:${PORT}/_prova`, lang: 'en-US' },
  ];
  let failed = false;
  let version = '?';

  for (const c of cases) {
    const runs = [];

    for (let i = 0; i < RUNS; i++) {
      const { lhr, version: v } = await measure(c.url, c);

      version = v;
      runs.push(pick(lhr));
    }

    const { median: m, problems } = judge(runs);

    console.log(
      `lighthouseRun: ${c.name}: LCP ${Math.round(m.lcp)} ms, CLS ${m.cls.toFixed(3)}, acessibilidade ${m.accessibility}, boas práticas ${m.bestPractices} (mediana de ${RUNS})`,
    );
    for (const p of problems) console.error(`lighthouseRun: ${c.name}: ${p}`);
    if (problems.length) failed = true;
  }

  server.close();
  console.log(`lighthouseRun: Lighthouse ${version}; ${failed ? 'FALHOU' : 'OK'}`);
  process.exit(failed ? 1 : 0);
}
