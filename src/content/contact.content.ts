// Contato e perfil (spec 003, T4.5). Endereços copiados de `src/data/profile.ts` sem alteração. A foto é
// `/assets/portfolio.jpeg` (768x768, conferido no arquivo); o texto alternativo é o que o site já usa
// (`photoAlt` em `src/data/portfolio.tsx`).
import type { ContentContact } from './schema/contact';

export const contact: ContentContact = {
  email: 'mailto:mariaeduardadepaulabrito@gmail.com',
  servicesEmail: 'mailto:mariab.dev@zohomail.com',
  github: 'https://github.com/maria-brito15',
  linkedin: 'https://linkedin.com/in/maria-eduarda-brito-a18064358',
  photo: {
    path: '/assets/portfolio.jpeg',
    alt: { pt: 'Foto de Maria Eduarda Brito', en: 'Photo of Maria Eduarda Brito' },
    width: 768,
    height: 768,
  },
};
