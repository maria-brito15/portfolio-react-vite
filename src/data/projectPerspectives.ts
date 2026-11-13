// Perspectivas dos projetos por persona (docs/specs/projetos-contextuais/). Camada de
// apresentação: o projeto continua existindo uma única vez em `projects.tsx`; aqui só se
// escolhe, para cada persona, o que destacar e com que palavras. Todo fato vem do próprio
// projeto, do currículo (`resume.ts`) ou do estudo de caso; nada de métrica ou papel novo.
// Projeto ou persona sem entrada: a apresentação padrão, sem mudança.
import type { Localized } from '../types';
import type { PersonaId } from './personas';

const L = (pt: string, en: string): Localized => ({ pt, en });

export interface ProjectPerspective {
  summary: Localized;
  // No máximo três, curtos.
  highlights: Localized[];
  // Qual link que o projeto já tem merece destaque para esta persona.
  action?: 'caseStudy' | 'repo';
}

export type PerspectiveSet = Partial<Record<PersonaId, ProjectPerspective>>;

export const MAX_HIGHLIGHTS = 3;

// Rótulo do bloco: diz sob qual ótica o projeto está sendo mostrado.
export const PERSPECTIVE_LABEL: Record<PersonaId, Localized> = {
  rh: L('O que este projeto demonstra', 'What this project shows'),
  tech: L('Visão técnica', 'Technical view'),
  professor: L('Contexto acadêmico', 'Academic context'),
  cliente: L('Problema e solução', 'Problem and solution'),
  amigo: L('Em poucas palavras', 'In a nutshell'),
};

