import { createContext, useContext, type ReactNode } from 'react';
import type { Lang } from '../types';
import type { NavContext } from './commands';

// Contexto da sessão do terminal, separado do provedor para que as saídas dos
// comandos (que o provedor executa) possam ler a sessão sem import circular.
export interface RedirectState {
  to: string;
  status: 'idle' | 'loading' | 'done' | 'cancelled';
  reduced?: boolean;
  direct?: boolean;
}

// A tela guarda só a última entrada: o comando digitado, a saída e o redirecionamento.
export interface Entry {
  id: number;
  input: string;
  output: (lang: Lang) => ReactNode;
  redirect: RedirectState | null;
}

export interface TerminalSessionValue {
  entry: Entry | null;
  inputs: string[];
  context: NavContext | null;
  progress: number;
  busy: boolean;
  execute: (raw: string) => boolean;
  interrupt: (text: string) => void;
  openPage: (to: string, id: number | null) => void;
  cancel: () => void;
}

export const SessionContext = createContext<TerminalSessionValue | null>(null);

// Fora do provedor o contexto é nulo; os consumidores (TermLink) toleram isso.
export function useTerminalSession() {
  return useContext(SessionContext) as TerminalSessionValue;
}
