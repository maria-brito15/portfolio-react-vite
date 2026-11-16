#!/usr/bin/env node
// `npm run verify`: as 5 etapas do steering, sempre na mesma ordem, e para na primeira falha.
// Sem shell e sem `.cmd`: o mesmo `node` executa o `.js` de cada ferramenta (design §6.1, TD-006).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
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

/**
 * Roda as etapas em ordem e devolve o código de saída (0, 1, 2 ou 130).
 * `steps`, `spawnFn`, `signals` e as saídas são injetáveis só para o teste.
 */
export async function runVerify({
  steps = defaultSteps(),
  argv = [],
  stdout = process.stdout,
  stderr = process.stderr,
  spawnFn = spawn,
  signals = process,
  cwd = process.cwd(),
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

  for (const [i, step] of steps.entries()) {
    out(`${head(i, step)}   ${step.label}`);
    const { code, interrupted } = await runStep(step, { spawnFn, signals, cwd });

    if (interrupted) {
      out(`verify: interrompido na etapa ${i + 1}/${total} (${step.name})`);
      return EXIT_INTERRUPTED;
    }
    if (code === 0) {
      out(`${head(i, step)}   OK`);
      continue;
    }

    const shown = code === null ? 'não iniciou' : `código ${code}`;
    out(`${head(i, step)}   FALHOU (${shown})`);
    const skipped = total - (i + 1);
    const rest = skipped > 0 ? ` As etapas ${i + 2}/${total} a ${total}/${total} não rodaram.` : '';
    out(`verify: parou na etapa ${i + 1}/${total} (${step.name}).${rest}`);
    out('verify: FALHOU');
    return EXIT_STEP_FAILED;
  }

  out('verify: OK');
  return EXIT_OK;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await runVerify({ argv: process.argv.slice(2) });
}
