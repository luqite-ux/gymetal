import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = path.resolve(import.meta.dirname, '..')
const read = (file) => readFileSync(path.join(root, file), 'utf8')

test('contact map requests an English Google Maps interface', () => {
  const source = read('app/(frontend)/contact/page.tsx')
  assert.match(source, /maps\.google\.com\/maps\?hl=en&gl=us&q=/)
  assert.match(source, /output=embed/)
  assert.doesNotMatch(source, /maps\/embed\?hl=en&pb=/)
})

test('footer preserves the original logo colors', () => {
  const source = read('components/footer.tsx')
  const logoStart = source.indexOf('src="/logo.webp"')
  const logoEnd = source.indexOf('/>', logoStart)
  assert.ok(logoStart >= 0 && logoEnd > logoStart)
  assert.doesNotMatch(source.slice(logoStart, logoEnd), /brightness-0|invert/)
})

test('customer-facing FAQ contains no warranty or guarantee promises', () => {
  const source = read('app/(frontend)/faq/page.tsx')
  assert.doesNotMatch(source, /warrant(?:y|ies)|guarantee(?:d)?|质保|保修|质量保证/i)
})

test('every equipment image reference resolves to a bundled customer asset', () => {
  const source = read('app/(frontend)/equipment/page.tsx')
  const references = [...source.matchAll(/image:\s*'([^']+)'/g)].map((match) => match[1])
  assert.ok(references.length > 0)
  for (const reference of references) {
    assert.equal(
      existsSync(path.join(root, 'public', reference.replace(/^\//, ''))),
      true,
      `missing equipment asset: ${reference}`,
    )
  }
})

test('published news resolves English i18n fields before legacy fields', () => {
  const source = read('lib/frontend-news.ts')
  assert.match(source, /title_i18n, excerpt_i18n, content_i18n/)
  assert.match(source, /resolveLocalizedText\(row\.title_i18n, row\.title, locale\)/)
  assert.match(source, /resolveLocalizedText\(row\.content_i18n, row\.content, locale\)/)
  const resolver = source.slice(
    source.indexOf('function resolveLocalizedText'),
    source.indexOf('function normalizeArticle'),
  )
  assert.ok(
    resolver.indexOf('const legacyText') < resolver.indexOf('const english'),
    'existing non-empty English fields must be preserved before i18n fallback',
  )
  assert.match(source, /process\.env\.NEXT_PUBLIC_TENANT_ID/)
  assert.doesNotMatch(source, /\.limit\(1\)/)
})

test('news cards always render a customer-site cover image', () => {
  const source = read('app/(frontend)/news/page.tsx')
  assert.match(source, /article\.featured_image \|\| "\/images\/precision-parts\.jpg"/)
  assert.match(source, /className="group block h-full/)
  assert.match(source, /<article className="flex h-full flex-col">/)
})
