# SPIKE-002 (T0.1): pré-render dentro do `vite build`
**Data:** 2026-11-17 · **Autor:** Claude · **Tarefa:** T0.1 da spec 002 (TD-008) · **Natureza:** só medição, fora do repositório; nada do spike foi commitado e nenhum código do site mudou. Não é o SPIKE-001 do requirements (tamanho de JS e conteúdo do HTML), que continua como está.

## Como medi (e limites)
- **Onde:** cópia do projeto (`package.json`, `package-lock.json`, `vite.config.ts`, `index.html`, `src`, `scripts`) numa pasta do scratchpad, com `npm ci --ignore-scripts` (420 pacotes). Versões: Node 24.15.0, Vite 6.4.5, React/React DOM 19.
- **Rota:** `/sobre` (e `/projetos`, para ter duas). O spike usa uma árvore mínima (casca fora do `Suspense`, página `React.lazy` dentro, `routes` lida da tabela real de `src/data/routes.ts`). Ele **não** prova o `App` real: ver o critério 3 e a ressalva.
- **Navegador:** não há Chromium instalado e não baixei um. A hidratação foi medida com `jsdom` + `hydrateRoot` (Node). **A prova num navegador de verdade é o e2e da T5.2**; este teste só mostra o mecanismo.
- **Arquivos do spike (todos fora do repo):** `vite.config.ts` (plugin com `closeBundle`), `src/entry-server.tsx`, `src/spike/*`, `hydrate.mjs`, `real.mjs`.

## As 6 respostas

### 1) Como o SSR roda por dentro de `vite build`
O plugin tem `closeBundle` assíncrono. Nele chama `build()` do próprio Vite com `build.ssr: 'src/entry-server.tsx'` e `outDir: '.prerender'`, faz `import()` do `entry-server.js` gerado (ESM, o `package.json` é `"type": "module"`) e chama `renderRoute(path)`. Funcionou dentro de **um único** `vite build` (exit 0, 3,5 s de build do Vite com o spike mínimo; ~11 s de relógio com `npx`).

### 2) Manifesto e `modulepreload`
Com `build.manifest: true` o `dist/.vite/manifest.json` **já existe no `closeBundle`**. A chave do chunk lazy é o caminho do fonte (`src/spike/SpikePage.tsx`), com `file: static/SpikePage-<hash>.js`. O plugin escreveu `<link rel="modulepreload" href="/static/SpikePage-<hash>.js">` no `<head>` do `sobre.html`. Para o site real a T4.2 precisa mapear rota → arquivo(s) de fonte para achar a chave (o `lazyPages.ts` já é essa tabela).

### 3) `prerender` de `react-dom/static` com `React.lazy`
`prerender` **espera o `lazy`**: o HTML saiu com o `<h1>` e o parágrafo da página lazy dentro de `<!--$-->…<!--/$-->`, não com o `fallback`. Lê-se `prelude` (Web Stream) com `new Response(prelude).text()`. **Ressalva:** isso vale para a árvore mínima. Com o `App` real, `prerender` falhou: `ReferenceError: window is not defined`. Origem confirmada em `src/router.tsx`: o inicializador de `RouterProvider` (`readLocation`) lê `window.location` e `window.history`. `LanguageProvider` (`localStorage` no inicializador) e `useTheme` (`document`) são os próximos da fila. Isso é esperado e é exatamente o que as tarefas T2.4 (`initial` no `RouterProvider`), T2.5 e T3.3 resolvem; não é inviabilidade, mas **o `App` de hoje não pré-renderiza**.

### 4) Como `routes.ts` carrega no contexto do config sem `import.meta.env`
`vite.config.ts` importou `routes` de `src/data/routes.ts` direto (19 rotas) e o build passou. Isso funciona porque `src/services/integrations/mode.ts` já usa `import.meta.env?.VITE_PERSONAL_SOURCE ?? process.env.VITE_PERSONAL_SOURCE`. No build aninhado, o mesmo arquivo é empacotado com o `import.meta.env` do Vite. **Consequência para a T2.1:** o plugin (Node) e o cliente leem `VITE_PERSONAL_SOURCE` por caminhos diferentes (`process.env` no config, `import.meta.env` no build aninhado); a extração de `routeStatus` deve garantir que os dois concordam, com teste.

