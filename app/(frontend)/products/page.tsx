import Image from 'next/image'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocalizedLink } from '@/components/localized-link'
import { getProductImage, getPublishedProducts } from '@/lib/frontend-products'
import { getTranslations } from '@/lib/i18n'
import { getRequestLocale } from '@/lib/request-locale'

export const dynamic = 'force-dynamic'

function getLegacyFeatures(name: string, t: ReturnType<typeof getTranslations>): string[] | null {
  const normalizedName = name.trim().toLowerCase()
  const materials = [t.materials.carbonSteel, t.materials.stainlessSteel, t.materials.aluminum, t.materials.copper]
  const machining = [t.services.turning, t.services.milling, t.services.drilling, t.services.grinding]
  const assemblies = [t.services.wirecut, t.services.edm, t.services.laser, t.services.sheetmetal]

  if (normalizedName === '铸件' || normalizedName === 'castings' || normalizedName === '锻件' || normalizedName === 'forgings') return materials
  if (normalizedName === '机加工工件' || normalizedName === 'machined parts') return machining
  if (normalizedName === '精密组件' || normalizedName === 'assemblies') return assemblies
  return null
}

export default async function ProductsPage() {
  const locale = await getRequestLocale()
  const t = getTranslations(locale)
  const products = await getPublishedProducts(locale)
  const industries = [
    { name: t.industries.medical, icon: '🏥' },
    { name: t.industries.electronics, icon: '💻' },
    { name: t.industries.aerospace, icon: '✈️' },
    { name: t.industries.automotive, icon: '🚗' },
    { name: t.industries.semiconductor, icon: '🔬' },
    { name: t.industries.optical, icon: '🔭' },
    { name: t.industries.newEnergy, icon: '⚡' },
    { name: t.industries.automation, icon: '🤖' },
  ]

  return (
    <div className="flex flex-col">
      <section className="relative bg-primary py-24">
        <div className="absolute inset-0">
          <Image src="/images/9.jpg" alt="Precision Parts" fill className="object-cover opacity-30" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />
        </div>
        <div className="container relative mx-auto px-4 text-center lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">{t.products.subtitle}</p>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">{t.products.title}</h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/70">{t.hero.description}</p>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
              <p className="text-lg font-medium text-foreground">{locale === 'zh' ? '暂无已上架产品。' : 'No products are published yet.'}</p>
              <p className="mt-2 text-muted-foreground">{locale === 'zh' ? '后台上架产品后将在这里自动显示。' : 'Published products will appear here automatically.'}</p>
            </div>
          ) : (
            <div className="space-y-16">
              {products.map((product, index) => {
                const legacyFeatures = getLegacyFeatures(product.name, t)
                return (
                <article key={product.id} className={`grid items-center gap-12 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
                      <Image src={getProductImage(product)} alt={product.name} fill className="object-contain p-4" unoptimized />
                    </div>
                  </div>
                  <div>
                    {product.category ? <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">{product.category}</p> : null}
                    <h2 className="mb-4 text-3xl font-bold text-foreground">{product.name}</h2>
                    {product.description ? <p className="mb-6 text-lg text-muted-foreground">{product.description}</p> : null}
                    {legacyFeatures ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {legacyFeatures.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                            <span className="text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : product.category ? (
                      <div className="flex items-center gap-2 text-foreground">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                        <span>{product.category}</span>
                      </div>
                    ) : null}
                  </div>
                </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">{t.industries.subtitle}</p>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">{t.industries.title}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry) => (
              <div key={industry.name} className="rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-accent hover:shadow-lg">
                <span className="mb-4 block text-4xl">{industry.icon}</span>
                <h3 className="font-semibold text-foreground">{industry.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-balance text-3xl font-bold text-foreground md:text-4xl">{t.about.certification}</h2>
            <p className="mb-8 text-lg text-muted-foreground">{t.about.certificationText}</p>
            <div className="flex items-center justify-center gap-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-accent bg-accent/10"><span className="text-lg font-bold text-accent">ISO</span></div>
              <div><p className="text-2xl font-bold text-foreground">ISO 9001:2015</p><p className="text-muted-foreground">Quality Management System</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center lg:px-8">
          <h2 className="mb-4 text-balance text-3xl font-bold text-primary-foreground">{t.contact.subtitle}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/70">{t.about.missionText}</p>
          <LocalizedLink href="/contact"><Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">{t.hero.cta}<ArrowRight className="ml-2 h-4 w-4" /></Button></LocalizedLink>
        </div>
      </section>
    </div>
  )
}
