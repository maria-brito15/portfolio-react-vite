import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const script = resolve('scripts/hardcoverProbe.mjs');

describe('script de sondagem do Hardcover (npm run personal:probe)', () => {
  it('sem token sai com código 2 e explica, sem fazer nenhuma chamada de rede', () => {
    // Roda num diretório vazio: um `.env` real não pode entrar no teste e disparar rede.
    const cwd = mkdtempSync(join(tmpdir(), 'probe-'));
    const env = { ...process.env };

    delete env.HARDCOVER_API_TOKEN;

    const run = spawnSync(process.execPath, [script], {
      cwd,
      env,
      encoding: 'utf8',
      timeout: 20_000,
    });

    expect(run.status).toBe(2);
    expect(run.stderr).toContain('HARDCOVER_API_TOKEN');
    expect(run.stdout).toBe('');
  });

  it('usa as mesmas consultas e o mesmo cliente do servidor', () => {
    const source = readFileSync(script, 'utf8');

    expect(source).toContain("'../netlify/personal/hardcover.ts'");
    expect(source).toContain('BOOKS_QUERIES');
    expect(source).toContain('fetchHardcoverBooks');
  });

  it('nunca imprime o token, nem títulos, nem o texto das resenhas', () => {
    const source = readFileSync(script, 'utf8');
    const prints = source
      .split('\n')
      .filter((l) => /console\.(log|error)/.test(l))
      .join('\n');

    expect(prints).not.toMatch(/\$\{token\}|, token\)|\+ token/);
    expect(prints).not.toMatch(/\.title|\.review\b|review_raw/);
  });

  it('está registrado em package.json', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>;
    };

    expect(pkg.scripts['personal:probe']).toBe('node scripts/hardcoverProbe.mjs');
  });
});
