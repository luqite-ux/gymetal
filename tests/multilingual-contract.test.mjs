import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = path.resolve(import.meta.dirname, '..')
const read = (file) => readFileSync(path.join(root, file), 'utf8')

const expectedLocales = ['en', 'zh', 'es', 'pt', 'fr', 'ar', 'el', 'ru', 'de']

test('site locale contract enables exactly the nine approved languages', () => {
  const source = read('lib/locales.ts')
  for (const locale of expectedLocales) assert.match(source, new RegExp(`code: '${locale}'`))
  assert.match(source, /DEFAULT_LOCALE[^\n]*'en'/)
  assert.match(source, /RTL_LOCALES[^\n]*'ar'/)
})

test('middleware rewrites locale-prefixed public URLs without localizing admin or API', () => {
  const source = read('middleware.ts')
  assert.match(source, /stripLocalePrefix/)
  assert.match(source, /x-site-locale/)
  assert.match(source, /NextResponse\.rewrite/)
  assert.match(source, /pathname\.startsWith\("\/api"\)/)
  assert.match(source, /pathname\.startsWith\("\/admin"\)/)
})

test('language provider persists locale, navigates equivalent URLs, and applies Arabic RTL', () => {
  const source = read('lib/language-context.tsx')
  assert.match(source, /document\.documentElement\.dir/)
  assert.match(source, /isRtlLocale/)
  assert.match(source, /document\.cookie/)
  assert.match(source, /window\.location\.assign/)
})

test('localized internal links retain the active locale and default-English routes stay canonical', () => {
  const linkPath = path.join(root, 'components/localized-link.tsx')
  assert.equal(existsSync(linkPath), true, 'localized link component missing')
  const localizedLink = read('components/localized-link.tsx')
  assert.match(localizedLink, /useLanguage/)
  assert.match(localizedLink, /localizePath/)
  assert.match(localizedLink, /<Link/)

  const middleware = read('middleware.ts')
  assert.match(middleware, /firstSegment === DEFAULT_LOCALE/)
  assert.match(middleware, /NextResponse\.redirect/)

  for (const file of [
    'components/header.tsx',
    'components/footer.tsx',
    'app/(frontend)/page.tsx',
    'app/(frontend)/about/page.tsx',
    'app/(frontend)/services/page.tsx',
    'app/(frontend)/products/page.tsx',
    'app/(frontend)/news/page.tsx',
    'app/(frontend)/news/[slug]/page.tsx',
    'app/(frontend)/faq/page.tsx',
  ]) {
    assert.match(read(file), /LocalizedLink/)
    assert.doesNotMatch(read(file), /from ['"]next\/link['"]/, `${file} must not bypass locale-aware links`)
  }
})

test('header exposes every approved language in the frontend switcher', () => {
  const source = read('components/header.tsx')
  assert.match(source, /SUPPORTED_LOCALES\.map/)
  for (const label of ['English', '中文', 'Español', 'Português', 'Français', 'العربية', 'Ελληνικά', 'Русский', 'Deutsch']) {
    assert.match(read('lib/locales.ts'), new RegExp(label))
  }
})

test('reviewed generated dictionaries exist for every new target locale', () => {
  const generatedPath = path.join(root, 'lib/generated-translations.json')
  assert.equal(existsSync(generatedPath), true)
  const generated = JSON.parse(readFileSync(generatedPath, 'utf8'))
  for (const locale of ['es', 'pt', 'fr', 'ar', 'el', 'ru', 'de']) {
    assert.equal(typeof generated[locale], 'object', `${locale} dictionary missing`)
    assert.equal(typeof generated[locale]?.nav?.home, 'string', `${locale} nav.home missing`)
    assert.ok(generated[locale].nav.home.trim())
  }
})

test('Chinese navigation does not retain the English News label', () => {
  const source = read('lib/i18n.ts')
  const chineseBlock = source.slice(source.indexOf('  zh: {'), source.indexOf('\n  },\n} as const'))
  assert.match(chineseBlock, /news:\s*'新闻资讯'/)
})

test('tenant translation utility requires two DeepSeek passes and exact tenant scoping', () => {
  const source = read('scripts/translate-tenant-content.mjs')
  assert.match(source, /7114167b-c383-4ef7-8c09-2af19a94882b/)
  assert.match(source, /translatePass/)
  assert.match(source, /reviewPass/)
  assert.match(source, /tenant_id=eq\./)
  assert.match(source, /warrant\(\?:y\|ies\)/)
  assert.match(source, /--locales=/, 'translation utility must support targeted locale repair')
  assert.match(source, /zh:\s*'Simplified Chinese'/, 'translation utility must be able to repair Chinese content')
  assert.match(source, /locale === 'zh'.*CJK_PATTERN\.test/s, 'Chinese completeness must require Chinese text')
})

test('long article HTML translates only text nodes while preserving source tags byte-for-byte', () => {
  const source = read('scripts/translate-tenant-content.mjs')
  assert.match(source, /MAX_HTML_CHUNK\s*=\s*2500/)
  assert.match(source, /extractTranslatableTextNodes/)
  assert.match(source, /restoreTranslatedTextNodes/)
  assert.match(source, /translateLongHtml/)
  assert.match(source, /await Promise\.all/)
  assert.match(source, /HTML entity mismatch/)
  assert.match(source, /ENTITY_TOKEN_PATTERN/)
  assert.match(source, /current\.length >= 15/)
  assert.match(source, /translateBatchWithSplit/)
  assert.match(source, /batch\.slice\(0, midpoint\)/)
})

test('a malformed DeepSeek review retries the complete review unit before failing', () => {
  const source = read('scripts/translate-tenant-content.mjs')
  const reviewedUnit = source.slice(
    source.indexOf('async function reviewedTranslation'),
    source.indexOf('function requestHeaders'),
  )
  assert.match(reviewedUnit, /for \(let attempt = 1; attempt <= 3; attempt \+= 1\)/)
  assert.match(reviewedUnit, /validate\(source, reviewed/)
})

test('DeepSeek explanatory wrapper keys are discarded before strict source-shape validation', () => {
  const source = read('scripts/translate-tenant-content.mjs')
  assert.match(source, /function normalizeShape/)
  assert.match(source, /normalizeShape\(source, translatedRaw\)/)
  assert.match(source, /normalizeShape\(source, reviewedRaw\)/)
})

test('DeepSeek trailing commentary is ignored after the first balanced JSON object', () => {
  const source = read('scripts/translate-tenant-content.mjs')
  assert.match(source, /function extractFirstJsonObject/)
  assert.match(source, /JSON\.parse\(extractFirstJsonObject\(cleaned\)\)/)
})

test('news reads the requested locale before English and legacy fallbacks', () => {
  const source = read('lib/frontend-news.ts')
  assert.match(source, /resolveLocalizedText\(localized, legacy, locale\)/)
  assert.match(source, /localized\?\.\[locale\]/)
  assert.match(source, /getPublishedNews = cache\(async \(locale/)
  assert.match(read('app/(frontend)/news/page.tsx'), /getRequestLocale/)
  assert.match(read('app/(frontend)/news/[slug]/page.tsx'), /getRequestLocale/)
})

test('metadata and sitemap publish canonical alternate URLs for all nine locales', () => {
  const layout = read('app/layout.tsx')
  const sitemap = read('app/sitemap.ts')
  assert.match(layout, /generateMetadata/)
  assert.match(layout, /x-default/)
  assert.match(layout, /SUPPORTED_LOCALES/)
  assert.match(sitemap, /SUPPORTED_LOCALES/)
  assert.match(sitemap, /localizePath/)
})
