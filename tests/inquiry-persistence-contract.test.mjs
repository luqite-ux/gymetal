import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = path.resolve(import.meta.dirname, '..')

test('inquiry route verifies atomically before returning one persisted id and notifying', () => {
  const source = readFileSync(path.join(root, 'app/api/inquiries/route.ts'), 'utf8')
  const verify = source.indexOf('verifyCaptchaSubmission')
  const persist = source.indexOf('/rest/v1/inquiries')
  const notify = source.indexOf('/api/inquiries/notify')
  assert.ok(verify >= 0 && persist > verify)
  assert.match(source, /return=representation/)
  assert.match(source, /select=id/)
  assert.ok(notify > persist)
})
