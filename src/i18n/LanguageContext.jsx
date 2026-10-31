import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ui } from './ui';

const STORAGE_KEY = 'portfolio-lang';
const LanguageContext = createContext(null);

function readStoredLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'pt' ? saved : 'pt';
  } catch {
    return 'pt';
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readStoredLanguage);

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
