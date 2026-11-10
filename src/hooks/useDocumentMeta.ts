import { useEffect } from 'react';

// Atualiza título e descrição da aba conforme a página e o idioma.
export function useDocumentMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description ?? '');
  }, [title, description]);
}
