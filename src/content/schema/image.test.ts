import { ImageSchema, imagePathProblem } from './image';

const base = {
  path: '/assets/foto.png',
  alt: { pt: 'Foto da Duda', en: "Duda's photo" },
  width: 800,
  height: 600,
};

function problems(patch: Record<string, unknown>) {
  const result = ImageSchema.safeParse({ ...base, ...patch });

  return (result.error?.issues ?? []).map((i) => `${i.path.join('.')} — ${i.message}`);
}

describe('Image', () => {
  it('caminho, alt PT e EN e 800×600 é válida', () => {
    expect(ImageSchema.safeParse(base).success).toBe(true);
  });

  it('alt EN vazio falha em alt.en', () => {
    expect(problems({ alt: { pt: 'x', en: '' } })).toEqual(['alt.en — texto vazio (só espaços)']);
  });

  it('alt sem PT ou ausente falha (NFR-003)', () => {
    expect(problems({ alt: { en: 'x' } })).toEqual(['alt.pt — texto ausente']);
    expect(problems({ alt: undefined })).toEqual(['alt — texto ausente']);
  });

  it.each([
    [{ width: 0 }, 'width — largura não é inteiro positivo (recebido 0)'],
    [{ width: 12.5 }, 'width — largura não é inteiro positivo (recebido 12.5)'],
    [{ width: -3 }, 'width — largura não é inteiro positivo (recebido -3)'],
    [{ height: 0 }, 'height — altura não é inteiro positivo (recebido 0)'],
    [{ height: '600' }, 'height — altura não é inteiro positivo (recebido texto)'],
    [{ height: NaN }, 'height — altura não é inteiro positivo (recebido NaN)'],
    [{ width: undefined }, 'width — largura ausente'],
  ])('dimensão %j', (patch, esperado) => {
    expect(problems(patch)).toEqual([esperado]);
  });

  it('largura e altura erradas saem juntas', () => {
    expect(problems({ width: 0, height: 1.5 })).toHaveLength(2);
  });

  it('campo extra é recusado', () => {
    expect(ImageSchema.safeParse({ ...base, legenda: 'x' }).success).toBe(false);
  });
});

describe('Image: caminho', () => {
  it.each([
    '/assets/foto.png',
    '/a/b/c.jpg',
    '/x.jpeg',
    '/x.webp',
    '/x.avif',
    '/x.svg',
    '/x.PNG',
    '/pasta.com/x.png',
  ])('%s é aceito', (path) => {
    expect(imagePathProblem(path)).toBeNull();
  });

  it.each([
    ['https://exemplo.com/x.png', 'imagem externa não é aceita (sem hotlink)'],
    ['http://exemplo.com/x.png', 'imagem externa não é aceita (sem hotlink)'],
    ['//cdn.exemplo.com/x.png', 'imagem externa não é aceita (sem hotlink)'],
    ['data:image/png;base64,AAAA', 'imagem externa não é aceita (sem hotlink)'],
    ['assets/x.png', 'caminho inválido: deve ser local, começar com "/" e não conter ".."'],
    ['/../segredo.png', 'caminho inválido: deve ser local, começar com "/" e não conter ".."'],
    ['/a/../b.png', 'caminho inválido: deve ser local, começar com "/" e não conter ".."'],
    ['/a\\b.png', 'caminho inválido: deve ser local, começar com "/" e não conter ".."'],
    ['/x.gif', 'extensão não aceita (aceitas: png, jpg, jpeg, webp, avif, svg)'],
    ['/x', 'extensão não aceita (aceitas: png, jpg, jpeg, webp, avif, svg)'],
    ['/png', 'extensão não aceita (aceitas: png, jpg, jpeg, webp, avif, svg)'],
    ['/x.png?v=1', 'extensão não aceita (aceitas: png, jpg, jpeg, webp, avif, svg)'],
    ['/com espaço.png', 'caminho com espaço ou caractere de controle'],
    ['', 'caminho vazio'],
  ])('%j → %s', (path, motivo) => {
    expect(imagePathProblem(path)).toBe(motivo);
    expect(problems({ path })).toEqual([`path — ${motivo}`]);
  });

  it('ausente e não texto', () => {
    expect(imagePathProblem(undefined)).toBe('caminho ausente');
    expect(imagePathProblem(7)).toBe('esperado texto, recebido número');
  });
});
