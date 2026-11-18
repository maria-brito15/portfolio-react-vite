import type { ReactNode } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import DecorativeStripe from './DecorativeStripe';
import LanguageOffer from './LanguageOffer';
import Header from './Header';
import Footer from './Footer';

// Casca única do site (FR-008, FR-016, FR-041, TD-018). Ordem do DOM = ordem do foco:
//   faixa decorativa → skip link → faixa de idioma → <header> → <main id="conteudo"> → <footer>
// Quem monta é o `App` (uma vez, fora do `Suspense`); as páginas só entregam o conteúdo do `main`.
// Rota `bare` (hoje só o terminal) renderiza apenas a faixa e o `main`: sem skip link, cabeçalho,
// faixa de idioma nem rodapé (o conteúdo e o primeiro foco dela são da spec 009).
export default function SiteShell({
  bare = false,
  children,
}: {
  bare?: boolean;
  children?: ReactNode;
}) {
  const { t } = useLanguage();

  if (bare) {
    return (
      <>
        <DecorativeStripe />
        <main id="conteudo" tabIndex={-1}>
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <DecorativeStripe />
      <a className="skip-link" href="#conteudo">
        {t.shell.skip}
      </a>
      <LanguageOffer />
      <Header />
      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
