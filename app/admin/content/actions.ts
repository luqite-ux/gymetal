'use server'

import { requireAdminSession } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { CONTENT_KEY, validateContentForSite } from '@/lib/site-content-model'
import { getContentTenantId, defaultSiteContent } from '@/lib/site-content-server'
import { saveContentDraft } from '@/lib/site-content-store.mjs'
import { uploadToR2 } from '@/lib/r2'
import { stripHeaderUnsafeEnv } from '@/lib/env-strip'
import { revalidatePath } from 'next/cache'

async function authorize() {
  const session = await requireAdminSession()
  if (session.tenant_id !== await getContentTenantId()) throw new Error('无权修改此站点内容')
  return {tenantId:session.tenant_id,db:createAdminClient()}
}

export async function saveSiteContent(input:unknown, revision:string|null) {
  const {tenantId,db} = await authorize()
  try {
    const data = validateContentForSite(input,defaultSiteContent,stripHeaderUnsafeEnv(process.env.R2_PUBLIC_URL) || stripHeaderUnsafeEnv(process.env.R2_PUBLIC_URL_PREFIX) || '',tenantId)
    if(JSON.stringify(data).length > 1500000) throw new Error('内容超过保存大小限制')
    const nextRevision = await saveContentDraft(db,tenantId,CONTENT_KEY,revision,data)
    return {ok:true as const,revision:nextRevision as string}
  } catch(error) {
    return {ok:false as const,error:error instanceof Error ? error.message : '保存失败'}
  }
}

export async function publishSiteContent(revision:string) {
  const {tenantId,db} = await authorize()
  const {data,error} = await db.from('content_entries').select('id,draft_data').eq('tenant_id',tenantId).eq('content_key',CONTENT_KEY).eq('kind','page_section').eq('draft_revision',revision).maybeSingle()
  if(error || !data) return {ok:false as const,error:'草稿已发生变化，请刷新后再发布'}
  try {
    validateContentForSite(data.draft_data,defaultSiteContent,stripHeaderUnsafeEnv(process.env.R2_PUBLIC_URL) || stripHeaderUnsafeEnv(process.env.R2_PUBLIC_URL_PREFIX) || '',tenantId)
  } catch { return {ok:false as const,error:'草稿内容无效，不能发布'} }
  const {error:publishError} = await db.rpc('publish_content_entry',{p_tenant_id:tenantId,p_entry_id:data.id,p_expected_revision:revision,p_user_id:null})
  if(publishError) return {ok:false as const,error:'发布失败或草稿已被更新，请重新打开后重试'}
  revalidatePath('/','layout')
  return {ok:true as const}
}

export async function restoreSiteContent(versionId:string, revision:string) {
  const {tenantId,db} = await authorize()
  const {data:entry} = await db.from('content_entries').select('id').eq('tenant_id',tenantId).eq('kind','page_section').eq('content_key',CONTENT_KEY).single()
  if(!entry) return {ok:false as const,error:'内容不存在'}
  const {data,error} = await db.from('content_entry_versions').select('data').eq('tenant_id',tenantId).eq('content_entry_id',entry.id).eq('id',versionId).single()
  if(error || !data) return {ok:false as const,error:'版本不存在'}
  return saveSiteContent(data.data.data,revision)
}

export async function uploadContentImage(form:FormData) {
  const {tenantId,db} = await authorize()
  const file = form.get('file')
  if(!(file instanceof File) || file.size===0 || file.size>5*1024*1024) return {ok:false as const,error:'请选择不超过 5MB 的 JPG、PNG 或 WebP 图片'}
  const bytes = new Uint8Array(await file.arrayBuffer())
  const png = bytes.length>=8 && [137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b)
  const jpg = bytes[0]===255 && bytes[1]===216 && bytes[2]===255
  const webp = Buffer.from(bytes.slice(0,4)).toString()==='RIFF' && Buffer.from(bytes.slice(8,12)).toString()==='WEBP'
  const type = png ? 'image/png' : jpg ? 'image/jpeg' : webp ? 'image/webp' : null
  if(!type) return {ok:false as const,error:'图片格式不支持，请上传真实 JPG、PNG 或 WebP 图片'}
  try {
    const safeFile = new File([bytes],crypto.randomUUID() + (png?'.png':jpg?'.jpg':'.webp'),{type})
    const result = await uploadToR2(safeFile,`site-content/${tenantId}`)
    const {error} = await db.from('media_assets').insert({tenant_id:tenantId,url:result.url,object_key:result.key,file_name:file.name.slice(0,200),mime_type:type,size_bytes:file.size,purpose:'gymetal-site-content'})
    if(error) return {ok:false as const,error:'图片已上传，但资源登记失败，请重试；原图不受影响'}
    return {ok:true as const,url:result.url,name:file.name}
  } catch {return {ok:false as const,error:'图片上传失败，请检查图床配置后重试'}}
}
