import { useCallback, useEffect, useState } from 'react';
import type { Book, FilmDiaryEntry, FilmMeta, PersonalFeed } from '../data/personal/types';
import { booksSource } from '../services/integrations/hardcover';
import { filmsSource } from '../services/integrations/letterboxd';
import { filmMetaSource } from '../services/integrations/tmdb';
import type { PersonalSource } from '../services/integrations/types';

// Carregando, erro ou pronto. "Vazio" e "vencido" são do feed (`items.length === 0`,
// `feed.stale`): a página decide como mostrá-los (CL-11).
export type PersonalState<T> =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; feed: PersonalFeed<T> };

// `source` precisa ser estável entre renderizações (constante de módulo).
export function usePersonalSource<T>(source: PersonalSource<T>) {
  const [state, setState] = useState<PersonalState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    source
      .load(controller.signal)
      .then((feed) => {
        if (!controller.signal.aborted) setState({ status: 'ready', feed });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' });
      });

    return () => controller.abort();
  }, [source, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}

export const usePersonalBooks = () => usePersonalSource<Book>(booksSource);
export const usePersonalFilms = () => usePersonalSource<FilmDiaryEntry>(filmsSource);
export const usePersonalFilmMeta = () => usePersonalSource<FilmMeta>(filmMetaSource);
