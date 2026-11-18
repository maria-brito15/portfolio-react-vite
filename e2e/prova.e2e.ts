// T5.3 (NFR-003): axe sem nenhuma violação na /_prova, nos 2 temas × 2 idiomas, com WCAG 2.1 AA.
// Projeto `shell` (dist-prova servido como a Netlify serve; antes: `npm run build:prova`).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const THEMES = ['light', 'dark'] as const;
const LANGS = [
  { lang: 'pt', path: '/_prova', locale: 'pt-BR' },
  { lang: 'en', path: '/en/_prova', locale: 'en-US' },
] as const;

for (const theme of THEMES) {
  for (const { lang, path, locale } of LANGS) {
    test.describe(`axe · ${theme} · ${lang}`, () => {
      test.use({ locale, viewport: { width: 1280, height: 800 } });

      for (const width of [1280, 390]) {
        test(`sem violação em ${width} px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });
          await page.addInitScript((t) => localStorage.setItem('portfolio-theme', t), theme);
          await page.goto(path);
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
          await expect(page.locator('.theme-btn')).toHaveAttribute('aria-pressed', /true|false/);

          const result = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
            .analyze();

          expect(
            result.violations.map(
              (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
            ),
          ).toEqual([]);
        });
      }
    });
  }
}
