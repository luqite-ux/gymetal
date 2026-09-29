import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SiteContentProvider } from '@/lib/site-content-context'
import { getPublishedSiteContent } from '@/lib/site-content-server'

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SiteContentProvider value={await getPublishedSiteContent()}>
      <Header />
      <main>{children}</main>
      <Footer />
    </SiteContentProvider>
  )
}
