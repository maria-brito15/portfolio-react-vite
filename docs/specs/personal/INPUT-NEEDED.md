# Espaço cultural: o que preciso de você

Um formulário só, para preencher de uma vez. Estado completo em `AUDIT.md`. Preencha o campo
**Resposta** de cada item (ou marque `[x]`). Nunca cole segredo neste arquivo: o formato de cada
campo diz onde o valor deve ir. Prioridade: **P1** bloqueia a publicação, **P2** melhora, **P3** opcional.

Formato de cada item: **Preciso** · **Por quê** · **Se ficar em branco** · **Onde/formato** · **Resposta**.

---

## 1. Credenciais e tokens

### C-1 (P1) Token do Hardcover
- **Preciso:** `HARDCOVER_API_TOKEN`, gerado na sua conta (tente `hardcover.app/account/api`).
- **Por quê:** sem ele nunca falei com o Hardcover real; o esquema (`user_books`, status, nota, datas, capa) é suposição.
- **Em branco:** livros ficam sem dado real e a Fase 3 continua "não validada"; modo `live` mostra erro.
- **Onde/formato:** `.env` local (`HARDCOVER_API_TOKEN=...`) e painel da Netlify. **Não** cole no chat nem neste arquivo. Depois rode `npm run personal:probe` e me diga só "passou" ou a saída (ela não imprime o token).
- **Resposta:** [ ] token no `.env`  [ ] token na Netlify  [ ] probe rodado

### C-2 (P1) Chave do TMDB
- **Preciso:** `TMDB_API_KEY` (v3) ou token v4, de `themoviedb.org/settings/api`, aceitando os termos.
- **Por quê:** pôsteres, sinopses e duração dos filmes; o cliente foi escrito só pela documentação.
- **Em branco:** diário sem pôsteres (placeholder tipográfico), sem metadados.
- **Onde/formato:** `.env` local e painel da Netlify.
- **Resposta:** [ ] no `.env`  [ ] na Netlify

### C-3 (P2) Segredo de atualização manual
- **Preciso:** um valor aleatório para `PERSONAL_REFRESH_SECRET` (só se quisermos endpoint/webhook de atualização).
- **Por quê:** hoje **nenhum código o usa**; só entra se decidirmos D-1.
- **Em branco:** sem atualização manual; o cache só vence pelo TTL.
- **Onde/formato:** painel da Netlify (gere com `openssl rand -hex 32`).
- **Resposta:** [ ] não quero  [ ] gerado

### C-4 (P2) Build hook da Netlify
- **Preciso:** URL do build hook (Site configuration → Build & deploy → Build hooks) em `PERSONAL_BUILD_HOOK_URL`.
- **Por quê:** a função agendada regenera o HTML estático com ele (só se D-1 = rebuild agendado).
- **Em branco:** sem HTML estático das listas; só o cliente busca o dado.
- **Onde/formato:** painel da Netlify, nunca no repositório.
- **Resposta:** [ ] criado  [ ] não quero

---

## 2. Confirmações de conta

### A-1 (P1) Perfil e estantes do Hardcover públicos
- **Preciso:** confirmar que `https://hardcover.app/@dudapbrt` e as estantes estão públicos (ou que o token cobre).
- **Por quê:** não consegui verificar sem token.
- **Em branco:** assumo público; se não for, a página vem vazia.
- **Onde/formato:** `[x] público` / `[x] privado, o token cobre`.
- **Resposta:**

### A-2 (P2) Usernames
- **Preciso:** confirmar `dudapbrt` no Hardcover **e** no Letterboxd.
- **Por quê:** estão fixos em `.env.example`/`profiles.ts`; o RSS do Letterboxd respondeu 200 em 14/11.
- **Em branco:** mantenho `dudapbrt`.
- **Onde/formato:** "ok" ou o nome certo.
- **Resposta:**

### A-3 (P2) Termos do TMDB e do pôster
- **Preciso:** que você aceite os termos do TMDB e confirme o uso de pôsteres com a atribuição que está no rodapé.
- **Por quê:** README §4.3 marca os termos como "a confirmar".
- **Em branco:** mantenho com atribuição; se discordar, tiro os pôsteres (placeholder tipográfico).
- **Onde/formato:** `[x] aceito` / `[x] sem pôsteres`.
- **Resposta:**

---

## 3. Arquivos para enviar

