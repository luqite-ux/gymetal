import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  extractHtmlTextNodes,
  findExactEnglishResidueNodes,
  findExactEnglishPlainFields,
  restoreHtmlTextNodes,
} from './locale-residue-utils.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const TENANT_ID = '7114167b-c383-4ef7-8c09-2af19a94882b'
const AVAILABLE_TARGETS = {
  zh: 'Simplified Chinese',
  es: 'Spanish', pt: 'Portuguese', fr: 'French', ar: 'Arabic',
  el: 'Greek', ru: 'Russian', de: 'German', nl: 'Dutch', it: 'Italian',
}
const DEFAULT_TARGET_LOCALES = ['es', 'pt', 'fr', 'ar', 'el', 'ru', 'de', 'nl', 'it']
const localeArgument = process.argv.find((argument) => argument.startsWith('--locales='))
const requestedLocales = localeArgument
  ? localeArgument.slice('--locales='.length).split(',').map((locale) => locale.trim()).filter(Boolean)
  : DEFAULT_TARGET_LOCALES
const unsupportedLocales = requestedLocales.filter((locale) => !AVAILABLE_TARGETS[locale])
if (!requestedLocales.length || unsupportedLocales.length) {
  throw new Error(`Unsupported --locales value: ${unsupportedLocales.join(',') || '(empty)'}`)
}
const TARGETS = Object.fromEntries(requestedLocales.map((locale) => [locale, AVAILABLE_TARGETS[locale]]))
const ENABLED = ['en', 'zh', ...DEFAULT_TARGET_LOCALES]
const FORBIDDEN = /warrant(?:y|ies)|guarantee(?:d)?|质保|保修|质量保证/i
const APPLY = process.argv.includes('--apply')
const PLAN = process.argv.includes('--plan')
const FORCE = process.argv.includes('--force')
const REPAIR_ENGLISH_RESIDUE = process.argv.includes('--repair-english-residue')
const MAX_HTML_CHUNK = 2500
const ENTITY_TOKEN_PATTERN = /&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);/gi
const CJK_PATTERN = /[\u3400-\u9fff]/u

async function loadAssignments(filename, names) {
  const contents = await readFile(filename, 'utf8')
  const result = {}
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match || !names.includes(match[1])) continue
    result[match[1]] = match[2].trim().replace(/^["']|["']$/g, '').replace(/\\[nr]/g, '')
  }
  return result
}

async function loadConfig() {
  const site = await loadAssignments(path.join(ROOT, '.env.production.local'), [
    'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  ])
  let deepSeek = process.env.DEEPSEEK_API_KEY
  for (const filename of [
    path.resolve(ROOT, '../huanqiu-admin/.env.local'),
    path.resolve(ROOT, '../huanqiu-admin/.env'),
    path.resolve(ROOT, '../huanqiu-admin/_migrate-batch/.env'),
  ]) {
    if (deepSeek) break
    try {
      deepSeek = (await loadAssignments(filename, ['DEEPSEEK_API_KEY'])).DEEPSEEK_API_KEY
    } catch {}
  }
  if (!site.NEXT_PUBLIC_SUPABASE_URL || !site.SUPABASE_SERVICE_ROLE_KEY || !deepSeek) {
    throw new Error('Required server-only translation configuration is missing')
  }
  return { url: site.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, ''), serviceKey: site.SUPABASE_SERVICE_ROLE_KEY, deepSeek }
}

function extractFirstJsonObject(text) {
  const start = text.indexOf('{')
  if (start < 0) throw new Error('DeepSeek response has no JSON object')
  let depth = 0
  let inString = false
  let escaped = false
  for (let index = start; index < text.length; index += 1) {
    const char = text[index]
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') inString = true
    else if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return text.slice(start, index + 1)
    }
  }
  throw new Error('DeepSeek JSON object is incomplete')
}

function parseJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(extractFirstJsonObject(cleaned))
}

function htmlTags(value) {
  return [...String(value).matchAll(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi)].map((match) => match[0].startsWith('</') ? `/${match[1].toLowerCase()}` : match[1].toLowerCase())
}

