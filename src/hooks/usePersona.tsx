import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { personaById, type Persona, type PersonaId } from '../data/personas';
import { isCrawler } from '../utils/env';

// Persona do visitante. Fica só no navegador (localStorage): nada vai ao servidor.
// - `portfolio-persona`: a persona escolhida;
// - `portfolio-persona-asked`: a pergunta já foi respondida ou pulada (não volta).
// Sem armazenamento (navegação privada), o estado vale enquanto a página estiver aberta.
export const PERSONA_KEY = 'portfolio-persona';
export const PERSONA_ASKED_KEY = 'portfolio-persona-asked';

interface PersonaValue {
  persona: Persona | undefined;
  // Falso só quando a pergunta ainda deve ser mostrada (1ª visita).
  asked: boolean;
  choose: (id: PersonaId) => void;
  skip: () => void;
  clear: () => void;
}

// Fora do provedor nada pergunta nem muda (os consumidores toleram isso).
const PersonaContext = createContext<PersonaValue>({
  persona: undefined,
  asked: true,
  choose: () => {},
  skip: () => {},
  clear: () => {},
});

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Sem armazenamento: vale só nesta sessão.
  }
}

export function PersonaProvider({ children }: { children: ReactNode }) {
  // Id desconhecido (persona removida) é ignorado.
  const [id, setId] = useState<PersonaId | undefined>(() => personaById(read(PERSONA_KEY))?.id);
  // Robôs nunca recebem a pergunta (o conteúdo é o mesmo).
  const [asked, setAsked] = useState(() => isCrawler() || read(PERSONA_ASKED_KEY) === '1');

  const choose = useCallback((next: PersonaId) => {
    write(PERSONA_KEY, next);
    write(PERSONA_ASKED_KEY, '1');
    setId(next);
    setAsked(true);
  }, []);

  const skip = useCallback(() => {
    write(PERSONA_ASKED_KEY, '1');
    setAsked(true);
  }, []);

  const clear = useCallback(() => {
    write(PERSONA_KEY, null);
    write(PERSONA_ASKED_KEY, '1');
    setId(undefined);
    setAsked(true);
  }, []);

  const value = useMemo<PersonaValue>(
    () => ({ persona: personaById(id), asked, choose, skip, clear }),
    [id, asked, choose, skip, clear],
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona() {
  return useContext(PersonaContext);
}
