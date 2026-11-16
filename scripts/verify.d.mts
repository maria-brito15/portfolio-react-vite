export interface VerifyStep {
  name: string;
  argv: string[];
  requires?: string[];
  label: string;
}

export interface RunVerifyOptions {
  steps?: VerifyStep[];
  argv?: string[];
  stdout?: { write(text: string): unknown };
  stderr?: { write(text: string): unknown };
  spawnFn?: typeof import('node:child_process').spawn;
  signals?: NodeJS.EventEmitter;
  cwd?: string;
  now?: () => number;
  timesFile?: string;
  budget?: { suite: number; total: number };
}

export const EXIT_OK: 0;
export const EXIT_STEP_FAILED: 1;
export const EXIT_RUNNER_ERROR: 2;
export const EXIT_INTERRUPTED: 130;
export const BUDGET_SUITE_S: 90;
export const BUDGET_TOTAL_S: 180;
export const SUITE_STEP: 'testes';
export const REGRESSION_PERCENT: 25;
export function defaultSteps(): VerifyStep[];
export function runVerify(options?: RunVerifyOptions): Promise<number>;
