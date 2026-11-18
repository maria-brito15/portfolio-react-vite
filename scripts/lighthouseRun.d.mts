export const GOALS: { lcp: number; cls: number; accessibility: number; bestPractices: number };
export interface Run {
  lcp: number;
  cls: number;
  accessibility: number;
  bestPractices: number;
}
export function median(values: number[]): number;
export function pick(lhr: unknown): Run;
export function judge(runs: Run[], goals?: typeof GOALS): { median: Run; problems: string[] };
