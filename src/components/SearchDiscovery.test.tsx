import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';

const ctrlK = (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Control>}k{/Control}');
const palette = () => screen.findByRole('dialog', { name: /Paleta de comandos|Command palette/ });

beforeEach(() => sessionStorage.clear());

describe('paleta', () => {
  it('escolher uma seção leva direto à âncora', async () => {
    const user = userEvent.setup();

    renderApp('/');
    await ctrlK(user);

    const dialog = await palette();

    await user.type(within(dialog).getByRole('combobox'), 'disciplinas');
    await user.click(
      within(dialog).getByRole('option', { name: /Acadêmico: Disciplinas e notas/ }),
    );
    expect(window.location.pathname + window.location.hash).toBe('/academico#disciplinas');
  });
});