export const projectPerspectives: Record<string, PerspectiveSet> = {
  ecoshop: {
    rh: {
      summary: L(
        'Trabalho de faculdade entre os finalistas do semestre, que a Duda reescreveu do zero, sozinha.',
        'A university project among the semester finalists, which Duda rewrote from scratch, on her own.',
      ),
      highlights: [
        L(
          'Finalista dos melhores trabalhos do semestre · PUC Minas 2025',
          "Finalist among the semester's best projects · PUC Minas 2025",
        ),
        L('Testes automatizados com JUnit 5 e Mockito', 'Automated tests with JUnit 5 and Mockito'),
        L(
          'CI/CD com GitHub Actions: lint, type-check, build e deploy',
          'CI/CD with GitHub Actions: lint, type-check, build and deploy',
        ),
      ],
    },
    tech: {
      summary: L(
        'O mesmo produto em duas arquiteturas: MVC em camadas com Java e JDBC (v1) e Next.js 15 com Prisma e JWT stateless (v2).',
        'The same product in two architectures: layered MVC with Java and JDBC (v1) and Next.js 15 with Prisma and stateless JWT (v2).',
      ),
      highlights: [
        L(
          'Cache em duas camadas: Redis no servidor e Map stale-while-revalidate no cliente',
          'Two-layer cache: Redis on the server and a stale-while-revalidate Map on the client',
        ),
        L(
          'Validação com Zod em todas as rotas e middleware centralizado',
          'Zod validation on every route and centralized middleware',
        ),
        L(
          'Azure Custom Vision e Gemini com degradação graciosa',
          'Azure Custom Vision and Gemini with graceful degradation',
        ),
      ],
      action: 'repo',
    },
    professor: {
      summary: L(
        'Começou como trabalho de faculdade, selecionado entre os melhores do semestre, e foi reescrito depois: as duas versões podem ser comparadas.',
        'It started as a university project, picked among the semester’s best, and was rewritten later: the two versions can be compared.',
      ),
      highlights: [
        L(
          'v1: MVC em camadas (Controller, Service, DAO), sanitização contra XSS e autenticação com BCrypt',
          'v1: layered MVC (Controller, Service, DAO), XSS sanitization and BCrypt authentication',
        ),
        L(
          'v2: ORM tipado, JWT stateless, validação com Zod e cache em duas camadas',
          'v2: typed ORM, stateless JWT, Zod validation and two-layer cache',
        ),
        L(
          'Finalista dos melhores trabalhos do semestre · PUC Minas 2025',
          "Finalist among the semester's best projects · PUC Minas 2025",
        ),
      ],
    },
    cliente: {
      summary: L(
        'Loja virtual sustentável que identifica materiais recicláveis a partir de uma imagem e analisa a sustentabilidade com IA.',
        'A sustainable online store that identifies recyclable materials from an image and analyzes sustainability with AI.',
      ),
      highlights: [
        L(
          'Identificação de materiais recicláveis por imagem',
          'Recyclable materials identified from an image',
        ),
        L('Análise de sustentabilidade com IA', 'Sustainability analysis with AI'),
        L(
          'Se um serviço externo de IA falha, o sistema segue funcionando',
          'If an external AI service fails, the system keeps working',
        ),
      ],
    },
    amigo: {
      summary: L(
        'Uma loja online que reconhece materiais recicláveis numa foto e analisa a sustentabilidade com IA.',
        'An online store that recognizes recyclable materials in a photo and analyzes sustainability with AI.',
      ),
      highlights: [
        L(
          'Nasceu como trabalho de faculdade; a Duda reescreveu tudo do zero, sozinha',
          'It started as a university project; Duda rewrote everything from scratch, on her own',
        ),
        L(
          'O mais interessante é a distância entre a primeira e a segunda versão',
          'The most interesting part is the gap between the first and the second version',
        ),
      ],
    },
  },

  'whatsapp-dispatcher': {
    rh: {
      summary: L(
        'Resposta a um desafio técnico de estágio. A implementação é parcial; o estudo de caso documenta o raciocínio por trás de cada decisão.',
        'An answer to an internship technical challenge. The implementation is partial; the case study documents the reasoning behind each decision.',
      ),
      highlights: [
        L(
          'Planejamento em nove fases inspirado em Domain-Driven Design',
          'Nine-phase plan inspired by Domain-Driven Design',
        ),
        L(
          'Registra o que foi ganho e o que foi cedido em cada decisão',
          'Records what was gained and what was given up in each decision',
        ),
        L(
          'Explica conceitos técnicos com analogias e glossário',
          'Explains technical concepts with analogies and a glossary',
        ),
      ],
      action: 'caseStudy',
    },
    tech: {
      summary: L(
        'Disparador de mensagens em camadas: regras de negócio separadas da infraestrutura, fila de processamento e três processos (organizador, remetente e corretor).',
        'A layered message dispatcher: business rules separated from infrastructure, a processing queue and three processes (scheduler, sender and reconciliation).',
      ),
      highlights: [
        L(
          'Fila com BullMQ e Redis, que também serve de cache e de trava',
          'Queue with BullMQ and Redis, which also serves as cache and lock',
        ),
        L(
          'Idempotência: ninguém recebe a mesma mensagem duas vezes',
          'Idempotency: nobody receives the same message twice',
        ),
        L(
          'Trade-offs por decisão e o que mudaria em produção',
          'Trade-offs for each decision and what would change in production',
        ),
      ],
      action: 'caseStudy',
    },
    professor: {
      summary: L(
        'Estudo de caso que registra decisões de arquitetura: o problema, as alternativas descartadas e onde o escopo foi limitado.',
        'A case study that records architecture decisions: the problem, the discarded alternatives and where the scope was limited.',
      ),
      highlights: [
        L(
          'Conceitos: Domain-Driven Design, Clean Architecture e arquitetura hexagonal',
          'Concepts: Domain-Driven Design, Clean Architecture and hexagonal architecture',
        ),
        L(
          'Separa o que é implementação (parcial) do que é análise posterior',
          'Separates what is implementation (partial) from what is later analysis',
        ),
        L('Glossário ao final do estudo', 'Glossary at the end of the study'),
      ],
      action: 'caseStudy',
    },
    cliente: {
      summary: L(
        'Sistema de disparo de mensagens no WhatsApp para campanhas e fluxos automáticos, como um lembrete de pagamento.',
        'A WhatsApp message dispatch system for campaigns and automated flows, such as a payment reminder.',
      ),
      highlights: [
        L(
          'Falhas parciais são tratadas como parte normal da operação',
          'Partial failures are treated as a normal part of operation',
        ),
        L(
          'Cada pessoa recebe a mesma mensagem uma única vez',
          'Each person receives the same message only once',
        ),
        L(
          'Atenção: a implementação original é parcial; o que existe completo é o estudo de caso',
          'Note: the original implementation is partial; what exists in full is the case study',
        ),
      ],
    },
    amigo: {
      summary: L(
        'Um disparador de mensagens do WhatsApp, do tipo usado em campanhas, e a história de como pensar um sistema assim.',
        'A WhatsApp message dispatcher, the kind used for campaigns, and the story of how to think through such a system.',
      ),
      highlights: [
        L(
          'Nasceu de um desafio técnico de estágio',
          'It came from an internship technical challenge',
        ),
        L(
          'Exemplos do dia a dia: um lembrete de pagamento ou um “sentimos sua falta”',
          'Everyday examples: a payment reminder or a “we miss you” message',
        ),
      ],
      action: 'caseStudy',
    },
  },

  planoriza: {
    rh: {
      summary: L(
        'Projeto finalista entre os melhores trabalhos do semestre na PUC Minas.',
        "A finalist project among the semester's best works at PUC Minas.",
      ),
      highlights: [
        L(
          'Decisão de produto: o limite diário de tarefas existe para prevenir burnout',
          'A product decision: the daily task limit exists to prevent burnout',
        ),
        L(
          'Regras de negócio, streak, calendário interativo e temporizador integrado',
          'Business rules, streak, interactive calendar and built-in timer',
        ),
        L('HTML5, CSS3 e JavaScript', 'HTML5, CSS3 and JavaScript'),
      ],
    },
    tech: {
      summary: L(
        'Aplicação em HTML5, CSS3 e JavaScript com regras de negócio explícitas: limite diário de tarefas, streak, calendário e temporizador.',
        'An HTML5, CSS3 and JavaScript application with explicit business rules: daily task limit, streak, calendar and timer.',
      ),
      highlights: [
        L('Regra central: limite de tarefas por dia', 'Core rule: a cap on tasks per day'),
        L('Streak para manter a consistência', 'Streak to keep consistency'),
        L(
          'Calendário interativo e temporizador integrado',
          'Interactive calendar and built-in timer',
        ),
      ],
    },
    professor: {
      summary: L(
        'Parte de um problema que quase todo estudante conhece: listas de tarefas que crescem mais do que dá para cumprir e geram frustração.',
        'It starts from a problem almost every student knows: to-do lists that grow past what can be done and cause frustration.',
      ),
      highlights: [
        L(
          'Finalista dos melhores trabalhos do semestre · PUC Minas 2025',
          "Finalist among the semester's best projects · PUC Minas 2025",
        ),
        L(
          'Solução: limite diário, streak, calendário e temporizador',
          'Solution: daily limit, streak, calendar and timer',
        ),
        L('Aparece na linha do tempo acadêmica de 2025', 'Appears on the 2025 academic timeline'),
      ],
    },
    cliente: {
      summary: L(
        'Ajuda a não se sobrecarregar: limita quantas tarefas cabem em um dia e incentiva a constância.',
        'Helps avoid overload: it caps how many tasks fit in a day and encourages consistency.',
      ),
      highlights: [
        L('Limite diário de tarefas', 'Daily task limit'),
        L('Streak para manter a consistência', 'Streak to keep consistency'),
        L('Calendário interativo e temporizador', 'Interactive calendar and timer'),
      ],
    },
    amigo: {
      summary: L(
        'Um app de tarefas que não deixa você se empolgar demais: tem limite por dia.',
        'A to-do app that will not let you get carried away: it has a daily limit.',
      ),
      highlights: [
        L(
          'Nasceu de um problema que quase todo estudante conhece',
          'It came from a problem almost every student knows',
        ),
        L('Tem streak, calendário e temporizador', 'It has a streak, a calendar and a timer'),
      ],
    },
  },

  portfolio: {
    rh: {
      summary: L(
        'Um projeto completo e bilíngue, feito a partir de especificações com requisitos rastreáveis.',
        'A complete, bilingual project, built from specifications with traceable requirements.',
      ),
      highlights: [
        L(
          'Cada funcionalidade nasceu de uma especificação (SDD)',
          'Every feature started from a specification (SDD)',
        ),
        L('TypeScript estrito e testes automatizados', 'Strict TypeScript and automated tests'),
        L(
          'Português e inglês, tema claro e escuro',
          'Portuguese and English, light and dark theme',
        ),
      ],
    },
    tech: {
      summary: L(
        'React 19 e Vite, com roteador próprio e TypeScript estrito. A home é um terminal e cada página é uma janela do mesmo ambiente.',
        'React 19 and Vite, with a custom router and strict TypeScript. The home is a terminal and each page is a window in the same environment.',
      ),
      highlights: [
        L(
          'Spec-Driven Development: requisitos rastreáveis por funcionalidade',
          'Spec-Driven Development: traceable requirements for each feature',
        ),
        L('Roteador próprio, sem biblioteca de rotas', 'Custom router, no routing library'),
        L('Testes com Vitest', 'Tests with Vitest'),
      ],
      action: 'repo',
    },
    professor: {
      summary: L(
        'Aplica Spec-Driven Development, tema de estudo atual da Duda: cada funcionalidade parte de uma especificação.',
        'Applies Spec-Driven Development, Duda’s current study focus: every feature starts from a specification.',
      ),
      highlights: [
        L(
          'Requisitos rastreáveis e status por funcionalidade',
          'Traceable requirements and a status per feature',
        ),
        L(
          'Foco atual: SDD, desenvolvimento agêntico e IA',
          'Current focus: SDD, agentic development and AI',
        ),
      ],
    },
    cliente: {
      summary: L(
        'Exemplo de um site completo: bilíngue, com tema claro e escuro, páginas próprias e código no GitHub.',
        'An example of a complete website: bilingual, with light and dark themes, dedicated pages and code on GitHub.',
      ),
      highlights: [
        L('Português e inglês', 'Portuguese and English'),
        L('Tema claro e escuro', 'Light and dark theme'),
        L('Código no GitHub', 'Code on GitHub'),
      ],
    },
    amigo: {
      summary: L(
        'Você está dentro dele agora: a home é uma linha de comando e cada página é uma janela.',
        'You are inside it right now: the home is a command line and each page is a window.',
      ),
      highlights: [
        L(
          'Tem campo minado e comandos para descobrir',
          'It has Minesweeper and commands to discover',
        ),
        L('Troca de tema e de idioma', 'Theme and language switching'),
      ],
    },
  },
};

export const perspectiveFor = (
  projectId: string,
  personaId: PersonaId | undefined,
): ProjectPerspective | undefined =>
  personaId ? projectPerspectives[projectId]?.[personaId] : undefined;
