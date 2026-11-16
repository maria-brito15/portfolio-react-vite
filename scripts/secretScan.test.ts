import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  PUBLIC_BY_DESIGN,
  SECRET_PATTERNS,
  formatEnvFinding,
  formatFinding,
  gitFiles,
  publicEnvFindings,
  scanDirectory,
  scanText,
  scanTrackedFiles,
} from './secretScan';

// Credenciais de exemplo, montadas em tempo de execução: nenhuma fica escrita em arquivo
// (design §7), senão a própria varredura do repositório acusaria este teste.
const x = (n: number) => 'x'.repeat(n);
const samples: Record<string, string> = {
  'chave Google (AIza…)': 'AIza' + x(35),
  'token GitHub (gh*_…)': 'ghp_' + x(36),
  'token GitHub (github_pat_…)': 'github_pat_' + x(30),
  'chave AWS (AKIA…)': 'AKIA' + 'A'.repeat(16),
  'token Slack (xox*-…)': 'xoxb-' + '1'.repeat(12),
  'chave privada (BEGIN … PRIVATE KEY)': '-----BEGIN ' + 'RSA PRIVATE KEY-----',
  'JWT (três partes)': ['eyJ' + x(12), 'eyJ' + x(12), x(12)].join('.'),
  'chave sk-…': 'sk-' + x(40),
  'token Netlify (nfp_…)': 'nfp_' + x(34),
};

function tempProject(files: Record<string, string | Buffer>) {
  const root = mkdtempSync(join(tmpdir(), 'secret-'));

  for (const [name, content] of Object.entries(files)) {
    const path = join(root, name);

    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, content);
  }

  return root;
}

const noGit = () => null;

describe('padrões de segredo', () => {
  it('cada um dos 9 padrões do §7 acha a sua amostra e só ela', () => {
    expect(Object.keys(samples).sort()).toEqual(SECRET_PATTERNS.map((p) => p.name).sort());

    for (const [name, sample] of Object.entries(samples)) {
      const found = scanText(`const a = "${sample}";`, 'a.ts');

      expect(
        found.map((f) => f.pattern),
        name,
      ).toContain(name);
    }
  });

  it('a saída mostra o tipo, o arquivo, a linha e 4 caracteres, nunca o valor', () => {
    const secret = samples['chave Google (AIza…)'];
    const [finding] = scanText(`linha 1\nconst k = '${secret}'`, 'src/a.ts');
    const line = formatFinding(finding);

    expect(finding).toMatchObject({ file: 'src/a.ts', line: 2, start: 'AIza…' });
    expect(line).toBe(
      'segredo: src/a.ts:2 — padrão "chave Google (AIza…)" (início "AIza…"). Remova do arquivo e troque a credencial.',
    );
    expect(line).not.toContain(secret);
    expect(line).not.toContain('xxxx');
  });

  it('lê CRLF e LF: a linha certa nos dois', () => {
    const secret = samples['chave AWS (AKIA…)'];

    expect(scanText(`a\r\nb\r\n${secret}\r\n`, 'f')[0].line).toBe(3);
    expect(scanText(`a\nb\n${secret}\n`, 'f')[0].line).toBe(3);
  });

  it('texto comum e palavras parecidas não disparam', () => {
    const text = ['risk-assessment-' + x(40), 'task-' + x(40), 'AIza curto', 'sk-curto'].join('\n');

    expect(scanText(text, 'f')).toEqual([]);
  });
});