### 5) Build aninhado sem recursão, sem `public/`, com `define`/`react()` explícitos
`build({ configFile: false, plugins: [react()], define: { __BUILD__ }, build: { ssr, outDir: '.prerender', copyPublicDir: false, emptyOutDir: true } })` **não** instanciou o plugin de pré-render (nenhum laço; o guarda `config.build.ssr` no plugin ficou só como cinto de segurança). `public/` não foi copiado para `.prerender`. Sem os guardas (`personalGuard`, `contentGuard`, `secretGuard`), que já rodaram no build do cliente.

### 6) Limpeza
`finally` apagou `.prerender/` e `dist/.vite/` (conferido: `ls -d .prerender` falhou com "No such file"; `dist/` ficou só com `index.html`, `sobre.html`, `projetos.html` e `static/`). Falta provar o caminho de **falha** do build (o `finally` o cobre; a T4.2 tem o teste "limpeza com sucesso ou falha").

## Hidratação (medida com jsdom)
- HTML gerado para `/sobre`, hidratado com a mesma árvore e a mesma rota: **0 erros** em `console.error` e **0** `onRecoverableError`; `h1` = "Pagina sobre".
- **Controle** (hidratar o HTML de `/sobre` com a rota `/projetos`): `Hydration failed because the server rendered text didn't match the client`, **1** erro recuperável, `h1` = "Pagina projetos". O teste portanto enxerga uma divergência quando ela existe.

## Observação sem conclusão
O chunk `index` do spike mínimo mediu **72,2 KB gzip** (React DOM, `routes.ts` e o que ele importa). Não decompus o número; não afirmo quanto é React e quanto é dado de rota. É relevante para a meta de 100 KB (T5.3) e fica registrado só como ponto de partida.

## Evidência
```
Claim:     o pré-render por rota fecha dentro de um único `vite build`, com manifesto, modulepreload e limpeza
Command:   (no scratchpad/spike) npm ci --ignore-scripts --no-audit --no-fund; npx vite build; ls -a dist dist/static; ls -d .prerender
Exit code: 0 (npm ci); 0 (vite build); ls -d .prerender falhou como esperado (pasta não existe)
Summary:   dist/sobre.html e dist/projetos.html com <h1> e <main> preenchidos e modulepreload; .prerender/ e dist/.vite/ removidos; build de 3,5 s no Vite
Verdict:   PASS (mecanismo)
```
```
Claim:     hidratar o HTML gerado, com a mesma árvore, não produz aviso; uma divergência produz
Command:   node hydrate.mjs ; node hydrate.mjs mismatch   (jsdom + hydrateRoot via vite ssrLoadModule)
Exit code: 0 ; 0
Summary:   igual: {"errors":[]}; divergente: 1 erro "Hydration failed because the server rendered text didn't match the client"
Verdict:   PASS (mecanismo; não substitui o navegador real da T5.2)
```
```
Claim:     o App de hoje não pré-renderiza
Command:   node real.mjs   (prerender de RouterProvider > LanguageProvider > ThemeProvider > App, via vite ssrLoadModule)
Exit code: 0 (o script captura o erro e imprime)
Summary:   "FALHOU: ReferenceError window is not defined" (src/router.tsx, readLocation)
Verdict:   FAIL esperado: confirma o trabalho das T2.4, T2.5 e T3.3; não muda o veredito do spike
```

## Veredito
**Viável com ressalva.**
- **Viável:** o pré-render roda **dentro do `vite build`** (critério da tarefa: "se só fechar fora do `vite build`, parar"; não é o caso). `npm run verify`, que só executa `vite build`, cobrirá o pré-render sem mudar o runner da 001. Manifesto, `modulepreload`, `lazy`, build aninhado sem laço e limpeza funcionaram.
- **Ressalvas** (nenhuma exige voltar à Duda; todas já têm tarefa):
  1. o `App` real falha em Node por `window` no `RouterProvider` e por `localStorage`/`document` nos provedores: T2.4, T2.5, T3.3 e T4.1 (a casca e as páginas só leem dado determinístico);
  2. a hidratação sem aviso só foi medida em jsdom: o e2e da T5.2 em navegador real é a prova;
  3. o modo como `VITE_PERSONAL_SOURCE` chega ao plugin e ao build aninhado precisa de teste na T2.1;
  4. a decomposição do chunk de 72,2 KB fica para a T3.5/T5.3.
- **Efeito nas Fases 4 e 5:** continuam como planejadas. Nenhuma mudança em requisito, design ou tarefa é necessária.
