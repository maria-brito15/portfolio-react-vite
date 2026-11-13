# Home adaptativa por persona: estado

Fase 1 do `roadmap-personas-site.md`. Feito em cima de `personas` e `trilhas`; nada daquilo foi
reimplementado. Fonte única da composição: `src/data/personaHome.ts`.

| ID | Requisito | Estado |
| --- | --- | --- |
| HP-01 | Composição declarativa (blocos, ordem, títulos, ações) por persona, com padrão sem persona | ✅ `personaHome.ts`; `personaHome.test.ts` |
| HP-02 | Um só compositor; sem `persona === 'x'` espalhado | ✅ `PersonaHomeSections.tsx` |
| HP-03 | Introdução e ação principal por persona, só texto de interface | ✅ `Home.tsx`; `HomePersona.test.tsx` |
| HP-04 | Nada some: o que sai da composição continua nos atalhos | ✅ teste compara os atalhos de cada persona com os do padrão |
| HP-05 | PT e EN completos | ✅ teste de dados + teste em EN |
| HP-06 | Sem dado inventado | ✅ blocos novos leem `resume`, `academics`, `projects`, `services` |
| HP-07 | Desktop e celular | ✅ 1440×900 e 390×844, cinco personas + padrão, escuro: sem rolagem horizontal, sem erro de console |
| HP-08 | Acessibilidade | ◐ títulos `h2` com `aria-labelledby`, links nativos. **Falta** leitor de tela e tema claro/dracula/solarized/âmbar |

## O que cada persona vê primeiro

- **rh:** resumo do currículo, formação, experiências, reconhecimentos, competências. Ação: currículo.
- **tech:** projetos técnicos (estudo de caso primeiro), stack contada dos projetos, GitHub. Ação: projetos.
- **professor:** formação, marcos, disciplinas listadas, projetos da linha do tempo acadêmica. Ação: acadêmico.
- **cliente:** serviços, cases, perguntas frequentes, projetos. Ação: orçamento (`/servicos#contato`).
- **amigo:** jogos e terminal, projetos pessoais. Ação: sobre.

## Decisões

- O botão de ação saiu da faixa "Vendo como" e foi para o topo da home (evitava o chamado repetido).
- Chaves `ctaProjects/ctaResume/ctaTerminal` de `ws.home` saíram: os botões padrão agora vêm de `personaHome.ts`.

## Limites conhecidos

- **"Processo de trabalho" (cliente)** não existe nos dados do site; não foi inventado. Falta o texto da Duda.
- Projetos de `tech`, `professor` e `amigo` são listas de ids escritas à mão (ou derivadas de `academics`); a perspectiva por persona em cada card é a Fase 2.
- JS inicial: 136,33 → 139,07 kB gzip (+2,7). Os blocos novos poderiam virar `lazy`.
- Não verificado: tema claro e demais temas, leitor de tela, impressão, deploy.
