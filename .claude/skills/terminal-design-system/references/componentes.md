# Componentes (`src/components/`)

| Componente | Função | Observação |
| --- | --- | --- |
| `shell/SiteShell` | Header → CommandBar → Window → Footer | todas as páginas passam por ele |
| `shell/Window` | moldura com bolinhas e `~/caminho` | uma por superfície |
| `shell/Breadcrumb`, `ViewActions` | caminho; par "ver no terminal / abrir página própria" | vêm de `routes.ts` |
| `ui/SectionTitle` | título de seção (`##` ou numeração) | mono, peso/tamanho |
| `ui/Card` | sub-painel (borda 1px, `--surface-2`) | não use sombra |
| `ui/Chip` | etiqueta curta (tecnologia, ano, status) | cor segue o significado |
| `ui/DataTable` | tabela rica (semestres, disciplinas) | vira cards abaixo de 600px |
| `ui/ActionLink` | link de ação (âmbar/azul) | ícone ↗ para externo |

Antes de criar componente novo, confirme que nenhum destes cobre. Estilos próprios de página vão no CSS do
domínio (`sections.css`, `services.css`, `resume.css`, `case-study.css`), sempre com tokens.
