import { act, renderHook, waitFor } from '@testing-library/react';
import { mockBooks } from '../services/integrations/hardcover/mock';
import { mockSource } from '../services/integrations/source';
import type { PersonalSource } from '../services/integrations/types';
import { usePersonalBooks, usePersonalSource } from './usePersonal';

describe('usePersonalSource (CL-11)', () => {
  it('começa carregando e termina pronto, com o feed', async () => {
    const source = mockSource([1, 2]);
    const { result } = renderHook(() => usePersonalSource(source));

    expect(result.current.state).toEqual({ status: 'loading' });
    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    expect(result.current.state).toMatchObject({ feed: { items: [1, 2], stale: false } });
  });

  it('lista vazia é "pronto" com zero itens (a página mostra o estado vazio)', async () => {
    const source = mockSource<number>([1], 'empty');
    const { result } = renderHook(() => usePersonalSource(source));

    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    expect(result.current.state).toMatchObject({ feed: { items: [] } });
  });

  it('dado vencido chega como "pronto" com stale', async () => {
    const source = mockSource([1], 'stale');
    const { result } = renderHook(() => usePersonalSource(source));

    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    expect(result.current.state).toMatchObject({ feed: { stale: true } });
  });

  it('falha da fonte vira erro, e "tentar de novo" volta a carregar e recupera', async () => {
    let fail = true;
    const source: PersonalSource<number> = {
      load: () => (fail ? Promise.reject(new Error('fora')) : mockSource([7]).load()),
    };
    const { result } = renderHook(() => usePersonalSource(source));

    await waitFor(() => expect(result.current.state.status).toBe('error'));

    fail = false;
    act(() => result.current.retry());
    expect(result.current.state.status).toBe('loading');
    await waitFor(() => expect(result.current.state.status).toBe('ready'));
  });

  it('desmontar cancela a leitura e não atualiza o estado depois', async () => {
    let signal: AbortSignal | undefined;
    let resolve: (() => void) | undefined;
    const source: PersonalSource<number> = {
      load: (s) => {
        signal = s;

        return new Promise((done) => {
          resolve = () => done({ items: [1], updatedAt: '', stale: false, source: 'mock' });
        });
      },
    };
    const { unmount } = renderHook(() => usePersonalSource(source));

    unmount();
    expect(signal?.aborted).toBe(true);
    expect(() => resolve?.()).not.toThrow();
  });
});

describe('usePersonalBooks', () => {
  it('lê a fonte de livros (mock nos testes)', async () => {
    const { result } = renderHook(() => usePersonalBooks());

    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    expect(result.current.state).toMatchObject({ feed: { items: mockBooks, source: 'mock' } });
  });
});
