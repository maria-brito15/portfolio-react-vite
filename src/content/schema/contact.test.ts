import { formatPath } from './errors';
import { ContactSchema } from './index';

const loc = (pt: string, en = pt) => ({ pt, en });

// Contato de EXEMPLO para teste (não é dado real).
const contact = (over: Record<string, unknown> = {}) => ({
  email: 'mailto:exemplo@exemplo.com',
  servicesEmail: 'mailto:servicos@exemplo.com',
  github: 'https://github.com/exemplo',
  linkedin: 'https://linkedin.com/in/exemplo',
  photo: { path: '/assets/portfolio.jpeg', alt: loc('Foto', 'Photo'), width: 768, height: 768 },
  ...over,
});

function problems(value: unknown): string[] {
  const result = ContactSchema.safeParse(value);

  return result.success
    ? []
    : result.error.issues.map((i) => `${formatPath(i.path)}: ${i.message}`);
}

describe('ContactSchema', () => {
  it('contato válido passa (https no GitHub e no LinkedIn, com ou sem www)', () => {
    expect(problems(contact())).toEqual([]);
    expect(problems(contact({ github: 'https://www.github.com/exemplo' }))).toEqual([]);
  });

  it('http no GitHub falha com "precisa de https"', () => {
    expect(problems(contact({ github: 'http://github.com/exemplo' }))).toContain(
      'github: precisa de https',
    );
  });

  it('GitHub em outro host falha', () => {
    expect(problems(contact({ github: 'https://gitlab.com/exemplo' }))).toContain(
      'github: o endereço precisa ser de github.com (recebido gitlab.com)',
    );
  });

  it('LinkedIn em outro host falha', () => {
    expect(problems(contact({ linkedin: 'https://exemplo.com/in/x' })).join('\n')).toContain(
      'linkedin: o endereço precisa ser de linkedin.com',
    );
  });

  it('foto sem alt falha; alt só em PT falha', () => {
    const photo = { path: '/assets/portfolio.jpeg', width: 768, height: 768 };

    expect(problems(contact({ photo })).join('\n')).toContain('photo.alt');
    expect(problems(contact({ photo: { ...photo, alt: { pt: 'Foto' } } }))).toContain(
      'photo.alt.en: texto ausente',
    );
  });

  it('mailto com parâmetros falha (regra da 001)', () => {
    expect(
      problems(contact({ email: 'mailto:exemplo@exemplo.com?subject=oi' })).join('\n'),
    ).toContain('email');
  });

  it('e-mail que não é mailto falha', () => {
    expect(problems(contact({ email: 'https://exemplo.com' }))).toContain(
      'email: precisa ser um endereço mailto:',
    );
  });

  it('campo desconhecido é recusado', () => {
    expect(problems(contact({ telefone: 'tel:123' })).join('\n')).toContain('telefone');
  });
});
