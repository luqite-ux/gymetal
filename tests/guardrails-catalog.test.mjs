import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

test('guardrail catalog preserves all customer-supplied categories and images', () => {
  const catalogPath = path.join(root, 'lib', 'guardrails.json')
  assert.equal(fs.existsSync(catalogPath), true, 'guardrails catalog module is missing')
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
  assert.equal(catalog.length, 11)
  assert.equal(catalog.reduce((total, category) => total + category.images.length, 0), 64)
  assert.deepEqual(catalog.map((category) => category.title), [
    'Zinc Steel Railing and Guardrail',
    'Wrought Iron Guardrail',
    'Aluminum Gate and Guardrail',
    'Real Estate Guardrail',
    'Stair Railing',
    'Municipal River Bridge Railing',
    'Mesh Guardrail',
    'Steel Structure Product',
    'Aluminum Pavilion',
    'Decorative Aluminum Product',
    'Safety Guardrail for Road Barrier',
  ])
  for (const category of catalog) {
    for (const image of category.images) {
      assert.equal(fs.existsSync(path.join(root, 'public', image.replace(/^\//, ''))), true, image)
    }
  }
})
