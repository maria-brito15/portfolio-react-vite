export const LIMITS: { js: number; css: number };
export interface Measure {
  page: string;
  js: number;
  css: number;
  files: { js: string[]; css: string[] };
}
export function referencedAssets(html: string): { js: string[]; css: string[] };
export function measureHtml(dir: string, page: string): Measure;
export function judge(
  results: { page: string; js: number; css: number }[],
  limits?: { js: number; css: number },
): string[];
export function measureBundle(dir: string): { results: Measure[]; problems: string[] };