### F-1 (P1) Export do Letterboxd
- **Preciso:** o ZIP de `letterboxd.com/settings/data/` descompactado em `letterboxd-export/` (na raiz do projeto, ignorado pelo git), com ao menos `diary.csv` e, se tiver, `reviews.csv`.
- **Por quê:** o RSS só traz ~50 itens; o histórico completo vem do CSV e hoje o JSON está vazio. As colunas só foram testadas com CSV sintético.
- **Em branco:** diário limitado aos 50 mais recentes.
- **Onde/formato:** pasta `letterboxd-export/`; depois `npm run personal:import-letterboxd -- --tmdb`.
- **Resposta:** [ ] pasta pronta

### F-2 (P2) Resenhas que **não** devem ser públicas
- **Preciso:** a lista de filmes cujas resenhas ficam privadas (`publish: false`).
- **Por quê:** a D8 permite suprimir caso a caso; hoje todas as resenhas do RSS/CSV saem.
- **Em branco:** todas publicadas, com truncamento em ~400 caracteres.
- **Onde/formato:** título + ano, uma linha cada, ou edite `netlify/personal/data/letterboxd-history.json`.
- **Resposta:**

### F-3 (P3) Imagens de teatro/música
- **Preciso:** capas, cartazes ou fotos, se quiser exibi-las.
- **Por quê:** o modelo aceita referências visuais; não inventei nenhuma.
- **Em branco:** só texto.
- **Onde/formato:** `public/assets/personal/` + a legenda em PT e EN, e quem tem o direito da imagem.
- **Resposta:**

---

## 4. Decisões de produto em aberto

### D-1 (P1) Sincronização agendada e HTML estático
- **Preciso:** escolher: **(a)** só cache sob demanda, como está hoje (TTL 6 h livros / 1 h filmes); **(b)** rebuild agendado via build hook, 1x por dia; **(c)** rebuild a cada 6 h / 1 h (gasta mais minutos de build).
- **Por quê:** a Fase 4 do plano não foi feita; sem ela "sync agendada" não existe e as listas não entram no HTML estático (SEO sem JS).
- **Em branco:** fico em (a) e marco a Fase 4 como adiada.
- **Onde/formato:** `a` / `b` / `c`. Preciso também saber se o seu plano da Netlify permite função agendada.
- **Resposta:**

### D-2 (P1) Metas de desempenho
- **Preciso:** os limites de Lighthouse/web vitals (por exemplo, Performance ≥ 90, LCP ≤ 2,5 s, CLS ≤ 0,1, JS inicial +3 kB gzip).
- **Por quê:** o pedido diz que estão "documentados na Fase 0", mas **não os encontrei em nenhum documento**.
- **Em branco:** uso os acima, que são os padrões do Google.
- **Onde/formato:** uma linha por métrica.
- **Resposta:**

### D-3 (P2) Teatro: publicar vazio ou esperar?
- **Preciso:** `[x] manter em rascunho até haver conteúdo` / `[x] publicar com texto de "em breve"`.
- **Por quê:** hoje está `noindex` e fora do menu.
- **Em branco:** continua rascunho.
- **Resposta:**

### D-4 (P2) Listas, favoritos, watchlist e metas
- **Preciso:** dizer se quer watchlist/listas do Letterboxd e listas/metas de leitura do Hardcover.
- **Por quê:** o RSS não traz; exigem `watchlist.csv`/`lists/` do export e o esquema confirmado.
- **Em branco:** não entram.
- **Onde/formato:** `sim` / `não` por item.
- **Resposta:**

### D-5 (P3) Persona no texto do hub
- **Preciso:** `sim` / `não` para variar o lede do hub por perfil (hoje só ordem/destaque mudam).
- **Por quê:** exigiria texto novo a aprovar por você.
- **Em branco:** não.
- **Resposta:**

### D-6 (P3) Itálico verdadeiro nos títulos
- **Preciso:** `sim` / `não` para hospedar uma fonte mono itálica (OFL).
- **Por quê:** hoje títulos em peso 700; itálico falso seria feio.
- **Em branco:** não.
- **Resposta:**

---

## 5. Conteúdo que só você pode escrever

Tudo em `src/data/personal/`. Itens sem dado simplesmente não aparecem. Se preferir, mande por aqui
em texto e eu coloco nos arquivos.

