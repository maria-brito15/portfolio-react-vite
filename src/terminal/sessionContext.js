import { createContext, useContext } from 'react';

// Contexto da sessão do terminal, separado do provedor para que as saídas dos
// comandos (que o provedor executa) possam ler a sessão sem import circular.
export const SessionContext = createContext(null);

export function useTerminalSession() {
  return useContext(SessionContext);
}