function normalizeShape(source, candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return candidate
  const keys = Object.keys(source)
  const candidates = [candidate, ...Object.values(candidate).filter((value) => value && typeof value === 'object' && !Array.isArray(value))]
  const best = candidates.sort((a, b) => (
    keys.filter((key) => typeof b[key] === 'string').length - keys.filter((key) => typeof a[key] === 'string').length
  ))[0]
  return Object.fromEntries(keys.filter((key) => typeof best[key] === 'string').map((key) => [key, best[key]]))
}

function validate(source, translated, trail = 'root') {
  if (!translated || typeof translated !== 'object' || Array.isArray(translated)) throw new Error(`${trail} must be an object`)
  const sourceKeys = Object.keys(source).sort()
  if (JSON.stringify(sourceKeys) !== JSON.stringify(Object.keys(translated).sort())) throw new Error(`${trail} keys mismatch`)
  for (const key of sourceKeys) {
    if (typeof translated[key] !== 'string' || !translated[key].trim()) throw new Error(`${trail}.${key} is empty`)
    if (FORBIDDEN.test(translated[key])) throw new Error(`${trail}.${key} contains a forbidden promise`)
    if (String(source[key]).includes('<') && JSON.stringify(htmlTags(source[key])) !== JSON.stringify(htmlTags(translated[key]))) {
      throw new Error(`${trail}.${key} HTML structure mismatch`)
    }
  }
}

async function deepSeekJson(apiKey, messages) {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'deepseek-chat', temperature: 0.1, max_tokens: 8192, response_format: { type: 'json_object' }, messages }),
      })
      if (!response.ok) throw new Error(`DeepSeek HTTP ${response.status}: ${(await response.text()).slice(0, 160)}`)
      return parseJson((await response.json()).choices?.[0]?.message?.content ?? '')
    } catch (error) {
      lastError = error
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1500))
    }
  }
  throw lastError
}

async function translatePass(apiKey, source, language, context, requireTranslation = false) {
  const residueRule = language === 'Simplified Chinese'
    ? 'Use natural Simplified Chinese throughout.'
    : 'Do not leave Chinese text in the result.'
  return deepSeekJson(apiKey, [
    { role: 'system', content: `Translate all human-language text in this overseas B2B metal-manufacturing content to ${language}. The source may contain English, Chinese, or a mixture of both. Return only JSON with exactly the same keys. Translate values only. Preserve GY Metal, company names, URLs, emails, phone numbers, addresses, HTML tags and attributes, model numbers, standards, figures and units. ${residueRule} ${requireTranslation ? 'Every supplied value is confirmed untranslated residue and must be rendered in the target language; do not repeat an English source phrase.' : ''} Do not add facts, claims, certifications, warranty or guarantee language. Context is reference only: ${context}.` },
    { role: 'user', content: JSON.stringify(source) },
  ])
}

async function reviewPass(apiKey, source, translation, language, context, requireTranslation = false) {
  return deepSeekJson(apiKey, [
    { role: 'system', content: `Independently review this ${language} B2B translation against the SOURCE, which may contain English and Chinese. Correct terminology and native fluency, and translate any Chinese residue into ${language}. ${requireTranslation ? 'Every supplied value is confirmed untranslated residue and must not remain identical to its English source.' : ''} Preserve all facts, HTML, numbers, units, models, standards, addresses and contact details. Remove additions and all warranty/guarantee language. Return only corrected JSON with exactly the SOURCE keys. Context is reference only: ${context}.` },
    { role: 'user', content: JSON.stringify({ SOURCE: source, TRANSLATION: translation }) },
  ])
}

async function translateChineseResiduePass(apiKey, source, language, context) {
  return deepSeekJson(apiKey, [
    { role: 'system', content: `Translate every Chinese character in the JSON values into ${language}. This is a mandatory residue-repair pass. Do not copy, transliterate, or retain Chinese characters. Preserve numeric JSON keys, HTML, numbers, units, models and standards. Return only JSON with exactly the same keys. Context: ${context}.` },
    { role: 'user', content: JSON.stringify(source) },
  ])
}

