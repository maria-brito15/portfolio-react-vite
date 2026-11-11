// Páginas carregadas sob demanda: a home (o terminal) é o que quase todo visitante vê
// primeiro; as demais, com seus textos longos (estudo de caso, currículo, notas), só são
// baixadas quando abertas. Nos testes este módulo é trocado por imports diretos
// (src/test/setup.ts), para as rotas renderizarem de forma síncrona.
import { lazy } from 'react';

export const Services = lazy(() => import('./Services'));
export const CaseStudy = lazy(() => import('./CaseStudy'));
export const Resume = lazy(() => import('./Resume'));
export const Academics = lazy(() => import('./Academics'));
export const SectionPage = lazy(() => import('./SectionPage'));
