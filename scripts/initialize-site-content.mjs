import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { saveContentDraft } from '../lib/site-content-store.mjs'
// Idempotent: never overwrite a customer's existing draft or publication.
for(const file of ['.env.production.local','.env.local'])if(fs.existsSync(file))process.loadEnvFile(file)
const clean=v=>v?.replace(/\\[rn]|[\r\n]/g,'').trim()
const db=createClient(clean(process.env.NEXT_PUBLIC_SUPABASE_URL),clean(process.env.SUPABASE_SERVICE_ROLE_KEY),{auth:{persistSession:false,autoRefreshToken:false}})
const {data:tenant,error:tenantError}=await db.from('tenants').select('id').eq('domain','gymetaltech.com').single()
if(tenantError || !tenant)throw new Error('Cannot resolve gymetaltech.com tenant')
const tenantId=tenant.id, key='gymetal-site-v1'
const configured=clean(process.env.NEXT_PUBLIC_TENANT_ID)
if(configured&&configured!==tenantId)throw new Error('Tenant configuration mismatch')
const {data:existing,error:existingError}=await db.from('content_entries').select('id').eq('tenant_id',tenantId).eq('kind','page_section').eq('content_key',key).maybeSingle()
if(existingError)throw new Error('Content schema is unavailable')
if(existing){console.log('Already initialized; all existing data preserved.');process.exit(0)}
const defaults=JSON.parse(fs.readFileSync(new URL('../lib/site-content-defaults.json',import.meta.url),'utf8'))
const draft=structuredClone(defaults)
const {data:legacy,error:legacyError}=await db.from('pages').select('content').eq('tenant_id',tenantId).eq('page_key','home').maybeSingle()
if(legacyError)throw new Error('Legacy content read failed; aborting without changes')
const map={hero_title:'t.hero.title',hero_subtitle:'t.hero.subtitle',hero_description:'t.hero.description',hero_cta:'t.hero.cta',about_title:'t.about.title',about_text:'t.about.description',services_title:'t.services.title',services_text:'t.services.subtitle',cta_title:'t.contact.subtitle',cta_text:'t.about.missionText'}
let imported=0
for(const [source,target] of Object.entries(map))for(const [suffix,locale] of [['','en'],['_zh','zh']]){
  const value=legacy?.content?.[source+suffix]
  if(draft.texts[target]&&typeof value==='string'&&value.trim()&&value!==draft.texts[target][locale]){draft.texts[target][locale]=value;imported++}
}
if(!process.argv.includes('--apply')){
  console.log(JSON.stringify({mode:'dry-run',tenantId,equipment:defaults.equipment.length,textSlots:Object.keys(defaults.texts).length,imageSlots:Object.keys(defaults.images).length,legacyDraftFields:imported,publicChanges:0}))
  process.exit(0)
}
// Published snapshot exactly preserves the previously visible site; old editor values stay in draft for review.
const revision=await saveContentDraft(db,tenantId,key,null,defaults)
const {data:entry,error:entryError}=await db.from('content_entries').select('id').eq('tenant_id',tenantId).eq('content_key',key).single()
if(entryError)throw new Error('Initialization readback failed')
const {error:publishError}=await db.rpc('publish_content_entry',{p_tenant_id:tenantId,p_entry_id:entry.id,p_expected_revision:revision,p_user_id:null})
if(publishError)throw new Error('Initial publication failed; inspect draft before retrying')
const {data:current}=await db.from('content_entries').select('draft_revision,published_data').eq('tenant_id',tenantId).eq('id',entry.id).single()
if(JSON.stringify(current.published_data)!==JSON.stringify(defaults)){
  // PostgreSQL JSONB key ordering differs; compare by canonical key sorting.
  const stable=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b))):x)
  if(stable(current.published_data)!==stable(defaults))throw new Error('Published readback mismatch')
}
if(imported)await saveContentDraft(db,tenantId,key,current.draft_revision,draft)
console.log(JSON.stringify({initialized:true,tenantId,equipment:defaults.equipment.length,legacyDraftFields:imported,publicChanges:0}))
