import { problemLine, problemsFromZod } from './errors';
import { RichTextSchema } from './index';

const FILE = 'src/content/exemplo.content.ts';

function lines(value: unknown) {
  const result = RichTextSchema.safeParse(value);

  if (result.success) return [];

  return problemsFromZod(FILE, result.error).map((p) =>
    problemLine({ ...p, field: p.field === '(arquivo)' ? 'descricao' : `descricao.${p.field}` }),
  );
}

describe('RichText', () => {
  it('texto sem marcação é válido', () => {
    expect(lines({ pt: 'Olá', en: 'Hello' })).toEqual([]);
  });

  it('negrito em pares é válido, nos dois idiomas', () => {
    expect(lines({ pt: 'a **b** c', en: 'a **b** c' })).toEqual([]);
  });

  it('`a < b` não é tag HTML', () => {
    expect(lines({ pt: 'a < b', en: 'x <3' })).toEqual([]);
  });

  it('`**` desbalanceado falha com arquivo, campo, idioma e motivo', () => {
    expect(lines({ pt: 'a **b', en: 'ok' })).toEqual([
      `conteúdo inválido: ${FILE} › descricao.pt — negrito sem fechamento (** em número ímpar)`,
    ]);
  });

  it('negrito vazio (****) falha', () => {
    expect(lines({ pt: 'ok', en: 'a **** b' })).toEqual([
      `conteúdo inválido: ${FILE} › descricao.en — negrito vazio (****)`,
    ]);
  });

  it('aninhado/ambíguo (***) falha', () => {
    expect(lines({ pt: '***a***', en: 'ok' })[0]).toContain('descricao.pt — negrito aninhado');
  });

  it.each(['<b>x</b>', 'a <br> b', '</p>'])('tag HTML %j falha', (html) => {
    expect(lines({ pt: html, en: 'ok' })[0]).toContain(
      'descricao.pt — tag HTML não é aceita (só **negrito**)',
    );
  });

  it('herda as regras do texto localizado: sem EN falha como texto ausente', () => {
    expect(lines({ pt: 'Olá' })).toEqual([
      `conteúdo inválido: ${FILE} › descricao.en — texto ausente`,
    ]);
  });
});
