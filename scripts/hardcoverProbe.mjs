// Sondagem do Hardcover (docs/specs/personal/hardcover.md, seção "Como confirmar o esquema").
//
//   npm run personal:probe
//
// Lê HARDCOVER_API_TOKEN do ambiente ou do `.env` (ignorado pelo git) e confere, com a conta da
// Duda, o que o cliente SUPÕE do Hardcover: se os campos que as consultas pedem existem e como a
// leitura completa sai normalizada. Usa o MESMO cliente e as MESMAS consultas do servidor
// (netlify/personal/hardcover.ts), então o que passa aqui passa na função.
//
// Só lê. Imprime nomes de campos, estruturas e contagens; NUNCA o token, nem títulos, nem o texto
// de resenhas. Sai com 0 se tudo bateu, 1 se algo divergiu, 2 se faltar o token.
try {
  process.loadEnvFile('.env');
} catch {
  // sem .env: vale o ambiente do processo
}

const token = process.env.HARDCOVER_API_TOKEN?.trim();

if (!token) {
  console.error(
    'Defina HARDCOVER_API_TOKEN (no ambiente ou no .env) para rodar a sondagem.\n' +
      'Gere o token na sua conta do Hardcover; ele nunca vai para o navegador.',
  );
  process.exit(2);
}

const { BOOKS_QUERIES, HARDCOVER_ENDPOINT, HardcoverError, fetchHardcoverBooks } =
  await import('../netlify/personal/hardcover.ts');

let problems = 0;
const ok = (text) => console.log(`  ok   ${text}`);
const bad = (text) => {
  problems++;
  console.log(`  FALHA ${text}`);
};

async function raw(query, variables = {}) {
  const res = await fetch(HARDCOVER_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));

  return { status: res.status, body };
}

// ---- 1. campos que as consultas usam existem no esquema?
console.log('\n1) Campos usados pelas consultas (introspecção)');

const WANTED = {
  user_books: [
    'id',
    'status_id',
    'rating',
    'review_raw',
    'date_added',
    'first_started_reading_date',
    'last_read_date',
    'book',
    'user_book_reads',
  ],
  books: ['id', 'slug', 'title', 'pages', 'cached_image', 'cached_contributors'],
  user_book_reads: ['started_at', 'finished_at', 'progress_pages', 'progress'],
};

for (const [type, fields] of Object.entries(WANTED)) {
  const { status, body } = await raw(`{ __type(name: "${type}") { fields { name } } }`);
  const names = body?.data?.__type?.fields?.map((f) => f.name);

  if (status === 401 || status === 403) {
    bad(`token recusado (HTTP ${status}): expirado ou inválido`);
    break;
  }
  if (!names) {
    console.log(
      `  --   ${type}: introspecção indisponível (${body?.errors?.[0]?.message ?? `HTTP ${status}`}); pulando`,
    );
    continue;
  }
  for (const field of fields) (names.includes(field) ? ok : bad)(`${type}.${field}`);
}

// ---- 2. a consulta completa roda? (3 linhas)
console.log('\n2) Consulta de livros (nível completo, 3 linhas)');

const me = await raw('query { me { id username } }');
const userId = Array.isArray(me.body?.data?.me) ? me.body.data.me[0]?.id : me.body?.data?.me?.id;

if (typeof userId !== 'number')
  bad(`"me" sem id (HTTP ${me.status}): ${me.body?.errors?.[0]?.message ?? 'sem detalhe'}`);
else {
  ok(`"me" respondeu (${Array.isArray(me.body.data.me) ? 'lista' : 'objeto'})`);

  const full = await raw(BOOKS_QUERIES[0], { userId, limit: 3, offset: 0 });

  if (full.body?.errors) bad(`nível completo recusado: ${full.body.errors[0]?.message}`);
  else {
    const rows = full.body?.data?.user_books ?? [];

    ok(`nível completo aceito (${rows.length} linha(s) de teste)`);
    for (const row of rows.slice(0, 1))
      console.log(
        '       tipos da 1ª linha:',
        JSON.stringify(
          Object.fromEntries(
            Object.entries(row).map(([k, v]) => [
              k,
              v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v,
            ]),
          ),
        ),
      );
  }
}

// ---- 3. leitura completa pelo cliente real
console.log('\n3) Leitura completa pelo cliente do servidor');

try {
  const books = await fetchHardcoverBooks({ token });
  const count = (fn) => books.filter(fn).length;
  const by = (status) => count((b) => b.status === status);

  ok(`${books.length} livro(s) normalizados (sem repetidos)`);
  console.log(
    `       estados: lendo ${by('reading')} · lidos ${by('read')} · quero ler ${by('want')} · pausados ${by('paused')} · abandonados ${by('dnf')}`,
  );
  console.log(
    `       com capa ${count((b) => b.coverUrl)} · com autores ${count((b) => b.authors.length)} · com páginas ${count((b) => b.pages)} · com nota ${count((b) => b.rating)}`,
  );
  console.log(
    `       lidos com data de término ${count((b) => b.status === 'read' && b.finishedAt)} de ${by('read')} · com resenha ${count((b) => b.review)} · lendo com andamento ${count((b) => b.progress)}`,
  );

  if (books.length === 0)
    bad('nenhum livro: confira se o token é da conta certa e se a estante tem livros');
  if (
    books.some((b) => b.status === 'read') &&
    !books.some((b) => b.status === 'read' && b.finishedAt)
  )
    bad('nenhum livro lido veio com data de término: `finished_at` pode ter outro nome');
  if (books.length && !books.some((b) => b.authors.length))
    bad('nenhum livro veio com autores: `cached_contributors` pode ter outro formato');
  if (books.length && !books.some((b) => b.coverUrl))
    bad('nenhum livro veio com capa: `cached_image` pode ter outro formato');
} catch (error) {
  bad(`falhou (${error instanceof HardcoverError ? error.kind : 'erro'}): ${error.message}`);
}

console.log(
  problems
    ? `\n${problems} divergência(s): ajuste netlify/personal/hardcover.ts (consultas e normalização) e as fixtures de hardcover.test.ts.\n`
    : '\nTudo bateu: o esquema assumido está confirmado.\n',
);
process.exit(problems ? 1 : 0);
