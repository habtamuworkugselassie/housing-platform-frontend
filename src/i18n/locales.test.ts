import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import en from './locales/en.json'
import am from './locales/am.json'

function flatten(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const keys = new Set<string>()
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object') flatten(v as Record<string, unknown>, key).forEach((x) => keys.add(x))
    else keys.add(key)
  }
  return keys
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(vue|ts|js)$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : []
  })
}

const enKeys = flatten(en)
const amKeys = flatten(am)

describe('i18n locales', () => {
  it('English and Amharic define the same keys', () => {
    expect([...enKeys].filter((k) => !amKeys.has(k))).toEqual([])
    expect([...amKeys].filter((k) => !enKeys.has(k))).toEqual([])
  })

  it('every literal key used in the code exists (a missing key renders as its own name)', () => {
    const used = new Map<string, string>()
    // Only whole literal keys: `t('a.b')` or `t('a.b', {...})`, not prefixes of a built key.
    const call = /(?<![\w.])(?:\$t|t|te)\(\s*['"]([A-Za-z][\w-]*(?:\.[\w-]+)+)['"]\s*[,)]/g
    for (const file of sourceFiles(join(__dirname, '..'))) {
      for (const m of readFileSync(file, 'utf8').matchAll(call)) {
        if (!used.has(m[1])) used.set(m[1], file)
      }
    }
    const missing = [...used].filter(([k]) => !enKeys.has(k)).map(([k, f]) => `${k} (${f.split('/src/')[1]})`)
    expect(missing).toEqual([])
  })
})
