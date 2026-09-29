import { z } from 'zod'

const text = z.string().max(12000)
const languages = z.record(z.enum(['en','zh','es','pt','fr','ar','el','ru','de','nl','it']), text)
const imageUrl = z.string().max(2048).refine(value => value === '' || /^\/images\/[a-zA-Z0-9/_.-]+$/.test(value) || /^https:\/\/[^\s]+$/.test(value), '图片地址必须为本站图片或 HTTPS 地址')
const equipmentSchema = z.object({
  id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  group: z.enum(['machining','testing']), model: z.string().trim().min(1).max(200),
  nameEn: z.string().trim().min(1).max(300), nameCn: text, category: text, categoryCn: text,
  descEn: text, descCn: text, accuracy: z.string().max(300),
  range: z.string().max(300).optional(), maxDiameter: z.string().max(300).optional(), travel: z.string().max(300).optional(),
  image: imageUrl.nullable(), active: z.boolean(), sortOrder: z.number().int().min(0).max(100000),
  translations: z.record(z.enum(['en','zh','es','pt','fr','ar','el','ru','de','nl','it']), z.object({ name: text, category: text, description: text }).strict()),
}).strict()
const snapshotSchema = z.object({
  version: z.literal(1), texts: z.record(languages), images: z.record(imageUrl),
  equipment: z.array(equipmentSchema).max(500), parameters: z.record(z.string().max(200)),
}).strict().superRefine((value, ctx) => {
  const ids = new Set<string>()
  for (const item of value.equipment) {
    if (ids.has(item.id)) ctx.addIssue({ code: 'custom', message: '设备编号重复' })
    ids.add(item.id)
  }
  for (const dictionary of [value.texts, value.images, value.parameters]) {
    if (Object.keys(dictionary).some(key => ['__proto__','prototype','constructor'].includes(key))) ctx.addIssue({ code:'custom', message:'非法字段' })
  }
})
export type SiteContent = z.infer<typeof snapshotSchema>
export type Equipment = SiteContent['equipment'][number]
export const CONTENT_KEY = 'gymetal-site-v1'
export function validateSnapshot(input: unknown): SiteContent { return snapshotSchema.parse(input) }
export function visibleEquipment<T extends { active: boolean; group: string; sortOrder: number }>(items: T[], group: string): T[] {
  return items.filter(item => item.active && item.group === group).sort((a,b) => a.sortOrder - b.sortOrder)
}
export function contentText(values: Record<string,string> | undefined, locale: string, fallback: string): string {
  if (!values) return fallback
  return values[locale] ?? values.en ?? Object.values(values)[0] ?? fallback
}
export function validateContentForSite(input: unknown, defaults: SiteContent, publicUrl: string, tenantId: string): SiteContent {
  const data = validateSnapshot(input)
  for (const field of ['texts','images','parameters'] as const) {
    const expected = Object.keys(defaults[field]).sort()
    if (JSON.stringify(Object.keys(data[field]).sort()) !== JSON.stringify(expected)) throw new Error('内容点位不匹配，请刷新页面后重试')
  }
  const localImages = new Set([...Object.values(defaults.images), ...defaults.equipment.map(item => item.image)])
  const prefix = publicUrl.replace(/\/$/,'') + '/site-content/' + tenantId + '/'
  for (const url of [...Object.values(data.images), ...data.equipment.map(item => item.image)]) {
    if (!url || localImages.has(url)) continue
    if (!publicUrl || !url.startsWith(prefix) || url.includes('..') || url.includes('\\') || /[%?#]/.test(url.slice(prefix.length))) throw new Error('只能使用本站上传的图片')
  }
  return data
}
export function overlayTranslations<T extends object>(base:T, texts:Record<string,Record<string,string>>, locale:string):T {
  const result = structuredClone(base)
  for (const [key,values] of Object.entries(texts)) {
    if(!key.startsWith('t.'))continue
    const path=key.slice(2).split('.')
    if(path.some(part=>['__proto__','constructor','prototype'].includes(part)))continue
    let target:Record<string,any>|undefined=result
    for(const part of path.slice(0,-1))target=target?.[part]
    const leaf=path[path.length-1]
    if(target && typeof target[leaf]==='string')target[leaf]=contentText(values,locale,target[leaf])
  }
  return result
}
