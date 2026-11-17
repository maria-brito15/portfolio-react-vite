# Pendências abertas
Painel de coisas que ficaram fora de uma tarefa. Não é fonte de verdade de aprovação; cada item diz quem decide.

| ID | Item | Origem | Quem decide |
| --- | --- | --- | --- |
| PEND-001 | **Resolvida na T7.3.** `src/components/personal/qa.test.tsx` (lista de perfis e chave `portfolio-persona` do localStorage) e `src/data/personalDiscovery.test.tsx` ("sem persona") ainda carregam resquício de persona. Área da spec 008: não foi tocada. | Spec 001, T6.7 (V-06) | Duda, junto com a spec 008 | 
| PEND-002 | **Resolvida na T7.1.** 4 arquivos `public/fonts/fraunces-*.woff2` sem uso. | Spec 001, T5.7 | Duda; tarefa separada depois da T6.7 | 
| PEND-003 | **Resolvida na T7.1.** `src/components/dashboard/{PersonalSpace,ProfileSummary,StackOverview,AcademicSnapshot,ServicesPreview}.tsx` fora da composição da home. | Spec 001, T5.7 | Duda; tarefa separada depois da T6.7 | 
| PEND-004 | **Resolvida na T7.2.** O teste do `secretGuard` usa stub de `loadEnv`. | Spec 001 | Duda | 
| PEND-005 | Apagar `GEMINI_API_KEY` e `GEMINI_MODEL` no painel do Netlify e revogar a chave (DQ-012). Só a Duda tem acesso. | Spec 001 | Duda |
| PEND-006 | **Resolvida na T7.4.** 5 pontos de `src/` ainda usam o `id` cru como reserva de texto (o FR-015 literal só vale em `src/content` e `src/i18n`, onde o guarda age): `src/components/paletteItems.ts:130`, `src/data/routes.ts:335`, `src/terminal/commands.tsx:196`, `src/terminal/extras/neofetch.tsx:34`, `src/terminal/extras/personalView.tsx:34`. Aceito no design (DQ-006). | Spec 001, revisão G-1 | Duda, nas specs 002 e 003 |
| PEND-007 | **Resolvida na T7.5** (é só um teste; EC-17 não pede bloqueio). Sem teste de execuções simultâneas do `verify` (EC-17). | Spec 001, revisão G-5 | Duda decide se vira tarefa |
| PEND-008 | **Decisão da Duda (2026-11-17): manter 60/120 s como meta e 90/180 s como teto; a variação entre execuções é esperada.** As metas de 60 s (suíte) e 120 s (`verify`) foram superadas em medições registradas (66,5 s e 63,8 s; 133,3 s e 128,1 s); o orçamento aprovado de 90 s e 180 s sempre foi respeitado. A variação entre execuções é grande (72 a 133 s). | Spec 001, revisão G-2 | Duda |
