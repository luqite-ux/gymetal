'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SUPPORTED_LOCALES } from '@/lib/locales'
import { type SiteContent, type Equipment } from '@/lib/site-content-model'
import labelsData from '@/lib/site-content-labels.json'
import { saveSiteContent, publishSiteContent, restoreSiteContent, uploadContentImage } from './actions'

type Asset = {url:string;file_name:string}
type Version = {id:string;version_number:number;created_at:string}
const labels = labelsData as Record<string,{label:string;page:string}>
const parameterLabels:Record<string,string> = {homeYears:'首页：行业经验',homePrecision:'首页：加工精度',homeEmployees:'首页：员工人数',homeMachines:'首页：设备数量',equipmentAccuracy:'设备页：最高精度',equipmentSize:'设备页：最大加工尺寸'}
const pageNames:Record<string,string> = {'/':'首页','/about':'关于我们','/services':'服务与参数','/equipment':'设备页','/faq':'常见问题','/contact':'联系页'}

function Picture({value,onChange,assets,onAsset,onBusy}:{value:string|null;onChange:(v:string|null)=>void;assets:Asset[];onAsset:(asset:Asset)=>void;onBusy:(busy:boolean)=>void}) {
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  return <div className="space-y-2">
    {value && <img src={value} alt="当前图片预览" className="h-32 w-48 rounded border object-contain" />}
    <input aria-label="上传替换图片" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async e=>{
      const file=e.target.files?.[0]; e.target.value=''; if(!file) return
      setBusy(true); onBusy(true); setError('')
      try { const form=new FormData();form.set('file',file);const result=await uploadContentImage(form)
        if(!result.ok) {setError(result.error);return}
        onAsset({url:result.url,file_name:result.name});onChange(result.url)
      } catch {setError('上传失败，请重试')} finally {setBusy(false);onBusy(false)}
    }} />
    <select aria-label="选择已上传图片" className="max-w-full rounded border p-2 text-sm" value="" disabled={busy} onChange={e=>{if(e.target.value)onChange(e.target.value)}}>
      <option value="">选择最近上传的图片（可重复使用）</option>
      {assets.map(a=><option key={a.url} value={a.url}>{a.file_name}</option>)}
    </select>
    <Button type="button" size="sm" variant="outline" disabled={busy || !value} onClick={()=>onChange(null)}>移除引用</Button>
    <p className="text-xs text-slate-500">JPG / PNG / WebP，不超过 5MB。建议沿用原图比例；替换或移除不会删除原文件。</p>
    {busy && <p role="status">正在上传…请等待完成后保存。</p>}{error && <p role="alert" className="text-red-700">{error}</p>}
  </div>
}

