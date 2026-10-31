const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Retorna um objeto { campo: códigoDoErro }; vazio quando tudo está válido.
// Os códigos são traduzidos em src/i18n/ui.js (form.errors).
export function validateContact({ name, email, message }) {
  const errors = {};
  const n = name.trim();
  const e = email.trim();
  const m = message.trim();

  if (!n) errors.name = 'nameRequired';
  else if (n.length < 2 || n.length > 100) errors.name = 'nameLength';

  if (!e) errors.email = 'emailRequired';
  else if (!EMAIL_PATTERN.test(e)) errors.email = 'emailInvalid';

  if (!m) errors.message = 'messageRequired';
  else if (m.length < 10 || m.length > 5000) errors.message = 'messageLength';

  return errors;
}
