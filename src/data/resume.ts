// Currículo em versão web (rota /curriculo). Os textos vêm do currículo da
// autora (CV Software Engineer Intern, PT e EN), sem acréscimos. Experiências
// complementares reaproveitam src/data/experiences.ts, e a formação é a mesma
// usada na página Acadêmico (src/data/academics.ts), para que não existam
// duas versões das mesmas informações.
export const resume = {
  pt: {
    name: 'Maria Eduarda de Paula Brito',
    headline: 'Estágio em Engenharia de Software · Desenvolvimento e Testes de Software',
    location: 'Estudante de Engenharia de Software — PUC Minas · Belo Horizonte, MG',
    print: 'Imprimir / salvar em PDF',
    printHint: 'Use “Salvar como PDF” na janela de impressão.',
    sections: {
      summary: 'Sobre mim',
      skills: 'Competências técnicas',
      projects: 'Projetos em destaque',
      education: 'Formação e idiomas',
      experience: 'Experiências',
      awards: 'Reconhecimentos',
    },
    skillsSummary: 'Tempo contado a partir do primeiro projeto ou curso com cada tecnologia.',
    experienceSummary: (n: number, since: number) => `${n} atividades desde ${since}`,
    awardsSummary: (n: number) => `${n} reconhecimentos`,
    received: (n: number) => `recebido ${n} ${n === 1 ? 'vez' : 'vezes'}`,
    showMore: 'Mostrar mais',
    showLess: 'Mostrar menos',
    since: (year: number, source?: string) => `desde ${year}${source ? ` (${source})` : ''}`,
    expected: 'previsão',
    summary: [
      'Estudante de Engenharia de Software na PUC Minas, com base sólida em lógica de programação, orientação a objetos (Java), TypeScript e bancos de dados. Escrevo testes automatizados (JUnit 5, Mockito, Jest), monto pipelines de CI que rodam lint, type-check e build a cada mudança e gosto de conferir se o comportamento do sistema bate com a especificação.',
      'Já construí e entreguei sistemas completos, da concepção ao deploy, e reescrevi um deles do zero para entender o que muda com decisões de arquitetura melhores. Inglês avançado, boa comunicação e prática em times com prazos reais. Busco um estágio em desenvolvimento e testes de software, aprendendo com mentores experientes num ambiente internacional.',
    ],
    skills: [
      [
        'Programação',
        'Java (Spring Boot, Maven), TypeScript, JavaScript, Python, C/C++, PHP; orientação a objetos',
      ],
      [
        'Testes e qualidade',
        'JUnit 5 e Mockito (Java), Jest (TypeScript/Node.js); testes unitários de regras de negócio e serviços; validação de entradas (Zod) em todas as rotas',
      ],
      ['Back-end e APIs', 'Node.js, Express, REST APIs, JWT, BCrypt; filas e workers (BullMQ)'],
      ['Front-end', 'React, Next.js 15, HTML5, CSS3, Tailwind CSS'],
      [
        'Banco de dados',
        'SQL (PostgreSQL), MongoDB, Redis, Prisma ORM, Flyway; modelagem relacional',
      ],
      [
        'DevOps e ferramentas',
        'Git, GitHub Actions (CI/CD: lint, type-check, build, deploy), Docker, Docker Compose',
      ],
      [
        'Práticas de engenharia',
        'Clean Architecture, DDD, MVC em camadas, metodologias ágeis, documentação técnica',
      ],
    ],
    projects: [
      {
        name: 'EcoShop',
        subtitle: 'E-commerce sustentável com IA',
        award: 'Finalista dos melhores trabalhos do semestre · PUC Minas 2025',
        link: { href: 'https://github.com/maria-brito15/ecoshop-nextjs', label: 'GitHub' },
        points: [
          'V1 (Java, Spark Framework, PostgreSQL, JDBC): MVC em camadas (Controller, Service, DAO), testes unitários com JUnit 5 e Mockito, sanitização de entradas contra XSS e autenticação com BCrypt.',
          'V2 (Next.js 15, TypeScript, Prisma, Redis): reescrita completa com JWT stateless e três níveis de acesso, validação com Zod em todas as rotas e cache em duas camadas (Redis + memória).',
          'Serviços externos (Azure Custom Vision, Google Gemini) com degradação graciosa quando falham; Docker Compose e CI/CD com GitHub Actions (lint, type-check, build, GHCR, deploy).',
        ],
      },
      {
        name: 'ShortURL',
        subtitle: 'API REST de encurtamento de URLs',
        link: { href: 'https://github.com/maria-brito15/shorturl-express', label: 'GitHub' },
        points: [
          'Express, TypeScript, MongoDB (persistência) e Redis (cache de redirecionamentos e cliques), com rastreamento de cliques, Docker Compose e CI/CD.',
        ],
      },
      {
        name: 'WhatsApp Dispatcher',
        subtitle: 'Estudo de caso de arquitetura',
        link: { to: '/estudos-de-caso/whatsapp-dispatcher', label: 'Ler o estudo de caso' },
        points: [
          'Disparo de mensagens para campanhas e fluxos automatizados, com filas e workers (BullMQ), DDD e Clean Architecture. Estudo de caso escrito sobre cada decisão e as trocas feitas.',
        ],
      },
      {
        name: 'Planoriza',
        subtitle: 'Gerenciamento de tarefas com prevenção de burnout · HTML5 · CSS3 · JavaScript',
        award: 'Finalista dos melhores trabalhos do semestre · PUC Minas 2025',
        points: [
          'Regras de negócio com limite diário de tarefas, sistema de streak, calendário interativo e temporizador integrado.',
        ],
      },
    ],
    languagesLabel: 'Idiomas',
    languages: 'Português (nativo) · Inglês (avançado/fluente) · Francês (básico)',
    academicsLink: 'Ver a trajetória acadêmica completa →',
  },
  en: {
    name: 'Maria Eduarda de Paula Brito',
    headline: 'Software Engineer Intern · Software Development and Testing',
    location: 'Software Engineering student at PUC Minas · Belo Horizonte, MG, Brazil',
    print: 'Print / save as PDF',
    printHint: 'Choose “Save as PDF” in the print dialog.',
    sections: {
      summary: 'About me',
      skills: 'Technical skills',
      projects: 'Selected projects',
      education: 'Education and languages',
      experience: 'Experience',
      awards: 'Awards',
    },
    skillsSummary: 'Time counted from the first project or course using each technology.',
    experienceSummary: (n: number, since: number) => `${n} activities since ${since}`,
    awardsSummary: (n: number) => `${n} recognitions`,
    received: (n: number) => `received ${n} ${n === 1 ? 'time' : 'times'}`,
    showMore: 'Show more',
    showLess: 'Show less',
    since: (year: number, source?: string) => `since ${year}${source ? ` (${source})` : ''}`,
    expected: 'expected',
    summary: [
      "Software Engineering student at PUC Minas with a solid foundation in programming logic, object-oriented programming (Java), TypeScript and databases. I write automated tests (JUnit 5, Mockito, Jest), set up CI pipelines that lint, type-check and build every change, and like checking that a system's behavior matches its specification.",
      'I have built and shipped complete systems, from design to deployment, and rewrote one from scratch to learn how better architecture decisions change a product. Advanced English, clear communication and experience working with teams on real deadlines. Looking for an internship in software development and testing, where I can learn from experienced mentors in an international environment.',
    ],
    skills: [
      [
        'Programming',
        'Java (Spring Boot, Maven), TypeScript, JavaScript, Python, C/C++, PHP; object-oriented programming',
      ],
      [
        'Testing and quality',
        'JUnit 5 and Mockito (Java), Jest (TypeScript/Node.js); unit tests for business rules and services; input validation (Zod) on every route',
      ],
      [
        'Back-end and APIs',
        'Node.js, Express, REST APIs, JWT, BCrypt; queues and workers (BullMQ)',
      ],
      ['Front-end', 'React, Next.js 15, HTML5, CSS3, Tailwind CSS'],
      ['Databases', 'SQL (PostgreSQL), MongoDB, Redis, Prisma ORM, Flyway; relational modeling'],
      [
        'DevOps and tools',
        'Git, GitHub Actions (CI/CD: lint, type-check, build, deploy), Docker, Docker Compose',
      ],
      [
        'Engineering practices',
        'Clean Architecture, DDD, layered MVC, agile methodologies, technical documentation',
      ],
    ],
    projects: [
      {
        name: 'EcoShop',
        subtitle: 'Sustainable e-commerce with AI',
        award: 'Finalist, best projects of the semester · PUC Minas 2025',
        link: { href: 'https://github.com/maria-brito15/ecoshop-nextjs', label: 'GitHub' },
        points: [
          'V1 (Java, Spark Framework, PostgreSQL, JDBC): layered MVC (Controller, Service, DAO), unit tests with JUnit 5 and Mockito, input sanitization against XSS and BCrypt authentication.',
          'V2 (Next.js 15, TypeScript, Prisma, Redis): full rewrite with stateless JWT and three access levels, Zod validation on every route and two-layer cache (Redis + memory).',
          'External services (Azure Custom Vision, Google Gemini) with graceful degradation when they fail; Docker Compose and CI/CD with GitHub Actions (lint, type-check, build, GHCR, deploy).',
        ],
      },
      {
        name: 'ShortURL',
        subtitle: 'URL shortener REST API',
        link: { href: 'https://github.com/maria-brito15/shorturl-express', label: 'GitHub' },
        points: [
          'Express, TypeScript, MongoDB (persistence) and Redis (redirect and click cache), with click tracking, Docker Compose and CI/CD.',
        ],
      },
      {
        name: 'WhatsApp Dispatcher',
        subtitle: 'Architecture case study',
        link: { to: '/estudos-de-caso/whatsapp-dispatcher', label: 'Read the case study' },
        points: [
          'Message dispatch for campaigns and automated flows, with queues and workers (BullMQ), DDD and Clean Architecture. Written case study documenting each decision and its trade-offs.',
        ],
      },
      {
        name: 'Planoriza',
        subtitle: 'Task manager with burnout prevention · HTML5 · CSS3 · JavaScript',
        award: 'Finalist, best projects of the semester · PUC Minas 2025',
        points: [
          'Business rules with a daily task limit, streak system, interactive calendar and built-in timer.',
        ],
      },
    ],
    languagesLabel: 'Languages',
    languages: 'Portuguese (native) · English (advanced/fluent) · French (basic)',
    academicsLink: 'See the full academic record →',
  },
};
