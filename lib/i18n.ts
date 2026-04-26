export type Locale = 'en' | 'zh'

export const locales: Locale[] = ['en', 'zh']
export const defaultLocale: Locale = 'en'

export const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      about: 'About Us',
      services: 'Services',
      equipment: 'Equipment',
      products: 'Products',
      faq: 'FAQ',
      contact: 'Contact',
    },
    // Hero
    hero: {
      title: 'Precision Metal Manufacturing',
      subtitle: 'Your Trusted Partner for High-Precision CNC Machining',
      description: 'ISO9001 certified manufacturer specializing in precision parts for medical, aerospace, automotive, and semiconductor industries.',
      cta: 'Get a Quote',
      learnMore: 'Learn More',
    },
    // Stats
    stats: {
      years: 'Years Experience',
      precision: 'Precision',
      employees: 'Employees',
      machines: 'CNC Machines',
    },
    // About
    about: {
      title: 'About GY Metal Tech',
      subtitle: 'Excellence in Precision Manufacturing Since 2007',
      description: 'Wuxi Guangyue Metal Technology Co., Ltd. was established in 2007, located at No. 219 Xinzhou Road, Meicun, Xinwu District, Wuxi City. Our production base covers approximately 4,500 square meters with over 50 employees and more than 20 imported high-precision machine tools.',
      description2: 'We specialize in high-precision parts machining, capable of producing castings and forgings in carbon steel, stainless steel, aluminum alloy, and copper materials.',
      mission: 'Our Mission',
      missionText: 'High quality, competitive pricing, timely delivery, and excellent service - putting customers first.',
      certification: 'ISO9001 Certified',
      certificationText: 'We have passed ISO9001 quality management system certification and hold independent import and export rights.',
    },
    // Services
    services: {
      title: 'Our Capabilities',
      subtitle: 'Comprehensive Precision Machining Services',
      turning: 'CNC Turning',
      turningDesc: 'High-precision turning operations for complex cylindrical parts',
      milling: 'CNC Milling',
      millingDesc: 'Multi-axis milling for intricate geometries and surfaces',
      drilling: 'Drilling',
      drillingDesc: 'Precision drilling operations with tight tolerances',
      grinding: 'Grinding',
      grindingDesc: 'Surface and cylindrical grinding for superior finish',
      wirecut: 'Wire EDM',
      wirecutDesc: 'Wire cutting for complex shapes and hard materials',
      edm: 'EDM',
      edmDesc: 'Electrical discharge machining for detailed cavities',
      laser: 'Laser Cutting',
      laserDesc: 'High-precision laser cutting for various materials',
      sheetmetal: 'Sheet Metal',
      sheetmetalDesc: 'Complete sheet metal fabrication services',
    },
    // Materials
    materials: {
      title: 'Materials We Work With',
      carbonSteel: 'Carbon Steel',
      stainlessSteel: 'Stainless Steel',
      aluminum: 'Aluminum Alloy',
      copper: 'Copper',
    },
    // Industries
    industries: {
      title: 'Industries We Serve',
      subtitle: 'Trusted by Leading Companies Worldwide',
      medical: 'Medical',
      electronics: 'Electronics',
      aerospace: 'Aerospace',
      automotive: 'Automotive',
      semiconductor: 'Semiconductor',
      optical: 'Optical',
      newEnergy: 'New Energy',
      automation: 'Automation',
    },
    // Specifications
    specs: {
      title: 'Technical Specifications',
      sizeRange: 'Size Range',
      sizeValue: '20mm - 5000mm',
      precision: 'Precision',
      precisionValue: '±0.005mm',
      facility: 'Facility Size',
      facilityValue: '4,500 m²',
      equipment: 'Equipment',
      equipmentValue: '20+ CNC Machines',
    },
    // Products
    products: {
      title: 'Our Products',
      subtitle: 'Precision Parts for Every Industry',
      castings: 'Castings',
      castingsDesc: 'High-quality metal castings in various materials',
      forgings: 'Forgings',
      forgingsDesc: 'Precision forged components for demanding applications',
      machined: 'Machined Parts',
      machinedDesc: 'Custom CNC machined components to your specifications',
      assemblies: 'Assemblies',
      assembliesDesc: 'Complete sub-assemblies and mechanical assemblies',
    },
    // Contact
    contact: {
      title: 'Contact Us',
      subtitle: 'Get in Touch for Your Next Project',
      name: 'Your Name',
      email: 'Email Address',
      phone: 'Phone Number',
      message: 'Your Message',
      submit: 'Send Message',
      address: 'Address',
      addressValue: 'No. 219 Xinzhou Road, Meicun, Xinwu District, Wuxi City, Jiangsu Province, China',
      phoneLabel: 'Phone',
      whatsapp: 'WhatsApp',
      emailLabel: 'Email',
    },
    // Footer
    footer: {
      description: 'Your trusted partner for precision metal manufacturing since 2007.',
      quickLinks: 'Quick Links',
      contactInfo: 'Contact Info',
      rights: 'All rights reserved.',
      company: 'Wuxi Guangyue Metal Technology Co., Ltd.',
    },
    // Equipment
    equipment: {
      title: 'Our Equipment',
      subtitle: 'Advanced CNC Machines & Testing Equipment',
      machining: 'Machining Equipment',
      testing: 'Testing Equipment',
      model: 'Model',
      category: 'Category',
      description: 'Description',
      specs: 'Specifications',
      machiningRange: 'Machining Range',
      accuracy: 'Accuracy',
      maxDiameter: 'Max Diameter',
      application: 'Application',
    },
  },
  zh: {
    // Navigation
    nav: {
      home: '首页',
      about: '关于我们',
      services: '服务能力',
      equipment: '设备展示',
      products: '产品展示',
      faq: '常见问题',
      contact: '联系我们',
    },
    // Hero
    hero: {
      title: '精密金属制造',
      subtitle: '您值得信赖的高精密CNC加工合作伙伴',
      description: 'ISO9001认证制造商，专注于医疗、航空、汽车和半导体行业的精密零部件加工。',
      cta: '获取报价',
      learnMore: '了解更多',
    },
    // Stats
    stats: {
      years: '年经验',
      precision: '加工精度',
      employees: '名员工',
      machines: '台数控机床',
    },
    // About
    about: {
      title: '关于广跃金属',
      subtitle: '自2007年以来的精密制造专家',
      description: '无锡广跃金属科技有限公司成立于2007年，位于无锡市新吴区梅村新洲路219号。生产基地面积约4500平方米，员工50余人，拥有各类进口高精度机床20多台。',
      description2: '公司主要从事高精密零部件机械加工，能够生产碳钢、不锈钢、铝合金、铜等材料铸件及锻件。',
      mission: '我们的宗旨',
      missionText: '以高质量、低价格、交货及时、服务周到、客户第一为宗旨，愿为广大客户提供优质服务。',
      certification: 'ISO9001认证',
      certificationText: '公司已通过ISO9001质量体系认证，拥有自主进出口权。',
    },
    // Services
    services: {
      title: '加工能力',
      subtitle: '全面的精密加工服务',
      turning: '车削加工',
      turningDesc: '高精度车削加工，适用于复杂圆柱形零件',
      milling: '铣削加工',
      millingDesc: '多轴铣削，适用于复杂几何形状和表面',
      drilling: '钻孔加工',
      drillingDesc: '精密钻孔加工，公差严格',
      grinding: '磨削加工',
      grindingDesc: '平面和圆柱磨削，表面质量优异',
      wirecut: '线切割',
      wirecutDesc: '适用于复杂形状和硬质材料的线切割',
      edm: '电火花加工',
      edmDesc: '用于精细型腔的电火花加工',
      laser: '激光切割',
      laserDesc: '各种材料的高精度激光切割',
      sheetmetal: '钣金加工',
      sheetmetalDesc: '完整的钣金制造服务',
    },
    // Materials
    materials: {
      title: '加工材料',
      carbonSteel: '碳钢',
      stainlessSteel: '不锈钢',
      aluminum: '铝合金',
      copper: '铜',
    },
    // Industries
    industries: {
      title: '服务行业',
      subtitle: '受到全球领先企业的信赖',
      medical: '医疗',
      electronics: '电子',
      aerospace: '航空',
      automotive: '汽车',
      semiconductor: '半导体',
      optical: '光学',
      newEnergy: '新能源',
      automation: '精密自动化',
    },
    // Specifications
    specs: {
      title: '技术规格',
      sizeRange: '尺寸范围',
      sizeValue: '20mm - 5000mm',
      precision: '加工精度',
      precisionValue: '±0.005mm',
      facility: '厂房面积',
      facilityValue: '4,500 平方米',
      equipment: '设备',
      equipmentValue: '20+ 台数控机床',
    },
    // Products
    products: {
      title: '产品展示',
      subtitle: '为各行业提供精密零部件',
      castings: '铸件',
      castingsDesc: '各种材料的高质量金属铸件',
      forgings: '锻件',
      forgingsDesc: '适用于高要求应用的精密锻造部件',
      machined: '机加工零件',
      machinedDesc: '按您的规格定制CNC机加工部件',
      assemblies: '组件',
      assembliesDesc: '完整的子组件和机械组件',
    },
    // Contact
    contact: {
      title: '联系我们',
      subtitle: '为您的下一个项目取得联系',
      name: '您的姓名',
      email: '电子邮箱',
      phone: '电话号码',
      message: '留言内容',
      submit: '发送消息',
      address: '地址',
      addressValue: '中国江苏省无锡市新吴区梅村新洲路219号',
      phoneLabel: '电话',
      whatsapp: 'WhatsApp',
      emailLabel: '邮箱',
    },
    // Footer
    footer: {
      description: '自2007年以来，您值得信赖的精密金属制造合作伙伴。',
      quickLinks: '快速链接',
      contactInfo: '联系信息',
      rights: '版权所有',
      company: '无锡广跃金属科技有限公司',
    },
    // Equipment
    equipment: {
      title: '设备展示',
      subtitle: '先进的数控机床及检测设备',
      machining: '机械加工设备',
      testing: '检测设备',
      model: '型号',
      category: '类别',
      description: '描述',
      specs: '规格参数',
      machiningRange: '加工范围',
      accuracy: '精度',
      maxDiameter: '最大直径',
      application: '应用',
    },
  },
} as const

export type TranslationKey = keyof typeof translations.en

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.en
}
