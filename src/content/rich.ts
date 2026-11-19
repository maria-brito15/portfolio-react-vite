// Marcação de texto de conteúdo (003, TD-001): só `**negrito**`. Puro e sem zod, porque vai ao navegador.
// Quem exibe monta o `<strong>` a partir dos segmentos; nunca há HTML no dado.

export interface Segment {
  text: string;
  strong: boolean;
}

const MARK = '**';

/** `**` em pares. Com número ímpar de marcas o texto não tem negrito válido e fica como está. */
function isBalanced(text: string): boolean {
  return (text.split(MARK).length - 1) % 2 === 0;
}

/** Divide o texto em trechos, na ordem, sem perder caractere (fora as próprias marcas `**`). */
export function parseRich(text: string): Segment[] {
  if (!isBalanced(text)) return text === '' ? [] : [{ text, strong: false }];

  return text
    .split(MARK)
    .map((part, index): Segment => ({ text: part, strong: index % 2 === 1 }))
    .filter((segment) => segment.text !== '');
}

/** O texto sem as marcas, para meta description, busca e teste. */
export function plainText(text: string): string {
  return parseRich(text)
    .map((segment) => segment.text)
    .join('');
}
