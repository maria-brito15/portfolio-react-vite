// Trilhas por persona: percursos curtos e opcionais feitos só com o que o site já
// tem (docs/specs/trilhas/). Cada trilha é DADO: o motor do tour, o cartão da home
// e o comando `trilha` leem daqui. Os textos são os aprovados em `textos.md`; os
// números saem dos dados do site na hora (nada digitado à mão, TR-03). Os ids de
// rota, âncora e comando são conferidos por `trails.test.tsx`.
import type { Lang, Localized } from '../types';
import { experienceGroups } from './experiences';
import type { PersonaId } from './personas';
import { projects } from './projects';
import { experienceStats, finalistProjects } from '../utils/resume';

const L = (pt: string, en: string): Localized => ({ pt, en });

export type StepKind = 'ver' | 'fazer' | 'achar' | 'agir';

export type TrailAction = { kind: 'link'; route: string; anchor?: string } | { kind: 'print' };

export interface TrailStep {
  id: string;
  kind: StepKind;
  // Id de rota (routes.ts) onde o passo acontece.
  route: string;
  // Id do elemento na página (as mesmas âncoras de sections.ts); sem ele, o `h1`.
  anchor?: string;
  // `fazer`: comando em português (commands.tsx).
  command?: string;
  // `agir`: o que o cartão do tour oferece.
  action?: TrailAction;
  // Só entra quando o assistente de IA está publicado (TR-05).
  when?: 'assistant';
  text: (lang: Lang) => string;
}

// `checklist`: "viu N de M". `bar`: barra de progresso. `achievements`: conquistas.
export type TrailStyle = 'checklist' | 'bar' | 'achievements';

export interface Trail {
  persona: PersonaId;
  style: TrailStyle;
  title: Localized;
  intro: Localized;
  // `found`/`total`: segredos achados (só a trilha de conquistas usa).
  outro: (lang: Lang, found: number, total: number) => string;
  steps: TrailStep[];
}

const t = (pt: string, en: string) => (lang: Lang) => (lang === 'pt' ? pt : en);

const exp = experienceStats(experienceGroups);
const finalists = finalistProjects(projects).length;

