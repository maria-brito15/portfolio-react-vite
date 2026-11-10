// Página de serviços do site original (pt/servicos.html e en/servicos.html),
// com os textos preservados.
const faqPt = [
  {
    q: 'Preciso ter domínio e hospedagem antes de contratar?',
    a: 'Não! Cuido de tudo isso pra você. Indico as melhores opções de acordo com o projeto, auxilio na compra e faço toda a configuração. Você não precisa entender de tecnologia para ter um site no ar.',
  },
  {
    q: 'Qual a diferença entre hospedagem e domínio?',
    a: (
      <>
        O <strong>domínio</strong> é o endereço do site (ex: suamarca.com.br) — pago anualmente, em
        média R$ 40/ano. A <strong>hospedagem</strong> é o servidor onde o site fica armazenado — o
        custo varia: sites simples podem usar planos gratuitos, já catálogos e e-commerces precisam
        de servidores pagos (~R$ 80–200/mês).
      </>
    ),
  },
  {
    q: 'Quanto tempo leva pra ficar pronto?',
    a: 'Depende do projeto: landing page ~1 semana, site institucional ~2 semanas, catálogo ~5 semanas, e-commerce completo ~12 semanas.',
  },
  {
    q: 'Vou conseguir mexer no site depois de pronto?',
    a: 'Sim! Projetos com painel administrativo (catálogo e e-commerce) são feitos pra você gerenciar sozinho — adicionar produtos, atualizar preços, editar textos.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Geralmente 50% entrada e 50% na entrega. Pagamento via Pix ou transferência.',
  },
  {
    q: 'O site vai aparecer no Google?',
    a: 'Todos os projetos são entregues com SEO básico configurado: títulos, descrições, estrutura semântica e velocidade otimizada.',
  },
];

const faqEn = [
  {
    q: 'Do I need to have a domain and hosting before hiring?',
    a: 'No! I take care of everything for you. I recommend the best options according to your project, help you purchase, and do all the configuration.',
  },
  {
    q: 'What is the difference between hosting and domain?',
    a: (
      <>
        The <strong>domain</strong> is your website address — paid annually (~$8–15/year).{' '}
        <strong>Hosting</strong> is the server where files live — simple sites can use free plans,
        catalogs/e‑commerce need paid servers (~$20–40/month).
      </>
    ),
  },
  {
    q: 'How long does it take to be ready?',
    a: 'Landing page ~1 week, institutional ~2 weeks, catalog ~5 weeks, full e‑commerce ~12 weeks.',
  },
  {
    q: "Will I be able to edit the website after it's ready?",
    a: 'Yes! Projects with admin panel (catalog and e‑commerce) are built for you to manage on your own — add products, update prices, edit texts.',
  },
  {
    q: 'How does payment work?',
    a: 'Usually 50% upfront, 50% upon delivery. Payment via bank transfer, Pix (Brazil), or PayPal.',
  },
  {
    q: 'Will the website appear on Google?',
    a: 'All projects are delivered with basic SEO configured: titles, descriptions, semantic structure, and optimized speed.',
  },
];

const becasImages = [
  '/cases/becas/1.jpeg',
  '/cases/becas/2.jpeg',
  '/cases/becas/3.jpeg',
  '/cases/becas/4.jpeg',
];
const agapeImages = ['/cases/agape/1.jpg', '/cases/agape/2.jpg', '/cases/agape/3.jpg'];

