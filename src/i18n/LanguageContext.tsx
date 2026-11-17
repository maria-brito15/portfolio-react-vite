import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { equivalentPath, findPageByPath, langOfPath } from '../data/routes';
import { useRouter } from '../router';
import type { Lang } from '../types';
import { ui } from './ui';

// Chave da escolha explícita do idioma (FR-022): só a faixa e o seletor leem. O idioma da página é
// o do endereço (TD-007), nunca o que está gravado.
const STORAGE_KEY = 'portfolio-lang';

interface LanguageValue {
  lang: Lang;
  t: (typeof ui)[Lang];
  // Escolhe um idioma: navega para a página equivalente nele e grava a escolha.
  setLang: (lang: Lang) => void;
  // Alterna PT e EN (o comando `idioma` do terminal): o mesmo que `setLang` para o outro idioma.
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageValue>({
  lang: 'pt',
  t: ui.pt,
  setLang: () => {},
  toggleLang: () => {},
});

// Endereço da mesma página no idioma pedido; uma rota desconhecida (404) vai para a home dele.
function targetFor(path: string, lang: Lang) {
  const route = findPageByPath(path);

  if (route) return equivalentPath(route, lang);

  return lang === 'en' ? '/en' : '/';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { path, navigate } = useRouter();
  const lang = langOfPath(path);

  // `lang` do <html> acompanha o endereço; nada é gravado ao montar (FR-022, V-08).
  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }, [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Armazenamento bloqueado: a escolha vale só nesta visita (FR-026).
      }
      if (next !== lang) navigate(targetFor(path, next));
    },
    [lang, path, navigate],
  );

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      t: ui[lang],
      setLang,
      toggleLang: () => setLang(lang === 'pt' ? 'en' : 'pt'),
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
