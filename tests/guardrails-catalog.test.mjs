import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

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

test('guardrail captions cover the full catalog card width', () => {
  const page = fs.readFileSync(path.join(root, 'app', '(frontend)', 'guardrails', 'page.tsx'), 'utf8')
  assert.match(page, /figcaption className="absolute inset-x-0 bottom-0[^"]*bg-\[#244d9b\]/)
  assert.doesNotMatch(page, /figcaption className="[^"]*max-w-/)
  assert.doesNotMatch(page, /EMBEDDED_LABEL_STRIP_IMAGES/)
})

test('catalog images no longer contain the baked-in empty blue label blocks', async () => {
  for (const file of ['10.png', '12.png', '14.png', '16.png', '17.png', '24.png', '25.png', '26.png', '27.png', '28.png', '29.png']) {
    const imagePath = path.join(root, 'public', 'images', 'guardrails', file)
    const { data } = await sharp(imagePath).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    let catalogBluePixels = 0
    for (let index = 0; index < data.length; index += 3) {
      if (data[index] === 46 && data[index + 1] === 84 && data[index + 2] === 161) catalogBluePixels += 1
    }
    assert.ok(catalogBluePixels < 100, `${file} still contains ${catalogBluePixels} baked-in label pixels`)
  }
})
