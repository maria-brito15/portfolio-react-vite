#!/usr/bin/env node
// Gate SDD: lê e altera docs/specs/<feature>/.status. Única fonte de verdade da aprovação.
// Nunca lê requirements.md / design.md / tasks.md. Regras em docs/specs/GATES.md.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ORDER = [
  'idea:exploring',
  'idea:captured',
  'plan:draft',
  'plan:approved',
  'requirements:draft',
  'requirements:approved',
  'design:draft',
  'design:approved',
  'tasks:draft',
  'tasks:approved',
  'implementation:in-progress',
  'implementation:done',
  'review:done',
]

const REQUIREMENTS_DRAFT = ORDER.indexOf('requirements:draft')

/** Uma promoção vale se avança exatamente um passo, ou se pula as fases opcionais idea/plan. */
export function isValidTransition(from, to) {
  const a = ORDER.indexOf(from)
  const b = ORDER.indexOf(to)
  if (a < 0 || b < 0) return false
  if (b === a + 1) return true
  return b === REQUIREMENTS_DRAFT && a < REQUIREMENTS_DRAFT
}

/** Aceita só "<token>\n" (ou \r\n). Devolve o token ou null. */
export function parseStatus(raw) {
  const m = /^([a-z]+:[a-z-]+)\r?\n$/.exec(raw)
  return m && ORDER.includes(m[1]) ? m[1] : null
}

const SPECS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'specs')
const statusPath = (feature) => join(SPECS_DIR, feature, '.status')

function fail(code, msg) {
  console.error(msg)
  process.exit(code)
}

function load(feature) {
  if (!feature || /[\\/]/.test(feature) || feature.startsWith('.')) fail(2, 'feature inválida')
  const file = statusPath(feature)
  if (!existsSync(file)) fail(2, `.status ausente em ${feature}: pare e pergunte, não infira`)
  const token = parseStatus(readFileSync(file, 'utf8'))
  if (!token) fail(2, `.status inválido em ${feature}: pare e pergunte, não infira`)
  return token
}

function requireToken(token, label) {
  if (!ORDER.includes(token)) fail(2, `token inválido (${label}): ${token}. Válidos: ${ORDER.join(', ')}`)
}

function main(argv) {
  const yes = argv.includes('--yes')
  const [cmd, feature, token] = argv.filter((a) => a !== '--yes')

  switch (cmd) {
    case 'read':
      console.log(load(feature))
      return
    case 'check': {
      requireToken(token, 'exigido')
      const current = load(feature)
      if (ORDER.indexOf(current) >= ORDER.indexOf(token)) return
      fail(1, `${feature} está em ${current}; exige ${token} ou acima`)
      return
    }
    case 'promote': {
      requireToken(token, 'novo')
      const current = load(feature)
      if (!isValidTransition(current, token)) fail(1, `transição recusada: ${current} → ${token}`)
      if (!yes) fail(1, `${current} → ${token}: confirme com --yes`)
      writeFileSync(statusPath(feature), `${token}\n`, 'utf8')
      console.log(`${feature}: ${current} → ${token}`)
      return
    }
    case 'list': {
      const rows = readdirSync(SPECS_DIR)
        .filter((d) => statSync(join(SPECS_DIR, d)).isDirectory() && existsSync(statusPath(d)))
        .map((d) => {
          const token = parseStatus(readFileSync(statusPath(d), 'utf8'))
          const mtime = statSync(statusPath(d)).mtime.toISOString().slice(0, 16).replace('T', ' ')
          return [d, token ?? 'INVÁLIDO', mtime]
        })
      const header = ['feature', 'state', 'last-modified']
      const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)))
      const fmt = (r) => r.map((c, i) => c.padEnd(widths[i])).join(' | ')
      console.log([fmt(header), widths.map((w) => '-'.repeat(w)).join('-|-'), ...rows.map(fmt)].join('\n'))
      return
    }
    default:
      fail(2, 'uso: status read <feature> | check <feature> <token> | promote <feature> <token> --yes | list')
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2))
