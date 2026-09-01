'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { useLanguage } from '@/lib/language-context'
import { localizePath } from '@/lib/locales'

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
}

export function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const { locale } = useLanguage()

  return <Link href={localizePath(href, locale)} {...props} />
}
