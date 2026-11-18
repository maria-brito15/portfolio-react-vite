import { Suspense } from 'react';
import { useRouter } from './router';
import { findPageByPath } from './data/routes';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import {
  Academics,
  CaseStudy,
  GithubPage,
  PersonalBooks,
  PersonalFilms,
  PersonalHub,
  PersonalMusic,
  PersonalTheater,
  Resume,
  SectionPage,
  Services,
  TerminalPage,
} from './pages/lazyPages';

import SiteShell from './components/shell/SiteShell';
import GlobalOverlays from './components/GlobalOverlays';
import { Now, Uses } from './pages/InfoPages';

// Rota (src/data/routes.ts) → página.
function Page({ id }: { id?: string }) {
  switch (id) {
    case 'home':
      return <Home />;
    case 'sobre':
    case 'habilidades':
    case 'projetos':
    case 'experiencias':
    case 'contato':
      return <SectionPage routeId={id} />;
    case 'curriculo':
      return <Resume />;
    case 'academico':
      return <Academics />;
    case 'servicos':
      return <Services />;
    case 'terminal':
      return <TerminalPage />;
    case 'github':
      return <GithubPage />;
    case 'agora':
      return <Now />;
    case 'setup':
      return <Uses />;
    case 'pessoal':
      return <PersonalHub />;
    case 'pessoal-livros':
      return <PersonalBooks />;
    case 'pessoal-filmes':
      return <PersonalFilms />;
    case 'pessoal-musica':
      return <PersonalMusic />;
    case 'pessoal-teatro':
      return <PersonalTheater />;
    case 'whatsapp-dispatcher':
      return <CaseStudy />;
    default:
      return <NotFound />;
  }
}

export default function App() {
  const { path } = useRouter();
  const route = findPageByPath(path);

  return (
    <>
      <SiteShell bare={route?.bare}>
        <Suspense fallback={null}>
          <Page id={route?.id} />
        </Suspense>
      </SiteShell>
      {!route?.bare && <GlobalOverlays />}
    </>
  );
}
