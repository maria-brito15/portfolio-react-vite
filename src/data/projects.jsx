// Projetos do portfólio original, com os textos preservados.
//
// `date` é a data de INÍCIO: { year, month? }. O mês só entra quando foi
// confirmado pela autora (docs/sdd/tasks.md, "Fontes das datas"); sem mês,
// a interface mostra só o ano e sinaliza a ordem como indeterminada quando
// há outro projeto sem mês no mesmo ano (ver utils/projectDate.js).
//
// Pendências conhecidas (ver README e docs/sdd): meses de ShortURL,
// File Name Standardizer e WhatsApp Dispatcher; capturas de ShortURL e
// File Name Standardizer (Planoriza e WhatsApp Dispatcher não têm imagens).
import { sortByDate } from '../utils/projectDate';

export const projects = [
  {
    id: 'planoriza',
    variant: 'card',
    name: 'Planoriza',
    icon: '📅',
    date: { year: 2025, month: 1 },
    tech: ['HTML5', 'CSS3', 'JavaScript'],
    repo: null,
    gallery: [],
    pt: {
      badge: 'Finalista · PUC Minas',
      description:
        'Surgiu de um problema que quase todo estudante conhece: lista de tarefas que cresce mais do que dá pra cumprir e só gera frustração. A solução limita quantas tarefas você pode colocar por dia, tem sistema de streak pra manter a consistência, calendário interativo e temporizador. Prevenir o burnout virou uma decisão de produto, não um detalhe.',
    },
    en: {
      badge: 'Finalist · PUC Minas',
      description:
        'Born from a problem almost every student knows: to-do lists that grow way past what you can actually finish, and just end up causing frustration. The fix caps how many tasks you can add per day, adds a streak system to keep you consistent, an interactive calendar, and a built-in timer. Preventing burnout became a product decision, not an afterthought.',
    },
  },
  {
    id: 'ecoshop',
    variant: 'evolution',
    name: 'EcoShop',
    icon: '🌿',
    date: { year: 2025, month: 2 },
    tech: ['Java', 'Spark Framework', 'PostgreSQL', 'Next.js 15', 'TypeScript', 'Prisma', 'Redis'],
    repo: 'https://github.com/maria-brito15/ecoshop-nextjs',
    gallery: ['/cases/ecoshop/1.jpeg', '/cases/ecoshop/2.jpeg', '/cases/ecoshop/3.jpeg'],
    pt: {
      badge: 'Finalista · PUC Minas',
      description:
        'E-commerce sustentável que identifica materiais recicláveis por imagem e analisa sustentabilidade usando IA. Começou como trabalho de faculdade e depois eu reescrevi do zero, sozinha, e o mais interessante aqui não é a versão atual, é ver a distância entre as duas.',
      versions: [
        {
          label: 'v1',
          date: { year: 2025, month: 2 },
          stack: 'Java + Spark Framework',
          description:
            'A versão de faculdade, selecionada entre os melhores projetos do semestre. Arquitetura MVC clássica, Controller → Service → DAO, conexão direta com PostgreSQL via JDBC.',
          points: [
            'Controllers, Services e DAOs separados por entidade',
            'Autenticação por sessão com BCrypt',
            'InputSanitizer manual contra XSS',
            'Testes com JUnit 5 + Mockito',
            'Deploy com Docker no Render',
          ],
        },
        {
          label: 'v2',
          date: { year: 2026, month: 1 },
          stack: 'Next.js 15 + TypeScript',
          description:
            'Reescrevi tudo com uma stack mais moderna: App Router, cache em duas camadas, ORM tipado, autenticação stateless e validação em todas as rotas.',
          points: [
            'Cache em duas camadas: Redis (servidor) + Map stale-while-revalidate (cliente)',
            'JDBC manual → Prisma ORM com schema tipado',
            'Sessões → JWT stateless com middleware centralizado',
            'Validação com Zod em todas as rotas',
            'CI/CD com GitHub Actions + Container Registry',
            'Serviços externos (Azure Custom Vision, Gemini) com degradação graciosa',
          ],
        },
      ],
    },
    en: {
      badge: 'Finalist · PUC Minas',
      description:
        "A sustainable e-commerce platform that identifies recyclable materials from photos and analyzes sustainability using AI. It started as a school project and I later rewrote it from scratch, on my own, and honestly the interesting part isn't the current version, it's the gap between the two.",
      versions: [
        {
          label: 'v1',
          date: { year: 2025, month: 2 },
          stack: 'Java + Spark Framework',
          description:
            "The school version, picked among the semester's best projects. Classic MVC architecture, Controller → Service → DAO, direct connection to PostgreSQL via JDBC.",
          points: [
            'Controllers, Services and DAOs split by entity',
            'Session-based auth with BCrypt',
            'Manual InputSanitizer against XSS',
            'Tests with JUnit 5 + Mockito',
            'Docker deploy on Render',
          ],
        },
        {
          label: 'v2',
          date: { year: 2026, month: 1 },
          stack: 'Next.js 15 + TypeScript',
          description:
            'I rewrote everything with a more modern stack: App Router, two-layer cache, typed ORM, stateless auth, and validation on every route.',
          points: [
            'Two-layer cache: Redis (server) + stale-while-revalidate Map (client)',
            'Manual JDBC → Prisma ORM with typed schema',
            'Sessions → stateless JWT with centralized middleware',
            'Zod validation on every route',
            'CI/CD with GitHub Actions + Container Registry',
            'External services (Azure Custom Vision, Gemini) with graceful degradation',
          ],
        },
      ],
    },
  },
  {
    id: 'whatsapp-dispatcher',
    variant: 'featured',
    name: 'WhatsApp Dispatcher',
    icon: '⚙️',
    date: { year: 2026 },
    // Tecnologias citadas no próprio estudo de caso.
    tech: ['BullMQ', 'Redis', 'PostgreSQL', 'Prisma'],
    repo: null,
    caseStudy: '/estudos-de-caso/whatsapp-dispatcher',
    gallery: [],
    pt: {
      badge: 'Estudo de Caso · Desafio Técnico de Estágio',
      description: (
        <>
          Estudo de caso de um <strong>desafio técnico de estágio</strong>: um sistema de disparo de
          mensagens no WhatsApp pra campanhas e fluxos automatizados. A implementação original é
          parcial; o que documentei em HTML foi o raciocínio por trás de cada decisão, por que essa
          arquitetura, que trocas eu fiz, o que faria diferente hoje. Mostra como eu penso sistema:{' '}
          <strong>Domain-Driven Design</strong>, <strong>Clean Architecture</strong> e uma estrutura
          inspirada em arquitetura hexagonal.
        </>
      ),
    },
    en: {
      badge: 'Case Study · Internship Technical Challenge',
      description: (
        <>
          A case study of an <strong>internship technical challenge</strong>: a WhatsApp message
          dispatch system for campaigns and automated flows. The original implementation is partial;
          what I documented in HTML is the reasoning behind every decision, why this architecture,
          what trade-offs I made, what I&apos;d do differently today. It shows how I think about
          systems: <strong>Domain-Driven Design</strong>, <strong>Clean Architecture</strong>, and a
          structure inspired by hexagonal architecture.
        </>
      ),
    },
  },
  {
    id: 'shorturl',
    variant: 'minor',
    name: 'ShortURL',
    date: { year: 2026 },
    tech: ['Express', 'TypeScript', 'MongoDB', 'Redis', 'Docker', 'CI/CD'],
    repo: 'https://github.com/maria-brito15/shorturl-express',
    gallery: [],
    pt: {
      description:
        'API REST pra encurtar URLs, com cache em Redis e rastreamento de clique por link.',
    },
    en: {
      description: 'REST API for shortening URLs, with Redis caching and per-link click tracking.',
    },
  },
  {
    id: 'file-name-standardizer',
    variant: 'minor',
    name: 'File Name Standardizer',
    date: { year: 2026 },
    tech: ['JavaScript ES6+'],
    repo: 'https://github.com/maria-brito15/file-name-standardizer',
    gallery: [],
    pt: {
      description:
        'Padroniza nomes de arquivo em lote, tira acento, troca espaço por underscore. Sem nenhuma dependência.',
    },
    en: {
      description:
        'Batch-standardizes file names, strips accents, swaps spaces for underscores. No dependencies at all.',
    },
  },
];

// Ordem cronológica crescente pela data de início (ver utils/projectDate.js).
export const sortProjectsChronologically = sortByDate;
