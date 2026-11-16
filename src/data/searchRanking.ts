// Palavras-chave da busca (paleta Ctrl+K): sinônimos e termos em PT e EN que o texto da página
// não traz. Só ajudam a achar; não são conteúdo mostrado ao visitante. Os "temas" (`topic`) são ids
// de página de `routes.ts` mais os genéricos (`project`, `case`, `skill`, `command`).
import type { Localized } from '../types';

const L = (pt: string, en: string): Localized => ({ pt, en });

// Termos extras por página (id de `routes.ts`) e por tema.
export const topicKeywords: Record<string, Localized> = {
  sobre: L(
    'pessoal interesses perfil quem é biografia sobre mim',
    'personal interests profile who bio about me',
  ),
  curriculo: L(
    'cv perfil profissional experiência competências formação conquistas',
    'resume cv professional profile experience skills education achievements',
  ),
  experiencias: L(
    'experiência atividades extensão competições conquistas reconhecimentos monitoria palestra cursos',
    'experience activities outreach competitions achievements awards teaching assistant talk courses',
  ),
  habilidades: L(
    'competências tecnologias stack ferramentas linguagens',
    'skills technologies stack tools languages',
  ),
  academico: L(
    'acadêmico formação disciplinas notas competições extensão faculdade universidade trajetória',
    'academic education courses grades competitions outreach university degree timeline',
  ),
  servicos: L(
    'serviços soluções orçamento preço prazo cases processo faq perguntas site loja',
    'services solutions quote price deadline cases process faq questions website store',
  ),
  contato: L('contato email mensagem falar orçamento', 'contact email message talk quote'),
  github: L('repositórios código open source', 'repositories code open source'),
  terminal: L(
    'comandos linha de comando shell interativo',
    'commands command line shell interactive',
  ),
  agora: L('foco atual novidades', 'current focus news'),
  pessoal: L(
    'pessoal interesses cultura hobbies lazer livros filmes música teatro leitura cinema',
    'personal interests culture hobbies leisure books films movies music theater theatre reading cinema',
  ),
  'pessoal-livros': L(
    'livros leitura lendo estante literatura autores hardcover',
    'books reading shelf literature authors hardcover',
  ),
  'pessoal-filmes': L(
    'filmes cinema diário séries assistidos resenhas notas letterboxd',
    'films movies cinema diary series watched reviews ratings letterboxd',
  ),
  'pessoal-musica': L(
    'música discos álbuns artistas bandas ouvindo playlist',
    'music records albums artists bands listening playlist',
  ),
  'pessoal-teatro': L(
    'teatro peças palco espetáculos companhia',
    'theater theatre plays stage shows company',
  ),
  case: L(
    'estudo de caso arquitetura decisões trade-offs backend',
    'case study architecture decisions trade-offs backend',
  ),
  project: L('projeto portfólio trabalho pessoal', 'project portfolio work personal'),
};

// Áreas de tecnologia: só uma classificação das tecnologias que o projeto já declara
// (`projects.tsx`), para que "backend" ou "frontend" achem os projetos.
const AREAS: [RegExp, string][] = [
  [
    /bullmq|redis|postgres|prisma|express|spark|mongodb|java\b|jdbc|node|docker/i,
    'backend back-end api',
  ],
  [/react|next\.?js|vite|html|css|tailwind/i, 'frontend front-end interface'],
  [/typescript|javascript/i, 'web'],
];

export function techKeywords(tech: string[]) {
  return [
    ...tech,
    ...AREAS.filter(([pattern]) => tech.some((t) => pattern.test(t))).map(([, words]) => words),
  ].join(' ');
}
