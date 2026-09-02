import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const stylesheet = await readFile(new URL('../app/globals.css', import.meta.url), 'utf8')

test('news article tables are constrained to their content column', () => {
  const tableRule = stylesheet.match(/\.news-content table\s*\{([\s\S]*?)\n\}/)

  assert.ok(tableRule, 'news article table rule must exist')
  assert.match(tableRule[1], /max-width:\s*100%\s*!important/, 'inline table widths must not escape the article column')
  assert.match(tableRule[1], /table-layout:\s*fixed/, 'wide localized columns must share the available article width')
})

test('news article cells can wrap long localized content', () => {
  const cellRule = stylesheet.match(/\.news-content th,\s*\.news-content td\s*\{([\s\S]*?)\n\}/)

  assert.ok(cellRule, 'news article cell rule must exist')
  assert.match(cellRule[1], /overflow-wrap:\s*anywhere/, 'long localized text must wrap inside table cells')
})
