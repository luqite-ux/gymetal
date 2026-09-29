import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
const file = new URL('../lib/site-content-store.mjs', import.meta.url)
const store = existsSync(file) ? await import(file.href) : {}

test('saving an existing draft scopes tenant and revision and never writes published data', async () => {
  assert.equal(typeof store.saveContentDraft,'function')
  let request
  const db = createClient('https://example.supabase.co','test',{global:{fetch:async (url,init) => {
    request = {url:new URL(url),body:JSON.parse(init.body),method:init.method}
    return new Response(JSON.stringify([{draft_revision:'new-revision'}]),{status:200,headers:{'content-type':'application/json'}})
  }}})
  const result = await store.saveContentDraft(db,'tenant-a','gymetal-site-v1','old-revision',{version:1})
  assert.equal(result,'new-revision')
  assert.equal(request.url.searchParams.get('tenant_id'),'eq.tenant-a')
  assert.equal(request.url.searchParams.get('draft_revision'),'eq.old-revision')
  assert.equal(request.url.searchParams.get('content_key'),'eq.gymetal-site-v1')
  assert.equal(request.body.published_data,undefined)
  assert.equal(request.body.status,undefined)
})

test('a stale editor receives a conflict rather than silently overwriting a later draft', async () => {
  assert.equal(typeof store.saveContentDraft,'function')
  const db = createClient('https://example.supabase.co','test',{global:{fetch:async () => new Response('[]',{status:200,headers:{'content-type':'application/json'}})}})
  await assert.rejects(store.saveContentDraft(db,'tenant-a','gymetal-site-v1','stale',{}),/已被更新/)
})
