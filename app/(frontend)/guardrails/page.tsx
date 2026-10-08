import type { Metadata } from 'next'
import Image from 'next/image'
import { ArrowRight, Check } from 'lucide-react'
import catalog from '@/lib/guardrails.json'
import { getRequestLocale } from '@/lib/request-locale'
import { pageText } from '@/lib/page-content'
import { LocalizedLink } from '@/components/localized-link'
import { MotionDiv } from '@/components/motion'

export const metadata: Metadata = {
  title: 'Guardrails & Architectural Metalwork | GY Metal Tech',
  description: 'Guardrail, railing, gate and architectural metalwork product catalog from Wuxi Guangyue Metal Technology Co., Ltd.',
  alternates: { canonical: 'https://www.gymetaltech.com/guardrails' },
}

export default async function GuardrailsPage() {
  const locale = await getRequestLocale()
  return (
    <main>
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground lg:py-28">
        <Image src="/images/guardrails/38.png" alt="Municipal bridge railing project" fill priority className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/35" />
        <div className="container relative mx-auto px-4 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-accent">GY Metal Tech</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">{pageText(locale, 'Guardrails & Architectural Metalwork', '防护栏与建筑金属制品')}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/80">{pageText(locale, 'Explore the complete product range supplied in our guardrail catalog.', '浏览客户画册所列的完整防护栏及建筑金属制品系列。')}</p>
        </div>
      </section>

      <nav aria-label="Guardrail categories" className="border-b bg-background py-6">
        <div className="container mx-auto flex flex-wrap gap-2 px-4 lg:px-8">
          {catalog.map((category) => <a key={category.slug} href={`#${category.slug}`} className="rounded-full border px-4 py-2 text-sm text-muted-foreground transition hover:border-accent hover:text-foreground">{category.title}</a>)}
        </div>
      </nav>

      <div className="container mx-auto space-y-20 px-4 py-16 lg:px-8 lg:py-24">
        {catalog.map((category, categoryIndex) => (
          <section key={category.slug} id={category.slug} className="scroll-mt-24">
          <MotionDiv delay={Math.min(categoryIndex * 0.03, 0.18)}>
            <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">{String(categoryIndex + 1).padStart(2, '0')}</p>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{category.title}</h2>
              </div>
              {'description' in category && category.description ? <p className="leading-7 text-muted-foreground">{category.description}</p> : null}
            </div>
            {'features' in category && category.features ? <ul className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{category.features.map((feature) => <li key={feature} className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{feature}</li>)}</ul> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.images.map((src, imageIndex) => (
                <figure key={src} className="group relative aspect-[4/3] overflow-hidden rounded-xl border bg-[#f3f5f7] shadow-sm">
                  <Image src={src} alt={category.captions[imageIndex] || `${category.title} ${imageIndex + 1}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain transition-transform duration-500 group-hover:scale-[1.03]" />
                  {category.captions[imageIndex] ? <figcaption className="absolute bottom-0 left-0 max-w-[90%] bg-[#244d9b] px-4 py-2 text-sm font-medium text-white shadow-md">{category.captions[imageIndex]}</figcaption> : null}
                </figure>
              ))}
            </div>
          </MotionDiv>
          </section>
        ))}
      </div>

      <section className="bg-muted/40 py-16">
        <div className="container mx-auto flex flex-col items-start justify-between gap-6 px-4 lg:flex-row lg:items-center lg:px-8">
          <div><h2 className="text-3xl font-bold">{pageText(locale, 'Discuss Your Guardrail Project', '沟通您的防护栏项目')}</h2><p className="mt-2 text-muted-foreground">{pageText(locale, 'Send drawings or project requirements for technical review.', '欢迎提供图纸或项目要求，以便进行技术沟通。')}</p></div>
          <LocalizedLink href="/contact" className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground">{pageText(locale, 'Contact Us', '联系我们')}<ArrowRight className="h-4 w-4" /></LocalizedLink>
        </div>
      </section>
    </main>
  )
}
