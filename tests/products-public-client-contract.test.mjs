import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = path.resolve(import.meta.dirname, '..')
const read = (file) => readFileSync(path.join(root, file), 'utf8')

test('public products load the active tenant catalog in backend order', () => {
  const dataLayer = path.join(root, 'lib', 'frontend-products.ts')
  assert.equal(existsSync(dataLayer), true, 'a public product data layer is required')

  const source = read('lib/frontend-products.ts')
  assert.match(source, /createPublicClient/)
  assert.match(source, /from\("products"\)/)
  assert.match(source, /\.eq\("tenant_id", tenantId\)/)
  assert.match(source, /\.eq\("is_active", true\)/)
  assert.match(source, /\.order\("sort_order", \{ ascending: true \}\)/)
  assert.match(source, /name_en/)
  assert.match(source, /description_en/)
})

test('products page renders the published backend catalog instead of a fixed four-item array', () => {
  const source = read('app/(frontend)/products/page.tsx')
  assert.match(source, /getPublishedProducts/)
  assert.doesNotMatch(source, /const products = \[/)
  assert.doesNotMatch(source, /'\/images\/3\.jpg'/)
})
