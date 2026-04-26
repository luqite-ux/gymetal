'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'

export default function ProductsPage() {
  const { t } = useLanguage()

  const products = [
    {
      title: t.products.castings,
      desc: t.products.castingsDesc,
      image: '/images/3.jpg',
      features: [t.materials.carbonSteel, t.materials.stainlessSteel, t.materials.aluminum, t.materials.copper],
    },
    {
      title: t.products.forgings,
      desc: t.products.forgingsDesc,
      image: '/images/2.jpg',
      features: [t.materials.carbonSteel, t.materials.stainlessSteel, t.materials.aluminum, t.materials.copper],
    },
    {
      title: t.products.machined,
      desc: t.products.machinedDesc,
      image: '/images/8.jpg',
      features: [t.services.turning, t.services.milling, t.services.drilling, t.services.grinding],
    },
    {
      title: t.products.assemblies,
      desc: t.products.assembliesDesc,
      image: '/images/7.jpg',
      features: [t.services.wirecut, t.services.edm, t.services.laser, t.services.sheetmetal],
    },
  ]

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
      {/* Hero Section */}
      <section className="relative bg-primary py-24">
        <div className="absolute inset-0">
          <Image
            src="/images/9.jpg"
            alt="Precision Parts"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />
        </div>
        <div className="container relative mx-auto px-4 text-center lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
            {t.products.subtitle}
          </p>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
            {t.products.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/70">
            {t.hero.description}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-16">
            {products.map((product, index) => (
              <div
                key={index}
                className={`grid items-center gap-12 lg:grid-cols-2 ${
                  index % 2 === 1 ? 'lg:grid-flow-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="mb-4 text-3xl font-bold text-foreground">{product.title}</h2>
                  <p className="mb-6 text-lg text-muted-foreground">{product.desc}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {product.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
              {t.industries.subtitle}
            </p>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              {t.industries.title}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-accent hover:shadow-lg"
              >
                <span className="mb-4 block text-4xl">{industry.icon}</span>
                <h3 className="font-semibold text-foreground">{industry.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-balance text-3xl font-bold text-foreground md:text-4xl">
              {t.about.certification}
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              {t.about.certificationText}
            </p>
            <div className="flex items-center justify-center gap-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-accent bg-accent/10">
                <span className="text-lg font-bold text-accent">ISO</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">ISO 9001:2015</p>
                <p className="text-muted-foreground">Quality Management System</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center lg:px-8">
          <h2 className="mb-4 text-balance text-3xl font-bold text-primary-foreground">
            {t.contact.subtitle}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/70">
            {t.about.missionText}
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {t.hero.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
