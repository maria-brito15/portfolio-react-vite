# Trilhas: tarefas

Uma tarefa por commit; a mensagem leva o ID. Plano em `design.md`.

| ID | Tarefa | Requisitos | Depende de | Feito quando |
| --- | --- | --- | --- | --- |
| T-TR1 | `trails.ts` (dados das cinco trilhas e dos segredos) e teste de validação | TR-01, TR-02, TR-03, TR-04, TR-05, TR-19 (campo `style`) | — | Teste: ids de rota, âncora e comando existem; 4 a 6 passos; último é `agir`; PT/EN completos; nenhum dígito digitado nos textos; âncoras presentes nas páginas renderizadas |
| T-TR2 | `events.ts`, `storage.ts`, `TrailProvider.tsx`; emissores na sessão do terminal e nos alternadores de tema e idioma | TR-10, TR-14, TR-15, TR-16, TR-17, TR-18, TR-20 (detecção) | T-TR1 | Testes: progresso por trilha persiste e sobrevive a troca de persona; cada tipo de passo conclui como o plano diz; replay não emite; `localStorage` bloqueado funciona |
| T-TR3 | `Tour.tsx` (lazy): anel, cartão, navegação, foco, Esc, alvo ausente, movimento reduzido, celular | TR-07, TR-11, TR-12, TR-13, TR-22, TR-23, TR-24 | T-TR2 | Testes: abre, avança, volta, sai com Esc e devolve o foco; alvo ausente mostra o cartão sem destaque; todos os alvos de todas as trilhas existem |
| T-TR4 | `TrailCard.tsx` na home, com convite em `/r/<persona>` | TR-06, TR-07, TR-08, TR-10, TR-21 (selo), TR-26 | T-TR3 | Testes: sem persona não aparece; "Começar/Continuar/Refazer"; "agora não" some e `trilha` traz de volta; `/r/<persona>` convida sem iniciar |
| T-TR5 | Comando `trilha`/`trail` e entrada em `catalog.ts` | TR-09 | T-TR2 | Testes: sem argumento mostra progresso; `iniciar`, `continuar`, `reiniciar`, `sair`; sem persona explica; Tab, ajuda e catálogo |
| T-TR6 | Gamificação por estilo: checklist, barra, conquistas e contador; aviso de desbloqueio | TR-19, TR-20, TR-21 | T-TR4 | Testes: rh/tech só checklist; professor/cliente barra; só o amigo vê conquistas; aviso em `aria-live` |
| T-TR7 | Verificação: lint, testes, build, peso do JS inicial, capturas 1440×900 e 390×844 nos cinco temas, impressão, `status.md`, README das specs | TR-24, TR-25, TR-26, TR-27 | T-TR6 | Evidência no `status.md`; JS inicial ≤ +3 kB gzip (ou lazy adicional) |

Ordem: T-TR1 → T-TR2 → T-TR3 → T-TR4 → T-TR5 → T-TR6 → T-TR7.
