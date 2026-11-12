import { Suspense, useEffect } from 'react';
import { useRouter } from './router';
import { findPageByPath } from './data/routes';
import type { PersonaId } from './data/personas';
import { TerminalProvider } from './terminal/TerminalSession';
import { PersonaProvider, usePersona } from './hooks/usePersona';
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

// `/r/<persona>`: a home com a persona do link já aplicada (PR-07). Grava a escolha,
// então a pergunta não aparece e a lente vale nas próximas páginas.
function PersonaHome({ routeId, persona }: { routeId: string; persona: PersonaId }) {
  const { choose } = usePersona();

  useEffect(() => {
    choose(persona);
  }, [persona, choose]);

  return <Home routeId={routeId} />;
}

// Rota (src/data/routes.ts) → página.
function Page({ id, persona }: { id?: string; persona?: PersonaId }) {
  if (id && persona) return <PersonaHome routeId={id} persona={persona} />;

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
            <Page id={route?.id} persona={route?.persona} />
          </Suspense>
          <GlobalOverlays />
        </TerminalProvider>
      </PersonaProvider>
    </WindowProvider>
  );
}