### M-1 (P2) Música (`music.ts`)
- **Preciso:** para cada instrumento (guitarra, violão, canto, baixo, bateria, ukulele): nível, ano de início e nota (opcionais); o que está aprendendo agora; artistas; músicas (marque as em repetição); discos (marque os em rotação).
- **Por quê:** só os nomes dos instrumentos vieram de você; nada mais foi inventado.
- **Em branco:** a página mostra só os instrumentos.
- **Formato:** `{pt, en}` para textos; datas `AAAA-MM-DD`.
- **Resposta:**

### M-2 (P2) Teatro (`theater.ts`)
- **Preciso:** peças vistas (título, companhia, local, cidade, data), vivências, produções favoritas, observações, referências visuais.
- **Por quê:** nada foi inventado e não presumo atuação ou profissão.
- **Em branco:** a página segue rascunho.
- **Formato:** igual a M-1.
- **Resposta:**

### M-3 (P3) Textos de interface do espaço
- **Preciso:** revisão do lede/deck de cada página (`src/i18n/personal.ts`, linhas 17, 40, 82, 93, 106 e as versões EN).
- **Por quê:** os textos atuais foram escritos por mim a partir do que você contou.
- **Em branco:** ficam como estão.
- **Resposta:** [ ] ok  [ ] ajustes:

---

## 6. Deploy e infraestrutura

### I-1 (P1) Variáveis no painel da Netlify
- **Preciso:** definir, em Site configuration → Environment variables: `VITE_PERSONAL_SOURCE=live`, `HARDCOVER_API_TOKEN`, `TMDB_API_KEY`, `HARDCOVER_USERNAME`, `LETTERBOXD_USERNAME`, `PERSONAL_HARDCOVER_TTL_MIN`, `PERSONAL_LETTERBOXD_TTL_MIN` (e as de D-1/C-3/C-4 se escolhidas).
- **Por quê:** a trava **recusa o build de produção em modo `mock`**; sem `live` o deploy falha.
- **Em branco:** build de produção quebra (de propósito).
- **Resposta:** [ ] feito

### I-2 (P1) Um deploy de preview para eu medir
- **Preciso:** a URL de um deploy de preview (ou autorização para você rodar Lighthouse e me mandar o relatório).
- **Por quê:** Lighthouse, a primeira leitura a frio das funções e o valor real de `CONTEXT` só existem publicados.
- **Em branco:** esses itens ficam abertos no `QA.md`.
- **Resposta:** URL:

### I-3 (P2) Netlify Blobs habilitado
- **Preciso:** confirmar que o site tem Blobs ativo (o cache usa a loja `personal-cache`).
- **Por quê:** sem Blobs o cache cai para a memória da instância (funciona, mas esfria a cada cold start).
- **Em branco:** assumo habilitado.
- **Resposta:**

### I-4 (P3) Domínios de imagem
- **Preciso:** nada, salvo se você quiser uma CSP: hoje não há `Content-Security-Policy`; as imagens vêm de `image.tmdb.org` e do CDN das capas do Hardcover (a confirmar no `probe`).
- **Por quê:** se criarmos CSP, esses hosts entram na lista de `img-src`.
- **Em branco:** sem CSP, nada a fazer.
- **Resposta:** [ ] sem CSP  [ ] quero CSP

---

## 7. Outros bloqueios

### O-1 (P1) Commitar o trabalho pendente
- **Preciso:** autorização para commitar os 56 arquivos (filmes, música/teatro, hub, QA) na `feat/espaco-cultural`.
- **Por quê:** estão só no disco local.
- **Em branco:** não commito.
- **Resposta:** [ ] pode commitar  [ ] ainda não

### O-2 (P3) `.env.example` das outras features
- **Preciso:** `sim` / `não` para eu documentar `GEMINI_API_KEY`, `GEMINI_MODEL`, `ASK_SALT`, `VITE_ASK_ENABLED`, `ASK_EVAL`, hoje ausentes.
- **Por quê:** fora do escopo cultural, mas é o mesmo arquivo.
- **Em branco:** não mexo.
- **Resposta:**

---

## Ordem sugerida para preencher

1. C-1, C-2, F-1, A-1, I-1 (desbloqueiam validar tudo com dados reais).
2. D-1, D-2, I-2, O-1 (destravam sincronização, medição e commit).
3. M-1, M-2 e o resto, no seu tempo.
