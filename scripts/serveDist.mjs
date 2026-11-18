// Servidor estático que imita a Netlify para o `dist` (spec 002, T5.2, TD-014): `/projetos` serve
// `projetos.html` (URL "bonita"), `/en/` redireciona (301) para `/en`, endereço que não existe cai
// em `404.html` (ou `en/404.html` sob `/en/`) com status 404, e os cabeçalhos de `for = "/*"` do
// `netlify.toml` vão em toda resposta. Uso: `node scripts/serveDist.mjs dist-prova 5197`.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};

/** Cabeçalhos de `[[headers]] for = "/*"` do netlify.toml (leitor mínimo, só o que o arquivo usa). */
export function globalHeaders(toml) {
  const headers = {};
  let inAll = false;
  let inValues = false;

  for (const raw of toml.split(/\r?\n/)) {
    const line = raw.trim();

    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('[[')) {
      inAll = false;
      inValues = false;
      continue;
    }

    const eq = line.indexOf('=');

    if (line.startsWith('[')) {
      inValues = inAll && /\.values\]$/.test(line);
      continue;
    }
    if (eq < 0) continue;

    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^"(.*)"$/, '$1');

    if (key === 'for') inAll = value === '/*';
    else if (inValues) headers[key] = value;
  }

  return headers;
}

const isFile = (path) => existsSync(path) && statSync(path).isFile();

/** Arquivo do disco para um endereço, como a Netlify resolve: exato, `.html`, `index.html`. */
export function resolveFile(root, pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^[\\/]+/, '');
  const base = resolve(root, clean);

  if (base !== resolve(root) && !base.startsWith(resolve(root) + sep)) return undefined;

  for (const candidate of [base, `${base}.html`, join(base, 'index.html')]) {
    if (isFile(candidate)) return candidate;
  }

  return undefined;
}

export function createHandler(root, toml) {
  const headers = globalHeaders(toml);

  return (req, res) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    const send = (status, body, extra = {}) => {
      res.writeHead(status, { ...headers, ...extra });
      res.end(body);
    };

    if (pathname === '/en/') return send(301, '', { Location: '/en' });

    let file;

    try {
      file = resolveFile(root, pathname);
    } catch {
      file = undefined;
    }

    if (file)
      return send(200, readFileSync(file), {
        'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      });

    const notFound = join(root, pathname.startsWith('/en/') ? 'en/404.html' : '404.html');

    return send(404, existsSync(notFound) ? readFileSync(notFound) : 'não encontrado', {
      'Content-Type': TYPES['.html'],
    });
  };
}

export function serve(root, port, toml = readFileSync('netlify.toml', 'utf8')) {
  return createServer(createHandler(resolve(root), toml)).listen(port);
}

const isMain = Boolean(process.argv[1]) && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMain) {
  const [root = 'dist-prova', port = '5197'] = process.argv.slice(2);

  if (!existsSync(root)) {
    console.error(`serveDist: a pasta ${root} não existe (rode o build antes)`);
    process.exit(1);
  }
  serve(root, Number(port));
  console.log(`serveDist: ${root} em http://localhost:${port}`);
}
