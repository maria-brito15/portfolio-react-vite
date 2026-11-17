import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../types';
import { ui } from './ui';

const STORAGE_KEY = 'portfolio-lang';
interface LanguageValue {
  lang: Lang;
  t: (typeof ui)[Lang];
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageValue>({
  lang: 'pt',
  t: ui.pt,
  toggleLang: () => {},
});

function readStoredLanguage(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved === 'en' || saved === 'pt' ? saved : 'pt';
  } catch {
    return 'pt';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLanguage);

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Navegação privada pode bloquear o armazenamento; o idioma continua funcionando.
    }
  }, [lang]);

  const value = useMemo(
    () => ({ lang, t: ui[lang], toggleLang: () => setLang((v) => (v === 'pt' ? 'en' : 'pt')) }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
