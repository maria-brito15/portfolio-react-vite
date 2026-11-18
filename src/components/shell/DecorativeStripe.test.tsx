// T3.1 (V-14): faixa decorativa escondida de leitor de tela, com 5 cores, sem texto e sem foco.
import { render } from '@testing-library/react';
import DecorativeStripe from './DecorativeStripe';

describe('DecorativeStripe (FR-038)', () => {
  it('é aria-hidden, tem 5 cores deco-1 a deco-5 e nenhum texto', () => {
    const { container } = render(<DecorativeStripe />);
    const stripe = container.firstElementChild as HTMLElement;

    expect(stripe).toHaveAttribute('aria-hidden', 'true');
    expect([...stripe.children].map((c) => c.className)).toEqual([
      'deco-1',
      'deco-2',
      'deco-3',
      'deco-4',
      'deco-5',
    ]);
    expect(stripe.textContent).toBe('');
    expect(stripe).not.toHaveAttribute('role');
  });

  it('não tem nada focável', () => {
    const { container } = render(<DecorativeStripe />);

    expect(container.querySelectorAll('a, button, input, [tabindex]')).toHaveLength(0);
  });
});
