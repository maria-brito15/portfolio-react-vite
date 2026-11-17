import { EventEmitter } from 'node:events';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { defaultSteps, runVerify, type RunVerifyOptions, type VerifyStep } from './verify.mjs';

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

// Cada teste grava num `times.jsonl` temporário: o `.verify/` real não muda.
function tempTimes() {
  return join(mkdtempSync(join(tmpdir(), 'verify-times-')), '.verify', 'times.jsonl');
}

// Relógio falso: devolve os instantes (em ms) na ordem das chamadas de `now`.
function clock(...instants: number[]) {
  let i = 0;

  return () => instants[Math.min(i++, instants.length - 1)];
}

async function run(
  steps: VerifyStep[],
  argv: string[] = [],
  extra: Partial<RunVerifyOptions> = {},
) {
  const stdout = capture();
  const stderr = capture();
  const code = await runVerify({
    steps,
    argv,
    stdout,
    stderr,
    timesFile: tempTimes(),
    ...extra,
  });

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
    const pending = runVerify({
      steps: [step],
      stdout,
      stderr: capture(),
      signals,
      timesFile: tempTimes(),
    });

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

  describe('tempo, registro e orçamento', () => {
    const one = (name: string, code = 0): VerifyStep => ({
      name,
      label: name,
      argv: ['-e', `process.exit(${code})`],
    });
    const budget = { suite: 90, total: 180 };

    it('registro: acrescenta uma linha de JSON com os campos e ok', async () => {
      const timesFile = tempTimes();

      await run([one('a'), one('b')], [], { timesFile, now: clock(0, 0, 2000, 2000, 5000, 5000) });
      await run([one('a'), one('b', 1)], [], { timesFile });

      const lines = readFileSync(timesFile, 'utf8')
        .trim()
        .split('\n')
        .map((l) => JSON.parse(l));

      expect(lines).toHaveLength(2);
      expect(lines[0]).toMatchObject({ etapas: { a: 2, b: 3 }, total: 5, ok: true });
      expect(Object.keys(lines[0]).sort()).toEqual([
        'em',
        'etapas',
        'node',
        'ok',
        'sistema',
        'total',
      ]);
      expect(lines[1].ok).toBe(false);
    });

    it('pasta ausente: cria .verify/ ao gravar; o dry-run não grava', async () => {
      const timesFile = tempTimes();

      await run([one('a')], ['--dry-run'], { timesFile });
      expect(existsSync(timesFile)).toBe(false);
      await run([one('a')], [], { timesFile });
      expect(existsSync(timesFile)).toBe(true);
    });

    it('regressão: avisa AUMENTO de N % quando uma etapa piora mais de 25 %', async () => {
      const timesFile = tempTimes();

      await run([one('a')], [], { timesFile, now: clock(0, 0, 10_000, 10_000) });

      const slower = await run([one('a')], [], { timesFile, now: clock(0, 0, 13_000, 13_000) });
      const same = await run([one('a')], [], { timesFile, now: clock(0, 0, 14_000, 14_000) });

      expect(slower.stdout).toContain('AUMENTO de 30 %');
      expect(same.stdout).not.toContain('AUMENTO');
    });

    it('orçamento: por padrão só avisa; --enforce-budget sai 1', async () => {
      const slow = clock(0, 0, 100_000, 100_000);
      const warn = await run([one('testes')], [], { budget, now: slow });
      const enforced = await run([one('testes')], ['--enforce-budget'], {
        budget,
        now: clock(0, 0, 100_000, 100_000),
      });
      const within = await run([one('testes')], ['--enforce-budget'], {
        budget,
        now: clock(0, 0, 5000, 5000),
      });

      expect(warn.code).toBe(0);
      expect(warn.stdout).toContain('ORÇAMENTO excedido: suíte');
      expect(enforced.code).toBe(1);
      expect(within.code).toBe(0);
    });
  });
});

// EC-17 (design da 001): execuções simultâneas anexam uma linha cada, sem se corromper. O registro
// é só `appendRecord`; aqui vários processos `node` de verdade escrevem no mesmo arquivo ao mesmo tempo.
describe('registro com execuções simultâneas (EC-17)', () => {
  const PROCESSES = 4;
  const PER_PROCESS = 25;
  const verifyUrl = pathToFileURL(resolve(process.cwd(), 'scripts/verify.mjs')).href;

  const writer = (file: string, id: number) =>
    new Promise<number | null>((done) => {
      const code = `import(${JSON.stringify(verifyUrl)}).then((m) => {
        for (let i = 0; i < ${PER_PROCESS}; i++)
          m.appendRecord(${JSON.stringify(file)}, {
            em: 'p${id}-' + i, etapas: { a: 1 }, total: i, ok: true, node: process.version, sistema: 'teste',
          });
      })`;

      spawn(process.execPath, ['-e', code], { stdio: 'ignore' }).on('close', done);
    });

  it('4 processos x 25 linhas: 100 linhas, todas JSON válido, nenhuma partida', async () => {
    const file = join(mkdtempSync(join(tmpdir(), 'verify-simult-')), 'times.jsonl');

    const codes = await Promise.all(Array.from({ length: PROCESSES }, (_, id) => writer(file, id)));

    expect(codes).toEqual(Array(PROCESSES).fill(0));

    const lines = readFileSync(file, 'utf8').trimEnd().split('\n');
    const records = lines.map((line) => JSON.parse(line));

    expect(records).toHaveLength(PROCESSES * PER_PROCESS);
    expect(new Set(records.map((r) => r.em)).size).toBe(PROCESSES * PER_PROCESS);
    for (const r of records)
      expect(Object.keys(r).sort()).toEqual(['em', 'etapas', 'node', 'ok', 'sistema', 'total']);
  });
});
