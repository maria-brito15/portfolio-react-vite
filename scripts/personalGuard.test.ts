import type { ResolvedConfig } from 'vite';
import { GUARD_MESSAGE, assertSourceMode, personalGuardPlugin } from './personalGuard';

describe('assertSourceMode (CL-14)', () => {
  it('mock em produção da Netlify: falha', () => {
    expect(() => assertSourceMode({ mode: 'mock', context: 'production' })).toThrow(GUARD_MESSAGE);
  });

  it.each(['deploy-preview', 'branch-deploy', 'dev', undefined])(
    'mock fora da produção (%s): passa',
    (context) => {
      expect(() => assertSourceMode({ mode: 'mock', context })).not.toThrow();
    },
  );

  it('live em produção: passa', () => {
    expect(() => assertSourceMode({ mode: 'live', context: 'production' })).not.toThrow();
  });

  it('a mensagem diz o que fazer', () => {
    expect(GUARD_MESSAGE).toMatch(/VITE_PERSONAL_SOURCE=live/);
    expect(GUARD_MESSAGE).toMatch(/preview/);
  });
});

describe('plugin personalGuard (CL-14)', () => {
  const plugin = personalGuardPlugin();
  const resolve = (env: Record<string, string>) =>
    (plugin.configResolved as (config: ResolvedConfig) => void)({ env } as ResolvedConfig);

  afterEach(() => vi.unstubAllEnvs());

  it('só roda no build (nem o dev nem o Vitest são barrados)', () => {
    expect(plugin.apply).toBe('build');
  });

  it('sem a variável (padrão mock) e CONTEXT=production: o build falha', () => {
    vi.stubEnv('CONTEXT', 'production');
    expect(() => resolve({})).toThrow(/modo "mock"/);
  });

  it('valor inesperado também vale mock e falha em produção', () => {
    vi.stubEnv('CONTEXT', 'production');
    expect(() => resolve({ VITE_PERSONAL_SOURCE: 'Live' })).toThrow();
  });

  it('VITE_PERSONAL_SOURCE=live em produção: passa', () => {
    vi.stubEnv('CONTEXT', 'production');
    expect(() => resolve({ VITE_PERSONAL_SOURCE: 'live' })).not.toThrow();
  });

  it('mock em preview de deploy ou local: passa', () => {
    vi.stubEnv('CONTEXT', 'deploy-preview');
    expect(() => resolve({})).not.toThrow();
    vi.stubEnv('CONTEXT', '');
    expect(() => resolve({})).not.toThrow();
  });
});
