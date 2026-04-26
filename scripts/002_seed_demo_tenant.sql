-- Seed a demo tenant for testing
-- Password is 'admin123' (bcrypt hash)
INSERT INTO tenants (id, email, password_hash, domain, site_name)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@gymetall.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ew4O/CoGIxH3Vy',
  'gymetall.com',
  'GY Metal Tech'
)
ON CONFLICT (email) DO NOTHING;

-- Insert default settings for the demo tenant
INSERT INTO settings (
  tenant_id,
  site_title,
  site_title_en,
  site_description,
  site_description_en,
  contact_email,
  contact_phone,
  contact_address,
  contact_address_en,
  seo_keywords,
  seo_keywords_en,
  social_wechat,
  social_linkedin,
  social_twitter,
  social_facebook
)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'GY Metal - 精密金属加工',
  'GY Metal - Precision Metal Processing',
  '专业的精密金属加工服务商，提供高品质的CNC加工、铸造和锻造服务',
  'Professional precision metal processing service provider, offering high-quality CNC machining, casting and forging services',
  'contact@gymetall.com',
  '+86 123 4567 8901',
  '中国上海市浦东新区张江高科技园区',
  'Zhangjiang Hi-Tech Park, Pudong New Area, Shanghai, China',
  '金属加工, CNC加工, 精密零件, 铸造, 锻造',
  'metal processing, CNC machining, precision parts, casting, forging',
  'gymetall_wechat',
  'linkedin.com/company/gymetall',
  'twitter.com/gymetall',
  'facebook.com/gymetall'
)
ON CONFLICT (tenant_id) DO NOTHING;

-- Insert default home page
INSERT INTO pages (tenant_id, page_key, content)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'home',
  '{
    "hero_title": "专业精密金属加工",
    "hero_title_en": "Professional Precision Metal Processing",
    "hero_subtitle": "为全球客户提供高品质的金属加工解决方案",
    "hero_subtitle_en": "Providing high-quality metal processing solutions for global customers",
    "hero_cta": "了解更多",
    "hero_cta_en": "Learn More",
    "hero_image": "",
    "about_title": "关于我们",
    "about_title_en": "About Us",
    "about_text": "我们是一家专业的精密金属加工企业，拥有先进的设备和专业的技术团队。多年来，我们致力于为客户提供最优质的金属加工服务。",
    "about_text_en": "We are a professional precision metal processing company with advanced equipment and professional technical team. Over the years, we have been committed to providing customers with the best metal processing services.",
    "services_title": "我们的服务",
    "services_title_en": "Our Services",
    "services_text": "提供CNC车削、铣削、铸造、锻造等全方位金属加工服务。",
    "services_text_en": "Providing comprehensive metal processing services including CNC turning, milling, casting, and forging.",
    "cta_title": "立即联系我们",
    "cta_title_en": "Contact Us Now",
    "cta_text": "获取免费报价，开始您的项目",
    "cta_text_en": "Get a free quote and start your project"
  }'::jsonb
)
ON CONFLICT (tenant_id, page_key) DO NOTHING;

-- Insert about page
INSERT INTO pages (tenant_id, page_key, content)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'about',
  '{
    "title": "关于我们",
    "title_en": "About Us",
    "subtitle": "专业的金属加工专家",
    "subtitle_en": "Professional Metal Processing Experts",
    "content": "GY Metal成立于2010年，是一家专业从事精密金属加工的高新技术企业。我们拥有先进的CNC加工中心、铸造车间和质量检测实验室，能够满足客户对精密零部件的各种需求。",
    "content_en": "GY Metal was established in 2010 as a high-tech enterprise specializing in precision metal processing. We have advanced CNC machining centers, casting workshops and quality testing laboratories to meet various customer needs for precision components.",
    "history_title": "发展历程",
    "history_title_en": "Our History",
    "history": [
      {"year": "2010", "event": "公司成立", "event_en": "Company Founded"},
      {"year": "2015", "event": "扩建新厂房", "event_en": "New Factory Expansion"},
      {"year": "2018", "event": "通过ISO9001认证", "event_en": "ISO9001 Certification"},
      {"year": "2020", "event": "开拓国际市场", "event_en": "International Market Expansion"}
    ]
  }'::jsonb
)
ON CONFLICT (tenant_id, page_key) DO NOTHING;

