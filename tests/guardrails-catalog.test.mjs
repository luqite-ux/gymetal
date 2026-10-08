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
    assert.equal(Array.isArray(category.captions), true, `${category.title} captions are missing`)
    assert.equal(category.captions.length, category.images.length, `${category.title} captions`)
    for (const image of category.images) {
      assert.equal(fs.existsSync(path.join(root, 'public', image.replace(/^\//, ''))), true, image)
    }
  }
  assert.deepEqual(catalog[0].captions.slice(0, 6), [
    'Model A Pointy', 'Model B Pointy', 'Model B Flathead',
    'Model C Pointy', 'Wave type', 'Model D Flathead',
  ])
  assert.equal(catalog.find((category) => category.slug === 'mesh').images.at(-1), '/images/guardrails/47.jpeg')
  assert.equal(catalog.find((category) => category.slug === 'aluminum-pavilion').images.length, 5)
  assert.deepEqual(catalog.find((category) => category.slug === 'road-barrier').captions, ['', ''])
})
