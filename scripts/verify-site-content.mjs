import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { saveContentDraft } from '../lib/site-content-store.mjs'
for (const file of ['.env.production.local','.env.local']) if(fs.existsSync(file)) process.loadEnvFile(file)
const clean = v => v?.replace(/\\[rn]|[\r\n]/g,'').trim()
const url=clean(process.env.NEXT_PUBLIC_SUPABASE_URL), key=clean(process.env.SUPABASE_SERVICE_ROLE_KEY)
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
const {data:tenant,error:tenantError}=await db.from('tenants').select('id').eq('domain','gymetaltech.com').single()
assert.ifError(tenantError)
const tenantId=tenant.id
const contentKey='codex-gymetal-content-check-'+crypto.randomUUID()
let entryId
try {
  const rev1=await saveContentDraft(db,tenantId,contentKey,null,{title:'Original'})
  const {data:entry,error}=await db.from('content_entries').select('id,published_data,status').eq('tenant_id',tenantId).eq('content_key',contentKey).single()
  assert.ifError(error);entryId=entry.id;assert.deepEqual(entry.published_data,{});assert.equal(entry.status,'draft')
  const result=await db.rpc('publish_content_entry',{p_tenant_id:tenantId,p_entry_id:entryId,p_expected_revision:rev1,p_user_id:null})
  assert.ifError(result.error)
  const {data:published}=await db.from('content_entries').select('draft_revision,published_data').eq('tenant_id',tenantId).eq('id',entryId).single()
  assert.equal(published.published_data.title,'Original')
  const rev2=await saveContentDraft(db,tenantId,contentKey,published.draft_revision,{title:'Unpublished'})
  const {data:draft}=await db.from('content_entries').select('published_data,draft_data').eq('tenant_id',tenantId).eq('id',entryId).single()
  assert.equal(draft.published_data.title,'Original');assert.equal(draft.draft_data.title,'Unpublished')
  await assert.rejects(saveContentDraft(db,tenantId,contentKey,published.draft_revision,{title:'Stale'}))
  await assert.rejects(saveContentDraft(db,'00000000-0000-4000-8000-000000000000',contentKey,rev2,{title:'Wrong tenant'}))
  const stale=await db.rpc('publish_content_entry',{p_tenant_id:tenantId,p_entry_id:entryId,p_expected_revision:rev1,p_user_id:null})
  assert.ok(stale.error)
  const next=await db.rpc('publish_content_entry',{p_tenant_id:tenantId,p_entry_id:entryId,p_expected_revision:rev2,p_user_id:null})
  assert.ifError(next.error)
  const {data:versions}=await db.from('content_entry_versions').select('data').eq('tenant_id',tenantId).eq('content_entry_id',entryId).order('version_number')
  assert.deepEqual(versions.map(v=>v.data.data.title),['Original','Unpublished'])
  const anon=createClient(url,clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),{auth:{persistSession:false}})
  const hidden=await anon.from('content_entries').select('draft_data').eq('tenant_id',tenantId).eq('id',entryId)
  assert.ok(hidden.error || hidden.data?.length===0)
  console.log('PASS: draft isolation, atomic publish, revision conflict, tenant guard, versions, anonymous draft denial')
} finally {
  const {error}=await db.from('content_entries').delete().eq('tenant_id',tenantId).eq('content_key',contentKey)
  assert.ifError(error)
  const {count,error:readError}=await db.from('content_entries').select('id',{head:true,count:'exact'}).eq('tenant_id',tenantId).eq('content_key',contentKey)
  assert.ifError(readError);assert.equal(count,0)
  console.log('CLEANUP: temporary content entries = 0')
}
