import emailjs from '@emailjs/browser';
import type { ContactFields } from '../utils/validateContact';

// Integração com o EmailJS (envio de e-mail direto do navegador).
// As três variáveis são públicas por natureza: o EmailJS foi feito para rodar
// no front-end. Nunca coloque aqui a senha do e-mail ou a "Private Key".
const config = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

export function isEmailConfigured() {
  return Boolean(config.serviceId && config.templateId && config.publicKey);
}

export class EmailNotConfiguredError extends Error {
  constructor() {
    super('EmailJS não configurado: defina as variáveis VITE_EMAILJS_* (veja .env.example).');
    this.name = 'EmailNotConfiguredError';
  }
}

// Proteções oferecidas pelo próprio SDK (v4.4): bloqueia navegadores headless
// (bots simples) e limita o intervalo entre envios deste navegador.
const THROTTLE_MS = 15000;

// Classifica a falha para a interface escolher a mensagem. O SDK rejeita com
// { status, text }: 429 = limite de envios, 451 = headless bloqueado,
// 0 = sem conexão; qualquer outra coisa é recusa/erro do serviço.
export function classifySendError(error: unknown) {
  if (error instanceof EmailNotConfiguredError) return 'not-configured';
  if ((error as { status?: number } | null)?.status === 429) return 'rate-limited';
  if (
    (error as { status?: number } | null)?.status === 0 ||
    (typeof navigator !== 'undefined' && navigator.onLine === false)
  ) {
    return 'network';
  }

  return 'error';
}

// Os nomes dos parâmetros precisam existir no template do EmailJS (ver README).
export async function sendContactMessage({ name, email, message }: ContactFields) {
  if (!isEmailConfigured()) throw new EmailNotConfiguredError();

  return emailjs.send(
    config.serviceId as string,
    config.templateId as string,
    { from_name: name, from_email: email, reply_to: email, message },
    {
      publicKey: config.publicKey,
      blockHeadless: true,
      limitRate: { id: 'portfolio-contact', throttle: THROTTLE_MS },
    },
  );
}