async function reviewedTranslation(config, source, locale, context, { requireTranslation = false } = {}) {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const translatedRaw = await translatePass(config.deepSeek, source, TARGETS[locale], context, requireTranslation)
      const translated = normalizeShape(source, translatedRaw)
      const missingKeys = Object.keys(source).filter((key) => typeof translated[key] !== 'string' || !translated[key].trim())
      const recovered = await Promise.all(missingKeys.map(async (key) => {
        const singleSource = { [key]: source[key] }
        const singleRaw = await translatePass(config.deepSeek, singleSource, TARGETS[locale], `${context} missing ${key}`, requireTranslation)
        const single = normalizeShape(singleSource, singleRaw)
        validate(singleSource, single, `${context}.${locale}.recovered.${key}`)
        return [key, single[key]]
      }))
      Object.assign(translated, Object.fromEntries(recovered))
      validate(source, translated, `${context}.${locale}.translation`)
      const reviewedRaw = await reviewPass(config.deepSeek, source, translated, TARGETS[locale], context, requireTranslation)
      const reviewedNormalized = normalizeShape(source, reviewedRaw)
      const reviewed = Object.fromEntries(Object.keys(source).map((key) => [
        key,
        typeof reviewedNormalized[key] === 'string' && reviewedNormalized[key].trim()
          ? reviewedNormalized[key]
          : translated[key],
      ]))
      const residueKeys = locale === 'zh'
        ? []
        : Object.keys(reviewed).filter((key) => CJK_PATTERN.test(reviewed[key]))
      const repairedResidues = await Promise.all(residueKeys.map(async (key) => {
        const singleSource = { [key]: source[key] }
        const repairedRaw = await translateChineseResiduePass(config.deepSeek, singleSource, TARGETS[locale], `${context} Chinese residue ${key}`)
        const repaired = normalizeShape(singleSource, repairedRaw)
        validate(singleSource, repaired, `${context}.${locale}.residue-translation.${key}`)
        const recheckedRaw = await reviewPass(config.deepSeek, singleSource, repaired, TARGETS[locale], `${context} Chinese residue ${key}`)
        const rechecked = normalizeShape(singleSource, recheckedRaw)
        const value = typeof rechecked[key] === 'string' && rechecked[key].trim() && !CJK_PATTERN.test(rechecked[key])
          ? rechecked[key]
          : repaired[key]
        if (CJK_PATTERN.test(value)) throw new Error(`${context}.${locale}.residue-review.${key} still contains Chinese`)
        return [key, value]
      }))
      Object.assign(reviewed, Object.fromEntries(repairedResidues))
      validate(source, reviewed, `${context}.${locale}.review`)
      if (requireTranslation) {
        for (const [key, value] of Object.entries(reviewed)) {
          if (String(value).trim() === String(source[key]).trim()) {
            throw new Error(`${context}.${locale}.${key} is identical to its English source`)
          }
        }
      }
      for (const [key, value] of Object.entries(reviewed)) {
        if (locale !== 'zh' && CJK_PATTERN.test(value)) throw new Error(`${context}.${locale}.review.${key} contains Chinese residue`)
      }
      return reviewed
    } catch (error) {
      lastError = error
      process.stdout.write(`retry ${context} ${locale} attempt=${attempt} reason=${error instanceof Error ? error.message : 'invalid review'}\n`)
    }
  }
  throw lastError
}

function htmlEntities(value) {
  return [...String(value).matchAll(ENTITY_TOKEN_PATTERN)].map((match) => match[0])
}

function extractTranslatableTextNodes(html) {
  const tokens = String(html).split(/(<[^>]+>|&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);)/gi)
  const nodes = []
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
    const token = tokens[tokenIndex]
    if (!token || token.startsWith('<') || ENTITY_TOKEN_PATTERN.test(token) || !/[\p{L}]/u.test(token)) {
      ENTITY_TOKEN_PATTERN.lastIndex = 0
      continue
    }
    ENTITY_TOKEN_PATTERN.lastIndex = 0
    const leading = token.match(/^\s*/)?.[0] ?? ''
    const trailing = token.match(/\s*$/)?.[0] ?? ''
    const core = token.slice(leading.length, token.length - trailing.length)
    if (!core) continue
    nodes.push({ tokenIndex, key: `n${tokenIndex}`, core, leading, trailing })
  }
  return { tokens, nodes }
}

