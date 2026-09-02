import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = path.resolve(import.meta.dirname, '..')
const TARGETS = {
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  ar: 'Arabic',
  el: 'Greek',
  ru: 'Russian',
  de: 'German',
  nl: 'Dutch',
  it: 'Italian',
}
const FORBIDDEN = /warrant(?:y|ies)|guarantee(?:d)?|质保|保修|质量保证/i

async function loadDeepSeekKey() {
  if (process.env.DEEPSEEK_API_KEY) return process.env.DEEPSEEK_API_KEY
  const candidates = [
    path.resolve(ROOT, '../huanqiu-admin/.env.local'),
    path.resolve(ROOT, '../huanqiu-admin/.env'),
    path.resolve(ROOT, '../huanqiu-admin/_migrate-batch/.env'),
  ]
  for (const filename of candidates) {
    try {
      const contents = await readFile(filename, 'utf8')
      const match = contents.match(/^DEEPSEEK_API_KEY\s*=\s*["']?([^\r\n"']+)/m)
      if (match?.[1]) return match[1].trim()
    } catch {}
  }
  throw new Error('DEEPSEEK_API_KEY is not available')
}

function parseJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(cleaned)
}

function assertSameShape(source, translated, trail = 'root') {
  if (typeof source === 'string') {
    if (typeof translated !== 'string' || !translated.trim()) throw new Error(`${trail} is empty`)
    if (FORBIDDEN.test(translated)) throw new Error(`${trail} contains a forbidden promise`)
    return
  }
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error(`${trail} source shape unsupported`)
  if (!translated || typeof translated !== 'object' || Array.isArray(translated)) throw new Error(`${trail} shape mismatch`)
  const sourceKeys = Object.keys(source).sort()
  const translatedKeys = Object.keys(translated).sort()
  if (JSON.stringify(sourceKeys) !== JSON.stringify(translatedKeys)) throw new Error(`${trail} keys mismatch`)
  for (const key of sourceKeys) assertSameShape(source[key], translated[key], `${trail}.${key}`)
}

async function callDeepSeek(apiKey, messages) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-chat', temperature: 0.1, response_format: { type: 'json_object' }, messages }),
  })
  if (!response.ok) throw new Error(`DeepSeek HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`)
  const body = await response.json()
  return parseJson(body.choices?.[0]?.message?.content ?? '')
}

async function translatePass(apiKey, source, language) {
  return callDeepSeek(apiKey, [
    { role: 'system', content: `Translate overseas B2B website UI from English to ${language}. Return only a JSON object with exactly the same keys and nesting. Translate string values only. Preserve GY Metal, company names, emails, phone numbers, addresses, model numbers, standards, units and HTML. Do not add facts, certifications, promises, warranty or guarantee language.` },
    { role: 'user', content: JSON.stringify(source) },
  ])
}

async function reviewPass(apiKey, source, translation, language) {
  return callDeepSeek(apiKey, [
    { role: 'system', content: `Act as an independent ${language} B2B localization reviewer. Compare SOURCE and TRANSLATION. Correct terminology, grammar and naturalness while preserving every fact, number, model, standard, unit, email, phone, address and HTML. Remove any unsupported claim and all warranty/guarantee language. Return only the corrected TRANSLATION JSON with exactly the SOURCE keys and nesting.` },
    { role: 'user', content: JSON.stringify({ SOURCE: source, TRANSLATION: translation }) },
  ])
}

async function readEnglishDictionary() {
  const source = await readFile(path.join(ROOT, 'lib/i18n.ts'), 'utf8')
  const start = source.indexOf('export const translations =')
  const end = source.indexOf('} as const', start)
  if (start < 0 || end < 0) throw new Error('Unable to locate translations object')
  const literalStart = source.indexOf('{', start)
  const literal = source.slice(literalStart, end + 1)
  const translations = Function(`"use strict"; return (${literal})`)()
  return translations.en
}

const apiKey = await loadDeepSeekKey()
const english = await readEnglishDictionary()
let output = {}
try {
  output = JSON.parse(await readFile(path.join(ROOT, 'lib/generated-translations.json'), 'utf8'))
} catch {}

for (const [locale, language] of Object.entries(TARGETS)) {
  output[locale] ??= {}
  for (const [section, source] of Object.entries(english)) {
    if (output[locale][section]) {
      try {
        assertSameShape(source, output[locale][section], `${locale}.${section}.existing`)
        continue
      } catch {}
    }
    const translated = await translatePass(apiKey, source, language)
    assertSameShape(source, translated, `${locale}.${section}.translation`)
    const reviewed = await reviewPass(apiKey, source, translated, language)
    assertSameShape(source, reviewed, `${locale}.${section}.review`)
    output[locale][section] = reviewed
    process.stdout.write(`reviewed ${locale}.${section}\n`)
  }
}

await writeFile(path.join(ROOT, 'lib/generated-translations.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8')
process.stdout.write('static translations written after two DeepSeek passes\n')
