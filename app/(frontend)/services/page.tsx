'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Cog, CircleDot, Target, Zap, Layers, Grid3X3, Sparkles, Box } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'

export default function ServicesPage() {
  const { t } = useLanguage()

  const services = [
    { 
      icon: CircleDot, 
      title: t.services.turning, 
      desc: t.services.turningDesc,
      image: '/images/2.jpg'
    },
    { 
      icon: Grid3X3, 
      title: t.services.milling, 
      desc: t.services.millingDesc,
      image: '/images/3.jpg'
    },
    { 
      icon: Target, 
      title: t.services.drilling, 
      desc: t.services.drillingDesc,
      image: '/images/8.jpg'
    },
    { 
      icon: Sparkles, 
      title: t.services.grinding, 
      desc: t.services.grindingDesc,
      image: '/images/9.jpg'
    },
    { 
      icon: Zap, 
      title: t.services.wirecut, 
      desc: t.services.wirecutDesc,
      image: '/images/5.jpg'
    },
    { 
      icon: Layers, 
      title: t.services.edm, 
      desc: t.services.edmDesc,
      image: '/images/11.jpg'
    },
    { 
      icon: Box, 
      title: t.services.laser, 
      desc: t.services.laserDesc,
      image: '/images/1.jpg'
    },
    { 
      icon: Cog, 
      title: t.services.sheetmetal, 
      desc: t.services.sheetmetalDesc,
      image: '/images/6.jpg'
    },
  ]

  const materials = [
    { name: t.materials.carbonSteel, color: 'bg-gray-600' },
    { name: t.materials.stainlessSteel, color: 'bg-gray-400' },
    { name: t.materials.aluminum, color: 'bg-blue-200' },
    { name: t.materials.copper, color: 'bg-orange-400' },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-primary py-24">
        <div className="absolute inset-0">
          <Image
            src="/images/5.jpg"
            alt="CNC Machining"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />
        </div>
        <div className="container relative mx-auto px-4 text-center lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
            {t.services.subtitle}
          </p>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
            {t.services.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/70">
            {t.hero.description}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {services.map((service, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-accent hover:shadow-xl"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
                <div className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              {t.materials.title}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {materials.map((material, index) => (
              <div
                key={index}
                className="flex flex-col items-center rounded-lg border border-border bg-card p-8 text-center transition-all hover:border-accent hover:shadow-lg"
              >
                <div className={`mb-4 h-20 w-20 rounded-full ${material.color}`} />
                <h3 className="text-lg font-semibold text-foreground">{material.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              {t.specs.title}
            </h2>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="mb-2 text-sm text-muted-foreground">{t.specs.sizeRange}</p>
                <p className="text-2xl font-bold text-foreground">{t.specs.sizeValue}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="mb-2 text-sm text-muted-foreground">{t.specs.precision}</p>
                <p className="text-2xl font-bold text-accent">{t.specs.precisionValue}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="mb-2 text-sm text-muted-foreground">{t.specs.facility}</p>
                <p className="text-2xl font-bold text-foreground">{t.specs.facilityValue}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="mb-2 text-sm text-muted-foreground">{t.specs.equipment}</p>
                <p className="text-2xl font-bold text-foreground">{t.specs.equipmentValue}</p>
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
