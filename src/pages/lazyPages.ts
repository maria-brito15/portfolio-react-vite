// Páginas carregadas sob demanda: a home (o painel) é o que quase todo visitante vê
// primeiro; as demais, com seus textos longos (estudo de caso, currículo, notas), o
// terminal e o Game Center, só são baixadas quando abertas. Nos testes este módulo é trocado por imports diretos
// (src/test/setup.ts), para as rotas renderizarem de forma síncrona.
import { lazy, type ComponentType } from 'react';
import { provaEnabled } from '../data/routes';

export const Services = lazy(() => import('./Services'));
export const CaseStudy = lazy(() => import('./CaseStudy'));
export const Resume = lazy(() => import('./Resume'));
export const Academics = lazy(() => import('./Academics'));
export const SectionPage = lazy(() => import('./SectionPage'));
export const GithubPage = lazy(() => import('./GithubPage'));
export const TerminalPage = lazy(() => import('./TerminalPage'));
export const PersonalHub = lazy(() => import('./personal/PersonalHub'));
export const PersonalBooks = lazy(() => import('./personal/Books'));
export const PersonalFilms = lazy(() => import('./personal/Films'));
export const PersonalMusic = lazy(() => import('./personal/Music'));
export const PersonalTheater = lazy(() => import('./personal/Theater'));

// Só o build de prova tem a página de prova (`__PROVA__`); nos outros o `import()` some do pacote
// (a constante vira `false` no build) e a rota nem existe na tabela.
export const Prova: ComponentType = provaEnabled ? lazy(() => import('./Prova')) : () => null;
