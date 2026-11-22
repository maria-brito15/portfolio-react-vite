// T5.2 (V-07, V-11): a casca em um navegador de verdade, sobre o `dist-prova` servido como a Netlify
// serve (projeto `shell` do playwright.config.ts; antes: `npm run build:prova`). Roda nos 2 temas ×
// 2 idiomas: ordem real do Tab (FR-016), sem rolagem horizontal, menu em 1023 e 1024 px, alvos de
// 44×44 px, anel de foco, console limpo (inclui hidratação) e tudo da mesma origem.
import { expect, test, type Page } from '@playwright/test';
import { routes } from '../src/data/routes';

const THEMES = ['light', 'dark'] as const;
const LANGS = [
  {
    lang: 'pt',
    path: '/_prova',
    home: '/',
    locale: 'pt-BR',
    skip: 'Ir para o conteúdo',
    themeName: 'Alternar tema',
  },
  {
    lang: 'en',
    path: '/en/_prova',
    home: '/en',
    locale: 'en-US',
    skip: 'Skip to content',
    themeName: 'Toggle theme',
  },
] as const;

const menu = routes.filter((route) => route.menu).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

async function open(page: Page, theme: string, path: string) {
  await page.addInitScript((t) => localStorage.setItem('portfolio-theme', t), theme);
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // a hidratação já aconteceu quando o botão de tema ganha aria-pressed (só depois de montar)
  await expect(page.locator('.theme-btn')).toHaveAttribute('aria-pressed', /true|false/);
}

const here = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const name = el.getAttribute('href') ?? el.getAttribute('aria-label') ?? el.textContent?.trim();

    return `${el.tagName.toLowerCase()}:${name}`;
  });

for (const theme of THEMES) {
  for (const { lang, path, home, locale, skip, themeName } of LANGS) {
    test.describe(`${theme} · ${lang}`, () => {
      test.use({ locale, viewport: { width: 1280, height: 800 } });

      test('a sequência real de Tab segue o FR-016', async ({ page }) => {
        await open(page, theme, path);

        const expected = [
          'a:#conteudo',
          `a:${home}`,
          ...menu.map((route) => `a:${lang === 'pt' ? route.path : route.enPath}`),
          `button:${themeName}: ${theme === 'light' ? (lang === 'pt' ? 'escuro' : 'dark') : lang === 'pt' ? 'claro' : 'light'}`,
          'a:/_prova',
          'a:/en/_prova',
          // o conteúdo da página de prova: link de texto e os dois botões
          `a:${home}`,
          'button:*',
          'button:*',
          // o rodapé: um único link, para a home
          `a:${home}`,
        ];
        const seen: string[] = [];

        for (let i = 0; i < expected.length; i++) {
          await page.keyboard.press('Tab');
          seen.push(await here(page));
        }

        // os dois botões de exemplo têm texto próprio: comparamos só que são botões
        const normalized = seen.map((s, i) =>
          expected[i] === 'button:*' && s.startsWith('button:') ? 'button:*' : s,
        );

        expect(normalized).toEqual(expected);
        await expect(page.getByRole('link', { name: skip })).toHaveCount(1);
      });

      test('o anel de foco é visível em todo controle do cabeçalho', async ({ page }) => {
        await open(page, theme, path);
        for (let i = 0; i < 4 + menu.length; i++) {
          await page.keyboard.press('Tab');

          const ring = await page.evaluate(() => {
            const style = getComputedStyle(document.activeElement as HTMLElement);

            return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
          });

          expect(ring.style, `foco ${i + 1}`).not.toBe('none');
          expect(ring.width, `foco ${i + 1}`).toBeGreaterThanOrEqual(2);
        }
      });

      test('console limpo (sem aviso de hidratação) e tudo da mesma origem', async ({ page }) => {
        const messages: string[] = [];
        const origins = new Set<string>();

        page.on(
          'console',
          (m) => ['warning', 'error'].includes(m.type()) && messages.push(m.text()),
        );
        page.on('pageerror', (e) => messages.push(e.message));
        page.on('request', (r) => {
          const url = new URL(r.url());

          if (url.protocol.startsWith('http')) origins.add(url.origin);
        });
        await open(page, theme, path);
        await page.waitForLoadState('networkidle');
        expect(messages).toEqual([]);
        expect([...origins]).toEqual([new URL(page.url()).origin]);
      });

      for (const width of [360, 1023, 1024, 1920]) {
        test(`sem rolagem horizontal em ${width} px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });
          await open(page, theme, path);

          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          );

          expect(overflow).toBeLessThanOrEqual(0);
        });
      }

      test('o botão do menu existe em 1023 px e some em 1024 px', async ({ page }) => {
        const button = page.locator('.menu-button');

        await page.setViewportSize({ width: 1023, height: 900 });
        await open(page, theme, path);
        await expect(button).toBeVisible();
        await page.setViewportSize({ width: 1024, height: 900 });
        await expect(button).toBeHidden();
      });

      test('todo controle do menu tem ao menos 44×44 px (1023 px com o painel aberto, e 1024 px)', async ({
        page,
      }) => {
        const small = async () => {
          const out: string[] = [];

          for (const el of await page.locator('.hdr a, .hdr button').all()) {
            if (!(await el.isVisible())) continue;

            const box = await el.boundingBox();
            const label = (await el.getAttribute('aria-label')) ?? (await el.textContent());

            if (!box || box.width < 43.5 || box.height < 43.5)
              out.push(`${label}: ${box?.width}×${box?.height}`);
          }

          return out;
        };

        await page.setViewportSize({ width: 1023, height: 900 });
        await open(page, theme, path);
        await page.locator('.menu-button').click();
        await expect(page.locator('.menu-panel')).toHaveAttribute('data-open', 'true');
        expect(await small()).toEqual([]);
        await page.setViewportSize({ width: 1024, height: 900 });
        expect(await small()).toEqual([]);
      });

      test('em 1023 px o foco vai ao 1º item ao abrir e volta ao botão com Esc', async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1023, height: 900 });
        await open(page, theme, path);
        await page.locator('.menu-button').click();
        await expect(page.locator('.hdr-nav a').first()).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(page.locator('.menu-button')).toBeFocused();
        await expect(page.locator('.menu-button')).toHaveAttribute('aria-expanded', 'false');
      });
    });
  }
}

test.describe('faixa de idioma (FR-016, FR-025)', () => {
  test.use({ locale: 'en-US', viewport: { width: 1280, height: 800 } });

  test('com o navegador em inglês numa página em português, a faixa é o 2º foco, logo depois do skip link', async ({
    page,
  }) => {
    await page.goto('/_prova');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Oferta de idioma' })).toBeVisible();
    await page.keyboard.press('Tab');
    expect(await here(page)).toBe('a:#conteudo');
    await page.keyboard.press('Tab');
    expect(await here(page)).toBe('a:/en/_prova');
  });

  test('o espaço da faixa já está reservado no primeiro desenho (sem salto do conteúdo)', async ({
    page,
  }) => {
    await page.goto('/_prova', { waitUntil: 'domcontentloaded' });

    const reserved = await page.evaluate(() =>
      document.documentElement.hasAttribute('data-lang-offer'),
    );

    expect(reserved).toBe(true);
    await expect(page.getByRole('region', { name: 'Oferta de idioma' })).toBeVisible();
  });
});
