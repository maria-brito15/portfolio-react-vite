// Fonte única de SEO: título, descrição, URL canônica, Open Graph, Twitter Card
// e JSON-LD de cada página, nos dois idiomas. É lida em dois lugares:
//  - no navegador, por `useDocumentMeta`, a cada troca de rota ou de idioma;
//  - no build, por `scripts/seoPlugin.ts`, que grava um HTML por rota (o que
//    crawlers que não executam JavaScript, como os de link preview, enxergam),
//    além de sitemap.xml.
// Rotas e rótulos vêm de routes.ts; nada de caminho repetido aqui. As tags do <head> e o JSON-LD
// (que dependem do estado de rascunho) estão em seoHead.ts.
//
// Idioma: o site troca PT/EN no cliente (localStorage), sem URL própria por
// idioma. Por isso NÃO há hreflang: ele exige uma URL por versão, e anunciar
// URLs que servem o mesmo HTML seria informação falsa. O HTML estático sai em
// pt-BR (idioma padrão); o inglês é servido ao visitante pelo seletor.

import type { Lang, Localized } from '../types';
import { normalizePath } from './routes';

export const SITE_URL = 'https://mariabdev.netlify.app';
export const SITE_NAME = 'Duda Brito';
export const FULL_NAME = 'Maria Eduarda de Paula Brito';
export const OG_IMAGE = '/assets/og-image.png';
export const NOT_FOUND_ID = 'notFound';

export interface PageMeta {
  title: string;
  description: string;
}

const M = (pt: PageMeta, en: PageMeta): Localized<PageMeta> => ({ pt, en });

