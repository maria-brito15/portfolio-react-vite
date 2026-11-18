// T5.2: o servidor estático imita a Netlify (URL sem .html, /en/ → /en, 404 por idioma, cabeçalhos
// de `for = "/*"` do netlify.toml em toda resposta).
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { globalHeaders, resolveFile, serve } from './serveDist.mjs';

const toml = readFileSync('netlify.toml', 'utf8');
const root = mkdtempSync(join(tmpdir(), 'servedist-'));
const files: Record<string, string> = {
  'index.html': 'HOME',
  'en.html': 'HOME EN',
  'projetos.html': 'PROJETOS',
  'en/projects.html': 'PROJECTS',
  '404.html': 'NAO ACHEI',
  'en/404.html': 'NOT FOUND',
  'static/app.js': 'js',
};

for (const [file, body] of Object.entries(files)) {
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), body);
}

const server = serve(root, 0, toml);
const get = async (path: string, init?: RequestInit) => {
  const port = (server.address() as AddressInfo).port;

  return fetch(`http://127.0.0.1:${port}${path}`, { redirect: 'manual', ...init });
};

beforeAll(
  () => new Promise<void>((done) => (server.listening ? done() : server.once('listening', done))),
);
afterAll(() => {
  server.close();
  rmSync(root, { recursive: true, force: true });
});

describe('serveDist', () => {
  it.each([
    ['/', 'HOME'],
    ['/en', 'HOME EN'],
    ['/projetos', 'PROJETOS'],
    ['/en/projects', 'PROJECTS'],
    ['/projetos.html', 'PROJETOS'],
    ['/static/app.js', 'js'],
  ])('%s → 200 %s', async (path, body) => {
    const res = await get(path);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe(body);
  });

  it('/en/ redireciona (301) para /en', async () => {
    const res = await get('/en/');

    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('/en');
  });

  it('endereço que não existe: 404 com o 404.html do idioma', async () => {
    const pt = await get('/nao-existe');
    const en = await get('/en/nao-existe');

    expect([pt.status, await pt.text()]).toEqual([404, 'NAO ACHEI']);
    expect([en.status, await en.text()]).toEqual([404, 'NOT FOUND']);
  });

  it('não sai da pasta (../)', async () => {
    expect(resolveFile(root, '/../package.json')).toBeUndefined();
    expect(resolveFile(root, '/%2e%2e/package.json')).toBeUndefined();
  });

  it('os cabeçalhos de segurança do netlify.toml vão em toda resposta (200, 301 e 404)', async () => {
    const expected = globalHeaders(toml);

    expect(Object.keys(expected).sort()).toEqual([
      'Permissions-Policy',
      'Referrer-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
    ]);
    for (const path of ['/', '/en/', '/nao-existe']) {
      const res = await get(path);

      for (const [name, value] of Object.entries(expected))
        expect(res.headers.get(name), `${path} ${name}`).toBe(value);
    }
  });
});
