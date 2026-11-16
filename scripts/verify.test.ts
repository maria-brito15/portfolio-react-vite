import { EventEmitter } from 'node:events';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { defaultSteps, runVerify, type VerifyStep } from './verify.mjs';

// Etapas falsas: `node -e` que grava a própria ordem num arquivo e sai com o código pedido.
function fakeSteps(codes: number[], log: string): VerifyStep[] {
  return codes.map((code, i) => ({
    name: `etapa${i + 1}`,
    label: `falsa ${i + 1}`,
    argv: [
      '-e',
      `require('fs').appendFileSync(${JSON.stringify(log)}, '${i + 1}\\n'); process.exit(${code})`,
    ],
  }));
}

function capture() {
  const chunks: string[] = [];

  return { write: (t: string) => chunks.push(t), text: () => chunks.join('') };
}

function tempLog() {
  const log = join(mkdtempSync(join(tmpdir(), 'verify-')), 'ordem.txt');

  writeFileSync(log, '');

  return log;
}

async function run(steps: VerifyStep[], argv: string[] = []) {
  const stdout = capture();
  const stderr = capture();
  const code = await runVerify({ steps, argv, stdout, stderr });

  return { code, stdout: stdout.text(), stderr: stderr.text() };
}

describe('verify: runner das 5 etapas', () => {
  it('ordem: roda as etapas na ordem em que foram declaradas', async () => {
    const log = tempLog();
    const { stdout } = await run(fakeSteps([0, 0, 0, 0, 0], log));
    const { readFileSync } = await import('node:fs');

    expect(readFileSync(log, 'utf8')).toBe('1\n2\n3\n4\n5\n');
    expect(stdout.indexOf('[1/5]')).toBeLessThan(stdout.indexOf('[5/5]'));
  });

  it('as etapas reais são as 5 do steering, na ordem', () => {
    expect(defaultSteps().map((s) => s.name)).toEqual([
      'formatação',
      'lint',
      'tipos',
      'testes',
      'geração',
    ]);
  });

  it('falha: para na etapa 2, sai 1, não roda as seguintes e nomeia a etapa', async () => {
    const log = tempLog();
    const { code, stdout } = await run(fakeSteps([0, 1, 0, 0, 0], log));
    const { readFileSync } = await import('node:fs');

    expect(code).toBe(1);
    expect(readFileSync(log, 'utf8')).toBe('1\n2\n');
    expect(stdout).toContain('verify: parou na etapa 2/5 (etapa2)');
    expect(stdout).not.toContain('verify: OK');
  });

  it('sucesso: sai 0', async () => {
    const { code, stdout } = await run(fakeSteps([0, 0, 0, 0, 0], tempLog()));

    expect(code).toBe(0);
    expect(stdout).toContain('verify: OK');
  });

  it('ferramenta ausente: sai 2, manda rodar npm ci e não roda nada', async () => {
    const log = tempLog();
    const steps = fakeSteps([0, 0], log);

    steps[1].requires = [join(tmpdir(), 'nao-existe', 'ferramenta.js')];

    const { code, stderr } = await run(steps);
    const { readFileSync } = await import('node:fs');

    expect(code).toBe(2);
    expect(stderr).toContain('rode npm ci antes');
    expect(stderr).not.toMatch(/\n\s+at /);
    expect(readFileSync(log, 'utf8')).toBe('');
  });

  it('dry-run: imprime o plano, sai 0 e não executa', async () => {
    const log = tempLog();
    const { code, stdout } = await run(fakeSteps([1, 1], log), ['--dry-run']);
    const { readFileSync } = await import('node:fs');

    expect(code).toBe(0);
    expect(stdout).toContain('falsa 1');
    expect(stdout).toContain('falsa 2');
    expect(readFileSync(log, 'utf8')).toBe('');
  });

  it('Ctrl+C: repassa o sinal ao filho, não imprime OK e sai 130', async () => {
    const signals = new EventEmitter();
    const stdout = capture();
    const step: VerifyStep = {
      name: 'longa',
      label: 'dorme',
      argv: ['-e', 'setTimeout(() => {}, 30000)'],
    };
    const pending = runVerify({ steps: [step], stdout, stderr: capture(), signals });

    await new Promise((r) => setTimeout(r, 500));
    signals.emit('SIGINT');

    expect(await pending).toBe(130);
    expect(stdout.text()).not.toContain('verify: OK');
  });

  it('o comando real em --dry-run (npm run verify) lista as 5 etapas e sai 0', () => {
    const result = spawnSync(process.execPath, ['scripts/verify.mjs', '--dry-run'], {
      encoding: 'utf8',
      timeout: 20_000,
    });

    expect(result.status).toBe(0);
    for (const nome of ['formatação', 'lint', 'tipos', 'testes', 'geração']) {
      expect(result.stdout).toContain(nome);
    }
  });
});
