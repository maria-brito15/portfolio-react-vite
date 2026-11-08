import { useRouter } from './router';
import { findPageByPath } from './data/routes';
import { TerminalProvider } from './terminal/TerminalSession';
import Home from './pages/Home';
import Services from './pages/Services';
import CaseStudy from './pages/CaseStudy';
import Resume from './pages/Resume';
import Academics from './pages/Academics';
import NotFound from './pages/NotFound';

// Rota (src/data/routes.js) → página.
function Page({ id }) {
  switch (id) {
    case 'home':
      return <Home />;
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
    </TerminalProvider>
  );
}
