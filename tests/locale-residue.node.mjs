import assert from 'node:assert/strict'
import test from 'node:test'

import {
  extractHtmlTextNodes,
  findExactEnglishResidueNodes,
  findExactEnglishPlainFields,
  findPartialEnglishResidueNodes,
  restoreHtmlTextNodes,
} from '../scripts/locale-residue-utils.mjs'

test('finds English text nodes retained inside otherwise translated HTML', () => {
  const source = '<h2>Table of Contents</h2><p>Precision forging improves fatigue resistance.</p><p>ISO 9001</p>'
  const translated = '<h2>Πίνακας Περιεχομένων</h2><p>Precision forging improves fatigue resistance.</p><p>ISO 9001</p>'
  const residues = findExactEnglishResidueNodes(source, translated)

  assert.deepEqual(residues.map((node) => node.core), [
    'Precision forging improves fatigue resistance.',
  ])
})

test('finds untranslated title and excerpt fields while ignoring technical and language-neutral values', () => {
  assert.deepEqual(
    findExactEnglishPlainFields(
      { title: 'Precision Forging Guide', excerpt: 'How to select forging materials.', standard: 'ISO 9001', coating: 'AlTiN, TiAlN', alloy: 'Inconel 718, Rene 77', price: '$50-80 per kilogram' },
      { title: 'Precision Forging Guide', excerpt: 'Οδηγός επιλογής υλικών σφυρηλάτησης.', standard: 'ISO 9001', coating: 'AlTiN, TiAlN', alloy: 'Inconel 718, Rene 77', price: '$50-80 per kilogram' },
    ),
    ['title'],
  )
})

test('finds an English phrase retained inside a partly translated HTML node', () => {
  const source = '<td>Salt fog & Weak acid resistance, marine grade</td>'
  const translated = '<td>Salt fog & Zwak zuurbestendig, maritieme kwaliteit</td>'

  assert.deepEqual(
    findPartialEnglishResidueNodes(source, translated).map((node) => node.core),
    ['Salt fog & Zwak zuurbestendig, maritieme kwaliteit'],
  )
})

test('finds an English hyphenated term retained inside a translated HTML node', () => {
  const source = '<p>Closed-loop compensation keeps the process stable.</p>'
  const translated = '<p>Closed-loop compensatie houdt het proces stabiel.</p>'

  assert.deepEqual(
    findPartialEnglishResidueNodes(source, translated).map((node) => node.core),
    ['Closed-loop compensatie houdt het proces stabiel.'],
  )
})

test('finds English residue after translated HTML adds an inline wrapper', () => {
  const source = '<p>Material comparison follows.</p><p>Salt fog & weak acid resistance, marine grade</p>'
  const translated = '<p>Materiaalsvergelijking volgt.</p><p><span>Salt fog & Zwak zuurbestendig, maritieme kwaliteit</span></p>'

  const residues = findPartialEnglishResidueNodes(source, translated)

  assert.deepEqual(
    residues.map((node) => node.core),
    ['Salt fog & Zwak zuurbestendig, maritieme kwaliteit'],
  )
  assert.equal(
    residues[0].sourceCore,
    'Salt fog & weak acid resistance, marine grade',
    'residue repair must translate from the original English node, not from the mixed localized node',
  )
})

test('does not mistake a Spanish word with an accented suffix for English residue', () => {
  const source = '<p>Engineers pick a material based on the specification.</p>'
  const translated = '<p>Los ingenieros eligen un material basándose en la especificación.</p>'

  assert.deepEqual(findPartialEnglishResidueNodes(source, translated), [])
})

test('does not flag an embedded CAD file-format identifier as English residue', () => {
  const source = '<p>We support DWG, DXF, STEP, IGES, SolidWorks SLDPRT and other mainstream 2D/3D CAD formats.</p>'
  const translated = '<p>Admitimos DWG, DXF, STEP, IGES, SolidWorks SLDPRT y otros formatos CAD 2D/3D principales.</p>'

  assert.deepEqual(findPartialEnglishResidueNodes(source, translated), [])
})

test('does not flag the locale-neutral per-kilogram unit as English residue', () => {
  const source = '<p>Indicative price: $50-80 per kilogram</p>'
  const translated = '<p>Indicatieve prijs: $50-80 per kilogram</p>'

  assert.deepEqual(findPartialEnglishResidueNodes(source, translated), [])
})

test('does not flag a preserved title-case research source as English residue', () => {
  const source = '<p>According to Verified Market Research, the market is growing.</p>'
  const translated = '<p>Según Verified Market Research, el mercado está creciendo.</p>'

  assert.deepEqual(findPartialEnglishResidueNodes(source, translated), [])
})

test('restores translated residue nodes without changing HTML tags', () => {
  const html = '<section><h2>Table of Contents</h2><p>Keep spacing.</p></section>'
  const { tokens, nodes } = extractHtmlTextNodes(html)
  const restored = restoreHtmlTextNodes(tokens, nodes, {
    [nodes[0].key]: 'Πίνακας Περιεχομένων',
    [nodes[1].key]: 'Διατηρήστε τα διαστήματα.',
  })

  assert.equal(restored, '<section><h2>Πίνακας Περιεχομένων</h2><p>Διατηρήστε τα διαστήματα.</p></section>')
})
