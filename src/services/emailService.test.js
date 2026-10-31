import { vi } from 'vitest';

async function load(env, send) {
  vi.resetModules();
  vi.stubEnv('VITE_EMAILJS_SERVICE_ID', env.service ?? '');
  vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', env.template ?? '');
  vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', env.key ?? '');
  if (send) vi.doMock('@emailjs/browser', () => ({ default: { send } }));
  return import('./emailService');
}

describe('emailService', () => {
  it('sem variáveis do EmailJS, recusa o envio com erro explícito (sem fingir sucesso)', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', '');
    vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', '');
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', '');
    const mod = await import('./emailService');
    expect(mod.isEmailConfigured()).toBe(false);
    await expect(
      mod.sendContactMessage({ name: 'A', email: 'a@b.co', message: 'x' }),
    ).rejects.toBeInstanceOf(mod.EmailNotConfiguredError);
  });

  it('configurado, envia os parâmetros esperados pelo template', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'svc');
    vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', 'tpl');
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'pub');
    const send = vi.fn().mockResolvedValue({ status: 200 });
    vi.doMock('@emailjs/browser', () => ({ default: { send } }));
    const mod = await import('./emailService');
    await mod.sendContactMessage({ name: 'Ana', email: 'ana@exemplo.com', message: 'oi' });
    expect(send).toHaveBeenCalledWith(
      'svc',
      'tpl',
      {
        from_name: 'Ana',
        from_email: 'ana@exemplo.com',
        reply_to: 'ana@exemplo.com',
        message: 'oi',
      },
      expect.objectContaining({ publicKey: 'pub' }),
    );
  });

  it('ativa as proteções do SDK (headless bloqueado e limite de envios)', async () => {
    const send = vi.fn().mockResolvedValue({ status: 200 });
    const mod = await load({ service: 's', template: 't', key: 'k' }, send);
    await mod.sendContactMessage({ name: 'Ana', email: 'a@b.co', message: 'olá, tudo bem?' });
    const options = send.mock.calls[0][3];
    expect(options.blockHeadless).toBe(true);
    expect(options.limitRate.throttle).toBeGreaterThan(0);
  });

  it('configuração parcial conta como não configurada', async () => {
    const mod = await load({ service: 's', template: 't', key: '' });
    expect(mod.isEmailConfigured()).toBe(false);
  });

  it('propaga a rejeição do SDK e classifica o tipo de falha', async () => {
    const mod = await load({ service: 's', template: 't', key: 'k' }, () =>
      Promise.reject({ status: 429, text: 'Too Many Requests' }),
    );
    const error = await mod
      .sendContactMessage({ name: 'Ana', email: 'a@b.co', message: 'olá, tudo bem?' })
      .catch((e) => e);
    expect(error.status).toBe(429);
    expect(mod.classifySendError(error)).toBe('rate-limited');
    expect(mod.classifySendError({ status: 0 })).toBe('network');
    expect(mod.classifySendError({ status: 400, text: 'template invalid' })).toBe('error');
    expect(mod.classifySendError(new mod.EmailNotConfiguredError())).toBe('not-configured');
  });
});
