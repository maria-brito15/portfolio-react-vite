// Abertura por volume (CD-44, CD-45): decide se o cartão aparece e grava a marca.
// A chave leva o número do volume; sem localStorage, a marca vale na sessão (variável de módulo).
import { useEffect, useState } from 'react';
import { openerKey } from '../../data/notebook/volume';
import { isCrawler } from '../../utils/env';

const seenInSession = new Set<string>();

function read(key: string) {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function write(key: string) {
  seenInSession.add(key);
  try {
    localStorage.setItem(key, '1');
  } catch {
    // Sem armazenamento: vale só nesta sessão.
  }
}

export const openerSeen = (key = openerKey()) => seenInSession.has(key) || read(key);

export const resetOpenerSession = () => seenInSession.clear();

// `show` é decidido na montagem (puro, por causa do StrictMode); a marca é gravada logo ao começar,
// então recarregar no meio da abertura não a repete. `done` esconde o cartão.
export function useOpener() {
  const key = openerKey();
  const [show, setShow] = useState(() => !isCrawler() && !openerSeen(key));

  useEffect(() => {
    if (show) write(key);
  }, [show, key]);

  return { show, done: () => setShow(false) };
}
