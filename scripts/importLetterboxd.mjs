// Importa o CSV oficial do Letterboxd para o histórico versionado (docs/specs/personal/films.md).
//
//   npm run personal:import-letterboxd -- [pasta-do-export] [--tmdb]
//
// A pasta (padrão `letterboxd-export/`, ignorada pelo git) é o ZIP do export descompactado; lê
// `diary.csv` e, se existir, `reviews.csv`. Escreve netlify/personal/data/letterboxd-history.json,
// preservando o `publish` e o `tmdbId` que já estavam lá. Edite o JSON à mão para pôr
// `"publish": false` numa resenha. Com `--tmdb` e TMDB_API_KEY (ambiente ou .env), resolve o id do
// TMDB por busca exata (título + ano, resultado único). O CSV bruto nunca é versionado.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

try {
  process.loadEnvFile('.env');
} catch {
  // sem .env
}

const args = process.argv.slice(2);
const withTmdb = args.includes('--tmdb');
const dir = args.find((a) => !a.startsWith('--')) ?? 'letterboxd-export';
const target = 'netlify/personal/data/letterboxd-history.json';
const { importLetterboxdCsv, parseHistory } = await import('../netlify/personal/letterboxdCsv.ts');
const { searchTmdbMovieId } = await import('../netlify/personal/tmdb.ts');

const diaryPath = join(dir, 'diary.csv');

if (!existsSync(diaryPath)) {
  console.error(`Não achei ${diaryPath}. Descompacte o ZIP do export do Letterboxd em "${dir}".`);
  process.exit(2);
}

const reviewsPath = join(dir, 'reviews.csv');
const previous = existsSync(target)
  ? parseHistory(JSON.parse(readFileSync(target, 'utf8')))
  : undefined;
const history = importLetterboxdCsv(
  {
    diary: readFileSync(diaryPath, 'utf8'),
    reviews: existsSync(reviewsPath) ? readFileSync(reviewsPath, 'utf8') : undefined,
  },
  previous,
);

if (withTmdb) {
  const auth = process.env.TMDB_API_KEY?.trim();

  if (!auth) {
    console.error('--tmdb precisa de TMDB_API_KEY (ambiente ou .env).');
    process.exit(2);
  }

  const cache = new Map();

  for (const entry of history.entries) {
    if (entry.tmdbId !== undefined || entry.year === undefined) continue;

    const key = `${entry.title}|${entry.year}`;

    if (!cache.has(key))
      cache.set(
        key,
        await searchTmdbMovieId({ auth, title: entry.title, year: entry.year }).catch(
          () => undefined,
        ),
      );

    entry.tmdbId = cache.get(key);
  }
}

writeFileSync(target, `${JSON.stringify(history, null, 2)}\n`);

const total = history.entries.length;
const reviews = history.entries.filter((e) => e.review).length;
const ids = history.entries.filter((e) => e.tmdbId !== undefined).length;

console.log(`${total} entradas (${reviews} com resenha, ${ids} com id do TMDB) em ${target}.`);
