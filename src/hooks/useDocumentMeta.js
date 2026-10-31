import { useEffect } from 'react';

// Atualiza título e descrição da aba conforme a página e o idioma.
export function useDocumentMeta({ title, description }) {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description ?? '');
  }, [title, description]);
}
