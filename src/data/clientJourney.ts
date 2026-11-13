// Jornada de solução do cliente (docs/specs/experiencias-persona/): para cada necessidade, quais
// serviços, cases, projetos e perguntas frequentes da página Serviços respondem a ela. Só
// aponta para o que já existe em `services.tsx` e `projects.tsx`, por posição na lista; os
// textos, valores e prazos continuam todos lá. Não há "processo de trabalho" nos dados do
// site, então a jornada não mostra um: usa as perguntas frequentes. `clientJourney.test.ts`
// confere que cada posição e cada id existem.
import type { Localized } from '../types';

const L = (pt: string, en: string): Localized => ({ pt, en });

export interface ClientNeed {
  id: string;
  label: Localized;
  // Posições em `services[lang].services.items`.
  services: number[];
  // Ids de `services[lang].cases.items`.
  cases: string[];
  // Ids de `projects.tsx`.
  projects: string[];
  // Posições em `services[lang].faq.items`.
  faq: number[];
}

export const clientNeeds: ClientNeed[] = [
  {
    id: 'presenca',
    label: L(
      'Preciso apresentar minha empresa ou marca na internet',
      'I need to present my business or brand online',
    ),
    services: [0, 3],
    cases: ['agape'],
    projects: [],
    faq: [0, 2, 5],
  },
  {
    id: 'vender',
    label: L('Quero vender produtos online', 'I want to sell products online'),
    services: [1, 2],
    cases: ['becas'],
    projects: ['ecoshop'],
    faq: [3, 4, 2],
  },
  {
    id: 'campanha',
    label: L(
      'Quero divulgar um lançamento ou captar contatos',
      'I want to promote a launch or collect leads',
    ),
    services: [3],
    cases: [],
    projects: [],
    faq: [2, 5, 4],
  },
  {
    id: 'melhorar',
    label: L(
      'Já tenho um site e quero corrigir ou melhorar',
      'I already have a site and want to fix or improve it',
    ),
    services: [4],
    cases: [],
    projects: [],
    faq: [5, 3],
  },
];
