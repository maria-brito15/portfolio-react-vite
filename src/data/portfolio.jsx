// Textos do portfólio original (pt/portfolio.html e en/portfolio.html),
// preservados sem reescrita. Só os títulos de Experiências foram ajustados
// para unir as antigas "Atividades extracurriculares" à seção exigida.
export const portfolio = {
  pt: {
    meta: {
      title: 'Portfólio — Duda Brito | Engenharia de Software & Arquitetura',
      description:
        'Portfólio de Duda Brito – estudante de Engenharia de Software na interseção entre Software Architecture, System Design, Product Engineering e IA. Projetos reais e forma de pensar sobre sistemas.',
    },
    hero: {
      tag: 'Engenharia de Software · PUC Minas',
      title: (
        <>
          Sistemas, arquitetura
          <br />e <em>aprendizado</em>
        </>
      ),
      sub: (
        <>
          Estou explorando a interseção entre <strong>arquitetura de software</strong>,{' '}
          <strong>design de sistemas</strong> e <strong>IA</strong>. Particularmente interessado em{' '}
          <strong>Specification-Driven Development</strong> e em como estruturar soluções que façam
          sentido tanto tecnicamente quanto pro negócio. Tudo em constante aprendizado.
        </>
      ),
      cta: 'Ver Projetos',
      terminal: {
        boot: 'Último acesso: hoje · mariab.dev v2 · digite ajuda',
        name: 'Duda Brito',
        roles: ['Engenharia de Software · PUC Minas', 'Arquitetura de Software', 'IA & SDD'],
        hint: 'Digite ajuda e pressione Enter, ou use os atalhos abaixo.',
        inputLabel: 'Linha de comando do terminal',
        quickLabel: 'Comandos rápidos',
      },
      pills: [
        'Software Architecture',
        'System Design',
        'Gestão de Projetos',
        'AI-Augmented Engineering',
      ],
    },
    about: {
      label: 'Quem sou',
      title: (
        <>
          Sobre <em>mim</em>
        </>
      ),
      photoAlt: 'Foto de Maria Eduarda Brito',
      name: 'Maria Eduarda "Duda" P. Brito',
      role: 'Engenharia de Software · PUC Minas',
      location: 'Belo Horizonte, MG',
      languages: 'Português (nativo) · Inglês (avançado) · Francês (básico)',
      bio: [
        <>
          Estou no meio da Engenharia de Software na PUC Minas (passei também por um tempo em
          Ciência da Computação) e, no fim das contas, é isso que eu faço: pego um problema meio
          bagunçado e tento entender como transformar ele em algo estruturado, que funcione
          tecnicamente e que também faça sentido pra quem vai usar.
        </>,
        <>
          Com o tempo fui percebendo que gosto mais da parte de decidir arquitetura e organizar o
          trabalho do que só sentar e codar. Isso me levou pra <strong>liderança técnica</strong>,{' '}
          <strong>planejamento estratégico</strong> e pra pensar em como conectar uma solução
          técnica com o que o negócio realmente precisa, conversar com quem vai usar, cumprir prazo,
          entregar direito.
        </>,
        <>
          Também tenho acompanhado de perto como a IA muda a forma de construir software. Não só
          como atalho pra codar mais rápido, mas como algo que muda o processo inteiro, de{' '}
          <strong>Specification-Driven Development</strong> a{' '}
          <strong>AI-augmented engineering</strong>. Quero trabalhar num lugar onde humano e IA se
          completem em vez de um substituir o outro. No fim, o que eu quero é atuar entre
          arquitetura, produto e liderança, sem esquecer que por trás de qualquer sistema tem gente
          tentando resolver um problema real.
        </>,
      ],
      interestsLabel: 'Áreas de interesse',
      interests: [
        'Software Architecture',
        'System Design',
        'Gestão de Projetos',
        'Planejamento Estratégico',
        'Artificial Intelligence',
        'Specification-Driven Development',
        'AI-Augmented Engineering',
        'Engineering Leadership',
      ],
    },
    skills: {
      divider: 'stack',
      label: 'Ferramentas',
      title: (
        <>
          Com o que eu <em>construo</em>
        </>
      ),
      rows: [
        [
          'Desenvolvimento',
          'Java, Spring Boot · TypeScript, Node.js, Express · React, Next.js · HTML5, CSS3, Tailwind CSS, Bootstrap',
        ],
        [
          'Dados & APIs',
          'PostgreSQL, MongoDB, Redis · Prisma ORM · REST APIs, JWT, BCrypt · BullMQ (filas e workers) · Integração de APIs de IA',
        ],
        ['Infraestrutura', 'Docker · GitHub Actions (CI/CD) · Git · Maven'],
        [
          'Engenharia',
          'Domain-Driven Design · Clean Architecture · testes unitários (Jest, JUnit) · metodologias ágeis',
        ],
        [
          'Gestão & Liderança',
          'Gestão de Projetos · Planejamento Estratégico · Liderança Técnica · Comunicação com Stakeholders',
        ],
        [
          'AI & Engenharia orientada por especificação',
          'Specification-Driven Development · AI-augmented engineering · workflows humano + agentes de IA · rastreabilidade de decisões arquiteturais',
        ],
      ],
    },
    projects: {
      divider: 'projetos',
      label: 'Trabalhos',
      title: (
        <>
          Projetos em <em>destaque</em>
        </>
      ),
      intro:
        'Nem todo projeto aqui nasceu com o mesmo propósito. Alguns eu fiz pra estudar arquitetura e confiabilidade de verdade; outros só pra resolver um problema chato do dia a dia. Separei por essa diferença.',
    },
    experience: {
      divider: 'experiências',
      label: 'Além da sala de aula',
      title: (
        <>
          Experiências e atividades <em>extracurriculares</em>
        </>
      ),
    },
    contact: {
      label: 'Contato',
      title: (
        <>
          Vamos <em>conversar?</em>
        </>
      ),
      text: 'Se tiver alguma oportunidade, colaboração ou projeto que ache que combina comigo, me chama.',
      email: '✉️ E-mail',
    },
  },
  en: {
    meta: {
      title: 'Portfolio — Duda Brito | Software Engineering & Architecture',
      description:
        "Duda Brito's portfolio – Software Engineering student at the intersection of Software Architecture, System Design, Product Engineering and AI. Real projects and a way of thinking about systems.",
    },
    hero: {
      tag: 'Software Engineering · PUC Minas',
      title: (
        <>
          Systems, architecture
          <br />
          and <em>learning</em>
        </>
      ),
      sub: (
        <>
          I&apos;m exploring the intersection of <strong>software architecture</strong>,{' '}
          <strong>systems design</strong> and <strong>AI</strong>. Particularly interested in{' '}
          <strong>Specification-Driven Development</strong> and in how to structure solutions that
          make sense both technically and for the business. Always learning.
        </>
      ),
      cta: 'View Projects',
      terminal: {
        boot: 'Last login: today · mariab.dev v2 · type help',
        name: 'Duda Brito',
        roles: ['Software Engineering · PUC Minas', 'Software Architecture', 'AI & SDD'],
        hint: 'Type help and press Enter, or use the shortcuts below.',
        inputLabel: 'Terminal command line',
        quickLabel: 'Quick commands',
      },
      pills: [
        'Software Architecture',
        'System Design',
        'Project Management',
        'AI-Augmented Engineering',
      ],
    },
    about: {
      label: 'Who I am',
      title: (
        <>
          About <em>me</em>
        </>
      ),
      photoAlt: 'Photo of Maria Eduarda Brito',
      name: 'Maria Eduarda "Duda" P. Brito',
      role: 'Software Engineering · PUC Minas',
      location: 'Belo Horizonte, Brazil',
      languages: 'Portuguese (native) · English (advanced) · French (basic)',
      bio: [
        <>
          I&apos;m halfway through Software Engineering at PUC Minas (spent some time in Computer
          Science too), and honestly that&apos;s what I do: take a messy problem and figure out how
          to turn it into something structured, something that works technically and actually makes
          sense for whoever&apos;s using it.
        </>,
        <>
          Over time I noticed I like the architecture and planning side of things more than just
          sitting down and coding. That pulled me toward <strong>technical leadership</strong>,{' '}
          <strong>strategic planning</strong>, and figuring out how to connect a technical solution
          to what the business actually needs, talking to stakeholders, hitting deadlines,
          delivering properly.
        </>,
        <>
          I&apos;ve also been paying close attention to how AI is changing the way software gets
          built. Not just as a shortcut to code faster, but as something that changes the whole
          process, from <strong>Specification-Driven Development</strong> to{' '}
          <strong>AI-augmented engineering</strong>. I want to work somewhere humans and AI
          complement each other instead of one replacing the other. In the end, what I want is to
          work between architecture, product and leadership, without forgetting that behind every
          system there&apos;s someone trying to solve a real problem.
        </>,
      ],
      interestsLabel: 'Areas of interest',
      interests: [
        'Software Architecture',
        'System Design',
        'Project Management',
        'Strategic Planning',
        'Artificial Intelligence',
        'Specification-Driven Development',
        'AI-Augmented Engineering',
        'Engineering Leadership',
      ],
    },
    skills: {
      divider: 'stack',
      label: 'Tools',
      title: (
        <>
          What I <em>build with</em>
        </>
      ),
      rows: [
        [
          'Development',
          'Java, Spring Boot · TypeScript, Node.js, Express · React, Next.js · HTML5, CSS3, Tailwind CSS, Bootstrap',
        ],
        [
          'Data & APIs',
          'PostgreSQL, MongoDB, Redis · Prisma ORM · REST APIs, JWT, BCrypt · BullMQ (queues and workers) · AI API integration',
        ],
        ['Infrastructure', 'Docker · GitHub Actions (CI/CD) · Git · Maven'],
        [
          'Engineering',
          'Domain-Driven Design · Clean Architecture · unit testing (Jest, JUnit) · agile methodologies',
        ],
        [
          'Management & Leadership',
          'Project Management · Strategic Planning · Technical Leadership · Stakeholder Communication',
        ],
        [
          'AI & Spec-Driven Engineering',
          'Specification-Driven Development · AI-augmented engineering · human + AI agent workflows · traceable architectural decisions',
        ],
      ],
    },
    projects: {
      divider: 'projects',
      label: 'Work',
      title: (
        <>
          Featured <em>projects</em>
        </>
      ),
      intro:
        "The projects here didn't all start with the same purpose. Some I built to really dig into architecture and reliability; others just to fix some annoying everyday problem. I've split them along that line.",
    },
    experience: {
      divider: 'experience',
      label: 'Beyond the classroom',
      title: (
        <>
          Experience and extracurricular <em>activities</em>
        </>
      ),
    },
    contact: {
      label: 'Contact',
      title: (
        <>
          Let&apos;s <em>talk</em>?
        </>
      ),
      text: "If you've got an opportunity, a collaboration, or a project that seems like a fit, reach out.",
      email: '✉️ Email',
    },
  },
};
