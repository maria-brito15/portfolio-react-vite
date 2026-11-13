# Experiências por persona: estado

Fase 4 do `roadmap-personas-site.md`. Cada experiência é um bloco da home (`HomeBlockId` em
`src/data/personaHome.ts`), carregado sob demanda (`lazy`) por `PersonaHomeSections.tsx`. Código em
`src/experiences/<persona>/`; dados em `src/data/architecture.ts`, `clientJourney.ts`, `explore.ts` e
`src/utils/academicTimeline.ts`. Testes: `src/data/experiences.test.ts`, `src/experiences/experiences.test.tsx`.

| ID | Requisito | Estado |
| --- | --- | --- |
| EP-01 | Tech: explorador de arquitetura do WhatsApp Dispatcher (9 componentes, 11 ligações, decisões, trade-offs, link por seção do estudo de caso) | ✅ testes de dados (ligações, âncoras PT/EN, tecnologias) e de interação |
| EP-02 | Tech: alternativa em texto do diagrama | ✅ lista das ligações em `<details>` |
| EP-03 | Tech: sem invenção (integração com o WhatsApp marcada como não concluída; sem front-end/API/auth) | ✅ `status` no nó + aviso na tela |
| EP-04 | RH: visão profissional (competências por categoria, experiência em ordem inversa, destaques, currículo e contato) | ✅ lê `resume`, `experiences`, `projects` |
| EP-05 | Professor: linha do tempo por ano com filtro (disciplinas com notas, projetos, atividades, cursos) | ✅ `buildAcademicTimeline` reusa `activitiesByYear` e `summarizeSemester`; teste confere contagens iguais às da página Acadêmico |
| EP-06 | Cliente: jornada necessidade → serviço → exemplo → dúvidas → contato | ✅ aponta por posição/id para `services.tsx` e `projects.tsx`; teste confere |
| EP-07 | Amigo: Modo Explorar com dica em dois níveis, achados da trilha, sugestão após achar e recomeço | ✅ `resetSecrets` novo em `TrailProvider`; zera só segredos |
| EP-08 | PT e EN | ✅ teste em EN (tech) + capturas EN no celular |
| EP-09 | Nada some / nada duplicado: `ProfileSummary` perdeu o cartão de competências e `AcademicSnapshot` a mini linha do tempo (agora nas experiências) | ✅ 764 testes existentes seguem passando |
| EP-10 | Desktop e celular | ✅ 1440×900 e 390×844, cinco personas, escuro: sem rolagem horizontal, sem erro de console (Edge via Playwright) |
| EP-11 | Acessibilidade | ◐ botões nativos com `aria-pressed`, `details`, `aria-live`, foco global. **Falta** leitor de tela e temas claro/Dracula/Solarized |
| EP-12 | Desempenho | ✅ JS inicial 144,85 → 145,04 kB gzip (+0,2); chunks: Architecture 7,5 · Explore 2,2 · Journey 1,9 · Timeline 1,7 · Overview 1,5 kB |

## Decisões

- O diagrama é uma grade por camadas com botões, não um SVG com linhas: no celular as linhas ficariam ilegíveis. As ligações aparecem destacadas no selecionado, listadas no painel e na alternativa em texto.
- "Fala com": o estudo de caso não descreve ligação direta do Domínio; o painel diz "sem ligação direta descrita no estudo".
- Os blocos entram depois do primeiro bloco de cada persona (os testes de ordem não mudaram).

## Limites conhecidos

- **Repositório:** `projects.tsx` tem `repo: null` para o WhatsApp Dispatcher. O botão leva ao perfil do GitHub e a tela explica. Falta a Duda dizer se há um repositório público.
- **Processo de trabalho (cliente):** continua não existindo nos dados; a jornada usa as perguntas frequentes. Falta o texto da Duda.
- **Cliente:** o mapeamento necessidade → serviço/case é editorial (por posição em `services.tsx`); a Duda deve revisar. BECAS como exemplo de "vender online" foi lido do texto do case.
- **Só um projeto** no explorador (de propósito, conforme o roadmap).
- Dicas do Modo Explorar são texto novo de interface, sem revisão da Duda.
- Não verificado: leitor de tela, temas além do escuro, impressão (blocos ocultos no `@media print`), deploy.
