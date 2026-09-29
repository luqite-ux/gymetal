'use client'

import Image from '@/components/managed-image'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wrench, Microscope, Settings, Target, Ruler, Activity } from 'lucide-react'
import { MotionDiv } from '@/components/motion'
import { usePageText } from '@/lib/use-page-text'

// Equipment data with bilingual support
import { useSiteContent } from '@/lib/site-content-context'
import { visibleEquipment, type Equipment } from '@/lib/site-content-model'

export default function EquipmentPage() {
  const { locale, t } = useLanguage()
  const l = usePageText()
  const content = useSiteContent()
  const machiningEquipment = visibleEquipment(content?.equipment ?? [], 'machining')
  const testingEquipment = visibleEquipment(content?.equipment ?? [], 'testing')
  const local = (item:Equipment,field:'name'|'category'|'description') => {
    const english = field === 'name' ? item.nameEn : field === 'category' ? item.category : item.descEn
    const chinese = field === 'name' ? item.nameCn : field === 'category' ? item.categoryCn : item.descCn
    return locale === 'en' ? english : locale === 'zh' ? chinese || english : item.translations[locale]?.[field] || english
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src="/images/1.jpg"
            alt="Equipment"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <div className="container relative mx-auto px-4 text-center lg:px-8">
          <MotionDiv animation="fade-up">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              {t.equipment.title}
            </h1>
          </MotionDiv>
          <MotionDiv animation="fade-up" delay={200}>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
              {t.equipment.subtitle}
            </p>
          </MotionDiv>
        </div>
      </section>

      {/* Equipment Stats */}
      <section className="border-b border-border bg-muted/50 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-accent">{machiningEquipment.length}</div>
              <div className="text-sm text-muted-foreground">
                {l('Machining Machines', '台机加工设备')}
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-accent">{testingEquipment.length}</div>
              <div className="text-sm text-muted-foreground">
                {l('Testing Devices', '台检测设备')}
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-accent">{content?.parameters.equipmentAccuracy}</div>
              <div className="text-sm text-muted-foreground">
                {l('Best Accuracy', '最高精度')}
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-accent">{content?.parameters.equipmentSize}</div>
              <div className="text-sm text-muted-foreground">
                {l('Max Machining Size', '最大加工尺寸')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Tabs */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <Tabs defaultValue="machining" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
              <TabsTrigger value="machining" className="gap-2">
                <Wrench className="h-4 w-4" />
                {t.equipment.machining}
              </TabsTrigger>
              <TabsTrigger value="testing" className="gap-2">
                <Microscope className="h-4 w-4" />
                {t.equipment.testing}
              </TabsTrigger>
            </TabsList>

            {/* Machining Equipment */}
            <TabsContent value="machining">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {machiningEquipment.map((item, index) => (
                  <MotionDiv key={item.id} animation="fade-up" delay={index * 50}>
                    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl card-shine">
                      <div className="relative aspect-video bg-muted">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={local(item, 'name')}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/images/3.jpg'
                            }}
                          />
                        ) : null}
                        <Badge className="absolute end-2 top-2 bg-accent text-accent-foreground">
                          {local(item, 'category')}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Settings className="h-5 w-5 text-accent" />
                          {item.model}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {local(item, 'name')}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                          {local(item, 'description')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.accuracy && item.accuracy !== '-' && (
                            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                              <Target className="h-3 w-3 text-accent" />
                              <span>{t.equipment.accuracy}: {item.accuracy}</span>
                            </div>
                          )}
                          {item.range && (
                            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                              <Ruler className="h-3 w-3 text-accent" />
                              <span>{item.range}</span>
                            </div>
                          )}
                          {item.travel && <div className="rounded-md bg-muted px-2 py-1 text-xs">{item.travel}</div>}
                          {item.maxDiameter && (
                            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                              <Activity className="h-3 w-3 text-accent" />
                              <span>{item.maxDiameter}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </MotionDiv>
                ))}
              </div>
            </TabsContent>

            {/* Testing Equipment */}
            <TabsContent value="testing">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testingEquipment.map((item, index) => (
                  <MotionDiv key={item.id} animation="fade-up" delay={index * 50}>
                    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl card-shine">
                      <div className="relative aspect-video bg-muted">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={local(item, 'name')}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/images/9.jpg'
                            }}
                          />
                        ) : null}
                        <Badge className="absolute end-2 top-2 bg-accent text-accent-foreground">
                          {local(item, 'category')}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Microscope className="h-5 w-5 text-accent" />
                          {item.model}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {local(item, 'name')}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                          {local(item, 'description')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.accuracy && item.accuracy !== '-' && (
                            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                              <Target className="h-3 w-3 text-accent" />
                              <span>{t.equipment.accuracy}: {item.accuracy}</span>
                            </div>
                          )}
                          {item.range && <div className="rounded-md bg-muted px-2 py-1 text-xs">{item.range}</div>}
                          {item.maxDiameter && <div className="rounded-md bg-muted px-2 py-1 text-xs">{item.maxDiameter}</div>}
                          {item.travel && <div className="rounded-md bg-muted px-2 py-1 text-xs">{item.travel}</div>}
                        </div>
                      </CardContent>
                    </Card>
                  </MotionDiv>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Equipment Categories Summary */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <MotionDiv animation="fade-up">
            <h2 className="mb-8 text-center text-2xl font-bold">
              {l('Equipment Categories', '设备类别')}
            </h2>
          </MotionDiv>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: l('CNC Lathes', '数控车床'), count: machiningEquipment.filter(i => /Lathe/.test(i.category) && !/Vertical/.test(i.category)).length, icon: Settings },
              { name: l('Vertical Lathes', '数控立车'), count: machiningEquipment.filter(i => /Vertical Lathe/.test(i.category)).length, icon: Wrench },
              { name: l('Boring Mills', '镗铣床'), count: machiningEquipment.filter(i => /Boring/.test(i.category)).length, icon: Target },
              { name: l('Machining Centers', '加工中心'), count: machiningEquipment.filter(i => /Machining Center/.test(i.category)).length, icon: Activity },
            ].map((cat, idx) => (
              <MotionDiv key={idx} animation="zoom-in" delay={idx * 100}>
                <Card className="group text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                  <CardContent className="pt-6">
                    <cat.icon className="mx-auto mb-3 h-10 w-10 text-accent transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    <h3 className="font-semibold">{cat.name}</h3>
                    <p className="text-2xl font-bold text-accent">{cat.count}</p>
                  </CardContent>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
