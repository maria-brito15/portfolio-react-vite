// T4.3 (TD-008, FR-028): hidratar o HTML gerado por `renderRoute` não produz aviso nem erro
// recuperável; hidratar o HTML de OUTRA rota produz (o teste enxerga a divergência).
import { act } from '@testing-library/react';
import { renderRoute } from './entry-server';
import { mount } from './mount';
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';

// O jsdom não traz as streams da web que o `prerender` (react-dom/static) usa: empresta as do Node.
Object.assign(globalThis, {
  ReadableStream,
  TransformStream,
  WritableStream,
  TextEncoder,
  TextDecoder,
});

const ROUTES = [
  '/',
  '/sobre',
  '/projetos',
  '/curriculo',
  '/servicos',
  '/contato',
  '/terminal',
  '/en',
  '/en/projects',
  '/pagina-inexistente',
];

// Aviso do React que só existe porque o teste roda o servidor e o cliente no mesmo processo (os
// contextos guardam o último renderizador): não ocorre no navegador.
const SAME_PROCESS = /multiple renderers concurrently rendering the same context provider/;

async function hydrate(htmlOf: string, urlOf: string) {
  const { html } = await renderRoute(htmlOf);
  const container = document.createElement('div');
  const recoverable: unknown[] = [];
  const logged: string[] = [];
  const error = vi.spyOn(console, 'error').mockImplementation((...args) => {
    const line = args.map(String).join(' ');

    if (!SAME_PROCESS.test(line)) logged.push(line);
  });
  const warn = vi.spyOn(console, 'warn').mockImplementation((...args) => {
    const line = args.map(String).join(' ');

    if (!SAME_PROCESS.test(line)) logged.push(line);
  });

  container.innerHTML = html;
  document.body.append(container);
  window.history.replaceState(null, '', urlOf);

  let root!: ReturnType<typeof mount>;

  await act(async () => {
    root = mount(container, (e) => recoverable.push(e));
  });
  await act(async () => {});

  const result = { recoverable, logged, text: container.textContent ?? '', container };

  act(() => root.unmount());
  container.remove();
  error.mockRestore();
  warn.mockRestore();

  return result;
}

afterEach(() => window.history.replaceState(null, '', '/'));

describe('hidratação sobre o HTML pré-renderizado', () => {
  it.each(ROUTES)('%s hidrata sem aviso no console e sem erro recuperável', async (path) => {
    const { recoverable, logged } = await hydrate(path, path);

    expect(recoverable.map(String)).toEqual([]);
    expect(logged).toEqual([]);
  });

  it('o controle: hidratar o HTML de /sobre numa página /projetos é detectado', async () => {
    const { recoverable, logged } = await hydrate('/sobre', '/projetos');

    expect(recoverable.length + logged.length).toBeGreaterThan(0);
  });

  it('sem HTML dentro do #root cria a árvore do zero (vite dev)', async () => {
    const container = document.createElement('div');

    document.body.append(container);
    window.history.replaceState(null, '', '/sobre');

    let root!: ReturnType<typeof mount>;

    await act(async () => {
      root = mount(container);
    });
    expect(container.querySelector('main#conteudo')).not.toBeNull();
    act(() => root.unmount());
    container.remove();
  });
});
