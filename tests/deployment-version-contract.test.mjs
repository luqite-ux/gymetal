import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const route = fs.readFileSync(new URL('../app/api/version/route.ts', import.meta.url), 'utf8')

test('deployment version endpoint reports the server-provided commit without exposing secrets', () => {
  assert.match(route, /process\.env\.DEPLOYMENT_COMMIT_SHA/)
  assert.match(route, /Cache-Control['"]:\s*['"]no-store, max-age=0/)
  assert.doesNotMatch(route, /SUPABASE_SERVICE_ROLE_KEY|R2_SECRET_ACCESS_KEY|CAPTCHA_SECRET/)
})
