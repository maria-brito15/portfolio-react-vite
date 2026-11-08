import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Roteamento mínimo baseado na History API: o site tem poucas páginas, então
// uma biblioteca de rotas completa não se justifica. Cada entrada do histórico
// guarda `{ idx }` (quantas navegações internas existem antes dela): com
// `idx > 0` a página anterior é do próprio site e "Voltar" pode usar history.back().
const RouterContext = createContext(null);

const currentIndex = () => window.history.state?.idx ?? 0;

function readLocation() {
  return {
    path: window.location.pathname,
    hash: window.location.hash,
    search: window.location.search,
    idx: currentIndex(),
  };
}

function scrollToHash(hash) {
  const id = decodeURIComponent(hash.slice(1));
  const target = id && document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: 'smooth' });
  return Boolean(target);
}

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(readLocation);

  useEffect(() => {
    const onPopState = () => setLocation(readLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Depois de cada troca de rota: rola até a âncora, se houver, ou volta ao topo.
  useEffect(() => {
    if (location.hash && scrollToHash(location.hash)) return;
    if (!location.hash) window.scrollTo(0, 0);
  }, [location]);

  // `replace` troca a entrada atual em vez de empilhar uma nova.
  const navigate = useCallback((to, { replace = false } = {}) => {
    const url = new URL(to, window.location.href);
    if (
      url.pathname === window.location.pathname &&
      url.hash === window.location.hash &&
      url.search === window.location.search
    ) {
      if (url.hash) scrollToHash(url.hash);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const idx = replace ? currentIndex() : currentIndex() + 1;
    window.history[replace ? 'replaceState' : 'pushState'](
      { idx },
      '',
      url.pathname + url.search + url.hash,
    );
    setLocation(readLocation());
  }, []);

  // "Voltar": history.back() se a página anterior é do site; senão, a home.
  const back = useCallback(() => {
    if (currentIndex() > 0) window.history.back();
    else navigate('/');
  }, [navigate]);

  const value = useMemo(
    () => ({ ...location, canGoBack: location.idx > 0, navigate, back }),
    [location, navigate, back],
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  return useContext(RouterContext);
}

export function Link({ to, onClick, children, ...rest }) {
  const { navigate } = useRouter();

  function handleClick(event) {
    onClick?.(event);
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.defaultPrevented || event.button !== 0 || modified) return;
    event.preventDefault();
    navigate(to);
  }

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
