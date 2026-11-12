import { Suspense } from 'react';
import { useRouter } from './router';
import { findPageByPath } from './data/routes';
import { TerminalProvider } from './terminal/TerminalSession';
import { PersonaProvider } from './hooks/usePersona';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import {
  Academics,
  CaseStudy,
  GameCenter,
  GithubPage,
  Resume,
  SectionPage,
  Services,
  TerminalPage,
} from './pages/lazyPages';

import GlobalOverlays from './components/GlobalOverlays';
import { Now, Uses } from './pages/InfoPages';
import { WindowProvider } from './components/shell/windowManager';

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
    case 'jogos':
      return <GameCenter />;
    case 'terminal':
      return <TerminalPage />;
    case 'github':
      return <GithubPage />;
    case 'agora':
      return <Now />;
    case 'setup':
      return <Uses />;
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
    <WindowProvider>
      <PersonaProvider>
        <TerminalProvider>
          <Suspense fallback={null}>
            <Page id={route?.id} />
          </Suspense>
          <GlobalOverlays />
        </TerminalProvider>
      </PersonaProvider>
    </WindowProvider>
  );
}
