# Personas: estado

Implementado em `T-PR1` a `T-PR7` (ver `tasks.md`). Requisitos em `requirements.md`.

| ID | Requisito | Estado |
| --- | --- | --- |
| PR-01 | Cinco personas como dado | ✅ `src/data/personas.ts`; `personas.test.ts` |
| PR-02 | Pergunta na primeira visita (home e terminal) | ✅ `PersonaPrompt.tsx`, `extras/persona.tsx` (`PersonaQuestion`); `PersonaPrompt.test.tsx`, `terminal/persona.test.tsx` |
| PR-03 | Pulável e não bloqueante | ✅ Enter vazio / botão "pular" / qualquer comando; testes nos dois arquivos acima |
| PR-04 | Escolha por número ou nome | ✅ `findPersona`, `personaAnswer`; `persona.test.tsx` ("número escolhe", "o nome ou apelido sozinho") |
| PR-05 | Persistência local | ✅ `src/hooks/usePersona.tsx`; `usePersona.test.tsx` (inclui `localStorage` bloqueado) |
| PR-06 | Comando de troca (`visitante`/`visitor`, alias `persona`) | ✅ `extras/persona.tsx`; `persona.test.tsx`. Mudou de `whoami` porque já é o nome de `sobre` |
| PR-07 | Rotas diretas `/r/<persona>` | ✅ `App.tsx` (`PersonaHome`); `personaRoutes.test.tsx` |
| PR-08 | Rotas só em `routes.ts` | ✅ geradas de `personas.ts` em `routes.ts`; `/r/xyz` dá 404 (teste) |
| PR-09 | HTML e SEO das rotas | ✅ `npm run build` grava `dist/r/{rh,tech,professor,amigo,cliente}.html` com `noindex` e canonical `/`; nenhuma `/r/` no `sitemap.xml` |
| PR-10 | Lente: ordem e destaque | ✅ `Sidebar.tsx`, `QuickAccess.tsx`; `PersonaLens.test.tsx` (nada some) |
| PR-11 | Lente: sugestões e chamado | ✅ sugestões após a escolha no terminal; chamado na faixa da home |
| PR-12 | Sem dado inventado | ✅ só textos de interface; a lente só reordena e marca |
| PR-13 | Paridade de idioma | ✅ `personas.test.ts` (PT/EN e chaves de `ui.persona`); `PersonaPrompt.test.tsx` (troca de idioma) |
| PR-14 | Estilo único e contraste | ◐ só tokens existentes; `contrast.mjs` passa; capturas em escuro e claro conferidas. **Falta** olhar os temas dracula, solarized e amber |
| PR-15 | Acessibilidade | ◐ região `aria-live`, botões nativos, nenhuma animação nova; fluxo por teclado no terminal testado. **Falta** passar pela faixa da home só com teclado e leitor de tela |
| PR-16 | Impressão do currículo intacta | ✅ em mídia `print`, com e sem persona: barra lateral oculta e texto do `main` idêntico (4894 caracteres) |

Contagem: ✅ 14 · ◐ 2 · ❌ 0 · ❔ 0.

## Evidência da verificação

- `npm run lint`: sem erros. `npm run build`: ok. `tsc --noEmit`: ok.
- Testes: na última suíte completa, 477 de 478 passaram (depois entraram 2 testes de idioma, que passam); o que falhou foi `Overlays.test.tsx` ("Ctrl+K abre…"), um teste de foco que estoura o tempo com a suíte inteira rodando e passa quando rodado sozinho (visto duas vezes). Não foi alterado por esta feature.
- Capturas 1440×900 e 390×844, escuro e claro, em `/`, `/terminal`, `/r/cliente` e `/curriculo`: sem rolagem horizontal e sem erro de console (24 capturas).
- `sweep.mjs`: varredura limpa.

## Não verificado

- `check-i18n.mjs` não rodou: quebra ao importar `src/i18n/ws` (resolução de módulo no próprio script). A paridade PT/EN do bloco novo foi coberta por teste.
- Temas dracula, solarized e amber; leitor de tela; deploy real na Netlify (`/r/tech` servido sem `.html`).
