'use client'

import Image from 'next/image'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wrench, Microscope, Settings, Target, Ruler, Activity } from 'lucide-react'
import { MotionDiv } from '@/components/motion'

// Equipment data with bilingual support
const machiningEquipment = [
  {
    id: 'ck-6132',
    model: 'CK-6132',
    nameCn: 'CK-6132数控车床',
    nameEn: 'CK-6132 CNC Lathe',
    category: 'CNC Lathe',
    categoryCn: '数控车床',
    descEn: 'Primarily employed for rough machining and select stainless steel precision machining, with a machining accuracy of ≤0.005mm and a maximum machining diameter of φ35.0mm.',
    descCn: '主要用于公司粗加工和部分不锈钢精密加工，加工精度≤0.005mm，最大加工直径φ35.0mm。',
    accuracy: '≤0.005mm',
    maxDiameter: 'φ35.0mm',
    image: '/images/equipment/ck-6132.jpg',
  },
  {
    id: 'gtx300',
    model: 'GTX300',
    nameCn: 'GTX300数控车床',
    nameEn: 'GTX300 CNC Lathe',
    category: 'CNC Lathe',
    categoryCn: '数控车床',
    descEn: 'Primarily used for machining blanks.',
    descCn: '主要用于毛坯加工。',
    accuracy: '-',
    image: '/images/equipment/gtx300.jpg',
  },
  {
    id: 'j-d-s30',
    model: 'J-D-S30',
    nameCn: 'J-D-S30全自动化数控卧式车床',
    nameEn: 'J-D-S30 Fully Automated CNC Horizontal Lathe',
    category: 'CNC Horizontal Lathe',
    categoryCn: '数控卧式车床',
    descEn: 'Primary Application: Batch processing of steel components. Maximum Machining Diameter: φ35.0mm. Machine Accuracy: ≤0.001mm.',
    descCn: '主要应用：钢材零部件批量加工。最大加工直径：φ35.0mm。机床精度：≤0.001mm。',
    accuracy: '≤0.001mm',
    maxDiameter: 'φ35.0mm',
    image: '/images/equipment/j-d-s30.jpg',
  },
  {
    id: 'xknc-203',
    model: 'XKNC-203',
    nameCn: 'XKNC-203数控卧式车床',
    nameEn: 'XKNC-203 CNC Horizontal Lathe',
    category: 'CNC Horizontal Lathe',
    categoryCn: '数控卧式车床',
    descEn: 'Primary Application: Finishing of steel and stainless steel components. Maximum Machining Diameter: φ45.0mm. Maximum Travel: 200mm. Machine Accuracy: ≤0.001mm.',
    descCn: '主要应用：钢和不锈钢零部件精加工。最大加工直径：φ45.0mm。最大行程：200mm。机床精度：≤0.001mm。',
    accuracy: '≤0.001mm',
    maxDiameter: 'φ45.0mm',
    travel: '200mm',
    image: '/images/equipment/xknc-203.jpg',
  },
  {
    id: 'xknc-20gl',
    model: 'XKNC-20GL',
    nameCn: 'XKNC-20GL全自动化数控卧式车床',
    nameEn: 'XKNC-20GL Fully Automated CNC Horizontal Lathe',
    category: 'CNC Horizontal Lathe',
    categoryCn: '数控卧式车床',
    descEn: 'Primary Application: Mass processing of steel components. Maximum Machining Diameter: φ30.0mm. Machine Accuracy: ≤0.002mm.',
    descCn: '主要应用：钢材零部件批量加工。最大加工直径：φ30.0mm。机床精度：≤0.002mm。',
    accuracy: '≤0.002mm',
    maxDiameter: 'φ30.0mm',
    image: '/images/equipment/xknc-20gl.jpg',
  },
  {
    id: 'jhl1-6',
    model: 'JHL1-6',
    nameCn: 'JHL1-6珩磨机',
    nameEn: 'JHL1-6 Honing Machine',
    category: 'Honing Machine',
    categoryCn: '珩磨机',
    descEn: 'Primary Application: Machining of inner bores in floating bearings. Maximum Machinable Bore Diameter: φ30.0mm. Equipment Accuracy: ≤0.001mm.',
    descCn: '主要应用：浮动轴承内孔加工。最大可加工内孔直径：φ30.0mm。设备精度：≤0.001mm。',
    accuracy: '≤0.001mm',
    maxDiameter: 'φ30.0mm',
    image: '/images/equipment/jhl1-6.jpg',
  },
  {
    id: 'cincom-a20',
    model: 'Cincom-A20',
    nameCn: 'Cincom-A20主轴箱移动性数控自动车床',
    nameEn: 'Cincom-A20 Spindle Head Mobile CNC Automatic Lathe',
    category: 'CNC Automatic Lathe',
    categoryCn: '数控自动车床',
    descEn: 'Primary Application: Machining VTG (Variable Turbine Geometry) nozzle ring components and floating bearings. Maximum Machining Diameter: φ25.0mm. Machine Accuracy: ≤0.001mm.',
    descCn: '主要应用：VTG（可变涡轮几何）喷嘴环零部件及浮动轴承加工。最大加工直径：φ25.0mm。机床精度：≤0.001mm。',
    accuracy: '≤0.001mm',
    maxDiameter: 'φ25.0mm',
    image: '/images/equipment/cincom-a20.jpg',
  },
  {
    id: 'vtl2500atc',
    model: 'VTL2500ATC+C-2R',
    nameCn: '数控立车VTL2500ATC+C-2R',
    nameEn: 'CNC Vertical Lathe VTL2500ATC+C-2R',
    category: 'CNC Vertical Lathe',
    categoryCn: '数控立车',
    descEn: 'Machining range: 3000 × 2000 mm. Machining accuracy: 0.01 mm.',
    descCn: '加工范围：3000 × 2000 mm。加工精度：0.01 mm。',
    accuracy: '0.01mm',
    range: '3000 × 2000 mm',
    image: '/images/equipment/vtl2500atc.jpg',
  },
  {
    id: 'hankook-vtc3040',
    model: 'HANKOOK VTC3040',
    nameCn: '数控立车 HANKOOK VTC3040',
    nameEn: 'CNC Vertical Lathe HANKOOK VTC3040',
    category: 'CNC Vertical Lathe',
    categoryCn: '数控立车',
    descEn: 'Machining range: 4000 × 2700 mm. Machining accuracy: 0.01 mm.',
    descCn: '加工范围：4000 × 2700 mm。加工精度：0.01 mm。',
    accuracy: '0.01mm',
    range: '4000 × 2700 mm',
    image: '/images/equipment/hankook-vtc3040.jpg',
  },
  {
    id: 'toshiba-tss-c',
    model: 'TOSHIBA TSS-C',
    nameCn: '数控立车 TOSHIBA TSS-C',
    nameEn: 'CNC Vertical Lathe TOSHIBA TSS-C',
    category: 'CNC Vertical Lathe',
    categoryCn: '数控立车',
    descEn: 'Machining range: 5500 × 2600 mm. Machining accuracy: 0.01 mm.',
    descCn: '加工范围：5500 × 2600 mm。加工精度：0.01 mm。',
    accuracy: '0.01mm',
    range: '5500 × 2600 mm',
    image: '/images/equipment/toshiba-tss-c.jpg',
  },
  {
    id: 'kc-130-1',
    model: 'KC 130/1',
    nameCn: '卧式落地镗铣床 KC 130/1',
    nameEn: 'Horizontal Boring Mill KC 130/1',
    category: 'Horizontal Boring Mill',
    categoryCn: '卧式落地镗铣床',
    descEn: 'Machining range: 3200 × 2800 × 1900 mm. Machining accuracy: 0.01 mm.',
    descCn: '加工范围：3200 × 2800 × 1900 mm。加工精度：0.01 mm。',
    accuracy: '0.01mm',
    range: '3200 × 2800 × 1900 mm',
    image: '/images/equipment/kc-130-1.jpg',
  },
  {
    id: 'whn15cnc',
    model: 'WHN15CNC',
    nameCn: '卧式落地镗铣床 WHN15CNC',
    nameEn: 'Horizontal Boring Mill WHN15CNC',
    category: 'Horizontal Boring Mill',
    categoryCn: '卧式落地镗铣床',
    descEn: 'Machining range: 3200 × 2500 × 1500 mm. Machining accuracy: 0.01 mm.',
    descCn: '加工范围：3200 × 2500 × 1500 mm。加工精度：0.01 mm。',
    accuracy: '0.01mm',
    range: '3200 × 2500 × 1500 mm',
    image: '/images/equipment/whn15cnc.jpg',
  },
  {
    id: 'kbn135',
    model: 'KBN135',
    nameCn: '卧式落地镗铣床 KBN135',
    nameEn: 'Horizontal Boring Mill KBN135',
    category: 'Horizontal Boring Mill',
    categoryCn: '卧式落地镗铣床',
    descEn: 'Machining range: 3000 × 2000 × 1600 mm. Machining accuracy: 0.009 mm.',
    descCn: '加工范围：3000 × 2000 × 1600 mm。加工精度：0.009 mm。',
    accuracy: '0.009mm',
    range: '3000 × 2000 × 1600 mm',
    image: '/images/equipment/kbn135.jpg',
  },
  {
    id: 'mcr-a5c2',
    model: 'MCR-A5CII',
    nameCn: '龙门五面体加工中心 MCR-A5CⅡ',
    nameEn: 'Gantry Five Face CNC MCR-A5CII',
    category: 'Gantry Machining Center',
    categoryCn: '龙门加工中心',
    descEn: 'Machining range: 5200 × 3600 × 800 mm. Machining accuracy: 0.01 mm.',
    descCn: '加工范围：5200 × 3600 × 800 mm。加工精度：0.01 mm。',
    accuracy: '0.01mm',
    range: '5200 × 3600 × 800 mm',
    image: '/images/equipment/mcr-a5c2.jpg',
  },
  {
    id: 'mpc-e2-2650',
    model: 'MPC-EII 2650',
    nameCn: '龙门五面体加工中心 MPC-EⅡ2650',
    nameEn: 'Gantry Five Face CNC MPC-EII 2650',
    category: 'Gantry Machining Center',
    categoryCn: '龙门加工中心',
    descEn: 'Machining range: 5500 × 3400 × 1750 mm. Machining accuracy: 0.01 mm.',
    descCn: '加工范围：5500 × 3400 × 1750 mm。加工精度：0.01 mm。',
    accuracy: '0.01mm',
    range: '5500 × 3400 × 1750 mm',
    image: '/images/equipment/mpc-e2-2650.jpg',
  },
  {
    id: 'csw-1160',
    model: 'CSW-1160',
    nameCn: '三轴加工中心 CSW-1160',
    nameEn: 'VMC CSW-1160',
    category: 'Vertical Machining Center',
    categoryCn: '三轴加工中心',
    descEn: 'Machining range: 1000 × 600 mm. Machining accuracy: 0.02 mm.',
    descCn: '加工范围：1000 × 600 mm。加工精度：0.02 mm。',
    accuracy: '0.02mm',
    range: '1000 × 600 mm',
    image: '/images/equipment/csw-1160.jpg',
  },
  {
    id: 'csw-850',
    model: 'CSW-850',
    nameCn: '三轴加工中心 CSW-850',
    nameEn: 'VMC CSW-850',
    category: 'Vertical Machining Center',
    categoryCn: '三轴加工中心',
    descEn: 'Machining range: 800 × 500 mm. Machining accuracy: 0.02 mm.',
    descCn: '加工范围：800 × 500 mm。加工精度：0.02 mm。',
    accuracy: '0.02mm',
    range: '800 × 500 mm',
    image: '/images/equipment/csw-850.jpg',
  },
  {
    id: 'alpha-d21m',
    model: 'α-D21M',
    nameCn: '三轴加工中心 α-D21M',
    nameEn: 'VMC α-D21M',
    category: 'Vertical Machining Center',
    categoryCn: '三轴加工中心',
    descEn: 'Machining range: 800 × 500 mm. Machining accuracy: 0.01 mm.',
    descCn: '加工范围：800 × 500 mm。加工精度：0.01 mm。',
    accuracy: '0.01mm',
    range: '800 × 500 mm',
    image: '/images/equipment/a-d21m.jpg',
  },
]