function restoreTranslatedTextNodes(tokens, nodes, translations) {
  const restored = [...tokens]
  for (const node of nodes) restored[node.tokenIndex] = `${node.leading}${translations[node.key]}${node.trailing}`
  return restored.join('')
}

async function translateBatchWithSplit(config, batch, locale, context, requireTranslation = false) {
  const source = Object.fromEntries(batch.map((node) => [node.key, node.core]))
  try {
    return await reviewedTranslation(config, source, locale, context, { requireTranslation })
  } catch (error) {
    if (batch.length === 1) throw error
    const midpoint = Math.ceil(batch.length / 2)
    const [left, right] = await Promise.all([
      translateBatchWithSplit(config, batch.slice(0, midpoint), locale, `${context} split-left`, requireTranslation),
      translateBatchWithSplit(config, batch.slice(midpoint), locale, `${context} split-right`, requireTranslation),
    ])
    return { ...left, ...right }
  }
}

async function repairEnglishResidueHtml(config, sourceHtml, localizedHtml, locale, context) {
  const residues = findExactEnglishResidueNodes(sourceHtml, localizedHtml)
  if (!residues.length) return localizedHtml
  const { tokens } = extractHtmlTextNodes(localizedHtml)
  const batches = []
  for (let index = 0; index < residues.length; index += 12) {
    batches.push(residues.slice(index, index + 12))
  }
  const translatedBatches = await Promise.all(batches.map((batch, index) => (
    translateBatchWithSplit(config, batch, locale, `${context} residue batch ${index + 1}/${batches.length}`, true)
  )))
  const translated = restoreHtmlTextNodes(tokens, residues, Object.assign({}, ...translatedBatches))
  if (JSON.stringify(htmlTags(localizedHtml)) !== JSON.stringify(htmlTags(translated))) {
    throw new Error(`${context}.${locale} residue repair changed HTML structure`)
  }
  if (JSON.stringify(htmlEntities(localizedHtml)) !== JSON.stringify(htmlEntities(translated))) {
    throw new Error(`${context}.${locale} residue repair changed HTML entities`)
  }
  const remaining = findExactEnglishResidueNodes(sourceHtml, translated)
  if (remaining.length) throw new Error(`${context}.${locale} still has ${remaining.length} English residue nodes`)
  return translated
}

async function translateLongHtml(config, html, locale, context) {
  const { tokens, nodes } = extractTranslatableTextNodes(html)
  const batches = []
  let current = []
  let currentLength = 0
  for (const node of nodes) {
    if (current.length && (current.length >= 15 || currentLength + node.core.length > MAX_HTML_CHUNK)) {
      batches.push(current)
      current = []
      currentLength = 0
    }
    current.push(node)
    currentLength += node.core.length
  }
  if (current.length) batches.push(current)

  const translatedBatches = await Promise.all(batches.map(async (batch, index) => {
    const reviewed = await translateBatchWithSplit(config, batch, locale, `${context} text batch ${index + 1}/${batches.length}`)
    for (const node of batch) {
      if (/[<>]/.test(reviewed[node.key])) throw new Error(`${context}.${locale}.${node.key} injected HTML`)
    }
    return reviewed
  }))
  const translations = Object.assign({}, ...translatedBatches)
  const translated = restoreTranslatedTextNodes(tokens, nodes, translations)
  if (JSON.stringify(htmlTags(html)) !== JSON.stringify(htmlTags(translated))) throw new Error(`${context}.${locale} combined HTML mismatch`)
  if (JSON.stringify(htmlEntities(html)) !== JSON.stringify(htmlEntities(translated))) throw new Error(`${context}.${locale} HTML entity mismatch`)
  return translated
}

function requestHeaders(config, prefer) {
  return {
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
    'Content-Type': 'application/json; charset=utf-8',
    ...(prefer ? { Prefer: prefer } : {}),
  }
}

async function select(config, table, query) {
  const response = await fetch(`${config.url}/rest/v1/${table}?${query}`, { headers: requestHeaders(config) })
  if (!response.ok) throw new Error(`${table} select failed: ${response.status}`)
  return response.json()
}

