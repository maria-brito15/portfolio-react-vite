// Contrato único das fontes do espaço cultural. O mock da Fase 1 e o cliente real das Fases
// 2 e 3 cumprem a mesma interface: trocar um pelo outro é mudar o que o `index.ts` da fonte
// exporta, sem tocar em páginas nem em hooks (CL-08).
import type { PersonalFeed } from '../../data/personal/types';

export interface PersonalSource<T> {
  // Rejeita quando a fonte falha; o hook mostra o estado de erro. `signal` cancela a leitura.
  load(signal?: AbortSignal): Promise<PersonalFeed<T>>;
}
