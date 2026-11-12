// Bloqueio por região (IA-23). Os termos do nível gratuito da API Gemini só valem
// para visitantes fora do Espaço Econômico Europeu, do Reino Unido e da Suíça.
// A lista é conservadora: inclui territórios ultramarinos da UE e dependências do
// Reino Unido. País desconhecido em produção também é recusado (falha fechada).
const EEA = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  'IS',
  'LI',
  'NO',
];
const EU_OUTERMOST_AND_ISLANDS = ['AX', 'GP', 'MQ', 'GF', 'RE', 'YT'];
const UK_AND_DEPENDENCIES = ['GB', 'GI', 'IM', 'JE', 'GG'];
const SWITZERLAND = ['CH'];

export const BLOCKED_COUNTRIES = new Set([
  ...EEA,
  ...EU_OUTERMOST_AND_ISLANDS,
  ...UK_AND_DEPENDENCIES,
  ...SWITZERLAND,
]);

// `strict`: sem país informado, recusa (produção). Em desenvolvimento local não há geolocalização.
export function isBlocked(country: string | undefined, strict: boolean) {
  if (!country) return strict;

  return BLOCKED_COUNTRIES.has(country.toUpperCase());
}