async function patchRow(config, table, filter, body) {
  if (!APPLY) return
  const response = await fetch(`${config.url}/rest/v1/${table}?${filter}`, {
    method: 'PATCH', headers: requestHeaders(config, 'return=minimal'), body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`${table} patch failed: ${response.status} ${(await response.text()).slice(0, 160)}`)
}

function sourceValue(row, field, legacyFields = []) {
  const localized = row[`${field}_i18n`]
  if (localized?.en && String(localized.en).trim()) return String(localized.en)
  for (const legacy of legacyFields) if (row[legacy] && String(row[legacy]).trim()) return String(row[legacy])
  return ''
}

async function translateTenant(config) {
  const [tenant] = await select(config, 'tenants', `id=eq.${TENANT_ID}&select=*`)
  const fields = ['site_title', 'site_tagline', 'site_description', 'contact_address', 'seo_title', 'seo_description', 'seo_keywords']
  const source = {}
  for (const field of fields) {
    const value = tenant[`${field}_i18n`]?.en
    if (value && String(value).trim()) source[field] = String(value)
  }
  const tenantComplete = Object.keys(source).every((field) => Object.keys(TARGETS).every((locale) => tenant[`${field}_i18n`]?.[locale]))
  if (!PLAN && !FORCE && tenantComplete && ENABLED.every((locale) => tenant.supported_languages?.includes(locale))) {
    process.stdout.write('tenant already reviewed; skipped\n')
    return
  }
  if (PLAN) {
    process.stdout.write(`PLAN tenant fields=${Object.keys(source).join(',')} locales=${Object.keys(TARGETS).join(',')}\n`)
    return
  }
  const translations = {}
  for (const locale of Object.keys(TARGETS)) translations[locale] = await reviewedTranslation(config, source, locale, 'tenant settings')
  const body = { supported_languages: ENABLED, default_language: 'en' }
  for (const field of Object.keys(source)) {
    body[`${field}_i18n`] = { ...(tenant[`${field}_i18n`] ?? {}) }
    for (const locale of Object.keys(TARGETS)) body[`${field}_i18n`][locale] = translations[locale][field]
  }
  body.extra_settings = {
    ...(tenant.extra_settings ?? {}),
    translation_profile: {
      industry: 'precision metal manufacturing',
      company_summary: 'Wuxi Guangyue Metal Technology Co., Ltd. manufactures custom castings, forgings and machined parts from customer drawings.',
      main_products: ['Castings', 'Forgings', 'Machined Parts', 'Assemblies'],
      target_markets: ['international B2B buyers'],
      glossary: { 'GY Metal': 'GY Metal', 'CNC': 'CNC', 'ISO 9001:2015': 'ISO 9001:2015' },
    },
    multilingual_review: { method: 'DeepSeek translation plus independent DeepSeek review', reviewed_at: new Date().toISOString(), locales: Object.keys(TARGETS) },
  }
  await patchRow(config, 'tenants', `id=eq.${TENANT_ID}`, body)
  process.stdout.write(`tenant reviewed locales=${Object.keys(TARGETS).join(',')} mode=${APPLY ? 'apply' : 'dry-run'}\n`)
}

async function translateRows(config, table, fieldConfig) {
  const rows = await select(config, table, `tenant_id=eq.${TENANT_ID}&select=*`)
  if (PLAN) {
    process.stdout.write(`PLAN ${table} rows=${rows.length} fields=${Object.keys(fieldConfig).join(',')} locales=${Object.keys(TARGETS).join(',')}\n`)
    return
  }
  for (const [index, row] of rows.entries()) {
    const source = {}
    for (const [field, legacy] of Object.entries(fieldConfig)) {
      const value = sourceValue(row, field, legacy)
      if (value) source[field] = value
    }
    if (!Object.keys(source).length) continue
    if (REPAIR_ENGLISH_RESIDUE && table === 'articles' && source.content) {
      const body = {
        title_i18n: { ...(row.title_i18n ?? {}), en: source.title },
        excerpt_i18n: { ...(row.excerpt_i18n ?? {}), en: source.excerpt },
        content_i18n: { ...(row.content_i18n ?? {}), en: source.content },
      }
      let changed = false
      for (const locale of Object.keys(TARGETS)) {
        const plainSource = Object.fromEntries(
          ['title', 'excerpt'].filter((field) => source[field]).map((field) => [field, source[field]]),
        )
        const plainLocalized = Object.fromEntries(
          Object.keys(plainSource).map((field) => [field, row[`${field}_i18n`]?.[locale]]),
        )
        const plainResidueFields = findExactEnglishPlainFields(plainSource, plainLocalized)
        const plainMissingFields = Object.keys(plainSource).filter((field) => {
          const value = plainLocalized[field]
          return typeof value !== 'string' || !value.trim()
        })
        const plainRepairFields = [...new Set([...plainResidueFields, ...plainMissingFields])]
        if (plainRepairFields.length) {
          const residueSource = Object.fromEntries(plainRepairFields.map((field) => [field, plainSource[field]]))
          const repairedPlain = await reviewedTranslation(config, residueSource, locale, `${table} ${row.id} plain English residue`, { requireTranslation: true })
          for (const field of plainRepairFields) {
            body[`${field}_i18n`][locale] = repairedPlain[field]
            changed = true
          }
        }
        const localized = row.content_i18n?.[locale]
        if (typeof localized !== 'string' || !localized.trim()) continue
        const repaired = await repairEnglishResidueHtml(
          config,
          source.content,
          localized,
          locale,
          `${table} ${row.id}`,
        )
        body.content_i18n[locale] = repaired
        changed ||= repaired !== localized
        process.stdout.write(`${table} ${index + 1}/${rows.length} ${locale} English residues repaired\n`)
      }
      if (changed) await patchRow(config, table, `tenant_id=eq.${TENANT_ID}&id=eq.${row.id}`, body)
      process.stdout.write(`${table} ${index + 1}/${rows.length} residue repair ${changed ? (APPLY ? 'written' : 'dry-run') : 'not needed'}\n`)
      continue
    }
    const rowComplete = Object.keys(source).every((field) => Object.keys(TARGETS).every((locale) => {
      const value = row[`${field}_i18n`]?.[locale]
      if (typeof value !== 'string' || !value.trim()) return false
      if (locale === 'zh') {
        return CJK_PATTERN.test(value) || !/[A-Za-z]/.test(source[field])
      }
      return !CJK_PATTERN.test(value)
    }))
    if (!FORCE && rowComplete) {
      process.stdout.write(`${table} ${index + 1}/${rows.length} already reviewed; skipped\n`)
      continue
    }
    const body = {}
    for (const field of Object.keys(source)) body[`${field}_i18n`] = { ...(row[`${field}_i18n`] ?? {}), en: source[field] }
    for (const locale of Object.keys(TARGETS)) {
      const shortSource = { ...source }
      const longContent = shortSource.content?.length > MAX_HTML_CHUNK ? shortSource.content : null
      if (longContent) delete shortSource.content
      const reviewed = Object.keys(shortSource).length
        ? await reviewedTranslation(config, shortSource, locale, `${table} ${row.id}`)
        : {}
      if (longContent) reviewed.content = await translateLongHtml(config, longContent, locale, `${table} ${row.id}`)
      for (const field of Object.keys(source)) body[`${field}_i18n`][locale] = reviewed[field]
      process.stdout.write(`${table} ${index + 1}/${rows.length} ${locale} reviewed\n`)
    }
    await patchRow(config, table, `tenant_id=eq.${TENANT_ID}&id=eq.${row.id}`, body)
    process.stdout.write(`${table} ${index + 1}/${rows.length} ${APPLY ? 'written' : 'dry-run'}\n`)
  }
}

const config = await loadConfig()
await translateTenant(config)
await translateRows(config, 'products', {
  name: ['name_en', 'name'], description: ['description_en', 'description'], overview: ['overview_en', 'overview'],
})
await translateRows(config, 'articles', {
  title: ['title_en', 'title'], excerpt: ['excerpt_en', 'excerpt'], content: ['content_en', 'content'],
})
process.stdout.write(`translation run complete mode=${APPLY ? 'apply' : 'dry-run'}\n`)
