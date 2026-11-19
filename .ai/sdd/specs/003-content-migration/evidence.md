# 003 Content migration, Evidência

## Linha de base (T1.1, 2026-11-19)
Estado: branch `rebuild/sdd`, antes de qualquer arquivo da 003 em `src/`. O working tree tinha alterações não commitadas da 002 (não são da 003).

### T1.1 Linha de base: build, tempos e arquivos antigos
```
Claim:     O estado atual passa no verify e no build; tempos, chunks e hashes dos 8 módulos antigos estão registrados.
Command:   npm run verify ; npx vite build ; git hash-object src/data/{projects.tsx,experiences.ts,academics.ts,resume.ts,skillTimeline.ts,profile.ts,now.ts,uses.ts}
Exit code: 0 ; 0 ; 0
Summary:   verify OK em 112,5 s (orçamento 180 s). Etapas (s): formatação 7,8; lint 21,0; tipos 15,3; testes 60,3; geração 8,1. vite build OK.
Verdict:   PASS
```

**Etapas 4 e 5 (última linha de `.verify/times.jsonl`):** testes 60,3 s; geração 8,1 s; total 112,5 s.

**Maiores chunks de `dist/static` (bytes, sem gzip):**
| Arquivo | Tamanho |
| --- | --- |
| `index-*.js` (entrada) | 304 176 (gzip 97,80 kB) |
| `CaseStudy-*.js` | 113 413 |
| `TerminalPage-*.js` | 52 409 |
| `SectionPage-*.js` | 15 109 |
| `usePersonal-*.js` | 14 328 |
| `services-*.js` | 12 275 |
| `resume-*.js` | 10 197 |
| `CommandPalette-*.js` | 8 225 |

**Hashes dos módulos antigos (`git hash-object`), a repetir no fechamento (T6.1):**
| Arquivo | Hash |
| --- | --- |
| `src/data/projects.tsx` | `0435ccaad4a116a9aa699aa5df4b3042f3b22d08` |
| `src/data/experiences.ts` | `07804e66a417f63dcce2f0b9ed716f562ba85812` |
| `src/data/academics.ts` | `065f44fc3709291d8339c80718fdb4528d9f2a4d` |
| `src/data/resume.ts` | `d04f82401e64156402aa9ad26ee2b93844668cb8` |
| `src/data/skillTimeline.ts` | `6d547dfd77d36f6fb10704aeb4499367adb94c55` |
| `src/data/profile.ts` | `08ea85725bd7cac4fa9c64ea37331f23c0d3ec02` |
| `src/data/now.ts` | `2e6ad2d50a3a6e386283d6e53be186fa858832c4` |
| `src/data/uses.ts` | `465993b2325c3a1c5589b224f773bed45ae3162f` |

Observação: o `verify` avisou "AUMENTO de 29 % na etapa geração (6,3 s → 8,1 s)"; é variação de execução, dentro do orçamento. Os arquivos `.verify/` e `dist/` são ignorados pelo git.
