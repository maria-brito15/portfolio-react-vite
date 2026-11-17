// T2.4 (TD-007, TD-008): o roteador aceita `initial` e não lê `window` na renderização. Este arquivo
// roda no projeto `unit` (Node, sem `window`), então um acesso a `window` lançaria ReferenceError.
import { createElement, type ComponentType, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { RouterProvider, useRouter } from './router';

// O provedor exige `children`; sem JSX, ele entra como argumento de createElement.
const Provider = RouterProvider as ComponentType<{ initial?: string; children?: ReactNode }>;

function Probe() {
  const { path, hash, search, idx, canGoBack } = useRouter();

  return createElement('p', null, JSON.stringify({ path, hash, search, idx, canGoBack }));
}

const render = (initial?: string) => {
  const html = renderToString(createElement(Provider, { initial }, createElement(Probe)));
  const json = html.replace(/<[^>]+>/g, '').replaceAll('&quot;', '"');

  return JSON.parse(json) as Record<string, unknown>;
};

describe('RouterProvider fora do navegador', () => {
  it('não há window neste ambiente (a prova do teste)', () => {
    expect(typeof window).toBe('undefined');
  });

  it('com `initial`, parte dele e não lê window nem document', () => {
    expect(render('/en/projects')).toEqual({
      path: '/en/projects',
      hash: '',
      search: '',
      idx: 0,
      canGoBack: false,
    });
  });

  it('guarda a busca e a âncora do endereço inicial', () => {
    expect(render('/projetos?x=1#lista')).toMatchObject({
      path: '/projetos',
      search: '?x=1',
      hash: '#lista',
    });
  });

  it('/en/ vale /en e a raiz fica', () => {
    expect(render('/en/')).toMatchObject({ path: '/en' });
    expect(render('/')).toMatchObject({ path: '/' });
    expect(render('/projetos/')).toMatchObject({ path: '/projetos' });
  });

  it('sem `initial` e sem window não quebra: a localização é a raiz', () => {
    expect(render()).toMatchObject({ path: '/', hash: '', search: '', idx: 0 });
  });
});
