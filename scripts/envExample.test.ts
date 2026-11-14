import { readFileSync } from 'node:fs';

// `.env.example` documenta cada variável e nunca carrega segredo (docs/specs/personal/, CL-32).
const lines = readFileSync('.env.example', 'utf8').split('\n');
const variables = lines.flatMap((line, i) => {
  const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line);

  return match ? [{ name: match[1], value: match[2], previous: lines[i - 1] ?? '' }] : [];
});
const byName = Object.fromEntries(variables.map((v) => [v.name, v]));

const PERSONAL = [
  'VITE_PERSONAL_SOURCE',
  'HARDCOVER_API_TOKEN',
  'HARDCOVER_USERNAME',
  'TMDB_API_KEY',
  'LETTERBOXD_USERNAME',
  'PERSONAL_HARDCOVER_TTL_MIN',
  'PERSONAL_LETTERBOXD_TTL_MIN',
  'PERSONAL_REFRESH_SECRET',
  'PERSONAL_BUILD_HOOK_URL',
];
const SECRETS = [
  'HARDCOVER_API_TOKEN',
  'TMDB_API_KEY',
  'PERSONAL_REFRESH_SECRET',
  'PERSONAL_BUILD_HOOK_URL',
];

describe('.env.example do espaço cultural', () => {
  it('lista todas as variáveis do espaço cultural, sem repetir nenhuma', () => {
    for (const name of PERSONAL) expect(byName[name], name).toBeDefined();
    expect(new Set(variables.map((v) => v.name)).size).toBe(variables.length);
  });

  it('segredo fica vazio e nunca usa o prefixo VITE_ (que iria para o JavaScript público)', () => {
    for (const name of SECRETS) {
      expect(byName[name].value, name).toBe('');
      expect(name.startsWith('VITE_'), name).toBe(false);
    }

    // só o EmailJS e a origem dos dados podem ter VITE_; nenhum nome sugere segredo
    for (const { name } of variables.filter((v) => v.name.startsWith('VITE_')))
      expect(name, name).not.toMatch(/TOKEN|SECRET|PASSWORD|API_KEY|HOOK/);
  });

  it('o modo padrão é "mock" e os nomes de usuário são públicos', () => {
    expect(byName.VITE_PERSONAL_SOURCE.value).toBe('mock');
    expect(byName.HARDCOVER_USERNAME.value).toBe('dudapbrt');
    expect(byName.LETTERBOXD_USERNAME.value).toBe('dudapbrt');
  });

  it('cada variável do espaço cultural tem uma linha de descrição logo acima', () => {
    for (const name of PERSONAL) {
      const { previous } = byName[name];

      expect(previous.startsWith('#') && previous.length > 10, name).toBe(true);
    }
  });

  it('a validade do cache segue a decisão D9 (Hardcover 6 h, Letterboxd 1 h)', () => {
    expect(Number(byName.PERSONAL_HARDCOVER_TTL_MIN.value)).toBe(360);
    expect(Number(byName.PERSONAL_LETTERBOXD_TTL_MIN.value)).toBe(60);
  });

  it('o netlify.toml não carrega nenhum desses segredos', () => {
    const toml = readFileSync('netlify.toml', 'utf8');

    for (const name of SECRETS) expect(toml, name).not.toContain(`${name} =`);
  });
});
