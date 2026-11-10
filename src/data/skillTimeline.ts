// Competências com tempo de uso (seção 01 do currículo).
//
// `since` é o ano do PRIMEIRO projeto ou curso do próprio portfólio em que a
// tecnologia aparece, e `source` diz qual foi. Não há estimativa: tecnologia
// sem projeto datado fica com `since: null` e aparece sem tempo. Quando a
// autora informar desde quando usa cada uma, basta trocar o ano aqui.
import type { Lang, Localized } from '../types';

const S = (pt: string, en: string): Localized => ({ pt, en });

export interface SkillItem {
  name: string;
  since: number | null;
  source?: string | Localized;
}

export interface SkillGroup {
  id: string;
  title: Localized;
  items: SkillItem[];
}

export const skillTimeline: SkillGroup[] = [
  {
    id: 'languages',
    title: S('Linguagens', 'Languages'),
    items: [
      { name: 'Java', since: 2025, source: 'EcoShop v1' },
      { name: 'JavaScript', since: 2025, source: 'Planoriza' },
      { name: 'TypeScript', since: 2026, source: 'EcoShop v2' },
      { name: 'Python', since: 2026, source: S('Imersão Alura', 'Alura immersion') },
      { name: 'C/C++', since: null },
      { name: 'PHP', since: null },
    ],
  },
  {
    id: 'frontend',
    title: S('Front-end', 'Front-end'),
    items: [
      { name: 'HTML5 · CSS3', since: 2025, source: 'Planoriza' },
      { name: 'Next.js', since: 2026, source: 'EcoShop v2' },
      { name: 'Figma', since: 2026, source: 'DevArt' },
      { name: 'React', since: null },
      { name: 'Tailwind CSS', since: null },
    ],
  },
  {
    id: 'data',
    title: S('Back-end e dados', 'Back-end and data'),
    items: [
      { name: 'PostgreSQL', since: 2025, source: 'EcoShop v1' },
      { name: 'Node.js · Express', since: 2026, source: 'ShortURL' },
      { name: 'MongoDB', since: 2026, source: 'ShortURL' },
      { name: 'Redis', since: 2026, source: 'EcoShop v2' },
      { name: 'Prisma ORM', since: 2026, source: 'EcoShop v2' },
      { name: 'BullMQ', since: 2026, source: 'WhatsApp Dispatcher' },
      { name: 'Spring Boot', since: null },
    ],
  },
  {
    id: 'quality',
    title: S('Testes e DevOps', 'Testing and DevOps'),
    items: [
      { name: 'JUnit 5 · Mockito', since: 2025, source: 'EcoShop v1' },
      { name: 'Docker', since: 2025, source: 'EcoShop v1' },
      { name: 'GitHub Actions', since: 2026, source: 'EcoShop v2' },
      { name: 'Zod', since: 2026, source: 'EcoShop v2' },
      { name: 'Jest', since: null },
      { name: 'Git', since: null },
    ],
  },
];

// Tempo aproximado a partir do ano: no próprio ano, "< 1 ano"; depois, "N+ anos".
export function formatSince(since: number | null | undefined, lang: Lang, today = new Date()) {
  if (!since) return null;

  const years = today.getFullYear() - since;

  if (years <= 0) return lang === 'pt' ? '< 1 ano' : '< 1 yr';
  if (lang === 'pt') return `${years}+ ${years === 1 ? 'ano' : 'anos'}`;

  return `${years}+ ${years === 1 ? 'yr' : 'yrs'}`;
}
