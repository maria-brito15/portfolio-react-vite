// `npm run verify`: as 5 etapas do steering, sempre na mesma ordem, e para na primeira falha.
// Sem shell e sem `.cmd`: o mesmo `node` executa o `.js` de cada ferramenta (design §6.1, TD-006).
import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const EXIT_OK = 0;
export const EXIT_STEP_FAILED = 1;
export const EXIT_RUNNER_ERROR = 2;
export const EXIT_INTERRUPTED = 130;

const require = createRequire(import.meta.url);

// pacote, arquivo executável dentro dele e argumentos fixos no código (nada vem do ambiente).
const TOOLS = [
  { name: 'formatação', pkg: 'prettier', bin: 'bin/prettier.cjs', args: ['--check', '.'] },
  { name: 'lint', pkg: 'eslint', bin: 'bin/eslint.js', args: ['.', '--max-warnings', '0'] },
  { name: 'tipos', pkg: 'typescript', bin: 'bin/tsc', args: ['--noEmit'] },
  { name: 'testes', pkg: 'vitest', bin: 'vitest.mjs', args: ['run'] },
  { name: 'geração', pkg: 'vite', bin: 'bin/vite.js', args: ['build'] },
];

function resolveBin(pkg, bin) {
  try {
    return join(dirname(require.resolve(`${pkg}/package.json`)), bin);
  } catch {
    // Pacote ausente: o caminho inexistente cai na checagem `requires` (código 2, sem pilha).
    return join(dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', pkg, bin);
  }
}

/** Etapas reais. `argv` é o que o `node` recebe; `requires` são os arquivos que precisam existir. */
export function defaultSteps() {
  return TOOLS.map(({ name, pkg, bin, args }) => {
    const file = resolveBin(pkg, bin);
    return {
      name,
      argv: [file, ...args],
      requires: [file],
      label: `${pkg} ${args.join(' ')}`,
    };
  });
}

function runStep(step, { spawnFn, signals, cwd }) {
  return new Promise((resolve) => {
    const child = spawnFn(process.execPath, step.argv, { stdio: 'inherit', shell: false, cwd });
    let interrupted = false;
    const onSigint = () => {
      interrupted = true;
      child.kill('SIGINT');
    };
    signals.on('SIGINT', onSigint);
    const finish = (code) => {
      signals.off('SIGINT', onSigint);
      resolve({ code, interrupted });
    };
    child.on('error', () => finish(null));
    child.on('close', (code) => finish(code));
  });
}

// Orçamento aprovado (DQ-002): suíte ≤ 90 s e verify ≤ 180 s.
// Meta de esforço, só como referência: 60 s e 120 s.
export const BUDGET_SUITE_S = 90;
export const BUDGET_TOTAL_S = 180;
export const SUITE_STEP = 'testes';
export const REGRESSION_PERCENT = 25;

const fmt = (seconds) => `${seconds.toFixed(1).replace('.', ',')} s`;

/** Última execução registrada; linha corrompida ou arquivo ausente vira `null`. */
function readPrevious(file) {
  try {
    const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
    return JSON.parse(lines[lines.length - 1]);
  } catch {
    return null;
  }
}

/** Uma linha por execução, em modo append (execuções simultâneas não corrompem a anterior). */
export function appendRecord(file, record) {
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, `${JSON.stringify(record)}\n`);
}

/**
 * Roda as etapas em ordem e devolve o código de saída (0, 1, 2 ou 130).
 * `steps`, `spawnFn`, `signals`, `now`, `timesFile`, `budget` e as saídas são injetáveis
 * só para o teste.
 */
