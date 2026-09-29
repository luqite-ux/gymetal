/** @param {import('@supabase/supabase-js').SupabaseClient} db */
export async function saveContentDraft(db, tenantId, key, revision, snapshot) {
  const nextRevision = crypto.randomUUID()
  const draft = {draft_data:snapshot,draft_revision:nextRevision,updated_at:new Date().toISOString()}
  if (!revision) {
    const {error} = await db.from('content_entries').insert({
      ...draft,tenant_id:tenantId,kind:'page_section',content_key:key,name:'广跃固定布局内容',page_path:'/',
      draft_meta:{kind:'page_section',content_key:key,name:'广跃固定布局内容',page_path:'/',sort_order:0},
    })
    if(error) throw new Error(error.code==='23505' ? '内容已被更新，请重新打开编辑页' : '草稿保存失败，请稍后重试')
    return nextRevision
  }
  const {data,error} = await db.from('content_entries').update(draft)
    .eq('tenant_id',tenantId).eq('kind','page_section').eq('content_key',key).eq('draft_revision',revision).select('draft_revision')
  if(error) throw new Error('草稿保存失败，请稍后重试')
  if(!data?.length) throw new Error('内容已被更新，请重新打开编辑页，避免覆盖他人修改')
  return data[0].draft_revision
}
