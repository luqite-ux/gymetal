'use client'
import { useLanguage } from '@/lib/language-context'
import { useSiteContent } from '@/lib/site-content-context'
import { contentText } from '@/lib/site-content-model'
import { pageText } from '@/lib/page-content'

export function usePageText() {
  const {locale} = useLanguage()
  const content = useSiteContent()
  return (english:string,chinese?:string,key?:string) => contentText(content?.texts['l:'+(key ?? english)],locale,pageText(locale,english,chinese))
}
