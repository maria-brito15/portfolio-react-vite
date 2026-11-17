import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const terminalInput = () =>
  screen.getByRole('textbox', { name: /Linha de comando do terminal|terminal command line/i });
export const log = () => document.querySelector<HTMLElement>('.term-log')!;

export async function run(user: ReturnType<typeof userEvent.setup>, line: string) {
  await user.type(terminalInput(), `${line}{Enter}`);
}

export const PAGES_A = ['projetos', 'experiencias'];
export const PAGES_B = ['curriculo', 'academico', 'servicos'];
