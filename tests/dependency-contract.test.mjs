import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readJson = (filename) => JSON.parse(readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8'))

test('react-day-picker 9 uses the React 19 compatible date-fns 4 dependency chain', () => {
  const manifest = readJson('package.json')
  const lock = readJson('package-lock.json')

  assert.equal(manifest.dependencies['react-day-picker'], '9.14.0')
  assert.equal(manifest.dependencies['date-fns'], '4.1.0')
  assert.equal(lock.packages['node_modules/react-day-picker'].version, '9.14.0')
  assert.equal(lock.packages['node_modules/date-fns'].version, '4.1.0')
})
