# Capturas e checagens no navegador (Playwright já instalado)

```bash
npm run build && npx vite preview --port 4173 &   # servir o build
```

Script (salve no scratchpad, não no repo):

```js
const { chromium } = require('playwright');
const routes = ['/', '/curriculo', '/academico', '/servicos', '/projetos'];
const views = [[1440, 900, 'desk'], [390, 844, 'mob']];
(async () => {
  const browser = await chromium.launch();
  for (const theme of ['dark', 'light']) for (const [w, h, tag] of views) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.addInitScript((t) => localStorage.setItem('theme', t), theme); // confira a chave real em useTheme
    for (const r of routes) {
      await page.goto('http://localhost:4173' + r);
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      console.log(theme, tag, r, overflow ? 'ROLAGEM HORIZONTAL' : 'ok');
      await page.screenshot({ path: `shots/${theme}-${tag}${r.replace(/\//g, '_') || '_home'}.png` });
    }
    console.log(theme, tag, 'erros de console:', errors.length ? errors : 'nenhum');
  }
  await browser.close();
})();
```

Terminal: no `/`, localize o campo com `.term-input` (o papel `textbox` pode demorar a resolver) e execute
`curriculo`, depois `2`, depois `academico disciplinas`; capture.

Impressão: `page.pdf()` em `/curriculo` e abra o PDF; sem shell, sem terminal, texto escuro em fundo branco.

Revise as imagens (Read) procurando: cor sem significado, texto cortado, tabela estourando, contraste fraco.