export async function runVerify({
  steps = defaultSteps(),
  argv = [],
  stdout = process.stdout,
  stderr = process.stderr,
  spawnFn = spawn,
  signals = process,
  cwd = process.cwd(),
  now = () => performance.now(),
  timesFile = join(cwd, '.verify', 'times.jsonl'),
  budget = { suite: BUDGET_SUITE_S, total: BUDGET_TOTAL_S },
} = {}) {
  const out = (text) => stdout.write(`${text}\n`);
  const total = steps.length;
  const width = Math.max(...steps.map((s) => s.name.length));
  const head = (i, step) => `verify [${i + 1}/${total}] ${step.name.padEnd(width)}`;

  if (argv.includes('--dry-run')) {
    steps.forEach((step, i) => out(`${head(i, step)}   ${step.label}`));
    out('verify: plano impresso, nada foi executado (--dry-run)');
    return EXIT_OK;
  }

  const missing = steps.flatMap((s) => s.requires ?? []).filter((file) => !existsSync(file));
  if (missing.length > 0) {
    stderr.write('verify: ferramenta não encontrada; rode npm ci antes\n');
    return EXIT_RUNNER_ERROR;
  }

  const enforce = argv.includes('--enforce-budget');
  const previous = readPrevious(timesFile);
  const startedAll = now();
  const seconds = {};
  let failure = null;

  for (const [i, step] of steps.entries()) {
    out(`${head(i, step)}   ${step.label}`);
    const started = now();
    const { code, interrupted } = await runStep(step, { spawnFn, signals, cwd });
    const elapsed = (now() - started) / 1000;

    if (interrupted) {
      out(`verify: interrompido na etapa ${i + 1}/${total} (${step.name})`);
      return EXIT_INTERRUPTED;
    }
    seconds[step.name] = Number(elapsed.toFixed(1));
    if (code === 0) {
      out(`${head(i, step)}   OK   ${fmt(elapsed)}`);
      const before = previous?.etapas?.[step.name];
      if (before > 0 && elapsed > before * (1 + REGRESSION_PERCENT / 100)) {
        const percent = Math.round(((elapsed - before) / before) * 100);
        out(
          `verify: AUMENTO de ${percent} % na etapa ${step.name} (${fmt(before)} → ${fmt(elapsed)})`,
        );
      }
      continue;
    }

    const shown = code === null ? 'não iniciou' : `código ${code}`;
    out(`${head(i, step)}   FALHOU (${shown}) após ${fmt(elapsed)}`);
    const skipped = total - (i + 1);
    const rest = skipped > 0 ? ` As etapas ${i + 2}/${total} a ${total}/${total} não rodaram.` : '';
    out(`verify: parou na etapa ${i + 1}/${total} (${step.name}).${rest}`);
    failure = EXIT_STEP_FAILED;
    break;
  }

  const totalSeconds = (now() - startedAll) / 1000;
  const overSuite = seconds[SUITE_STEP] > budget.suite;
  const overTotal = totalSeconds > budget.total;
  const ok = failure === null;

  try {
    appendRecord(timesFile, {
      em: new Date().toISOString(),
      sistema: process.platform,
      node: process.version,
      etapas: seconds,
      total: Number(totalSeconds.toFixed(1)),
      ok,
    });
  } catch (error) {
    out(`verify: aviso: não consegui gravar ${timesFile} (${error.code ?? 'erro'})`);
  }

  if (overSuite)
    out(
      `verify: ORÇAMENTO excedido: suíte em ${fmt(seconds[SUITE_STEP])} (limite ${budget.suite} s)`,
    );
  if (overTotal)
    out(`verify: ORÇAMENTO excedido: total em ${fmt(totalSeconds)} (limite ${budget.total} s)`);

  if (!ok) {
    out(`verify: FALHOU em ${fmt(totalSeconds)}`);
    return failure;
  }
  const last = previous?.total === undefined ? '' : `; execução anterior: ${fmt(previous.total)}`;
  out(`verify: OK em ${fmt(totalSeconds)} (orçamento ${budget.total} s${last})`);
  return enforce && (overSuite || overTotal) ? EXIT_STEP_FAILED : EXIT_OK;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await runVerify({ argv: process.argv.slice(2) });
}
