import assert from 'node:assert/strict'
import test from 'node:test'

import {
  extractHtmlTextNodes,
  findExactEnglishResidueNodes,
  findExactEnglishPlainFields,
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

test('restores translated residue nodes without changing HTML tags', () => {
  const html = '<section><h2>Table of Contents</h2><p>Keep spacing.</p></section>'
  const { tokens, nodes } = extractHtmlTextNodes(html)
  const restored = restoreHtmlTextNodes(tokens, nodes, {
    [nodes[0].key]: 'Πίνακας Περιεχομένων',
    [nodes[1].key]: 'Διατηρήστε τα διαστήματα.',
  })

  assert.equal(restored, '<section><h2>Πίνακας Περιεχομένων</h2><p>Διατηρήστε τα διαστήματα.</p></section>')
})