export const services = {
  pt: {
    meta: {
      title: 'Serviços — Duda Brito | Sites & Sistemas sob medida',
      description:
        'Sites institucionais, e-commerce e sistemas sob medida — do design ao deploy. Serviços de desenvolvimento web de Duda Brito.',
    },
    hero: {
      badge: 'DISPONÍVEL PARA NOVOS PROJETOS',
      title: (
        <>
          Sites & Sistemas
          <br />
          <em>sob medida</em>
        </>
      ),
      sub: (
        <>
          Do design ao deploy. Sites institucionais, e-commerce e sistemas que combinam código
          sólido com visual impecável.{' '}
          <strong>
            Backend robusto (Node.js, Java) e soluções pensadas com arquitetura em mente – evolução,
            manutenibilidade e escalabilidade.
          </strong>
        </>
      ),
      quote: 'Solicitar orçamento →',
      viewServices: 'Ver serviços',
      trust: ['⚡ Produto em Produção', '🎨 Design Incluso', '📱 100% Responsivo'],
    },
    services: {
      label: 'Serviços',
      title: (
        <>
          O que posso
          <br />
          <em>oferecer pra você</em>
        </>
      ),
      items: [
        {
          icon: '🏢',
          title: 'Site Institucional',
          text: 'Site profissional completo com páginas de apresentação, sobre, serviços e contato. Responsivo, rápido e otimizado para o Google.',
          meta: ['💰 a partir de R$ 300', '⏱ ~2 semanas', '🌐 domínio ~R$ 40/ano'],
        },
        {
          icon: '🛍️',
          title: 'Catálogo com WhatsApp',
          text: 'Catálogo dinâmico com painel administrativo. Clientes navegam, escolhem e são redirecionados ao WhatsApp com mensagem automática.',
          meta: ['💰 a partir de R$ 800', '⏱ ~5 semanas', '🌐 ~R$ 100/mês (host + domínio)'],
        },
        {
          icon: '🛒',
          title: 'E-commerce Completo',
          text: 'Plataforma com carrinho, checkout, pagamento online (PIX, cartão, boleto), gestão de pedidos e cálculo de frete automático.',
          meta: ['💰 a partir de R$ 2.500', '⏱ ~12 semanas', '🌐 ~R$ 150–200/mês + 3–5% por venda'],
        },
        {
          icon: '⚡',
          title: 'SPA / Landing Page',
          text: 'Página única de alta conversão para campanhas, lançamentos ou captação de leads. Entregue rápido, com foco em resultado.',
          meta: ['💰 a partir de R$ 200', '⏱ ~1 semana', '🌐 domínio ~R$ 40/ano'],
        },
        {
          icon: '🔧',
          title: 'Manutenção & Melhorias',
          text: 'Atualização de sites existentes, correção de bugs, melhora de performance e SEO, novas seções e funcionalidades.',
          meta: ['💰 sob consulta', '⏱ variável', '🌐 depende da infra atual'],
        },
      ],
      custom: {
        title: 'Não encontrou o que precisa?',
        text: 'Sem problema — cada projeto é único. Me manda uma mensagem mesmo assim e a gente conversa sobre o que você tem em mente.',
        cta: 'manda uma msg →',
      },
      design: {
        label: '✦ Sobre o design',
        title: 'E o design, como fica?',
        text: (
          <>
            Todos os projetos já saem com visual — não precisa se preocupar com isso. Se você{' '}
            <strong>não tem design</strong>, crio a interface usando ferramentas como Figma Make:
            você me passa a ideia, referências ou o estilo que gosta, e eu monto algo adequado pro
            projeto. Se você <strong>já tem um design pronto no Figma</strong> ou uma referência bem
            definida, eu reproduzo com fidelidade ao que foi especificado.
          </>
        ),
        note: '⚠️ Não sou designer profissional — o foco é entregar algo funcional e apresentável. Para projetos que exigem identidade visual elaborada ou branding, recomendo envolver um designer especializado.',
        meta: [
          '🖌️ Figma Make · geração por IA',
          '✏️ Recriação de design especificado',
          '✅ Incluso em todos os projetos',
        ],
      },
    },
    cases: {
      divider: '✦ cases reais',
      label: 'Cases em destaque',
      title: (
        <>
          Projetos <em>entregues</em>
        </>
      ),
      items: [
        {
          id: 'becas',
          badge: '⭐ Case completo — Design + Dev',
          title: 'BECAS | Study Room',
          paragraphs: [
            'Plataforma de materiais educacionais para o ensino superior com foco em Medicina. Fui responsável por todo o processo criativo e técnico: da identidade visual ao sistema em produção.',
            'Design da marca, interface da loja e backend completo com integração Hotmart, processamento de PDFs, autenticação JWT e deploy na Render.',
          ],
          deliverables: [
            'Identidade visual',
            'UI / UX Design',
            'Backend Java',
            'Integração Hotmart',
            'Processamento de PDF',
            'Mobile-first',
          ],
          columns: 2,
          images: becasImages,
          alt: 'BECAS',
        },
        {
          id: 'agape',
          badge: '⭐ Case Design',
          title: 'Ágape Vestir',
          paragraphs: [
            'Marca de moda cristã urbana com identidade forte e propósito claro.',
            'Desenvolvi o design completo: identidade visual da marca, layout editorial e projeto de site institucional com catálogo de coleção — unindo fé, autenticidade e estilo urbano numa experiência visual coesa.',
          ],
          deliverables: [
            'Identidade visual',
            'UI / UX Design',
            'Site responsivo',
            'Catálogo de coleção',
            'Lookbook digital',
          ],
          columns: 3,
          images: agapeImages,
          alt: 'Ágape',
        },
      ],
    },
    faq: { label: 'Dúvidas', title: 'Perguntas frequentes', items: faqPt },
    contact: {
      label: 'Contato',
      title: (
        <>
          Vamos criar
          <br />
          <em>algo incrível?</em>
        </>
      ),
      text: 'Aberta a projetos de sites, e-commerce, catálogos e sistemas. Me manda uma mensagem — respondo rápido!',
      email: '✉️ E-mail',
    },
    footer: 'Feito com 💙 por Duda Brito · Belo Horizonte, MG · 2026',
  },
  en: {
    meta: {
      title: 'Services — Duda Brito | Websites & Systems tailored for you',
      description:
        'Institutional websites, e-commerce and custom systems — from design to deploy. Web development services by Duda Brito.',
    },
    hero: {
      badge: 'OPEN FOR NEW PROJECTS',
      title: (
        <>
          Websites & Systems
          <br />
          <em>tailored for you</em>
        </>
      ),
      sub: (
        <>
          From design to deploy. Institutional websites, e-commerce, and systems that combine solid
          code with flawless design.{' '}
          <strong>
            Robust backend (Node.js, Java) and solutions architected for evolution, maintainability,
            and scalability.
          </strong>
        </>
      ),
      quote: 'Request a quote →',
      viewServices: 'View services',
      trust: ['⚡ Production Ready', '🎨 Design Included', '📱 100% Responsive'],
    },
    services: {
      label: 'Services',
      title: (
        <>
          What I can
          <br />
          <em>offer you</em>
        </>
      ),
      items: [
        {
          icon: '🏢',
          title: 'Institutional Website',
          text: 'Complete professional website with presentation, about, services and contact pages. Responsive, fast and SEO‑friendly.',
          meta: ['💰 starting at $60 USD', '⏱ ~2 weeks', '🌐 domain ~$8/year'],
        },
        {
          icon: '🛍️',
          title: 'Catalog + WhatsApp',
          text: 'Dynamic catalog with admin panel. Customers browse, choose, and are redirected to WhatsApp with automatic message.',
          meta: ['💰 starting at $160 USD', '⏱ ~5 weeks', '🌐 ~$20/month (host + domain)'],
        },
        {
          icon: '🛒',
          title: 'Full E‑commerce',
          text: 'Platform with cart, checkout, online payments (credit card, Pix, boleto), order management and automatic shipping calculation.',
          meta: ['💰 starting at $500 USD', '⏱ ~12 weeks', '🌐 ~$30–40/month + 3–5% per sale'],
        },
        {
          icon: '⚡',
          title: 'SPA / Landing Page',
          text: 'High‑conversion single page for campaigns, launches or lead capture. Delivered fast, result‑focused.',
          meta: ['💰 starting at $40 USD', '⏱ ~1 week', '🌐 domain ~$8/year'],
        },
        {
          icon: '🔧',
          title: 'Maintenance & Improvements',
          text: 'Update existing sites, bug fixes, performance/SEO improvements, new sections and features.',
          meta: ['💰 quote based', '⏱ variable', '🌐 depends on current infra'],
        },
      ],
      custom: {
        title: "Didn't find what you need?",
        text: "No problem — every project is unique. Send me a message anyway and we'll talk about what you have in mind.",
        cta: 'send a message →',
      },
      design: {
        label: '✦ About design',
        title: 'What about the design?',
        text: (
          <>
            All projects already come with a visual — you don&apos;t need to worry about that. If
            you <strong>don&apos;t have a design</strong>, I create the interface using tools like
            Figma Make: you send me the idea, references, or style you like, and I put together
            something suitable for the project. If you{' '}
            <strong>already have a design ready in Figma</strong> or a well‑defined reference, I
            replicate it faithfully.
          </>
        ),
        note: "⚠️ I'm not a professional designer — the focus is to deliver something functional and presentable. For projects that require elaborated visual identity or branding, I recommend involving a specialized designer.",
        meta: [
          '🖌️ Figma Make · AI generation',
          '✏️ Recreation of specified design',
          '✅ Included in all projects',
        ],
      },
    },
    cases: {
      divider: '✦ real cases',
      label: 'Featured case studies',
      title: (
        <>
          Projects <em>delivered</em>
        </>
      ),
      items: [
        {
          id: 'becas',
          badge: '⭐ Complete case — Design + Dev',
          title: 'BECAS | Study Room',
          paragraphs: [
            'Educational materials platform for higher education focused on Medicine. I was responsible for the entire creative and technical process: from visual identity to production system.',
            'Brand design, store interface, and full backend with Hotmart integration, PDF processing, JWT authentication, and deployment on Render.',
          ],
          deliverables: [
            'Visual identity',
            'UI / UX Design',
            'Java Backend',
            'Hotmart Integration',
            'PDF Processing',
            'Mobile-first',
          ],
          columns: 2,
          images: becasImages,
          alt: 'BECAS',
        },
        {
          id: 'agape',
          badge: '⭐ Design case',
          title: 'Ágape Vestir',
          paragraphs: [
            'Urban Christian fashion brand with strong identity and clear purpose.',
            'I developed the complete design: visual identity, editorial layout, and institutional website project with collection catalog — uniting faith, authenticity, and urban style into a cohesive visual experience.',
          ],
          deliverables: [
            'Visual identity',
            'UI / UX Design',
            'Responsive website',
            'Collection catalog',
            'Digital lookbook',
          ],
          columns: 3,
          images: agapeImages,
          alt: 'Ágape',
        },
      ],
    },
    faq: { label: 'Questions', title: 'Frequently Asked Questions', items: faqEn },
    contact: {
      label: 'Contact',
      title: (
        <>
          Let&apos;s create
          <br />
          <em>something amazing?</em>
        </>
      ),
      text: 'Open to website, e‑commerce, catalog, and system projects. Send me a message — I reply fast!',
      email: '✉️ Email',
    },
    footer: 'Made with 💙 by Duda Brito · Belo Horizonte, MG · 2026',
  },
};

export type ServicesContent = (typeof services)['pt'];
