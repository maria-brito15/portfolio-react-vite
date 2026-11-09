---
name: verify-site
description: >
  Verificar o portfólio antes de dizer "pronto": lint, testes, build, varredura
  de regras (estilo único, variáveis CSS, rotas, SDD), capturas 1440×900 e
  390×844 em claro/escuro, console sem erro, sem rolagem horizontal, impressão
  do currículo. Use ao terminar qualquer tarefa de código ou visual.
when_to_use: >
  Antes de commit, PR ou resposta final de qualquer mudança em src/. Também
  quando pedirem "testa", "confere", "roda tudo" ou "tira print".
argument-hint: "[rápido | completo]"
allowed-tools: Bash(npm run *) Bash(node .claude/skills/*) Bash(npx playwright *) Read Grep Glob
effort: medium
---

# verify-site

Nada está pronto até a evidência estar na resposta: comando, resultado, e o que **não** foi verificado.

## Mapa de leitura

| Modo | O que fazer | Leia |
| --- | --- | --- |
| rápido (padrão) | Portão 1 e 2 | — |
| completo (mudança visual, rota ou release) | Portões 1 a 3 | `references/capturas.md` |
| falha que não entendo | — | `references/falhas-comuns.md` |

## Portão 1 — automático

```bash
npm run lint && npm test && npm run build
node .claude/skills/verify-site/scripts/sweep.mjs
```

Todos precisam sair com código 0. Falhou: conserte a causa; **nunca** pule, apague ou enfraqueça um teste.
Reporte as contagens reais ("N testes passaram"), não "tudo certo".

## Portão 2 — regras específicas (conforme o que mudou)

- Textos: `node .claude/skills/content-integrity/scripts/check-i18n.mjs`
- Cores: `node .claude/skills/terminal-design-system/scripts/contrast.mjs`
- Spec: `node .claude/skills/sdd-spec-sync/scripts/gap-summary.mjs`

## Portão 3 — no navegador (mudança visual ou de rota)

Siga `references/capturas.md`: 1440×900 e 390×844, claro e escuro, console limpo, `scrollWidth === innerWidth`.
Olhe as imagens de verdade antes de afirmar que estão certas.

## Relato final

Formato: **Rodei** (comandos) · **Passou/Falhou** (números) · **Não verifiquei** (o que ficou de fora) ·
**Riscos** (se houver). Sem adjetivos de confiança.
