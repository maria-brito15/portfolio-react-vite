// Varredura de segredos (FR-016, design §7 e TD-011). Dois usos: o teste da etapa `testes` varre os
// arquivos rastreados, e o plugin `secretGuard` (etapa `geração`) varre o bundle e as variáveis
// públicas. A saída nunca traz o valor: só o tipo, o arquivo, a linha e 4 caracteres seguidos de `…`.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export interface SecretPattern {
  name: string;
  regex: RegExp;
}

// Sem flag `g`: cada padrão é testado por linha e só importa o primeiro achado.
export const SECRET_PATTERNS: readonly SecretPattern[] = [
  { name: 'chave Google (AIza…)', regex: /AIza[0-9A-Za-z_-]{35}/ },
  { name: 'token GitHub (gh*_…)', regex: /gh[pousr]_[0-9A-Za-z]{36,}/ },
  { name: 'token GitHub (github_pat_…)', regex: /github_pat_[0-9A-Za-z_]{22,}/ },
  { name: 'chave AWS (AKIA…)', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'token Slack (xox*-…)', regex: /xox[baprs]-[0-9A-Za-z-]{10,}/ },
  { name: 'chave privada (BEGIN … PRIVATE KEY)', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  {
    name: 'JWT (três partes)',
    regex: /eyJ[0-9A-Za-z_-]{10,}\.eyJ[0-9A-Za-z_-]{10,}\.[0-9A-Za-z_-]{10,}/,
  },
  // O `(?<!…)` evita casar o fim de palavras como "risk-assessment-…".
  { name: 'chave sk-…', regex: /(?<![A-Za-z0-9])sk-[0-9A-Za-z_-]{32,}/ },
  { name: 'token Netlify (nfp_…)', regex: /nfp_[0-9A-Za-z]{30,}/ },
];

export const MAX_FILE_BYTES = 1024 * 1024;
const SKIPPED_NAMES = new Set(['package-lock.json']);
const SKIPPED_DIRS = new Set(['node_modules', 'dist', '.git', '.verify']);

export interface SecretFinding {
  file: string;
  line: number;
  pattern: string;
  /** Os 4 primeiros caracteres do achado e `…`: nunca o valor inteiro. */
  start: string;
}

export const mask = (value: string) => `${value.slice(0, 4)}…`;

/** Procura os padrões, linha por linha (CRLF e LF). */
export function scanText(text: string, file: string): SecretFinding[] {
  const findings: SecretFinding[] = [];

  text.split(/\r?\n/).forEach((content, index) => {
    for (const { name, regex } of SECRET_PATTERNS) {
      const match = regex.exec(content);

      if (match) {
        findings.push({ file, line: index + 1, pattern: name, start: mask(match[0]) });
      }
    }
  });

  return findings;
}

export function formatFinding({ file, line, pattern, start }: SecretFinding): string {
  return `segredo: ${file}:${line} — padrão "${pattern}" (início "${start}"). Remova do arquivo e troque a credencial.`;
}

/** Arquivo que se lê: texto, até 1 MB, fora do `package-lock.json`. `null` = ignorar. */
function readScannable(path: string): string | null {
  const name = path.split(/[\\/]/).pop() ?? '';

  if (SKIPPED_NAMES.has(name)) return null;

  try {
    const stat = statSync(path);

    if (!stat.isFile() || stat.size > MAX_FILE_BYTES) return null;

    const buffer = readFileSync(path);

    // Um byte NUL nos primeiros 8 KB é o critério do `git` para "binário".
    if (buffer.subarray(0, 8000).includes(0)) return null;

    return buffer.toString('utf8');
  } catch {
    // Listado pelo git, mas apagado do disco (ainda não commitado): nada a varrer.
    return null;
  }
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) return SKIPPED_DIRS.has(entry.name) ? [] : walk(full);

    return [full];
  });
}

/** Lista os arquivos pelo git; `null` quando o git não existe ou falha (EC-14). */
export function gitFiles(root: string): string[] | null {
  const run = spawnSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  if (run.error || run.status !== 0) return null;

  return run.stdout
    .split('\0')
    .filter(Boolean)
    .map((file) => join(root, file));
}

export interface ScanResult {
  findings: SecretFinding[];
  scanned: number;
  warnings: string[];
}

function scanPaths(root: string, paths: string[]): Omit<ScanResult, 'warnings'> {
  const findings: SecretFinding[] = [];
  let scanned = 0;

  for (const path of paths) {
    const text = readScannable(path);

    if (text === null) continue;
    scanned += 1;
    findings.push(...scanText(text, relative(root, path).split(sep).join('/')));
  }

  return { findings, scanned };
}

/**
 * Varre os arquivos rastreados e os novos não ignorados. Sem `git`, percorre o disco (menos
 * `node_modules`, `dist`, `.git` e `.verify`) e avisa: não passa em silêncio (EC-14).
 */
export function scanTrackedFiles(
  root: string,
  listFiles: (root: string) => string[] | null = gitFiles,
): ScanResult {
  const listed = listFiles(root);
  const warnings = listed === null ? ['git não encontrado, varredura pelo disco'] : [];
  const paths = listed ?? walk(root);

  return { ...scanPaths(root, paths), warnings };
}

/** Varre uma pasta inteira (por exemplo `dist/`), sem passar pelo git. */
export function scanDirectory(dir: string): ScanResult {
  if (!existsSync(dir)) return { findings: [], scanned: 0, warnings: [] };

  const paths = (function all(current: string): string[] {
    return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
      const full = join(current, entry.name);

      return entry.isDirectory() ? all(full) : [full];
    });
  })(dir);

  return { ...scanPaths(dir, paths), warnings: [] };
}

// --- Variáveis públicas (VITE_*) ---------------------------------------------------------------

export const SECRET_NAME = /TOKEN|SECRET|PASSWORD|API_?KEY|PRIVATE|HOOK/;

// Públicas por natureza do SDK do EmailJS; as mesmas de `SECRETS_SCAN_OMIT_KEYS` do netlify.toml.
export const PUBLIC_BY_DESIGN = [
  'VITE_EMAILJS_SERVICE_ID',
  'VITE_EMAILJS_TEMPLATE_ID',
  'VITE_EMAILJS_PUBLIC_KEY',
];

export interface EnvFinding {
  name: string;
}

/** Variável `VITE_*` cujo nome sugere segredo: ela iria para o JavaScript do navegador. */
export function publicEnvFindings(
  names: Iterable<string>,
  allowed: readonly string[] = PUBLIC_BY_DESIGN,
): EnvFinding[] {
  return [...names]
    .filter((name) => name.startsWith('VITE_') && SECRET_NAME.test(name) && !allowed.includes(name))
    .map((name) => ({ name }));
}

export function formatEnvFinding({ name }: EnvFinding): string {
  return `segredo: variável ${name} — nome de variável pública (VITE_) que sugere segredo; ela iria para o JavaScript do navegador.`;
}
