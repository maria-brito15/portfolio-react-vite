// Peças comuns das fontes: fábrica de mock com cenários, carregamento sob demanda e a fonte
// "indisponível" que o modo `live` usa até as integrações existirem.
import type { PersonalFeed, Provenance } from '../../data/personal/types';
import type { PersonalSource } from './types';

// Datas fixas: o mock é determinístico e testável.
export const MOCK_FETCHED_AT = '2026-11-13T12:00:00.000Z';
export const MOCK_STALE_UPDATED_AT = '2026-11-12T06:00:00.000Z';

export const mockProvenance = (): Provenance => ({ source: 'mock', fetchedAt: MOCK_FETCHED_AT });

// `ok`: itens normais · `empty`: lista vazia · `error`: a leitura falha · `stale`: itens de um
// cache vencido (a fonte falhou e a interface avisa a data da última sincronização).
export type MockScenario = 'ok' | 'empty' | 'error' | 'stale';

const aborted = () => new DOMException('Aborted', 'AbortError');

export function mockSource<T>(items: T[], scenario: MockScenario = 'ok'): PersonalSource<T> {
  return {
    load: async (signal) => {
      if (signal?.aborted) throw aborted();
      if (scenario === 'error') throw new Error('mock: falha simulada da fonte');

      const feed: PersonalFeed<T> = {
        items: scenario === 'empty' ? [] : items,
        updatedAt: scenario === 'stale' ? MOCK_STALE_UPDATED_AT : MOCK_FETCHED_AT,
        stale: scenario === 'stale',
        source: 'mock',
      };

      return feed;
    },
  };
}

// Só importa o módulo da fonte na primeira leitura. Se o carregamento falhar, a próxima
// tentativa tenta de novo em vez de guardar o erro para sempre.
export function lazySource<T>(loader: () => Promise<PersonalSource<T>>): PersonalSource<T> {
  let loaded: Promise<PersonalSource<T>> | undefined;

  return {
    load: (signal) => {
      loaded ??= loader().catch((error: unknown) => {
        loaded = undefined;
        throw error;
      });

      return loaded.then((source) => source.load(signal));
    },
  };
}

// Modo `live` antes da integração existir: falha de forma explícita. Nunca cai no mock em
// silêncio, que mostraria dado fictício como se fosse real.
export function unavailableSource<T>(name: string): PersonalSource<T> {
  return {
    load: () => Promise.reject(new Error(`Fonte "${name}" ainda não está integrada.`)),
  };
}