const testingEquipment = [
  {
    id: 'cv-2100m4',
    model: 'CV-2100M4',
    nameCn: 'CV-2100M4三丰轮廓仪',
    nameEn: 'CV-2100M4 Mitutoyo Profile Tester',
    category: 'Profile Tester',
    categoryCn: '轮廓仪',
    descEn: 'Primary Application: Measuring specialised dimensions with tight tolerances, e.g., angles, arcs, and widths. Equipment Accuracy: ≤0.001mm.',
    descCn: '主要应用：测量具有严格公差的特殊尺寸，如角度、弧度和宽度。设备精度：≤0.001mm。',
    accuracy: '≤0.001mm',
    image: '/images/equipment/cv-2100m4.jpg',
  },
  {
    id: 'vm-s200',
    model: 'VM-S200',
    nameCn: '智泰VM-S200影像仪',
    nameEn: 'Zhite VM-S200 Imaging System',
    category: 'Imaging System',
    categoryCn: '影像仪',
    descEn: 'Primary purpose: Observing burrs and measuring specialised dimensions with larger tolerances, e.g. angles, arcs, and lengths. Equipment accuracy: ≤0.005mm.',
    descCn: '主要用途：观察毛刺和测量公差较大的特殊尺寸，如角度、弧度和长度。设备精度：≤0.005mm。',
    accuracy: '≤0.005mm',
    image: '/images/equipment/vm-s200.jpg',
  },
  {
    id: 'mmd-r100s',
    model: 'MMD-R100S',
    nameCn: 'MMD-R100S粗糙度仪',
    nameEn: 'MMD-R100S Roughness Tester',
    category: 'Roughness Tester',
    categoryCn: '粗糙度仪',
    descEn: 'Primary Application: Roughness Tester. Equipment Accuracy: ≤0.05mm.',
    descCn: '主要应用：粗糙度测试。设备精度：≤0.05mm。',
    accuracy: '≤0.05mm',
    image: '/images/equipment/mmd-r100s.jpg',
  },
  {
    id: 'sinapc10a',
    model: 'SinAPC10A',
    nameCn: '清洁度分析系统 SinAPC10A',
    nameEn: 'Cleanliness Analysis System SinAPC10A',
    category: 'Cleanliness Analyzer',
    categoryCn: '清洁度分析系统',
    descEn: 'This analytical system is employed for cleanliness testing of automotive component samples. It automatically quantifies, analyses and classifies impurity particles on filter membranes by type, size and quantity. It complies with cleanliness testing standards for components as specified by VDA19, ISO16232, NAS1638, ISO4406 and ISO4407. Equipment accuracy: 0.5μm/pixel.',
    descCn: '该分析系统用于汽车零部件样品的清洁度测试。它自动量化、分析和分类滤膜上的杂质颗粒的类型、大小和数量。符合VDA19、ISO16232、NAS1638、ISO4406和ISO4407规定的零部件清洁度测试标准。设备精度：0.5μm/pixel。',
    accuracy: '0.5μm/pixel',
    image: '/images/equipment/sinapc10a.jpg',
  },
  {
    id: 'hexacon-15-30-10',
    model: 'Hexacon 15.30.10',
    nameCn: '三坐标测量仪 Hexacon 15.30.10',
    nameEn: 'Coordinate Measuring Machine Hexacon 15.30.10',
    category: 'CMM',
    categoryCn: '三坐标测量仪',
    descEn: 'High-precision coordinate measuring machine for dimensional inspection and quality control.',
    descCn: '高精度三坐标测量仪，用于尺寸检测和质量控制。',
    accuracy: '-',
    image: '/images/equipment/hexacon-15-30-10.jpg',
  },
]

