# Checklist: mudar cor ou tema

- [ ] Token novo/alterado em `:root` **e** `[data-theme='light']`
- [ ] `node .claude/skills/terminal-design-system/scripts/contrast.mjs` → exit 0
- [ ] `grep -rn "#[0-9a-fA-F]\{3,8\}" src/styles/*.css` fora de `tokens.css` → nada novo
- [ ] `npm test -- styles`
- [ ] capturas 1440×900 e 390×844, claro e escuro, sem erro de console
- [ ] `@media print` do currículo intacto