-- Insert contact page
INSERT INTO pages (tenant_id, page_key, content)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'contact',
  '{
    "title": "联系我们",
    "title_en": "Contact Us",
    "subtitle": "随时与我们取得联系",
    "subtitle_en": "Get in touch with us anytime",
    "form_title": "发送询盘",
    "form_title_en": "Send Inquiry",
    "map_address": "上海市浦东新区张江高科技园区",
    "map_address_en": "Zhangjiang Hi-Tech Park, Pudong New Area, Shanghai"
  }'::jsonb
)
ON CONFLICT (tenant_id, page_key) DO NOTHING;

-- Insert sample products
INSERT INTO products (tenant_id, name, name_en, description, description_en, category, is_active, sort_order)
VALUES 
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'CNC精密零件',
    'CNC Precision Parts',
    '采用高精度CNC加工中心生产的精密零部件，精度可达±0.01mm',
    'Precision components produced by high-precision CNC machining center, accuracy up to ±0.01mm',
    'CNC加工',
    true,
    1
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '铝合金铸件',
    'Aluminum Alloy Castings',
    '高质量铝合金铸造产品，适用于航空航天和汽车行业',
    'High-quality aluminum alloy casting products for aerospace and automotive industries',
    '铸造',
    true,
    2
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '不锈钢锻件',
    'Stainless Steel Forgings',
    '耐腐蚀不锈钢锻造零件，强度高，使用寿命长',
    'Corrosion-resistant stainless steel forged parts with high strength and long service life',
    '锻造',
    true,
    3
  )
ON CONFLICT DO NOTHING;

-- Insert sample articles
INSERT INTO articles (tenant_id, slug, title, title_en, excerpt, excerpt_en, content, content_en, seo_title, seo_description, seo_keywords, is_published, published_at)
VALUES 
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'cnc-machining-guide',
    'CNC加工完全指南',
    'Complete Guide to CNC Machining',
    '深入了解CNC数控加工技术，从基础概念到高级应用',
    'Dive deep into CNC machining technology, from basic concepts to advanced applications',
    '## CNC加工简介\n\nCNC（计算机数字控制）加工是一种利用计算机控制机床进行精密加工的制造技术。本文将为您详细介绍CNC加工的各个方面。\n\n## 主要优势\n\n1. 高精度\n2. 可重复性好\n3. 生产效率高\n4. 复杂形状加工能力\n\n## 应用领域\n\nCNC加工广泛应用于航空航天、汽车制造、医疗器械等行业。',
    '## Introduction to CNC Machining\n\nCNC (Computer Numerical Control) machining is a manufacturing technology that uses computer-controlled machine tools for precision machining. This article will introduce you to all aspects of CNC machining.\n\n## Main Advantages\n\n1. High Precision\n2. Good Repeatability\n3. High Production Efficiency\n4. Complex Shape Processing Capability\n\n## Application Areas\n\nCNC machining is widely used in aerospace, automotive manufacturing, medical devices and other industries.',
    'CNC加工完全指南 - GY Metal',
    '深入了解CNC数控加工技术的完整指南',
    'CNC加工,数控机床,精密加工',
    true,
    NOW()
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'metal-casting-process',
    '金属铸造工艺解析',
    'Metal Casting Process Explained',
    '了解金属铸造的基本流程和常见工艺',
    'Learn about the basic process and common techniques of metal casting',
    '## 铸造工艺概述\n\n金属铸造是将熔融金属倒入模具中，冷却凝固后获得所需形状零件的工艺方法。\n\n## 主要铸造方法\n\n1. 砂型铸造\n2. 压力铸造\n3. 熔模铸造\n4. 离心铸造\n\n## 质量控制\n\n我们采用先进的检测设备，确保每一件铸件都符合质量标准。',
    '## Casting Process Overview\n\nMetal casting is a process method of pouring molten metal into a mold and obtaining the desired shape after cooling and solidification.\n\n## Main Casting Methods\n\n1. Sand Casting\n2. Die Casting\n3. Investment Casting\n4. Centrifugal Casting\n\n## Quality Control\n\nWe use advanced testing equipment to ensure that every casting meets quality standards.',
    '金属铸造工艺解析 - GY Metal',
    '了解金属铸造的基本流程和常见工艺方法',
    '金属铸造,压铸,熔模铸造',
    true,
    NOW()
  )
ON CONFLICT DO NOTHING;
