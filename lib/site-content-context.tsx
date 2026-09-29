'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { SiteContent } from '@/lib/site-content-model'

const SiteContentContext = createContext<SiteContent | null>(null)
export function SiteContentProvider({value,children}:{value:SiteContent;children:ReactNode}) {
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}
export function useSiteContent() { return useContext(SiteContentContext) }