export const trails: Trail[] = [
  {
    persona: 'rh',
    style: 'checklist',
    title: L('Resumo em 60 segundos', '60-second summary'),
    intro: L(
      'Em cinco paradas, o que importa para avaliar uma candidatura. Dá para sair a qualquer momento.',
      'Five stops with what matters when reviewing an application. You can leave at any time.',
    ),
    outro: t(
      'Pronto. Se quiser conversar, o contato está a um clique.',
      'Done. If you would like to talk, contact is one click away.',
    ),
    steps: [
      {
        id: 'resumo',
        kind: 'ver',
        route: 'curriculo',
        anchor: 'resumo',
        text: t(
          'Comece pelo resumo: quem é a Duda e o que ela busca.',
          'Start with the summary: who Duda is and what she is looking for.',
        ),
      },
      {
        id: 'competencias',
        kind: 'ver',
        route: 'curriculo',
        anchor: 'competencias',
        text: t(
          'Aqui estão as competências técnicas, com o tempo de uso de cada uma.',
          'Here are the technical skills, with how long each has been used.',
        ),
      },
      {
        id: 'experiencias',
        kind: 'ver',
        route: 'curriculo',
        anchor: 'experiencias-cv',
        text: (lang) =>
          lang === 'pt'
            ? `${exp.count} atividades desde ${exp.firstYear}: o que ela já fez além das aulas.`
            : `${exp.count} activities since ${exp.firstYear}: what she has done beyond class.`,
      },
      {
        id: 'formacao',
        kind: 'ver',
        route: 'curriculo',
        anchor: 'formacao',
        text: t('Formação e idiomas.', 'Education and languages.'),
      },
      {
        id: 'curriculo-pdf',
        kind: 'agir',
        route: 'curriculo',
        action: { kind: 'print' },
        text: t(
          'Leve o currículo: imprima ou salve em PDF.',
          'Take the resume with you: print it or save it as PDF.',
        ),
      },
    ],
  },
  {
    persona: 'tech',
    style: 'checklist',
    title: L('Tour do código', 'Code tour'),
    intro: L(
      'Projetos, decisões e números reais, em poucas paradas.',
      'Projects, decisions and real numbers, in a few stops.',
    ),
    outro: t(
      'Fim do tour. Os repositórios também estão nas páginas dos projetos.',
      'End of the tour. The repositories are also on the project pages.',
    ),
    steps: [
      {
        id: 'projetos',
        kind: 'ver',
        route: 'projetos',
        text: (lang) =>
          lang === 'pt'
            ? `${projects.length} projetos, ${finalists} finalistas: comece pela lista, com a stack de cada um.`
            : `${projects.length} projects, ${finalists} finalists: start with the list and each one's stack.`,
      },
      {
        id: 'ecoshop',
        kind: 'ver',
        route: 'projetos',
        anchor: 'projeto-ecoshop',
        text: t(
          'O EcoShop existe em duas versões: veja a distância entre elas.',
          'EcoShop exists in two versions: see the distance between them.',
        ),
      },
      {
        id: 'estudo-de-caso',
        kind: 'ver',
        route: 'whatsapp-dispatcher',
        text: t(
          'O estudo de caso mostra as decisões de arquitetura por trás do WhatsApp Dispatcher.',
          'The case study shows the architecture decisions behind WhatsApp Dispatcher.',
        ),
      },
      {
        id: 'stats',
        kind: 'fazer',
        route: 'terminal',
        anchor: 'terminal',
        command: 'stats',
        text: t(
          'No terminal, rode `stats` para ver números do próprio site.',
          'In the terminal, run `stats` to see numbers about the site itself.',
        ),
      },
      {
        id: 'pergunte',
        kind: 'fazer',
        route: 'terminal',
        anchor: 'terminal',
        command: 'pergunte',
        when: 'assistant',
        text: t(
          'Pergunte algo sobre a Duda: ele responde só com o que está no site.',
          'Ask something about Duda: it answers only from what is on the site.',
        ),
      },
      {
        id: 'github',
        kind: 'agir',
        route: 'projetos',
        action: { kind: 'link', route: 'github' },
        text: t(
          'Veja os números públicos do GitHub e os repositórios dos projetos.',
          'See the public GitHub numbers and the project repositories.',
        ),
      },
    ],
  },
  {
    persona: 'professor',
    style: 'bar',
    title: L('Trajetória acadêmica', 'Academic path'),
    intro: L(
      'Do começo da graduação até hoje, com notas e atividades.',
      'From the start of the degree to today, with grades and activities.',
    ),
    outro: t(
      'Fim da trajetória. O contato está a um clique.',
      'End of the path. Contact is one click away.',
    ),
    steps: [
      {
        id: 'linha-do-tempo',
        kind: 'ver',
        route: 'academico',
        anchor: 'trajetoria',
        text: t(
          'A linha do tempo mostra o caminho, da primeira graduação à previsão de conclusão.',
          'The timeline shows the path, from the first degree to the expected completion.',
        ),
      },
      {
        id: 'formacao',
        kind: 'ver',
        route: 'academico',
        anchor: 'formacao-academica',
        text: t(
          'Formação: instituição, curso e anos.',
          'Education: institution, degree and years.',
        ),
      },
      {
        id: 'disciplinas',
        kind: 'ver',
        route: 'academico',
        anchor: 'disciplinas',
        text: t(
          'Disciplinas e notas, semestre a semestre.',
          'Courses and grades, semester by semester.',
        ),
      },
      {
        id: 'atividades',
        kind: 'ver',
        route: 'academico',
        anchor: 'por-ano',
        text: t(
          'Atividades por ano: projetos e experiências ligados a cada período.',
          'Activities by year: projects and experiences tied to each period.',
        ),
      },
      {
        id: 'curriculo',
        kind: 'agir',
        route: 'academico',
        action: { kind: 'link', route: 'curriculo' },
        text: t(
          'Para ter tudo em uma página, abra o currículo.',
          'To have everything on one page, open the resume.',
        ),
      },
    ],
  },
  {
    persona: 'cliente',
    style: 'bar',
    title: L('Do problema à entrega', 'From problem to delivery'),
    intro: L(
      'O que é oferecido, como funciona e como pedir.',
      'What is offered, how it works and how to ask.',
    ),
    outro: t(
      'Pronto. É só preencher o formulário quando quiser.',
      'Done. Just fill in the form whenever you like.',
    ),
    steps: [
      {
        id: 'servicos',
        kind: 'ver',
        route: 'servicos',
        anchor: 'servicos',
        text: t('Estes são os serviços oferecidos.', 'These are the services offered.'),
      },
      {
        id: 'cases',
        kind: 'ver',
        route: 'servicos',
        anchor: 'cases',
        text: t(
          'Cases: exemplos do que já foi entregue.',
          'Cases: examples of what has been delivered.',
        ),
      },
      {
        id: 'faq',
        kind: 'ver',
        route: 'servicos',
        anchor: 'faq',
        text: t(
          'As perguntas frequentes respondem prazo, pagamento e domínio.',
          'The FAQ answers timing, payment and domain questions.',
        ),
      },
      {
        id: 'orcamento',
        kind: 'agir',
        route: 'servicos',
        anchor: 'contato',
        action: { kind: 'link', route: 'servicos', anchor: 'contato' },
        text: t(
          'Para pedir um orçamento, use o formulário de contato.',
          'To ask for a quote, use the contact form.',
        ),
      },
    ],
  },
  {
    persona: 'amigo',
    style: 'achievements',
    title: L('Caça aos segredos', 'Secret hunt'),
    intro: L(
      'O site tem comandos escondidos e jogos. Quantos você acha?',
      'The site has hidden commands and games. How many can you find?',
    ),
    outro: (lang, found, total) =>
      lang === 'pt'
        ? `Você achou ${found} de ${total} segredos. Ainda dá para achar mais.`
        : `You found ${found} of ${total} secrets. There are more to find.`,
    steps: [
      {
        id: 'sobre',
        kind: 'ver',
        route: 'sobre',
        anchor: 'sobre',
        text: t('Comece conhecendo a Duda.', 'Start by getting to know Duda.'),
      },
      {
        id: 'jogos',
        kind: 'fazer',
        route: 'terminal',
        anchor: 'terminal',
        command: 'jogos',
        text: t(
          'No terminal, `jogos` lista o que dá para jogar.',
          'In the terminal, `games` lists what you can play.',
        ),
      },
      {
        id: 'minas',
        kind: 'fazer',
        route: 'terminal',
        anchor: 'terminal',
        command: 'minas facil',
        text: t('Que tal uma partida de campo minado?', 'How about a round of minesweeper?'),
      },
      {
        id: 'segredo',
        kind: 'achar',
        route: 'terminal',
        anchor: 'terminal',
        text: t(
          'Há comandos sem aviso na ajuda. Tente algum que você ache que existe.',
          'Some commands are not listed in help. Try one you think exists.',
        ),
      },
      {
        id: 'contato',
        kind: 'agir',
        route: 'terminal',
        action: { kind: 'link', route: 'contato' },
        text: t('Gostou? Diga oi.', 'Enjoyed it? Say hi.'),
      },
    ],
  },
];

