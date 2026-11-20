// Currículo (spec 003, T4.4). Um objeto, dois idiomas por campo. Texto copiado de `src/data/resume.ts` sem
// alteração. O nome e os links de cada projeto em destaque vêm do projeto (`project` é o id), não são copiados.
// Fora do conteúdo (ficam em `resume.ts` até a spec 007): textos de interface (`print`, `showMore`, `since`…).
import type { ContentResume } from './schema/resume';

export const resume: ContentResume = {
  name: 'Maria Eduarda de Paula Brito',
  headline: {
    pt: 'Estágio em Engenharia de Software · Desenvolvimento e Testes de Software',
    en: 'Software Engineer Intern · Software Development and Testing',
  },
  location: {
    pt: 'Estudante de Engenharia de Software — PUC Minas · Belo Horizonte, MG',
    en: 'Software Engineering student at PUC Minas · Belo Horizonte, MG, Brazil',
  },
  languages: {
    pt: 'Português (nativo) · Inglês (avançado/fluente) · Francês (básico)',
    en: 'Portuguese (native) · English (advanced/fluent) · French (basic)',
  },
  summary: [
    {
      pt: 'Estudante de Engenharia de Software na PUC Minas, com base sólida em lógica de programação, orientação a objetos (Java), TypeScript e bancos de dados. Escrevo testes automatizados (JUnit 5, Mockito, Jest), monto pipelines de CI que rodam lint, type-check e build a cada mudança e gosto de conferir se o comportamento do sistema bate com a especificação.',
      en: "Software Engineering student at PUC Minas with a solid foundation in programming logic, object-oriented programming (Java), TypeScript and databases. I write automated tests (JUnit 5, Mockito, Jest), set up CI pipelines that lint, type-check and build every change, and like checking that a system's behavior matches its specification.",
    },
    {
      pt: 'Já construí e entreguei sistemas completos, da concepção ao deploy, e reescrevi um deles do zero para entender o que muda com decisões de arquitetura melhores. Inglês avançado, boa comunicação e prática em times com prazos reais. Busco um estágio em desenvolvimento e testes de software, aprendendo com mentores experientes num ambiente internacional.',
      en: 'I have built and shipped complete systems, from design to deployment, and rewrote one from scratch to learn how better architecture decisions change a product. Advanced English, clear communication and experience working with teams on real deadlines. Looking for an internship in software development and testing, where I can learn from experienced mentors in an international environment.',
    },
  ],
  skillAreas: [
    {
      label: {
        pt: 'Programação',
        en: 'Programming',
      },
      text: {
        pt: 'Java (Spring Boot, Maven), TypeScript, JavaScript, Python, C/C++, PHP; orientação a objetos',
        en: 'Java (Spring Boot, Maven), TypeScript, JavaScript, Python, C/C++, PHP; object-oriented programming',
      },
    },
    {
      label: {
        pt: 'Testes e qualidade',
        en: 'Testing and quality',
      },
      text: {
        pt: 'JUnit 5 e Mockito (Java), Jest (TypeScript/Node.js); testes unitários de regras de negócio e serviços; validação de entradas (Zod) em todas as rotas',
        en: 'JUnit 5 and Mockito (Java), Jest (TypeScript/Node.js); unit tests for business rules and services; input validation (Zod) on every route',
      },
    },
    {
      label: {
        pt: 'Back-end e APIs',
        en: 'Back-end and APIs',
      },
      text: {
        pt: 'Node.js, Express, REST APIs, JWT, BCrypt; filas e workers (BullMQ)',
        en: 'Node.js, Express, REST APIs, JWT, BCrypt; queues and workers (BullMQ)',
      },
    },
    {
      label: {
        pt: 'Front-end',
        en: 'Front-end',
      },
      text: {
        pt: 'React, Next.js 15, HTML5, CSS3, Tailwind CSS',
        en: 'React, Next.js 15, HTML5, CSS3, Tailwind CSS',
      },
    },
    {
      label: {
        pt: 'Banco de dados',
        en: 'Databases',
      },
      text: {
        pt: 'SQL (PostgreSQL), MongoDB, Redis, Prisma ORM, Flyway; modelagem relacional',
        en: 'SQL (PostgreSQL), MongoDB, Redis, Prisma ORM, Flyway; relational modeling',
      },
    },
    {
      label: {
        pt: 'DevOps e ferramentas',
        en: 'DevOps and tools',
      },
      text: {
        pt: 'Git, GitHub Actions (CI/CD: lint, type-check, build, deploy), Docker, Docker Compose',
        en: 'Git, GitHub Actions (CI/CD: lint, type-check, build, deploy), Docker, Docker Compose',
      },
    },
    {
      label: {
        pt: 'Práticas de engenharia',
        en: 'Engineering practices',
      },
      text: {
        pt: 'Clean Architecture, DDD, MVC em camadas, metodologias ágeis, documentação técnica',
        en: 'Clean Architecture, DDD, layered MVC, agile methodologies, technical documentation',
      },
    },
  ],
  featuredProjects: [
    {
      project: 'ecoshop',
      subtitle: {
        pt: 'E-commerce sustentável com IA',
        en: 'Sustainable e-commerce with AI',
      },
      award: {
        pt: 'Finalista dos melhores trabalhos do semestre · PUC Minas 2025',
        en: 'Finalist, best projects of the semester · PUC Minas 2025',
      },
      points: [
        {
          pt: 'V1 (Java, Spark Framework, PostgreSQL, JDBC): MVC em camadas (Controller, Service, DAO), testes unitários com JUnit 5 e Mockito, sanitização de entradas contra XSS e autenticação com BCrypt.',
          en: 'V1 (Java, Spark Framework, PostgreSQL, JDBC): layered MVC (Controller, Service, DAO), unit tests with JUnit 5 and Mockito, input sanitization against XSS and BCrypt authentication.',
        },
        {
          pt: 'V2 (Next.js 15, TypeScript, Prisma, Redis): reescrita completa com JWT stateless e três níveis de acesso, validação com Zod em todas as rotas e cache em duas camadas (Redis + memória).',
          en: 'V2 (Next.js 15, TypeScript, Prisma, Redis): full rewrite with stateless JWT and three access levels, Zod validation on every route and two-layer cache (Redis + memory).',
        },
        {
          pt: 'Serviços externos (Azure Custom Vision, Google Gemini) com degradação graciosa quando falham; Docker Compose e CI/CD com GitHub Actions (lint, type-check, build, GHCR, deploy).',
          en: 'External services (Azure Custom Vision, Google Gemini) with graceful degradation when they fail; Docker Compose and CI/CD with GitHub Actions (lint, type-check, build, GHCR, deploy).',
        },
      ],
    },
    {
      project: 'shorturl',
      subtitle: {
        pt: 'API REST de encurtamento de URLs',
        en: 'URL shortener REST API',
      },
      points: [
        {
          pt: 'Express, TypeScript, MongoDB (persistência) e Redis (cache de redirecionamentos e cliques), com rastreamento de cliques, Docker Compose e CI/CD.',
          en: 'Express, TypeScript, MongoDB (persistence) and Redis (redirect and click cache), with click tracking, Docker Compose and CI/CD.',
        },
      ],
    },
    {
      project: 'whatsapp-dispatcher',
      subtitle: {
        pt: 'Estudo de caso de arquitetura',
        en: 'Architecture case study',
      },
      points: [
        {
          pt: 'Disparo de mensagens para campanhas e fluxos automatizados, com filas e workers (BullMQ), DDD e Clean Architecture. Estudo de caso escrito sobre cada decisão e as trocas feitas.',
          en: 'Message dispatch for campaigns and automated flows, with queues and workers (BullMQ), DDD and Clean Architecture. Written case study documenting each decision and its trade-offs.',
        },
      ],
    },
    {
      project: 'planoriza',
      subtitle: {
        pt: 'Gerenciamento de tarefas com prevenção de burnout · HTML5 · CSS3 · JavaScript',
        en: 'Task manager with burnout prevention · HTML5 · CSS3 · JavaScript',
      },
      award: {
        pt: 'Finalista dos melhores trabalhos do semestre · PUC Minas 2025',
        en: 'Finalist, best projects of the semester · PUC Minas 2025',
      },
      points: [
        {
          pt: 'Regras de negócio com limite diário de tarefas, sistema de streak, calendário interativo e temporizador integrado.',
          en: 'Business rules with a daily task limit, streak system, interactive calendar and built-in timer.',
        },
      ],
    },
  ],
};
