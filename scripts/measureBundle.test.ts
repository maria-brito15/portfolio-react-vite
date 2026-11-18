// T5.3: `measureBundle` conta o gzip do JS e do CSS que o HTML da /_prova referencia e falha ao estourar.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { judge, LIMITS, measureBundle, referencedAssets } from './measureBundle.mjs';

const HTML = `<html><head>
<script id="boot">inline()</script>
<link rel="modulepreload" href="/static/Prova-1.js" />
<link rel="stylesheet" crossorigin href="/static/index-1.css">
<link rel="preload" href="/fonts/a.woff2" as="font" />
<link rel="icon" href="/favicon.png" />
<link rel="stylesheet" href="https://externo.test/x.css">
<script type="module" crossorigin src="/static/index-1.js"></script>
<script type="module" src="/static/index-1.js"></script>
</head><body></body></html>`;

const made: string[] = [];
const write = (root: string, file: string, content: string) => {
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), content);
};
const noisy = (n: number) =>
  Array.from({ length: n }, (_, i) => `v${(i * 2654435761) % 1000003}`).join(',');

afterAll(() => made.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

describe('referencedAssets', () => {
  it('pega script, modulepreload e stylesheet locais, sem repetir; ignora inline, fonte, ícone e externo', () => {
    expect(referencedAssets(HTML)).toEqual({
      js: ['/static/index-1.js', '/static/Prova-1.js'],
      css: ['/static/index-1.css'],
    });
  });
});

describe('measureBundle', () => {
  function dist(js: string, css: string) {
    const root = mkdtempSync(join(tmpdir(), 'measure-'));

    made.push(root);
    for (const page of ['_prova.html', 'en/_prova.html']) write(root, page, HTML);
    write(root, 'static/Prova-1.js', js);
    write(root, 'static/index-1.js', js);
    write(root, 'static/index-1.css', css);

    return root;
  }

  it('soma o gzip dos arquivos referenciados (cada um uma vez)', () => {
    const js = 'console.log(1);'.repeat(200);
    const css = '.a{color:red}'.repeat(200);
    const { results, problems } = measureBundle(dist(js, css));

    expect(results).toHaveLength(2);
    expect(results[0].js).toBe(gzipSync(js).length * 2);
    expect(results[0].css).toBe(gzipSync(css).length);
    expect(problems).toEqual([]);
  });

  it('falha quando o JS passa de 100 KB ou o CSS de 20 KB (dado quase incompressível)', () => {
    const big = noisy(30_000);
    const { problems } = measureBundle(dist(big, big));

    expect(problems.some((p) => p.includes('JS'))).toBe(true);
    expect(problems.some((p) => p.includes('CSS'))).toBe(true);
  });

  it('judge respeita os limites exatos (no limite passa; um byte acima falha)', () => {
    const at = { page: 'p', js: LIMITS.js, css: LIMITS.css };

    expect(judge([at])).toEqual([]);
    expect(judge([{ ...at, js: LIMITS.js + 1 }])).toHaveLength(1);
    expect(judge([{ ...at, css: LIMITS.css + 1 }])).toHaveLength(1);
  });

  it('sem _prova.html (build errado) lança', () => {
    const root = mkdtempSync(join(tmpdir(), 'measure-'));

    made.push(root);
    expect(() => measureBundle(root)).toThrow(/_prova\.html/);
  });

  it('as metas são as da spec: 100 KB de JS e 20 KB de CSS', () => {
    expect(LIMITS).toEqual({ js: 100_000, css: 20_000 });
  });
});
