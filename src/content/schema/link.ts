import { z } from 'zod';
import { typeNameInPt } from './localized';

export type ContentLink = string;

// Espaço e caracteres de controle: `new URL` os apaga ou aceita em silêncio, então se recusa antes.
// eslint-disable-next-line no-control-regex
const SPACE_OR_CONTROL = /[\u0000- \u007F-\u009F]/;
const SCHEME = /^([a-z][a-z0-9+.-]*):/i;
const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const NO_PROTOCOL = (value: string) =>
  `endereço sem protocolo não é aceito ("${value.slice(0, 2)}${value.slice(2).split(/[/?#]/)[0]}")`;
const NOT_ACCEPTED = 'formato não aceito (use https, caminho começando com "/" ou mailto:)';

function httpsProblem(value: string): string | null {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return 'endereço https inválido';
  }

  if (url.hostname === '') return 'endereço https sem host';
  if (url.username !== '' || url.password !== '') {
    return 'https com usuário e senha não é aceito';
  }

  return null;
}

function mailtoProblem(value: string): string | null {
  const address = value.slice('mailto:'.length);

  if (address === '') return 'e-mail ausente';
  if (address.includes('?')) return 'mailto: com parâmetros não é aceito';
  if (!EMAIL.test(address)) return 'formato do e-mail inválido';

  return null;
}

/** Motivo (PT) de um link que não vale, ou `null` quando vale (design §5.4). */
export function linkProblem(value: unknown): string | null {
  if (value === undefined) return 'link ausente';
  if (typeof value !== 'string') return `esperado texto, recebido ${typeNameInPt(value)}`;
  if (value === '') return 'link vazio';
  if (SPACE_OR_CONTROL.test(value)) return 'link com espaço ou caractere de controle';

  if (value.startsWith('/')) {
    // `//host` e `/\host`: o navegador os trata como endereço de outro site.
    return value[1] === '/' || value[1] === '\\' ? NO_PROTOCOL(value) : null;
  }

  const scheme = SCHEME.exec(value)?.[1].toLowerCase();

  if (scheme === 'https') return httpsProblem(value);
  if (scheme === 'http') return 'precisa de https, recebido http';
  if (scheme === 'mailto') return mailtoProblem(value);

  return NOT_ACCEPTED;
}

export const LinkSchema = z.unknown().superRefine((value, ctx) => {
  const problem = linkProblem(value);

  if (problem) ctx.addIssue({ code: 'custom', message: problem });
}) as unknown as z.ZodType<ContentLink>;
