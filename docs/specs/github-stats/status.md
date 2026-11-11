# GitHub em números: estado

Feature pedida diretamente pela Duda e implementada antes da spec formal; este arquivo registra o que existe.

| ID | Requisito | Estado |
| --- | --- | --- |
| GH-01 | Mostrar repositórios públicos, estrelas, contribuições (12 meses), seguidores e linguagens de `maria-brito15`, lidos ao vivo | ✅ `src/services/github.ts`, `src/components/GithubStats.tsx` |
| GH-02 | Estados de carregando, erro (com "tentar de novo") e métrica indisponível, sem número inventado | ✅ |
| GH-03 | Painel na página Sobre e versão compacta no comando `stats`, em PT e EN | ✅ |
| GH-04 | Cache de 1 h na sessão para respeitar o limite da API sem token | ✅ |
| GH-05 | Visual só com tokens existentes, sem degradê, responsivo, fora da impressão | ✅ revisão visual em navegador pendente |

Notas:
- Estrelas e linguagens contam só repositórios próprios (sem forks); a linguagem é a principal de cada repositório, não bytes.
- Contribuições vêm de `github-contributions-api.jogruber.de` (terceiro); a REST do GitHub não expõe esse total.
- Testes não usam a rede: `src/test/setup.ts` simula `fetch`.
