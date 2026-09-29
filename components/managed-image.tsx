'use client'
import Image, { type ImageProps } from 'next/image'
import { usePathname } from 'next/navigation'
import { stripLocalePrefix } from '@/lib/locales'
import { useSiteContent } from '@/lib/site-content-context'

export default function ManagedImage(props:ImageProps) {
  const content = useSiteContent()
  const pathname = stripLocalePrefix(usePathname() || '/').pathname.replace(/\/$/,'') || '/'
  const replacement = typeof props.src === 'string' ? content?.images[pathname + ':' + props.src] : undefined
  if(replacement === '') return null
  return <Image {...props} src={replacement ?? props.src} />
}
