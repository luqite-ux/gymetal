import { readFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const TENANT_ID = '7114167b-c383-4ef7-8c09-2af19a94882b'
const TARGETS = ['es', 'pt', 'fr', 'ar', 'el', 'ru', 'de']
const ALL = ['en', 'zh', ...TARGETS]
const SCRIPT_PATTERNS = {
  zh: /[\u3400-\u9fff]/u,
  ar: /[\u0600-\u06ff]/u,
  el: /[\u0370-\u03ff]{2,}/u,
  ru: /[\u0400-\u04ff]/u,
}

function parseEnv(contents) {
  return Object.fromEntries(contents.split(/\r?\n/).map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)).filter(Boolean).map((match) => [match[1], match[2].trim().replace(/^["']|["']$/g, '').replace(/\\[nr]/g, '')]))
}

function flatten(value, trail = 'root', output = []) {
  if (typeof value === 'string') output.push([trail, value])
  else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) flatten(child, `${trail}.${key}`, output)
  return output
}

function auditLocale(locale, value, label, failures) {
  for (const [trail, text] of flatten(value, label)) {
    if (!text.trim()) failures.push(`${trail}: empty`)
    for (const [script, pattern] of Object.entries(SCRIPT_PATTERNS)) {
      if (script !== locale && locale !== 'zh' && pattern.test(text)) failures.push(`${trail}: contains ${script} script`)
    }
  }
}

const staticTranslations = JSON.parse(await readFile(path.join(ROOT, 'lib/generated-translations.json'), 'utf8'))
const pageTranslations = JSON.parse(await readFile(path.join(ROOT, 'lib/generated-page-translations.json'), 'utf8'))
const failures = []

for (const locale of TARGETS) {
  if (!staticTranslations[locale]) failures.push(`static.${locale}: missing`)
  else auditLocale(locale, staticTranslations[locale], `static.${locale}`, failures)
  if (!pageTranslations[locale]) failures.push(`page.${locale}: missing`)
  else auditLocale(locale, pageTranslations[locale], `page.${locale}`, failures)
}

const env = parseEnv(await readFile(path.join(ROOT, '.env.production.local'), 'utf8'))
const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
const rest = async (table, select) => {
  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?tenant_id=eq.${TENANT_ID}&select=${encodeURIComponent(select)}`, { headers })
  if (!response.ok) throw new Error(`${table} audit HTTP ${response.status}`)
  return response.json()
}

const tenantResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/rest/v1/tenants?id=eq.${TENANT_ID}&select=${encodeURIComponent('supported_languages,site_title_i18n,site_tagline_i18n,site_description_i18n,seo_title_i18n,seo_description_i18n,seo_keywords_i18n')}`, { headers })
if (!tenantResponse.ok) throw new Error(`tenant audit HTTP ${tenantResponse.status}`)
const tenant = (await tenantResponse.json())[0]
if (JSON.stringify(tenant?.supported_languages) !== JSON.stringify(ALL)) failures.push('tenant.supported_languages: mismatch')

const products = await rest('products', 'id,name,description,overview,name_i18n,description_i18n,overview_i18n')
const articles = await rest('articles', 'id,title,excerpt,content,title_i18n,excerpt_i18n,content_i18n')
for (const [type, rows] of [['tenant', [tenant]], ['product', products], ['article', articles]]) {
  for (const row of rows) {
    for (const [field, localized] of Object.entries(row || {})) {
      if (!field.endsWith('_i18n')) continue
      const legacyField = field.slice(0, -5)
      const sourceText = typeof localized?.en === 'string' && localized.en.trim()
        ? localized.en
        : (typeof row[legacyField] === 'string' ? row[legacyField] : '')
      for (const locale of TARGETS) {
        const text = localized?.[locale]
        if ((!text || !text.trim()) && sourceText.trim()) failures.push(`${type}.${row.id || TENANT_ID}.${field}.${locale}: missing`)
        else auditLocale(locale, text, `${type}.${row.id || TENANT_ID}.${field}.${locale}`, failures)
      }
    }
  }
}

console.log(JSON.stringify({ locales: TARGETS.length, staticSections: Object.keys(staticTranslations.es || {}).length, pageStrings: Object.keys(pageTranslations.es || {}).length, products: products.length, articles: articles.length, failures: failures.length }, null, 2))
if (failures.length) {
  console.error(failures.slice(0, 100).join('\n'))
  process.exitCode = 1
}