// Títulos até ~60 caracteres e descrições até ~160, para não serem cortados nos resultados.
export const pageMeta: Record<string, Localized<PageMeta>> = {
  home: M(
    {
      title: 'Duda Brito | Engenharia de Software e Arquitetura de Software',
      description:
        'Portfólio de Duda Brito, estudante de Engenharia de Software na PUC Minas. Arquitetura de software, system design, back-end e full-stack em projetos reais.',
    },
    {
      title: 'Duda Brito | Software Engineering and Software Architecture',
      description:
        'Portfolio of Duda Brito, Software Engineering student at PUC Minas. Software architecture, system design, backend and full-stack development in real projects.',
    },
  ),
  sobre: M(
    {
      title: 'Sobre Duda Brito | Estudante de Engenharia de Software',
      description:
        'Quem é Duda Brito: estudante de Engenharia de Software na PUC Minas, com interesse em arquitetura de software, system design, liderança técnica e IA.',
    },
    {
      title: 'About Duda Brito | Software Engineering Student',
      description:
        'Who Duda Brito is: a Software Engineering student at PUC Minas interested in software architecture, system design, technical leadership and AI.',
    },
  ),
  habilidades: M(
    {
      title: 'Habilidades e Stack | Duda Brito, Back-end e Full-Stack',
      description:
        'Stack de Duda Brito com tempo de uso: Java, TypeScript, Node.js, React, PostgreSQL, Docker e práticas como Clean Architecture, DDD e testes automatizados.',
    },
    {
      title: 'Skills and Stack | Duda Brito, Backend and Full-Stack',
      description:
        "Duda Brito's stack with time in use: Java, TypeScript, Node.js, React, PostgreSQL, Docker and practices such as Clean Architecture, DDD and automated testing.",
    },
  ),
  projetos: M(
    {
      title: 'Projetos de Software | Duda Brito, Back-end e Full-Stack',
      description:
        'Projetos de Duda Brito com stack, decisões de arquitetura e repositórios: EcoShop, ShortURL, WhatsApp Dispatcher, Planoriza e este portfólio.',
    },
    {
      title: 'Software Projects | Duda Brito, Backend and Full-Stack',
      description:
        "Duda Brito's projects with stack, architecture decisions and repositories: EcoShop, ShortURL, WhatsApp Dispatcher, Planoriza and this portfolio.",
    },
  ),
  experiencias: M(
    {
      title: 'Experiências e Atividades | Duda Brito',
      description:
        'Atividades acadêmicas, cursos e reconhecimentos de Duda Brito ao longo da graduação em Engenharia de Software na PUC Minas.',
    },
    {
      title: 'Experience and Activities | Duda Brito',
      description:
        "Duda Brito's academic activities, courses and recognitions during the Software Engineering degree at PUC Minas.",
    },
  ),
  contato: M(
    {
      title: 'Contato | Duda Brito, Engenharia de Software',
      description:
        'Fale com Duda Brito sobre oportunidades, colaborações ou projetos de software: e-mail, LinkedIn e GitHub.',
    },
    {
      title: 'Contact | Duda Brito, Software Engineering',
      description:
        'Get in touch with Duda Brito about opportunities, collaborations or software projects: email, LinkedIn and GitHub.',
    },
  ),
  curriculo: M(
    {
      title: 'Currículo | Duda Brito, Estágio em Engenharia de Software',
      description:
        'Currículo de Maria Eduarda Brito, estudante de Engenharia de Software na PUC Minas: competências técnicas, projetos, formação e experiências.',
    },
    {
      title: 'Resume | Duda Brito, Software Engineering Internship',
      description:
        'Resume of Maria Eduarda Brito, Software Engineering student at PUC Minas: technical skills, projects, education and experience.',
    },
  ),
  academico: M(
    {
      title: 'Acadêmico | Duda Brito, Engenharia de Software na PUC Minas',
      description:
        'Trajetória acadêmica de Maria Eduarda Brito na PUC Minas: formação, projetos finalistas, monitoria, extensão e competições.',
    },
    {
      title: 'Academics | Duda Brito, Software Engineering at PUC Minas',
      description:
        "Maria Eduarda Brito's academic record at PUC Minas: degrees, finalist projects, teaching assistantship, outreach and competitions.",
    },
  ),
  servicos: M(
    {
      title: 'Serviços de Desenvolvimento Web | Duda Brito',
      description:
        'Sites institucionais, e-commerce e sistemas sob medida, do design ao deploy. Serviços de desenvolvimento web de Duda Brito.',
    },
    {
      title: 'Web Development Services | Duda Brito',
      description:
        'Institutional websites, e-commerce and custom systems, from design to deploy. Web development services by Duda Brito.',
    },
  ),
  agora: M(
    {
      title: 'Agora | Duda Brito',
      description:
        'Página "agora" de Duda Brito, estudante de Engenharia de Software: no que ela está focada neste momento.',
    },
    {
      title: 'Now | Duda Brito',
      description:
        'The "now" page of Duda Brito, a Software Engineering student: what she is focused on at the moment.',
    },
  ),
  setup: M(
    {
      title: 'Setup | Duda Brito',
      description:
        'As ferramentas e o setup que Duda Brito, estudante de Engenharia de Software, usa no dia a dia.',
    },
    {
      title: 'Setup | Duda Brito',
      description:
        'The tools and setup that Duda Brito, a Software Engineering student, uses every day.',
    },
  ),
  pessoal: M(
    {
      title: 'Pessoal | Livros, Filmes, Música e Teatro | Duda Brito',
      description:
        'Livros, filmes, música e teatro de Duda Brito: um espaço editorial sobre o que ela lê, assiste, ouve e vê no palco, fora do código.',
    },
    {
      title: 'Personal | Books, Films, Music and Theater | Duda Brito',
      description:
        'Books, films, music and theater by Duda Brito: an editorial space about what she reads, watches, listens to and sees on stage, beyond code.',
    },
  ),
  'pessoal-livros': M(
    {
      title: 'Livros | Leituras de Duda Brito',
      description:
        'Os livros que Duda Brito está lendo, já leu e quer ler, com notas e datas, numa estante editorial do portfólio.',
    },
    {
      title: 'Books | Reading of Duda Brito',
      description:
        'The books Duda Brito is reading, has read and wants to read, with ratings and dates, on an editorial shelf of the portfolio.',
    },
  ),
  'pessoal-filmes': M(
    {
      title: 'Filmes | Diário de Cinema de Duda Brito',
      description:
        'O diário de filmes de Duda Brito: o que ela assistiu, com nota, data e resenhas, em ordem cronológica por mês.',
    },
    {
      title: 'Films | Film Diary of Duda Brito',
      description:
        "Duda Brito's film diary: what she watched, with ratings, dates and reviews, in chronological order by month.",
    },
  ),
  'pessoal-musica': M(
    {
      title: 'Música | Discos e Artistas | Duda Brito',
      description:
        'A seleção de música de Duda Brito: discos e artistas que ela escolheu mostrar, com notas editoriais curtas, sem player embutido.',
    },
    {
      title: 'Music | Records and Artists | Duda Brito',
      description:
        "Duda Brito's music selection: records and artists she chose to show, with short editorial notes and no embedded player.",
    },
  ),
  'pessoal-teatro': M(
    {
      title: 'Teatro | Peças Vistas por Duda Brito',
      description:
        'As peças de teatro que Duda Brito viu: título, companhia, local e data, numa linha do tempo editorial do portfólio.',
    },
    {
      title: 'Theater | Plays Seen by Duda Brito',
      description:
        'The plays Duda Brito has seen: title, company, venue and date, on an editorial timeline of the portfolio.',
    },
  ),
  'whatsapp-dispatcher': M(
    {
      title: 'WhatsApp Dispatcher: Estudo de Caso de Arquitetura | Duda Brito',
      description:
        'Estudo de caso de arquitetura de um sistema de disparo de mensagens no WhatsApp: DDD, Clean Architecture, filas com BullMQ e Redis, idempotência e trade-offs.',
    },
    {
      title: 'WhatsApp Dispatcher: Architecture Case Study | Duda Brito',
      description:
        'Architecture case study of a WhatsApp message dispatch system: DDD, Clean Architecture, BullMQ and Redis queues, idempotency and trade-offs.',
    },
  ),
  terminal: M(
    {
      title: 'Terminal | Linha de Comando do Portfólio | Duda Brito',
      description:
        'O terminal interativo do portfólio de Duda Brito: navegue pelas páginas, rode comandos e veja a documentação de todos eles.',
    },
    {
      title: 'Terminal | Portfolio Command Line | Duda Brito',
      description:
        "Duda Brito's interactive portfolio terminal: browse the pages, run commands and read the documentation for all of them.",
    },
  ),
  github: M(
    {
      title: 'GitHub | Números e Repositórios | Duda Brito',
      description:
        'Números públicos do GitHub de Duda Brito (repositórios, estrelas, seguidores, contribuições e linguagens) e os repositórios dos projetos do portfólio.',
    },
    {
      title: 'GitHub | Numbers and Repositories | Duda Brito',
      description:
        "Duda Brito's public GitHub numbers (repositories, stars, followers, contributions and languages) and the repositories of the portfolio projects.",
    },
  ),
  [NOT_FOUND_ID]: M(
    {
      title: 'Página não encontrada | Duda Brito',
      description: 'Esta página não existe. Volte ao terminal do portfólio de Duda Brito.',
    },
    {
      title: 'Page not found | Duda Brito',
      description: "This page doesn't exist. Go back to Duda Brito's portfolio terminal.",
    },
  ),
};

// Qualquer id sem meta cai no 404.
export const metaFor = (id: string, lang: Lang): PageMeta =>
  (pageMeta[id] ?? pageMeta[NOT_FOUND_ID])[lang];

export const absoluteUrl = (path: string) => `${SITE_URL}${normalizePath(path)}`;