export function ContentEditor({initial,initialRevision,publishedAt,hasSavedDraft,assets,versions}:{initial:SiteContent;initialRevision:string|null;publishedAt:string|null;hasSavedDraft:boolean;assets:Asset[];versions:Version[]}) {
  const router = useRouter()
  const [draft,setDraft] = useState(initial)
  const [revision,setRevision] = useState(initialRevision)
  const [dirty,setDirty] = useState(false)
  const [busy,setBusy] = useState(false)
  const [uploading,setUploading] = useState(false)
  const [message,setMessage] = useState('')
  const [tab,setTab] = useState('equipment')
  const [language,setLanguage] = useState('en')
  const [search,setSearch] = useState('')
  const [library,setLibrary] = useState(assets)
  const [selected,setSelected] = useState(initial.equipment[0]?.id ?? '')
  useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[dirty])
  const update=(next:SiteContent)=>{setDraft(next);setDirty(true);setMessage('')}
  const item = draft.equipment.find(i=>i.id===selected)
  const updateItem=(patch:Partial<Equipment>)=>{if(item)update({...draft,equipment:draft.equipment.map(i=>i.id===item.id?{...i,...patch}:i)})}
  const addAsset=(asset:Asset)=>setLibrary(old=>[asset,...old.filter(a=>a.url!==asset.url)])
  const save=async()=>{
    const result=await saveSiteContent(draft,revision)
    if(!result.ok)throw new Error(result.error)
    setRevision(result.revision);setDirty(false);return result.revision
  }
  const run=async(action:()=>Promise<void>)=>{setBusy(true);setMessage('');try{await action()}catch(e){setMessage(e instanceof Error ? e.message : '操作失败，请重试')}finally{setBusy(false)}}
  const localizedField=(field:'name'|'category'|'description')=>{
    if(!item)return ''
    if(language==='en')return field==='name'?item.nameEn:field==='category'?item.category:item.descEn
    if(language==='zh')return field==='name'?item.nameCn:field==='category'?item.categoryCn:item.descCn
    return item.translations[language as keyof Equipment['translations']]?.[field] ?? ''
  }
  const changeLocalized=(field:'name'|'category'|'description',value:string)=>{
    if(!item)return
    if(language==='en')updateItem({[field==='name'?'nameEn':field==='category'?'category':'descEn']:value})
    else if(language==='zh')updateItem({[field==='name'?'nameCn':field==='category'?'categoryCn':'descCn']:value})
    else updateItem({translations:{...item.translations,[language]:{name:'',category:'',description:'',...item.translations[language as keyof Equipment['translations']],[field]:value}}})
  }

  return <div className="mx-auto max-w-6xl space-y-6 p-6">
    <header><h1 className="text-2xl font-bold">设备与页面内容</h1><p className="mt-2 text-sm text-slate-600">只维护内容，不改变页面布局和样式。保存草稿不影响线上；发布会一次性更新本页全部草稿。产品继续在“产品管理”维护。</p>
      <p className="mt-2 text-sm">{publishedAt ? `最近发布：${new Date(publishedAt).toLocaleString('zh-CN')}` : '尚未发布新版本，前台使用原有资料。'} {dirty?'有未保存修改':''}</p>
      {hasSavedDraft && <p className="mt-3 rounded bg-amber-50 p-3 text-sm text-amber-900">有已保存、尚未发布的草稿（可能包含从旧后台保留的内容）。请检查各栏目后再发布；发布会应用全部修改。</p>}
    </header>
    <fieldset disabled={busy || uploading} className="space-y-6 disabled:opacity-70">
      <div className="flex flex-wrap gap-3">
        <Button onClick={()=>run(async()=>{await save();setMessage('草稿已保存，线上内容未改变。')})}>保存草稿</Button>
        <Button variant="outline" onClick={()=>{if(window.confirm('确定将当前全部草稿发布到网站？'))run(async()=>{const rev=await save();const result=await publishSiteContent(rev);if(!result.ok)throw new Error(result.error);setMessage('已发布，刷新网站即可查看。');router.refresh()})}}>发布全部草稿</Button>
        <select aria-label="编辑语言" className="rounded border p-2" value={language} onChange={e=>setLanguage(e.target.value)}>{SUPPORTED_LOCALES.map(l=><option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>)}</select>
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="内容分类">{[['equipment','设备'],['texts','固定图文'],['parameters','参数'],['images','页面图片'],['versions','历史版本']].map(([key,label])=><Button key={key} variant={tab===key?'default':'outline'} onClick={()=>setTab(key)}>{label}</Button>)}</nav>
      {tab==='equipment' && <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-2"><Button variant="outline" onClick={()=>{const id=crypto.randomUUID();update({...draft,equipment:[...draft.equipment,{id,group:'machining',model:'新设备',nameEn:'New equipment',nameCn:'新设备',category:'',categoryCn:'',descEn:'',descCn:'',accuracy:'',image:null,active:false,sortOrder:draft.equipment.length,translations:{}}]});setSelected(id)}}>新增设备（默认下架）</Button>
          {[...draft.equipment].sort((a,b)=>a.sortOrder-b.sortOrder).map(i=><button key={i.id} onClick={()=>setSelected(i.id)} className={`block w-full rounded border p-3 text-start text-sm ${selected===i.id?'border-blue-600 bg-blue-50':''}`}>{i.model} {!i.active&&'（下架）'}</button>)}
        </div>
        {item ? <div className="space-y-4 rounded border p-5">
          <label className="block">型号<Input value={item.model} onChange={e=>updateItem({model:e.target.value})}/></label>
          <label className="block">设备分组<select className="ml-3 rounded border p-2" value={item.group} onChange={e=>updateItem({group:e.target.value as Equipment['group']})}><option value="machining">加工设备</option><option value="testing">检测设备</option></select></label>
          {(['name','category','description'] as const).map((field,index)=><label key={field} className="block">{['名称','类别名称','说明'][index]}（{language}）<Textarea value={localizedField(field)} onChange={e=>changeLocalized(field,e.target.value)}/></label>)}
          <p className="text-xs text-slate-500">现有译文已保留。修改原文后，请同步检查其它语言；新语言未填写时显示英文。</p>
          {(['accuracy','range','maxDiameter','travel'] as const).map((field,index)=><label key={field} className="block">{['精度','加工范围','最大直径','行程'][index]}<Input value={item[field]??''} onChange={e=>updateItem({[field]:e.target.value})}/></label>)}
          <label className="block">排序（数字小的靠前）<Input type="number" min={0} max={100000} value={item.sortOrder} onChange={e=>updateItem({sortOrder:Number(e.target.value)})}/></label>
          <label className="flex gap-2"><input type="checkbox" checked={item.active} onChange={e=>updateItem({active:e.target.checked})}/>发布后在前台显示</label>
          <Picture value={item.image} onChange={image=>updateItem({image})} assets={library} onAsset={addAsset} onBusy={setUploading}/>
          <Button variant="destructive" onClick={()=>{if(window.confirm(`从草稿中移除 ${item.model}？发布后前台才会移除。图片保留，历史版本可恢复。`)){update({...draft,equipment:draft.equipment.filter(i=>i.id!==item.id)});setSelected('')}}}>从草稿移除设备</Button>
        </div>:<p>选择设备进行编辑，也可以新增设备。</p>}
      </div>}
      {tab==='texts' && <div className="space-y-4"><Input placeholder="搜索中文说明、原文或页面" aria-label="搜索图文" value={search} onChange={e=>setSearch(e.target.value)}/>{Object.entries(draft.texts).filter(([key,values])=>(key+JSON.stringify(values)+JSON.stringify(labels[key])).toLowerCase().includes(search.toLowerCase())).map(([key,values])=><label key={key} className="block rounded border p-4"><span className="text-xs text-slate-500">{labels[key]?.page}</span><p className="my-2 font-medium">{labels[key]?.label ?? key}</p><Textarea value={values[language as keyof typeof values]??''} onChange={e=>update({...draft,texts:{...draft.texts,[key]:{...values,[language]:e.target.value}}})}/></label>)}</div>}
      {tab==='parameters' && <div className="space-y-4">{Object.entries(draft.parameters).map(([key,value])=><label key={key} className="block">{parameterLabels[key]??key}<Input value={value} onChange={e=>update({...draft,parameters:{...draft.parameters,[key]:e.target.value}})}/></label>)}<p className="text-sm text-slate-600">服务页的尺寸范围、厂房面积等参数请在“固定图文”中搜索相应名称；设备列表数量自动计算。</p></div>}
      {tab==='images' && <div className="grid gap-4 md:grid-cols-2">{Object.entries(draft.images).map(([key,value])=><div key={key} className="space-y-3 rounded border p-4"><h2 className="font-semibold">{pageNames[key.split(':')[0]]??key.split(':')[0]}</h2><p className="break-all text-xs text-slate-500">原图片：{key.split(':').slice(1).join(':')}</p><Picture value={value} onChange={url=>update({...draft,images:{...draft.images,[key]:url??''}})} assets={library} onAsset={addAsset} onBusy={setUploading}/></div>)}</div>}
      {tab==='versions' && <div className="space-y-3"><p>恢复只覆盖草稿，不立即影响网站；确认后再发布。最近 20 个版本：</p>{versions.length===0&&<p>尚无发布记录。</p>}{versions.map(v=><div key={v.id} className="flex flex-wrap items-center gap-4 rounded border p-4"><span>版本 {v.version_number} · {new Date(v.created_at).toLocaleString('zh-CN')}</span><Button variant="outline" onClick={()=>{if(revision&&window.confirm('恢复此版本到草稿？当前未保存修改将丢弃。'))run(async()=>{const result=await restoreSiteContent(v.id,revision);if(!result.ok)throw new Error(result.error);setDirty(false);router.refresh()})}}>恢复到草稿</Button></div>)}</div>}
    </fieldset>
    <p role="status" className="sticky bottom-2 rounded bg-white p-3 text-sm shadow">{busy?'正在处理，请勿关闭页面…':message || '修改后请先保存草稿。'}</p>
  </div>
}
