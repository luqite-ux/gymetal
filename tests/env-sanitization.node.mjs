import assert from 'node:assert/strict'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import test from 'node:test'

const root = fileURLToPath(new URL('..', import.meta.url))
const envStrip = await import(pathToFileURL(path.join(root, 'lib/env-strip.ts')).href)
const captcha = await import(pathToFileURL(path.join(root, 'lib/inquiry-captcha.ts')).href)

test('stripHeaderUnsafeEnv removes copied literal CRLF escapes', () => {
  assert.equal(
    envStrip.stripHeaderUnsafeEnv(' "https://example.supabase.co\\r\\n" '),
    'https://example.supabase.co',
  )
  assert.equal(
    envStrip.stripHeaderUnsafeEnv('service-role-key\\n'),
    'service-role-key',
  )
})

test('CAPTCHA Supabase context sanitizes every environment boundary value', async () => {
  const requests = []
  const fetchImpl = async (url, init) => {
    requests.push({ url, init })
    return Response.json(true)
  }
  const context = captcha.createSupabaseCaptchaContextFromEnv({
    NEXT_PUBLIC_TENANT_ID: '11111111-1111-4111-8111-111111111111\\r\\n',
    CAPTCHA_SITE_SCOPE: 'gymetaltech-contact\\r\\n',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co\\r\\n',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key\\r\\n',
  }, fetchImpl)

  assert.equal(context.tenantId, '11111111-1111-4111-8111-111111111111')
  assert.equal(context.siteScope, 'gymetaltech-contact')
  await context.store.issue({
    tenantId: context.tenantId,
    siteScopeHash: 'site-hash',
    formScopeHash: 'form-hash',
    challengeHash: 'challenge-hash',
    tokenHash: 'token-hash',
    expiresAt: Date.now() + 60_000,
  })

  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, 'https://example.supabase.co/rest/v1/rpc/issue_inquiry_captcha_challenge')
  assert.equal(requests[0].init.headers.apikey, 'service-role-key')
  assert.equal(requests[0].init.headers.authorization, 'Bearer service-role-key')
})