// Segredos da trilha de conquistas (TR-20): todos já existem no site. `command` é o
// nome em português; `theme` e `lang` são as trocas de tema e de idioma.
export interface Secret {
  id: string;
  label: Localized;
  trigger: { kind: 'command'; name: string } | { kind: 'theme' } | { kind: 'lang' };
}

export const secrets: Secret[] = [
  { id: 'fortune', label: L('fortune', 'fortune'), trigger: { kind: 'command', name: 'fortune' } },
  { id: 'cowsay', label: L('cowsay', 'cowsay'), trigger: { kind: 'command', name: 'cowsay' } },
  { id: 'matrix', label: L('matrix', 'matrix'), trigger: { kind: 'command', name: 'matrix' } },
  { id: 'boot', label: L('boot', 'boot'), trigger: { kind: 'command', name: 'boot' } },
  { id: 'rm', label: L('rm', 'rm'), trigger: { kind: 'command', name: 'rm' } },
  {
    id: 'minas',
    label: L('campo minado', 'minesweeper'),
    trigger: { kind: 'command', name: 'minas' },
  },
  { id: 'tema', label: L('tema', 'theme'), trigger: { kind: 'theme' } },
  { id: 'idioma', label: L('idioma', 'language'), trigger: { kind: 'lang' } },
];

export const trailFor = (persona: PersonaId | undefined) =>
  persona ? trails.find((trail) => trail.persona === persona) : undefined;

// O passo do assistente só entra quando ele está publicado: a Netlify define
// `VITE_ASK_ENABLED=true` no deploy (ver docs/specs/assistente-ia/operacao.md).
export const assistantAvailable = () => import.meta.env.VITE_ASK_ENABLED === 'true';

export const stepsOf = (trail: Trail, assistant = assistantAvailable()) =>
  trail.steps.filter((step) => step.when !== 'assistant' || assistant);

// Números que os textos podem conter: só os calculados dos dados (teste TR-03).
export const dataNumbers = [projects.length, finalists, exp.count, exp.firstYear];
