import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderApp } from '../test/helpers';
import { EmailNotConfiguredError } from '../services/emailService';

// Função simples (não vi.fn): o vitest 5 reporta como erro não tratado qualquer
// rejeição devolvida por um mock, mesmo quando o componente a captura.
let impl;
const calls = [];
const send = (...args) => {
  calls.push(args);
  return impl(...args);
};
vi.mock('../services/emailService', () => ({
  EmailNotConfiguredError: class EmailNotConfiguredError extends Error {},
  classifySendError: (e) =>
    e?.name === 'EmailNotConfiguredError' || e?.notConfigured
      ? 'not-configured'
      : e?.status === 429
        ? 'rate-limited'
        : e?.status === 0
          ? 'network'
          : 'error',
  sendContactMessage: (...args) => send(...args),
}));

async function fill(
  user,
  { name = 'Ana Souza', email = 'ana@exemplo.com', message = 'Gostei do portfólio!' } = {},
) {
  if (name) await user.type(screen.getByLabelText('Nome'), name);
  if (email) await user.type(screen.getByLabelText('E-mail'), email);
  if (message) await user.type(screen.getByLabelText('Mensagem'), message);
}

describe('formulário de contato', () => {
  beforeEach(() => {
    calls.length = 0;
    impl = () => Promise.resolve({ status: 200 });
  });

  it('mostra erros acessíveis e não envia quando o formulário é inválido', async () => {
    const user = userEvent.setup();
    renderApp('/contato');
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(screen.getByText('Informe seu nome.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Nome')).toHaveFocus();
    expect(calls).toHaveLength(0);
  });

  it('valida o formato do e-mail e limpa o erro ao corrigir', async () => {
    const user = userEvent.setup();
    renderApp('/contato');
    await fill(user, { email: 'ana@' });
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(screen.getByText(/e-mail válido/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('E-mail'), 'exemplo.com');
    expect(screen.queryByText(/e-mail válido/)).not.toBeInTheDocument();
  });

  it('envia, mostra carregamento, confirma e limpa os campos', async () => {
    const user = userEvent.setup();
    let resolve;
    impl = () => new Promise((r) => (resolve = r));
    renderApp('/contato');
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(calls).toEqual([
      [{ name: 'Ana Souza', email: 'ana@exemplo.com', message: 'Gostei do portfólio!' }],
    ]);
    const busy = screen.getByRole('button', { name: 'Enviando…' });
    expect(busy).toBeDisabled();
    resolve({ status: 200 });
    expect(await screen.findByText(/Mensagem enviada!/)).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('');
  });

  it('informa a falha e preserva o que foi digitado', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    impl = () => Promise.reject(new Error('rede'));
    renderApp('/contato');
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(await screen.findByText(/Não foi possível enviar/)).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toHaveValue('Gostei do portfólio!');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('avisa que o envio está inativo, sem simular sucesso, e preserva o texto', async () => {
    const user = userEvent.setup();
    impl = () =>
      Promise.reject(Object.assign(new EmailNotConfiguredError(), { notConfigured: true }));
    renderApp('/contato');
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(await screen.findByText(/ainda não está ativo/)).toBeInTheDocument();
    expect(screen.queryByText(/Mensagem enviada!/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toHaveValue('Gostei do portfólio!');
    expect(calls).toHaveLength(1);
  });

  it('não envia duas vezes quando o botão é acionado repetidamente durante o envio', async () => {
    const user = userEvent.setup();
    let resolve;
    impl = () => new Promise((r) => (resolve = r));
    renderApp('/contato');
    await fill(user);
    const form = screen.getByRole('button', { name: 'Enviar mensagem' }).closest('form');
    fireEvent.submit(form);
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(calls).toHaveLength(1);
    resolve({ status: 200 });
    await screen.findByText(/Mensagem enviada!/);
  });

  it('mostra mensagens distintas para falta de conexão e limite de envios', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    impl = () => Promise.reject({ status: 0, text: '' });
    renderApp('/contato');
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(await screen.findByText(/Sem conexão/)).toBeInTheDocument();
    impl = () => Promise.reject({ status: 429, text: 'Too Many Requests' });
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(await screen.findByText(/Aguarde alguns segundos/)).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('Ana Souza');
    spy.mockRestore();
  });

  it('descarta envio quando o campo-armadilha é preenchido (bot)', () => {
    renderApp('/contato');
    const form = screen.getByRole('button', { name: 'Enviar mensagem' }).closest('form');
    fireEvent.change(form.elements.website, { target: { value: 'http://spam' } });
    fireEvent.submit(form);
    expect(calls).toHaveLength(0);
  });

  it('campos têm rótulo, obrigatoriedade e limites; a armadilha fica oculta ao teclado e a leitores de tela', () => {
    renderApp('/contato');
    expect(screen.getByLabelText('Nome')).toHaveAttribute('maxlength', '100');
    expect(screen.getByLabelText('Mensagem')).toHaveAttribute('maxlength', '5000');
    for (const label of ['Nome', 'E-mail', 'Mensagem']) {
      expect(screen.getByLabelText(label)).toHaveAttribute('aria-required', 'true');
    }
    const trap = document.querySelector('input[name="website"]');
    expect(trap).toHaveAttribute('tabindex', '-1');
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('mensagens de erro seguem o idioma escolhido', async () => {
    const user = userEvent.setup();
    renderApp('/contato');
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(screen.getByText('Please enter your name.')).toBeInTheDocument());
  });
});
