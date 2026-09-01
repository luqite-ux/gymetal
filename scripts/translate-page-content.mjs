import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = path.resolve(import.meta.dirname, '..')
const TARGETS = { es: 'Spanish', pt: 'Portuguese', fr: 'French', ar: 'Arabic', el: 'Greek', ru: 'Russian', de: 'German' }
const FORBIDDEN = /warrant(?:y|ies)|guarantee(?:d)?|质保|保修|质量保证/i
const EXTRA = [
  'Frequently Asked Questions',
  'Find answers to common questions about our products, services, pricing, and quality inspection.',
  'questions',
  'Still have questions?',
  "Contact us directly and we'll be happy to help.",
  'Contact Us',
  'Machining Machines',
  'Testing Devices',
  'Best Accuracy',
  'Max Machining Size',
  'Equipment Categories',
  'CNC Lathes',
  'Vertical Lathes',
  'Boring Mills',
  'Machining Centers',
  'Submission failed. Please check the verification code and try again.',
  'Message Sent!',
  'Thank you for contacting us. We will get back to you soon.',
  'Send Another Message',
  'Tell us about your project requirements...',
  'Sending...',
  'Business Hours',
  'Monday - Friday',
  'Saturday',
  'Sunday',
  'Closed',
  'Our Location',
  'Scroll',
  'Founded',
  'Established in Wuxi, China',
  'Expansion',
  'Moved to 4,500m² facility',
  'Quality certification achieved',
  'Global',
  'Export to 20+ countries',
  'Our Journey',
  'Our Facility',
  'Our Team',
  'Quality Management',
  'Quality Management System',
  'Toggle menu',
  'CNC Machining',
  'Precision Parts',
]

async function loadKey() {
  if (process.env.DEEPSEEK_API_KEY) return process.env.DEEPSEEK_API_KEY
  for (const filename of ['../huanqiu-admin/.env.local', '../huanqiu-admin/.env', '../huanqiu-admin/_migrate-batch/.env']) {
    try {
      const value = await readFile(path.resolve(ROOT, filename), 'utf8')
      const match = value.match(/^DEEPSEEK_API_KEY\s*=\s*["']?([^\r\n"']+)/m)
      if (match?.[1]) return match[1].trim()
    } catch {}
  }
  throw new Error('DEEPSEEK_API_KEY is not available')
}

function parseJson(text) {
  return JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''))
}

async function call(apiKey, messages) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-chat', temperature: 0.1, response_format: { type: 'json_object' }, messages }),
  })
  if (!response.ok) throw new Error(`DeepSeek HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`)
  return parseJson((await response.json()).choices?.[0]?.message?.content || '')
}

function validate(source, result, label) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error(`${label} is not an object`)
  for (const key of source) {
    if (typeof result[key] !== 'string' || !result[key].trim()) throw new Error(`${label} missing ${key}`)
    if (FORBIDDEN.test(result[key])) throw new Error(`${label} contains forbidden promise`)
  }
  if (Object.keys(result).length !== source.length) throw new Error(`${label} key count mismatch`)
}

const source = new Set(EXTRA)
for (const filename of ['app/(frontend)/faq/page.tsx', 'app/(frontend)/equipment/page.tsx']) {
  const code = await readFile(path.join(ROOT, filename), 'utf8')
  const pattern = /\b(?:titleEn|qEn|aEn|nameEn|category|descEn):\s*('(?:\\.|[^'\\])*')/g
  for (const match of code.matchAll(pattern)) source.add(Function(`"use strict"; return ${match[1]}`)())
}
const strings = [...source]
const indexedPayload = Object.fromEntries(strings.map((value, index) => [String(index), value]))
const apiKey = await loadKey()
let output = {}
try { output = JSON.parse(await readFile(path.join(ROOT, 'lib/generated-page-translations.json'), 'utf8')) } catch {}

for (const [locale, language] of Object.entries(TARGETS)) {
  if (output[locale]) {
    try { validate(strings, output[locale], `${locale}.existing`); continue } catch {}
  }
  const translated = await call(apiKey, [
    { role: 'system', content: `Translate the values of this numerically keyed JSON object from English to ${language} for a precision metal manufacturing B2B website. Preserve every numeric JSON key exactly, and preserve all models, numbers, units, standards, emails and company names. Return JSON only. Do not add facts, certifications, promises, warranty or guarantee language.` },
    { role: 'user', content: JSON.stringify(indexedPayload) },
  ])
  validate(Object.keys(indexedPayload), translated, `${locale}.translation`)
  const reviewed = await call(apiKey, [
    { role: 'system', content: `Independently review this ${language} website translation. Correct terminology and naturalness while preserving all facts, models, numbers, units and every numeric JSON key. Do not add claims, warranty or guarantee language. Return the full corrected translation object only.` },
    { role: 'user', content: JSON.stringify({ SOURCE: indexedPayload, TRANSLATION: translated }) },
  ])
  const reviewedComplete = Object.fromEntries(Object.keys(indexedPayload).map((key) => [
    key,
    typeof reviewed[key] === 'string' && reviewed[key].trim() ? reviewed[key] : translated[key],
  ]))
  validate(Object.keys(indexedPayload), reviewedComplete, `${locale}.review`)
  output[locale] = Object.fromEntries(strings.map((value, index) => [value, reviewedComplete[String(index)]]))
  await writeFile(path.join(ROOT, 'lib/generated-page-translations.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  process.stdout.write(`reviewed ${locale} page content\n`)
}
