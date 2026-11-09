# Receitas de teste (Vitest + Testing Library)

Arquivos de referência: `src/terminal/sections.test.jsx`, `Terminal.test.jsx`,
`redirect.test.jsx`, `src/components/shell/SiteShell.test.jsx`.

## Montar a página e digitar

```jsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';

beforeEach(() => sessionStorage.clear());      // histórico e "primeira visita" vivem aqui

const input = () =>
  screen.getByRole('textbox', { name: /Linha de comando do terminal|terminal command line/i });

it('curriculo mostra o índice', async () => {
  const user = userEvent.setup();
  renderApp('/');                              // home = terminal
  await user.type(input(), 'curriculo{Enter}');
  expect(document.querySelector('.term-log')).toHaveTextContent(/competencias/);
});
```

## Padrões úteis

- **Inventário:** os testes de `sections.test.jsx` varrem nomes duplicados, ajuda x comandos reais e
  atalhos clicáveis. Se você adicionou comando, eles já cobrem o básico.
- **Funções puras primeiro:** `parse`, `complete`, `runCommand`, `resolveTarget`, `sectionsOf`
  testam-se sem renderizar.
- **Idioma:** clique no botão de idioma e confira que a saída é redesenhada (sem digitar de novo).
- **Carregamento/cancelamento:** use `vi.useFakeTimers()` como em `redirect.test.jsx`; confirme que
  `window.location.pathname` só muda depois do progresso e que `Esc` cancela.
- **Replay:** desmonte e monte de novo com o histórico em `sessionStorage`; a URL não pode mudar.
- **Clique em item do índice:** `await user.click(screen.getByRole('button', { name: /\[2\]/ }))`.
- **Matriz de páginas:** teste parametrizado sobre `routes.filter((r) => sectionsOf(r.id).length)`.

## Antes de encerrar

`npm run lint && npm test && npm run build`
