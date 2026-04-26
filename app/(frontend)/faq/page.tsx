'use client'

import { useLanguage } from '@/lib/language-context'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { MotionDiv } from '@/components/motion'
import { Package, DollarSign, FlaskConical, Truck, Shield } from 'lucide-react'

export default function FAQPage() {
  const { locale } = useLanguage()
  const isEn = locale === 'en'

  const faqCategories = [
    {
      id: 'products',
      icon: Package,
      titleEn: 'Products & Specifications',
      titleZh: '产品与规格类',
      questions: [
        {
          qEn: 'What specifications or models are available?',
          qZh: '你们的产品有哪些规格/型号可选？',
          aEn: 'We do not have standard products. We produce based on customer\'s drawings.',
          aZh: '我们没有标准产品，根据客户图纸生产。',
        },
        {
          qEn: 'Do you support customized size, material, color, or process?',
          qZh: '是否支持定制尺寸 / 材质 / 颜色 / 工艺？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'Can you provide samples?',
          qZh: '是否可以提供样品？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'Do you provide technical data sheets or test reports?',
          qZh: '产品是否有技术参数表 / 检测报告？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'What industries or applications are your products suitable for?',
          qZh: '产品适用于哪些行业或应用场景？',
          aEn: 'All mechanical parts, like components for automotive application; parts for all kinds of machines.',
          aZh: '所有机械零部件，如汽车应用部件；各种机器的零部件。',
        },
        {
          qEn: 'Do you support OEM / ODM services?',
          qZh: '是否支持 OEM / ODM？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'What is the service life or performance advantage of the product?',
          qZh: '产品的使用寿命 / 性能优势是什么？',
          aEn: 'Depends on the specific product and application requirements.',
          aZh: '取决于具体产品和应用要求。',
        },
      ],
    },
    {
      id: 'pricing',
      icon: DollarSign,
      titleEn: 'MOQ & Pricing',
      titleZh: '起订量与价格类',
      questions: [
        {
          qEn: 'What is the minimum order quantity (MOQ)?',
          qZh: '最小起订量（MOQ）是多少？',
          aEn: 'Depends on the components.',
          aZh: '取决于具体部件。',
        },
        {
          qEn: 'Do you offer tiered pricing?',
          qZh: '价格是否为阶梯报价？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'Does the price include packaging, shipping, or taxes?',
          qZh: '报价是否包含包装、运输或税费？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'Do you offer long-term cooperation pricing or bulk discounts?',
          qZh: '是否支持长期合作价格 / 批量折扣？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'Will prices fluctuate due to raw materials or exchange rates?',
          qZh: '价格是否会随原材料或汇率波动？',
          aEn: 'Yes',
          aZh: '是',
        },
      ],
    },
    {
      id: 'samples',
      icon: FlaskConical,
      titleEn: 'Samples',
      titleZh: '样品与打样类',
      questions: [
        {
          qEn: 'Can samples be shipped?',
          qZh: '是否可以寄送样品？',
          aEn: 'Yes, but we need to charge the cost.',
          aZh: '可以，但需要收取费用。',
        },
        {
          qEn: 'Are samples charged? Are they refundable?',
          qZh: '样品是否收费？是否可退？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'What is the sample lead time?',
          qZh: '样品交期是多久？',
          aEn: 'Depends on the sample.',
          aZh: '取决于样品。',
        },
        {
          qEn: 'Do you support sample approval before mass production?',
          qZh: '定制产品是否支持先打样确认？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'Are samples consistent with mass production?',
          qZh: '样品与大货是否一致？',
          aEn: 'Yes',
          aZh: '是',
        },
      ],
    },
    {
      id: 'delivery',
      icon: Truck,
      titleEn: 'Production & Delivery',
      titleZh: '生产与交期类',
      questions: [
        {
          qEn: 'What is the production lead time after ordering?',
          qZh: '下单后的生产周期是多久？',
          aEn: 'Normally 45-60 days.',
          aZh: '通常45-60天。',
        },
        {
          qEn: 'Is the delivery time for bulk orders stable?',
          qZh: '大货交期是否稳定？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'Will lead time be extended during peak seasons?',
          qZh: '旺季是否会延长交期？',
          aEn: 'Normally not.',
          aZh: '通常不会。',
        },
        {
          qEn: 'Do you support urgent or expedited production?',
          qZh: '是否支持加急生产？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'Can you provide production progress updates?',
          qZh: '生产过程中是否可提供进度反馈？',
          aEn: 'Yes',
          aZh: '是',
        },
      ],
    },
    {
      id: 'quality',
      icon: Shield,
      titleEn: 'Quality & Inspection',
      titleZh: '质量与质检类',
      questions: [
        {
          qEn: 'Do you have a quality control process?',
          qZh: '是否有质量控制流程？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'Do you support third-party inspection?',
          qZh: '是否支持第三方验货？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'Do you provide inspection or quality reports?',
          qZh: '是否提供质检报告 / 出厂验？',
          aEn: 'Yes',
          aZh: '是',
        },
        {
          qEn: 'How do you handle quality issues?',
          qZh: '出现质量问题如何处理？',
          aEn: 'Do analysis and replace the NG components.',
          aZh: '进行分析并更换不合格部件。',
        },
        {
          qEn: 'Is there a quality warranty period?',
          qZh: '是否有质量保证期？',
          aEn: 'Yes',
          aZh: '是',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-primary py-20 text-primary-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="container relative mx-auto px-4 text-center lg:px-8">
          <MotionDiv animation="fade-up">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              {isEn ? 'Frequently Asked Questions' : '常见问题（FAQ）'}
            </h1>
          </MotionDiv>
          <MotionDiv animation="fade-up" delay={200}>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
              {isEn 
                ? 'Find answers to common questions about our products, services, pricing, and quality assurance.'
                : '查找有关我们产品、服务、价格和质量保证的常见问题解答。'}
            </p>
          </MotionDiv>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-12">
            {faqCategories.map((category, catIndex) => (
              <MotionDiv key={category.id} animation="fade-up" delay={catIndex * 100}>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <category.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {isEn ? category.titleEn : category.titleZh}
                      </h2>
                      <Badge variant="secondary" className="mt-1">
                        {category.questions.length} {isEn ? 'questions' : '个问题'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((q, qIndex) => (
                      <AccordionItem key={qIndex} value={`${category.id}-${qIndex}`} className="border-border">
                        <AccordionTrigger className="text-left hover:no-underline hover:text-accent">
                          <span className="pr-4">{isEn ? q.qEn : q.qZh}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          <div className="rounded-lg bg-muted/50 p-4">
                            {isEn ? q.aEn : q.aZh}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center lg:px-8">
          <MotionDiv animation="fade-up">
            <h2 className="mb-4 text-2xl font-bold">
              {isEn ? 'Still have questions?' : '还有其他问题？'}
            </h2>
            <p className="mb-8 text-muted-foreground">
              {isEn 
                ? 'Contact us directly and we\'ll be happy to help.'
                : '直接联系我们，我们很乐意为您提供帮助。'}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-accent px-8 py-3 font-medium text-accent-foreground transition-all hover:bg-accent/90 hover:scale-105"
              >
                {isEn ? 'Contact Us' : '联系我们'}
              </a>
              <a
                href="mailto:support@gymetaltech.com"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-8 py-3 font-medium transition-all hover:bg-muted hover:scale-105"
              >
                support@gymetaltech.com
              </a>
            </div>
          </MotionDiv>
        </div>
      </section>
    </div>
  )
}
