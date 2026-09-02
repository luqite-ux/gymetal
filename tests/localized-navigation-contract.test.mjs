import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const translations = JSON.parse(await readFile(new URL('../lib/generated-translations.json', import.meta.url), 'utf8'))

test('Dutch and Italian navigation do not retain the English Home label', () => {
  assert.notEqual(translations.nl.nav.home, 'Home')
  assert.notEqual(translations.it.nav.home, 'Home')
})
