// INP em laboratório (spec 002, T5.3, TD-019): abre a `/_prova` do `dist-prova` no Chrome com a CPU 4×
// mais lenta e celular, faz as interações da página (menu, tema, botões, teclado) e lê o pior tempo de
// evento do `PerformanceObserver` (type `event`). Meta: ≤ 200 ms. É aproximação de laboratório do INP
// de campo. Uso: `node scripts/inpRun.mjs` (depois de `npm run build:prova`).
import { pathToFileURL } from 'node:url';

export const INP_GOAL_MS = 200;

/** Pior duração entre as interações (o INP de laboratório); sem eventos = 0. */
export function worstInteraction(durations) {
  return durations.length ? Math.max(...durations) : 0;
}

const isMain = Boolean(process.argv[1]) && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMain) {
  const { chromium } = await import('@playwright/test');
  const { serve } = await import('./serveDist.mjs');
  const PORT = 5195;
  const server = serve('dist-prova', PORT);
  const browser = await chromium.launch({ channel: 'chrome' });
  const results = [];

  for (const [name, path] of [
    ['pt', '/_prova'],
    ['en', '/en/_prova'],
  ]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);

    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      globalThis.__inp = [];
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (e.interactionId) globalThis.__inp.push(e.duration);
      }).observe({ type: 'event', durationThreshold: 16, buffered: true });
    });
    await page.goto(`http://localhost:${PORT}${path}`);
    await page.waitForSelector('.theme-btn[aria-pressed]');
    await page.tap('.menu-button');
    await page.waitForSelector('.menu-panel[data-open]');
    await page.tap('.theme-btn');
    await page.keyboard.press('Escape');
    await page.tap('.prova-actions .btn');
    await page.tap('.prova-actions .btn-o');
    await page.tap('.menu-button');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const durations = await page.evaluate(() => globalThis.__inp);

    results.push({ name, inp: worstInteraction(durations), count: durations.length });
    await context.close();
  }

  await browser.close();
  server.close();

  let failed = false;

  for (const r of results) {
    console.log(
      `inpRun: ${r.name}: INP (lab, CPU 4×) ${Math.round(r.inp)} ms em ${r.count} interações`,
    );
    if (r.count === 0) {
      console.error(`inpRun: ${r.name}: nenhuma interação registrada (medida inválida)`);
      failed = true;
    }
    if (r.inp > INP_GOAL_MS) {
      console.error(`inpRun: ${r.name}: ${Math.round(r.inp)} ms > ${INP_GOAL_MS} ms`);
      failed = true;
    }
  }
  console.log(`inpRun: ${failed ? 'FALHOU' : 'OK'} (meta ${INP_GOAL_MS} ms)`);
  process.exit(failed ? 1 : 0);
}
