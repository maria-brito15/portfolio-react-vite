import { expect, test, type Page } from '@playwright/test';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
};
const PAGES = [
  '/sobre',
  '/habilidades',
  '/projetos',
  '/experiencias',
  '/contato',
  '/curriculo',
  '/academico',
  '/servicos',
];
const THEMES = ['dark', 'light'] as const;
const SHOTS = process.env.SHOTS === '1';

async function prepare(page: Page, theme: string) {
  // Sem boot da primeira visita, sem aviso de celular, e GitHub com dados fixos.
  await page.addInitScript((t) => {
    localStorage.setItem('portfolio-booted', '1');
    localStorage.setItem('portfolio-theme', t);
    localStorage.setItem('portfolio-mobile-notice-dismissed', '1');
  }, theme);
  await page.route('https://api.github.com/**', (route) => {
    const url = route.request().url();

    return route.fulfill({
      json: url.includes('/repos')
        ? [
            {
              fork: false,
              archived: false,
              stargazers_count: 2,
              language: 'TypeScript',
              pushed_at: '2026-10-01T00:00:00Z',
            },
            {
              fork: false,
              archived: false,
              stargazers_count: 1,
              language: 'Java',
              pushed_at: '2026-09-01T00:00:00Z',
            },
          ]
        : { public_repos: 8, followers: 4, created_at: '2023-03-01T00:00:00Z' },
    });
  });
  await page.route('https://github-contributions-api.jogruber.de/**', (route) =>
    route.fulfill({ json: { total: { lastYear: 321 } } }),
  );
}

for (const [device, size] of Object.entries(VIEWPORTS)) {
  for (const theme of THEMES) {
    test.describe(`${device} · ${theme}`, () => {
      test.use({ viewport: size });

      for (const path of PAGES) {
        test(`${path}: sem erro de console e sem rolagem horizontal`, async ({ page }) => {
          const errors: string[] = [];

          page.on('pageerror', (e) => errors.push(e.message));
          page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
          await prepare(page, theme);
          await page.goto(path);
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
          await page.waitForLoadState('networkidle');
          if (path === '/sobre') await expect(page.getByText('321')).toBeVisible();

          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          );

          expect(overflow, 'rolagem horizontal da página').toBeLessThanOrEqual(0);
          expect(errors).toEqual([]);
          if (SHOTS) {
            // Imagens são lazy: rola a página para carregá-las antes da captura.
            await page.evaluate(async () => {
              for (let y = 0; y < document.body.scrollHeight; y += 600) {
                window.scrollTo(0, y);
                await new Promise((r) => setTimeout(r, 100));
              }
              window.scrollTo(0, 0);
            });
            await page.waitForTimeout(500);
          }
          if (SHOTS)
            await page.screenshot({
              path: `e2e/shots/${device}-${theme}${path.replace('/', '-')}.png`,
              fullPage: true,
            });
        });
      }
    });
  }
}

test.describe('GitHub em números', () => {
  test('mostra os números da API', async ({ page }) => {
    await prepare(page, 'dark');
    await page.goto('/sobre');

    const section = page.getByRole('region', { name: 'GitHub em números' });

    await expect(section.getByText('321')).toBeVisible();
    await expect(section.getByText('TypeScript')).toBeVisible();
  });

  test('erro da API mostra mensagem e "tentar de novo" recupera', async ({ page }) => {
    await prepare(page, 'dark');
    await page.route('https://api.github.com/**', (route) => route.abort());
    await page.goto('/sobre');
    await expect(page.getByRole('alert')).toContainText('Não foi possível');
    await page.unroute('https://api.github.com/**');
    await page.route('https://api.github.com/**', (route) =>
      route.fulfill({
        json: route.request().url().includes('/repos')
          ? []
          : { public_repos: 8, followers: 4, created_at: '2023-03-01T00:00:00Z' },
      }),
    );
    await page.getByRole('button', { name: 'Tentar de novo' }).click();
    await expect(
      page.getByRole('region', { name: 'GitHub em números' }).getByText('8'),
    ).toBeVisible();
  });

  test('comando stats no terminal', async ({ page }) => {
    await prepare(page, 'dark');
    await page.goto('/');
    await page.getByRole('textbox', { name: /Linha de comando/ }).fill('stats');
    await page.keyboard.press('Enter');
    await expect(page.locator('.term-log').getByText('321')).toBeVisible();
  });
});
