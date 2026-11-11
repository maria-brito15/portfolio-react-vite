import { useCallback, useEffect, useState } from 'react';
import { fetchGithubStats, type GithubStats } from '../services/github';

export type GithubState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: GithubStats };

export function useGithubStats() {
  const [state, setState] = useState<GithubState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchGithubStats(controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' });
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
