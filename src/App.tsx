import { useRouter } from './router';
import { findPageByPath } from './data/routes';
import { TerminalProvider } from './terminal/TerminalSession';
import Home from './pages/Home';
import Services from './pages/Services';
import CaseStudy from './pages/CaseStudy';
import Resume from './pages/Resume';
import Academics from './pages/Academics';
import SectionPage from './pages/SectionPage';
import NotFound from './pages/NotFound';
import MobileNoticeModal from './components/MobileNoticeModal';

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
    <TerminalProvider>
      <Page id={route?.id} />
      <MobileNoticeModal />
    </TerminalProvider>
  );
}
