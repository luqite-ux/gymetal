'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Building2, Target, Shield, Clock } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  const { t } = useLanguage()

  const milestones = [
    { year: '2007', title: 'Founded', desc: 'Established in Wuxi, China' },
    { year: '2010', title: 'Expansion', desc: 'Moved to 4,500m² facility' },
    { year: '2015', title: 'ISO 9001', desc: 'Quality certification achieved' },
    { year: '2020', title: 'Global', desc: 'Export to 20+ countries' },
  ]

  const values = [
    { icon: Target, title: t.about.mission, desc: t.about.missionText },
    { icon: Shield, title: t.about.certification, desc: t.about.certificationText },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-primary py-24">
        <div className="absolute inset-0">
          <Image
            src="/images/1.jpg"
            alt="Our Facility"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />
        </div>
        <div className="container relative mx-auto px-4 text-center lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
            {t.about.subtitle}
          </p>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
            {t.about.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/70">
            {t.hero.description}
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-balance text-3xl font-bold text-foreground">
                {t.about.title}
              </h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                {t.about.description}
              </p>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                {t.about.description2}
              </p>
              <div className="space-y-4">
                {[
                  t.services.turning,
                  t.services.milling,
                  t.services.drilling,
                  t.services.grinding,
                  t.services.wirecut,
                  t.services.edm,
                  t.services.laser,
                  t.services.sheetmetal,
                ].map((process, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                    <span className="text-foreground">{process}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg lg:aspect-[4/5]">
              <Image
                src="/images/8.jpg"
                alt="Our Team"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Our Journey
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
                  {milestone.year}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{milestone.title}</h3>
                <p className="text-sm text-muted-foreground">{milestone.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {values.map((value, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-8">
                <value.icon className="mb-4 h-10 w-10 text-accent" />
                <h3 className="mb-4 text-xl font-semibold text-foreground">{value.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold text-primary-foreground md:text-4xl">
              {t.specs.title}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t.specs.sizeRange, value: t.specs.sizeValue, icon: Building2 },
              { label: t.specs.precision, value: t.specs.precisionValue, icon: Target },
              { label: t.specs.facility, value: t.specs.facilityValue, icon: Building2 },
              { label: t.specs.equipment, value: t.specs.equipmentValue, icon: Clock },
            ].map((spec, index) => (
              <div key={index} className="text-center">
                <spec.icon className="mx-auto mb-4 h-8 w-8 text-accent" />
                <p className="text-2xl font-bold text-primary-foreground">{spec.value}</p>
                <p className="mt-1 text-sm text-primary-foreground/70">{spec.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 text-center lg:px-8">
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground">
            {t.contact.subtitle}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
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
