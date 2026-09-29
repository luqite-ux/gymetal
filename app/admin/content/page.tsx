import { requireAdminSession } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { CONTENT_KEY, validateSnapshot } from '@/lib/site-content-model'
import { getContentTenantId, defaultSiteContent } from '@/lib/site-content-server'
import { ContentEditor } from './content-editor'

export default async function ContentPage() {
  const session = await requireAdminSession()
  if(session.tenant_id !== await getContentTenantId()) throw new Error('无权访问此站点')
  const db = createAdminClient()
  const {data,error} = await db.from('content_entries').select('id,draft_data,draft_revision,published_data,published_at').eq('tenant_id',session.tenant_id).eq('kind','page_section').eq('content_key',CONTENT_KEY).maybeSingle()
  if(error) throw new Error('内容读取失败，请重试')
  const {data:assets,error:assetError} = await db.from('media_assets').select('url,file_name').eq('tenant_id',session.tenant_id).eq('purpose','gymetal-site-content').eq('is_archived',false).order('created_at',{ascending:false}).limit(100)
  if(assetError) throw new Error('图片资源读取失败，请重试')
  const {data:versions,error:versionError} = data ? await db.from('content_entry_versions').select('id,version_number,created_at').eq('tenant_id',session.tenant_id).eq('content_entry_id',data.id).order('version_number',{ascending:false}).limit(20) : {data:[],error:null}
  if(versionError) throw new Error('版本记录读取失败，请重试')
  return <ContentEditor key={data?.draft_revision ?? 'initial'} initial={data ? validateSnapshot(data.draft_data) : defaultSiteContent} initialRevision={data?.draft_revision ?? null} publishedAt={data?.published_at ?? null} hasSavedDraft={!!data && JSON.stringify(data.draft_data)!==JSON.stringify(data.published_data)} assets={assets ?? []} versions={versions ?? []} />
}
