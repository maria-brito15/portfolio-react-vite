import type { ReactNode } from 'react';

// Propriedades do esqueleto das páginas, comuns ao shell antigo e ao do caderno (CD-61).
export interface SiteShellProps {
  routeId?: string;
  missingPath?: string;
  badge?: ReactNode;
  variant?: string;
  after?: ReactNode;
  children?: ReactNode;
}
