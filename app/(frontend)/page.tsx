'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Factory, Cog, Award, Users } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { MotionDiv, StaggerContainer } from '@/components/motion'
import { useScrollAnimation, useCountUp } from '@/hooks/use-scroll-animation'

function AnimatedStat({ value, label, icon: Icon, index }: { value: string; label: string; icon: any; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 })
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0
  const hasPlus = value.includes('+')
  const suffix = value.replace(/[0-9+]/g, '')
  const count = useCountUp(numericValue, 2000, isVisible)

  return (
    <div 
      ref={ref}
      className="group text-center transition-all duration-500"
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
        <Icon className="h-8 w-8 text-accent transition-transform duration-300 group-hover:scale-110" />
      </div>
      <p className="text-3xl font-bold text-foreground md:text-4xl">
        {suffix ? value : `${count}${hasPlus ? '+' : ''}`}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()

  const stats = [
    { value: '17+', label: t.stats.years, icon: Factory },
    { value: '±0.005mm', label: t.stats.precision, icon: Cog },
    { value: '50+', label: t.stats.employees, icon: Users },
    { value: '20+', label: t.stats.machines, icon: Award },
  ]

  const industries = [
    t.industries.medical,
    t.industries.electronics,
    t.industries.aerospace,
    t.industries.automotive,
    t.industries.semiconductor,
    t.industries.optical,
    t.industries.newEnergy,
    t.industries.automation,
  ]

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] bg-primary">
        <div className="absolute inset-0">
          <Image
            src="/images/1.jpg"
            alt="CNC Machining"
            fill
            className="object-cover opacity-40 transition-transform duration-[20000ms] hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50" />
        </div>
        
        <div className="container relative mx-auto flex min-h-[90vh] items-center px-4 py-20 lg:px-8">
          <div className="max-w-3xl">
            <MotionDiv animation="fade-right" delay={0}>
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent animate-pulse">
                ISO 9001:2015 Certified
              </p>
            </MotionDiv>
            
            <MotionDiv animation="fade-up" delay={200}>
              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
                {t.hero.title}
              </h1>
            </MotionDiv>
            
            <MotionDiv animation="fade-up" delay={400}>
              <p className="mb-4 text-xl text-primary-foreground/90 md:text-2xl">
                {t.hero.subtitle}
              </p>
            </MotionDiv>
            
            <MotionDiv animation="fade-up" delay={600}>
              <p className="mb-8 max-w-2xl text-base text-primary-foreground/70 md:text-lg">
                {t.hero.description}
              </p>
            </MotionDiv>
            
            <MotionDiv animation="fade-up" delay={800}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/contact">
                  <Button size="lg" className="group bg-accent text-accent-foreground hover:bg-accent/90 animate-pulse-glow">
                    {t.hero.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent transition-all hover:scale-105">
                    {t.hero.learnMore}
                  </Button>
                </Link>
              </div>
            </MotionDiv>
          </div>
        </div>

        {/* Animated scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-primary-foreground/50">Scroll</span>
            <div className="h-12 w-6 rounded-full border-2 border-primary-foreground/30 p-1">
              <div className="h-2 w-full animate-bounce rounded-full bg-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <AnimatedStat key={index} {...stat} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <MotionDiv animation="fade-right" className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/3.jpg"
                alt="Our Facility"
                fill
                className="object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
            </MotionDiv>
            
            <div>
              <MotionDiv animation="fade-left" delay={100}>
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
                  {t.about.subtitle}
                </p>
              </MotionDiv>
              
              <MotionDiv animation="fade-left" delay={200}>
                <h2 className="mb-6 text-balance text-3xl font-bold text-foreground md:text-4xl">
                  {t.about.title}
                </h2>
              </MotionDiv>
              
              <MotionDiv animation="fade-left" delay={300}>
                <p className="mb-4 text-muted-foreground">
                  {t.about.description}
                </p>
                <p className="mb-6 text-muted-foreground">
                  {t.about.description2}
                </p>
              </MotionDiv>
              
              <MotionDiv animation="fade-up" delay={400}>
                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                  {[
                    t.about.certification,
                    t.specs.sizeValue,
                    t.specs.precisionValue,
                    t.specs.equipmentValue,
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/5"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent transition-transform group-hover:scale-110" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </MotionDiv>
              
              <MotionDiv animation="fade-up" delay={500}>
                <Link href="/about">
                  <Button variant="outline" className="group bg-transparent">
                    {t.hero.learnMore}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </MotionDiv>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <MotionDiv animation="fade-up" className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
              {t.services.subtitle}
            </p>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              {t.services.title}
            </h2>
          </MotionDiv>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: t.services.turning, desc: t.services.turningDesc },
              { title: t.services.milling, desc: t.services.millingDesc },
              { title: t.services.grinding, desc: t.services.grindingDesc },
              { title: t.services.wirecut, desc: t.services.wirecutDesc },
              { title: t.services.edm, desc: t.services.edmDesc },
              { title: t.services.laser, desc: t.services.laserDesc },
              { title: t.services.drilling, desc: t.services.drillingDesc },
              { title: t.services.sheetmetal, desc: t.services.sheetmetalDesc },
            ].map((service, index) => (
              <MotionDiv key={index} animation="fade-up" delay={index * 100}>
                <div className="group h-full rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:border-accent hover:shadow-xl card-shine">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
                    <Cog className="h-6 w-6 transition-transform duration-500 group-hover:rotate-180" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.desc}</p>
                </div>
              </MotionDiv>
            ))}
          </div>

          <MotionDiv animation="fade-up" delay={800} className="mt-12 text-center">
            <Link href="/services">
              <Button className="group">
                {t.hero.learnMore}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </MotionDiv>
        </div>
      </section>

      {/* Industries Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <MotionDiv animation="fade-up" className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
              {t.industries.subtitle}
            </p>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              {t.industries.title}
            </h2>
          </MotionDiv>

          <div className="flex flex-wrap justify-center gap-4">
            {industries.map((industry, index) => (
              <MotionDiv key={index} animation="zoom-in" delay={index * 50}>
                <div className="group cursor-pointer rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-lg">
                  {industry}
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-primary py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/2.jpg"
            alt="Precision Parts"
            fill
            className="object-cover opacity-20"
          />
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary animate-gradient" style={{ backgroundSize: '200% 200%' }} />
        </div>
        
        <div className="container relative mx-auto px-4 text-center lg:px-8">
          <MotionDiv animation="fade-up">
            <h2 className="mb-4 text-balance text-3xl font-bold text-primary-foreground md:text-4xl">
              {t.contact.subtitle}
            </h2>
          </MotionDiv>
          
          <MotionDiv animation="fade-up" delay={200}>
            <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/70">
              {t.about.missionText}
            </p>
          </MotionDiv>
          
          <MotionDiv animation="fade-up" delay={400}>
            <Link href="/contact">
              <Button size="lg" className="group bg-accent text-accent-foreground hover:bg-accent/90 animate-pulse-glow">
                {t.hero.cta}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </MotionDiv>
        </div>
      </section>
    </div>
  )
}
