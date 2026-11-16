import { LinkSchema, linkProblem } from './link';

const NOT_ACCEPTED = 'formato não aceito (use https, caminho começando com "/" ou mailto:)';

describe('Link: formatos aceitos', () => {
  it.each([
    'https://exemplo.com/a',
    'HTTPS://Exemplo.com', // EC-06: o protocolo e o host não diferenciam maiúscula
    'https://exemplo.com:8443/a?x=1#b',
    '/projetos',
    '/estudos-de-caso/x#decisoes',
    '/', // EC-07
    '/projetos?x=1#a', // EC-07
    'mailto:contato@exemplo.com',
    'mailto:a.b+c@sub.exemplo.com.br',
  ])('%s é válido', (link) => {
    expect(linkProblem(link)).toBeNull();
    expect(LinkSchema.safeParse(link).success).toBe(true);
  });
});

describe('Link: recusados, com o motivo', () => {
  it.each([
    ['//exemplo.com/a', 'endereço sem protocolo não é aceito ("//exemplo.com")'],
    ['/\\exemplo.com', 'endereço sem protocolo não é aceito ("/\\exemplo.com")'],
    ['http://exemplo.com', 'precisa de https, recebido http'],
    ['javascript:alert(1)', NOT_ACCEPTED],
    ['data:text/html,<b>x</b>', NOT_ACCEPTED],
    ['tel:123', NOT_ACCEPTED],
    ['exemplo.com', NOT_ACCEPTED],
    ['mailto:', 'e-mail ausente'],
    ['mailto:semarroba', 'formato do e-mail inválido'],
    ['mailto:a@b', 'formato do e-mail inválido'],
    ['mailto:contato@exemplo.com?subject=oi', 'mailto: com parâmetros não é aceito'],
    ['https://usuario:senha@exemplo.com', 'https com usuário e senha não é aceito'],
    ['https://a:b@x', 'https com usuário e senha não é aceito'],
    ['https://usuario@exemplo.com', 'https com usuário e senha não é aceito'],
    ['https://', 'endereço https inválido'],
    ['/com espaço', 'link com espaço ou caractere de controle'],
    ['/a\tb', 'link com espaço ou caractere de controle'],
    ['/a\nb', 'link com espaço ou caractere de controle'],
    [' /projetos', 'link com espaço ou caractere de controle'],
    ['https://exemplo.com/a b', 'link com espaço ou caractere de controle'],
    ['', 'link vazio'],
  ])('%j → %s', (link, motivo) => {
    expect(linkProblem(link)).toBe(motivo);
    expect(LinkSchema.safeParse(link).success).toBe(false);
  });

  it('não texto', () => {
    expect(linkProblem(undefined)).toBe('link ausente');
    expect(linkProblem(42)).toBe('esperado texto, recebido número');
    expect(linkProblem(null)).toBe('esperado texto, recebido nulo');
  });

  it('a mensagem do schema é o motivo, sem prefixo do zod', () => {
    const result = LinkSchema.safeParse('http://exemplo.com');

    expect(result.error?.issues.map((i) => i.message)).toEqual(['precisa de https, recebido http']);
  });
});
