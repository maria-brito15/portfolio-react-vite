import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Roteamento mínimo baseado na History API: o site tem só três páginas,
// então uma biblioteca de rotas completa não se justifica.
const RouterContext = createContext(null);

function readLocation() {
  return { path: window.location.pathname, hash: window.location.hash };
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

  const navigate = useCallback((to) => {
    const url = new URL(to, window.location.href);
    const next = { path: url.pathname, hash: url.hash };
    if (next.path === window.location.pathname && next.hash === window.location.hash) {
      if (next.hash) scrollToHash(next.hash);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState(null, '', url.pathname + url.hash);
    setLocation(next);
  }, []);

  const value = useMemo(() => ({ ...location, navigate }), [location, navigate]);
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
