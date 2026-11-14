// Textos do espaço cultural no idioma atual. Ficam fora do `ui.ts` de propósito: o `ui.ts` entra no
// JS inicial de todo visitante, e estes textos (7 kB) só servem às páginas, aos componentes e à
// visão do terminal do espaço cultural, que são carregados sob demanda. Quem precisa do texto
// importa este hook (ou `personalPt`/`personalEn`) dentro desses chunks.
import { useLanguage } from './LanguageContext';
import { personalEn, personalPt } from './personal';

export function usePersonalText() {
  const { lang } = useLanguage();

  return lang === 'pt' ? personalPt : personalEn;
}