export default function EquipmentPage() {
  const { locale, t } = useLanguage()
  const isEn = locale === 'en'

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
                {isEn ? 'Machining Machines' : '台机加工设备'}
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-accent">{testingEquipment.length}</div>
              <div className="text-sm text-muted-foreground">
                {isEn ? 'Testing Devices' : '台检测设备'}
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-accent">0.001mm</div>
              <div className="text-sm text-muted-foreground">
                {isEn ? 'Best Accuracy' : '最高精度'}
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-accent">5500mm</div>
              <div className="text-sm text-muted-foreground">
                {isEn ? 'Max Machining Size' : '最大加工尺寸'}
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
                        <Image
                          src={item.image || '/images/placeholder-equipment.jpg'}
                          alt={isEn ? item.nameEn : item.nameCn}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/images/3.jpg'
                          }}
                        />
                        <Badge className="absolute right-2 top-2 bg-accent text-accent-foreground">
                          {isEn ? item.category : item.categoryCn}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Settings className="h-5 w-5 text-accent" />
                          {item.model}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {isEn ? item.nameEn : item.nameCn}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                          {isEn ? item.descEn : item.descCn}
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
                        <Image
                          src={item.image || '/images/placeholder-equipment.jpg'}
                          alt={isEn ? item.nameEn : item.nameCn}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/images/9.jpg'
                          }}
                        />
                        <Badge className="absolute right-2 top-2 bg-accent text-accent-foreground">
                          {isEn ? item.category : item.categoryCn}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Microscope className="h-5 w-5 text-accent" />
                          {item.model}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {isEn ? item.nameEn : item.nameCn}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                          {isEn ? item.descEn : item.descCn}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.accuracy && item.accuracy !== '-' && (
                            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                              <Target className="h-3 w-3 text-accent" />
                              <span>{t.equipment.accuracy}: {item.accuracy}</span>
                            </div>
                          )}
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
              {isEn ? 'Equipment Categories' : '设备类别'}
            </h2>
          </MotionDiv>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: isEn ? 'CNC Lathes' : '数控车床', count: 7, icon: Settings },
              { name: isEn ? 'Vertical Lathes' : '数控立车', count: 3, icon: Wrench },
              { name: isEn ? 'Boring Mills' : '镗铣床', count: 3, icon: Target },
              { name: isEn ? 'Machining Centers' : '加工中心', count: 5, icon: Activity },
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
