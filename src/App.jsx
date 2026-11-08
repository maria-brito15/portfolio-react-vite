import { useRouter } from './router';
import Home from './pages/Home';
import Services from './pages/Services';
import CaseStudy from './pages/CaseStudy';
import Resume from './pages/Resume';
import Academics from './pages/Academics';
import NotFound from './pages/NotFound';

const routes = {
  '/': Home,
  '/servicos': Services,
  '/estudos-de-caso/whatsapp-dispatcher': CaseStudy,
  '/curriculo': Resume,
  '/resume': Resume,
  '/academico': Academics,
  '/academics': Academics,
};

export default function App() {
  const { path } = useRouter();
  const Page = routes[path.replace(/(.)\/$/, '$1')] ?? NotFound;
  return (
    <>
      <div className="grid-bg" aria-hidden="true"></div>
      <Page />
    </>
  );
}
