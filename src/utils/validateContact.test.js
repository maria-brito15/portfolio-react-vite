import { validateContact } from './validateContact';

const valid = { name: 'Ana', email: 'ana@exemplo.com', message: 'Olá, tudo bem?' };

describe('validateContact', () => {
  it('aceita dados válidos', () => {
    expect(validateContact(valid)).toEqual({});
  });
  it('rejeita campos vazios ou só com espaços', () => {
    expect(validateContact({ name: '  ', email: '', message: '   ' })).toEqual({
      name: 'nameRequired',
      email: 'emailRequired',
      message: 'messageRequired',
    });
  });
  it('rejeita e-mail malformado', () => {
    expect(validateContact({ ...valid, email: 'ana@exemplo' }).email).toBe('emailInvalid');
    expect(validateContact({ ...valid, email: 'ana exemplo.com' }).email).toBe('emailInvalid');
  });
  it('limita o tamanho da mensagem e do nome', () => {
    expect(validateContact({ ...valid, message: 'curta' }).message).toBe('messageLength');
    expect(validateContact({ ...valid, message: 'x'.repeat(5001) }).message).toBe('messageLength');
    expect(validateContact({ ...valid, name: 'A' }).name).toBe('nameLength');
  });
});
