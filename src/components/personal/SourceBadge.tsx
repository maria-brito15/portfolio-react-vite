import type { Provenance } from '../../data/personal/types';
import { usePersonalText } from '../../i18n/usePersonalText';
import Chip from '../ui/Chip';

// Marca de item (CL-13): lê a procedência do próprio item. Hoje só o dado fictício ganha
// marca; a fonte real ("via Hardcover · atualizado em…", CL-12) entra na T-CL6.
export default function SourceBadge({ provenance }: { provenance: Provenance }) {
  const p = usePersonalText();

  if (provenance.source !== 'mock') return null;

  return (
    <Chip accent="amber" title={p.placeholder.hint}>
      {p.placeholder.item}
    </Chip>
  );
}