describe('varredura de arquivos', () => {
  it('uma credencial plantada num arquivo temporário é achada e mascarada', () => {
    const root = tempProject({
      'src/a.ts': `export const k = '${samples['chave Google (AIza…)']}';`,
    });
    const { findings, scanned } = scanTrackedFiles(root, noGit);

    expect(scanned).toBe(1);
    expect(findings).toEqual([
      { file: 'src/a.ts', line: 1, pattern: 'chave Google (AIza…)', start: 'AIza…' },
    ]);
  });

  it('sem a credencial, passa', () => {
    const root = tempProject({ 'src/a.ts': 'export const k = 1;' });

    expect(scanTrackedFiles(root, noGit).findings).toEqual([]);
  });

  it('sem git: avisa e percorre o disco, ignorando node_modules, dist, .git e .verify (EC-14)', () => {
    const secret = samples['token Netlify (nfp_…)'];
    const root = tempProject({
      'a.txt': secret,
      'node_modules/p/i.js': secret,
      'dist/x.js': secret,
      '.git/config': secret,
      '.verify/t.jsonl': secret,
    });
    const result = scanTrackedFiles(root, noGit);

    expect(result.warnings).toEqual(['git não encontrado, varredura pelo disco']);
    expect(result.findings.map((f) => f.file)).toEqual(['a.txt']);
  });

  it('ignora binário, package-lock.json e arquivo maior que 1 MB', () => {
    const secret = samples['chave AWS (AKIA…)'];
    const root = tempProject({
      'bin.dat': Buffer.concat([Buffer.from([0, 1, 2]), Buffer.from(secret)]),
      'package-lock.json': secret,
      'grande.txt': secret + '\n' + 'a'.repeat(1024 * 1024),
      'ok.txt': secret,
    });

    expect(scanTrackedFiles(root, noGit).findings.map((f) => f.file)).toEqual(['ok.txt']);
  });

  it('arquivo listado pelo git mas apagado do disco não quebra', () => {
    const root = tempProject({ 'a.txt': 'ok' });
    const list = () => [join(root, 'a.txt'), join(root, 'sumiu.txt')];

    expect(scanTrackedFiles(root, list).scanned).toBe(1);
  });

  it('varre uma pasta inteira, como o dist/', () => {
    const root = tempProject({ 'static/index.js': `var k="${samples['chave sk-…']}"` });

    expect(scanDirectory(root).findings.map((f) => f.file)).toEqual(['static/index.js']);
    expect(scanDirectory(join(root, 'nao-existe'))).toEqual({
      findings: [],
      scanned: 0,
      warnings: [],
    });
  });

  it('os arquivos rastreados reais passam (linha de base 0, E12)', () => {
    const real = scanTrackedFiles(process.cwd());

    expect(gitFiles(process.cwd())).not.toBeNull();
    expect(real.warnings).toEqual([]);
    expect(real.scanned).toBeGreaterThan(100);
    expect(real.findings.map(formatFinding)).toEqual([]);
  });
});

describe('variáveis públicas (VITE_*)', () => {
  it('VITE_X_TOKEN falha, com a mensagem do §6.4', () => {
    const found = publicEnvFindings(['VITE_X_TOKEN']);

    expect(found.map(formatEnvFinding)).toEqual([
      'segredo: variável VITE_X_TOKEN — nome de variável pública (VITE_) que sugere segredo; ela iria para o JavaScript do navegador.',
    ]);
  });

  it.each([
    'VITE_A_SECRET',
    'VITE_PASSWORD',
    'VITE_MAPS_API_KEY',
    'VITE_APIKEY',
    'VITE_PRIVATE_X',
    'VITE_SLACK_HOOK',
  ])('%s falha', (name) => {
    expect(publicEnvFindings([name])).toHaveLength(1);
  });

  it('as 3 do EmailJS passam, e nomes comuns também', () => {
    expect(publicEnvFindings(PUBLIC_BY_DESIGN)).toEqual([]);
    expect(publicEnvFindings(['VITE_PERSONAL_SOURCE', 'VITE_APP_NAME', 'MODE'])).toEqual([]);
  });

  it('variável sem VITE_ não vai ao navegador: fica fora desta regra', () => {
    expect(publicEnvFindings(['HARDCOVER_API_TOKEN', 'PERSONAL_SECRET'])).toEqual([]);
  });

  it('a lista de exceções é a mesma de SECRETS_SCAN_OMIT_KEYS do netlify.toml', () => {
    const toml = readFileSync('netlify.toml', 'utf8');
    const omit = /SECRETS_SCAN_OMIT_KEYS\s*=\s*"([^"]*)"/.exec(toml)?.[1].split(',');

    expect(omit?.sort()).toEqual([...PUBLIC_BY_DESIGN].sort());
  });
});
