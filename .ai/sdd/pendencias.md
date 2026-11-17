# Pendências abertas
Painel de coisas que ficaram fora de uma tarefa. Não é fonte de verdade de aprovação; cada item diz quem decide.

| ID | Item | Origem | Quem decide |
| --- | --- | --- | --- |
| PEND-001 | `src/components/personal/qa.test.tsx` (lista de perfis e chave `portfolio-persona` do localStorage) e `src/data/personalDiscovery.test.tsx` ("sem persona") ainda carregam resquício de persona. Área da spec 008: não foi tocada. | Spec 001, T6.7 (V-06) | Duda, junto com a spec 008 |
| PEND-002 | 4 arquivos `public/fonts/fraunces-*.woff2` sem uso. | Spec 001, T5.7 | Duda; tarefa separada depois da T6.7 |
| PEND-003 | `src/components/dashboard/{PersonalSpace,ProfileSummary,StackOverview,AcademicSnapshot,ServicesPreview}.tsx` fora da composição da home. | Spec 001, T5.7 | Duda; tarefa separada depois da T6.7 |
| PEND-004 | O teste do `secretGuard` usa stub de `loadEnv`. | Spec 001 | Duda |
| PEND-005 | Apagar `GEMINI_API_KEY` e `GEMINI_MODEL` no painel do Netlify e revogar a chave (DQ-012). Só a Duda tem acesso. | Spec 001 | Duda |
