import type { OutputBundle } from 'rollup';
import type { ResolvedConfig } from 'vite';
// O `vite` real carrega o esbuild, que não funciona dentro do jsdom da suíte; aqui só o `loadEnv`
// (leitura de arquivos `.env`) é trocado. O `vite build` real, que o exercita, é parte da verificação.
vi.mock('vite', () => ({ loadEnv: () => ({}) }));

import { assertNoSecrets, guardProblems, secretGuardPlugin, secretValues } from './secretGuard';

// Credencial de exemplo montada em tempo de execução: nunca escrita em arquivo (design §7).
const fakeGoogleKey = 'AIza' + 'x'.repeat(35);
const fakeToken = 'tok_' + 'q'.repeat(20);

const clean = { publicEnvNames: [], files: [], env: {} };

describe('guardProblems (função pura)', () => {
  it('nada suspeito: sem problema', () => {
    expect(
      guardProblems({
        publicEnvNames: ['VITE_APP_NAME', 'VITE_EMAILJS_PUBLIC_KEY'],
        files: [{ fileName: 'dist/static/a.js', text: 'console.log("oi")' }],
        env: { NODE_ENV: 'production', HARDCOVER_API_TOKEN: 'curto' },
      }),
    ).toEqual([]);
  });

  it('credencial no bundle falha, mascarada', () => {
    const problems = guardProblems({
      ...clean,
      files: [{ fileName: 'dist/static/a.js', text: `var k="${fakeGoogleKey}"` }],
    });

    expect(problems).toEqual([
      'segredo: dist/static/a.js:1 — padrão "chave Google (AIza…)" (início "AIza…"). Remova do arquivo e troque a credencial.',
    ]);
    expect(problems.join('')).not.toContain(fakeGoogleKey);
  });

  it('o valor de uma variável secreta no bundle falha, sem imprimir o valor', () => {
    const problems = guardProblems({
      ...clean,
      files: [{ fileName: 'dist/static/index-ab12.js', text: `fetch("${fakeToken}")` }],
      env: { HARDCOVER_API_TOKEN: fakeToken },
    });

    expect(problems).toEqual([
      'segredo: dist/static/index-ab12.js — valor da variável secreta HARDCOVER_API_TOKEN apareceu no bundle.',
    ]);
    expect(problems.join('')).not.toContain(fakeToken);
  });

  it('VITE_X_TOKEN falha pelo nome; as 3 do EmailJS passam', () => {
    expect(guardProblems({ ...clean, publicEnvNames: ['VITE_X_TOKEN'] })).toEqual([
      'segredo: variável VITE_X_TOKEN — nome de variável pública (VITE_) que sugere segredo; ela iria para o JavaScript do navegador.',
    ]);
    expect(
      guardProblems({
        ...clean,
        publicEnvNames: [
          'VITE_EMAILJS_SERVICE_ID',
          'VITE_EMAILJS_TEMPLATE_ID',
          'VITE_EMAILJS_PUBLIC_KEY',
        ],
      }),
    ).toEqual([]);
  });

  it('valor curto (< 8) ou de variável comum não conta', () => {
    expect(
      secretValues({ A_TOKEN: '1234567', B_TOKEN: '12345678', NODE_ENV: 'production' }),
    ).toEqual([['B_TOKEN', '12345678']]);
  });

  it('o valor de uma variável pública por natureza (EmailJS) pode estar no bundle', () => {
    expect(secretValues({ VITE_EMAILJS_PUBLIC_KEY: 'public_key_value' })).toEqual([]);
  });

  it('assertNoSecrets lança com as linhas, e não lança quando está limpo', () => {
    expect(() => assertNoSecrets(clean)).not.toThrow();
    expect(() => assertNoSecrets({ ...clean, publicEnvNames: ['VITE_A_SECRET'] })).toThrow(
      /^secretGuard:\nsegredo: variável VITE_A_SECRET/,
    );
  });
});

describe('plugin secretGuard (no molde do personalGuard)', () => {
  const plugin = secretGuardPlugin();
  const resolve = (env: Record<string, string>) =>
    (plugin.configResolved as (config: ResolvedConfig) => void)({
      env,
      mode: 'production',
      root: process.cwd(),
      envDir: process.cwd(),
      build: { outDir: 'dist' },
    } as unknown as ResolvedConfig);
  const generate = (bundle: Record<string, unknown>) =>
    (plugin.generateBundle as (o: unknown, b: OutputBundle) => void)({}, bundle as OutputBundle);

  afterEach(() => vi.unstubAllEnvs());

  it('só roda no build', () => {
    expect(plugin.apply).toBe('build');
  });

  it('variável pública com nome de segredo derruba o build', () => {
    expect(() => resolve({ VITE_X_TOKEN: 'a' })).toThrow(/VITE_X_TOKEN/);
  });

  it('variáveis normais e as do EmailJS passam', () => {
    expect(() => resolve({ VITE_APP: 'x', VITE_EMAILJS_PUBLIC_KEY: 'k' })).not.toThrow();
  });

  it('bundle sintético com credencial montada em tempo de execução falha, mascarado', () => {
    resolve({});

    expect(() =>
      generate({ 'static/a.js': { type: 'chunk', fileName: 'static/a.js', code: fakeGoogleKey } }),
    ).toThrow(/dist\/static\/a\.js:1 — padrão "chave Google/);
    try {
      generate({ 'static/a.js': { type: 'chunk', fileName: 'static/a.js', code: fakeGoogleKey } });
    } catch (error) {
      expect(String(error)).not.toContain(fakeGoogleKey);
    }
  });

  it('bundle sem segredo passa (chunk e asset de texto ou binário)', () => {
    resolve({});

    expect(() =>
      generate({
        a: { type: 'chunk', fileName: 'static/a.js', code: 'console.log(1)' },
        b: { type: 'asset', fileName: 'index.html', source: '<html></html>' },
        c: { type: 'asset', fileName: 'assets/f.png', source: new Uint8Array([137, 80, 78, 71]) },
      }),
    ).not.toThrow();
  });

  it('o valor de uma variável secreta do ambiente no bundle falha', () => {
    vi.stubEnv('PERSONAL_API_TOKEN', fakeToken);
    resolve({});

    expect(() =>
      generate({ a: { type: 'chunk', fileName: 'static/a.js', code: `x("${fakeToken}")` } }),
    ).toThrow(/valor da variável secreta PERSONAL_API_TOKEN apareceu no bundle/);
  });
});
