import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (filename) => readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8')

test('public news reads published content without requiring the service-role client', () => {
  const news = read('lib/frontend-news.ts')
  const server = read('lib/supabase/server.ts')

  assert.match(server, /export function createPublicClient\(\)/)
  assert.match(server, /NEXT_PUBLIC_SUPABASE_ANON_KEY/)
  assert.match(news, /import \{ createPublicClient \}/)
  assert.doesNotMatch(news, /createAdminClient/)
  assert.match(news, /function getPublicNewsClient/)
  assert.match(news, /return createPublicClient\(\)/)
  assert.match(news, /if \(!supabase\) return \[\]/)
})
