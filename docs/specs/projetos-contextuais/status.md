# Projetos contextuais por persona: estado

Fase 2 do `roadmap-personas-site.md`. Em cima de `personas` e `personas-home`. Fonte única dos
projetos: `src/data/projects.tsx` (não foi tocado). Camada de apresentação:
`src/data/projectPerspectives.ts`.

| ID | Requisito | Estado |
| --- | --- | --- |
| PP-01 | Perspectiva como dado, por projeto e persona; projeto continua existindo uma vez | ✅ `projectPerspectives.ts`; `projectPerspectives.test.ts` |
| PP-02 | Cartões da página Projetos e da home usam a persona ativa | ✅ `ProjectLens.tsx`, `ProjectCard.tsx`, `FeaturedProjects.tsx`; `ProjectLens.test.tsx` |
| PP-03 | Fallback: sem persona ou sem perspectiva, vale a apresentação padrão; nenhum projeto some | ✅ testes (ShortURL e File Name Standardizer seguem iguais; contagem de cartões igual) |
| PP-04 | Descrição padrão, links, repositório e estudo de caso preservados | ✅ a perspectiva vem acima da descrição, que continua inteira |
| PP-05 | Só fatos documentados | ◐ cada texto foi conferido contra `projects.tsx`, `resume.ts` e o estudo de caso; teste só valida forma (tamanho, idiomas, links existentes). **A Duda deve ler os 20 textos** |
| PP-06 | PT e EN | ✅ teste de dados e de renderização em EN |
| PP-07 | Ação em destaque só para link que o projeto tem | ✅ teste (`action`: estudo de caso ou repositório) |
| PP-08 | Visual coeso, celular, sem rolagem horizontal | ✅ 1440×900 e 390×844 (tech, cliente, amigo, professor em EN, rh), tema escuro; ◐ tema claro e demais temas não vistos |
| PP-09 | Acessibilidade | ◐ `aside` com nome acessível, sem controle novo, animação só com `prefers-reduced-motion: no-preference`. **Falta** leitor de tela |

## Projetos com perspectiva (as cinco personas)

EcoShop, WhatsApp Dispatcher, Planoriza e Portfólio. ShortURL e File Name Standardizer
(variante `minor`, uma linha) ficam com a apresentação padrão.

## Diferença entre as personas

- **rh:** o que demonstra (reconhecimento, testes, CI/CD, SDD); nada sobre trabalho em equipe,
  porque não está documentado para estes projetos.
- **tech:** arquitetura e decisões (cache em duas camadas, Zod, fila BullMQ, idempotência); destaca o
  estudo de caso ou o repositório.
- **professor:** contexto acadêmico (finalista, v1 e v2 comparáveis, conceitos de DDD/Clean
  Architecture, o que é implementação e o que é análise). "Objetivos de aprendizagem" não estão
  documentados, então não aparecem.
- **cliente:** problema e solução; avisa que a implementação do WhatsApp Dispatcher é parcial.
  Sem preço, prazo ou resultado de projeto.
- **amigo:** o que faz, a história e curiosidades; sem jargão.

## Limites

- Os textos são escritos à mão por projeto; projeto novo precisa de entrada nova (sem ela, fica padrão).
- Sem alternância manual de perspectiva (decisão: a persona ativa escolhe; menos controles).
- JS inicial: 139,07 → 143,67 kB gzip (+4,6), quase tudo texto das perspectivas nos dois idiomas.
  Dá para carregar sob demanda.
- Home do `tech`, `amigo` etc. ainda usa listas de ids em `personaHome.ts` (não mudou).
